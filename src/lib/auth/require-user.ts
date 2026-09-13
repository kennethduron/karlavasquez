import "server-only";

import type { Permission } from "@/lib/permissions/permissions";
import { requireAuthContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function requireUser(permission?: Permission) {
  const context = await requireAuthContext({ permission });
  const supabase = await createClient();
  return { supabase, user: context.user, context };
}
