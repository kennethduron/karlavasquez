-- KNV Phase 0: normalized CRM, CMS and security-ready schema.
-- Apply only to a new, reviewed Supabase project. Never run blindly in production.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.record_priority as enum ('low', 'normal', 'important', 'urgent');
create type public.task_status as enum ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
create type public.event_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');
create type public.content_status as enum ('draft', 'published', 'scheduled', 'archived');
create type public.contact_method as enum ('whatsapp', 'phone', 'email');

create table public.human_id_counters (
  entity_type text not null,
  calendar_year integer not null check (calendar_year between 2020 and 9999),
  last_value bigint not null check (last_value > 0),
  primary key (entity_type, calendar_year)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 2 and 120),
  status text not null default 'active' check (status in ('invited', 'active', 'disabled')),
  locale text not null default 'es-HN',
  timezone text not null default 'America/Tegucigalpa',
  avatar_path text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id) on delete set null,
  primary key (role_id, permission_id)
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles(id) on delete set null,
  primary key (user_id, role_id)
);

create table public.practice_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.legal_services (
  id uuid primary key default gen_random_uuid(),
  practice_area_id uuid not null references public.practice_areas(id) on delete restrict,
  slug text not null,
  name text not null,
  summary text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (practice_area_id, slug),
  unique (id, practice_area_id)
);

create table public.consultation_statuses (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  sort_order integer not null,
  color_token text not null default 'neutral',
  is_terminal boolean not null default false,
  is_system boolean not null default false,
  is_active boolean not null default true
);

create table public.case_statuses (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  sort_order integer not null,
  color_token text not null default 'neutral',
  is_terminal boolean not null default false,
  is_system boolean not null default false,
  is_active boolean not null default true
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  human_id text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  search_name text not null,
  phone_original text,
  phone_normalized text,
  email_original text,
  email_normalized text,
  practice_area_id uuid not null references public.practice_areas(id) on delete restrict,
  legal_service_id uuid,
  initial_description text not null check (char_length(initial_description) between 20 and 2000),
  source text not null default 'website' check (source in ('website', 'whatsapp', 'phone', 'referral', 'manual', 'other')),
  preferred_contact_method public.contact_method,
  status_id uuid not null references public.consultation_statuses(id) on delete restrict,
  priority public.record_priority not null default 'normal',
  responsible_user_id uuid references public.profiles(id) on delete set null,
  next_action text,
  next_action_at timestamptz,
  privacy_consent boolean not null,
  privacy_consent_at timestamptz,
  privacy_policy_version text,
  submitted_ip_hash text,
  received_at timestamptz not null default now(),
  converted_client_id uuid,
  converted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultation_contact_required check (
    nullif(phone_normalized, '') is not null or nullif(email_normalized, '') is not null
  ),
  constraint consultation_consent_timestamp check (
    (privacy_consent and privacy_consent_at is not null) or
    (not privacy_consent and privacy_consent_at is null)
  ),
  constraint consultation_service_area_fk foreign key (legal_service_id, practice_area_id)
    references public.legal_services(id, practice_area_id) on delete restrict
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  human_id text not null unique,
  display_name text not null check (char_length(display_name) between 2 and 120),
  search_name text not null,
  email_original text,
  email_normalized text,
  phone_original text,
  phone_normalized text,
  primary_practice_area_id uuid references public.practice_areas(id) on delete set null,
  source_consultation_id uuid unique references public.consultations(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  responsible_user_id uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.consultations
  add constraint consultations_converted_client_fk
  foreign key (converted_client_id) references public.clients(id) on delete set null;

create unique index consultations_converted_once_idx
  on public.consultations(id, converted_client_id)
  where converted_client_id is not null;

create table public.consultation_status_history (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  from_status_id uuid references public.consultation_statuses(id) on delete restrict,
  to_status_id uuid not null references public.consultation_statuses(id) on delete restrict,
  reason text,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table public.consultation_followups (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  due_at timestamptz not null,
  method public.contact_method not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled', 'rescheduled')),
  summary text,
  responsible_user_id uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  rescheduled_from_id uuid references public.consultation_followups(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contact_type text not null check (contact_type in ('phone', 'email', 'address', 'whatsapp', 'other')),
  label text,
  value_original text not null,
  value_normalized text,
  is_primary boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color_token text not null default 'neutral',
  created_at timestamptz not null default now()
);

create table public.client_tag_links (
  client_id uuid not null references public.clients(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (client_id, tag_id)
);

create table public.client_relationships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  related_client_id uuid references public.clients(id) on delete set null,
  related_name text,
  relationship_type text not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint client_relationship_target check (
    related_client_id is not null or nullif(related_name, '') is not null
  ),
  constraint client_not_related_to_self check (client_id is distinct from related_client_id)
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  human_id text not null unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  source_consultation_id uuid references public.consultations(id) on delete set null,
  practice_area_id uuid not null references public.practice_areas(id) on delete restrict,
  legal_service_id uuid,
  title text not null check (char_length(title) between 3 and 200),
  internal_description text,
  status_id uuid not null references public.case_statuses(id) on delete restrict,
  priority public.record_priority not null default 'normal',
  responsible_user_id uuid references public.profiles(id) on delete set null,
  opened_on date not null default (now() at time zone 'America/Tegucigalpa')::date,
  closed_on date,
  next_action text,
  next_action_at timestamptz,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_close_after_open check (closed_on is null or closed_on >= opened_on),
  constraint case_service_area_fk foreign key (legal_service_id, practice_area_id)
    references public.legal_services(id, practice_area_id) on delete restrict
);

create table public.case_status_history (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  from_status_id uuid references public.case_statuses(id) on delete restrict,
  to_status_id uuid not null references public.case_statuses(id) on delete restrict,
  reason text,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table public.case_assignments (
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  assignment_role text not null default 'collaborator' check (assignment_role in ('responsible', 'collaborator', 'viewer')),
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  primary key (case_id, user_id, assigned_at)
);

create table public.case_dates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  type text not null,
  title text not null,
  starts_at timestamptz,
  date_only date,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled', 'rescheduled')),
  responsible_user_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_date_value check ((starts_at is not null) <> (date_only is not null))
);

create table public.case_contacts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  name text not null,
  relationship_to_case text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references public.consultations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  author_id uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint note_exactly_one_parent check (
    num_nonnulls(consultation_id, client_id, case_id) = 1
  )
);

create table public.document_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete restrict,
  case_id uuid references public.cases(id) on delete restrict,
  category_id uuid references public.document_categories(id) on delete set null,
  title text not null,
  confidentiality text not null default 'case_team' check (confidentiality in ('case_team', 'restricted', 'administrative')),
  status text not null default 'active' check (status in ('active', 'archived')),
  uploaded_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_parent_required check (client_id is not null or case_id is not null)
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  storage_bucket text not null default 'legal-documents'
    check (storage_bucket = 'legal-documents'),
  storage_path text not null unique check (
    storage_path ~ '^(cases|clients)/[0-9a-f-]{36}/documents/[0-9a-f-]{36}/[0-9a-f-]{36}-[^/]+$'
  ),
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create table public.document_access (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  can_view boolean not null default true,
  can_manage boolean not null default false,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (document_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 200),
  description text,
  status public.task_status not null default 'pending',
  priority public.record_priority not null default 'normal',
  due_at timestamptz,
  assigned_to uuid references public.profiles(id) on delete set null,
  consultation_id uuid references public.consultations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('consultation', 'appointment', 'meeting', 'followup', 'hearing', 'important_date', 'reminder', 'other')),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'America/Tegucigalpa',
  status public.event_status not null default 'pending',
  modality text check (modality in ('in_person', 'phone', 'video', 'other')),
  location text,
  notes text,
  responsible_user_id uuid references public.profiles(id) on delete set null,
  consultation_id uuid references public.consultations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  rescheduled_from_id uuid references public.events(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_end_after_start check (ends_at is null or ends_at >= starts_at)
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  case_date_id uuid references public.case_dates(id) on delete cascade,
  remind_at timestamptz not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email')),
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reminder_exactly_one_parent check (num_nonnulls(task_id, event_id, case_date_id) = 1)
);

create table public.contact_logs (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references public.consultations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null check (channel in ('whatsapp', 'phone', 'email', 'in_person', 'other')),
  occurred_at timestamptz not null default now(),
  summary text not null,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint contact_log_parent_required check (num_nonnulls(consultation_id, client_id, case_id) >= 1)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  action_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique check (char_length(token) between 20 and 4096),
  platform text not null default 'web' check (platform in ('web')),
  user_agent_summary text check (char_length(user_agent_summary) <= 200),
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  outcome text not null check (outcome in ('success', 'denied', 'failure')),
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint audit_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null,
  category_id uuid references public.article_categories(id) on delete set null,
  practice_area_id uuid references public.practice_areas(id) on delete set null,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  seo_title text,
  seo_description text,
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_original text,
  phone_normalized text,
  email_original text,
  email_normalized text,
  subject text not null,
  message text not null check (char_length(message) between 10 and 2000),
  privacy_consent boolean not null,
  privacy_consent_at timestamptz not null,
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'reviewed', 'linked', 'closed')),
  linked_consultation_id uuid references public.consultations(id) on delete set null,
  submitted_ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_submission_channel check (
    nullif(phone_normalized, '') is not null or nullif(email_normalized, '') is not null
  )
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, notification_type)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, status)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'Usuario invitado'),
    'invited'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger auth_user_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.next_human_id(entity text, prefix text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_year integer := extract(year from (now() at time zone 'America/Tegucigalpa'))::integer;
  next_value bigint;
begin
  if entity not in ('consultation', 'client', 'case') then
    raise exception 'Unsupported human ID entity';
  end if;

  insert into public.human_id_counters(entity_type, calendar_year, last_value)
  values (entity, current_year, 1)
  on conflict (entity_type, calendar_year)
  do update set last_value = public.human_id_counters.last_value + 1
  returning last_value into next_value;

  return prefix || '-' || current_year::text || '-' || lpad(next_value::text, 4, '0');
end;
$$;

create or replace function public.assign_human_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.human_id is null or btrim(new.human_id) = '' then
    if tg_table_name = 'consultations' then
      new.human_id := public.next_human_id('consultation', 'CON');
    elsif tg_table_name = 'clients' then
      new.human_id := public.next_human_id('client', 'CLI');
    elsif tg_table_name = 'cases' then
      new.human_id := public.next_human_id('case', 'KNV');
    end if;
  end if;
  return new;
end;
$$;

create trigger consultations_human_id before insert on public.consultations
for each row execute function public.assign_human_id();
create trigger clients_human_id before insert on public.clients
for each row execute function public.assign_human_id();
create trigger cases_human_id before insert on public.cases
for each row execute function public.assign_human_id();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'roles', 'practice_areas', 'legal_services', 'consultations',
    'clients', 'consultation_followups', 'client_contacts', 'cases', 'case_dates',
    'case_contacts', 'notes', 'documents', 'tasks', 'events', 'article_categories',
    'articles', 'site_pages', 'site_settings', 'contact_submissions',
    'system_settings', 'notification_preferences', 'push_subscriptions'
  ]
  loop
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

create index consultations_status_received_idx on public.consultations(status_id, received_at desc);
create index consultations_responsible_next_idx on public.consultations(responsible_user_id, next_action_at);
create index push_subscriptions_user_enabled_idx on public.push_subscriptions(user_id, enabled);
create index consultations_email_idx on public.consultations(email_normalized) where email_normalized is not null;
create index consultations_phone_idx on public.consultations(phone_normalized) where phone_normalized is not null;
create index consultations_search_name_trgm_idx on public.consultations using gin(search_name gin_trgm_ops);
create index clients_email_idx on public.clients(email_normalized) where email_normalized is not null;
create index clients_phone_idx on public.clients(phone_normalized) where phone_normalized is not null;
create index clients_search_name_trgm_idx on public.clients using gin(search_name gin_trgm_ops);
create index cases_client_status_idx on public.cases(client_id, status_id);
create index cases_responsible_next_idx on public.cases(responsible_user_id, next_action_at);
create index case_assignments_active_idx on public.case_assignments(user_id, case_id) where ended_at is null;
create index case_dates_upcoming_idx on public.case_dates(case_id, starts_at) where status = 'pending';
create index notes_consultation_idx on public.notes(consultation_id, created_at desc) where consultation_id is not null;
create index notes_client_idx on public.notes(client_id, created_at desc) where client_id is not null;
create index notes_case_idx on public.notes(case_id, created_at desc) where case_id is not null;
create index tasks_assignee_due_idx on public.tasks(assigned_to, status, due_at);
create index tasks_case_idx on public.tasks(case_id, status) where case_id is not null;
create index events_responsible_starts_idx on public.events(responsible_user_id, starts_at);
create index events_case_idx on public.events(case_id, starts_at) where case_id is not null;
create index reminders_pending_idx on public.reminders(remind_at) where sent_at is null and cancelled_at is null;
create index notifications_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
create index audit_entity_idx on public.audit_logs(entity_type, entity_id, occurred_at desc);
create index audit_actor_idx on public.audit_logs(actor_user_id, occurred_at desc);
create index articles_publication_idx on public.articles(status, published_at desc);

comment on table public.notes is 'Unified internal notes with exactly one owning consultation, client, or case.';
comment on table public.audit_logs is 'Append-only security and business audit trail; metadata must exclude secrets and document contents.';
comment on column public.documents.confidentiality is 'Authorization class; actual bytes remain in a private storage bucket.';
