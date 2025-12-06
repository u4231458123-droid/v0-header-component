import { defineConfig } from "@octomind/cli";

export default defineConfig({
  projectId: process.env.OCTOMIND_PROJECT_ID || "mydispatch",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  testTimeout: 30000,
  retries: 2,
  screenshots: true,
  videos: true,
  trace: true,
  // Autonome Test-Generierung aktivieren
  autonomous: {
    enabled: true,
    generateTests: true,
    updateTests: true,
  },
  // Integration mit Playwright
  playwright: {
    config: "./playwright.config.ts",
  },
  // Test-Suites für kritische User-Journeys
  suites: [
    {
      name: "Authentication Flow",
      tests: ["auth.spec.ts"],
    },
    {
      name: "Booking Management",
      tests: ["bookings.spec.ts"],
    },
    {
      name: "Dashboard",
      tests: ["dashboard.spec.ts"],
    },
    {
      name: "Team Management",
      tests: ["team-management.spec.ts"],
    },
  ],
  // UI-Fehler-Detection
  uiErrors: {
    enabled: true,
    checkConsoleErrors: true,
    checkNetworkErrors: true,
    checkVisualRegressions: true,
  },
});

