import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ServerSession } from "@/domain/auth";
import { getAdminAuth } from "@/infrastructure/firebase/admin";
import { FirebaseUserRepository } from "@/infrastructure/firebase/repositories/firebase-user-repository";
import { FirebaseRoleRepository } from "@/infrastructure/firebase/repositories/firebase-business-repositories";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";
import { PermissionService } from "@/services/permission-service";

export async function getServerSession(): Promise<ServerSession | null> {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!value) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(value, true);
    const profile = await new FirebaseUserRepository().findById(decoded.uid);
    if (!profile || profile.status !== "active") return null;
    const claimedRoles = Array.isArray(decoded.roleKeys)
      ? decoded.roleKeys
      : [];
    if (
      decoded.permissionVersion !== profile.permissionVersion ||
      JSON.stringify([...claimedRoles].sort()) !==
        JSON.stringify([...profile.roleKeys].sort())
    ) {
      return null;
    }
    const permissions = await new PermissionService(
      new FirebaseRoleRepository(),
    ).resolve(profile);
    return {
      uid: decoded.uid,
      email: profile.email || decoded.email || "",
      displayName: profile.displayName,
      roleKeys: profile.roleKeys,
      permissions,
      expiresAt: new Date(decoded.exp * 1000),
    };
  } catch {
    return null;
  }
}

export async function requireServerSession(): Promise<ServerSession> {
  const session = await getServerSession();
  if (!session) redirect("/iniciar-sesion");
  return session;
}
