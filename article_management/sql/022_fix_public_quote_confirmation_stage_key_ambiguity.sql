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
    select stage_record_row.*
    into stage_record
    from public.quote_deal_stage_records as stage_record_row
    where stage_record_row.public_slug = stage_slug
      and stage_record_row.public_token = stage_token
      and stage_record_row.stage_key in ('quote_confirmed', 'contract_signed', 'factory_accepted')
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
    where public.quote_deal_stage_records.deal_id = stage_record.deal_id
      and public.quote_deal_stage_records.stage_key = next_stage_key;

    if stage_record.stage_key = 'quote_confirmed' then
        update public.quote_deal_stage_records
        set meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object(
            'quote_terms',
            coalesce((stage_record.meta ->> 'quote_terms'), '')
        ),
            updated_at = submitted_at_utc
        where public.quote_deal_stage_records.deal_id = stage_record.deal_id
          and public.quote_deal_stage_records.stage_key = 'contract_signed';
    end if;

    return query
    select stage_record.deal_id, stage_record.stage_key, next_stage_key, submitted_at_utc;
end;
$$;

grant execute on function public.submit_public_quote_stage_confirmation(text, text, jsonb) to anon, authenticated;
