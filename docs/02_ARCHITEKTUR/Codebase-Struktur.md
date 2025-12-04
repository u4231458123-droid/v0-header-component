# MyDispatch - Codebase-Struktur

**Version:** 1.0.0  
**Erstellt:** 2024  
**Status:** ✅ Vollständig

---

## Übersicht

Diese Dokumentation beschreibt die vollständige Struktur der MyDispatch-Codebase, organisiert nach Funktionalität und Architektur-Prinzipien.

---

## Projekt-Struktur

```
MyDispatch/
│
├── 📁 app/                          # Next.js App Router
│   ├── (dashboard)/                 # Dashboard-Route-Gruppe
│   │   └── mydispatch/
│   │       └── chat/
│   ├── (prelogin)/                  # Pre-Login-Route-Gruppe
│   │   ├── fragen/
│   │   ├── kontakt/
│   │   └── preise/
│   ├── actions/                     # Server Actions
│   │   ├── auth.ts
│   │   ├── stripe.ts
│   │   └── create-subscription.ts
│   ├── admin/                       # Admin-Dashboard
│   ├── agb/                         # AGB-Seite
│   ├── api/                         # API Routes
│   │   ├── ai/                      # AI-Endpoints
│   │   ├── auth/                    # Auth-Endpoints
│   │   ├── bookings/                # Booking-Endpoints
│   │   ├── chat/                    # Chat-Endpoints
│   │   ├── contact/                 # Contact-Endpoints
│   │   ├── cron/                    # Cron-Jobs
│   │   ├── email/                   # Email-Endpoints
│   │   ├── maps/                    # Maps-Endpoints
│   │   ├── team/                    # Team-Endpoints
│   │   └── webhooks/                # Webhook-Endpoints
│   ├── auftraege/                   # Auftragsverwaltung
│   ├── auth/                        # Authentifizierung
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── c/[company]/                 # Tenant-Landingpages
│   │   ├── agb/
│   │   ├── datenschutz/
│   │   ├── fahrer/portal/
│   │   ├── kunde/
│   │   │   ├── buchen/
│   │   │   └── portal/
│   │   └── login/
│   ├── contact/                     # Kontakt-Seite
│   ├── dashboard/                   # Haupt-Dashboard
│   ├── datenschutz/                 # Datenschutz-Seite
│   ├── docs/                        # Dokumentations-Seite
│   ├── einstellungen/               # Einstellungen
│   ├── fahrer/                      # Fahrer-Verwaltung
│   ├── fahrer-portal/               # Fahrer-Portal
│   ├── faq/                         # FAQ-Seite
│   ├── finanzen/                    # Finanzmodul
│   ├── fleet/                       # Flottenverwaltung
│   ├── impressum/                   # Impressum
│   ├── ki-vorschriften/             # KI-Vorschriften
│   ├── kunden/                      # Kunden-Verwaltung
│   ├── kunden-portal/               # Kunden-Portal
│   ├── mydispatch/                  # MyDispatch-Chat
│   ├── partner/                     # Partner-System
│   ├── pricing/                     # Pricing-Seite
│   ├── rechnungen/                  # Rechnungen
│   ├── statistiken/                 # Statistiken
│   ├── subscription-required/       # Subscription-Required
│   ├── terms/                       # Terms-Seite
│   ├── widget/                      # Widget-System
│   ├── layout.tsx                   # Root-Layout
│   ├── page.tsx                     # Homepage
│   └── globals.css                  # Globale Styles
│
├── 📁 components/                   # React-Komponenten
│   ├── bookings/                    # Booking-Komponenten
│   │   ├── BookingDetailsDialog.tsx
│   │   ├── CreateBookingDialog.tsx
│   │   ├── EditBookingDialog.tsx
│   │   └── NewBookingDialog.tsx
│   ├── customers/                   # Customer-Komponenten
│   ├── dashboard/                   # Dashboard-Komponenten
│   ├── drivers/                     # Driver-Komponenten
│   │   ├── DriverDetailsDialog.tsx
│   │   ├── EditDriverDialog.tsx
│   │   ├── NewDriverDialog.tsx
│   │   └── VehiclesTable.tsx
│   ├── finanzen/                    # Finance-Komponenten
│   │   ├── EditInvoiceDialog.tsx
│   │   ├── InvoiceDetailsDialog.tsx
│   │   ├── NewInvoiceDialog.tsx
│   │   └── QuoteDetailsDialog.tsx
│   ├── layout/                      # Layout-Komponenten
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── maps/                        # Maps-Komponenten
│   │   └── AddressAutocomplete.tsx
│   ├── onboarding/                   # Onboarding-Komponenten
│   │   ├── DashboardTour.tsx
│   │   ├── FirstStepsWizard.tsx
│   │   └── DashboardTourWrapper.tsx
│   ├── settings/                    # Settings-Komponenten
│   │   ├── SettingsPageClient.tsx
│   │   ├── TeamManagement.tsx
│   │   └── EmployeeDetailsDialog.tsx
│   └── ui/                          # UI-Basis-Komponenten
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
├── 📁 lib/                          # Utilities und Services
│   ├── ai/                          # AI-Integration
│   │   ├── bots/                    # Bot-Implementierungen
│   │   │   ├── master-bot.ts
│   │   │   ├── quality-bot.ts
│   │   │   └── system-bot.ts
│   │   └── huggingface.ts           # Hugging Face Client
│   ├── design-system/               # Design-System
│   │   └── DESIGN_GUIDELINES.md
│   ├── knowledge-base/             # Knowledge-Base
│   │   ├── documentation-api.ts
│   │   ├── knowledge-base-structure.md
│   │   └── bot-instructions/
│   ├── maps/                        # Maps-Integration
│   ├── stripe/                      # Stripe-Integration
│   ├── supabase/                    # Supabase-Clients
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils/                       # Utilities
│       ├── sql-validator.ts
│       ├── toast-helpers.ts
│       └── safe-number.ts
│
├── 📁 config/                       # Konfiguration
│   ├── design-tokens.ts             # Design-Tokens
│   └── ...
│
├── 📁 scripts/                      # Scripts
│   ├── cicd/                        # CI/CD-Scripts
│   └── *.sql                        # SQL-Migrationen
│
├── 📁 docs/                         # Dokumentation
│   ├── 00_MASTER_INDEX.md
│   ├── DOKUMENTATIONSKONZEPT_MASTER.md
│   └── ...
│
├── 📁 wiki/                         # Wiki-Dokumentation
│   ├── architecture/
│   ├── changelog/
│   ├── ci-cd/
│   ├── deployment/
│   ├── design-system/
│   ├── docs/
│   ├── integrations/
│   └── ...
│
├── 📁 AAAPlanung/                   # Vorgaben
│   ├── ROLLE_CHIEF_PRODUCT_OFFICER_CPO.txt
│   ├── AI_AGENTEN_CPO_AUFTRAG.txt
│   ├── MYDISPATCH SYSTEM - VOLLSTÄNDIGE FERTIGSTELLUNG.txt
│   └── planung.txt
│
├── 📁 public/                       # Statische Assets
│   ├── images/
│   └── ...
│
├── 📁 types/                        # TypeScript-Types
│   └── ...
│
├── 📁 hooks/                        # Custom React Hooks
│   └── ...
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Architektur-Prinzipien

### 1. Next.js App Router

**Struktur:**
- Route-Gruppen: `(dashboard)`, `(prelogin)`
- Dynamic Routes: `[company]`, `[slug]`
- Server Components: Standard (wenn möglich)
- Client Components: `"use client"` nur wenn nötig

**Beispiele:**
- `/dashboard` → Server Component
- `/dashboard/fahrer-chat` → Client Component (Chat-Funktionalität)

### 2. Komponenten-Architektur

**Atomic Design:**
- **Atoms:** `components/ui/*` (Button, Input, etc.)
- **Molecules:** Kombinationen von Atoms
- **Organisms:** Komplexe Komponenten (Dialogs, Forms)
- **Templates:** Layout-Komponenten
- **Pages:** Route-Komponenten

**Beispiele:**
- Atom: `components/ui/button.tsx`
- Molecule: `components/ui/dialog.tsx` (Button + Overlay)
- Organism: `components/bookings/CreateBookingDialog.tsx`
- Template: `components/layout/MainLayout.tsx`
- Page: `app/dashboard/page.tsx`

### 3. Datenfluss

**Pattern:**
```
Page (Server Component)
  ↓
  Fetches Data (Supabase)
  ↓
  Passes Props to Client Components
  ↓
  Client Components handle Interactions
  ↓
  API Routes / Server Actions
  ↓
  Database Updates
```

**Beispiel:**
```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await fetchData(); // Server-side
  return <DashboardClient data={data} />; // Client Component
}
```

### 4. State Management

**Strategien:**
- **Server State:** Supabase Queries (Server Components)
- **Client State:** React Hooks (useState, useReducer)
- **Global State:** Context API (nur wenn nötig)
- **Form State:** React Hook Form
- **Cache:** React Query (geplant)

### 5. API-Struktur

**Pattern:**
```
app/api/[category]/[endpoint]/route.ts
```

**Kategorien:**
- `ai/` - AI-Endpoints
- `auth/` - Authentifizierung
- `bookings/` - Buchungen
- `chat/` - Chat-Funktionalität
- `contact/` - Kontakt
- `cron/` - Cron-Jobs
- `email/` - Email-Versand
- `maps/` - Maps-Integration
- `team/` - Team-Management
- `webhooks/` - Webhooks

---

## Wichtige Dateien

### Konfiguration

**`package.json`**
- Dependencies und Scripts
- Version: Node.js 20+

**`tsconfig.json`**
- TypeScript-Konfiguration
- Strict Mode aktiviert

**`tailwind.config.ts`**
- Tailwind CSS-Konfiguration
- Design-Token-Integration

**`next.config.js`**
- Next.js-Konfiguration
- Environment-Variablen

### Design-System

**`config/design-tokens.ts`**
- Zentrale Design-Tokens
- Farben, Spacing, Typography

**`lib/design-system/DESIGN_GUIDELINES.md`**
- Verbindliche Design-Vorgaben
- UI-Konsistenz-Regeln

### Knowledge-Base

**`lib/knowledge-base/knowledge-base-structure.md`**
- Knowledge-Base-Struktur
- Bot-Instruktionen

**`lib/knowledge-base/documentation-api.ts`**
- Dokumentations-API
- Auto-Documentation-Engine

### Utilities

**`lib/utils/sql-validator.ts`**
- SQL-Validierung
- Verhindert Agent-Fehler

**`lib/utils/toast-helpers.ts`**
- Standardisierte Toast-Funktionen
- UX-Konsistenz

---

## Code-Organisation

### 1. Imports

**Reihenfolge:**
1. React/Next.js
2. Externe Libraries
3. UI-Komponenten
4. Utilities
5. Types
6. Lokale Komponenten

**Beispiel:**
```typescript
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Booking } from "@/types/booking"
import { BookingForm } from "./BookingForm"
```

### 2. Komponenten-Struktur

**Standard:**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Exports
```

### 3. Naming Conventions

**Dateien:**
- Komponenten: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`

**Komponenten:**
- PascalCase: `CreateBookingDialog`
- Props: camelCase: `onSuccess`, `companyId`

**Variablen:**
- camelCase: `isLoading`, `userData`
- Constants: UPPER_SNAKE_CASE: `MAX_RETRIES`

---

## Abhängigkeiten

### Core Dependencies

**Framework:**
- `next@^16` - Next.js Framework
- `react@^19` - React Library
- `react-dom@^19` - React DOM

**Styling:**
- `tailwindcss@^4` - Tailwind CSS
- `@radix-ui/*` - Radix UI Components
- `class-variance-authority` - CVA für Variants

**Backend:**
- `@supabase/supabase-js` - Supabase Client
- `@supabase/ssr` - Supabase SSR

**Payments:**
- `stripe` - Stripe SDK

**AI:**
- Hugging Face MCP (via MCP Server)

### Development Dependencies

**TypeScript:**
- `typescript@^5`
- `@types/node`
- `@types/react`

**Linting:**
- `eslint`
- `@typescript-eslint/*`

**Testing:**
- `jest`
- `@testing-library/react`

---

## Best Practices

### 1. Server vs. Client Components

**Server Components (Standard):**
- Daten-Fetching
- Datenbank-Zugriffe
- Sensitive Operations

**Client Components (Nur wenn nötig):**
- Interaktivität (onClick, onChange)
- Browser-APIs (localStorage, window)
- State Management
- Effects (useEffect)

### 2. Error Handling

**Pattern:**
```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error("Operation failed:", error)
  return { success: false, error: error.message }
}
```

### 3. Type Safety

**Regeln:**
- Keine `any`-Types
- Strikte TypeScript-Konfiguration
- Explizite Type-Definitionen

### 4. Performance

**Optimierungen:**
- Server Components für Daten-Fetching
- Lazy Loading für große Komponenten
- Image-Optimization (next/image)
- Code-Splitting (automatisch)

---

## Verwandte Dokumentationen

- [Systemarchitektur](./Systemarchitektur.md)
- [Datenbank-Schema](./Datenbank-Schema.md)
- [API-Dokumentation](./API-Dokumentation.md)
- [Frontend-Architektur](./Frontend-Architektur.md)
- [Backend-Architektur](./Backend-Architektur.md)

---

**Erstellt von:** CPO & Lead Architect  
**Datum:** 2024  
**Version:** 1.0.0
