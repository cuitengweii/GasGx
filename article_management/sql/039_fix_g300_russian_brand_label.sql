-- Remove the remaining Chinese unit label from the G300 Russian view.
update public.quote_product_items item
set brand_label = 'GasGx-6000 м²'
where item.product_id = (select id from public.quote_products where slug = 'G300')
  and item.line_code = 'B-10';

update public.quote_instance_items item
set brand_label = 'GasGx-6000 м²'
where item.line_code = 'B-10'
  and item.instance_id in (
      select id from public.quote_instances
      where product_id = (select id from public.quote_products where slug = 'G300')
        and share_config->>'preview_source' = 'product_template'
        and status = 'draft'
  );
