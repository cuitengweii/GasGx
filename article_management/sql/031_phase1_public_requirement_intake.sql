alter table public.quote_requirements
    drop constraint if exists quote_requirements_requirement_type_check;

alter table public.quote_requirements
    add constraint quote_requirements_requirement_type_check
    check (
        requirement_type in (
            'power_only',
            'miner_only',
            'integrated_mining_power',
            'oilfield_gas_to_power',
            'industrial_power_generation',
            'chp_project',
            'unclear'
        )
    );

drop function if exists public.create_public_quote_requirement(jsonb);

create or replace function public.create_public_quote_requirement(payload jsonb default '{}'::jsonb)
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
    public_slug text,
    public_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    requirement_row public.quote_requirements%rowtype;
    next_id uuid := gen_random_uuid();
    next_type text := '';
    next_title text := '';
    next_country text := '';
    next_company text := '';
    next_name text := '';
    next_email text := '';
    next_phone text := '';
    next_answers jsonb := '{}'::jsonb;
begin
    next_answers := coalesce(payload -> 'answers', '{}'::jsonb);
    next_type := coalesce(nullif(trim(payload ->> 'requirement_type'), ''), 'unclear');
    if next_type not in (
        'power_only',
        'miner_only',
        'integrated_mining_power',
        'oilfield_gas_to_power',
        'industrial_power_generation',
        'chp_project',
        'unclear'
    ) then
        next_type := 'unclear';
    end if;

    next_country := coalesce(nullif(trim(payload ->> 'country'), ''), '');
    next_company := coalesce(nullif(trim(payload ->> 'requester_company'), ''), '');
    next_name := coalesce(nullif(trim(payload ->> 'requester_name'), ''), '');
    next_email := coalesce(nullif(trim(payload ->> 'requester_email'), ''), '');
    next_phone := coalesce(nullif(trim(payload ->> 'requester_phone'), ''), '');
    next_title := coalesce(
        nullif(trim(payload ->> 'title'), ''),
        nullif(next_company, ''),
        concat('Requirement ', substr(next_id::text, 1, 8))
    );

    insert into public.quote_requirements (
        id,
        customer_id,
        title,
        status,
        requirement_type,
        country,
        answers,
        requester_company,
        requester_name,
        requester_email,
        requester_phone,
        public_slug,
        public_token,
        created_by,
        updated_by
    )
    values (
        next_id,
        null,
        next_title,
        'draft',
        next_type,
        next_country,
        next_answers,
        next_company,
        next_name,
        next_email,
        next_phone,
        concat('req-', substr(next_id::text, 1, 8)),
        md5(random()::text || clock_timestamp()::text || next_id::text),
        null,
        null
    )
    returning *
    into requirement_row;

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
        requirement_row.public_slug,
        requirement_row.public_token;
end;
$$;

grant execute on function public.create_public_quote_requirement(jsonb) to anon, authenticated;
