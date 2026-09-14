import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}

const app = initializeApp(
  {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  `knv-real-smoke-${crypto.randomUUID()}`,
);
const auth = getAuth(app);
const firestore = getFirestore(app);

async function expectDenied(label, action) {
  try {
    await action();
    throw new Error(`${label}: unexpectedly allowed`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.endsWith("unexpectedly allowed")
    ) {
      throw error;
    }
    const code =
      typeof error === "object" && error !== null ? error.code : null;
    if (code !== "permission-denied") {
      throw new Error(`${label}: expected permission-denied, received ${code}`);
    }
  }
}

const probeId = `smoke-${crypto.randomUUID()}`;
const reads = [
  "clients",
  "consultations",
  "cases",
  "documents",
  "notes",
  "auditLogs",
  "roles",
  "permissions",
];

for (const collection of reads) {
  await expectDenied(`anonymous read ${collection}`, () =>
    getDoc(doc(firestore, collection, probeId)),
  );
}

const fixturePassword = `Knv!${crypto.randomUUID()}aA1`;
const fixtureEmail = `knv-orphan-${crypto.randomUUID()}@example.invalid`;
const credential = await createUserWithEmailAndPassword(
  auth,
  fixtureEmail,
  fixturePassword,
);

try {
  for (const collection of reads) {
    await expectDenied(`orphan read ${collection}`, () =>
      getDoc(doc(firestore, collection, probeId)),
    );
  }

  await expectDenied("orphan consultation create", () =>
    setDoc(doc(firestore, "consultations", probeId), {
      createdBy: credential.user.uid,
      responsibleUserId: credential.user.uid,
    }),
  );
  await expectDenied("orphan role mutation", () =>
    setDoc(doc(firestore, "roles", probeId), { name: "Administradora" }),
  );
  await expectDenied("orphan audit mutation", () =>
    setDoc(doc(firestore, "auditLogs", probeId), { action: "forged" }),
  );
} finally {
  await deleteUser(credential.user);
}

console.log(
  `Real Firebase smoke tests passed: ${reads.length} anonymous reads, ${reads.length} orphan reads, 3 privileged writes denied; fixture removed.`,
);
