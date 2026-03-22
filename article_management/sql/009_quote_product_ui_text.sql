alter table public.quote_products
    add column if not exists ui_text jsonb not null default '{}'::jsonb;
