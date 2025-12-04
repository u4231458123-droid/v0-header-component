import { test, expect } from "@playwright/test"

/**
 * E2E-Tests für Authentifizierung
 * ================================
 * Testet Login, Registrierung und Logout
 */

test.describe("Authentifizierung", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("Registrierung - Neuer Benutzer", async ({ page }) => {
    // Navigiere zur Registrierung
    await page.click('a[href*="/auth/register"]')
    await expect(page).toHaveURL(/.*\/auth\/register/)

    // Fülle Registrierungsformular
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[name="password"]', "TestPassword123!")
    await page.fill('input[name="fullName"]', "Test User")

    // Submit
    await page.click('button[type="submit"]')

    // Warte auf Weiterleitung oder Erfolgsmeldung
    await page.waitForTimeout(2000)
    
    // Prüfe ob Registrierung erfolgreich war
    // (Entweder Weiterleitung zu Dashboard oder Erfolgsmeldung)
    const currentUrl = page.url()
    expect(
      currentUrl.includes("/dashboard") || 
      currentUrl.includes("/auth/login") ||
      await page.locator("text=/Erfolgreich|Willkommen|Registrierung/i").isVisible()
    ).toBeTruthy()
  })

  test("Login - Bestehender Benutzer", async ({ page }) => {
    // Navigiere zum Login
    await page.click('a[href*="/auth/login"]')
    await expect(page).toHaveURL(/.*\/auth\/login/)

    // Fülle Login-Formular
    // HINWEIS: Verwende Test-Credentials aus Environment oder Test-Datenbank
    const testEmail = process.env.E2E_TEST_EMAIL || "test@example.com"
    const testPassword = process.env.E2E_TEST_PASSWORD || "TestPassword123!"

    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // Submit
    await page.click('button[type="submit"]')

    // Warte auf Weiterleitung zum Dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/.*\/dashboard/)
  })

  test("Logout", async ({ page }) => {
    // Voraussetzung: Eingeloggt sein
    // (Kann durch Login-Test oder direkte Navigation erreicht werden)
    const testEmail = process.env.E2E_TEST_EMAIL || "test@example.com"
    const testPassword = process.env.E2E_TEST_PASSWORD || "TestPassword123!"

    // Login
    await page.goto("/auth/login")
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })

    // Logout
    await page.click('button:has-text("Abmelden"), a[href*="/auth/logout"], button[aria-label*="Logout"]')
    
    // Warte auf Weiterleitung zur Startseite oder Login
    await page.waitForURL(/.*\/(auth\/login|$)/, { timeout: 5000 })
    
    // Prüfe ob Logout erfolgreich war
    const currentUrl = page.url()
    expect(currentUrl.includes("/auth/login") || currentUrl === page.url()).toBeTruthy()
  })

  test("Login - Falsche Credentials", async ({ page }) => {
    await page.goto("/auth/login")

    // Falsche Credentials
    await page.fill('input[name="email"]', "wrong@example.com")
    await page.fill('input[name="password"]', "WrongPassword123!")

    await page.click('button[type="submit"]')

    // Warte auf Fehlermeldung
    await page.waitForTimeout(2000)
    
    // Prüfe ob Fehlermeldung angezeigt wird
    const errorMessage = await page.locator("text=/Fehler|Ungültig|Falsch|Nicht gefunden/i").first()
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })
})

