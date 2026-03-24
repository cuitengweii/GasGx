create or replace function public.append_quote_requirement_customer_activity(
    base_answers jsonb,
    activity_action text,
    activity_detail text default '',
    activity_actor text default 'customer'
)
returns jsonb
language sql
volatile
set search_path = public
as $$
    select jsonb_set(
        coalesce(base_answers, '{}'::jsonb),
        '{customer_activity_logs}',
        coalesce(
            case
                when jsonb_typeof(coalesce(base_answers, '{}'::jsonb) -> 'customer_activity_logs') = 'array'
                    then coalesce(base_answers, '{}'::jsonb) -> 'customer_activity_logs'
                else '[]'::jsonb
            end,
            '[]'::jsonb
        ) || jsonb_build_array(
            jsonb_strip_nulls(
                jsonb_build_object(
                    'action', activity_action,
                    'created_at', timezone('utc', now()),
                    'actor', coalesce(nullif(trim(activity_actor), ''), 'customer'),
                    'detail', nullif(trim(activity_detail), '')
                )
            )
        ),
        true
    );
$$;

grant execute on function public.append_quote_requirement_customer_activity(jsonb, text, text, text) to anon, authenticated;

drop function if exists public.get_public_quote_requirement(text, text);

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
    set answers = public.append_quote_requirement_customer_activity(
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
    merged_answers := public.append_quote_requirement_customer_activity(
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
