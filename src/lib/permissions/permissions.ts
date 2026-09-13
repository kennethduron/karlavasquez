export const PERMISSIONS = [
  "dashboard.view",
  "consultations.view",
  "consultations.create",
  "consultations.edit",
  "consultations.assign",
  "consultations.convert",
  "clients.view",
  "clients.create",
  "clients.edit",
  "clients.archive",
  "cases.view",
  "cases.view_all",
  "cases.create",
  "cases.edit",
  "cases.assign",
  "cases.finalize",
  "cases.archive",
  "documents.view",
  "documents.upload",
  "documents.manage",
  "tasks.view",
  "tasks.create",
  "tasks.edit",
  "events.view",
  "events.create",
  "events.edit",
  "reports.view",
  "cms.view",
  "cms.edit",
  "cms.publish",
  "users.manage",
  "roles.manage",
  "settings.manage",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function hasPermission(
  granted: readonly string[],
  required: Permission,
): boolean {
  return granted.includes("*") || granted.includes(required);
}

export function hasEveryPermission(
  granted: readonly string[],
  required: readonly Permission[],
): boolean {
  return required.every((permission) => hasPermission(granted, permission));
}
