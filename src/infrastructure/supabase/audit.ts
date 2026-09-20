import "server-only";

import { SupabaseAuditRepository } from "@/infrastructure/supabase/repositories/audit-repository";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server";

export async function appendAuthAudit(input: {
  actorUserId: string;
  action: string;
  outcome: "success" | "denied" | "failure";
  requestId?: string;
}) {
  await new SupabaseAuditRepository(createSupabaseAdminClient()).append({
    actorUid: input.actorUserId,
    action: input.action,
    entityType: "user",
    entityId: input.actorUserId,
    occurredAt: new Date(),
    result: input.outcome,
    requestId: input.requestId ?? crypto.randomUUID(),
    metadata: {},
  });
}
