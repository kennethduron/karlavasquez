import { z } from "zod";

const firebaseClientEnvironmentSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(2),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().min(1).optional(),
});

const supabaseClientEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export type ClientEnvironmentSource = Record<string, string | undefined>;

function defaultFirebaseSource(): ClientEnvironmentSource {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
}

function defaultSupabaseSource(): ClientEnvironmentSource {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function getFirebaseClientEnvironment(source = defaultFirebaseSource()) {
  const parsed = firebaseClientEnvironmentSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error("Firebase client configuration is missing or invalid.");
  }

  return {
    apiKey: parsed.data.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsed.data.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsed.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: parsed.data.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: parsed.data.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: parsed.data.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
}

export function getOptionalSupabaseClientEnvironment(
  source = defaultSupabaseSource(),
) {
  const values = Object.values(source);
  if (values.every((value) => !value)) return undefined;

  const parsed = supabaseClientEnvironmentSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error("Supabase client configuration is incomplete or invalid.");
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
