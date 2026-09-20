import "server-only";

import { z } from "zod";

const adminEnvironmentSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(2),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_PRIVATE_KEY: z.string().min(40),
});

const supabaseServerEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("sb_publishable_"),
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
  SUPABASE_DB_URL: z.url().optional(),
});

const resendEnvironmentSchema = z.object({
  RESEND_API_KEY: z.string().min(10),
  RESEND_FROM_NAME: z.string().min(1),
  RESEND_FROM_EMAIL: z.email(),
});

const cloudinaryEnvironmentSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

const backblazeEnvironmentSchema = z.object({
  B2_KEY_ID: z.string().min(1),
  B2_APPLICATION_KEY: z.string().min(1),
  B2_BUCKET_NAME: z.string().min(1),
  B2_ENDPOINT: z.url(),
  B2_REGION: z.string().min(1).optional(),
});

type ServerEnvironmentSource = Record<string, string | undefined>;

function parseServerEnvironment<T>(
  schema: z.ZodType<T>,
  source: ServerEnvironmentSource,
  message: string,
) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) throw new Error(message);
  return parsed.data;
}

export function getFirebaseMessagingAdminEnvironment() {
  const parsed = adminEnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Firebase Admin configuration is missing or invalid.");
  }

  return {
    projectId: parsed.data.FIREBASE_PROJECT_ID,
    clientEmail: parsed.data.FIREBASE_CLIENT_EMAIL,
    privateKey: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

export function getSiteUrl() {
  const parsed = z.url().safeParse(process.env.NEXT_PUBLIC_SITE_URL);
  if (parsed.success) return parsed.data.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
}

export function getSupabaseServerEnvironment(
  source: ServerEnvironmentSource = process.env,
) {
  const data = parseServerEnvironment(
    supabaseServerEnvironmentSchema,
    source,
    "Supabase server configuration is missing or invalid.",
  );
  return {
    url: data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secretKey: data.SUPABASE_SECRET_KEY,
    databaseUrl: data.SUPABASE_DB_URL,
  };
}

export function getResendEnvironment(
  source: ServerEnvironmentSource = process.env,
) {
  const data = parseServerEnvironment(
    resendEnvironmentSchema,
    source,
    "Email provider configuration is missing or invalid.",
  );
  return {
    apiKey: data.RESEND_API_KEY,
    fromName: data.RESEND_FROM_NAME,
    fromEmail: data.RESEND_FROM_EMAIL,
  };
}

export function getCloudinaryEnvironment(
  source: ServerEnvironmentSource = process.env,
) {
  const data = parseServerEnvironment(
    cloudinaryEnvironmentSchema,
    source,
    "Public media provider configuration is missing or invalid.",
  );
  return {
    cloudName: data.CLOUDINARY_CLOUD_NAME,
    apiKey: data.CLOUDINARY_API_KEY,
    apiSecret: data.CLOUDINARY_API_SECRET,
  };
}

export function getBackblazeEnvironment(
  source: ServerEnvironmentSource = process.env,
) {
  const data = parseServerEnvironment(
    backblazeEnvironmentSchema,
    source,
    "Backup provider configuration is missing or invalid.",
  );
  return {
    keyId: data.B2_KEY_ID,
    applicationKey: data.B2_APPLICATION_KEY,
    bucketName: data.B2_BUCKET_NAME,
    endpoint: data.B2_ENDPOINT,
    region: data.B2_REGION,
  };
}
