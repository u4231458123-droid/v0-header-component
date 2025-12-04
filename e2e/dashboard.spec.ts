import { test, expect } from "@playwright/test"

/**
 * E2E-Tests für Dashboard-Navigation
 * ===================================
 * Testet Navigation zwischen allen Portalen
 */

test.describe("Dashboard-Navigation", () => {
  // Login-Helper
  async function login(page: any) {
    const testEmail = process.env.E2E_TEST_EMAIL || "test@example.com"
    const testPassword = process.env.E2E_TEST_PASSWORD || "TestPassword123!"

    await page.goto("/auth/login")
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
  }

  test("Dashboard - Hauptnavigation", async ({ page }) => {
    await login(page)

    // Prüfe ob Dashboard geladen wurde
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Prüfe ob Hauptelemente vorhanden sind
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("Navigation - Aufträge", async ({ page }) => {
    await login(page)

    // Navigiere zu Aufträgen
    await page.click('a[href*="/auftraege"], nav a:has-text("Aufträge")')
    await expect(page).toHaveURL(/.*\/auftraege/)

    // Prüfe ob Seite geladen wurde
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("Navigation - Fahrer", async ({ page }) => {
    await login(page)

    // Navigiere zu Fahrer
    await page.click('a[href*="/fahrer"], nav a:has-text("Fahrer")')
    await expect(page).toHaveURL(/.*\/fahrer/)

    // Prüfe ob Seite geladen wurde
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("Navigation - Kunden", async ({ page }) => {
    await login(page)

    // Navigiere zu Kunden
    await page.click('a[href*="/kunden"], nav a:has-text("Kunden")')
    await expect(page).toHaveURL(/.*\/kunden/)

    // Prüfe ob Seite geladen wurde
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("Navigation - Finanzen", async ({ page }) => {
    await login(page)

    // Navigiere zu Finanzen
    await page.click('a[href*="/finanzen"], nav a:has-text("Finanzen")')
    await expect(page).toHaveURL(/.*\/finanzen/)

    // Prüfe ob Seite geladen wurde
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })

  test("Navigation - Einstellungen", async ({ page }) => {
    await login(page)

    // Navigiere zu Einstellungen
    await page.click('a[href*="/einstellungen"], nav a:has-text("Einstellungen")')
    await expect(page).toHaveURL(/.*\/einstellungen/)

    // Prüfe ob Seite geladen wurde
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })
})

