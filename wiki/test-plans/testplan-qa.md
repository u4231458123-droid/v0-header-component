# Testplan & QA

## Teststrategie

### Testpyramide

\`\`\`
         ┌───────────┐
         │   E2E     │  10%
         ├───────────┤
         │Integration│  30%
         ├───────────┤
         │   Unit    │  60%
         └───────────┘
\`\`\`

## Testbereiche

### 1. Unit Tests

**Scope:** Einzelne Funktionen und Komponenten

\`\`\`typescript
// Beispiel: tariff-utils.test.ts
describe('getTariffLimits', () => {
  it('returns correct limits for starter', () => {
    const limits = getTariffLimits('starter')
    expect(limits.drivers).toBe(5)
    expect(limits.vehicles).toBe(5)
  })
})
\`\`\`

### 2. Integration Tests

**Scope:** Zusammenspiel von Komponenten

\`\`\`typescript
// Beispiel: auth-flow.test.ts
describe('Authentication Flow', () => {
  it('creates user and company on signup', async () => {
    const result = await signup({ email, password, company })
    expect(result.user).toBeDefined()
    expect(result.company).toBeDefined()
  })
})
\`\`\`

### 3. E2E Tests (Playwright)

**Scope:** Vollständige User Journeys

\`\`\`typescript
// Beispiel: booking.spec.ts
test('user can create a booking', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Neue Buchung')
  // ...
  await expect(page.locator('.booking-success')).toBeVisible()
})
\`\`\`

## Testfälle

### Pre-Login Bereich

| ID | Testfall | Erwartung | Status |
|----|----------|-----------|--------|
| PL-001 | Homepage lädt | 200 OK, Hero sichtbar | - |
| PL-002 | Pricing zeigt Tarife | 3 Tarife sichtbar | - |
| PL-003 | FAQ Accordion funktioniert | Inhalte werden angezeigt | - |
| PL-004 | Cookie-Banner erscheint | Banner beim ersten Besuch | - |
| PL-005 | Login-Form validiert | Fehlermeldung bei falschem PW | - |

### Authentifizierung

| ID | Testfall | Erwartung | Status |
|----|----------|-----------|--------|
| AU-001 | Registrierung erstellt User | User in DB, Company erstellt | - |
| AU-002 | Login setzt Session | Cookie gesetzt | - |
| AU-003 | Logout löscht Session | Cookie gelöscht | - |
| AU-004 | Token wird erneuert | Automatischer Refresh | - |

### Dashboard

| ID | Testfall | Erwartung | Status |
|----|----------|-----------|--------|
| DA-001 | Buchung erstellen | Buchung in DB | - |
| DA-002 | Fahrer hinzufügen | Fahrer in DB | - |
| DA-003 | Limit-Check Starter | Fehler bei > 5 Fahrer | - |
| DA-004 | Einstellungen speichern | Firma aktualisiert | - |

### Portale

| ID | Testfall | Erwartung | Status |
|----|----------|-----------|--------|
| PO-001 | Fahrer sieht Fahrten | Nur zugewiesene Fahrten | - |
| PO-002 | Kunde sieht Buchungen | Nur eigene Buchungen | - |
| PO-003 | Tenant-Page lädt | Dynamische Inhalte | - |

## Performance-Tests

### Metriken

| Metrik | Ziel | Tool |
|--------|------|------|
| TTFB | < 200ms | Lighthouse |
| FCP | < 1.5s | Lighthouse |
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TBT | < 200ms | Lighthouse |

### Load Testing

\`\`\`bash
# k6 Load Test
k6 run --vus 100 --duration 30s load-test.js
\`\`\`

## Mobile Tests

### Geräte

| Gerät | Viewport | Status |
|-------|----------|--------|
| iPhone SE | 375x667 | - |
| iPhone 14 | 390x844 | - |
| iPad | 768x1024 | - |
| Galaxy S21 | 360x800 | - |

### Tests

- [ ] Touch-Targets >= 44px
- [ ] Keine horizontalen Scrollbars
- [ ] Navigation funktioniert
- [ ] Formulare sind bedienbar

## Sicherheits-Tests

### Checkliste

- [ ] RLS funktioniert (User sieht nur eigene Daten)
- [ ] SQL Injection nicht möglich
- [ ] XSS nicht möglich
- [ ] CSRF-Token vorhanden
- [ ] Rate Limiting aktiv

## Test-Ausführung

\`\`\`bash
# Alle Tests
npm run test

# Unit Tests
npm run test:unit

# E2E Tests
npm run test:e2e

# Coverage
npm run test:coverage
