import { defineConfig, devices } from "@playwright/test";
export const STORAGE_STATE = "./e2e/auth/user.json";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120000,
  reporter: [
    ["html"],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    testIdAttribute: "data-cy",
    trace: "on",
    video: "on",
    screenshot: "on",
  },

  projects: [
    {
      name: "setup",
      testMatch: "global.setup.ts",
      teardown: "cleanup credentials",
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testMatch: "/ticketActions.spec.ts",
    },
    { name: "cleanup credentials", testMatch: "global.teardown.ts" },
  ],
});