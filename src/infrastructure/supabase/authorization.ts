import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { RoleKey, ServerSession } from "@/domain/auth";

type AuthorizationRow = {
  display_name: string;
  status: string;
  user_roles: Array<{
    roles: {
      key: string;
      role_permissions: Array<{ permissions: { key: string } | null }>;
    } | null;
  }>;
};

export async function resolveSupabaseSession(
  client: SupabaseClient,
  user: User,
): Promise<ServerSession | null> {
  const { data, error } = await client
    .from("profiles")
    .select(
      "display_name,status,user_roles!user_roles_user_id_fkey(roles(key,role_permissions(permissions(key))))",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  const profile = data as unknown as AuthorizationRow;
  if (profile.status !== "active") return null;

  const roleKeys = profile.user_roles.flatMap((membership) =>
    membership.roles ? [membership.roles.key as RoleKey] : [],
  );
  const permissions = [
    ...new Set(
      profile.user_roles.flatMap(
        (membership) =>
          membership.roles?.role_permissions.flatMap((grant) =>
            grant.permissions ? [grant.permissions.key] : [],
          ) ?? [],
      ),
    ),
  ].sort();

  const { data: authSession } = await client.auth.getSession();
  return {
    uid: user.id,
    email: user.email ?? "",
    displayName: profile.display_name,
    roleKeys,
    permissions,
    expiresAt: new Date((authSession.session?.expires_at ?? 0) * 1000),
  };
}
