import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  globalSetup: process.env.FIRESTORE_EMULATOR_HOST
    ? "./tests/e2e/firebase-global-setup.cjs"
    : undefined,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer:
      !process.env.CI && !process.env.FIRESTORE_EMULATOR_HOST,
    env: process.env.FIRESTORE_EMULATOR_HOST
      ? {
          NEXT_PUBLIC_FIREBASE_API_KEY: "fake-api-key",
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "knv-local.firebaseapp.com",
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: "knv-local",
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "knv-local.appspot.com",
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
          NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:knvlocal",
          NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
          FIREBASE_PROJECT_ID: "knv-local",
          FIREBASE_AUTH_EMULATOR_HOST:
            process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099",
          FIRESTORE_EMULATOR_HOST:
            process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080",
          FIREBASE_STORAGE_EMULATOR_HOST:
            process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199",
        }
      : undefined,
  },
});
