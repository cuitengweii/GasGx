alter table public.quote_products
    add column if not exists media_config jsonb not null default '{"enabled": false, "position": "below", "layout": "carousel"}'::jsonb;

alter table public.quote_products
    add column if not exists ui_text jsonb not null default '{}'::jsonb;

create table if not exists public.quote_product_media (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.quote_products(id) on delete cascade,
    sort_order integer not null default 100,
    title text not null default '',
    storage_path text not null unique,
    public_url text not null default '',
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create index if not exists quote_product_media_product_idx on public.quote_product_media (product_id, is_active, sort_order);

create or replace function public.set_quote_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists trg_quote_product_media_updated_at on public.quote_product_media;
create trigger trg_quote_product_media_updated_at
before update on public.quote_product_media
for each row
execute function public.set_quote_updated_at();

alter table public.quote_product_media enable row level security;

drop policy if exists "quote_product_media_admin_all" on public.quote_product_media;
create policy "quote_product_media_admin_all"
on public.quote_product_media
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'quote-product-media',
    'quote-product-media',
    true,
    10485760,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "quote_product_media_public_read" on storage.objects;
create policy "quote_product_media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'quote-product-media');

drop policy if exists "quote_product_media_admin_insert" on storage.objects;
create policy "quote_product_media_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'quote-product-media' and public.is_active_admin_user());

drop policy if exists "quote_product_media_admin_update" on storage.objects;
create policy "quote_product_media_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'quote-product-media' and public.is_active_admin_user())
with check (bucket_id = 'quote-product-media' and public.is_active_admin_user());

drop policy if exists "quote_product_media_admin_delete" on storage.objects;
create policy "quote_product_media_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'quote-product-media' and public.is_active_admin_user());
