-- KNV Phase 0: database authorization, RLS, private document storage and
-- transactional consultation conversion.

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'active'
  );
$$;

create or replace function public.has_permission(requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_active_user() and exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid() and p.key = requested_permission
  );
$$;

create or replace function public.can_access_case(requested_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_permission('cases.view') and exists (
    select 1
    from public.cases c
    where c.id = requested_case_id
      and (
        public.has_permission('cases.view_all')
        or c.responsible_user_id = auth.uid()
        or exists (
          select 1 from public.case_assignments ca
          where ca.case_id = c.id and ca.user_id = auth.uid() and ca.ended_at is null
        )
      )
  );
$$;

create or replace function public.can_access_document(requested_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_permission('documents.view') and exists (
    select 1
    from public.documents d
    where d.id = requested_document_id
      and d.status = 'active'
      and (
        (d.case_id is not null and public.can_access_case(d.case_id))
        or (d.case_id is null and d.client_id is not null and public.has_permission('clients.view'))
        or exists (
          select 1 from public.document_access da
          where da.document_id = d.id
            and da.user_id = auth.uid()
            and da.can_view
            and (da.expires_at is null or da.expires_at > now())
        )
      )
  );
$$;

create or replace function public.can_manage_document(requested_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_permission('documents.manage') and exists (
    select 1
    from public.documents d
    where d.id = requested_document_id
      and (
        (d.case_id is not null and public.can_access_case(d.case_id))
        or (d.case_id is null and public.has_permission('clients.edit'))
        or exists (
          select 1 from public.document_access da
          where da.document_id = d.id
            and da.user_id = auth.uid()
            and da.can_manage
            and (da.expires_at is null or da.expires_at > now())
        )
      )
  );
$$;

revoke all on function public.next_human_id(text, text) from public, anon, authenticated;
revoke all on function public.assign_human_id() from public, anon, authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.can_access_case(uuid) to authenticated;
grant execute on function public.can_access_document(uuid) to authenticated;
grant execute on function public.can_manage_document(uuid) to authenticated;

alter table public.human_id_counters enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.practice_areas enable row level security;
alter table public.legal_services enable row level security;
alter table public.consultation_statuses enable row level security;
alter table public.case_statuses enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_status_history enable row level security;
alter table public.consultation_followups enable row level security;
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.tags enable row level security;
alter table public.client_tag_links enable row level security;
alter table public.client_relationships enable row level security;
alter table public.cases enable row level security;
alter table public.case_status_history enable row level security;
alter table public.case_assignments enable row level security;
alter table public.case_dates enable row level security;
alter table public.case_contacts enable row level security;
alter table public.notes enable row level security;
alter table public.document_categories enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_access enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.reminders enable row level security;
alter table public.contact_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.system_settings enable row level security;
alter table public.notification_preferences enable row level security;

create policy profiles_read_active_staff on public.profiles for select to authenticated
  using (public.is_active_user());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid() and public.is_active_user())
  with check (id = auth.uid() and status = 'active');

create policy roles_read_staff on public.roles for select to authenticated using (public.is_active_user());
create policy roles_manage_staff on public.roles for all to authenticated
  using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy permissions_read_staff on public.permissions for select to authenticated using (public.is_active_user());
create policy permissions_manage_staff on public.permissions for all to authenticated
  using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy role_permissions_read_staff on public.role_permissions for select to authenticated using (public.is_active_user());
create policy role_permissions_manage_staff on public.role_permissions for all to authenticated
  using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy user_roles_read_self_or_manager on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_permission('roles.manage'));
create policy user_roles_manage on public.user_roles for all to authenticated
  using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));

create policy practice_areas_public_read on public.practice_areas for select to anon, authenticated
  using (is_active or public.has_permission('cms.view'));
create policy practice_areas_manage on public.practice_areas for all to authenticated
  using (public.has_permission('cms.edit')) with check (public.has_permission('cms.edit'));
create policy legal_services_public_read on public.legal_services for select to anon, authenticated
  using (is_active or public.has_permission('cms.view'));
create policy legal_services_manage on public.legal_services for all to authenticated
  using (public.has_permission('cms.edit')) with check (public.has_permission('cms.edit'));
create policy consultation_statuses_staff_read on public.consultation_statuses for select to authenticated using (public.is_active_user());
create policy consultation_statuses_manage on public.consultation_statuses for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
create policy case_statuses_staff_read on public.case_statuses for select to authenticated using (public.is_active_user());
create policy case_statuses_manage on public.case_statuses for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

create policy consultations_read on public.consultations for select to authenticated
  using (public.has_permission('consultations.view'));
create policy consultations_create on public.consultations for insert to authenticated
  with check (public.has_permission('consultations.create'));
create policy consultations_update on public.consultations for update to authenticated
  using (public.has_permission('consultations.edit')) with check (public.has_permission('consultations.edit'));
create policy consultation_history_read on public.consultation_status_history for select to authenticated
  using (public.has_permission('consultations.view'));
create policy consultation_history_create on public.consultation_status_history for insert to authenticated
  with check (public.has_permission('consultations.edit'));
create policy consultation_followups_read on public.consultation_followups for select to authenticated
  using (public.has_permission('consultations.view'));
create policy consultation_followups_write on public.consultation_followups for all to authenticated
  using (public.has_permission('consultations.edit')) with check (public.has_permission('consultations.edit'));

create policy clients_read on public.clients for select to authenticated using (public.has_permission('clients.view'));
create policy clients_create on public.clients for insert to authenticated with check (public.has_permission('clients.create'));
create policy clients_update on public.clients for update to authenticated
  using (public.has_permission('clients.edit')) with check (public.has_permission('clients.edit'));
create policy client_contacts_read on public.client_contacts for select to authenticated using (public.has_permission('clients.view'));
create policy client_contacts_write on public.client_contacts for all to authenticated
  using (public.has_permission('clients.edit')) with check (public.has_permission('clients.edit'));
create policy tags_read on public.tags for select to authenticated using (public.has_permission('clients.view'));
create policy tags_write on public.tags for all to authenticated
  using (public.has_permission('clients.edit')) with check (public.has_permission('clients.edit'));
create policy client_tags_read on public.client_tag_links for select to authenticated using (public.has_permission('clients.view'));
create policy client_tags_write on public.client_tag_links for all to authenticated
  using (public.has_permission('clients.edit')) with check (public.has_permission('clients.edit'));
create policy client_relationships_read on public.client_relationships for select to authenticated using (public.has_permission('clients.view'));
create policy client_relationships_write on public.client_relationships for all to authenticated
  using (public.has_permission('clients.edit')) with check (public.has_permission('clients.edit'));

create policy cases_read on public.cases for select to authenticated using (public.can_access_case(id));
create policy cases_create on public.cases for insert to authenticated
  with check (public.has_permission('cases.create') and public.has_permission('clients.view'));
create policy cases_update on public.cases for update to authenticated
  using (public.can_access_case(id) and public.has_permission('cases.edit'))
  with check (public.can_access_case(id) and public.has_permission('cases.edit'));
create policy case_history_read on public.case_status_history for select to authenticated using (public.can_access_case(case_id));
create policy case_history_write on public.case_status_history for insert to authenticated
  with check (public.can_access_case(case_id) and public.has_permission('cases.edit'));
create policy case_assignments_read on public.case_assignments for select to authenticated using (public.can_access_case(case_id));
create policy case_assignments_write on public.case_assignments for all to authenticated
  using (public.has_permission('cases.assign')) with check (public.has_permission('cases.assign'));
create policy case_dates_read on public.case_dates for select to authenticated using (public.can_access_case(case_id));
create policy case_dates_write on public.case_dates for all to authenticated
  using (public.can_access_case(case_id) and public.has_permission('events.edit'))
  with check (public.can_access_case(case_id) and public.has_permission('events.create'));
create policy case_contacts_read on public.case_contacts for select to authenticated using (public.can_access_case(case_id));
create policy case_contacts_write on public.case_contacts for all to authenticated
  using (public.can_access_case(case_id) and public.has_permission('cases.edit'))
  with check (public.can_access_case(case_id) and public.has_permission('cases.edit'));

create policy notes_read on public.notes for select to authenticated using (
  (consultation_id is not null and public.has_permission('consultations.view')) or
  (client_id is not null and public.has_permission('clients.view')) or
  (case_id is not null and public.can_access_case(case_id))
);
create policy notes_create on public.notes for insert to authenticated with check (
  author_id = auth.uid() and (
    (consultation_id is not null and public.has_permission('consultations.edit')) or
    (client_id is not null and public.has_permission('clients.edit')) or
    (case_id is not null and public.can_access_case(case_id) and public.has_permission('cases.edit'))
  )
);
create policy notes_update_author_or_manager on public.notes for update to authenticated
  using (
    (author_id = auth.uid() or public.has_permission('settings.manage')) and (
      (consultation_id is not null and public.has_permission('consultations.view')) or
      (client_id is not null and public.has_permission('clients.view')) or
      (case_id is not null and public.can_access_case(case_id))
    )
  )
  with check (
    (author_id = auth.uid() or public.has_permission('settings.manage')) and (
      (consultation_id is not null and public.has_permission('consultations.edit')) or
      (client_id is not null and public.has_permission('clients.edit')) or
      (case_id is not null and public.can_access_case(case_id))
    )
  );

create policy document_categories_read on public.document_categories for select to authenticated using (public.is_active_user());
create policy document_categories_manage on public.document_categories for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
create policy documents_read on public.documents for select to authenticated using (public.can_access_document(id));
create policy documents_create on public.documents for insert to authenticated
  with check (
    public.has_permission('documents.upload') and (
      (case_id is not null and public.can_access_case(case_id)) or
      (case_id is null and client_id is not null and public.has_permission('clients.view'))
    )
  );
create policy documents_update on public.documents for update to authenticated
  using (public.can_manage_document(id)) with check (public.can_manage_document(id));
create policy document_versions_read on public.document_versions for select to authenticated
  using (public.can_access_document(document_id));
create policy document_versions_create on public.document_versions for insert to authenticated
  with check (public.has_permission('documents.upload') and public.can_access_document(document_id));
create policy document_access_read on public.document_access for select to authenticated
  using (user_id = auth.uid() or public.can_manage_document(document_id));
create policy document_access_manage on public.document_access for all to authenticated
  using (public.can_manage_document(document_id)) with check (public.can_manage_document(document_id));

create policy tasks_read on public.tasks for select to authenticated using (
  public.has_permission('tasks.view') and (
    assigned_to = auth.uid() or created_by = auth.uid() or case_id is null or public.can_access_case(case_id)
  )
);
create policy tasks_create on public.tasks for insert to authenticated
  with check (public.has_permission('tasks.create') and (case_id is null or public.can_access_case(case_id)));
create policy tasks_update on public.tasks for update to authenticated
  using (public.has_permission('tasks.edit'))
  with check (public.has_permission('tasks.edit') and (case_id is null or public.can_access_case(case_id)));
create policy events_read on public.events for select to authenticated using (
  public.has_permission('events.view') and (
    responsible_user_id = auth.uid() or case_id is null or public.can_access_case(case_id)
  )
);
create policy events_create on public.events for insert to authenticated
  with check (public.has_permission('events.create') and (case_id is null or public.can_access_case(case_id)));
create policy events_update on public.events for update to authenticated
  using (public.has_permission('events.edit'))
  with check (public.has_permission('events.edit') and (case_id is null or public.can_access_case(case_id)));
create policy reminders_read on public.reminders for select to authenticated using (recipient_user_id = auth.uid());
create policy reminders_write on public.reminders for all to authenticated
  using (recipient_user_id = auth.uid()) with check (recipient_user_id = auth.uid());
create policy contact_logs_read on public.contact_logs for select to authenticated using (
  (consultation_id is not null and public.has_permission('consultations.view')) or
  (client_id is not null and public.has_permission('clients.view')) or
  (case_id is not null and public.can_access_case(case_id))
);
create policy contact_logs_create on public.contact_logs for insert to authenticated
  with check (
    recorded_by = auth.uid() and public.is_active_user() and (
      (consultation_id is not null and public.has_permission('consultations.edit')) or
      (client_id is not null and public.has_permission('clients.edit')) or
      (case_id is not null and public.can_access_case(case_id))
    )
  );
create policy notifications_self_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_self_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy audit_read on public.audit_logs for select to authenticated using (public.has_permission('audit.view'));

create policy article_categories_public_read on public.article_categories for select to anon, authenticated using (true);
create policy article_categories_manage on public.article_categories for all to authenticated
  using (public.has_permission('cms.edit')) with check (public.has_permission('cms.edit'));
create policy articles_public_read on public.articles for select to anon, authenticated using (
  (status = 'published' and published_at <= now()) or public.has_permission('cms.view')
);
create policy articles_manage on public.articles for all to authenticated
  using (public.has_permission('cms.edit')) with check (public.has_permission('cms.edit'));
create policy site_pages_public_read on public.site_pages for select to anon, authenticated using (
  (status = 'published' and published_at <= now()) or public.has_permission('cms.view')
);
create policy site_pages_manage on public.site_pages for all to authenticated
  using (public.has_permission('cms.edit')) with check (public.has_permission('cms.edit'));
create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (
  is_public or public.has_permission('cms.view')
);
create policy site_settings_manage on public.site_settings for all to authenticated
  using (public.has_permission('cms.edit')) with check (public.has_permission('cms.edit'));
create policy contact_submissions_read on public.contact_submissions for select to authenticated
  using (public.has_permission('consultations.view'));
create policy contact_submissions_update on public.contact_submissions for update to authenticated
  using (public.has_permission('consultations.edit')) with check (public.has_permission('consultations.edit'));
create policy system_settings_read on public.system_settings for select to authenticated using (public.has_permission('settings.manage'));
create policy system_settings_manage on public.system_settings for all to authenticated
  using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
create policy notification_preferences_self on public.notification_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- The public forms do not insert directly through the anon role. A validated,
-- rate-limited server endpoint uses the server-only service role and writes an
-- audit record. This prevents RLS bypass attempts from the browser.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-legal-documents',
  'private-legal-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy private_documents_download on storage.objects for select to authenticated
using (
  bucket_id = 'private-legal-documents'
  and exists (
    select 1
    from public.document_versions dv
    where dv.storage_bucket = bucket_id
      and dv.storage_path = name
      and public.can_access_document(dv.document_id)
  )
);

create policy private_documents_manage on storage.objects for delete to authenticated
using (
  bucket_id = 'private-legal-documents'
  and exists (
    select 1
    from public.document_versions dv
    where dv.storage_bucket = bucket_id
      and dv.storage_path = name
      and public.can_manage_document(dv.document_id)
  )
);

create or replace function public.enforce_consultation_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.responsible_user_id is distinct from new.responsible_user_id
     and auth.role() is distinct from 'service_role'
     and not public.has_permission('consultations.assign') then
    raise exception 'Insufficient permission to assign consultation';
  end if;

  if old.converted_client_id is not null
     and old.converted_client_id is distinct from new.converted_client_id then
    raise exception 'Consultation conversion is immutable';
  end if;

  if old.converted_client_id is distinct from new.converted_client_id
     and auth.role() is distinct from 'service_role'
     and not public.has_permission('consultations.convert') then
    raise exception 'Insufficient permission to convert consultation';
  end if;

  if new.converted_client_id is not null and new.converted_at is null then
    raise exception 'Converted consultation requires converted_at';
  end if;

  return new;
end;
$$;

create or replace function public.record_consultation_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status_id is distinct from new.status_id then
    insert into public.consultation_status_history (
      consultation_id, from_status_id, to_status_id, changed_by
    ) values (new.id, old.status_id, new.status_id, auth.uid());

    insert into public.audit_logs (
      actor_user_id, action, entity_type, entity_id, outcome,
      metadata
    ) values (
      auth.uid(), 'consultation.status_changed', 'consultation', new.id,
      'success', jsonb_build_object('from_status_id', old.status_id, 'to_status_id', new.status_id)
    );
  end if;
  return new;
end;
$$;

create or replace function public.enforce_case_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_status_key text;
begin
  if old.responsible_user_id is distinct from new.responsible_user_id
     and auth.role() is distinct from 'service_role'
     and not public.has_permission('cases.assign') then
    raise exception 'Insufficient permission to assign case';
  end if;

  if old.status_id is distinct from new.status_id then
    select key into target_status_key from public.case_statuses where id = new.status_id;
    if target_status_key = 'finished'
       and auth.role() is distinct from 'service_role'
       and not public.has_permission('cases.finalize') then
      raise exception 'Insufficient permission to finalize case';
    end if;
    if target_status_key = 'archived'
       and auth.role() is distinct from 'service_role'
       and not public.has_permission('cases.archive') then
      raise exception 'Insufficient permission to archive case';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.record_case_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status_id is distinct from new.status_id then
    insert into public.case_status_history (
      case_id, from_status_id, to_status_id, changed_by
    ) values (new.id, old.status_id, new.status_id, auth.uid());

    insert into public.audit_logs (
      actor_user_id, action, entity_type, entity_id, outcome,
      metadata
    ) values (
      auth.uid(), 'case.status_changed', 'case', new.id, 'success',
      jsonb_build_object('from_status_id', old.status_id, 'to_status_id', new.status_id)
    );
  end if;
  return new;
end;
$$;

create trigger consultations_sensitive_update
before update on public.consultations
for each row execute function public.enforce_consultation_sensitive_update();
create trigger consultations_status_history
after update on public.consultations
for each row execute function public.record_consultation_status_change();
create trigger cases_sensitive_update
before update on public.cases
for each row execute function public.enforce_case_sensitive_update();
create trigger cases_status_history
after update on public.cases
for each row execute function public.record_case_status_change();

revoke all on function public.enforce_consultation_sensitive_update() from public, anon, authenticated;
revoke all on function public.record_consultation_status_change() from public, anon, authenticated;
revoke all on function public.enforce_case_sensitive_update() from public, anon, authenticated;
revoke all on function public.record_case_status_change() from public, anon, authenticated;

create or replace function public.convert_consultation_to_client(
  consultation_uuid uuid,
  existing_client_uuid uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  consultation_row public.consultations%rowtype;
  client_uuid uuid;
  converted_status_id uuid;
begin
  if not public.has_permission('consultations.convert')
     or not public.has_permission('clients.create')
     or not public.has_permission('clients.view') then
    raise exception 'Insufficient permission';
  end if;

  select * into consultation_row
  from public.consultations
  where id = consultation_uuid
  for update;

  if not found then
    raise exception 'Consultation not found';
  end if;

  if consultation_row.converted_client_id is not null then
    return consultation_row.converted_client_id;
  end if;

  if existing_client_uuid is not null then
    if not exists (select 1 from public.clients where id = existing_client_uuid) then
      raise exception 'Client not found';
    end if;
    client_uuid := existing_client_uuid;
  else
    insert into public.clients (
      human_id, display_name, search_name, email_original, email_normalized,
      phone_original, phone_normalized, primary_practice_area_id,
      source_consultation_id, responsible_user_id
    ) values (
      null, consultation_row.full_name, consultation_row.search_name,
      consultation_row.email_original, consultation_row.email_normalized,
      consultation_row.phone_original, consultation_row.phone_normalized,
      consultation_row.practice_area_id, consultation_row.id,
      consultation_row.responsible_user_id
    ) returning id into client_uuid;
  end if;

  select id into converted_status_id
  from public.consultation_statuses where key = 'converted' and is_active;

  if converted_status_id is null then
    raise exception 'Converted consultation status is not configured';
  end if;

  update public.consultations
  set converted_client_id = client_uuid,
      converted_at = now(),
      status_id = converted_status_id
  where id = consultation_uuid;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, outcome, metadata
  ) values (
    auth.uid(), 'consultation.convert', 'consultation', consultation_uuid,
    'success', jsonb_build_object('client_id', client_uuid)
  );

  return client_uuid;
end;
$$;

revoke all on function public.convert_consultation_to_client(uuid, uuid) from public, anon;
grant execute on function public.convert_consultation_to_client(uuid, uuid) to authenticated;

-- Audit records are append-only to application roles. Inserts occur through
-- reviewed security-definer functions, database triggers, or the service role.
revoke update, delete, truncate on public.audit_logs from anon, authenticated;
