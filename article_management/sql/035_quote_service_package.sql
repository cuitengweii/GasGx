-- Add the service package section between main configuration and optional items.
-- Existing rows remain unchanged; the editor inserts the section by default.

alter table public.quote_product_items
    drop constraint if exists quote_product_items_section_key_check;
alter table public.quote_product_items
    add constraint quote_product_items_section_key_check
    check (section_key in ('main_config', 'service_package', 'optional_config'));

alter table public.quote_instance_items
    drop constraint if exists quote_instance_items_section_key_check;
alter table public.quote_instance_items
    add constraint quote_instance_items_section_key_check
    check (section_key in ('main_config', 'service_package', 'optional_config'));
