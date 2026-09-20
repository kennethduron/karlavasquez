-- KNV Phase 2.4B: explicit API grants.
-- RLS remains the authorization boundary; grants only expose operations that
-- have corresponding policies. Anonymous access is limited to public content.

grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.practice_areas,
  public.legal_services,
  public.article_categories,
  public.articles,
  public.site_pages,
  public.site_settings
to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke all on table public.human_id_counters from anon, authenticated;
revoke insert, update, delete, truncate on table public.audit_logs from anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

revoke all on function public.next_human_id(text, text) from public, anon, authenticated;
revoke all on function public.assign_human_id() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.enforce_consultation_sensitive_update() from public, anon, authenticated;
revoke all on function public.record_consultation_status_change() from public, anon, authenticated;
revoke all on function public.enforce_case_sensitive_update() from public, anon, authenticated;
revoke all on function public.record_case_status_change() from public, anon, authenticated;
