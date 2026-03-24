alter table public.quote_deals
    add column if not exists is_archived boolean not null default false;

alter table public.quote_deals
    add column if not exists archived_at timestamptz null;

alter table public.quote_deals
    add column if not exists archived_by uuid null;

create index if not exists quote_deals_stage_archive_idx
    on public.quote_deals (is_archived, current_stage, deal_status, updated_at desc);
