create or replace function public.safe_append_quote_requirement_customer_activity(
    base_answers jsonb,
    activity_action text,
    activity_detail text default '',
    activity_actor text default 'customer'
)
returns jsonb
language plpgsql
volatile
set search_path = public
as $$
begin
    if to_regprocedure('public.append_quote_requirement_customer_activity(jsonb,text,text,text)') is not null then
        return public.append_quote_requirement_customer_activity(
            base_answers,
            activity_action,
            activity_detail,
            activity_actor
        );
    end if;

    return coalesce(base_answers, '{}'::jsonb);
end;
$$;

grant execute on function public.safe_append_quote_requirement_customer_activity(jsonb, text, text, text) to anon, authenticated;

create or replace function public.get_public_quote_requirement(req_slug text, req_token text)
returns table (
    id uuid,
    customer_id uuid,
    title text,
    status text,
    requirement_type text,
    country text,
    answers jsonb,
    requester_company text,
    requester_name text,
    requester_email text,
    requester_phone text,
    submitted_at timestamptz,
    updated_at timestamptz,
    customer_company text,
    customer_contact text,
    customer_email text,
    customer_phone text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    requirement_row public.quote_requirements%rowtype;
    customer_row public.quote_customers%rowtype;
begin
    select *
    into requirement_row
    from public.quote_requirements
    where is_active = true
      and public_slug = req_slug
      and public_token = req_token
    limit 1;

    if not found then
        raise exception 'Requirement link is invalid or unavailable.';
    end if;

    update public.quote_requirements
    set answers = public.safe_append_quote_requirement_customer_activity(
            requirement_row.answers,
            'opened',
            'Opened public requirement page',
            'customer'
        ),
        updated_by = null
    where public.quote_requirements.id = requirement_row.id
    returning *
    into requirement_row;

    if requirement_row.customer_id is not null then
        select *
        into customer_row
        from public.quote_customers
        where id = requirement_row.customer_id
        limit 1;
    end if;

    return query
    select
        requirement_row.id,
        requirement_row.customer_id,
        requirement_row.title,
        requirement_row.status,
        requirement_row.requirement_type,
        requirement_row.country,
        requirement_row.answers,
        requirement_row.requester_company,
        requirement_row.requester_name,
        requirement_row.requester_email,
        requirement_row.requester_phone,
        requirement_row.submitted_at,
        requirement_row.updated_at,
        coalesce(customer_row.company_name, ''),
        coalesce(customer_row.contact_name, ''),
        coalesce(customer_row.email, ''),
        coalesce(customer_row.phone, '');
end;
$$;

grant execute on function public.get_public_quote_requirement(text, text) to anon, authenticated;

create or replace function public.submit_public_quote_requirement(req_slug text, req_token text, payload jsonb default '{}'::jsonb)
returns table (
    id uuid,
    status text,
    submitted_at timestamptz,
    updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    requirement_row public.quote_requirements%rowtype;
    merged_answers jsonb := '{}'::jsonb;
    next_title text := '';
    next_country text := '';
    next_company text := '';
    next_name text := '';
    next_email text := '';
    next_phone text := '';
begin
    select *
    into requirement_row
    from public.quote_requirements
    where is_active = true
      and public_slug = req_slug
      and public_token = req_token
    limit 1;

    if not found then
        raise exception 'Requirement link is invalid or unavailable.';
    end if;

    if requirement_row.status in ('submitted', 'reviewing', 'quoted', 'closed') then
        return query
        select requirement_row.id, requirement_row.status, requirement_row.submitted_at, requirement_row.updated_at;
        return;
    end if;

    merged_answers := coalesce(requirement_row.answers, '{}'::jsonb) || coalesce(payload -> 'answers', '{}'::jsonb);
    merged_answers := public.safe_append_quote_requirement_customer_activity(
        merged_answers,
        'submitted',
        'Submitted and locked requirement',
        'customer'
    );
    next_company := coalesce(nullif(trim(payload ->> 'requester_company'), ''), nullif(requirement_row.requester_company, ''), '');
    next_name := coalesce(nullif(trim(payload ->> 'requester_name'), ''), nullif(requirement_row.requester_name, ''), '');
    next_email := coalesce(nullif(trim(payload ->> 'requester_email'), ''), nullif(requirement_row.requester_email, ''), '');
    next_phone := coalesce(nullif(trim(payload ->> 'requester_phone'), ''), nullif(requirement_row.requester_phone, ''), '');
    next_country := coalesce(nullif(trim(payload ->> 'country'), ''), nullif(requirement_row.country, ''), '');
    next_title := coalesce(
        nullif(trim(payload ->> 'title'), ''),
        nullif(requirement_row.title, ''),
        nullif(next_company, ''),
        concat('Requirement ', substr(requirement_row.id::text, 1, 8))
    );

    update public.quote_requirements
    set title = next_title,
        status = 'submitted',
        country = next_country,
        answers = merged_answers,
        requester_company = next_company,
        requester_name = next_name,
        requester_email = next_email,
        requester_phone = next_phone,
        submitted_at = coalesce(requirement_row.submitted_at, timezone('utc', now())),
        updated_by = null
    where public.quote_requirements.id = requirement_row.id
    returning *
    into requirement_row;

    if requirement_row.customer_id is not null then
        update public.quote_customers
        set company_name = case when next_company <> '' then next_company else company_name end,
            contact_name = case when next_name <> '' then next_name else contact_name end,
            email = case when next_email <> '' then next_email else email end,
            phone = case when next_phone <> '' then next_phone else phone end,
            country = case when next_country <> '' then next_country else country end,
            updated_by = null
        where public.quote_customers.id = requirement_row.customer_id;
    end if;

    return query
    select requirement_row.id, requirement_row.status, requirement_row.submitted_at, requirement_row.updated_at;
end;
$$;

grant execute on function public.submit_public_quote_requirement(text, text, jsonb) to anon, authenticated;

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
    requirement_actor_label text;
    requirement_submitted_at_value timestamptz;
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

    select
        d.id,
        d.customer_id,
        d.primary_requirement_id,
        d.current_stage
    into
        deal_id_value,
        deal_customer_id,
        deal_primary_requirement_id,
        deal_current_stage
    from public.quote_deals as d
    where d.id = target_deal_id
      and d.customer_id = me_customer_id
    limit 1;

    if not found then
        raise exception 'Deal not found for current customer account.';
    end if;

    if coalesce(deal_current_stage, '') not in ('customer_profile', 'requirement_capture', 'requirement_confirmed') then
        raise exception 'Current deal stage does not accept requirement submission.';
    end if;

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
        coalesce(nullif(r.requester_email, ''), nullif(r.requester_name, ''), 'customer'),
        r.submitted_at
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
        requirement_actor_label,
        requirement_submitted_at_value
    from public.quote_requirements as r
    where r.deal_id = deal_id_value
    order by (r.id = deal_primary_requirement_id) desc, r.updated_at desc
    limit 1;

    if not found then
        raise exception 'No requirement draft found for this deal.';
    end if;

    merged_answers := requirement_answers_value || coalesce(payload -> 'answers', '{}'::jsonb);
    merged_answers := public.safe_append_quote_requirement_customer_activity(
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

    update public.quote_requirements
    set status = 'submitted',
        title = coalesce(nullif(trim(payload ->> 'title'), ''), nullif(requirement_title_value, ''), concat('Requirement ', substr(requirement_id_value::text, 1, 8))),
        requirement_type = coalesce(nullif(trim(payload ->> 'requirement_type'), ''), nullif(requirement_type_value, ''), requirement_type),
        country = next_country,
        answers = merged_answers,
        requester_company = next_company,
        requester_name = next_name,
        requester_email = next_email,
        requester_phone = next_phone,
        submitted_at = coalesce(requirement_submitted_at_value, submitted_at_utc),
        updated_by = null,
        updated_at = submitted_at_utc
    where id = requirement_id_value;

    update public.quote_customers
    set company_name = case when next_company <> '' then next_company else company_name end,
        contact_name = case when next_name <> '' then next_name else contact_name end,
        email = case when next_email <> '' then next_email else email end,
        phone = case when next_phone <> '' then next_phone else phone end,
        country = case when next_country <> '' then next_country else country end,
        updated_by = null,
        updated_at = submitted_at_utc
    where id = deal_customer_id;

    update public.quote_deal_stage_records as sr
    set stage_status = 'completed',
        completed_at = coalesce(completed_at, submitted_at_utc),
        updated_at = submitted_at_utc
    where sr.deal_id = deal_id_value
      and sr.stage_key = 'requirement_capture';

    update public.quote_deal_stage_records as sr
    set stage_status = case when stage_status = 'completed' then stage_status else 'active' end,
        updated_at = submitted_at_utc
    where sr.deal_id = deal_id_value
      and sr.stage_key = next_stage_key;

    update public.quote_deals
    set current_stage = next_stage_key,
        updated_at = submitted_at_utc
    where id = deal_id_value
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
        deal_customer_id,
        deal_id_value,
        requirement_id_value,
        'requirement_capture',
        'customer',
        null,
        requirement_actor_label,
        'field_change',
        'requirement',
        requirement_id_value::text,
        'customer-pipeline',
        'Submitted requirement from account center',
        jsonb_strip_nulls(jsonb_build_object(
            'requester_company', nullif(next_company, ''),
            'requester_name', nullif(next_name, ''),
            'requester_email', nullif(next_email, ''),
            'requester_phone', nullif(next_phone, ''),
            'country', nullif(next_country, '')
        )),
        submitted_at_utc
    );

    deal_id := deal_id_value;
    stage_key := 'requirement_capture';
    next_stage := next_stage_key;
    submitted_at := submitted_at_utc;
    return next;
end;
$$;

grant execute on function public.submit_customer_requirement(uuid, jsonb) to authenticated;
