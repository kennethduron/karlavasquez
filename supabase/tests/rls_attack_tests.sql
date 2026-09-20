begin;

create extension if not exists pgtap with schema extensions;

select plan(40);

create function pg_temp.statement_denied(command text)
returns boolean
language plpgsql
as $$
begin
  execute command;
  return false;
exception
  when insufficient_privilege or raise_exception then
    return true;
end;
$$;

create function pg_temp.unreadable_or_empty(command text)
returns boolean
language plpgsql
as $$
declare
  row_count bigint;
begin
  execute command into row_count;
  return row_count = 0;
exception
  when insufficient_privilege then
    return true;
end;
$$;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'admin@example.invalid', '', now(), '{}', '{"display_name":"Admin test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'lawyer@example.invalid', '', now(), '{}', '{"display_name":"Lawyer test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000103', 'authenticated', 'authenticated', 'assistant@example.invalid', '', now(), '{}', '{"display_name":"Assistant test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000104', 'authenticated', 'authenticated', 'reception@example.invalid', '', now(), '{}', '{"display_name":"Reception test"}', now(), now());

update public.profiles set status = 'active';

insert into public.user_roles (user_id, role_id)
select fixture.user_id, roles.id
from (values
  ('00000000-0000-0000-0000-000000000101'::uuid, 'administrator'),
  ('00000000-0000-0000-0000-000000000102'::uuid, 'lawyer'),
  ('00000000-0000-0000-0000-000000000103'::uuid, 'assistant'),
  ('00000000-0000-0000-0000-000000000104'::uuid, 'reception')
) as fixture(user_id, role_key)
join public.roles on roles.key = fixture.role_key;

insert into public.clients (id, human_id, display_name, search_name) values
  ('00000000-0000-0000-0000-000000000201', 'CLI-2026-9001', 'Client A', 'client a'),
  ('00000000-0000-0000-0000-000000000202', 'CLI-2026-9002', 'Client B', 'client b');

insert into public.cases (
  id, human_id, client_id, practice_area_id, title, status_id,
  responsible_user_id
) values
  (
    '00000000-0000-0000-0000-000000000301', 'KNV-2026-9001',
    '00000000-0000-0000-0000-000000000201',
    (select id from public.practice_areas where slug = 'derecho-civil'),
    'Case A', (select id from public.case_statuses where key = 'active'),
    '00000000-0000-0000-0000-000000000102'
  ),
  (
    '00000000-0000-0000-0000-000000000302', 'KNV-2026-9002',
    '00000000-0000-0000-0000-000000000202',
    (select id from public.practice_areas where slug = 'derecho-civil'),
    'Case B', (select id from public.case_statuses where key = 'active'),
    '00000000-0000-0000-0000-000000000101'
  );

insert into public.case_assignments (case_id, user_id, assignment_role) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102', 'responsible'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000103', 'collaborator');

insert into public.documents (id, case_id, title, uploaded_by) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', 'Document A', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000302', 'Document B', '00000000-0000-0000-0000-000000000101');

insert into public.document_versions (
  id, document_id, version_number, storage_path, original_filename,
  mime_type, size_bytes, uploaded_by
) values
  (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000401', 1,
    'cases/00000000-0000-0000-0000-000000000301/documents/00000000-0000-0000-0000-000000000401/00000000-0000-0000-0000-000000000501-test.pdf',
    'test.pdf', 'application/pdf', 4,
    '00000000-0000-0000-0000-000000000102'
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000402', 1,
    'cases/00000000-0000-0000-0000-000000000302/documents/00000000-0000-0000-0000-000000000402/00000000-0000-0000-0000-000000000502-test.pdf',
    'test.pdf', 'application/pdf', 4,
    '00000000-0000-0000-0000-000000000101'
  );

insert into public.notes (id, case_id, body, author_id) values (
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000301',
  'Non-sensitive test note',
  '00000000-0000-0000-0000-000000000102'
);

insert into public.audit_logs (
  actor_user_id, action, entity_type, entity_id, outcome, metadata
) values (
  '00000000-0000-0000-0000-000000000101',
  'test.seed', 'case', '00000000-0000-0000-0000-000000000301',
  'success', '{}'
);

select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0::bigint,
  'every public application table has RLS enabled'
);

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

select ok(pg_temp.unreadable_or_empty('select count(*) from public.clients'), 'anonymous cannot read clients');
select ok(pg_temp.unreadable_or_empty('select count(*) from public.cases'), 'anonymous cannot read cases');
select ok(pg_temp.unreadable_or_empty('select count(*) from public.documents'), 'anonymous cannot read documents');
select ok(pg_temp.unreadable_or_empty('select count(*) from public.notes'), 'anonymous cannot read notes');
select ok(pg_temp.unreadable_or_empty('select count(*) from public.audit_logs'), 'anonymous cannot read audit logs');
select ok(pg_temp.unreadable_or_empty('select count(*) from public.profiles'), 'anonymous cannot read staff profiles');
select ok(pg_temp.unreadable_or_empty($command$select count(*) from storage.objects where bucket_id = 'legal-documents'$command$), 'anonymous cannot read private objects');

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000199', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is((select count(*) from public.clients), 0::bigint, 'orphan user cannot read clients');
select is((select count(*) from public.cases), 0::bigint, 'orphan user cannot read cases');
select is((select count(*) from public.documents), 0::bigint, 'orphan user cannot read documents');
select is((select count(*) from public.audit_logs), 0::bigint, 'orphan user cannot read audit logs');
select ok(
  pg_temp.statement_denied($command$insert into public.clients (human_id, display_name, search_name) values ('CLI-2026-9999', 'Denied', 'denied')$command$),
  'orphan user cannot create clients'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000104', true);
set local role authenticated;

select is((select count(*) from public.clients), 2::bigint, 'reception can read clients');
select is((select count(*) from public.cases), 0::bigint, 'reception cannot read cases');
select is((select count(*) from public.documents), 0::bigint, 'reception cannot read documents');

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
set local role authenticated;

select is((select count(*) from public.cases where id = '00000000-0000-0000-0000-000000000301'), 1::bigint, 'assistant can read assigned case');
select is((select count(*) from public.cases where id = '00000000-0000-0000-0000-000000000302'), 0::bigint, 'assistant cannot read unassigned case');

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
set local role authenticated;

select is((select count(*) from public.cases where id = '00000000-0000-0000-0000-000000000301'), 1::bigint, 'lawyer can read assigned case');
select is((select count(*) from public.cases where id = '00000000-0000-0000-0000-000000000302'), 0::bigint, 'lawyer cannot read another case');
select ok(
  pg_temp.statement_denied($command$insert into public.case_assignments (case_id, user_id) values ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102')$command$),
  'lawyer cannot self-assign another case'
);
select ok(
  pg_temp.statement_denied($command$update public.cases set client_id = '00000000-0000-0000-0000-000000000202' where id = '00000000-0000-0000-0000-000000000301'$command$),
  'lawyer cannot change the client of a case'
);
select ok(
  pg_temp.statement_denied($command$update public.cases set responsible_user_id = '00000000-0000-0000-0000-000000000103' where id = '00000000-0000-0000-0000-000000000301'$command$),
  'lawyer cannot change the responsible user without assignment permission'
);
select ok(
  pg_temp.statement_denied($command$insert into public.roles (key, name) values ('forged', 'Forged')$command$),
  'lawyer cannot create roles'
);
update public.permissions set description = 'tampered' where key = 'roles.manage';
select isnt((select description from public.permissions where key = 'roles.manage'), 'tampered', 'lawyer cannot change permissions');
select ok(
  pg_temp.statement_denied($command$update public.audit_logs set action = 'tampered'$command$),
  'lawyer cannot update audit logs'
);
select ok(
  pg_temp.statement_denied($command$delete from public.audit_logs$command$),
  'lawyer cannot delete audit logs'
);

select ok(
  pg_temp.statement_denied(
  $command$insert into public.push_subscriptions (user_id, token) values ('00000000-0000-0000-0000-000000000102', 'test-token-lawyer-00000000000000000001')$command$,
  ),
  'authenticated users cannot register push subscriptions directly'
);
select ok(
  pg_temp.statement_denied($command$insert into public.push_subscriptions (user_id, token) values ('00000000-0000-0000-0000-000000000103', 'test-token-other-00000000000000000002')$command$),
  'user cannot register another user push subscription'
);

select lives_ok(
  $command$insert into storage.objects (bucket_id, name, owner_id) values ('legal-documents', 'cases/00000000-0000-0000-0000-000000000301/documents/00000000-0000-0000-0000-000000000401/00000000-0000-0000-0000-000000000501-test.pdf', '00000000-0000-0000-0000-000000000102')$command$,
  'authorized lawyer can upload the registered private object'
);
select is((select count(*) from storage.objects where name like '%000000000501-test.pdf'), 1::bigint, 'authorized lawyer can download the registered private object');
select ok(
  pg_temp.statement_denied($command$insert into storage.objects (bucket_id, name, owner_id) values ('legal-documents', 'cases/00000000-0000-0000-0000-000000000302/documents/00000000-0000-0000-0000-000000000402/00000000-0000-0000-0000-000000000502-test.pdf', '00000000-0000-0000-0000-000000000102')$command$),
  'lawyer cannot upload an object for another case'
);
select is((select count(*) from storage.objects where name like '%000000000502-test.pdf'), 0::bigint, 'lawyer cannot download another case object');

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
set local role authenticated;
select is(
  public.can_manage_document('00000000-0000-0000-0000-000000000401'),
  false,
  'assistant without manage permission cannot delete private object'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
set local role authenticated;
select is(
  public.can_manage_document('00000000-0000-0000-0000-000000000401'),
  true,
  'authorized lawyer is permitted to delete managed private object through Storage API'
);
select ok(
  pg_temp.statement_denied($command$insert into public.audit_logs (action, entity_type, outcome) values ('forged', 'case', 'success')$command$),
  'lawyer cannot forge audit entries'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
set local role authenticated;
select is((select count(*) from public.cases), 2::bigint, 'administrator can read all cases');
select is((select count(*) from public.audit_logs), 1::bigint, 'administrator can read audit logs');
select ok(
  pg_temp.statement_denied($command$update public.audit_logs set action = 'tampered'$command$),
  'administrator still cannot update audit logs'
);

reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
set local role authenticated;
select ok(
  pg_temp.unreadable_or_empty('select count(*) from public.push_subscriptions'),
  'users cannot read push tokens directly'
);

reset role;
select * from finish();
rollback;
