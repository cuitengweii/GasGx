create table if not exists public.quote_brands (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    brand_name text not null,
    display_name text not null,
    supplier_name text not null default '',
    sender_email text not null default '',
    subject_name text not null default '',
    overview_title jsonb not null default '{}'::jsonb,
    footer_note jsonb not null default '{}'::jsonb,
    theme_primary text not null default '#5DD62C',
    theme_dark text not null default '#337418',
    share_signing_secret text not null default 'GasGx::Quote::ShareGate::20260321',
    share_unlock_prefix text not null default 'quote-share-unlocked',
    default_quote_slug text null,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create table if not exists public.quote_products (
    id uuid primary key default gen_random_uuid(),
    brand_id uuid not null references public.quote_brands(id) on delete cascade,
    slug text not null unique,
    product_code text not null default '',
    public_title jsonb not null default '{}'::jsonb,
    default_lang text not null default 'zh',
    validity_hours integer not null default 72,
    default_rates jsonb not null default '{}'::jsonb,
    section_config jsonb not null default '[]'::jsonb,
    sort_order integer not null default 100,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

alter table public.quote_products
    add column if not exists media_config jsonb not null default '{"enabled": false, "position": "below", "layout": "carousel"}'::jsonb;

alter table public.quote_products
    add column if not exists ui_text jsonb not null default '{}'::jsonb;

create table if not exists public.quote_product_items (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.quote_products(id) on delete cascade,
    section_key text not null check (section_key in ('main_config', 'optional_config')),
    sort_order integer not null default 100,
    line_code text not null default '',
    brand_label text not null default '',
    qty_label text not null default '1',
    price_rmb numeric(18,2) not null default 0,
    is_included boolean not null default false,
    name_i18n jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

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

create table if not exists public.quote_instances (
    id uuid primary key default gen_random_uuid(),
    brand_id uuid not null references public.quote_brands(id) on delete restrict,
    product_id uuid not null references public.quote_products(id) on delete restrict,
    public_slug text not null unique,
    status text not null default 'draft' check (status in ('draft', 'published')),
    customer_name text not null default '',
    receiver_name text not null default '',
    receiver_email text not null default '',
    default_lang text not null default 'zh',
    validity_hours integer not null default 72,
    draft_rates jsonb not null default '{}'::jsonb,
    share_config jsonb not null default '{}'::jsonb,
    brand_snapshot jsonb not null default '{}'::jsonb,
    product_snapshot jsonb not null default '{}'::jsonb,
    section_config jsonb not null default '[]'::jsonb,
    published_snapshot jsonb null,
    published_at timestamptz null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create table if not exists public.quote_instance_items (
    id uuid primary key default gen_random_uuid(),
    instance_id uuid not null references public.quote_instances(id) on delete cascade,
    section_key text not null check (section_key in ('main_config', 'optional_config')),
    sort_order integer not null default 100,
    line_code text not null default '',
    brand_label text not null default '',
    qty_label text not null default '1',
    price_rmb numeric(18,2) not null default 0,
    is_included boolean not null default false,
    name_i18n jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists quote_brands_active_idx on public.quote_brands (is_active, slug);
create index if not exists quote_products_brand_idx on public.quote_products (brand_id, is_active, sort_order);
create index if not exists quote_product_items_product_idx on public.quote_product_items (product_id, section_key, sort_order);
create index if not exists quote_product_media_product_idx on public.quote_product_media (product_id, is_active, sort_order);
create index if not exists quote_instances_status_idx on public.quote_instances (status, public_slug);
create index if not exists quote_instances_brand_product_idx on public.quote_instances (brand_id, product_id, status);
create index if not exists quote_instance_items_instance_idx on public.quote_instance_items (instance_id, section_key, sort_order);

create or replace function public.set_quote_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists trg_quote_brands_updated_at on public.quote_brands;
create trigger trg_quote_brands_updated_at
before update on public.quote_brands
for each row
execute function public.set_quote_updated_at();

drop trigger if exists trg_quote_products_updated_at on public.quote_products;
create trigger trg_quote_products_updated_at
before update on public.quote_products
for each row
execute function public.set_quote_updated_at();

drop trigger if exists trg_quote_product_items_updated_at on public.quote_product_items;
create trigger trg_quote_product_items_updated_at
before update on public.quote_product_items
for each row
execute function public.set_quote_updated_at();

drop trigger if exists trg_quote_product_media_updated_at on public.quote_product_media;
create trigger trg_quote_product_media_updated_at
before update on public.quote_product_media
for each row
execute function public.set_quote_updated_at();

drop trigger if exists trg_quote_instances_updated_at on public.quote_instances;
create trigger trg_quote_instances_updated_at
before update on public.quote_instances
for each row
execute function public.set_quote_updated_at();

drop trigger if exists trg_quote_instance_items_updated_at on public.quote_instance_items;
create trigger trg_quote_instance_items_updated_at
before update on public.quote_instance_items
for each row
execute function public.set_quote_updated_at();

alter table public.quote_brands enable row level security;
alter table public.quote_products enable row level security;
alter table public.quote_product_items enable row level security;
alter table public.quote_product_media enable row level security;
alter table public.quote_instances enable row level security;
alter table public.quote_instance_items enable row level security;

drop policy if exists "quote_brands_public_read" on public.quote_brands;
create policy "quote_brands_public_read"
on public.quote_brands
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "quote_instances_public_read" on public.quote_instances;
create policy "quote_instances_public_read"
on public.quote_instances
for select
to anon, authenticated
using (status = 'published' and published_snapshot is not null);

drop policy if exists "quote_brands_admin_all" on public.quote_brands;
create policy "quote_brands_admin_all"
on public.quote_brands
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "quote_products_admin_all" on public.quote_products;
create policy "quote_products_admin_all"
on public.quote_products
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "quote_product_items_admin_all" on public.quote_product_items;
create policy "quote_product_items_admin_all"
on public.quote_product_items
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "quote_product_media_admin_all" on public.quote_product_media;
create policy "quote_product_media_admin_all"
on public.quote_product_media
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "quote_instances_admin_all" on public.quote_instances;
create policy "quote_instances_admin_all"
on public.quote_instances
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "quote_instance_items_admin_all" on public.quote_instance_items;
create policy "quote_instance_items_admin_all"
on public.quote_instance_items
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
