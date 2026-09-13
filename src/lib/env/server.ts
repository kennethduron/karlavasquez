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

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    const parsed = z.url().safeParse(configured);
    if (parsed.success) return parsed.data.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
}
