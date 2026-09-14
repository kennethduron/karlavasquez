import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { expect } from "vitest";
import { FirebaseConsultationRepository } from "../../src/infrastructure/firebase/repositories/firebase-business-repositories";

const projectId = "knv-local";
let environment: RulesTestEnvironment;

const personas = {
  reception: ["consultations.view", "consultations.create"],
  assistant: [
    "consultations.view",
    "consultations.edit",
    "clients.view",
    "clients.edit",
    "cases.view",
    "cases.edit",
    "tasks.view",
    "tasks.create",
    "tasks.edit",
  ],
  lawyer: [
    "clients.view",
    "cases.view",
    "cases.create",
    "cases.edit",
    "documents.view",
  ],
  administrator: ["*"],
};

async function seed() {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const [uid, permissions] of Object.entries(personas)) {
      await setDoc(doc(db, "users", uid), {
        email: `${uid}@knv.test`,
        displayName: uid,
        status: "active",
        roleKeys: [uid],
        effectivePermissions: permissions,
        permissionVersion: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await setDoc(doc(db, "cases", "assigned-case"), {
      humanId: "KNV-2026-0001",
      clientId: "client-a",
      responsibleUserId: "lawyer",
      assignedUserIds: ["lawyer", "assistant"],
      createdBy: "administrator",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
    });
    await setDoc(doc(db, "cases", "private-case"), {
      humanId: "KNV-2026-0002",
      clientId: "client-b",
      responsibleUserId: "administrator",
      assignedUserIds: ["administrator"],
      createdBy: "administrator",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
    });
    await setDoc(doc(db, "clients", "client-a"), {
      humanId: "CLI-2026-0001",
      createdBy: "administrator",
      responsibleUserId: "lawyer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, "documents", "document-a"), {
      caseId: "assigned-case",
      clientId: "client-a",
      categoryId: "pleading",
      name: "Escrito.pdf",
      mimeType: "application/pdf",
      size: 1200,
      status: "pending_storage",
      createdBy: "lawyer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, "documents", "private-document"), {
      caseId: "private-case",
      clientId: "client-b",
      categoryId: "evidence",
      name: "Evidencia.pdf",
      mimeType: "application/pdf",
      size: 1200,
      status: "pending_storage",
      createdBy: "administrator",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, "notes", "note-a"), {
      caseId: "assigned-case",
      clientId: null,
      consultationId: null,
      authorUid: "lawyer",
      body: "Nota interna",
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, "auditLogs", "audit-a"), {
      actorUid: "administrator",
      action: "seed",
      occurredAt: serverTimestamp(),
    });
    await setDoc(doc(db, "roles", "administrator"), {
      name: "Administradora",
      permissionKeys: ["*"],
    });
    await setDoc(doc(db, "permissions", "cases.assign"), {
      description: "Asignar expedientes",
    });
  });
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(resolve("firestore.rules"), "utf8"),
    },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await seed();
});

afterAll(async () => {
  await environment.cleanup();
});

describe("anonymous attacker", () => {
  it.each([
    ["clients", "client-a"],
    ["cases", "assigned-case"],
    ["documents", "document-a"],
    ["notes", "note-a"],
    ["auditLogs", "audit-a"],
    ["users", "administrator"],
  ])("cannot read %s", async (collectionName, id) => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, collectionName, id)));
  });
});

describe("orphan authenticated identity", () => {
  it.each([
    ["clients", "client-a"],
    ["consultations", "new-consultation"],
    ["cases", "assigned-case"],
    ["auditLogs", "audit-a"],
    ["roles", "administrator"],
    ["permissions", "cases.assign"],
  ])(
    "cannot read %s without an active CRM profile",
    async (collectionName, id) => {
      const db = environment.authenticatedContext("orphan").firestore();
      await assertFails(getDoc(doc(db, collectionName, id)));
    },
  );

  it("cannot create data or grant itself administration", async () => {
    const db = environment.authenticatedContext("orphan").firestore();
    await assertFails(
      setDoc(doc(db, "consultations", "orphan-write"), {
        createdBy: "orphan",
        responsibleUserId: "orphan",
      }),
    );
    await assertFails(
      updateDoc(doc(db, "roles", "administrator"), { name: "Orphan admin" }),
    );
  });
});

describe("reception", () => {
  it("can create an assigned consultation but cannot read cases", async () => {
    const db = environment.authenticatedContext("reception").firestore();
    await assertSucceeds(
      setDoc(doc(db, "consultations", "new-consultation"), {
        humanId: "CON-2026-0003",
        createdBy: "reception",
        responsibleUserId: "reception",
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(getDoc(doc(db, "cases", "assigned-case")));
  });

  it("cannot assign a consultation to another user", async () => {
    const db = environment.authenticatedContext("reception").firestore();
    await assertFails(
      setDoc(doc(db, "consultations", "malicious-consultation"), {
        humanId: "CON-2026-0004",
        createdBy: "reception",
        responsibleUserId: "administrator",
        createdAt: serverTimestamp(),
      }),
    );
  });
});

describe("assistant", () => {
  it("can read an assigned case but not an unrelated case", async () => {
    const db = environment.authenticatedContext("assistant").firestore();
    await assertSucceeds(getDoc(doc(db, "cases", "assigned-case")));
    await assertFails(getDoc(doc(db, "cases", "private-case")));
  });
});

describe("lawyer attacks", () => {
  it("cannot switch a case to another client", async () => {
    const db = environment.authenticatedContext("lawyer").firestore();
    await assertFails(
      updateDoc(doc(db, "cases", "assigned-case"), {
        clientId: "client-b",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("cannot change assignments or privileged identity fields", async () => {
    const db = environment.authenticatedContext("lawyer").firestore();
    await assertFails(
      updateDoc(doc(db, "cases", "assigned-case"), {
        assignedUserIds: ["lawyer", "reception"],
      }),
    );
    await assertFails(
      updateDoc(doc(db, "cases", "assigned-case"), {
        humanId: "KNV-2099-9999",
      }),
    );
  });

  it("cannot change document ownership", async () => {
    const db = environment.authenticatedContext("lawyer").firestore();
    await assertFails(getDoc(doc(db, "documents", "private-document")));
    await assertFails(
      updateDoc(doc(db, "documents", "document-a"), {
        caseId: "private-case",
      }),
    );
    await assertFails(
      updateDoc(doc(db, "documents", "private-document"), {
        title: "Acceso horizontal",
      }),
    );
  });

  it("cannot modify roles, permissions or audit logs", async () => {
    const db = environment.authenticatedContext("lawyer").firestore();
    await assertFails(
      updateDoc(doc(db, "roles", "administrator"), { name: "Abogado" }),
    );
    await assertFails(
      updateDoc(doc(db, "permissions", "cases.assign"), {
        description: "Elevated",
      }),
    );
    await assertFails(
      updateDoc(doc(db, "auditLogs", "audit-a"), { action: "erased" }),
    );
    await assertFails(
      setDoc(doc(db, "auditLogs", "forged"), { action: "forged" }),
    );
  });
});

describe("administrator", () => {
  it("can administer roles and view audit records", async () => {
    const db = environment.authenticatedContext("administrator").firestore();
    await assertSucceeds(
      updateDoc(doc(db, "roles", "administrator"), { name: "Administradora" }),
    );
    await assertSucceeds(getDoc(doc(db, "auditLogs", "audit-a")));
  });

  it("still cannot edit or delete audit records through the client SDK", async () => {
    const db = environment.authenticatedContext("administrator").firestore();
    await assertFails(
      updateDoc(doc(db, "auditLogs", "audit-a"), { action: "changed" }),
    );
  });
});

describe("server-side human IDs", () => {
  it("is concurrency safe and idempotent", async () => {
    const repository = new FirebaseConsultationRepository();
    const base = {
      fullName: "Persona de prueba",
      email: "persona@example.com",
      phone: null,
      status: "new",
      responsibleUserId: "reception",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const duplicateKey = "duplicate-request-0001";
    const duplicated = await Promise.all([
      repository.create(base, duplicateKey),
      repository.create(base, duplicateKey),
    ]);
    expect(duplicated[0].id).toBe(duplicated[1].id);
    expect(duplicated[0].humanId).toBe(duplicated[1].humanId);

    const concurrent = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        repository.create(
          base,
          `concurrent-request-${String(index).padStart(4, "0")}`,
        ),
      ),
    );
    expect(new Set(concurrent.map((item) => item.humanId)).size).toBe(12);
    expect(
      concurrent.every((item) => /^CON-\d{4}-\d{4}$/.test(item.humanId)),
    ).toBe(true);
  });
});
