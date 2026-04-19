alter table if exists public.admin_users
    add column if not exists auth_user_id uuid null,
    add column if not exists linkedin_extension_enabled boolean not null default false,
    add column if not exists linkedin_extension_plan text,
    add column if not exists linkedin_extension_enabled_at timestamptz;

create index if not exists admin_users_auth_user_id_idx
    on public.admin_users (auth_user_id)
    where auth_user_id is not null;

comment on column public.admin_users.auth_user_id is
    'Supabase auth user id used to bridge admin_users rows to public.profiles.';

comment on column public.admin_users.linkedin_extension_enabled is
    'Cached LinkedIn extension entitlement flag mirrored from public.profiles for admin console rendering.';

comment on column public.admin_users.linkedin_extension_plan is
    'Cached LinkedIn extension entitlement plan label mirrored from public.profiles.';

comment on column public.admin_users.linkedin_extension_enabled_at is
    'Cached timestamp for when the LinkedIn extension entitlement was enabled.';
