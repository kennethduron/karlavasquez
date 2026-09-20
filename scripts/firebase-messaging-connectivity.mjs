import { cert, initializeApp } from "firebase-admin/app";

const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}

if (process.env.FIREBASE_PROJECT_ID !== "knv-development") {
  throw new Error("Firebase project mismatch.");
}

const credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
});
const app = initializeApp({
  credential,
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const access = await credential.getAccessToken();
if (!access.access_token || !access.expires_in) {
  throw new Error("Firebase Admin authentication failed.");
}

console.log(
  JSON.stringify({
    status: "PASS",
    projectMatch: true,
    adminAuthentication: true,
    runtime: "FCM_ONLY",
  }),
);
await app.delete();
