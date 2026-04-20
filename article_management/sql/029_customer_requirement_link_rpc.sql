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
