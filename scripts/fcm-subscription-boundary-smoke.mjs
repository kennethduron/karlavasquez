import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}

const baseUrl = process.env.FCM_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = `Fcm-Test-${crypto.randomUUID()}!aA`;
const admin = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
const userIds = new Set();
const tokenHashes = new Set();

function publicClient() {
  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function createActiveUser(label) {
  const email = `phase-2-4b-fcm-${label}-${crypto.randomUUID()}@example.invalid`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `FCM test ${label}` },
  });
  if (error || !data.user) throw error ?? new Error("User creation failed");
  userIds.add(data.user.id);
  const { error: profileError } = await admin
    .from("profiles")
    .update({ status: "active" })
    .eq("id", data.user.id);
  if (profileError) throw profileError;
  return { id: data.user.id, email };
}

async function login(email) {
  const response = await fetch(`${baseUrl}/api/auth/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: baseUrl,
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Server login failed (${response.status})`);
  const values = response.headers.getSetCookie?.() ?? [];
  const cookie = values.map((value) => value.split(";", 1)[0]).join("; ");
  if (!cookie) throw new Error("Server login did not set a session cookie");
  return cookie;
}

async function routeRequest(method, cookie, body) {
  return fetch(`${baseUrl}/api/push/subscriptions`, {
    method,
    headers: {
      "content-type": "application/json",
      cookie,
      origin: baseUrl,
    },
    body: JSON.stringify(body),
  });
}

async function cleanup() {
  if (tokenHashes.size) {
    await admin
      .from("push_subscriptions")
      .delete()
      .in("token_hash", [...tokenHashes]);
  }
  for (const userId of userIds) {
    await admin.from("push_subscriptions").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
  }
}

let stage = "setup";
try {
  const owner = await createActiveUser("owner");
  const other = await createActiveUser("other");
  const fid = `fcm_${crypto.randomUUID().replaceAll("-", "")}`;
  const otherFid = `fcm_${crypto.randomUUID().replaceAll("-", "")}`;

  stage = "anonymous-direct-denial";
  const anonymous = publicClient();
  const { error: anonymousError } = await anonymous
    .from("push_subscriptions")
    .insert({ user_id: owner.id, token: fid, token_hash: "0".repeat(64) });
  if (!anonymousError) throw new Error("Anonymous direct insert succeeded");

  stage = "authenticated-direct-denial";
  const authenticated = publicClient();
  const { error: loginError } = await authenticated.auth.signInWithPassword({
    email: owner.email,
    password,
  });
  if (loginError) throw loginError;
  const { error: authenticatedError } = await authenticated
    .from("push_subscriptions")
    .insert({ user_id: owner.id, token: fid, token_hash: "1".repeat(64) });
  if (!authenticatedError)
    throw new Error("Authenticated direct insert succeeded");

  stage = "server-registration";
  const cookie = await login(owner.email);
  const registerResponse = await routeRequest("POST", cookie, {
    fid,
    userId: other.id,
    user_id: other.id,
    userAgent: "KNV controlled Phase 2.4B test",
  });
  if (!registerResponse.ok) {
    throw new Error(`Server registration failed (${registerResponse.status})`);
  }
  const { data: ownRow, error: ownLookupError } = await admin
    .from("push_subscriptions")
    .select("user_id,token_hash")
    .eq("token", fid)
    .single();
  if (ownLookupError || ownRow.user_id !== owner.id) {
    throw (
      ownLookupError ?? new Error("Server accepted a client-supplied user id")
    );
  }
  tokenHashes.add(ownRow.token_hash);

  stage = "cross-user-token-denial";
  const otherHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(otherFid),
  );
  const otherHashHex = [...new Uint8Array(otherHash)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  tokenHashes.add(otherHashHex);
  const { error: otherInsertError } = await admin
    .from("push_subscriptions")
    .insert({ user_id: other.id, token: otherFid, token_hash: otherHashHex });
  if (otherInsertError) throw otherInsertError;
  const crossUserResponse = await routeRequest("POST", cookie, {
    fid: otherFid,
  });
  if (crossUserResponse.status !== 409) {
    throw new Error(`Cross-user token returned ${crossUserResponse.status}`);
  }

  stage = "server-delete-own";
  const deleteResponse = await routeRequest("DELETE", cookie, { fid });
  if (!deleteResponse.ok) {
    throw new Error(`Server delete failed (${deleteResponse.status})`);
  }
  const { count, error: remainingError } = await admin
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("token", fid);
  if (remainingError || count !== 0) {
    throw remainingError ?? new Error("Own subscription was not deleted");
  }

  console.log(
    JSON.stringify({
      status: "PASS",
      anonymousDirectDenied: true,
      authenticatedDirectDenied: true,
      serverRegistration: true,
      clientSuppliedUserIdIgnored: true,
      crossUserTokenDenied: true,
      ownDelete: true,
      syntheticObjectsRemoved: true,
    }),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      status: "FAIL",
      stage,
      code:
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : error instanceof Error
            ? error.name
            : "UNKNOWN",
    }),
  );
  process.exitCode = 1;
} finally {
  await cleanup();
}
