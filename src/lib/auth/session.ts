import "server-only";

import { redirect } from "next/navigation";

import type { Permission } from "@/lib/permissions/permissions";
import { createClient } from "@/lib/supabase/server";

export class AuthorizationError extends Error {
  constructor() {
    super("Permission denied");
    this.name = "AuthorizationError";
  }
}

type RoleRow = { roles: { key: string; name: string } | null };

export type AuthContext = {
  user: { id: string; email: string };
  profile: { displayName: string; mfaRequired: boolean };
  roles: Array<{ key: string; name: string }>;
  permissions: string[];
  assuranceLevel: "aal1" | "aal2" | null;
};

export async function requireAuthContext(options?: {
  permission?: Permission;
  enforceMfa?: boolean;
}): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  const [profileResult, rolesResult, permissionsResult, assuranceResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,status,mfa_required")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("roles(key,name)")
        .eq("user_id", user.id),
      supabase.rpc("get_my_permissions"),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

  const profile = profileResult.data;
  if (
    profileResult.error ||
    rolesResult.error ||
    permissionsResult.error ||
    assuranceResult.error
  ) {
    throw new Error("Unable to validate the authorization context.");
  }

  if (!profile || profile.status !== "active") {
    redirect("/iniciar-sesion?error=cuenta-inactiva");
  }

  const roles = ((rolesResult.data ?? []) as unknown as RoleRow[])
    .map((row) => row.roles)
    .filter((role): role is { key: string; name: string } => Boolean(role));
  const permissions = (permissionsResult.data ?? [])
    .map((row: { permission_key: string }) => row.permission_key)
    .filter(Boolean);

  if (options?.permission && !permissions.includes(options.permission)) {
    throw new AuthorizationError();
  }

  const mfaRequired =
    profile.mfa_required || roles.some((role) => role.key === "administrator");
  const rawAssuranceLevel = assuranceResult.data?.currentLevel;
  let assuranceLevel: "aal1" | "aal2" | null = null;
  if (rawAssuranceLevel === "aal1") assuranceLevel = "aal1";
  if (rawAssuranceLevel === "aal2") assuranceLevel = "aal2";
  if (
    options?.enforceMfa !== false &&
    mfaRequired &&
    assuranceLevel !== "aal2"
  ) {
    const { data: factors, error: factorsError } =
      await supabase.auth.mfa.listFactors();
    if (factorsError) {
      throw new Error("Unable to validate the required MFA factor.");
    }
    const hasVerifiedFactor = factors?.totp.some(
      (factor) => factor.status === "verified",
    );
    redirect(
      hasVerifiedFactor ? "/verificar-mfa" : "/panel/seguridad?configurar=1",
    );
  }

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: { displayName: profile.display_name, mfaRequired },
    roles,
    permissions,
    assuranceLevel,
  };
}
