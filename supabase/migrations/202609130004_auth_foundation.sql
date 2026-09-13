-- KNV Phase 1: staff identity lifecycle, least-privilege profile updates,
-- permission DTOs and auditable authentication events.

alter table public.profiles
  add column mfa_required boolean not null default false,
  add column last_authenticated_at timestamptz;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
begin
  resolved_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(new.email, 'Usuario autorizado'), '@', 1)
  );

  if char_length(resolved_name) < 2 then
    resolved_name := 'Usuario autorizado';
  end if;

  insert into public.profiles (id, display_name, status)
  values (new.id, left(resolved_name, 120), 'invited')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

-- A staff member may edit presentation preferences but never activate their
-- own profile or opt out of an administrator-enforced MFA requirement.
revoke update on public.profiles from authenticated;
grant update (display_name, locale, timezone, avatar_path, last_seen_at)
  on public.profiles to authenticated;

create or replace function public.get_my_permissions()
returns table (permission_key text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct p.key
  from public.user_roles ur
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions p on p.id = rp.permission_id
  where ur.user_id = auth.uid() and public.is_active_user()
  order by p.key;
$$;

revoke all on function public.get_my_permissions() from public, anon;
grant execute on function public.get_my_permissions() to authenticated;

create or replace function public.record_auth_event(event_action text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_active_user() then
    raise exception 'Active authentication is required';
  end if;

  if event_action not in (
    'auth.login',
    'auth.logout',
    'auth.mfa_enrolled',
    'auth.mfa_verified',
    'auth.mfa_removed',
    'auth.password_changed'
  ) then
    raise exception 'Unsupported authentication event';
  end if;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, outcome
  ) values (
    auth.uid(), event_action, 'profile', auth.uid(), 'success'
  );

  update public.profiles
  set last_authenticated_at = case
    when event_action = 'auth.login' then now()
    else last_authenticated_at
  end
  where id = auth.uid();
end;
$$;

revoke all on function public.record_auth_event(text) from public, anon;
grant execute on function public.record_auth_event(text) to authenticated;

comment on column public.profiles.mfa_required is
  'Administrative MFA policy. Users cannot modify this column through the authenticated role.';
