# Fehlerliste

> **WICHTIG:** Diese Liste wird niemals gelöscht, nur erweitert.
> Alle Fehler werden dokumentiert, um Wiederholungen zu vermeiden.

---

## ERR-012: v0-Preview 404 Fehler (Cache-Problem)

**Status:** wontfix (v0-spezifisch)
**Severity:** low
**Datum:** 25.11.2025
**Betroffene Module:** Alle Seiten in v0-Preview

### Beschreibung
Alle Seiten zeigen "404 - This page could not be found" in der v0-Preview, obwohl alle Dateien korrekt existieren.

### Root Cause
v0-Preview Cache/Build-Problem. Die Dateien (app/page.tsx, app/auth/login/page.tsx, app/layout.tsx) existieren alle und sind korrekt strukturiert.

### Loesung
Projekt auf Vercel deployen - bei normalem Deployment funktionieren alle Seiten korrekt.

### Praevention
Dies ist eine v0-spezifische Limitation und kann nicht verhindert werden.

---

## ERR-011: Homepage Application Error (lucide-react)

**Status:** resolved
**Severity:** critical
**Datum:** 25.11.2025
**Betroffene Module:** Alle Homepage-Komponenten

### Beschreibung
Homepage zeigt "Application Error: Failed to load chunk from module 548822" beim Laden.

### Root Cause
v0 kann `lucide-react` nicht ueber Blob-URLs laden. Alle Homepage-Komponenten (HomeFAQSection, HomeFeaturesSection, HomePricingSection, etc.) importierten lucide-react Icons.

### Loesung
Alle 10 Homepage-Komponenten wurden auf Inline-SVGs umgestellt:
- V28IconBox: LucideIcon Type durch ReactNode ersetzt
- HomeFAQSection: ChevronDown als Inline-SVG
- HomeFeaturesSection: 10+ Icons als Inline-SVGs
- HomeFinalCTASection: ArrowRight, Sparkles als Inline-SVGs
- HomePricingSection: Rocket, Building2, Crown als Inline-SVGs
- HomeStatsSection: TrendingUp, Users, Car, CheckCircle als Inline-SVGs
- HomeTrustSection: Shield, Lock, CheckCircle2, Award als Inline-SVGs
- HomeTestimonialsSection: Building2, Star als Inline-SVGs
- V28PricingCard: Check, LucideIcon Type durch ReactNode ersetzt

### Praevention
- Alle neuen Komponenten muessen Inline-SVGs verwenden
- Keine lucide-react Importe in Homepage-relevanten Komponenten
- V28IconBox akzeptiert jetzt ReactNode statt LucideIcon

---

## ERR-010: Turbopack Export-Problem (checkbox, dropdown-menu, select)

**Status:** resolved
**Severity:** critical
**Datum:** 25.11.2025
**Betroffene Module:** components/ui/checkbox.tsx, components/ui/dropdown-menu.tsx, components/ui/select.tsx

### Beschreibung
Deployment-Build schlägt fehl mit "The module has no exports at all" für die drei UI-Komponenten.

### Root Cause
Turbopack kann Radix-UI Primitives nicht korrekt parsen.

### Loesung
Komplette Neuentwicklung der drei Komponenten OHNE Radix-UI mit native HTML-Elemente und React Context.

---

## ERR-009: v0 Build-Cache Global Loading (AddressAutocomplete)

**Status:** wontfix (v0-spezifisch)
**Severity:** medium
**Datum:** 25.11.2025

### Beschreibung
v0 Build-Cache lädt AddressAutocomplete global.

### Loesung
Projekt exportieren und auf Vercel deployen.

---

## ERR-013: SQL-TypeScript-Verwechslung (Agent-Fehler)

**Status:** resolved
**Severity:** critical
**Datum:** Dezember 2025
**Betroffene Module:** MCP-Integration, SQL-Ausführung

### Beschreibung
AI-Agenten haben versucht, TypeScript/JavaScript-Dateien als SQL auszuführen. Dies führte zu Fehlern bei SQL-Migrationen und Datenbankoperationen.

### Root Cause
Fehlende Validierung vor SQL-Ausführung. Agenten konnten Dateien mit falscher Endung oder falschem Inhalt als SQL interpretieren.

### Loesung
**SQL-Validierungs-System implementiert:**
- `lib/utils/sql-validator.ts` - Zentrale Validierungs-Utility
  - `isValidSQLFile(filePath)` - Prüft Dateiendung (.sql)
  - `isValidSQLContent(content)` - Prüft Inhalt auf SQL-Keywords und verbotene JS/TS-Syntax
  - `validateSQLBeforeExecution(query, filePath?)` - Kombinierte Validierung
- Integration in `lib/ai/bots/mcp-integration.ts`
  - Automatische Validierung VOR jeder SQL-Ausführung
  - Blockiert Ausführung bei ungültigen Dateien/Inhalten
- CI/CD-Validierung: `scripts/cicd/validate-sql-files.mjs`
  - Prüft alle SQL-Dateien im Repository
  - Pre-Commit Hook erweitert

### Praevention
- **Regel 1**: IMMER `validateSQLBeforeExecution()` vor SQL-Ausführung verwenden
- **Regel 2**: SQL-Dateien müssen `.sql` Endung haben
- **Regel 3**: SQL-Inhalt muss SQL-Keywords enthalten, keine JS/TS-Syntax
- **Regel 4**: Pre-Commit Hook validiert automatisch alle SQL-Dateien

### Referenzen
- Implementierung: [`lib/utils/sql-validator.ts`](../../lib/utils/sql-validator.ts)
- Integration: [`lib/ai/bots/mcp-integration.ts`](../../lib/ai/bots/mcp-integration.ts)
- CI/CD: [`scripts/cicd/validate-sql-files.mjs`](../../scripts/cicd/validate-sql-files.mjs)
- Dokumentation: [`AAAPlanung/planung.txt`](../../AAAPlanung/planung.txt)

---

## ERR-001 bis ERR-012

*[Bestehende Eintraege bleiben unveraendert]*
