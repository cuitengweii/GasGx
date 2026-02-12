-- Independent feeder option table for private-use/feeder.html
-- Run this in Supabase SQL Editor once.

create table if not exists public.feeder_form_options (
  id bigserial primary key,
  section text not null check (section in ('category', 'publisher', 'tag', 'secondary_tag')),
  option_id text not null,
  label_en text not null,
  label_zh text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section, option_id)
);

create index if not exists idx_feeder_form_options_section_order
on public.feeder_form_options (section, sort_order, id);

create or replace function public.set_feeder_form_options_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_feeder_form_options_updated_at on public.feeder_form_options;
create trigger trg_feeder_form_options_updated_at
before update on public.feeder_form_options
for each row execute function public.set_feeder_form_options_updated_at();

alter table public.feeder_form_options enable row level security;

drop policy if exists "Public read feeder_form_options" on public.feeder_form_options;
drop policy if exists "Public insert feeder_form_options" on public.feeder_form_options;
drop policy if exists "Public update feeder_form_options" on public.feeder_form_options;
drop policy if exists "Public delete feeder_form_options" on public.feeder_form_options;

-- NOTE: This is for internal feeder convenience. Tighten policies if needed.
create policy "Public read feeder_form_options"
on public.feeder_form_options
for select
using (true);

create policy "Public insert feeder_form_options"
on public.feeder_form_options
for insert
with check (true);

create policy "Public update feeder_form_options"
on public.feeder_form_options
for update
using (true)
with check (true);

create policy "Public delete feeder_form_options"
on public.feeder_form_options
for delete
using (true);

insert into public.feeder_form_options (section, option_id, label_en, label_zh, sort_order)
values
  ('category', 'gas-energy', 'Gas Energy', 'Gas Energy', 10),
  ('category', 'generators', 'Generators', 'Generators', 20),
  ('category', 'bitcoin-mining', 'BTC Mining', 'BTC Mining', 30),
  ('category', 'flash', 'Flash', 'Flash', 40),
  ('category', 'insights', 'Insights', 'Insights', 50),
  ('category', 'data', 'Data', 'Data', 60),
  ('category', 'events', 'Events', 'Events', 70),

  ('publisher', 'GasGx-Researcher', 'GasGx', 'GasGx', 10),
  ('publisher', 'WuShuoBlock', 'WuShuo', 'WuShuo', 20),
  ('publisher', 'Blockbeats', 'Blockbeats', 'Blockbeats', 30),
  ('publisher', 'Chaincatcher', 'ChainC.', 'ChainC.', 40),
  ('publisher', 'Panewslab', 'Panews', 'Panews', 50),
  ('publisher', 'Odaily', 'Odaily', 'Odaily', 60),
  ('publisher', 'Techflow', 'Techflow', 'Techflow', 70),
  ('publisher', 'Linkein', 'LinkedIn', 'LinkedIn', 80),
  ('publisher', 'X', 'X', 'X', 90),
  ('publisher', 'Weixin', 'Weixin', 'Weixin', 100),

  ('tag', 'Hardware', 'Hardware', 'Hardware', 10),
  ('tag', 'Policy', 'Policy', 'Policy', 20),
  ('tag', 'Finance', 'Finance', 'Finance', 30),
  ('tag', 'Tech', 'Tech', 'Tech', 40),
  ('tag', 'Market', 'Market', 'Market', 50),

  ('secondary_tag', 'Policy', 'Policy', 'Policy', 10),
  ('secondary_tag', 'Newly released', 'New Release', 'New Release', 20),
  ('secondary_tag', 'Guidance', 'Guidance', 'Guidance', 30),
  ('secondary_tag', 'Report', 'Report', 'Report', 40),
  ('secondary_tag', 'Hardware', 'Hardware', 'Hardware', 50),
  ('secondary_tag', 'Bitcoin', 'Bitcoin', 'Bitcoin', 60),
  ('secondary_tag', 'Mining', 'Mining', 'Mining', 70),
  ('secondary_tag', 'Analysis', 'Analysis', 'Analysis', 80)
on conflict (section, option_id) do update
set
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
