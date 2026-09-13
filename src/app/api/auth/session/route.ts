import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth } from "@/infrastructure/firebase/admin";
import { FirebaseAuditRepository } from "@/infrastructure/firebase/repositories/firebase-audit-repository";
import { FirebaseUserRepository } from "@/infrastructure/firebase/repositories/firebase-user-repository";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/auth/session-constants";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) return false;
    return (
      process.env.NODE_ENV !== "production" || originUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function bearerToken(request: NextRequest) {
  const value = request.headers.get("authorization");
  if (!value?.startsWith("Bearer ")) return null;
  const token = value.slice(7);
  return token.length <= 10_000 ? token : null;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403 },
    );
  const idToken = bearerToken(request);
  if (!idToken)
    return NextResponse.json({ error: "Credencial ausente." }, { status: 401 });

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);
    if (Date.now() / 1000 - decoded.auth_time >= 5 * 60) {
      return NextResponse.json(
        { error: "Credencial vencida." },
        { status: 401 },
      );
    }
    const profile = await new FirebaseUserRepository().findById(decoded.uid);
    if (!profile || profile.status !== "active") {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }
    const claimedRoles = Array.isArray(decoded.roleKeys)
      ? decoded.roleKeys
      : [];
    if (
      decoded.permissionVersion !== profile.permissionVersion ||
      JSON.stringify([...claimedRoles].sort()) !==
        JSON.stringify([...profile.roleKeys].sort())
    ) {
      return NextResponse.json(
        { error: "Permisos desactualizados." },
        { status: 403 },
      );
    }
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
      priority: "high",
    });
    await new FirebaseAuditRepository().append({
      actorUid: decoded.uid,
      action: "auth.login",
      entityType: "user",
      entityId: decoded.uid,
      occurredAt: new Date(),
      result: "success",
      requestId: crypto.randomUUID(),
      metadata: {},
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Solicitud no permitida." },
      { status: 403 },
    );
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
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
      // The local cookie must still expire if the remote session is already invalid.
    }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
