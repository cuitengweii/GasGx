drop function if exists public.set_linkedin_extension_access(text, boolean, uuid);
drop function if exists public.set_linkedin_extension_access(uuid, text, boolean);

create or replace function public.set_linkedin_extension_access(
    actor_id uuid default null,
    target_email text default null,
    target_enabled boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    normalized_email text := lower(trim(coalesce(target_email, '')));
    matched_user_id uuid;
    matched_profile_id uuid;
    resolved_plan text := case when target_enabled then 'LinkedIn Automatic Comments' else null end;
    resolved_enabled_at timestamptz := case when target_enabled then timezone('utc', now()) else null end;
begin
    if not public.is_active_admin_user() then
        raise exception 'Only active admin users can manage LinkedIn extension access.';
    end if;

    if normalized_email = '' then
        raise exception 'Target email is required.';
    end if;

    select id
      into matched_user_id
      from auth.users
     where lower(email) = normalized_email
     order by created_at desc nulls last
     limit 1;

    if matched_user_id is null then
        raise exception 'No Supabase Auth account found for %.', normalized_email;
    end if;

    insert into public.profiles (
        id,
        linkedin_extension_enabled,
        linkedin_extension_plan,
        linkedin_extension_enabled_at
    )
    values (
        matched_user_id,
        target_enabled,
        resolved_plan,
        resolved_enabled_at
    )
    on conflict (id) do update
    set linkedin_extension_enabled = excluded.linkedin_extension_enabled,
        linkedin_extension_plan = excluded.linkedin_extension_plan,
        linkedin_extension_enabled_at = excluded.linkedin_extension_enabled_at;

    update public.admin_users
       set auth_user_id = matched_user_id,
           linkedin_extension_enabled = target_enabled,
           linkedin_extension_plan = resolved_plan,
           linkedin_extension_enabled_at = resolved_enabled_at,
           updated_by = coalesce(actor_id, updated_by),
           updated_at = timezone('utc', now())
     where lower(email) = normalized_email;

    select id into matched_profile_id
      from public.profiles
     where id = matched_user_id
     limit 1;

    return jsonb_build_object(
        'email', normalized_email,
        'auth_user_id', matched_user_id,
        'profile_id', matched_profile_id,
        'linkedin_extension_enabled', target_enabled,
        'linkedin_extension_plan', resolved_plan,
        'linkedin_extension_enabled_at', resolved_enabled_at
    );
end;
$$;

grant execute on function public.set_linkedin_extension_access(uuid, text, boolean) to authenticated;