import { describe, expect, it } from "vitest";

import {
  getFirebaseMessagingEnvironment,
  getSupabaseClientEnvironment,
} from "./client";

describe("client environment validation", () => {
  it("validates the FCM-only Firebase client configuration", () => {
    expect(
      getFirebaseMessagingEnvironment({
        NEXT_PUBLIC_FIREBASE_API_KEY: "web-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "knv-development",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
        NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
      }),
    ).toMatchObject({ projectId: "knv-development" });
  });

  it("requires the authoritative Supabase client configuration", () => {
    expect(() =>
      getSupabaseClientEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("Supabase client configuration is incomplete or invalid.");
  });

  it("accepts only a modern Supabase publishable key", () => {
    expect(
      getSupabaseClientEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "sb_publishable_example-public-browser-key",
      }),
    ).toMatchObject({
      publishableKey: "sb_publishable_example-public-browser-key",
    });
  });
});
