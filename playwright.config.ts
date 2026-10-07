import { defineConfig } from "@playwright/test";
import path from "node:path";
const baseURL = "http://127.0.0.1:3136";
const databaseUrl = "file:" + path.join(process.cwd(), ".test-data", "e2e.db");
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    timezoneId: "Australia/Sydney",
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
      ...(process.env.PLAYWRIGHT_LAUNCH_ARGS ? { args: JSON.parse(process.env.PLAYWRIGHT_LAUNCH_ARGS) as string[] } : {}),
    },
  },
  webServer: {
    command: "node --import tsx scripts/prepare-test.ts && npm run start -- --port 3136 --hostname 127.0.0.1",
    url: baseURL,
    reuseExistingServer: false,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      TEST_DATABASE_URL: databaseUrl,
      AUTH_URL: baseURL,
      AUTH_SECRET: "e2e-only-synthetic-secret-2026-unique-value",
      AUTH_TRUST_HOST: "true",
      DEMO_MODE: "true",
      ALLOW_DEMO_SEED: "true",
      DEMO_EMPLOYEE_ID: "DEMO001",
      DEMO_EMPLOYEE_PASSWORD: "PantryDemo2026!",
      DEMO_ADMIN_USERNAME: "demo-admin",
      DEMO_ADMIN_PASSWORD: "AdminPantry2026!",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    timeout: 60000,
  },
});
