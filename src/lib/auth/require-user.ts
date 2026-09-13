import "server-only";

import type { Permission } from "@/lib/permissions/permissions";
import { requireServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export class AuthorizationError extends Error {
  constructor() {
    super("Permission denied");
    this.name = "AuthorizationError";
  }
}

export async function requireUser(permission?: Permission) {
  const session = await requireServerSession();
  if (permission && !session.permissions.includes(permission)) {
    redirect("/panel/sin-permiso");
  }
  return { user: { id: session.uid, email: session.email }, session };
}
