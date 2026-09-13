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

export async function requireUser(permission?: Permission) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  if (permission) {
    const { data: allowed, error } = await supabase.rpc("has_permission", {
      requested_permission: permission,
    });
    if (error || !allowed) throw new AuthorizationError();
  }

  return { supabase, user };
}
