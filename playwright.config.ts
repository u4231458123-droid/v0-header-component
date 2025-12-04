import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright-Konfiguration für E2E-Tests
 * ======================================
 * Testet alle kritischen User-Journeys automatisch
 */

export default defineConfig({
  testDir: "./e2e",
  
  // Timeout für einzelne Tests
  timeout: 30 * 1000,
  
  // Expect-Timeout
  expect: {
    timeout: 5000,
  },
  
  // Parallelisierung
  fullyParallel: true,
  
  // Fail fast bei CI
  forbidOnly: !!process.env.CI,
  
  // Retry bei Flaky Tests
  retries: process.env.CI ? 2 : 0,
  
  // Workers (parallel)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: process.env.CI ? "html" : "list",
  
  // Shared Settings
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    
    // Screenshot bei Fehlern
    screenshot: "only-on-failure",
    
    // Video bei Fehlern
    video: "retain-on-failure",
    
    // Trace bei Fehlern
    trace: "on-first-retry",
    
    // Action Timeout
    actionTimeout: 10 * 1000,
    
    // Navigation Timeout
    navigationTimeout: 30 * 1000,
  },

  // Projekte (verschiedene Browser)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile Tests
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Web Server (für lokale Tests)
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
})

