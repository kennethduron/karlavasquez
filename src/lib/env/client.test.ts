import { describe, expect, it } from "vitest";

import {
  getFirebaseClientEnvironment,
  getOptionalSupabaseClientEnvironment,
} from "./client";

describe("client environment validation", () => {
  it("validates the active Firebase client configuration", () => {
    expect(
      getFirebaseClientEnvironment({
        NEXT_PUBLIC_FIREBASE_API_KEY: "web-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "knv-development.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "knv-development",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
        NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
      }),
    ).toMatchObject({ projectId: "knv-development" });
  });

  it("keeps staged Supabase configuration optional as a complete pair", () => {
    expect(getOptionalSupabaseClientEnvironment({})).toBeUndefined();
    expect(() =>
      getOptionalSupabaseClientEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("Supabase client configuration is incomplete or invalid.");
  });
});
