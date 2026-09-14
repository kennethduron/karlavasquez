import { spawn } from "node:child_process";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}
if (process.env.FIREBASE_PROJECT_ID !== "knv-development") {
  throw new Error(
    "Real session smoke tests are restricted to knv-development.",
  );
}

const adminApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const auth = getAuth(adminApp);
const firestore = getFirestore(adminApp);
const marker = crypto.randomUUID();
const email = `knv-session-smoke-${marker}@example.invalid`;
const password = `Knv!${crypto.randomUUID()}aA1`;
const baseUrl = "http://127.0.0.1:3111";
let uid;
let server;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/iniciar-sesion`);
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }
    await wait(250);
  }
  throw new Error("Next.js test server did not become ready.");
}

async function cleanup() {
  if (server && !server.killed) server.kill();
  if (!uid) return;
  const audits = await firestore
    .collection("auditLogs")
    .where("entityId", "==", uid)
    .get();
  const batch = firestore.batch();
  for (const audit of audits.docs) batch.delete(audit.ref);
  batch.delete(firestore.collection("users").doc(uid));
  batch.delete(firestore.collection("roles").doc(`smoke-admin-${marker}`));
  await batch.commit();
  await auth.deleteUser(uid).catch(() => undefined);
}

try {
  const user = await auth.createUser({ email, password, emailVerified: true });
  uid = user.uid;
  const roleKey = `smoke-admin-${marker}`;
  await auth.setCustomUserClaims(uid, {
    roleKeys: [roleKey],
    permissionVersion: 1,
  });
  await Promise.all([
    firestore
      .collection("roles")
      .doc(roleKey)
      .set({
        name: "Administradora (smoke test)",
        permissionKeys: ["*"],
        version: 1,
        testFixture: true,
      }),
    firestore
      .collection("users")
      .doc(uid)
      .set({
        email,
        displayName: "KNV Session Smoke Test",
        status: "active",
        roleKeys: [roleKey],
        effectivePermissions: ["*"],
        permissionVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        testFixture: true,
      }),
  ]);

  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3111",
    ],
    { env: process.env, stdio: "ignore" },
  );
  await waitForServer();

  const login = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  if (!login.ok) throw new Error(`Firebase login failed with ${login.status}.`);
  const { idToken } = await login.json();

  const session = await fetch(`${baseUrl}/api/auth/session`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${idToken}`,
      origin: baseUrl,
      host: "127.0.0.1:3111",
    },
  });
  if (!session.ok) {
    const reason = await session.text();
    throw new Error(
      `Session exchange failed with ${session.status}: ${reason}`,
    );
  }
  const setCookie = session.headers.get("set-cookie");
  if (!setCookie?.includes("knv_session=") || !setCookie.includes("HttpOnly")) {
    throw new Error("Secure session cookie was not issued.");
  }
  const cookie = setCookie.split(";", 1)[0];

  const panel = await fetch(`${baseUrl}/panel`, {
    headers: { cookie },
    redirect: "manual",
  });
  if (panel.status !== 200) {
    throw new Error(`Authorized panel access failed with ${panel.status}.`);
  }

  // Firebase revocation timestamps have one-second precision. Ensure this
  // test session predates the revocation boundary instead of sharing it.
  await wait(1_100);
  const logout = await fetch(`${baseUrl}/api/auth/session`, {
    method: "DELETE",
    headers: { cookie, origin: baseUrl, host: "127.0.0.1:3111" },
  });
  if (!logout.ok) throw new Error(`Logout failed with ${logout.status}.`);
  const clearedCookie = logout.headers.get("set-cookie");
  if (
    !clearedCookie?.includes("knv_session=") ||
    !clearedCookie.includes("Max-Age=0")
  ) {
    throw new Error("Logout did not clear the local session cookie.");
  }

  const sessionCookieValue = decodeURIComponent(
    cookie.slice("knv_session=".length),
  );
  let remotelyRevoked = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await auth.verifySessionCookie(sessionCookieValue, true);
      await wait(500);
    } catch {
      remotelyRevoked = true;
      break;
    }
  }
  if (!remotelyRevoked) {
    throw new Error("Firebase did not mark the session cookie as revoked.");
  }

  const revokedPanel = await fetch(
    `${baseUrl}/panel?revocationProbe=${marker}`,
    {
      headers: { cookie },
      redirect: "manual",
    },
  );
  const redirectLocation = revokedPanel.headers.get("location");
  const streamedBody =
    revokedPanel.status === 200 ? await revokedPanel.text() : "";
  const deniedByHttpRedirect =
    [303, 307, 308].includes(revokedPanel.status) &&
    redirectLocation?.includes("/iniciar-sesion");
  const deniedByStreamedRedirect =
    revokedPanel.status === 200 && streamedBody.includes("/iniciar-sesion");
  if (!deniedByHttpRedirect && !deniedByStreamedRedirect) {
    throw new Error(
      `Revoked session remained usable (${revokedPanel.status}).`,
    );
  }

  console.log(
    "Real Firebase Admin/session smoke passed: login, ID token exchange, HttpOnly cookie, /panel, logout, revocation and cleanup.",
  );
} finally {
  await cleanup();
}
