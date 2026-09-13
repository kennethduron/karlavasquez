/* eslint-disable @typescript-eslint/no-require-imports */
const { getApp, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { Timestamp, getFirestore } = require("firebase-admin/firestore");

module.exports = async function globalSetup() {
  const app = getApps().length
    ? getApp()
    : initializeApp({ projectId: "knv-local" });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const email = "lawyer@knv.test";

  try {
    const existing = await auth.getUserByEmail(email);
    await auth.deleteUser(existing.uid);
  } catch {
    // A missing emulator identity is the expected first-run state.
  }

  const user = await auth.createUser({
    uid: "lawyer-e2e",
    email,
    password: "Legal-Segura-2026!",
    displayName: "Abogada de Prueba",
  });
  const permissions = [
    "dashboard.view",
    "cases.view",
    "cases.edit",
    "documents.view",
  ];
  await auth.setCustomUserClaims(user.uid, {
    roleKeys: ["lawyer"],
    permissionVersion: 1,
    administrator: false,
  });
  await db.collection("roles").doc("lawyer").set({
    name: "Abogado",
    permissionKeys: permissions,
    version: 1,
  });
  await db
    .collection("users")
    .doc(user.uid)
    .set({
      email,
      displayName: "Abogada de Prueba",
      status: "active",
      roleKeys: ["lawyer"],
      effectivePermissions: permissions,
      permissionVersion: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

  await auth.createUser({
    uid: "disabled-e2e",
    email: "disabled@knv.test",
    password: "Legal-Segura-2026!",
    disabled: true,
  });
};
