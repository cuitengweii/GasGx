alter table public.admin_users
    add column if not exists role text not null default 'admin';

do $$
begin
    if exists (
        select 1
        from pg_constraint
        where conrelid = 'public.admin_users'::regclass
          and conname = 'admin_users_role_check'
    ) then
        alter table public.admin_users
            drop constraint admin_users_role_check;
    end if;
end;
$$;

alter table public.admin_users
    add constraint admin_users_role_check
    check (role in ('sales', 'editor', 'admin', 'super_admin'));

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (
            select role
            from public.admin_users
            where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
              and is_active = true
            limit 1
        ),
        ''
    );
$$;

create or replace function public.is_admin_console_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.current_admin_role() in ('editor', 'admin', 'super_admin');
$$;

create or replace function public.is_quote_console_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.current_admin_role() in ('sales', 'admin', 'super_admin');
$$;

create or replace function public.is_active_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users
        where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and is_active = true
    );
$$;

create table if not exists public.quote_deals (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.quote_customers(id) on delete cascade,
    title text not null default '',
    current_stage text not null default 'requirement_capture'
        check (
            current_stage in (
                'customer_profile',
                'requirement_capture',
                'requirement_confirmed',
                'quote_draft',
                'quote_confirmed',
                'contract_signed',
                'deposit_paid',
                'production_scheduled',
                'factory_accepted',
                'balance_confirmed',
                'shipping_in_transit',
                'deployment_completed',
                'support_active'
            )
        ),
    deal_status text not null default 'active'
        check (deal_status in ('active', 'paused', 'lost', 'cancelled', 'completed')),
    owner_name text not null default '',
    owner_email text not null default '',
    primary_requirement_id uuid null references public.quote_requirements(id) on delete set null,
    primary_instance_id uuid null references public.quote_instances(id) on delete set null,
    summary text not null default '',
    next_action text not null default '',
    next_action_due_at timestamptz null,
    lost_reason text not null default '',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create table if not exists public.quote_deal_stage_records (
    id uuid primary key default gen_random_uuid(),
    deal_id uuid not null references public.quote_deals(id) on delete cascade,
    stage_key text not null
        check (
            stage_key in (
                'customer_profile',
                'requirement_capture',
                'requirement_confirmed',
                'quote_draft',
                'quote_confirmed',
                'contract_signed',
                'deposit_paid',
                'production_scheduled',
                'factory_accepted',
                'balance_confirmed',
                'shipping_in_transit',
                'deployment_completed',
                'support_active'
            )
        ),
    stage_status text not null default 'pending'
        check (stage_status in ('pending', 'active', 'completed', 'blocked')),
    planned_at timestamptz null,
    completed_at timestamptz null,
    owner_name text not null default '',
    owner_email text not null default '',
    notes text not null default '',
    meta jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

alter table public.quote_requirements
    add column if not exists deal_id uuid null references public.quote_deals(id) on delete set null;

alter table public.quote_instances
    add column if not exists deal_id uuid null references public.quote_deals(id) on delete set null;

create unique index if not exists quote_deal_stage_records_unique_idx
    on public.quote_deal_stage_records (deal_id, stage_key);

create index if not exists quote_deals_customer_idx
    on public.quote_deals (customer_id, current_stage, deal_status, updated_at desc);

create index if not exists quote_deals_owner_idx
    on public.quote_deals (owner_email, deal_status, updated_at desc);

create index if not exists quote_deal_stage_records_stage_idx
    on public.quote_deal_stage_records (stage_key, stage_status, updated_at desc);

create index if not exists quote_requirements_deal_idx
    on public.quote_requirements (deal_id, status, updated_at desc);

create index if not exists quote_instances_deal_idx
    on public.quote_instances (deal_id, status, updated_at desc);

drop trigger if exists trg_quote_deals_updated_at on public.quote_deals;
create trigger trg_quote_deals_updated_at
before update on public.quote_deals
for each row
execute function public.set_quote_updated_at();

drop trigger if exists trg_quote_deal_stage_records_updated_at on public.quote_deal_stage_records;
create trigger trg_quote_deal_stage_records_updated_at
before update on public.quote_deal_stage_records
for each row
execute function public.set_quote_updated_at();

alter table public.quote_deals enable row level security;
alter table public.quote_deal_stage_records enable row level security;

drop policy if exists "admin_users_select" on public.admin_users;
create policy "admin_users_select"
on public.admin_users
for select
to authenticated
using (public.is_admin_console_user());

drop policy if exists "admin_users_insert" on public.admin_users;
create policy "admin_users_insert"
on public.admin_users
for insert
to authenticated
with check (public.is_admin_console_user());

drop policy if exists "admin_users_update" on public.admin_users;
create policy "admin_users_update"
on public.admin_users
for update
to authenticated
using (public.is_admin_console_user())
with check (public.is_admin_console_user());

drop policy if exists "admin_users_delete" on public.admin_users;
create policy "admin_users_delete"
on public.admin_users
for delete
to authenticated
using (public.is_admin_console_user());

drop policy if exists "quote_brands_admin_all" on public.quote_brands;
create policy "quote_brands_admin_all"
on public.quote_brands
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_products_admin_all" on public.quote_products;
create policy "quote_products_admin_all"
on public.quote_products
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_product_items_admin_all" on public.quote_product_items;
create policy "quote_product_items_admin_all"
on public.quote_product_items
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_product_media_admin_all" on public.quote_product_media;
create policy "quote_product_media_admin_all"
on public.quote_product_media
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_instances_admin_all" on public.quote_instances;
create policy "quote_instances_admin_all"
on public.quote_instances
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_instance_items_admin_all" on public.quote_instance_items;
create policy "quote_instance_items_admin_all"
on public.quote_instance_items
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_customers_admin_all" on public.quote_customers;
create policy "quote_customers_admin_all"
on public.quote_customers
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_instance_events_admin_read" on public.quote_instance_events;
create policy "quote_instance_events_admin_read"
on public.quote_instance_events
for select
to authenticated
using (public.is_quote_console_user());

drop policy if exists "quote_instance_sends_admin_all" on public.quote_instance_sends;
create policy "quote_instance_sends_admin_all"
on public.quote_instance_sends
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_requirements_admin_all" on public.quote_requirements;
create policy "quote_requirements_admin_all"
on public.quote_requirements
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_deals_admin_all" on public.quote_deals;
create policy "quote_deals_admin_all"
on public.quote_deals
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_deal_stage_records_admin_all" on public.quote_deal_stage_records;
create policy "quote_deal_stage_records_admin_all"
on public.quote_deal_stage_records
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());
