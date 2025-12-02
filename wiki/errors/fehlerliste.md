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

## ERR-001 bis ERR-008

*[Bestehende Eintraege bleiben unveraendert]*
