import { cert, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { deleteApp, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required variable: ${name}`);
}
if (process.env.FIREBASE_PROJECT_ID !== "knv-development") {
  throw new Error("Real role smoke tests are restricted to knv-development.");
}

const publicConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const adminApp = initializeAdminApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);
const marker = crypto.randomUUID();
const password = `Knv!${crypto.randomUUID()}aA1`;
const ids = {
  assignedCase: `smoke-assigned-${marker}`,
  privateCase: `smoke-private-${marker}`,
  client: `smoke-client-${marker}`,
  assignedDocument: `smoke-document-${marker}`,
  privateDocument: `smoke-private-document-${marker}`,
  audit: `smoke-audit-${marker}`,
  role: `smoke-role-${marker}`,
  permission: `smoke-permission-${marker}`,
  consultation: `smoke-consultation-${marker}`,
};
const personas = {
  reception: [
    "consultations.view",
    "consultations.create",
    "clients.view",
    "clients.create",
  ],
  assistant: ["clients.view", "cases.view", "cases.edit"],
  lawyer: ["clients.view", "cases.view", "cases.edit", "documents.view"],
  administrator: ["*"],
};
const users = new Map();
const clientApps = [];
let checks = 0;

async function expectAllowed(label, operation) {
  try {
    await operation();
    checks += 1;
  } catch (error) {
    const code =
      typeof error === "object" && error !== null ? error.code : null;
    throw new Error(`${label}: unexpectedly denied (${code})`);
  }
}

async function expectDenied(label, operation) {
  try {
    await operation();
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
    checks += 1;
  }
}

async function clientFor(persona) {
  const app = initializeApp(publicConfig, `knv-${persona}-${marker}`);
  clientApps.push(app);
  const auth = getAuth(app);
  const user = users.get(persona);
  await signInWithEmailAndPassword(auth, user.email, password);
  return getFirestore(app);
}

async function cleanup() {
  await Promise.all(
    clientApps.map((app) => deleteApp(app).catch(() => undefined)),
  );
  const batch = adminDb.batch();
  for (const collection of ["cases", "documents"]) {
    const keys =
      collection === "cases"
        ? [ids.assignedCase, ids.privateCase]
        : [ids.assignedDocument, ids.privateDocument];
    for (const key of keys)
      batch.delete(adminDb.collection(collection).doc(key));
  }
  batch.delete(adminDb.collection("clients").doc(ids.client));
  batch.delete(adminDb.collection("auditLogs").doc(ids.audit));
  batch.delete(adminDb.collection("roles").doc(ids.role));
  batch.delete(adminDb.collection("permissions").doc(ids.permission));
  batch.delete(adminDb.collection("consultations").doc(ids.consultation));
  for (const user of users.values()) {
    batch.delete(adminDb.collection("users").doc(user.uid));
  }
  await batch.commit();
  await Promise.all(
    [...users.values()].map((user) =>
      adminAuth.deleteUser(user.uid).catch(() => undefined),
    ),
  );
}

try {
  for (const [persona, permissions] of Object.entries(personas)) {
    const user = await adminAuth.createUser({
      email: `knv-${persona}-${marker}@example.invalid`,
      password,
      emailVerified: true,
    });
    users.set(persona, { uid: user.uid, email: user.email });
    await adminAuth.setCustomUserClaims(user.uid, {
      roleKeys: [persona],
      permissionVersion: 1,
    });
    await adminDb
      .collection("users")
      .doc(user.uid)
      .set({
        email: user.email,
        displayName: `KNV ${persona} smoke`,
        status: "active",
        roleKeys: [persona],
        effectivePermissions: permissions,
        permissionVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        testFixture: true,
      });
  }

  const assistant = users.get("assistant");
  const lawyer = users.get("lawyer");
  const administrator = users.get("administrator");
  const seed = adminDb.batch();
  seed.set(adminDb.collection("clients").doc(ids.client), {
    humanId: "CLI-SMOKE",
    createdBy: administrator.uid,
    responsibleUserId: lawyer.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  seed.set(adminDb.collection("cases").doc(ids.assignedCase), {
    humanId: "KNV-SMOKE-ASSIGNED",
    clientId: ids.client,
    responsibleUserId: lawyer.uid,
    assignedUserIds: [lawyer.uid, assistant.uid],
    createdBy: administrator.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
  });
  seed.set(adminDb.collection("cases").doc(ids.privateCase), {
    humanId: "KNV-SMOKE-PRIVATE",
    clientId: ids.client,
    responsibleUserId: administrator.uid,
    assignedUserIds: [administrator.uid],
    createdBy: administrator.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
  });
  for (const [documentId, caseId] of [
    [ids.assignedDocument, ids.assignedCase],
    [ids.privateDocument, ids.privateCase],
  ]) {
    seed.set(adminDb.collection("documents").doc(documentId), {
      caseId,
      clientId: ids.client,
      categoryId: "smoke",
      name: "smoke.pdf",
      mimeType: "application/pdf",
      size: 1,
      status: "pending_storage",
      createdBy: administrator.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  seed.set(adminDb.collection("auditLogs").doc(ids.audit), {
    actorUid: administrator.uid,
    action: "smoke.seed",
    entityType: "test",
    entityId: marker,
    occurredAt: new Date(),
    result: "success",
    requestId: marker,
    metadata: {},
  });
  seed.set(adminDb.collection("roles").doc(ids.role), {
    name: "Smoke role",
    permissionKeys: [],
    version: 1,
  });
  seed.set(adminDb.collection("permissions").doc(ids.permission), {
    description: "Smoke permission",
  });
  await seed.commit();

  const receptionDb = await clientFor("reception");
  await expectAllowed("reception consultation create", () =>
    setDoc(doc(receptionDb, "consultations", ids.consultation), {
      humanId: "CON-SMOKE",
      createdBy: users.get("reception").uid,
      responsibleUserId: users.get("reception").uid,
      createdAt: serverTimestamp(),
    }),
  );
  await expectDenied("reception case read", () =>
    getDoc(doc(receptionDb, "cases", ids.assignedCase)),
  );
  await expectDenied("reception role mutation", () =>
    updateDoc(doc(receptionDb, "roles", ids.role), { name: "Escalated" }),
  );

  const assistantDb = await clientFor("assistant");
  await expectAllowed("assistant assigned case", () =>
    getDoc(doc(assistantDb, "cases", ids.assignedCase)),
  );
  await expectDenied("assistant horizontal case", () =>
    getDoc(doc(assistantDb, "cases", ids.privateCase)),
  );
  await expectDenied("assistant assignment mutation", () =>
    updateDoc(doc(assistantDb, "cases", ids.assignedCase), {
      assignedUserIds: [assistant.uid],
    }),
  );

  const lawyerDb = await clientFor("lawyer");
  await expectAllowed("lawyer assigned case", () =>
    getDoc(doc(lawyerDb, "cases", ids.assignedCase)),
  );
  await expectAllowed("lawyer assigned document", () =>
    getDoc(doc(lawyerDb, "documents", ids.assignedDocument)),
  );
  await expectDenied("lawyer horizontal case", () =>
    getDoc(doc(lawyerDb, "cases", ids.privateCase)),
  );
  await expectDenied("lawyer horizontal document", () =>
    getDoc(doc(lawyerDb, "documents", ids.privateDocument)),
  );
  await expectDenied("lawyer clientId mutation", () =>
    updateDoc(doc(lawyerDb, "cases", ids.assignedCase), {
      clientId: ids.privateCase,
    }),
  );
  await expectDenied("lawyer permission mutation", () =>
    updateDoc(doc(lawyerDb, "permissions", ids.permission), {
      description: "Escalated",
    }),
  );
  await expectDenied("lawyer audit mutation", () =>
    updateDoc(doc(lawyerDb, "auditLogs", ids.audit), {
      action: "forged",
    }),
  );

  const administratorDb = await clientFor("administrator");
  await expectAllowed("administrator private case", () =>
    getDoc(doc(administratorDb, "cases", ids.privateCase)),
  );
  await expectAllowed("administrator audit read", () =>
    getDoc(doc(administratorDb, "auditLogs", ids.audit)),
  );
  await expectAllowed("administrator role update", () =>
    updateDoc(doc(administratorDb, "roles", ids.role), {
      name: "Smoke role updated",
    }),
  );
  await expectDenied("administrator audit update", () =>
    updateDoc(doc(administratorDb, "auditLogs", ids.audit), {
      action: "changed",
    }),
  );

  console.log(
    `Real role/permission smoke passed: ${checks} authorized and denied boundary checks; all fixtures removed.`,
  );
} finally {
  await cleanup();
}
