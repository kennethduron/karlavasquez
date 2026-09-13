import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const action = process.env.STAFF_ACCOUNT_ACTION;
const email = process.env.STAFF_ACCOUNT_EMAIL?.trim().toLowerCase();
const displayName = process.env.STAFF_ACCOUNT_NAME?.trim();
const roleKey = process.env.STAFF_ACCOUNT_ROLE?.trim();

if (
  !url ||
  !serviceRoleKey ||
  !email ||
  !["invite", "disable"].includes(action)
) {
  throw new Error(
    "Set Supabase credentials, STAFF_ACCOUNT_ACTION (invite|disable), and STAFF_ACCOUNT_EMAIL.",
  );
}
if (action === "invite" && (!displayName || !roleKey)) {
  throw new Error(
    "STAFF_ACCOUNT_NAME and STAFF_ACCOUNT_ROLE are required for invitations.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    const match = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === targetEmail,
    );
    if (match) return match;
    if (data.users.length < 100) return null;
  }
}

let user = await findUserByEmail(email);

if (action === "invite") {
  if (!user) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName },
    });
    if (error) throw error;
    user = data.user;
  }

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("key", roleKey)
    .single();
  if (roleError) throw roleError;

  const mfaRequired = roleKey === "administrator";
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    status: "active",
    mfa_required: mfaRequired,
  });
  if (profileError) throw profileError;

  const { error: assignmentError } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role_id: role.id });
  if (assignmentError) throw assignmentError;

  const { error: auditError } = await supabase.from("audit_logs").insert({
    actor_user_id: null,
    action: "auth.staff_invited",
    entity_type: "profile",
    entity_id: user.id,
    outcome: "success",
    metadata: { role_key: roleKey },
  });
  if (auditError) throw auditError;
  console.log(`Invitation prepared for ${email} with role ${roleKey}.`);
}

if (action === "disable") {
  if (!user) throw new Error("The requested account does not exist.");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ status: "disabled" })
    .eq("id", user.id);
  if (profileError) throw profileError;

  const { error: authError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      ban_duration: "876000h",
    },
  );
  if (authError) throw authError;

  const { error: auditError } = await supabase.from("audit_logs").insert({
    actor_user_id: null,
    action: "auth.staff_disabled",
    entity_type: "profile",
    entity_id: user.id,
    outcome: "success",
  });
  if (auditError) throw auditError;
  console.log(`Account disabled for ${email}.`);
}
