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

drop policy if exists "admin_users_select" on public.admin_users;
create policy "admin_users_select"
on public.admin_users
for select
to authenticated
using (
    public.is_admin_console_user()
    or (
        public.is_active_admin_user()
        and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
);

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
