import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import type { AuditEvent } from "@/domain/audit";
import type { AuditRepository } from "@/domain/repositories/audit-repository";
import { getAdminFirestore } from "@/infrastructure/firebase/admin";

const SENSITIVE_KEY =
  /(authorization|cookie|credential|document|email|name|note|password|phone|secret|token)/i;

export function sanitizeAuditMetadata(
  metadata: AuditEvent["metadata"],
): AuditEvent["metadata"] {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(
        ([key]) =>
          /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key) && !SENSITIVE_KEY.test(key),
      )
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.slice(0, 200) : value,
      ]),
  );
}

export class FirebaseAuditRepository implements AuditRepository {
  async append(event: AuditEvent): Promise<void> {
    await getAdminFirestore()
      .collection("auditLogs")
      .add({
        ...event,
        metadata: sanitizeAuditMetadata(event.metadata),
        occurredAt: Timestamp.fromDate(event.occurredAt),
      });
  }
}
