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

drop policy if exists "admin_users_select" on public.admin_users;
create policy "admin_users_select"
on public.admin_users
for select
to authenticated
using (public.is_active_admin_user());

drop policy if exists "admin_users_insert" on public.admin_users;
create policy "admin_users_insert"
on public.admin_users
for insert
to authenticated
with check (public.is_active_admin_user());

drop policy if exists "admin_users_update" on public.admin_users;
create policy "admin_users_update"
on public.admin_users
for update
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());

drop policy if exists "admin_users_delete" on public.admin_users;
create policy "admin_users_delete"
on public.admin_users
for delete
to authenticated
using (public.is_active_admin_user());

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
