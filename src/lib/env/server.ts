import "server-only";

import { z } from "zod";

const publicSupabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const serviceRoleSchema = publicSupabaseSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export function getPublicSupabaseEnv() {
  return publicSupabaseSchema.safeParse(process.env);
}

export function getServiceRoleEnv() {
  return serviceRoleSchema.safeParse(process.env);
}
