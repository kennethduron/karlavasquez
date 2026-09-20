-- Phase 2.4B: push identities are bound to authenticated users by reviewed
-- server routes. Raw FCM identifiers are not readable or writable through the
-- browser Supabase client.

alter table public.push_subscriptions
  add column if not exists token_hash text;

update public.push_subscriptions
set token_hash = encode(digest(token, 'sha256'), 'hex')
where token_hash is null;

alter table public.push_subscriptions
  alter column token_hash set not null;

create unique index if not exists push_subscriptions_token_hash_idx
  on public.push_subscriptions(token_hash);

drop policy if exists push_subscriptions_self_read on public.push_subscriptions;
drop policy if exists push_subscriptions_self_create on public.push_subscriptions;
drop policy if exists push_subscriptions_self_update on public.push_subscriptions;
drop policy if exists push_subscriptions_self_delete on public.push_subscriptions;

revoke all on table public.push_subscriptions from anon, authenticated;
