export const roleKeys = [
  "administrator",
  "lawyer",
  "assistant",
  "reception",
] as const;
export type RoleKey = (typeof roleKeys)[number];
export type UserStatus = "invited" | "active" | "disabled";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  status: UserStatus;
  roleKeys: RoleKey[];
  effectivePermissions: string[];
  permissionVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ServerSession = {
  uid: string;
  email: string;
  displayName: string;
  roleKeys: RoleKey[];
  permissions: string[];
  expiresAt: Date;
};
