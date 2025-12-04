# Schaltplan Architektur - MyDispatch

**Version:** 1.0.0  
**Datum:** 2024  
**Rolle:** CPO & Lead Architect

---

## SYSTEM-ARCHITEKTUR

### Client-Layer

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pre-Login  │  │  Dashboard   │  │   Portale    │ │
│  │   (Marketing)│  │ (Unternehmer)│  │ (Fahrer/Kund)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                         │                              │
│                    ┌─────────┐                         │
│                    │  Layout  │                         │
│                    │ Components│                        │
│                    └─────────┘                         │
│                         │                              │
│                    ┌─────────┐                         │
│                    │ Design  │                         │
│                    │  System  │                        │
│                    └─────────┘                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Komponenten:**
- Pre-Login: Homepage, Pricing, FAQ, Contact
- Dashboard: Buchungen, Fahrer, Kunden, Rechnungen
- Portale: Fahrerportal, Kundenportal, Tenant-Landingpages

**Design System:**
- Design-Tokens (bg-primary, text-foreground, etc.)
- Komponenten (Cards, Buttons, Badges)
- Layout-Komponenten (Header, Sidebar, Footer)

### API-Layer

```
┌─────────────────────────────────────────────────────────┐
│                     API LAYER                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Next.js    │  │   Supabase   │  │    Stripe    │ │
│  │  API Routes  │  │   Client     │  │   Webhooks   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                         │                              │
│                    ┌─────────┐                         │
│                    │  Auth   │                         │
│                    │Middleware│                        │
│                    └─────────┘                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**API-Routes:**
- `/api/auth/*` - Authentifizierung
- `/api/bookings/*` - Buchungen
- `/api/ai/*` - AI-Integration (NUR Hugging Face)
- `/api/webhooks/stripe` - Stripe Webhooks
- `/api/maps/*` - Google Maps

### Data-Layer

```
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              SUPABASE (PostgreSQL)                │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │Companies │  │ Profiles │  │ Customers│      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  │                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │ Drivers  │  │ Vehicles │  │ Bookings │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  │                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │ Invoices │  │  Quotes  │  │Documents │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │         RLS POLICIES (DSGVO)              │  │  │
│  │  │  - Company-basierte Trennung               │  │  │
│  │  │  - Bearbeiter-Tracking                    │  │  │
│  │  │  - Keine Master-Admin-Policies            │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tabellen:**
- Kern-Tabellen: companies, profiles, customers, drivers, vehicles, bookings, invoices, quotes
- System-Tabellen: documents, subscription_plans, partner_*, chat_*, wiki_*

**RLS-Policies:**
- Strikte company-basierte Trennung
- Bearbeiter-Tracking (created_by, updated_by)
- Keine Master-Admin-Policies

---

## DATENFLUSS

### Client-Server

```
Client (Browser)
    │
    ├─► Next.js API Route
    │       │
    │       ├─► Supabase Client (Server)
    │       │       │
    │       │       └─► PostgreSQL (RLS)
    │       │
    │       └─► Response
    │
    └─► UI Update
```

### Optimistic UI Updates

```
User Action
    │
    ├─► Optimistic Update (sofort)
    │       │
    │       └─► UI zeigt Änderung sofort
    │
    └─► Server Request (im Hintergrund)
            │
            ├─► Success → UI bestätigt
            │
            └─► Error → UI rollback + Fehlermeldung
```

---

## DESIGN SYSTEM ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────┐
│                  DESIGN SYSTEM                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            DESIGN TOKENS                         │  │
│  │  (config/design-tokens.ts, app/globals.css)      │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  - Farben: bg-primary, text-foreground, etc.    │  │
│  │  - Rundungen: rounded-xl, rounded-2xl            │  │
│  │  - Spacing: gap-5 (Standard)                    │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │            UI KOMPONENTEN                        │  │
│  │  (components/ui/*, components/design-system/*)    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  - Cards, Buttons, Badges, Inputs                │  │
│  │  - Layout-Komponenten                            │  │
│  │  - Marketing-Komponenten                          │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │            PAGES                                  │  │
│  │  (app/*, components/*)                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## DEPLOYMENT PIPELINE

```
┌─────────────────────────────────────────────────────────┐
│                 DEPLOYMENT PIPELINE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Git Push                                                │
│    │                                                     │
│    ├─► GitHub Actions (CI)                             │
│    │       │                                            │
│    │       ├─► Linting                                  │
│    │       ├─► Type Checking                            │
│    │       ├─► Unit Tests                               │
│    │       ├─► Design Validation                        │
│    │       ├─► SQL Validation                           │
│    │       └─► Build                                   │
│    │                                                     │
│    └─► Vercel Deployment                                │
│            │                                             │
│            ├─► Preview (Pull Requests)                 │
│            └─► Production (main branch)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## AUTHENTIFIZIERUNG & AUTORISIERUNG

```
┌─────────────────────────────────────────────────────────┐
│              AUTHENTIFIZIERUNG FLOW                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Login                                              │
│    │                                                     │
│    ├─► Supabase Auth                                    │
│    │       │                                            │
│    │       ├─► Cookie-basierte Session                  │
│    │       └─► JWT Token                                │
│    │                                                     │
│    ├─► Middleware (middleware.ts)                       │
│    │       │                                            │
│    │       ├─► Token-Refresh (automatisch)              │
│    │       └─► Rollenbasierte Weiterleitung             │
│    │                                                     │
│    └─► Dashboard / Portal                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Rollen:**
- `master` - Master-Admin (⚠️ DSGVO-Verletzung - sollte entfernt werden)
- `admin` - Firmen-Admin
- `dispatcher` - Disponent
- `driver` - Fahrer
- `customer` - Kunde

**RLS-Policies:**
- Strikte company-basierte Trennung
- Jedes Unternehmen sieht NUR seine eigenen Daten

---

## PERFORMANCE-OPTIMIERUNGEN

### Caching-Strategien

```
┌─────────────────────────────────────────────────────────┐
│                  CACHING STRATEGIE                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Browser    │  │   Next.js    │  │   Supabase   │ │
│  │    Cache     │  │    Cache     │  │    Cache     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                         │                              │
│                    ┌─────────┐                         │
│                    │  React  │                         │
│                    │  Query  │                         │
│                    └─────────┘                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Optimistic UI Updates

```
User Action → Optimistic Update → Server Request → Success/Error
```

---

**Erstellt von:** CPO & Lead Architect  
**Datum:** 2024
