import { defineConfig, devices } from "@playwright/test";

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const supabaseLocalTest = process.env.SUPABASE_LOCAL_TEST === "true";
const supabaseAuthTest =
  supabaseLocalTest || process.env.SUPABASE_AUTH_TEST === "true";
const useProductionServer = process.env.CI && !supabaseAuthTest;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  globalSetup: supabaseAuthTest
    ? "./tests/e2e/supabase-global-setup.mjs"
    : undefined,
  globalTeardown: supabaseAuthTest
    ? "./tests/e2e/supabase-global-teardown.mjs"
    : undefined,
  use: {
    baseURL: remoteBaseUrl ?? "http://localhost:3000",
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
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI && !supabaseAuthTest,
        env: supabaseAuthTest
          ? {
              NEXT_PUBLIC_SUPABASE_URL:
                process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
              SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ?? "",
              NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
            }
          : undefined,
      },
});
