create or replace function public.current_quote_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select c.id
    from public.quote_customers as c
    where lower(trim(coalesce(c.email, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
      and c.is_active = true
      and coalesce(c.is_deleted, false) = false
    limit 1;
$$;

grant execute on function public.current_quote_customer_id() to authenticated;

create or replace function public.customer_pipeline_next_stage(stage_key text)
returns text
language sql
immutable
as $$
    select case coalesce(stage_key, '')
        when 'quote_confirmed' then 'contract_signed'
        when 'contract_signed' then 'deposit_paid'
        when 'factory_accepted' then 'balance_confirmed'
        else coalesce(stage_key, '')
    end;
$$;

grant execute on function public.customer_pipeline_next_stage(text) to authenticated;

create or replace function public.get_customer_pipeline_overview()
returns table (
    deal_id uuid,
    deal_title text,
    current_stage text,
    deal_status text,
    summary text,
    next_action text,
    next_action_due_at timestamptz,
    updated_at timestamptz,
    stage_records jsonb
)
language sql
security definer
set search_path = public
as $$
    with me as (
        select public.current_quote_customer_id() as customer_id
    )
    select
        d.id as deal_id,
        coalesce(d.title, '') as deal_title,
        coalesce(d.current_stage, 'requirement_capture') as current_stage,
        coalesce(d.deal_status, 'active') as deal_status,
        coalesce(d.summary, '') as summary,
        coalesce(d.next_action, '') as next_action,
        d.next_action_due_at,
        d.updated_at,
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
                        'production_delay_reason', sr.meta ->> 'production_delay_reason'
                    ))
                )
                order by sr.created_at asc
            )
            from public.quote_deal_stage_records as sr
            where sr.deal_id = d.id
        ), '[]'::jsonb) as stage_records
    from public.quote_deals as d
    join me on me.customer_id = d.customer_id
    where coalesce(d.is_archived, false) = false
    order by d.updated_at desc;
$$;

grant execute on function public.get_customer_pipeline_overview() to authenticated;

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
    activities jsonb
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
    with deal_row as (
        select d.*
        from public.quote_deals as d
        where d.id = target_deal_id
          and d.customer_id = me_customer_id
        limit 1
    ), requirement_row as (
        select r.*
        from public.quote_requirements as r
        join deal_row d on d.id = r.deal_id
        order by (r.id = d.primary_requirement_id) desc, r.updated_at desc
        limit 1
    ), quote_row as (
        select q.*
        from public.quote_instances as q
        join deal_row d on d.id = q.deal_id
        order by (q.id = d.primary_instance_id) desc, q.updated_at desc
        limit 1
    )
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
            from requirement_row r
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
            from quote_row q
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
        ), '[]'::jsonb) as activities
    from deal_row d
    join public.quote_customers c on c.id = d.customer_id;

    if not found then
        raise exception 'Deal not found for current customer account.';
    end if;
end;
$$;

grant execute on function public.get_customer_pipeline_detail(uuid) to authenticated;

create or replace function public.submit_customer_requirement(target_deal_id uuid, payload jsonb default '{}'::jsonb)
returns table (
    deal_id uuid,
    stage_key text,
    next_stage text,
    submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    me_customer_id uuid;
    deal_row public.quote_deals%rowtype;
    requirement_row public.quote_requirements%rowtype;
    submitted_at_utc timestamptz := timezone('utc', now());
    merged_answers jsonb := '{}'::jsonb;
    next_company text := '';
    next_name text := '';
    next_email text := '';
    next_phone text := '';
    next_country text := '';
    next_stage_key text := 'requirement_confirmed';
begin
    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    select *
    into deal_row
    from public.quote_deals
    where id = target_deal_id
      and customer_id = me_customer_id
    limit 1;

    if not found then
        raise exception 'Deal not found for current customer account.';
    end if;

    if coalesce(deal_row.current_stage, '') not in ('customer_profile', 'requirement_capture', 'requirement_confirmed') then
        raise exception 'Current deal stage does not accept requirement submission.';
    end if;

    select r.*
    into requirement_row
    from public.quote_requirements r
    where r.deal_id = deal_row.id
    order by (r.id = deal_row.primary_requirement_id) desc, r.updated_at desc
    limit 1;

    if not found then
        raise exception 'No requirement draft found for this deal.';
    end if;

    merged_answers := coalesce(requirement_row.answers, '{}'::jsonb) || coalesce(payload -> 'answers', '{}'::jsonb);
    merged_answers := public.append_quote_requirement_customer_activity(
        merged_answers,
        'submitted_from_account',
        'Submitted requirement from account center',
        'customer'
    );

    next_company := coalesce(nullif(trim(payload ->> 'requester_company'), ''), nullif(requirement_row.requester_company, ''), '');
    next_name := coalesce(nullif(trim(payload ->> 'requester_name'), ''), nullif(requirement_row.requester_name, ''), '');
    next_email := coalesce(nullif(trim(payload ->> 'requester_email'), ''), nullif(requirement_row.requester_email, ''), '');
    next_phone := coalesce(nullif(trim(payload ->> 'requester_phone'), ''), nullif(requirement_row.requester_phone, ''), '');
    next_country := coalesce(nullif(trim(payload ->> 'country'), ''), nullif(requirement_row.country, ''), '');

    update public.quote_requirements
    set status = 'submitted',
        title = coalesce(nullif(trim(payload ->> 'title'), ''), nullif(requirement_row.title, ''), concat('Requirement ', substr(requirement_row.id::text, 1, 8))),
        requirement_type = coalesce(nullif(trim(payload ->> 'requirement_type'), ''), nullif(requirement_row.requirement_type, ''), requirement_type),
        country = next_country,
        answers = merged_answers,
        requester_company = next_company,
        requester_name = next_name,
        requester_email = next_email,
        requester_phone = next_phone,
        submitted_at = coalesce(requirement_row.submitted_at, submitted_at_utc),
        updated_by = null,
        updated_at = submitted_at_utc
    where id = requirement_row.id
    returning * into requirement_row;

    update public.quote_customers
    set company_name = case when next_company <> '' then next_company else company_name end,
        contact_name = case when next_name <> '' then next_name else contact_name end,
        email = case when next_email <> '' then next_email else email end,
        phone = case when next_phone <> '' then next_phone else phone end,
        country = case when next_country <> '' then next_country else country end,
        updated_by = null,
        updated_at = submitted_at_utc
    where id = deal_row.customer_id;

    update public.quote_deal_stage_records as sr
    set stage_status = 'completed',
        completed_at = coalesce(completed_at, submitted_at_utc),
        updated_at = submitted_at_utc
    where sr.deal_id = deal_row.id
      and sr.stage_key = 'requirement_capture';

    update public.quote_deal_stage_records as sr
    set stage_status = case when stage_status = 'completed' then stage_status else 'active' end,
        updated_at = submitted_at_utc
    where sr.deal_id = deal_row.id
      and sr.stage_key = next_stage_key;

    update public.quote_deals
    set current_stage = next_stage_key,
        updated_at = submitted_at_utc
    where id = deal_row.id
      and coalesce(current_stage, '') in ('customer_profile', 'requirement_capture', 'requirement_confirmed');

    insert into public.quote_customer_activities (
        customer_id,
        deal_id,
        requirement_id,
        stage_key,
        actor_type,
        actor_id,
        actor_label,
        activity_type,
        entity_type,
        entity_id,
        page_key,
        action_label,
        detail_json,
        occurred_at
    ) values (
        deal_row.customer_id,
        deal_row.id,
        requirement_row.id,
        'requirement_capture',
        'customer',
        auth.jwt() ->> 'sub',
        coalesce(auth.jwt() ->> 'email', 'customer'),
        'stage_advanced',
        'requirement',
        requirement_row.id::text,
        'account-sales-pipeline',
        '客户在用户中心提交需求',
        jsonb_build_object(
            'summary', 'Requirement submitted from account center',
            'next_stage', next_stage_key
        ),
        submitted_at_utc
    );

    return query
    select deal_row.id, 'requirement_capture'::text, next_stage_key::text, submitted_at_utc;
end;
$$;

grant execute on function public.submit_customer_requirement(uuid, jsonb) to authenticated;

create or replace function public.submit_customer_stage_confirmation(target_deal_id uuid, target_stage_key text, payload jsonb default '{}'::jsonb)
returns table (
    deal_id uuid,
    stage_key text,
    next_stage text,
    submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    me_customer_id uuid;
    deal_row public.quote_deals%rowtype;
    stage_row public.quote_deal_stage_records%rowtype;
    submitted_at_utc timestamptz := timezone('utc', now());
    normalized_stage text := lower(trim(coalesce(target_stage_key, '')));
    next_stage_key text;
begin
    if normalized_stage not in ('quote_confirmed', 'contract_signed', 'factory_accepted') then
        raise exception 'This stage does not allow customer confirmation submission.';
    end if;

    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    select *
    into deal_row
    from public.quote_deals
    where id = target_deal_id
      and customer_id = me_customer_id
    limit 1;

    if not found then
        raise exception 'Deal not found for current customer account.';
    end if;

    if coalesce(deal_row.current_stage, '') <> normalized_stage then
        raise exception 'Deal is not currently at the requested stage.';
    end if;

    select *
    into stage_row
    from public.quote_deal_stage_records as sr
    where sr.deal_id = deal_row.id
      and sr.stage_key = normalized_stage
    limit 1;

    if not found then
        raise exception 'Stage record not found for current deal.';
    end if;

    next_stage_key := public.customer_pipeline_next_stage(normalized_stage);

    update public.quote_deal_stage_records
    set stage_status = 'completed',
        completed_at = coalesce(completed_at, submitted_at_utc),
        meta = coalesce(stage_row.meta, '{}'::jsonb) || jsonb_build_object(
            'public_confirmed_at', submitted_at_utc,
            'public_confirmation_note', coalesce(payload ->> 'note', ''),
            'public_confirmation_payload', coalesce(payload, '{}'::jsonb),
            'confirmed_from', 'account_center'
        ),
        updated_at = submitted_at_utc
    where id = stage_row.id;

    update public.quote_deals
    set current_stage = next_stage_key,
        updated_at = submitted_at_utc
    where id = deal_row.id
      and current_stage = normalized_stage;

    update public.quote_deal_stage_records as sr
    set stage_status = case when stage_status = 'completed' then stage_status else 'active' end,
        updated_at = submitted_at_utc
    where sr.deal_id = deal_row.id
      and sr.stage_key = next_stage_key;

    if normalized_stage = 'quote_confirmed' then
        update public.quote_deal_stage_records as sr
        set meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object(
            'quote_terms',
            coalesce((stage_row.meta ->> 'quote_terms'), '')
        ),
            updated_at = submitted_at_utc
        where sr.deal_id = deal_row.id
          and sr.stage_key = 'contract_signed';
    end if;

    insert into public.quote_customer_activities (
        customer_id,
        deal_id,
        stage_key,
        actor_type,
        actor_id,
        actor_label,
        activity_type,
        entity_type,
        entity_id,
        page_key,
        action_label,
        detail_json,
        occurred_at
    ) values (
        deal_row.customer_id,
        deal_row.id,
        normalized_stage,
        'customer',
        auth.jwt() ->> 'sub',
        coalesce(auth.jwt() ->> 'email', 'customer'),
        'stage_advanced',
        'deal_stage',
        stage_row.id::text,
        'account-sales-pipeline',
        '客户在用户中心提交节点确认',
        jsonb_build_object(
            'summary', concat('Stage confirmed: ', normalized_stage),
            'next_stage', next_stage_key,
            'note', coalesce(payload ->> 'note', '')
        ),
        submitted_at_utc
    );

    return query
    select deal_row.id, normalized_stage, next_stage_key, submitted_at_utc;
end;
$$;

grant execute on function public.submit_customer_stage_confirmation(uuid, text, jsonb) to authenticated;

create or replace function public.resolve_customer_pipeline_entry(entry_kind text, slug text, token text default '')
returns table (
    deal_id uuid,
    stage_key text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    me_customer_id uuid;
    normalized_kind text := lower(trim(coalesce(entry_kind, '')));
begin
    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    if normalized_kind = 'requirement' then
        return query
        select r.deal_id, 'requirement_capture'::text
        from public.quote_requirements r
        join public.quote_deals d on d.id = r.deal_id
        where d.customer_id = me_customer_id
          and r.public_slug = slug
          and r.public_token = token
        limit 1;
        return;
    end if;

    if normalized_kind = 'stage' then
        return query
        select sr.deal_id, sr.stage_key
        from public.quote_deal_stage_records sr
        join public.quote_deals d on d.id = sr.deal_id
        where d.customer_id = me_customer_id
          and sr.public_slug = slug
          and sr.public_token = token
        limit 1;
        return;
    end if;

    if normalized_kind = 'quote' then
        return query
        select d.id, coalesce(d.current_stage, 'quote_confirmed')
        from public.quote_instances q
        join public.quote_deals d on d.id = q.deal_id
        where d.customer_id = me_customer_id
          and q.public_slug = slug
        order by q.updated_at desc
        limit 1;
        return;
    end if;

    raise exception 'Unsupported entry kind: %', normalized_kind;
end;
$$;

grant execute on function public.resolve_customer_pipeline_entry(text, text, text) to authenticated;
