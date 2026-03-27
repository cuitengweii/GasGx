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
            when 'quote_confirmed' then 'Quote Confirmation'
            when 'contract_signed' then 'Contract Confirmation'
            when 'factory_accepted' then 'Factory Acceptance'
            when 'production_scheduled' then 'Production Progress'
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
      and stage_record.stage_key in ('quote_confirmed', 'contract_signed', 'factory_accepted', 'production_scheduled')
    limit 1;
$$;

grant execute on function public.get_public_quote_stage_confirmation(text, text) to anon, authenticated;
