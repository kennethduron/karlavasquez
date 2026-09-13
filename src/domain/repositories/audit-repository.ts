import type { AuditEvent } from "@/domain/audit";

export interface AuditRepository {
  append(event: AuditEvent): Promise<void>;
}
