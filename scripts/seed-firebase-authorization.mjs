import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { INITIAL_ROLES } from "../src/domain/authorization.ts";
import { PERMISSIONS } from "../src/lib/permissions/permissions.ts";

for (const name of [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
]) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}
if (process.env.FIREBASE_PROJECT_ID !== "knv-development") {
  throw new Error("Authorization seeding is restricted to knv-development.");
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);
const batch = db.batch();
const updatedAt = new Date();

for (const permission of PERMISSIONS) {
  batch.set(
    db.collection("permissions").doc(permission),
    {
      key: permission,
      name: permission,
      isActive: true,
      updatedAt,
    },
    { merge: true },
  );
}
for (const role of INITIAL_ROLES) {
  batch.set(
    db.collection("roles").doc(role.key),
    {
      key: role.key,
      name: role.name,
      version: role.version,
      permissionKeys: role.permissionKeys,
      isActive: true,
      updatedAt,
    },
    { merge: true },
  );
}

await batch.commit();

const [roleSnapshot, permissionSnapshot] = await Promise.all([
  db.collection("roles").get(),
  db.collection("permissions").get(),
]);
const expectedRoles = new Set(INITIAL_ROLES.map((role) => role.key));
const expectedPermissions = new Set(PERMISSIONS);
for (const role of roleSnapshot.docs) expectedRoles.delete(role.id);
for (const permission of permissionSnapshot.docs) {
  expectedPermissions.delete(permission.id);
}
if (expectedRoles.size || expectedPermissions.size) {
  throw new Error("Authorization seed verification failed.");
}

console.log(
  `Firebase authorization configured: ${INITIAL_ROLES.length} roles and ${PERMISSIONS.length} permissions verified.`,
);
