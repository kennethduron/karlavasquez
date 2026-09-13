import "server-only";

import type { Readable } from "node:stream";
import type { ServerSession } from "@/domain/auth";
import type { AuditRepository } from "@/domain/repositories/audit-repository";
import type {
  CaseRepository,
  DocumentRepository,
} from "@/domain/repositories/business-repositories";
import { getAdminStorage } from "@/infrastructure/firebase/admin";

export class DocumentAccessError extends Error {}

export class PrivateDocumentService {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly cases: CaseRepository,
    private readonly audit: AuditRepository,
  ) {}

  async open(
    session: ServerSession,
    documentId: string,
    requestId: string,
  ): Promise<{ stream: Readable; mimeType: string; sizeBytes: number }> {
    const document = await this.documents.findById(documentId);
    const hasViewPermission =
      session.permissions.includes("*") ||
      session.permissions.includes("documents.view");
    const hasCasePermission =
      session.permissions.includes("*") ||
      session.permissions.includes("cases.view") ||
      session.permissions.includes("cases.view_all");
    let caseAllowed = false;
    if (document?.caseId) {
      const legalCase = await this.cases.findById(document.caseId);
      caseAllowed = Boolean(
        legalCase &&
        (session.permissions.includes("cases.view_all") ||
          legalCase.responsibleUserId === session.uid ||
          legalCase.assignedUserIds.includes(session.uid)),
      );
    }
    const pathParts = document?.storagePath.split("/") ?? [];
    const safePath = Boolean(
      document?.caseId &&
      pathParts.length === 4 &&
      pathParts[0] === "private-legal-documents" &&
      pathParts[1] === document.caseId &&
      pathParts[2] === document.id &&
      /^[a-zA-Z0-9_-]+$/.test(pathParts[3] ?? ""),
    );

    if (
      !document ||
      !hasViewPermission ||
      !hasCasePermission ||
      !caseAllowed ||
      !safePath
    ) {
      await this.audit.append({
        actorUid: session.uid,
        action: "document.read",
        entityType: "document",
        entityId: documentId,
        occurredAt: new Date(),
        result: "denied",
        requestId,
        metadata: {},
      });
      throw new DocumentAccessError("Document access denied");
    }

    await this.audit.append({
      actorUid: session.uid,
      action: "document.read",
      entityType: "document",
      entityId: documentId,
      occurredAt: new Date(),
      result: "success",
      requestId,
      metadata: {},
    });
    const file = getAdminStorage().bucket().file(document.storagePath);
    return {
      stream: file.createReadStream(),
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
    };
  }
}
