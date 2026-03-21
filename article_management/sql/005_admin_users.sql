create table if not exists public.admin_users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    full_name text not null default '',
    role text not null default 'admin',
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create index if not exists admin_users_active_idx
    on public.admin_users (is_active);

create or replace function public.set_admin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_admin_users_updated_at();

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select" on public.admin_users;
create policy "admin_users_select"
on public.admin_users
for select
to authenticated
using (
    exists (
        select 1
        from public.admin_users actor
        where lower(actor.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and actor.is_active = true
    )
);

drop policy if exists "admin_users_insert" on public.admin_users;
create policy "admin_users_insert"
on public.admin_users
for insert
to authenticated
with check (
    exists (
        select 1
        from public.admin_users actor
        where lower(actor.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and actor.is_active = true
    )
);

drop policy if exists "admin_users_update" on public.admin_users;
create policy "admin_users_update"
on public.admin_users
for update
to authenticated
using (
    exists (
        select 1
        from public.admin_users actor
        where lower(actor.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and actor.is_active = true
    )
)
with check (
    exists (
        select 1
        from public.admin_users actor
        where lower(actor.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and actor.is_active = true
    )
);

drop policy if exists "admin_users_delete" on public.admin_users;
create policy "admin_users_delete"
on public.admin_users
for delete
to authenticated
using (
    exists (
        select 1
        from public.admin_users actor
        where lower(actor.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and actor.is_active = true
    )
);

insert into public.admin_users (email, full_name, role, is_active)
values ('cuitengwei@gasgx.com', 'Cuitengwei', 'super_admin', true)
on conflict (email) do nothing;
