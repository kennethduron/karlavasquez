import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { roleKeys, type RoleKey, type UserProfile } from "@/domain/auth";
import type { UserRepository } from "@/domain/repositories/user-repository";

type ProfileRow = {
  id: string;
  display_name: string;
  status: UserProfile["status"];
  created_at: string;
  updated_at: string;
  user_roles: Array<{
    roles: {
      key: string;
      updated_at: string;
      role_permissions: Array<{ permissions: { key: string } | null }>;
    } | null;
  }>;
};

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly admin: SupabaseClient) {}

  async findById(id: string): Promise<UserProfile | null> {
    const [{ data, error }, authResult] = await Promise.all([
      this.admin
        .from("profiles")
        .select(
          "id,display_name,status,created_at,updated_at,user_roles!user_roles_user_id_fkey(roles(key,updated_at,role_permissions(permissions(key))))",
        )
        .eq("id", id)
        .maybeSingle(),
      this.admin.auth.admin.getUserById(id),
    ]);
    if (error) throw new Error("User profile lookup failed.");
    if (!data) return null;
    const row = data as unknown as ProfileRow;
    const validRoleKeys = new Set<string>(roleKeys);
    const roles = row.user_roles.flatMap(({ roles }) => (roles ? [roles] : []));
    return {
      id: row.id,
      email: authResult.data.user?.email ?? "",
      displayName: row.display_name,
      status: row.status,
      roleKeys: roles
        .map(({ key }) => key)
        .filter((key): key is RoleKey => validRoleKeys.has(key)),
      effectivePermissions: [
        ...new Set(
          roles.flatMap(({ role_permissions }) =>
            role_permissions.flatMap(({ permissions }) =>
              permissions ? [permissions.key] : [],
            ),
          ),
        ),
      ].sort(),
      permissionVersion: roles.reduce(
        (latest, role) =>
          Math.max(
            latest,
            Math.floor(new Date(role.updated_at).getTime() / 1000),
          ),
        1,
      ),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
