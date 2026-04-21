create table if not exists public.quote_stage_communications (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.quote_customers(id) on delete cascade,
    deal_id uuid not null references public.quote_deals(id) on delete cascade,
    stage_key text not null,
    requirement_id uuid null references public.quote_requirements(id) on delete set null,
    instance_id uuid null references public.quote_instances(id) on delete set null,
    reply_to_id uuid null references public.quote_stage_communications(id) on delete set null,
    actor_type text not null check (actor_type in ('customer', 'sales', 'system')),
    actor_id text null,
    actor_label text not null default '',
    body text not null default '',
    visibility text not null default 'public' check (visibility in ('public')),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists quote_stage_communications_deal_idx
on public.quote_stage_communications (deal_id, created_at desc);

create index if not exists quote_stage_communications_stage_idx
on public.quote_stage_communications (deal_id, stage_key, created_at asc);

create index if not exists quote_stage_communications_reply_idx
on public.quote_stage_communications (reply_to_id, created_at asc);

alter table public.quote_stage_communications enable row level security;

drop policy if exists "quote_stage_communications_admin_read" on public.quote_stage_communications;
create policy "quote_stage_communications_admin_read"
on public.quote_stage_communications
for select
to authenticated
using (public.is_quote_console_user());

drop policy if exists "quote_stage_communications_admin_write" on public.quote_stage_communications;
create policy "quote_stage_communications_admin_write"
on public.quote_stage_communications
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_stage_communications_customer_read" on public.quote_stage_communications;
create policy "quote_stage_communications_customer_read"
on public.quote_stage_communications
for select
to authenticated
using (
    visibility = 'public'
    and customer_id = public.current_quote_customer_id()
);

drop policy if exists "quote_stage_communications_customer_insert" on public.quote_stage_communications;
create policy "quote_stage_communications_customer_insert"
on public.quote_stage_communications
for insert
to authenticated
with check (
    visibility = 'public'
    and actor_type = 'customer'
    and customer_id = public.current_quote_customer_id()
);

create or replace function public.add_customer_pipeline_comment(
    target_deal_id uuid,
    target_stage_key text,
    comment_body text,
    target_reply_to_id uuid default null
)
returns table (
    id uuid,
    deal_id uuid,
    stage_key text,
    reply_to_id uuid,
    actor_type text,
    actor_label text,
    body text,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    me_customer_id uuid;
    normalized_stage text := lower(trim(coalesce(target_stage_key, '')));
    trimmed_body text := trim(coalesce(comment_body, ''));
    actor_sub text := auth.jwt() ->> 'sub';
    actor_email text := coalesce(auth.jwt() ->> 'email', 'customer');
    requirement_id_value uuid;
    instance_id_value uuid;
begin
    if trimmed_body = '' then
        raise exception 'Comment body is required.';
    end if;

    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    if normalized_stage = '' then
        raise exception 'Stage key is required.';
    end if;

    if not exists (
        select 1
        from public.quote_deals d
        where d.id = target_deal_id
          and d.customer_id = me_customer_id
        limit 1
    ) then
        raise exception 'Deal not found for current customer account.';
    end if;

    if target_reply_to_id is not null and not exists (
        select 1
        from public.quote_stage_communications c
        where c.id = target_reply_to_id
          and c.deal_id = target_deal_id
          and c.customer_id = me_customer_id
        limit 1
    ) then
        raise exception 'Reply target not found for current deal.';
    end if;

    select r.id
    into requirement_id_value
    from public.quote_requirements r
    where r.deal_id = target_deal_id
    order by r.updated_at desc
    limit 1;

    select q.id
    into instance_id_value
    from public.quote_instances q
    where q.deal_id = target_deal_id
    order by q.updated_at desc
    limit 1;

    return query
    insert into public.quote_stage_communications (
        customer_id,
        deal_id,
        stage_key,
        requirement_id,
        instance_id,
        reply_to_id,
        actor_type,
        actor_id,
        actor_label,
        body,
        visibility
    )
    values (
        me_customer_id,
        target_deal_id,
        normalized_stage,
        requirement_id_value,
        instance_id_value,
        target_reply_to_id,
        'customer',
        nullif(actor_sub, ''),
        actor_email,
        trimmed_body,
        'public'
    )
    returning
        quote_stage_communications.id,
        quote_stage_communications.deal_id,
        quote_stage_communications.stage_key,
        quote_stage_communications.reply_to_id,
        quote_stage_communications.actor_type,
        quote_stage_communications.actor_label,
        quote_stage_communications.body,
        quote_stage_communications.created_at;
end;
$$;

grant execute on function public.add_customer_pipeline_comment(uuid, text, text, uuid) to authenticated;

drop function if exists public.get_customer_pipeline_detail(uuid);

create or replace function public.get_customer_pipeline_detail(target_deal_id uuid)
returns table (
    deal_id uuid,
    customer_id uuid,
    customer_company text,
    customer_email text,
    deal_title text,
    current_stage text,
    deal_status text,
    summary text,
    requirement jsonb,
    quote jsonb,
    stage_records jsonb,
    activities jsonb,
    communications jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
    me_customer_id uuid;
begin
    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    return query
    select
        d.id as deal_id,
        d.customer_id,
        coalesce(c.company_name, '') as customer_company,
        coalesce(c.email, '') as customer_email,
        coalesce(d.title, '') as deal_title,
        coalesce(d.current_stage, 'requirement_capture') as current_stage,
        coalesce(d.deal_status, 'active') as deal_status,
        coalesce(d.summary, '') as summary,
        coalesce((
            select jsonb_build_object(
                'id', r.id,
                'status', r.status,
                'title', r.title,
                'public_slug', r.public_slug,
                'public_token', r.public_token,
                'requirement_type', r.requirement_type,
                'country', r.country,
                'requester_company', r.requester_company,
                'requester_name', r.requester_name,
                'requester_email', r.requester_email,
                'requester_phone', r.requester_phone,
                'answers', coalesce(r.answers, '{}'::jsonb),
                'submitted_at', r.submitted_at,
                'updated_at', r.updated_at
            )
            from public.quote_requirements as r
            where r.deal_id = d.id
            order by (r.id = d.primary_requirement_id) desc, r.updated_at desc
            limit 1
        ), '{}'::jsonb) as requirement,
        coalesce((
            select jsonb_build_object(
                'id', q.id,
                'status', q.status,
                'public_slug', q.public_slug,
                'receiver_email', q.receiver_email,
                'updated_at', q.updated_at,
                'published_at', q.published_at
            )
            from public.quote_instances as q
            where q.deal_id = d.id
            order by (q.id = d.primary_instance_id) desc, q.updated_at desc
            limit 1
        ), '{}'::jsonb) as quote,
        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'stage_key', sr.stage_key,
                    'stage_status', sr.stage_status,
                    'planned_at', sr.planned_at,
                    'completed_at', sr.completed_at,
                    'meta', jsonb_strip_nulls(jsonb_build_object(
                        'quote_terms', sr.meta ->> 'quote_terms',
                        'public_confirmed_at', sr.meta ->> 'public_confirmed_at',
                        'public_confirmation_note', sr.meta ->> 'public_confirmation_note',
                        'production_schedule_status', sr.meta ->> 'production_schedule_status',
                        'production_eta', sr.meta ->> 'production_eta',
                        'production_delay_reason', sr.meta ->> 'production_delay_reason',
                        'production_batch', sr.meta ->> 'production_batch',
                        'factory_name', sr.meta ->> 'factory_name'
                    ))
                )
                order by sr.created_at asc
            )
            from public.quote_deal_stage_records as sr
            where sr.deal_id = d.id
        ), '[]'::jsonb) as stage_records,
        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'id', a.id,
                    'actor_type', a.actor_type,
                    'actor_label', a.actor_label,
                    'activity_type', a.activity_type,
                    'stage_key', a.stage_key,
                    'action_label', a.action_label,
                    'occurred_at', a.occurred_at,
                    'summary', coalesce(a.detail_json ->> 'summary', '')
                )
                order by a.occurred_at desc
            )
            from (
                select *
                from public.quote_customer_activities as ca
                where ca.customer_id = d.customer_id
                  and ca.deal_id = d.id
                order by occurred_at desc
                limit 80
            ) as a
        ), '[]'::jsonb) as activities,
        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'id', sc.id,
                    'stage_key', sc.stage_key,
                    'reply_to_id', sc.reply_to_id,
                    'actor_type', sc.actor_type,
                    'actor_label', sc.actor_label,
                    'body', sc.body,
                    'created_at', sc.created_at,
                    'updated_at', sc.updated_at,
                    'reply_to_body', parent.body,
                    'reply_to_actor_label', parent.actor_label,
                    'reply_to_stage_key', parent.stage_key
                )
                order by sc.created_at asc
            )
            from (
                select *
                from public.quote_stage_communications
                where quote_stage_communications.customer_id = d.customer_id
                  and quote_stage_communications.deal_id = d.id
                  and quote_stage_communications.visibility = 'public'
                order by created_at asc
                limit 200
            ) as sc
            left join public.quote_stage_communications as parent
                on parent.id = sc.reply_to_id
        ), '[]'::jsonb) as communications
    from public.quote_deals as d
    join public.quote_customers c on c.id = d.customer_id
    where d.id = target_deal_id
      and d.customer_id = me_customer_id
    limit 1;

    if not found then
        raise exception 'Deal not found for current customer account.';
    end if;
end;
$$;

grant execute on function public.get_customer_pipeline_detail(uuid) to authenticated;

insert into public.quote_stage_communications (
    customer_id,
    deal_id,
    stage_key,
    requirement_id,
    actor_type,
    actor_label,
    body,
    visibility,
    created_at,
    updated_at
)
select
    r.customer_id,
    r.deal_id,
    'requirement_capture',
    r.id,
    'sales',
    coalesce(nullif(entry.value ->> 'author', ''), '销售沟通'),
    trim(coalesce(entry.value ->> 'note', '')),
    'public',
    coalesce(nullif(entry.value ->> 'created_at', '')::timestamptz, r.updated_at, r.created_at, timezone('utc', now())),
    coalesce(nullif(entry.value ->> 'created_at', '')::timestamptz, r.updated_at, r.created_at, timezone('utc', now()))
from public.quote_requirements r
cross join lateral jsonb_array_elements(coalesce(r.answers -> 'communication_notes', '[]'::jsonb)) as entry(value)
where trim(coalesce(entry.value ->> 'note', '')) <> ''
  and not exists (
      select 1
      from public.quote_stage_communications sc
      where sc.deal_id = r.deal_id
        and sc.stage_key = 'requirement_capture'
        and sc.actor_label = coalesce(nullif(entry.value ->> 'author', ''), '销售沟通')
        and sc.body = trim(coalesce(entry.value ->> 'note', ''))
        and sc.created_at = coalesce(nullif(entry.value ->> 'created_at', '')::timestamptz, r.updated_at, r.created_at, timezone('utc', now()))
  );

insert into public.quote_stage_communications (
    customer_id,
    deal_id,
    stage_key,
    requirement_id,
    instance_id,
    actor_type,
    actor_label,
    body,
    visibility,
    created_at,
    updated_at
)
select
    d.customer_id,
    sr.deal_id,
    sr.stage_key,
    d.primary_requirement_id,
    d.primary_instance_id,
    'sales',
    coalesce(nullif(entry.value ->> 'author', ''), '销售沟通'),
    trim(coalesce(entry.value ->> 'note', '')),
    'public',
    coalesce(nullif(entry.value ->> 'created_at', '')::timestamptz, sr.updated_at, sr.created_at, timezone('utc', now())),
    coalesce(nullif(entry.value ->> 'created_at', '')::timestamptz, sr.updated_at, sr.created_at, timezone('utc', now()))
from public.quote_deal_stage_records sr
join public.quote_deals d on d.id = sr.deal_id
cross join lateral jsonb_array_elements(coalesce(sr.meta -> 'communication_logs', '[]'::jsonb)) as entry(value)
where trim(coalesce(entry.value ->> 'note', '')) <> ''
  and not exists (
      select 1
      from public.quote_stage_communications sc
      where sc.deal_id = sr.deal_id
        and sc.stage_key = sr.stage_key
        and sc.actor_label = coalesce(nullif(entry.value ->> 'author', ''), '销售沟通')
        and sc.body = trim(coalesce(entry.value ->> 'note', ''))
        and sc.created_at = coalesce(nullif(entry.value ->> 'created_at', '')::timestamptz, sr.updated_at, sr.created_at, timezone('utc', now()))
  );
