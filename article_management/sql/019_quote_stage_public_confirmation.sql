alter table public.quote_deal_stage_records
    add column if not exists public_slug text,
    add column if not exists public_token text;

update public.quote_deal_stage_records
set public_slug = concat('stage-', replace(stage_key, '_', '-'), '-', substr(id::text, 1, 8)),
    public_token = encode(gen_random_bytes(8), 'hex')
where stage_key in ('quote_confirmed', 'contract_signed', 'factory_accepted')
  and (
    coalesce(public_slug, '') = ''
    or coalesce(public_token, '') = ''
  );

create unique index if not exists quote_deal_stage_records_public_slug_idx
    on public.quote_deal_stage_records (public_slug)
    where public_slug is not null;

create index if not exists quote_deal_stage_records_public_token_idx
    on public.quote_deal_stage_records (public_token)
    where public_token is not null;

create or replace function public.get_public_quote_stage_confirmation(stage_slug text, stage_token text)
returns table (
    deal_id uuid,
    stage_key text,
    stage_label text,
    current_stage text,
    customer_name text,
    customer_company text,
    deal_title text,
    quote_public_slug text,
    meta jsonb,
    stage_status text,
    completed_at timestamptz
)
language sql
security definer
set search_path = public
as $$
    select
        stage_record.deal_id,
        stage_record.stage_key,
        case stage_record.stage_key
            when 'quote_confirmed' then '确认报价'
            when 'contract_signed' then '签约合同'
            when 'factory_accepted' then '出厂验收'
            else stage_record.stage_key
        end as stage_label,
        deal.current_stage,
        coalesce(customer.contact_name, customer.company_name, '') as customer_name,
        coalesce(customer.company_name, '') as customer_company,
        coalesce(deal.title, '') as deal_title,
        coalesce(instance.public_slug, '') as quote_public_slug,
        coalesce(stage_record.meta, '{}'::jsonb) as meta,
        stage_record.stage_status,
        stage_record.completed_at
    from public.quote_deal_stage_records as stage_record
    join public.quote_deals as deal
        on deal.id = stage_record.deal_id
    left join public.quote_customers as customer
        on customer.id = deal.customer_id
    left join public.quote_instances as instance
        on instance.id = deal.primary_instance_id
    where stage_record.public_slug = stage_slug
      and stage_record.public_token = stage_token
      and stage_record.stage_key in ('quote_confirmed', 'contract_signed', 'factory_accepted')
    limit 1;
$$;

grant execute on function public.get_public_quote_stage_confirmation(text, text) to anon, authenticated;

create or replace function public.submit_public_quote_stage_confirmation(stage_slug text, stage_token text, payload jsonb default '{}'::jsonb)
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
    stage_record public.quote_deal_stage_records%rowtype;
    next_stage_key text := '';
    submitted_at_utc timestamptz := timezone('utc', now());
    next_meta jsonb := '{}'::jsonb;
begin
    select *
    into stage_record
    from public.quote_deal_stage_records
    where public_slug = stage_slug
      and public_token = stage_token
      and stage_key in ('quote_confirmed', 'contract_signed', 'factory_accepted')
    limit 1;

    if not found then
        raise exception 'Confirmation link is invalid or unavailable.';
    end if;

    next_stage_key := case stage_record.stage_key
        when 'quote_confirmed' then 'contract_signed'
        when 'contract_signed' then 'deposit_paid'
        when 'factory_accepted' then 'balance_confirmed'
        else stage_record.stage_key
    end;

    next_meta := coalesce(stage_record.meta, '{}'::jsonb) || jsonb_build_object(
        'public_confirmed_at', submitted_at_utc,
        'public_confirmation_note', coalesce(payload ->> 'note', ''),
        'public_confirmation_payload', coalesce(payload, '{}'::jsonb)
    );

    update public.quote_deal_stage_records
    set stage_status = 'completed',
        completed_at = coalesce(completed_at, submitted_at_utc),
        meta = next_meta,
        updated_at = submitted_at_utc
    where id = stage_record.id;

    update public.quote_deals
    set current_stage = next_stage_key,
        updated_at = submitted_at_utc
    where id = stage_record.deal_id
      and current_stage = stage_record.stage_key;

    update public.quote_deal_stage_records
    set stage_status = case when stage_status = 'completed' then stage_status else 'active' end,
        updated_at = submitted_at_utc
    where deal_id = stage_record.deal_id
      and stage_key = next_stage_key;

    if stage_record.stage_key = 'quote_confirmed' then
        update public.quote_deal_stage_records
        set meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object(
            'quote_terms',
            coalesce((stage_record.meta ->> 'quote_terms'), '')
        ),
            updated_at = submitted_at_utc
        where deal_id = stage_record.deal_id
          and stage_key = 'contract_signed';
    end if;

    return query
    select stage_record.deal_id, stage_record.stage_key, next_stage_key, submitted_at_utc;
end;
$$;

grant execute on function public.submit_public_quote_stage_confirmation(text, text, jsonb) to anon, authenticated;
