-- Allows a public quote page to create/update a customer card and send ledger
-- without granting anonymous access to the underlying sales tables.
create or replace function public.record_public_quote_email_dispatch(
    target_instance_id uuid,
    target_recipient_email text
)
returns table (
    customer_id uuid,
    recipient_email text,
    recipient_name text,
    recipient_company text,
    sent_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    instance_row public.quote_instances%rowtype;
    customer_row public.quote_customers%rowtype;
    normalized_email text := lower(trim(coalesce(target_recipient_email, '')));
    next_company text := '';
    next_contact text := '';
    next_sender_name text := '';
    next_sender_email text := '';
    dispatch_time timestamptz := timezone('utc', now());
begin
    if target_instance_id is null then
        raise exception 'Quote is unavailable.';
    end if;

    if normalized_email = ''
        or length(normalized_email) > 320
        or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
        raise exception 'Enter a valid customer email first.';
    end if;

    select *
    into instance_row
    from public.quote_instances
    where id = target_instance_id
      and status in ('draft', 'published')
    limit 1;

    if not found then
        raise exception 'Quote is unavailable.';
    end if;

    next_company := coalesce(nullif(trim(instance_row.customer_name), ''), normalized_email);
    next_contact := coalesce(nullif(trim(instance_row.receiver_name), ''), '');
    next_sender_name := coalesce(
        nullif(trim(instance_row.brand_snapshot ->> 'subject_name'), ''),
        nullif(trim(instance_row.brand_snapshot ->> 'display_name'), ''),
        nullif(trim(instance_row.brand_snapshot ->> 'brand_name'), ''),
        'GasGx'
    );
    next_sender_email := lower(trim(coalesce(
        nullif(instance_row.brand_snapshot ->> 'sender_email', ''),
        nullif(instance_row.brand_snapshot ->> 'senderEmail', ''),
        ''
    )));

    select *
    into customer_row
    from public.quote_customers
    where lower(email) = normalized_email
    order by is_deleted asc, updated_at desc
    limit 1;

    if customer_row.id is null then
        insert into public.quote_customers (
            company_name,
            contact_name,
            email,
            notes,
            is_active,
            is_deleted,
            created_by,
            updated_by
        ) values (
            next_company,
            next_contact,
            normalized_email,
            'Auto-created from public quote email dispatch.',
            true,
            false,
            null,
            null
        )
        returning * into customer_row;
    else
        update public.quote_customers
        set company_name = case when next_company <> '' then next_company else company_name end,
            contact_name = case when next_contact <> '' then next_contact else contact_name end,
            email = normalized_email,
            is_active = true,
            is_deleted = false,
            updated_by = null
        where id = customer_row.id
        returning * into customer_row;
    end if;

    update public.quote_instances
    set customer_id = customer_row.id,
        receiver_email = normalized_email,
        customer_snapshot = jsonb_strip_nulls(jsonb_build_object(
            'company_name', customer_row.company_name,
            'contact_name', customer_row.contact_name,
            'email', customer_row.email,
            'phone', customer_row.phone,
            'country', customer_row.country,
            'notes', customer_row.notes
        )),
        share_config = coalesce(share_config, '{}'::jsonb) || jsonb_build_object(
            'recipient_name', next_contact,
            'recipient_email', normalized_email,
            'recipient_company', next_company
        ),
        updated_by = null
    where id = instance_row.id;

    if not exists (
        select 1
        from public.quote_instance_sends
        where instance_id = instance_row.id
          and recipient_email = normalized_email
          and last_channel = 'email'
          and last_sent_at > dispatch_time - interval '30 seconds'
    ) then
        insert into public.quote_instance_sends (
            instance_id,
            customer_id,
            recipient_name,
            recipient_email,
            recipient_company,
            owner_name,
            owner_email,
            share_target,
            last_channel,
            channels,
            status,
            attempt_count,
            first_sent_at,
            last_sent_at,
            sender_name,
            sender_email,
            created_by,
            updated_by
        ) values (
            instance_row.id,
            customer_row.id,
            next_contact,
            normalized_email,
            next_company,
            next_sender_name,
            next_sender_email,
            'quote',
            'email',
            '["email"]'::jsonb,
            'emailed',
            1,
            dispatch_time,
            dispatch_time,
            next_sender_name,
            next_sender_email,
            null,
            null
        );

        insert into public.quote_customer_activities (
            customer_id,
            instance_id,
            actor_type,
            actor_label,
            activity_type,
            entity_type,
            entity_id,
            page_key,
            action_label,
            detail_json,
            occurred_at
        ) values (
            customer_row.id,
            instance_row.id,
            'system',
            'Public quote email dispatch',
            'button_click',
            'quote_instance',
            instance_row.id::text,
            'quote-view',
            'Public quote email dispatch',
            jsonb_build_object(
                'channel', 'email',
                'recipient_email', normalized_email,
                'recipient_company', next_company
            ),
            dispatch_time
        );
    end if;

    return query
    select customer_row.id, normalized_email, next_contact, next_company, dispatch_time;
end;
$$;

revoke execute on function public.record_public_quote_email_dispatch(uuid, text) from public;
grant execute on function public.record_public_quote_email_dispatch(uuid, text) to anon, authenticated;
