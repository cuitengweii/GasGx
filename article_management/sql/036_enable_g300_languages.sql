-- Keep the G300 product preview language configuration reproducible.
update public.quote_products
set ui_text = jsonb_set(coalesce(ui_text, '{}'::jsonb), '{enabled_langs}', '["zh", "en", "ru"]'::jsonb, true)
where slug = 'G300';

update public.quote_instances
set share_config = jsonb_set(coalesce(share_config, '{}'::jsonb), '{enabled_langs}', '["zh", "en", "ru"]'::jsonb, true)
where product_id in (select id from public.quote_products where slug = 'G300')
  and share_config->>'preview_source' = 'product_template'
  and status = 'draft';
