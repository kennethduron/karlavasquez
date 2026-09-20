import { z } from "zod";

const firebaseClientEnvironmentSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(2),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().min(1).optional(),
});

const supabaseClientEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("sb_publishable_"),
});

export type ClientEnvironmentSource = Record<string, string | undefined>;

function defaultFirebaseSource(): ClientEnvironmentSource {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
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
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function getFirebaseMessagingEnvironment(
  source = defaultFirebaseSource(),
) {
  const parsed = firebaseClientEnvironmentSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error("Firebase client configuration is missing or invalid.");
  }

  return {
    apiKey: parsed.data.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: parsed.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: parsed.data.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: parsed.data.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: parsed.data.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
}

export function getSupabaseClientEnvironment(source = defaultSupabaseSource()) {
  const parsed = supabaseClientEnvironmentSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error("Supabase client configuration is incomplete or invalid.");
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
