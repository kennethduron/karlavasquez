import "server-only";

import { z } from "zod";

const adminEnvironmentSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(2),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_PRIVATE_KEY: z.string().min(40),
});

export function getFirebaseAdminEnvironment() {
  if (
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIRESTORE_EMULATOR_HOST
  ) {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
      "knv-local";
    return { projectId, emulator: true as const };
  }

  const parsed = adminEnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Firebase Admin configuration is missing or invalid.");
  }

  return {
    projectId: parsed.data.FIREBASE_PROJECT_ID,
    clientEmail: parsed.data.FIREBASE_CLIENT_EMAIL,
    privateKey: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    emulator: false as const,
  };
}

export function getSiteUrl() {
  const parsed = z.url().safeParse(process.env.NEXT_PUBLIC_SITE_URL);
  if (parsed.success) return parsed.data.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
}
