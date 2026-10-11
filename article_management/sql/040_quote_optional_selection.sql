-- Optional configuration rows can be selected into the quote total.
-- Existing rows remain unselected so optional prices are opt-in.

alter table public.quote_product_items
    add column if not exists is_selected boolean not null default false;

alter table public.quote_instance_items
    add column if not exists is_selected boolean not null default false;
