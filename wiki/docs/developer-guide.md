# Developer Guide

## Projekt-Setup

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Git
- Supabase Account
- Stripe Account

### Installation

\`\`\`bash
# Repository klonen
git clone [repo-url]
cd mydispatch

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen
cp .env.example .env.local
# Variablen ausfüllen

# Entwicklungsserver starten
npm run dev
\`\`\`

### Umgebungsvariablen

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Redirect URL für Auth
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## Projektstruktur

\`\`\`
mydispatch/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-Routen
│   ├── (dashboard)/       # Dashboard-Routen
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   └── [slug]/            # Tenant Landingpages
├── components/
│   ├── ui/                # shadcn/ui Komponenten
│   ├── design-system/     # V28 Design System
│   ├── layout/            # Layout-Komponenten
│   └── shared/            # Gemeinsame Komponenten
├── hooks/                 # Custom React Hooks
├── lib/
│   ├── supabase/          # Supabase Clients
│   └── tariff/            # Tarif-Logik
├── scripts/               # SQL Migrations
├── wiki/                  # Dokumentation
└── docs/                  # Go-Live Dokumente
\`\`\`

## Coding Standards

### TypeScript
- Strict Mode aktiviert
- Keine `any` Types
- Interfaces für alle Props
- Explizite Return-Types

### React
- Functional Components mit Hooks
- Server Components als Standard
- Client Components nur wenn nötig ("use client")
- Props Destructuring

### Tailwind CSS
- Mobile-First Responsive Design
- Design Tokens verwenden
- Keine Inline-Styles
- Konsistente Spacing-Skala

### Git Workflow
- Feature Branches: `feature/xxx`
- Bugfix Branches: `bugfix/xxx`
- Commit-Messages: Conventional Commits
- Pull Requests für alle Änderungen

## Wichtige Patterns

### Server Actions
\`\`\`typescript
"use server"
import { createClient } from "@/lib/supabase/server"

export async function myAction(data: FormData) {
  const supabase = await createClient()
  // ... Logik
}
\`\`\`

### Supabase Client (Browser)
\`\`\`typescript
"use client"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
\`\`\`

### Supabase Client (Server)
\`\`\`typescript
import { createClient } from "@/lib/supabase/server"

export async function getData() {
  const supabase = await createClient()
  const { data } = await supabase.from("table").select()
  return data
}
\`\`\`

## Testing

\`\`\`bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Lint
npm run lint

# Type Check
npm run type-check
\`\`\`

## Deployment

\`\`\`bash
# Build testen
npm run build

# Preview Deployment
vercel

# Production Deployment
vercel --prod
