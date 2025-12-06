# MyDispatch Project Specifications

**Version:** 3.0 (NEO-GENESIS Hyper-Stack)
**Standard:** DIN/ISO-Compliant & AI-Native
**Source of Truth:** Diese Datei ist die verbindliche Spezifikation für "The Enforcer"

---

## 5.1 Tech Constraints (Non-Negotiable)

### Backend
- **Supabase** (Schema First). Keine manuellen SQL-Migrationen ohne Validierung.
- **Trigger.dev** für Async Tasks (>10s Laufzeit).

### Frontend
- **Next.js 16+** App Router (TypeScript Strict Mode).
- **Vercel AI SDK** (Core & UI) für AI-Integration.

### Styling
- **Tailwind CSS + Shadcn/UI**. Keine CSS-Modules.
- **Design-Tokens** aus `config/design-tokens.ts` verwenden.
- **Keine hardcoded Farben** - nur Design-Tokens.

### AI
- **Vercel AI SDK** (Core & UI).
- **Hugging Face MCP** für AI-Modelle (NUR Hugging Face, keine anderen AI-APIs).

### Jobs
- **Trigger.dev** für Async Tasks.

---

## 5.2 Quality Gates

### CodeRabbit
- Muss den PR approven.
- Security- und Performance-Checks müssen bestanden werden.

### Octomind
- Darf keine kritischen UI-Fehler finden.
- Alle kritischen User-Journeys müssen funktionieren.

### Swimm
- Code-Coverage muss > 80% dokumentiert sein.
- Neue Features müssen dokumentiert werden.

### TypeScript
- Strict Mode: Keine `any`-Types ohne Kommentar.
- Alle Dateien müssen type-checked sein.

### Tests
- E2E-Tests müssen für kritische User-Journeys vorhanden sein.
- Unit-Tests für komplexe Business-Logik.

---

## 5.3 Sprach- & Design-Regeln

### Code
- **Englisch** (Variablen, Funktionen, Klassen, Interfaces).
- **camelCase** für Variablen und Funktionen.
- **PascalCase** für Klassen und Interfaces.
- **kebab-case** für Dateinamen (außer React-Komponenten: PascalCase).

### UI
- **Deutsch** (Sie-Form, DIN 5008).
- **Keine verbotenen Begriffe**: kostenlos, gratis, free, testen, trial, etc.
- **Professionelle Sprache**: Fachmännisch und menschlich.

### UX
- **Optimistic UI** überall (Nutze `useOptimistic` aus React/Next.js).
- **Loading States** für alle async Operationen.
- **Error Boundaries** für Fehlerbehandlung.

### Design
- **Rundungen**: Cards = `rounded-2xl`, Buttons = `rounded-xl`, Badges = `rounded-md`.
- **Spacing**: Standard `gap-5` (statt `gap-4`/`gap-6`).
- **Aktive Tabs**: `bg-primary text-primary-foreground`.
- **Keine Custom CSS** - nur Tailwind Utility Classes.

---

## 5.4 Architecture Rules

### Datenbank
- **Row Level Security (RLS)** für alle Tabellen.
- **Keine Master-Admin-Policies** - nur company-basierte RLS.
- **Bearbeiter-Tracking**: `created_by` und `updated_by` bei allen relevanten Tabellen.

### API
- **Server Actions** für Daten-Mutationen.
- **API Routes** nur für externe Webhooks oder spezielle Fälle.
- **Zod-Validierung** für alle Inputs.

### Components
- **Server Components** als Default.
- **Client Components** nur wenn notwendig (`"use client"`).
- **Reusable Components** in `components/shared/`.

---

## 5.5 Security Rules

### Authentication
- **Supabase Auth** für alle Authentifizierung.
- **Session-Management** über Supabase SSR.

### Authorization
- **RLS-Policies** für Datenbank-Zugriff.
- **Role-Based Access Control** (RBAC) für UI-Features.

### Data Protection
- **DSGVO-Compliance**: Keine Master-Admin-Policies.
- **Company-Separation**: Jedes Unternehmen sieht nur eigene Daten.
- **PII-Handling**: Sensible Daten verschlüsselt speichern.

---

## 5.6 Performance Rules

### Frontend
- **Code-Splitting**: Automatisch via Next.js App Router.
- **Image Optimization**: Next.js Image Component.
- **Bundle Size**: Max 500KB initial load.

### Backend
- **Database Queries**: Optimiert mit Indizes.
- **Caching**: Next.js Cache für statische Daten.
- **Background Jobs**: Trigger.dev für langlaufende Tasks.

---

## 5.7 Documentation Rules

### Code Documentation
- **JSDoc** für alle öffentlichen Funktionen.
- **Swimm-Docs** für komplexe Features.
- **README.md** für jedes größere Modul.

### Architecture Documentation
- **Eraser.io Diagramme** für Architektur-Änderungen.
- **ADRs** (Architecture Decision Records) für wichtige Entscheidungen.

---

## 5.8 Git & Commit Rules

### Commit Messages
- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- **Detaillierte Beschreibung** der Änderungen.
- **Breaking Changes** explizit markieren.

### Branch Strategy
- **main**: Production-ready Code.
- **develop**: Development Branch.
- **feature/**: Feature-Branches.

### Pull Requests
- **Beschreibung** der Änderungen.
- **Tests** müssen bestanden sein.
- **CodeRabbit** muss approven.
- **Enforcer** muss PASS sein.

---

## 5.9 Monitoring & Logging

### Logging
- **Structured Logging** mit Kontext.
- **Error Tracking** für alle Fehler.
- **Performance Monitoring** für kritische Operationen.

### Alerts
- **Build-Failures**: Sofortige Benachrichtigung.
- **Deployment-Failures**: Automatischer Rollback.
- **Security-Issues**: Sofortige Eskalation.

---

## 5.10 Compliance

### DSGVO
- **Datenminimierung**: Nur notwendige Daten sammeln.
- **Recht auf Löschung**: Implementiert für alle User-Daten.
- **Datenportabilität**: Export-Funktion für User-Daten.

### Accessibility
- **WCAG 2.1 AA** Compliance.
- **Screen-Reader-Support** für alle UI-Elemente.
- **Keyboard-Navigation** für alle interaktiven Elemente.

---

## 5.11 Enforcer Validation Rules

Der Enforcer prüft automatisch:

1. ✅ **Variablen Englisch**: Keine deutschen Variablennamen.
2. ✅ **UI-Text Deutsch**: Alle UI-Texte auf Deutsch.
3. ✅ **Tailwind Utility Classes**: Kein Custom CSS.
4. ✅ **Swimm-Doku Updates**: Neue Features dokumentiert.
5. ✅ **Verbotene Begriffe**: Keine kostenlos/gratis/testen/etc.

Bei Verletzungen: **Merge wird blockiert**.

