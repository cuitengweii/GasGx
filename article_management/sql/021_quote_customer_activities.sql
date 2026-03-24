create table if not exists public.quote_customer_activities (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.quote_customers(id) on delete cascade,
    deal_id uuid null references public.quote_deals(id) on delete set null,
    requirement_id uuid null references public.quote_requirements(id) on delete set null,
    instance_id uuid null references public.quote_instances(id) on delete set null,
    stage_key text null,
    actor_type text not null check (actor_type in ('customer', 'sales', 'system')),
    actor_id text null,
    actor_label text not null default '',
    activity_type text not null check (activity_type in ('page_view', 'button_click', 'field_change', 'status_change', 'stage_advanced', 'quote_generated', 'public_link_opened')),
    entity_type text not null check (entity_type in ('customer', 'requirement', 'quote_instance', 'deal', 'deal_stage')),
    entity_id text null,
    page_key text null,
    action_label text not null,
    detail_json jsonb not null default '{}'::jsonb,
    occurred_at timestamptz not null default timezone('utc', now()),
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quote_activity_reads (
    activity_id uuid not null references public.quote_customer_activities(id) on delete cascade,
    reader_user_id text null,
    reader_email text null,
    read_at timestamptz not null default timezone('utc', now()),
    created_at timestamptz not null default timezone('utc', now()),
    primary key (activity_id, reader_email)
);

create index if not exists quote_customer_activities_customer_idx
on public.quote_customer_activities (customer_id, occurred_at desc);

create index if not exists quote_customer_activities_deal_idx
on public.quote_customer_activities (deal_id, occurred_at desc);

create index if not exists quote_customer_activities_stage_idx
on public.quote_customer_activities (stage_key, occurred_at desc);

create index if not exists quote_customer_activities_requirement_idx
on public.quote_customer_activities (requirement_id, occurred_at desc);

create index if not exists quote_customer_activities_instance_idx
on public.quote_customer_activities (instance_id, occurred_at desc);

create index if not exists quote_customer_activities_actor_idx
on public.quote_customer_activities (actor_type, occurred_at desc);

create index if not exists quote_activity_reads_reader_idx
on public.quote_activity_reads (reader_email, read_at desc);

alter table public.quote_customer_activities enable row level security;
alter table public.quote_activity_reads enable row level security;

drop policy if exists "quote_customer_activities_admin_read" on public.quote_customer_activities;
create policy "quote_customer_activities_admin_read"
on public.quote_customer_activities
for select
to authenticated
using (public.is_quote_console_user());

drop policy if exists "quote_customer_activities_admin_write" on public.quote_customer_activities;
create policy "quote_customer_activities_admin_write"
on public.quote_customer_activities
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());

drop policy if exists "quote_customer_activities_public_insert" on public.quote_customer_activities;
create policy "quote_customer_activities_public_insert"
on public.quote_customer_activities
for insert
to anon, authenticated
with check (
    customer_id is not null
    and actor_type in ('customer', 'sales', 'system')
    and activity_type in ('page_view', 'button_click', 'field_change', 'status_change', 'stage_advanced', 'quote_generated', 'public_link_opened')
);

drop policy if exists "quote_activity_reads_admin_select" on public.quote_activity_reads;
create policy "quote_activity_reads_admin_select"
on public.quote_activity_reads
for select
to authenticated
using (public.is_quote_console_user());

drop policy if exists "quote_activity_reads_admin_write" on public.quote_activity_reads;
create policy "quote_activity_reads_admin_write"
on public.quote_activity_reads
for all
to authenticated
using (public.is_quote_console_user())
with check (public.is_quote_console_user());
