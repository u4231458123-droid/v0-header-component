# CPO Master-Dokumentation - MyDispatch

**Version:** 2.0.0  
**Datum:** 2024  
**Rolle:** Chief Product Officer (CPO), Creative Director & Lead Architect  
**Status:** ✅ Vollständig strukturiert, verlinkt und mit lokalen Daten

---

## 📋 INHALTSVERZEICHNIS

### 1. [Vorgaben & Anforderungen](#1-vorgaben--anforderungen)
- [CPO-Rolle & Arbeitsweise](#cpo-rolle--arbeitsweise)
- [System-Anforderungen](#system-anforderungen)
- [Planungs-Prompt](#planungs-prompt)

### 2. [Architektur & System-Design](#2-architektur--system-design)
- [Tech Stack](#tech-stack)
- [Datenbank-Schema](#datenbank-schema)
- [API-Struktur](#api-struktur)
- [Design System](#design-system)

### 3. [Codebase-Analyse](#3-codebase-analyse)
- [Verstöße & Probleme](#verstöße--probleme)
- [Umsetzungsplan](#umsetzungsplan)
- [Code-Qualität](#code-qualität)

### 4. [Automatisierung & CI/CD](#4-automatisierung--cicd)
- [GitHub Actions](#github-actions)
- [Pre-Commit Hooks](#pre-commit-hooks)
- [Validierungs-Scripts](#validierungs-scripts)
- [Deployment-Pipeline](#deployment-pipeline)
- [AI Agent Integration](#ai-agent-integration)

### 5. [DSGVO & Compliance](#5-dsgvo--compliance)
- [RLS-Policies](#rls-policies)
- [Bearbeiter-Tracking](#bearbeiter-tracking)
- [Daten-Trennung](#daten-trennung)

### 6. [Entwicklungsumgebung](#6-entwicklungsumgebung)
- [VS Code Konfiguration](#vs-code-konfiguration)
- [TypeScript Konfiguration](#typescript-konfiguration)
- [ESLint Konfiguration](#eslint-konfiguration)
- [Git Konfiguration](#git-konfiguration)

### 7. [Arbeitsweise & Prozesse](#7-arbeitsweise--prozesse)
- [Fehlerliste & Tracking](#fehlerliste--tracking)
- [Schaltplan Architektur](#schaltplan-architektur)
- [Optimierte Konfigurationen](#optimierte-konfigurationen)

### 8. [Lokale Daten & Konfigurationen](#8-lokale-daten--konfigurationen)
- [Lokale Environment-Variablen](#lokale-environment-variablen)
- [Lokale Datenbank-Konfiguration](#lokale-datenbank-konfiguration)
- [Lokale Test-Daten](#lokale-test-daten)

---

## 1. VORGABEN & ANFORDERUNGEN

### CPO-Rolle & Arbeitsweise

**Quellen:**
- [`AAAPlanung/ROLLE_CHIEF_PRODUCT_OFFICER_CPO.txt`](../../AAAPlanung/ROLLE_CHIEF_PRODUCT_OFFICER_CPO.txt)
- [`AAAPlanung/AI_AGENTEN_CPO_AUFTRAG.txt`](../../AAAPlanung/AI_AGENTEN_CPO_AUFTRAG.txt)
- [`AAAPlanung/MYDISPATCH SYSTEM - VOLLSTÄNDIGE FERTIGSTELLUNG.txt`](../../AAAPlanung/MYDISPATCH%20SYSTEM%20-%20VOLLSTÄNDIGE%20FERTIGSTELLUNG.txt)

**Kern-Prinzipien:**
- Zero-Defect, High-Performance, UX-Delight
- "Sie" Tonalität (formales Deutsch)
- Verbotene Begriffe: kostenlos, gratis, free, testen, trial, billig, günstig
- Empathie, Professionalität, Lösungsorientierung

**Modus Operandi:**
1. **Der Architekt:** Code sicher, skalierbar, performant
2. **Der Designer:** Obsessives Auge für Ästhetik, visuelle Harmonie
3. **Der Texter & Stratege:** Menschlich, professionell, empathisch

### System-Anforderungen

**Quellen:**
- [`wiki/docs/requirements.md`](../../wiki/docs/requirements.md)
- [`wiki/docs/system-overview.md`](../../wiki/docs/system-overview.md)
- [`wiki/qa/master-prompt.md`](../../wiki/qa/master-prompt.md)

**Funktionale Anforderungen:**
- FA-001: Benutzerregistrierung (Multi-Step, Stripe Checkout)
- FA-002: Authentifizierung (Cookie-basiert, Token-Refresh)
- FA-003: Buchungsverwaltung
- FA-004: Fahrerverwaltung
- FA-005: Kundenverwaltung
- FA-006: Rechnungswesen
- FA-007: Tenant-Landingpages

**Nicht-funktionale Anforderungen:**
- NFA-001: Performance (<3s Seitenladezeit)
- NFA-002: Skalierbarkeit (1000+ gleichzeitige Benutzer)
- NFA-003: Sicherheit (RLS, HTTPS, Input-Validierung)
- NFA-004: Verfügbarkeit (99.9% Uptime)
- NFA-005: DSGVO-Compliance

### Planungs-Prompt

**Quelle:** [`AAAPlanung/planung.txt`](../../AAAPlanung/planung.txt) (2200+ Zeilen)

**Kern-Vorgaben:**
1. **Automatisierung:** Keine USER-Eingriffe, vollständig autonom
2. **Design:** Nur Design-Tokens, keine hardcoded Farben
3. **Content:** "Sie" statt "Du", keine verbotenen Begriffe
4. **Code-Qualität:** TypeScript strict, keine any-Types
5. **Performance:** Optimistic UI, Caching, <100ms Response
6. **DSGVO:** Strikte company-basierte RLS, keine Master-Admin-Policies
7. **SQL-Validierung:** Validierung vor jeder SQL-Ausführung
8. **AI-Modelle:** NUR Hugging Face (keine anderen APIs)

---

## 2. ARCHITEKTUR & SYSTEM-DESIGN

### Tech Stack

**Quellen:**
- [`wiki/02-architektur.md`](../../wiki/02-architektur.md)
- [`wiki/docs/developer-guide.md`](../../wiki/docs/developer-guide.md)

**Frontend:**
- Next.js 16 (App Router, Server Components, Server Actions)
- React 19 (Latest features)
- Tailwind CSS v4 (Utility-first CSS)
- shadcn/ui (UI Component Library)

**Backend:**
- Supabase (PostgreSQL, Auth, Row Level Security)
- Stripe (Subscriptions & Payments)

**Deployment:**
- Vercel (Edge Runtime, Preview Deployments)

### Design System

**Quellen:**
- [`wiki/design-system/design-guidelines.md`](../../wiki/design-system/design-guidelines.md)
- [`config/design-tokens.ts`](../../config/design-tokens.ts)
- [`app/globals.css`](../../app/globals.css)

**Design-Tokens:**
- **Primary-Farbe:** `#343f60` (Dunkles Navy-Blau)
  - HSL: `hsl(225 29.73% 29.02%)`
  - CSS: `--color-primary: hsl(225 29.73% 29.02%)`
  - Tailwind: `bg-primary`, `text-primary`
- **Farben:** `bg-primary`, `text-foreground`, `bg-card`, `text-muted-foreground`, `bg-success`, `bg-warning`, `bg-destructive`
- **Rundungen:** Cards = `rounded-2xl`, Buttons = `rounded-xl`, Badges = `rounded-md`
- **Spacing:** Standard `gap-5` (statt `gap-4`/`gap-6`)
- **Aktive Tabs:** `bg-primary text-primary-foreground`

**Verboten:**
- ❌ Hardcoded Farben: `bg-white`, `text-white`, `bg-slate-*`, `text-slate-*`
- ❌ Falsche Rundungen: `rounded-lg` (außer für Badges)
- ❌ Falsche Spacing: `gap-4`, `gap-6` (außer spezifischen Fällen)

**Wichtig:** Tenant-Komponenten verwenden `primaryColor` aus Branding (korrekt für Tenant-spezifische Branding).

---

## 3. CODEBASE-ANALYSE

### Verstöße & Probleme

**Quelle:** [`docs/CPO_VOLLSTAENDIGE_SYSTEMATISCHE_ANALYSE.md`](./CPO_VOLLSTAENDIGE_SYSTEMATISCHE_ANALYSE.md)

**Design-Verstöße:**
- ✅ Primary-Farbe korrigiert (`#343f60` in `app/globals.css`)
- ⚠️ Wiki-Dokumentation definiert Primary als `#0066FF` (muss aktualisiert werden)
- ✅ CSS verwendet jetzt HSL statt Hex in `@theme inline`

**Code-Qualität:**
- ✅ TypeScript strict mode aktiv
- ✅ ESLint konfiguriert
- ✅ Pre-Commit Hooks aktiv

### Umsetzungsplan

**Phase 1: Design-Verstöße beheben (KRITISCH)** ✅
1. ✅ Hardcoded Farben ersetzen
2. ✅ Rundungen korrigieren
3. ✅ Spacing korrigieren
4. ✅ Primary-Farbe korrigiert

**Phase 2: Code-Qualität optimieren** ⏳
1. ⏳ TypeScript-Prüfung (`any`-Types)
2. ⏳ Console-Log-Prüfung

**Phase 3: Performance-Optimierungen** ⏳
1. ⏳ Optimistic UI Updates
2. ⏳ Caching-Strategien

**Phase 4: DSGVO-Compliance prüfen** ⏳
1. ⏳ RLS-Policies prüfen
2. ⏳ Bearbeiter-Tracking validieren

**Phase 5: AI-Modelle prüfen** ⏳
1. ⏳ Nur Hugging Face verwenden

---

## 4. AUTOMATISIERUNG & CI/CD

### AI Agent Integration

**Dateien:**
- [`lib/ai/cpo-agent-integration.ts`](../../lib/ai/cpo-agent-integration.ts) - Core Agent
- [`lib/ai/cpo-agent-runtime.ts`](../../lib/ai/cpo-agent-runtime.ts) - Runtime Integration

**Funktionen:**
- Design-Token-Validierung
- Code-Qualität-Validierung
- DSGVO-Compliance-Validierung
- Automatische Fixes
- Runtime-Validierung (Development-Mode)

**Verwendung:**
```typescript
import { cpoAgent } from "@/lib/ai/cpo-agent-integration"

const result = await cpoAgent.validateFile("app/page.tsx")
if (!result.valid) {
  await cpoAgent.autoFix("app/page.tsx")
}
```

**Runtime-Integration (Development):**
```typescript
import { useCPOValidation } from "@/lib/ai/cpo-agent-runtime"

// In React Components
useCPOValidation("ComponentName")
```

**Pre-Commit Hook:**
- Validiert automatisch geänderte Dateien
- Siehe [`.husky/pre-commit`](../../.husky/pre-commit)

### GitHub Actions

**Workflows:**
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) - CI/CD Pipeline
- [`.github/workflows/design-validation.yml`](../../.github/workflows/design-validation.yml) - Design-Validierung
- [`.github/workflows/auto-fix.yml`](../../.github/workflows/auto-fix.yml) - Auto-Fix-Workflows
- [`.github/workflows/cpo-agent.yml`](../../.github/workflows/cpo-agent.yml) - CPO AI Agent

**Quality Gates:**
- Linting
- Type Checking
- Unit Tests
- E2E Tests
- Design-Validierung
- Security Checks
- DSGVO-Compliance

### Pre-Commit Hooks

**Dateien:**
- [`.husky/pre-commit`](../../.husky/pre-commit)
- [`.husky/pre-push`](../../.husky/pre-push)

**Pre-Commit Phasen:**
1. Linting
2. Type Checking
3. Design-Validierung
4. SQL-Validierung
5. Abhängigkeits-Prüfung
6. Auto-Formatierung

**Pre-Push Phasen:**
1. Build Test
2. Abhängigkeits-Prüfung

---

## 5. DSGVO & COMPLIANCE

### RLS-Policies

**Quellen:**
- [`docs/CPO_SUPABASE_VOLLSTAENDIGE_ANALYSE.md`](./CPO_SUPABASE_VOLLSTAENDIGE_ANALYSE.md)
- [`scripts/031_fix_dsgvo_company_separation.sql`](../../scripts/031_fix_dsgvo_company_separation.sql)

**Status:**
- ✅ Migration 031 entfernt alle Master-Admin-Policies
- ✅ Strikte company-basierte Trennung
- ⚠️ Partner-System hat noch Master-Admin-Referenzen (zu beheben)
- ⚠️ Wiki-System RLS sollte company-basiert sein

**Helper-Funktionen:**
- `auth_user_company_id()` - Gibt company_id zurück
- `auth_user_is_owner()` - Prüft ob User Owner ist
- ❌ `auth_is_master_admin()` - ENTFERNT (DSGVO-Verletzung)

### Bearbeiter-Tracking

**Quelle:** [`scripts/033_add_created_updated_by.sql`](../../scripts/033_add_created_updated_by.sql)

**Implementiert:**
- `bookings.created_by`, `bookings.updated_by`
- `invoices.created_by`, `invoices.updated_by`
- `quotes.created_by`, `quotes.updated_by`
- Automatische Trigger für `updated_by`

### Daten-Trennung

**Status:**
- ✅ Jedes Unternehmen sieht NUR seine eigenen Daten
- ✅ Keine Master-Admin-Policies mehr
- ✅ Strikte company-basierte RLS

---

## 6. ENTWICKLUNGSUMGEBUNG

### VS Code Konfiguration

**Datei:** [`.vscode/settings.json`](../../.vscode/settings.json)

**Features:**
- Auto-Formatting (Prettier)
- ESLint Auto-Fix on Save
- Import Organization on Save
- TypeScript IntelliSense (Workspace TS SDK)
- Tailwind CSS IntelliSense
- File Associations

### TypeScript Konfiguration

**Datei:** [`tsconfig.json`](../../tsconfig.json)

**Einstellungen:**
- `target: "ES2022"`
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`

### ESLint Konfiguration

**Datei:** [`.eslintrc.json`](../../.eslintrc.json)

**Rules:**
- Next.js & TypeScript Rules
- Warnings für unused variables
- Warnings für `any` types
- Warnings für `console.log`

---

## 7. ARBEITSWEISE & PROZESSE

### Fehlerliste & Tracking

**Quelle:** [`wiki/errors/fehlerliste.md`](../../wiki/errors/fehlerliste.md)

**Kategorien:**
- Critical, High, Medium, Low
- Bug, Feature, Performance, Security, UX, Design

### Schaltplan Architektur

**Quelle:** [`docs/SCHALTPLAN_ARCHITEKTUR.md`](./SCHALTPLAN_ARCHITEKTUR.md)

**Bereiche:**
- Client-Layer
- API-Layer
- Data-Layer
- Design System
- Deployment Pipeline

### Optimierte Konfigurationen

**Quelle:** [`docs/KONFIGURATION_OPTIMIERT.md`](./KONFIGURATION_OPTIMIERT.md)

**Bereiche:**
- TypeScript
- ESLint
- VS Code
- Next.js
- Git
- Environment Variables

---

## 8. LOKALE DATEN & KONFIGURATIONEN

### Lokale Environment-Variablen

**Hinweis:** Diese Daten wurden vor der Cloud-Migration lokal verwendet.

**Erwartete Variablen (`.env.local` - nicht im Repo):**
```env
# Supabase (Lokal)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_ROLE_KEY=local_service_role_key

# Stripe (Test)
STRIPE_SECRET_KEY=sk_test_local
STRIPE_PUBLISHABLE_KEY=pk_test_local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_local

# AI (NUR Hugging Face)
HUGGINGFACE_API_KEY=local_hf_key

# Vercel (Optional)
VERCEL_URL=localhost:3000
VERCEL_ENV=development

# CRON (Optional)
CRON_SECRET=local_cron_secret
```

**Aktion:** Diese müssen in Cloud-Environment-Variablen migriert werden.

**Dokumentation:** Siehe [`docs/CPO_SYSTEMATISCHE_ANALYSE_V4_VERBINDUNGEN_UND_CACHE.md`](./CPO_SYSTEMATISCHE_ANALYSE_V4_VERBINDUNGEN_UND_CACHE.md)

### Lokale Datenbank-Konfiguration

**Supabase Local:**
- Port: 54321
- PostgreSQL: localhost:54322
- Studio: http://localhost:54323

**Migrations:**
- Alle SQL-Migrationen in `scripts/*.sql`
- Reihenfolge: Siehe [`docs/CPO_SUPABASE_VOLLSTAENDIGE_ANALYSE.md`](./CPO_SUPABASE_VOLLSTAENDIGE_ANALYSE.md)

### Lokale Test-Daten

**Hinweis:** Lokale Test-Daten müssen dokumentiert werden für:
- Entwicklung
- Testing
- QA

**Aktion:** Test-Daten-Script erstellen.

---

## 9. QUICK LINKS

### Dokumentation
- [Vollständige Systematische Analyse V3](./CPO_VOLLSTAENDIGE_SYSTEMATISCHE_ANALYSE_V3.md)
- [Systematische Analyse V4 - Verbindungen & Cache](./CPO_SYSTEMATISCHE_ANALYSE_V4_VERBINDUNGEN_UND_CACHE.md)
- [Bugfix Primary-Farbe](./CPO_BUGFIX_PRIMARY_COLOR.md)
- [Automatisierung Abgeschlossen](./CPO_AUTOMATISIERUNG_ABGESCHLOSSEN.md)
- [Supabase-Analyse](./CPO_SUPABASE_VOLLSTAENDIGE_ANALYSE.md)

### Vorgaben
- [CPO-Rolle](../../AAAPlanung/ROLLE_CHIEF_PRODUCT_OFFICER_CPO.txt)
- [CPO-Auftrag](../../AAAPlanung/AI_AGENTEN_CPO_AUFTRAG.txt)
- [System-Fertigstellung](../../AAAPlanung/MYDISPATCH%20SYSTEM%20-%20VOLLSTÄNDIGE%20FERTIGSTELLUNG.txt)
- [Planungs-Prompt](../../AAAPlanung/planung.txt)

### Wiki
- [Architektur](../../wiki/02-architektur.md)
- [Seiten-Struktur](../../wiki/03-seiten-struktur.md)
- [Datenbank](../../wiki/06-datenbank.md)
- [Design-Guidelines](../../wiki/design-system/design-guidelines.md)
- [Requirements](../../wiki/docs/requirements.md)
- [Developer Guide](../../wiki/docs/developer-guide.md)
- [Fehlerliste](../../wiki/errors/fehlerliste.md)
- [QA-Prompts](../../wiki/qa/master-prompt.md)

### Code
- [CPO AI Agent Integration](../../lib/ai/cpo-agent-integration.ts)
- [Design-Tokens](../../config/design-tokens.ts)
- [Globals CSS](../../app/globals.css)

---

**Erstellt von:** CPO & Lead Architect  
**Letzte Aktualisierung:** 2024  
**Version:** 2.0.0
