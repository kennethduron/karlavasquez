import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const displayName = process.env.BOOTSTRAP_ADMIN_NAME?.trim();

if (!url || !serviceRoleKey || !email || !displayName) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_NAME.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) throw listError;

let user = listed.users.find((item) => item.email?.toLowerCase() === email);
if (!user) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName },
  });
  if (error) throw error;
  user = data.user;
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: user.id,
  display_name: displayName,
  status: "active",
  mfa_required: true,
});
if (profileError) throw profileError;

const { data: role, error: roleError } = await supabase
  .from("roles")
  .select("id")
  .eq("key", "administrator")
  .single();
if (roleError) throw roleError;

const { error: assignmentError } = await supabase
  .from("user_roles")
  .upsert({ user_id: user.id, role_id: role.id });
if (assignmentError) throw assignmentError;

const { error: auditError } = await supabase.from("audit_logs").insert({
  actor_user_id: null,
  action: "auth.bootstrap_administrator",
  entity_type: "profile",
  entity_id: user.id,
  outcome: "success",
});
if (auditError) throw auditError;

console.log(`Administrator invitation prepared for ${email}. MFA is required.`);
