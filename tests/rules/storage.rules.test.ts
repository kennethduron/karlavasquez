import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let environment: RulesTestEnvironment;
const validPath = "private-legal-documents/case-a/document-a/version-a";

async function seedFirestore() {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users", "lawyer"), {
      status: "active",
      effectivePermissions: [
        "cases.view",
        "documents.view",
        "documents.upload",
        "documents.manage",
      ],
    });
    await setDoc(doc(db, "users", "outsider"), {
      status: "active",
      effectivePermissions: [
        "cases.view",
        "documents.view",
        "documents.upload",
      ],
    });
    await setDoc(doc(db, "users", "reception"), {
      status: "active",
      effectivePermissions: ["consultations.view"],
    });
    await setDoc(doc(db, "cases", "case-a"), {
      responsibleUserId: "lawyer",
      assignedUserIds: ["lawyer"],
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, "documents", "document-a"), {
      caseId: "case-a",
      clientId: "client-a",
      storagePath: validPath,
      uploadedBy: "lawyer",
      createdAt: serverTimestamp(),
    });
  });
}

function pdfMetadata() {
  return {
    contentType: "application/pdf",
    customMetadata: { caseId: "case-a", documentId: "document-a" },
  };
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "knv-local",
    firestore: { rules: readFileSync(resolve("firestore.rules"), "utf8") },
    storage: { rules: readFileSync(resolve("storage.rules"), "utf8") },
  });
});

beforeEach(async () => {
  await Promise.all([environment.clearFirestore(), environment.clearStorage()]);
  await seedFirestore();
});

afterAll(async () => {
  await environment.cleanup();
});

describe("private legal document paths", () => {
  it("denies anonymous upload and read", async () => {
    const storage = environment.unauthenticatedContext().storage();
    await assertFails(
      uploadBytes(ref(storage, validPath), new Uint8Array([1]), pdfMetadata()),
    );
    await assertFails(getBytes(ref(storage, validPath)));
  });

  it("allows an assigned lawyer to upload and read a valid PDF", async () => {
    const storage = environment.authenticatedContext("lawyer").storage();
    await assertSucceeds(
      uploadBytes(
        ref(storage, validPath),
        new Uint8Array([1, 2, 3]),
        pdfMetadata(),
      ),
    );
    await assertSucceeds(getBytes(ref(storage, validPath)));
  });

  it("denies an authenticated but unassigned user", async () => {
    const storage = environment.authenticatedContext("outsider").storage();
    await assertFails(
      uploadBytes(ref(storage, validPath), new Uint8Array([1]), pdfMetadata()),
    );
    await assertFails(getBytes(ref(storage, validPath)));
  });

  it("denies unauthorized deletion", async () => {
    const ownerStorage = environment.authenticatedContext("lawyer").storage();
    await uploadBytes(
      ref(ownerStorage, validPath),
      new Uint8Array([1]),
      pdfMetadata(),
    );
    const receptionStorage = environment
      .authenticatedContext("reception")
      .storage();
    await assertFails(deleteObject(ref(receptionStorage, validPath)));
    await assertSucceeds(deleteObject(ref(ownerStorage, validPath)));
  });

  it("rejects executable MIME types and mismatched metadata", async () => {
    const storage = environment.authenticatedContext("lawyer").storage();
    await assertFails(
      uploadBytes(ref(storage, validPath), new Uint8Array([1]), {
        contentType: "application/x-msdownload",
        customMetadata: { caseId: "case-a", documentId: "document-a" },
      }),
    );
    await assertFails(
      uploadBytes(ref(storage, validPath), new Uint8Array([1]), {
        contentType: "application/pdf",
        customMetadata: { caseId: "another-case", documentId: "document-a" },
      }),
    );
  });

  it("rejects files above the 25 MiB architecture limit", async () => {
    const storage = environment.authenticatedContext("lawyer").storage();
    const oversized = new Uint8Array(25 * 1024 * 1024 + 1);
    await assertFails(
      uploadBytes(ref(storage, validPath), oversized, pdfMetadata()),
    );
  });
});
