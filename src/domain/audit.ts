export type AuditResult = "success" | "denied" | "failure";
export type AuditEvent = {
  actorUid: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  occurredAt: Date;
  result: AuditResult;
  requestId: string;
  metadata: Record<string, string | number | boolean | null>;
};
