import { test, expect } from "@playwright/test"

/**
 * E2E-Tests für Buchungen (CRUD-Operationen)
 * ===========================================
 * Testet Erstellen, Bearbeiten und Löschen von Buchungen
 */

test.describe("Buchungen - CRUD", () => {
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

  test("Buchung erstellen", async ({ page }) => {
    await login(page)

    // Navigiere zu Aufträgen
    await page.goto("/auftraege")
    await expect(page).toHaveURL(/.*\/auftraege/)

    // Klicke auf "Neuer Auftrag" Button
    await page.click('button:has-text("Neuer Auftrag"), button:has-text("Neu"), a:has-text("Neuer Auftrag")')

    // Warte auf Dialog oder Formular
    await page.waitForTimeout(1000)

    // Fülle Pflichtfelder
    // Datum
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split("T")[0]
    await page.fill('input[name="date"], input[type="date"]', dateStr)

    // Uhrzeit
    await page.fill('input[name="time"], input[type="time"]', "14:00")

    // Abholadresse
    await page.fill('input[name="pickupAddress"], input[placeholder*="Abhol"]', "Musterstraße 1, 12345 Musterstadt")

    // Zieladresse
    await page.fill('input[name="destinationAddress"], input[placeholder*="Ziel"]', "Teststraße 2, 12345 Teststadt")

    // Optional: Fahrgastname
    await page.fill('input[name="passengerName"], input[placeholder*="Name"]', "Max Mustermann").catch(() => {})

    // Submit
    await page.click('button[type="submit"]:has-text("Speichern"), button:has-text("Erstellen")')

    // Warte auf Erfolg oder Rückkehr zur Liste
    await page.waitForTimeout(2000)

    // Prüfe ob Buchung erstellt wurde (entweder Erfolgsmeldung oder in Liste)
    const success = await page.locator("text=/Erfolgreich|Erstellt|Gespeichert/i").isVisible().catch(() => false)
    const inList = await page.locator("text=/Musterstraße|Teststraße/i").isVisible().catch(() => false)
    
    expect(success || inList).toBeTruthy()
  })

  test("Buchung bearbeiten", async ({ page }) => {
    await login(page)

    // Navigiere zu Aufträgen
    await page.goto("/auftraege")
    await expect(page).toHaveURL(/.*\/auftraege/)

    // Warte auf Liste
    await page.waitForTimeout(2000)

    // Klicke auf erste Buchung (Bearbeiten-Button oder Zeile)
    await page.click('button:has-text("Bearbeiten"), tr:first-child, [data-testid*="booking"]:first-child').catch(async () => {
      // Fallback: Suche nach Bearbeiten-Link
      await page.click('a:has-text("Bearbeiten")').catch(() => {})
    })

    // Warte auf Dialog oder Bearbeitungsseite
    await page.waitForTimeout(1000)

    // Ändere ein Feld (z.B. Status)
    await page.selectOption('select[name="status"]', "in_progress").catch(() => {
      // Fallback: Klicke auf Status-Dropdown
      page.click('button:has-text("Status")').catch(() => {})
    })

    // Speichern
    await page.click('button[type="submit"]:has-text("Speichern"), button:has-text("Aktualisieren")')

    // Warte auf Erfolg
    await page.waitForTimeout(2000)

    // Prüfe ob Änderung gespeichert wurde
    const success = await page.locator("text=/Erfolgreich|Gespeichert|Aktualisiert/i").isVisible().catch(() => false)
    expect(success).toBeTruthy()
  })

  test("Buchung löschen", async ({ page }) => {
    await login(page)

    // Navigiere zu Aufträgen
    await page.goto("/auftraege")
    await expect(page).toHaveURL(/.*\/auftraege/)

    // Warte auf Liste
    await page.waitForTimeout(2000)

    // Klicke auf Löschen-Button der ersten Buchung
    await page.click('button:has-text("Löschen"), button[aria-label*="Löschen"]').first().catch(async () => {
      // Fallback: Suche nach Löschen-Icon
      await page.click('[data-testid*="delete"]').first().catch(() => {})
    })

    // Bestätige Löschung (falls Bestätigungsdialog)
    await page.click('button:has-text("Löschen"), button:has-text("Bestätigen")').catch(() => {})

    // Warte auf Erfolg
    await page.waitForTimeout(2000)

    // Prüfe ob Löschung erfolgreich war
    const success = await page.locator("text=/Gelöscht|Erfolgreich/i").isVisible().catch(() => false)
    expect(success).toBeTruthy()
  })
})

