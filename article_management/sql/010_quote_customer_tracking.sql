create table if not exists public.quote_customers (
    id uuid primary key default gen_random_uuid(),
    company_name text not null default '',
    contact_name text not null default '',
    email text not null default '',
    phone text not null default '',
    country text not null default '',
    notes text not null default '',
    is_active boolean not null default true,
    is_deleted boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

alter table public.quote_customers
    add column if not exists is_deleted boolean not null default false;

alter table public.quote_instances
    add column if not exists customer_id uuid null references public.quote_customers(id) on delete set null;

alter table public.quote_instances
    add column if not exists customer_snapshot jsonb not null default '{}'::jsonb;

alter table public.quote_instances
    add column if not exists archived_at timestamptz null;

alter table public.quote_instances
    add column if not exists archived_by uuid null;

alter table public.quote_instances
    add column if not exists last_active_status text not null default 'draft';

do $$
begin
    if exists (
        select 1
        from pg_constraint
        where conrelid = 'public.quote_instances'::regclass
          and conname = 'quote_instances_status_check'
    ) then
        alter table public.quote_instances
            drop constraint quote_instances_status_check;
    end if;
end;
$$;

alter table public.quote_instances
    add constraint quote_instances_status_check
        check (status in ('draft', 'published', 'archived'));

do $$
begin
    if exists (
        select 1
        from pg_constraint
        where conrelid = 'public.quote_instances'::regclass
          and conname = 'quote_instances_last_active_status_check'
    ) then
        alter table public.quote_instances
            drop constraint quote_instances_last_active_status_check;
    end if;
end;
$$;

alter table public.quote_instances
    add constraint quote_instances_last_active_status_check
        check (last_active_status in ('draft', 'published'));

create table if not exists public.quote_instance_events (
    id uuid primary key default gen_random_uuid(),
    instance_id uuid not null references public.quote_instances(id) on delete cascade,
    customer_id uuid null references public.quote_customers(id) on delete set null,
    event_type text not null
        check (event_type in ('share_link_generated', 'quote_viewed', 'share_opened', 'preview_opened', 'passcode_unlocked', 'email_clicked')),
    access_mode text not null default 'quote'
        check (access_mode in ('quote', 'share', 'preview', 'admin')),
    viewer_email text not null default '',
    viewer_user_id uuid null,
    viewer_label text not null default '',
    share_token_hash text not null default '',
    share_expires_at timestamptz null,
    user_agent text not null default '',
    referrer_url text not null default '',
    page_url text not null default '',
    locale text not null default 'zh',
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists quote_customers_email_unique_idx
    on public.quote_customers (lower(email))
    where nullif(trim(email), '') is not null;

create index if not exists quote_customers_company_idx
    on public.quote_customers (is_active, company_name, contact_name);

create index if not exists quote_customers_deleted_idx
    on public.quote_customers (is_deleted, is_active, company_name, contact_name);

create index if not exists quote_instances_customer_idx
    on public.quote_instances (customer_id, status, updated_at desc);

create index if not exists quote_instance_events_instance_idx
    on public.quote_instance_events (instance_id, created_at desc);

create index if not exists quote_instance_events_customer_idx
    on public.quote_instance_events (customer_id, created_at desc);

create index if not exists quote_instance_events_type_idx
    on public.quote_instance_events (event_type, access_mode, created_at desc);

drop trigger if exists trg_quote_customers_updated_at on public.quote_customers;
create trigger trg_quote_customers_updated_at
before update on public.quote_customers
for each row
execute function public.set_quote_updated_at();

alter table public.quote_customers enable row level security;
alter table public.quote_instance_events enable row level security;

drop policy if exists "quote_customers_admin_all" on public.quote_customers;
create policy "quote_customers_admin_all"
on public.quote_customers
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "quote_instance_events_admin_read" on public.quote_instance_events;
create policy "quote_instance_events_admin_read"
on public.quote_instance_events
for select
to authenticated
using (public.is_active_admin_user());

drop policy if exists "quote_instance_events_public_insert" on public.quote_instance_events;
create policy "quote_instance_events_public_insert"
on public.quote_instance_events
for insert
to anon, authenticated
with check (
    instance_id is not null
    and event_type in ('share_link_generated', 'quote_viewed', 'share_opened', 'preview_opened', 'passcode_unlocked', 'email_clicked')
    and access_mode in ('quote', 'share', 'preview', 'admin')
);
