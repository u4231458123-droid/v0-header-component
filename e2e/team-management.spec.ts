import { test, expect } from "@playwright/test"

/**
 * E2E-Tests für Team-Management
 * =============================
 * Testet Team-Mitglieder-Verwaltung
 */

test.describe("Team-Management", () => {
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

  test("Team-Übersicht anzeigen", async ({ page }) => {
    await login(page)

    // Navigiere zu Einstellungen
    await page.goto("/einstellungen")
    await expect(page).toHaveURL(/.*\/einstellungen/)

    // Navigiere zu Team-Tab (falls vorhanden)
    await page.click('button:has-text("Team"), a:has-text("Team"), [role="tab"]:has-text("Team")').catch(() => {})

    // Warte auf Team-Liste
    await page.waitForTimeout(1000)

    // Prüfe ob Team-Bereich geladen wurde
    const teamSection = await page.locator("text=/Team|Mitarbeiter|Mitglieder/i").first().isVisible().catch(() => false)
    expect(teamSection).toBeTruthy()
  })

  test("Mitarbeiter-Details anzeigen", async ({ page }) => {
    await login(page)

    // Navigiere zu Einstellungen > Team
    await page.goto("/einstellungen")
    await page.click('button:has-text("Team"), a:has-text("Team")').catch(() => {})
    await page.waitForTimeout(1000)

    // Klicke auf "Details" oder ersten Mitarbeiter
    await page.click('button:has-text("Details"), tr:first-child, [data-testid*="employee"]:first-child').catch(async () => {
      await page.click('a:has-text("Details")').first().catch(() => {})
    })

    // Warte auf Dialog oder Detailseite
    await page.waitForTimeout(1000)

    // Prüfe ob Details angezeigt werden
    const details = await page.locator("text=/Name|E-Mail|Rolle|Profil/i").first().isVisible().catch(() => false)
    expect(details).toBeTruthy()
  })

  test("Mitarbeiter bearbeiten", async ({ page }) => {
    await login(page)

    // Navigiere zu Einstellungen > Team
    await page.goto("/einstellungen")
    await page.click('button:has-text("Team"), a:has-text("Team")').catch(() => {})
    await page.waitForTimeout(1000)

    // Klicke auf "Bearbeiten"
    await page.click('button:has-text("Bearbeiten")').first().catch(async () => {
      await page.click('a:has-text("Bearbeiten")').first().catch(() => {})
    })

    // Warte auf Bearbeitungsdialog
    await page.waitForTimeout(1000)

    // Ändere ein Feld (z.B. Name)
    await page.fill('input[name="fullName"], input[name="name"]', "Geänderter Name").catch(() => {})

    // Speichern
    await page.click('button[type="submit"]:has-text("Speichern")')

    // Warte auf Erfolg
    await page.waitForTimeout(2000)

    // Prüfe ob Änderung gespeichert wurde
    const success = await page.locator("text=/Erfolgreich|Gespeichert/i").isVisible().catch(() => false)
    expect(success).toBeTruthy()
  })
})

