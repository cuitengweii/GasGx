alter table if exists public.profiles
  add column if not exists linkedin_extension_enabled boolean not null default false,
  add column if not exists linkedin_extension_plan text,
  add column if not exists linkedin_extension_enabled_at timestamptz;

comment on column public.profiles.linkedin_extension_enabled is
  'Whether the GasGx account is allowed to use the LinkedIn Automatic Comments extension.';

comment on column public.profiles.linkedin_extension_plan is
  'Optional entitlement label shown inside the extension when the account is enabled.';

comment on column public.profiles.linkedin_extension_enabled_at is
  'Timestamp recording when LinkedIn Automatic Comments entitlement was granted.';
