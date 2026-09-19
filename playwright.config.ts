import { defineConfig, devices } from "@playwright/test";

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const useProductionServer =
  process.env.CI && !process.env.FIRESTORE_EMULATOR_HOST;

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
    baseURL: remoteBaseUrl ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      grepInvert: /@device-profile/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "android-chromium",
      grepInvert: /@device-profile/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "iphone-webkit",
      grepInvert: /@device-profile/,
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "ipad-webkit",
      grepInvert: /@device-profile/,
      use: { ...devices["iPad Pro 11"] },
    },
    {
      name: "iphone-se-webkit",
      grep: /@device-profile/,
      use: { ...devices["iPhone SE (3rd gen)"] },
    },
    {
      name: "iphone-15-webkit",
      grep: /@device-profile/,
      use: { ...devices["iPhone 15"] },
    },
    {
      name: "iphone-pro-max-webkit",
      grep: /@device-profile/,
      use: { ...devices["iPhone 15 Pro Max"] },
    },
    {
      name: "galaxy-chromium",
      grep: /@device-profile/,
      use: { ...devices["Galaxy S24"] },
    },
    {
      name: "android-tablet-chromium",
      grep: /@device-profile/,
      use: { ...devices["Galaxy Tab S9"] },
    },
  ],
  webServer: remoteBaseUrl
    ? undefined
    : {
        command: useProductionServer
          ? "npm run start -- --hostname 127.0.0.1"
          : "npm run dev -- --hostname 127.0.0.1",
        url: "http://127.0.0.1:3000",
        reuseExistingServer:
          !process.env.CI && !process.env.FIRESTORE_EMULATOR_HOST,
        env: process.env.FIRESTORE_EMULATOR_HOST
          ? {
              NEXT_PUBLIC_FIREBASE_API_KEY: "fake-api-key",
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "knv-local.firebaseapp.com",
              NEXT_PUBLIC_FIREBASE_PROJECT_ID: "knv-local",
              NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
              NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:knvlocal",
              NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
              FIREBASE_PROJECT_ID: "knv-local",
              FIREBASE_AUTH_EMULATOR_HOST:
                process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099",
              FIRESTORE_EMULATOR_HOST:
                process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080",
            }
          : undefined,
      },
});
