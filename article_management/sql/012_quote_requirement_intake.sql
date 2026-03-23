create table if not exists public.quote_requirements (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid null references public.quote_customers(id) on delete set null,
    title text not null default '',
    status text not null default 'intake'
        check (status in ('intake', 'reviewing', 'quoted', 'closed')),
    requirement_type text not null default 'integrated_mining_power'
        check (requirement_type in ('power_only', 'miner_only', 'integrated_mining_power', 'unclear')),
    country text not null default '',
    answers jsonb not null default '{}'::jsonb,
    notes text not null default '',
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

alter table public.quote_instances
    add column if not exists requirement_id uuid null references public.quote_requirements(id) on delete set null;

create index if not exists quote_requirements_customer_idx
    on public.quote_requirements (customer_id, status, updated_at desc);

create index if not exists quote_requirements_type_idx
    on public.quote_requirements (requirement_type, status, updated_at desc);

create index if not exists quote_instances_requirement_idx
    on public.quote_instances (requirement_id, status, updated_at desc);

drop trigger if exists trg_quote_requirements_updated_at on public.quote_requirements;
create trigger trg_quote_requirements_updated_at
before update on public.quote_requirements
for each row
execute function public.set_quote_updated_at();

alter table public.quote_requirements enable row level security;

drop policy if exists "quote_requirements_admin_all" on public.quote_requirements;
create policy "quote_requirements_admin_all"
on public.quote_requirements
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());
