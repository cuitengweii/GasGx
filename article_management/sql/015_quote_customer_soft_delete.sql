alter table public.quote_customers
    add column if not exists is_deleted boolean not null default false;

create index if not exists quote_customers_deleted_idx
    on public.quote_customers (is_deleted, is_active, company_name, contact_name);
