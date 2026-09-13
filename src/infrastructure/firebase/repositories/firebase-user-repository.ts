import "server-only";

import type { UserProfile } from "@/domain/auth";
import type { UserRepository } from "@/domain/repositories/user-repository";
import { getAdminFirestore } from "@/infrastructure/firebase/admin";

function toDate(value: unknown): Date {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }
  return new Date(0);
}

export class FirebaseUserRepository implements UserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const snapshot = await getAdminFirestore()
      .collection("users")
      .doc(id)
      .get();
    if (!snapshot.exists) return null;
    const data = snapshot.data();
    if (!data) return null;
    return {
      id: snapshot.id,
      email: typeof data.email === "string" ? data.email : "",
      displayName:
        typeof data.displayName === "string" ? data.displayName : "Usuario",
      status: data.status,
      roleKeys: Array.isArray(data.roleKeys) ? data.roleKeys : [],
      effectivePermissions: Array.isArray(data.effectivePermissions)
        ? data.effectivePermissions
        : [],
      permissionVersion:
        typeof data.permissionVersion === "number" ? data.permissionVersion : 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as UserProfile;
  }
}
