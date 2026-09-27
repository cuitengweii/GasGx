-- Add an independent wear-parts module after the service package.
-- Existing rows remain unchanged; the editor adds rows to this section on demand.

alter table public.quote_product_items
    drop constraint if exists quote_product_items_section_key_check;
alter table public.quote_product_items
    add constraint quote_product_items_section_key_check
    check (section_key in ('main_config', 'service_package', 'optional_config', 'wear_parts'));

alter table public.quote_instance_items
    drop constraint if exists quote_instance_items_section_key_check;
alter table public.quote_instance_items
    add constraint quote_instance_items_section_key_check
    check (section_key in ('main_config', 'service_package', 'optional_config', 'wear_parts'));

update public.quote_products
set section_config = coalesce(section_config, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
        'key', 'wear_parts',
        'title', jsonb_build_object(
            'zh', '易损件模块',
            'en', 'Wear Parts Module',
            'ru', 'Модуль быстроизнашиваемых деталей'
        ),
        'subtotalMode', 'manual',
        'subtotal', 0
    )
)
where id = 'eb4a7807-0e33-4031-920a-2f3bf5843e84'
  and not exists (
      select 1
      from jsonb_array_elements(coalesce(section_config, '[]'::jsonb)) as section
      where section->>'key' = 'wear_parts'
  );
