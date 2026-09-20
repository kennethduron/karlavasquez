import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditEvent } from "@/domain/audit";
import type { AuditRepository } from "@/domain/repositories/audit-repository";

const SENSITIVE_KEY =
  /(authorization|cookie|credential|document|email|name|note|password|phone|secret|token)/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export class SupabaseAuditRepository implements AuditRepository {
  constructor(private readonly admin: SupabaseClient) {}

  async append(event: AuditEvent) {
    const { error } = await this.admin.from("audit_logs").insert({
      actor_user_id:
        event.actorUid && UUID_PATTERN.test(event.actorUid)
          ? event.actorUid
          : null,
      action: event.action,
      entity_type: event.entityType,
      entity_id:
        event.entityId && UUID_PATTERN.test(event.entityId)
          ? event.entityId
          : null,
      outcome: event.result,
      request_id: UUID_PATTERN.test(event.requestId)
        ? event.requestId
        : crypto.randomUUID(),
      metadata: sanitizeAuditMetadata(event.metadata),
      occurred_at: event.occurredAt.toISOString(),
    });
    if (error) throw new Error("Audit append failed.");
  }
}
