alter table public.quote_requirements
    add column if not exists requester_company text not null default '',
    add column if not exists requester_name text not null default '',
    add column if not exists requester_email text not null default '',
    add column if not exists requester_phone text not null default '',
    add column if not exists public_slug text,
    add column if not exists public_token text,
    add column if not exists submitted_at timestamptz null;

alter table public.quote_requirements
    alter column status set default 'draft';

alter table public.quote_requirements
    drop constraint if exists quote_requirements_status_check;

update public.quote_requirements
set status = case
    when status = 'intake' then 'draft'
    else status
end
where status in ('intake', 'reviewing', 'quoted', 'closed');

alter table public.quote_requirements
    add constraint quote_requirements_status_check
    check (status in ('draft', 'submitted', 'reviewing', 'quoted', 'closed'));

update public.quote_requirements as requirement
set requester_company = coalesce(nullif(requirement.requester_company, ''), customer.company_name, ''),
    requester_name = coalesce(nullif(requirement.requester_name, ''), customer.contact_name, ''),
    requester_email = coalesce(nullif(requirement.requester_email, ''), customer.email, ''),
    requester_phone = coalesce(nullif(requirement.requester_phone, ''), customer.phone, '')
from public.quote_customers as customer
where requirement.customer_id = customer.id;

update public.quote_requirements
set public_slug = coalesce(nullif(public_slug, ''), concat('req-', substr(id::text, 1, 8))),
    public_token = coalesce(nullif(public_token, ''), encode(gen_random_bytes(8), 'hex'))
where coalesce(public_slug, '') = ''
   or coalesce(public_token, '') = '';

create unique index if not exists quote_requirements_public_slug_idx
    on public.quote_requirements (public_slug)
    where public_slug is not null;

create index if not exists quote_requirements_public_token_idx
    on public.quote_requirements (public_token)
    where public_token is not null;

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
    customer_company text,
    customer_contact text,
    customer_email text,
    customer_phone text
)
language sql
security definer
set search_path = public
as $$
    select
        requirement.id,
        requirement.customer_id,
        requirement.title,
        requirement.status,
        requirement.requirement_type,
        requirement.country,
        requirement.answers,
        requirement.requester_company,
        requirement.requester_name,
        requirement.requester_email,
        requirement.requester_phone,
        requirement.submitted_at,
        customer.company_name as customer_company,
        customer.contact_name as customer_contact,
        customer.email as customer_email,
        customer.phone as customer_phone
    from public.quote_requirements as requirement
    left join public.quote_customers as customer
        on customer.id = requirement.customer_id
    where requirement.is_active = true
      and requirement.public_slug = req_slug
      and requirement.public_token = req_token
    limit 1;
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
