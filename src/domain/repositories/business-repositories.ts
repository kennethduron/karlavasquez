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

export interface ConsultationRepository {
  findById(id: string): Promise<Consultation | null>;
  create(
    value: Omit<Consultation, "id" | "humanId">,
    idempotencyKey: string,
  ): Promise<Consultation>;
}
export interface ClientRepository {
  findById(id: string): Promise<Client | null>;
  create(
    value: Omit<Client, "id" | "humanId">,
    idempotencyKey: string,
  ): Promise<Client>;
}
export interface CaseRepository {
  findById(id: string): Promise<LegalCase | null>;
  create(
    value: Omit<LegalCase, "id" | "humanId">,
    idempotencyKey: string,
  ): Promise<LegalCase>;
}
export interface DocumentRepository {
  findById(id: string): Promise<LegalDocument | null>;
}
export interface DocumentBinaryStorage {
  readonly status: "available" | "deferred";
  open(storageKey: string): Promise<AsyncIterable<Uint8Array>>;
  save(
    storageKey: string,
    content: AsyncIterable<Uint8Array>,
    mimeType: string,
  ): Promise<void>;
  delete(storageKey: string): Promise<void>;
}
export interface TaskRepository {
  findById(id: string): Promise<LegalTask | null>;
}
export interface EventRepository {
  findById(id: string): Promise<LegalEvent | null>;
}
export interface NoteRepository {
  findById(id: string): Promise<Note | null>;
}
export interface RoleRepository {
  findByKeys(keys: readonly string[]): Promise<RoleDefinition[]>;
}
