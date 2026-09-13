import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServiceRoleEnv } from "@/lib/env/server";

export function createAdminClient() {
  const parsed = getServiceRoleEnv();
  if (!parsed.success) {
    throw new Error(
      "Server-only Supabase configuration is missing or invalid.",
    );
  }

  return createClient(
    parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
