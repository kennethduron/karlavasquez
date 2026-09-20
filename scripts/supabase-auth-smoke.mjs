import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];
const expectedProjectRef = "oicqxuaztrzpvbpocwze";

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (new URL(url).hostname !== `${expectedProjectRef}.supabase.co`) {
  throw new Error("Supabase project mismatch.");
}

const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const createUserClient = () =>
  createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const password = `T3mp-${crypto.randomUUID()}!aA`;
const recoveredPassword = `R3covered-${crypto.randomUUID()}!aA`;
const usersToDelete = new Set();
let stage = "connectivity";
let failure;
let results;

async function createIdentity({ label, status, roleKey, orphan = false }) {
  const email = `phase-2-4b-${label}-${crypto.randomUUID()}@example.invalid`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `Usuario temporal ${label}` },
  });
  if (error || !data.user) throw error ?? new Error("Identity creation failed");
  usersToDelete.add(data.user.id);

  if (orphan) {
    const { error: deleteProfileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", data.user.id);
    if (deleteProfileError) throw deleteProfileError;
    return { email, userId: data.user.id };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ status })
    .eq("id", data.user.id);
  if (profileError) throw profileError;

  if (roleKey) {
    const { data: role, error: roleError } = await admin
      .from("roles")
      .select("id")
      .eq("key", roleKey)
      .single();
    if (roleError) throw roleError;
    const { error: membershipError } = await admin
      .from("user_roles")
      .insert({ user_id: data.user.id, role_id: role.id });
    if (membershipError) throw membershipError;
  }

  return { email, userId: data.user.id };
}

async function cleanup() {
  for (const userId of usersToDelete) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
  }
}

try {
  const { count: roleCount, error: connectivityError } = await admin
    .from("roles")
    .select("id", { count: "exact", head: true });
  if (connectivityError || !roleCount) {
    throw connectivityError ?? new Error("Reference roles are unavailable");
  }

  stage = "public-signup";
  const signupClient = createUserClient();
  const signupEmail = `phase-2-4b-signup-${crypto.randomUUID()}@example.invalid`;
  const { data: signupData, error: signupError } =
    await signupClient.auth.signUp({
      email: signupEmail,
      password,
    });
  if (signupData.user) usersToDelete.add(signupData.user.id);
  if (!signupError || signupError.code !== "signup_disabled") {
    throw new Error("Public signup is not securely disabled");
  }

  stage = "identity-fixtures";
  const active = await createIdentity({
    label: "active",
    status: "active",
    roleKey: "administrator",
  });
  const orphan = await createIdentity({ label: "orphan", orphan: true });
  const inactive = await createIdentity({
    label: "inactive",
    status: "disabled",
  });

  stage = "active-login";
  const activeClient = createUserClient();
  const { data: signedIn, error: signInError } =
    await activeClient.auth.signInWithPassword({
      email: active.email,
      password,
    });
  if (signInError || !signedIn.user || !signedIn.session) {
    throw signInError ?? new Error("Active login failed");
  }

  stage = "server-authorization";
  const { data: profile, error: authorizationError } = await activeClient
    .from("profiles")
    .select(
      "display_name,status,user_roles!user_roles_user_id_fkey(roles(key,role_permissions(permissions(key))))",
    )
    .eq("id", active.userId)
    .single();
  if (authorizationError || profile.status !== "active") {
    throw authorizationError ?? new Error("Active profile was not resolved");
  }
  if (profile.user_roles?.[0]?.roles?.key !== "administrator") {
    throw new Error("Administrator membership was not resolved");
  }
  if (!profile.user_roles[0].roles.role_permissions?.length) {
    throw new Error("Effective permissions were not resolved");
  }

  stage = "session-refresh";
  const { data: refreshed, error: refreshError } =
    await activeClient.auth.refreshSession();
  if (refreshError || !refreshed.session || !refreshed.user) {
    throw refreshError ?? new Error("Session refresh failed");
  }
  const { data: verifiedUser, error: userError } =
    await activeClient.auth.getUser();
  if (userError || verifiedUser.user?.id !== active.userId) {
    throw userError ?? new Error("Refreshed session was not verified");
  }

  stage = "orphan-denial";
  const orphanClient = createUserClient();
  const { error: orphanLoginError } =
    await orphanClient.auth.signInWithPassword({
      email: orphan.email,
      password,
    });
  if (orphanLoginError) throw orphanLoginError;
  const { data: orphanProfile, error: orphanProfileError } = await orphanClient
    .from("profiles")
    .select("id")
    .eq("id", orphan.userId)
    .maybeSingle();
  if (orphanProfileError || orphanProfile) {
    throw (
      orphanProfileError ?? new Error("Orphan identity gained profile access")
    );
  }
  await orphanClient.auth.signOut({ scope: "local" });

  stage = "inactive-denial";
  const inactiveClient = createUserClient();
  const { error: inactiveLoginError } =
    await inactiveClient.auth.signInWithPassword({
      email: inactive.email,
      password,
    });
  if (inactiveLoginError) throw inactiveLoginError;
  const { data: inactiveProfile, error: inactiveProfileError } =
    await inactiveClient
      .from("profiles")
      .select("id")
      .eq("id", inactive.userId)
      .maybeSingle();
  if (inactiveProfileError || inactiveProfile) {
    throw (
      inactiveProfileError ??
      new Error("Inactive identity gained profile access")
    );
  }
  await inactiveClient.auth.signOut({ scope: "local" });

  stage = "password-recovery";
  const { data: recoveryLink, error: recoveryLinkError } =
    await admin.auth.admin.generateLink({
      type: "recovery",
      email: active.email,
    });
  if (recoveryLinkError || !recoveryLink.properties?.hashed_token) {
    throw recoveryLinkError ?? new Error("Recovery link generation failed");
  }
  const recoveryClient = createUserClient();
  const { data: recoverySession, error: recoveryVerifyError } =
    await recoveryClient.auth.verifyOtp({
      token_hash: recoveryLink.properties.hashed_token,
      type: "recovery",
    });
  if (recoveryVerifyError || !recoverySession.session) {
    throw (
      recoveryVerifyError ?? new Error("Recovery token verification failed")
    );
  }
  const { error: passwordError } = await recoveryClient.auth.updateUser({
    password: recoveredPassword,
  });
  if (passwordError) throw passwordError;
  await recoveryClient.auth.signOut({ scope: "global" });

  const recoveredClient = createUserClient();
  const { data: recoveredLogin, error: recoveredLoginError } =
    await recoveredClient.auth.signInWithPassword({
      email: active.email,
      password: recoveredPassword,
    });
  if (recoveredLoginError || !recoveredLogin.session) {
    throw recoveredLoginError ?? new Error("Recovered login failed");
  }

  stage = "logout";
  const { error: logoutError } = await recoveredClient.auth.signOut({
    scope: "local",
  });
  if (logoutError) throw logoutError;
  const { data: loggedOutSession } = await recoveredClient.auth.getSession();
  if (loggedOutSession.session) throw new Error("Logout retained a session");

  results = {
    status: "PASS",
    projectMatch: true,
    connectivity: true,
    publicSignupDisabled: true,
    activeLogin: true,
    serverAuthorization: true,
    sessionRefresh: true,
    orphanDenied: true,
    inactiveDenied: true,
    passwordRecovery: true,
    logout: true,
    temporaryIdentities: true,
  };
} catch (error) {
  failure = {
    status: "FAIL",
    stage,
    code:
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : error instanceof Error
          ? error.name
          : "UNKNOWN",
  };
} finally {
  await cleanup();
}

if (failure) {
  console.error(JSON.stringify(failure));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results));
}
