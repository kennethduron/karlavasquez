import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicSupabaseEnv } from "@/lib/env/server";

export async function createClient() {
  // Read the request-bound cookie store before validating environment values so
  // Next.js always treats callers as dynamic and never prerenders auth routes.
  const cookieStore = await cookies();
  const parsed = getPublicSupabaseEnv();
  if (!parsed.success) {
    throw new Error("Supabase public configuration is missing or invalid.");
  }

  return createServerClient(
    parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // A Server Component cannot write cookies. The proxy refreshes them.
          }
        },
      },
    },
  );
}
