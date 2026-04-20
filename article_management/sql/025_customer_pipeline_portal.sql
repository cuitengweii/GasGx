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
        ), '[]'::jsonb) as activities
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

create or replace function public.get_customer_requirement_link(target_deal_id uuid)
returns table (
    requirement_id uuid,
    public_slug text,
    public_token text
)
language sql
security definer
set search_path = public
as $$
    with me as (
        select public.current_quote_customer_id() as customer_id
    ), deal_row as (
        select
            d.id,
            d.customer_id,
            d.primary_requirement_id
        from public.quote_deals as d
        join me on me.customer_id = d.customer_id
        where d.id = target_deal_id
        limit 1
    )
    select
        r.id as requirement_id,
        coalesce(r.public_slug, '') as public_slug,
        coalesce(r.public_token, '') as public_token
    from deal_row as d
    join public.quote_requirements as r
        on r.id = d.primary_requirement_id
        or r.deal_id = d.id
        or (r.customer_id = d.customer_id and text(r.public_slug) <> '' and text(r.public_token) <> '')
    order by
        (r.id = d.primary_requirement_id) desc,
        (r.deal_id = d.id) desc,
        r.updated_at desc
    limit 1;
$$;

grant execute on function public.get_customer_requirement_link(uuid) to authenticated;

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
    deal_id_value uuid;
    deal_customer_id uuid;
    deal_primary_requirement_id uuid;
    deal_current_stage text;
    requirement_id_value uuid;
    requirement_title_value text;
    requirement_type_value text;
    requirement_country_value text;
    requirement_answers_value jsonb;
    requirement_company_value text;
    requirement_name_value text;
    requirement_email_value text;
    requirement_phone_value text;
    requirement_submitted_at_value timestamptz;
    submitted_at_utc timestamptz := timezone('utc', now());
    merged_answers jsonb := '{}'::jsonb;
    next_company text := '';
    next_name text := '';
    next_email text := '';
    next_phone text := '';
    next_country text := '';
    next_stage_key text := 'requirement_confirmed';
    actor_sub text := auth.jwt() ->> 'sub';
    actor_email text := coalesce(auth.jwt() ->> 'email', 'customer');
begin
    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    execute $sql$
        select
            d.id,
            d.customer_id,
            d.primary_requirement_id,
            d.current_stage
        from public.quote_deals as d
        where d.id = $1
          and d.customer_id = $2
        limit 1
    $sql$
    into
        deal_id_value,
        deal_customer_id,
        deal_primary_requirement_id,
        deal_current_stage
    using target_deal_id, me_customer_id;

    if deal_id_value is null then
        raise exception 'Deal not found for current customer account.';
    end if;

    if coalesce(deal_current_stage, '') not in ('customer_profile', 'requirement_capture', 'requirement_confirmed') then
        raise exception 'Current deal stage does not accept requirement submission.';
    end if;

    execute $sql$
        select
            r.id,
            r.title,
            r.requirement_type,
            r.country,
            coalesce(r.answers, '{}'::jsonb),
            r.requester_company,
            r.requester_name,
            r.requester_email,
            r.requester_phone,
            r.submitted_at
        from public.quote_requirements as r
        where r.deal_id = $1
        order by (r.id = $2) desc, r.updated_at desc
        limit 1
    $sql$
    into
        requirement_id_value,
        requirement_title_value,
        requirement_type_value,
        requirement_country_value,
        requirement_answers_value,
        requirement_company_value,
        requirement_name_value,
        requirement_email_value,
        requirement_phone_value,
        requirement_submitted_at_value
    using target_deal_id, deal_primary_requirement_id;

    if requirement_id_value is null then
        raise exception 'No requirement draft found for this deal.';
    end if;

    merged_answers := requirement_answers_value || coalesce(payload -> 'answers', '{}'::jsonb);
    merged_answers := public.append_quote_requirement_customer_activity(
        merged_answers,
        'submitted_from_account',
        'Submitted requirement from account center',
        'customer'
    );

    next_company := coalesce(nullif(trim(payload ->> 'requester_company'), ''), nullif(requirement_company_value, ''), '');
    next_name := coalesce(nullif(trim(payload ->> 'requester_name'), ''), nullif(requirement_name_value, ''), '');
    next_email := coalesce(nullif(trim(payload ->> 'requester_email'), ''), nullif(requirement_email_value, ''), '');
    next_phone := coalesce(nullif(trim(payload ->> 'requester_phone'), ''), nullif(requirement_phone_value, ''), '');
    next_country := coalesce(nullif(trim(payload ->> 'country'), ''), nullif(requirement_country_value, ''), '');

    execute $sql$
        update public.quote_requirements
        set status = 'submitted',
            title = coalesce(nullif(trim($1), ''), nullif($2, ''), concat('Requirement ', substr($3::text, 1, 8))),
            requirement_type = coalesce(nullif(trim($4), ''), nullif($5, ''), requirement_type),
            country = $6,
            answers = $7,
            requester_company = $8,
            requester_name = $9,
            requester_email = $10,
            requester_phone = $11,
            submitted_at = coalesce($12, $13),
            updated_by = null,
            updated_at = $13
        where id = $3
    $sql$
    using
        payload ->> 'title',
        requirement_title_value,
        requirement_id_value,
        payload ->> 'requirement_type',
        requirement_type_value,
        next_country,
        merged_answers,
        next_company,
        next_name,
        next_email,
        next_phone,
        requirement_submitted_at_value,
        submitted_at_utc;

    execute $sql$
        update public.quote_customers
        set company_name = case when $1 <> '' then $1 else company_name end,
            contact_name = case when $2 <> '' then $2 else contact_name end,
            email = case when $3 <> '' then $3 else email end,
            phone = case when $4 <> '' then $4 else phone end,
            country = case when $5 <> '' then $5 else country end,
            updated_by = null,
            updated_at = $6
        where id = $7
    $sql$
    using next_company, next_name, next_email, next_phone, next_country, submitted_at_utc, deal_customer_id;

    execute $sql$
        update public.quote_deal_stage_records as sr
        set stage_status = 'completed',
            completed_at = coalesce(completed_at, $1),
            updated_at = $1
        where sr.deal_id = $2
          and sr.stage_key = 'requirement_capture'
    $sql$
    using submitted_at_utc, target_deal_id;

    execute $sql$
        update public.quote_deal_stage_records as sr
        set stage_status = case when stage_status = 'completed' then stage_status else 'active' end,
            updated_at = $1
        where sr.deal_id = $2
          and sr.stage_key = $3
    $sql$
    using submitted_at_utc, target_deal_id, next_stage_key;

    execute $sql$
        update public.quote_deals
        set current_stage = $1,
            updated_at = $2
        where id = $3
          and coalesce(current_stage, '') in ('customer_profile', 'requirement_capture', 'requirement_confirmed')
    $sql$
    using next_stage_key, submitted_at_utc, target_deal_id;

    execute $sql$
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
            $1,
            $2,
            $3,
            'requirement_capture',
            'customer',
            $4,
            $5,
            'stage_advanced',
            'requirement',
            $6,
            'account-sales-pipeline',
            '客户在用户中心提交需求',
            jsonb_build_object(
                'summary', 'Requirement submitted from account center',
                'next_stage', $7
            ),
            $8
        )
    $sql$
    using
        deal_customer_id,
        target_deal_id,
        requirement_id_value,
        actor_sub,
        actor_email,
        requirement_id_value::text,
        next_stage_key,
        submitted_at_utc;

    deal_id := deal_id_value;
    stage_key := 'requirement_capture'::text;
    next_stage := next_stage_key::text;
    submitted_at := submitted_at_utc;
    return next;
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
    deal_id_value uuid;
    deal_customer_id uuid;
    deal_current_stage text;
    stage_record_id uuid;
    stage_meta_value jsonb;
    submitted_at_utc timestamptz := timezone('utc', now());
    normalized_stage text := lower(trim(coalesce(target_stage_key, '')));
    next_stage_key text;
    actor_sub text := auth.jwt() ->> 'sub';
    actor_email text := coalesce(auth.jwt() ->> 'email', 'customer');
begin
    if normalized_stage not in ('quote_confirmed', 'contract_signed', 'factory_accepted') then
        raise exception 'This stage does not allow customer confirmation submission.';
    end if;

    me_customer_id := public.current_quote_customer_id();
    if me_customer_id is null then
        raise exception 'No matched customer profile for current login email.';
    end if;

    execute $sql$
        select
            d.id,
            d.customer_id,
            d.current_stage
        from public.quote_deals as d
        where d.id = $1
          and d.customer_id = $2
        limit 1
    $sql$
    into
        deal_id_value,
        deal_customer_id,
        deal_current_stage
    using target_deal_id, me_customer_id;

    if deal_id_value is null then
        raise exception 'Deal not found for current customer account.';
    end if;

    if coalesce(deal_current_stage, '') <> normalized_stage then
        raise exception 'Deal is not currently at the requested stage.';
    end if;

    execute $sql$
        select
            sr.id,
            coalesce(sr.meta, '{}'::jsonb)
        from public.quote_deal_stage_records as sr
        where sr.deal_id = $1
          and sr.stage_key = $2
        limit 1
    $sql$
    into
        stage_record_id,
        stage_meta_value
    using target_deal_id, normalized_stage;

    if stage_record_id is null then
        raise exception 'Stage record not found for current deal.';
    end if;

    next_stage_key := public.customer_pipeline_next_stage(normalized_stage);

    execute $sql$
        update public.quote_deal_stage_records
        set stage_status = 'completed',
            completed_at = coalesce(completed_at, $1),
            meta = $2 || jsonb_build_object(
                'public_confirmed_at', $1,
                'public_confirmation_note', $3,
                'public_confirmation_payload', $4,
                'confirmed_from', 'account_center'
            ),
            updated_at = $1
        where id = $5
    $sql$
    using submitted_at_utc, stage_meta_value, coalesce(payload ->> 'note', ''), coalesce(payload, '{}'::jsonb), stage_record_id;

    execute $sql$
        update public.quote_deals
        set current_stage = $1,
            updated_at = $2
        where id = $3
          and current_stage = $4
    $sql$
    using next_stage_key, submitted_at_utc, target_deal_id, normalized_stage;

    execute $sql$
        update public.quote_deal_stage_records as sr
        set stage_status = case when stage_status = 'completed' then stage_status else 'active' end,
            updated_at = $1
        where sr.deal_id = $2
          and sr.stage_key = $3
    $sql$
    using submitted_at_utc, target_deal_id, next_stage_key;

    if normalized_stage = 'quote_confirmed' then
        execute $sql$
            update public.quote_deal_stage_records as sr
            set meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object(
                'quote_terms',
                $1
            ),
                updated_at = $2
            where sr.deal_id = $3
              and sr.stage_key = 'contract_signed'
        $sql$
        using coalesce(stage_meta_value ->> 'quote_terms', ''), submitted_at_utc, target_deal_id;
    end if;

    execute $sql$
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
            $1,
            $2,
            $3,
            'customer',
            $4,
            $5,
            'stage_advanced',
            'deal_stage',
            $6,
            'account-sales-pipeline',
            '客户在用户中心提交节点确认',
            jsonb_build_object(
                'summary', concat('Stage confirmed: ', $3),
                'next_stage', $7,
                'note', $8
            ),
            $9
        )
    $sql$
    using
        deal_customer_id,
        target_deal_id,
        normalized_stage,
        actor_sub,
        actor_email,
        stage_record_id::text,
        next_stage_key,
        coalesce(payload ->> 'note', ''),
        submitted_at_utc;

    deal_id := deal_id_value;
    stage_key := normalized_stage;
    next_stage := next_stage_key;
    submitted_at := submitted_at_utc;
    return next;
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
