-- Keep one row per owner, module and line code, and prevent duplicate quote rows.

with ranked as (
    select id,
           row_number() over (
               partition by product_id, section_key, line_code
               order by created_at, id
           ) as row_number
    from public.quote_product_items
    where nullif(trim(line_code), '') is not null
)
delete from public.quote_product_items item
using ranked
where item.id = ranked.id
  and ranked.row_number > 1;

with ranked as (
    select id,
           row_number() over (
               partition by instance_id, section_key, line_code
               order by created_at, id
           ) as row_number
    from public.quote_instance_items
    where nullif(trim(line_code), '') is not null
)
delete from public.quote_instance_items item
using ranked
where item.id = ranked.id
  and ranked.row_number > 1;

create unique index if not exists quote_product_items_owner_section_line_uq
    on public.quote_product_items (product_id, section_key, line_code)
    where nullif(trim(line_code), '') is not null;

create unique index if not exists quote_instance_items_owner_section_line_uq
    on public.quote_instance_items (instance_id, section_key, line_code)
    where nullif(trim(line_code), '') is not null;
