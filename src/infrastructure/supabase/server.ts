import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseServerEnvironment } from "@/lib/env/server";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSupabaseServerClient() {
  const environment = getSupabaseServerEnvironment();
  const cookieStore = await cookies();

  return createServerClient(environment.url, environment.publishableKey, {
    cookieOptions,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values) {
          cookieStore.set(name, value, { ...options, ...cookieOptions });
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const environment = getSupabaseServerEnvironment();
  return createClient(environment.url, environment.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
