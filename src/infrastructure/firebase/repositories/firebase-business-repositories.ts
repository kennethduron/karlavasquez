import "server-only";

import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import type {
  Client,
  Consultation,
  LegalCase,
  LegalDocument,
  LegalEvent,
  LegalTask,
  Note,
  RoleDefinition,
} from "@/domain/entities";
import type {
  CaseRepository,
  ClientRepository,
  ConsultationRepository,
  DocumentRepository,
  EventRepository,
  NoteRepository,
  RoleRepository,
  TaskRepository,
} from "@/domain/repositories/business-repositories";
import { getAdminFirestore } from "@/infrastructure/firebase/admin";

function fromFirestore<T extends { id: string }>(
  id: string,
  value: Record<string, unknown>,
): T {
  const mapped = Object.fromEntries(
    Object.entries(value).map(([key, field]) => [
      key,
      field instanceof Timestamp ? field.toDate() : field,
    ]),
  );
  return { id, ...mapped } as T;
}

function toFirestore(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, field]) => [
      key,
      field instanceof Date ? Timestamp.fromDate(field) : field,
    ]),
  );
}

abstract class FirebaseReadRepository<T extends { id: string }> {
  constructor(private readonly collectionName: string) {}

  async findById(id: string): Promise<T | null> {
    const snapshot = await getAdminFirestore()
      .collection(this.collectionName)
      .doc(id)
      .get();
    const data = snapshot.data();
    return snapshot.exists && data ? fromFirestore<T>(snapshot.id, data) : null;
  }
}

type HumanEntity = "consultation" | "client" | "case";
const prefixes: Record<HumanEntity, string> = {
  consultation: "CON",
  client: "CLI",
  case: "KNV",
};

async function createWithHumanId<T extends { id: string; humanId: string }>(
  collectionName: string,
  entity: HumanEntity,
  value: Omit<T, "id" | "humanId">,
  idempotencyKey: string,
): Promise<T> {
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
    throw new Error("A valid idempotency key is required.");
  }
  const db = getAdminFirestore();
  const year = new Date().getFullYear();
  const keyHash = createHash("sha256").update(idempotencyKey).digest("hex");
  const idempotencyRef = db
    .collection("idempotencyKeys")
    .doc(`${entity}-${keyHash}`);

  const recordId = await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(idempotencyRef);
    if (existing.exists) return existing.get("recordId") as string;

    const counterRef = db.collection("counters").doc(`${entity}-${year}`);
    const counter = await transaction.get(counterRef);
    const nextValue =
      ((counter.get("lastValue") as number | undefined) ?? 0) + 1;
    const humanId = `${prefixes[entity]}-${year}-${String(nextValue).padStart(4, "0")}`;
    const recordRef = db.collection(collectionName).doc();
    transaction.set(counterRef, {
      lastValue: nextValue,
      updatedAt: Timestamp.now(),
    });
    transaction.set(recordRef, {
      ...toFirestore(value as Record<string, unknown>),
      humanId,
    });
    transaction.set(idempotencyRef, {
      entityType: entity,
      recordId: recordRef.id,
      createdAt: Timestamp.now(),
    });
    return recordRef.id;
  });

  const snapshot = await db.collection(collectionName).doc(recordId).get();
  const data = snapshot.data();
  if (!data) throw new Error("Atomic record creation failed.");
  return fromFirestore<T>(snapshot.id, data);
}

export class FirebaseConsultationRepository
  extends FirebaseReadRepository<Consultation>
  implements ConsultationRepository
{
  constructor() {
    super("consultations");
  }
  create(value: Omit<Consultation, "id" | "humanId">, key: string) {
    return createWithHumanId<Consultation>(
      "consultations",
      "consultation",
      value,
      key,
    );
  }
}

export class FirebaseClientRepository
  extends FirebaseReadRepository<Client>
  implements ClientRepository
{
  constructor() {
    super("clients");
  }
  create(value: Omit<Client, "id" | "humanId">, key: string) {
    return createWithHumanId<Client>("clients", "client", value, key);
  }
}

export class FirebaseCaseRepository
  extends FirebaseReadRepository<LegalCase>
  implements CaseRepository
{
  constructor() {
    super("cases");
  }
  create(value: Omit<LegalCase, "id" | "humanId">, key: string) {
    return createWithHumanId<LegalCase>("cases", "case", value, key);
  }
}

export class FirebaseDocumentRepository
  extends FirebaseReadRepository<LegalDocument>
  implements DocumentRepository
{
  constructor() {
    super("documents");
  }
}
export class FirebaseTaskRepository
  extends FirebaseReadRepository<LegalTask>
  implements TaskRepository
{
  constructor() {
    super("tasks");
  }
}
export class FirebaseEventRepository
  extends FirebaseReadRepository<LegalEvent>
  implements EventRepository
{
  constructor() {
    super("events");
  }
}
export class FirebaseNoteRepository
  extends FirebaseReadRepository<Note>
  implements NoteRepository
{
  constructor() {
    super("notes");
  }
}

export class FirebaseRoleRepository implements RoleRepository {
  async findByKeys(keys: readonly string[]): Promise<RoleDefinition[]> {
    const db = getAdminFirestore();
    const snapshots = await Promise.all(
      keys.map((key) => db.collection("roles").doc(key).get()),
    );
    return snapshots.flatMap((snapshot) => {
      const data = snapshot.data();
      if (!snapshot.exists || !data) return [];
      return [
        {
          key: snapshot.id,
          name: typeof data.name === "string" ? data.name : snapshot.id,
          permissionKeys: Array.isArray(data.permissionKeys)
            ? data.permissionKeys
            : [],
          version: typeof data.version === "number" ? data.version : 0,
        },
      ];
    });
  }
}
