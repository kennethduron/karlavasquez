"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/infrastructure/firebase/admin";
import { FirebaseAuditRepository } from "@/infrastructure/firebase/repositories/firebase-audit-repository";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(
        sessionCookie,
        true,
      );
      await getAdminAuth().revokeRefreshTokens(decoded.uid);
      await new FirebaseAuditRepository().append({
        actorUid: decoded.uid,
        action: "auth.logout",
        entityType: "user",
        entityId: decoded.uid,
        occurredAt: new Date(),
        result: "success",
        requestId: crypto.randomUUID(),
        metadata: {},
      });
    } catch {
      // Cookie cleanup must succeed even when Firebase already invalidated it.
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/iniciar-sesion");
}
