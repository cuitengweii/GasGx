create table if not exists public.quote_instance_sends (
    id uuid primary key default gen_random_uuid(),
    instance_id uuid not null references public.quote_instances(id) on delete cascade,
    customer_id uuid null references public.quote_customers(id) on delete set null,
    recipient_name text not null default '',
    recipient_email text not null default '',
    recipient_company text not null default '',
    owner_name text not null default '',
    owner_email text not null default '',
    follow_up_notes text not null default '',
    outcome_notes text not null default '',
    share_target text not null default '',
    last_channel text not null default 'share_link'
        check (last_channel in ('share_link', 'email')),
    channels jsonb not null default '[]'::jsonb,
    status text not null default 'recorded'
        check (status in ('recorded', 'generated', 'emailed', 'following_up', 'delivered', 'replied', 'failed', 'closed')),
    attempt_count integer not null default 1 check (attempt_count >= 1),
    first_sent_at timestamptz not null default timezone('utc', now()),
    last_sent_at timestamptz not null default timezone('utc', now()),
    expires_at timestamptz null,
    passcode_protected boolean not null default false,
    sender_name text not null default '',
    sender_email text not null default '',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create index if not exists quote_instance_sends_instance_idx
    on public.quote_instance_sends (instance_id, updated_at desc);

create index if not exists quote_instance_sends_customer_idx
    on public.quote_instance_sends (customer_id, updated_at desc);

create index if not exists quote_instance_sends_recipient_idx
    on public.quote_instance_sends (recipient_email, recipient_company, updated_at desc);

drop trigger if exists trg_quote_instance_sends_updated_at on public.quote_instance_sends;
create trigger trg_quote_instance_sends_updated_at
before update on public.quote_instance_sends
for each row
execute function public.set_quote_updated_at();

alter table public.quote_instance_sends enable row level security;

drop policy if exists "quote_instance_sends_admin_all" on public.quote_instance_sends;
create policy "quote_instance_sends_admin_all"
on public.quote_instance_sends
for all
to authenticated
using (public.is_active_admin_user())
with check (public.is_active_admin_user());
