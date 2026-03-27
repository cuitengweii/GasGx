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
end
$$;

alter table public.admin_users
    add constraint admin_users_role_check
    check (role in ('sales', 'pre_sales', 'after_sales', 'editor', 'admin', 'super_admin'));

create or replace function public.is_quote_console_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.current_admin_role() in ('sales', 'pre_sales', 'after_sales', 'admin', 'super_admin');
$$;
