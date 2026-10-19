-- Allow product-template preview links to open without admin login.
-- Regular quote drafts remain private; published quotes keep the existing public read path.

drop policy if exists "quote_instances_public_read" on public.quote_instances;
create policy "quote_instances_public_read"
on public.quote_instances
for select
to anon, authenticated
using (
    (status = 'published' and published_snapshot is not null)
    or (
        status = 'draft'
        and coalesce(share_config ->> 'preview_source', '') = 'product_template'
    )
);

drop policy if exists "quote_instance_items_product_preview_read" on public.quote_instance_items;
create policy "quote_instance_items_product_preview_read"
on public.quote_instance_items
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.quote_instances as instance
        where instance.id = quote_instance_items.instance_id
          and instance.status = 'draft'
          and coalesce(instance.share_config ->> 'preview_source', '') = 'product_template'
    )
);
