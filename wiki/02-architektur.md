# Architektur

## Tech Stack

### Frontend
- **Next.js 16** - App Router, Server Components, Server Actions
- **React 19** - Latest features inkl. useEffectEvent
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - UI Component Library (für Dashboard)

### Backend
- **Supabase** - PostgreSQL, Auth, Row Level Security
- **Stripe** - Subscriptions & Payments

### Deployment
- **Vercel** - Edge Runtime, Preview Deployments

## Verzeichnisstruktur

\`\`\`
mydispatch-cursor/
├── app/                     # Next.js App Router
│   ├── (marketing)/         # Pre-Login Seiten
│   ├── auth/                # Auth-Seiten
│   ├── dashboard/           # Geschützter Bereich
│   └── api/                 # Route Handlers
├── components/
│   ├── layout/              # Layout-Komponenten
│   ├── marketing/           # Marketing-Komponenten
│   └── ui/                  # shadcn/ui Komponenten
├── lib/                     # Utilities
├── scripts/                 # SQL-Migrations
└── wiki/                    # Diese Dokumentation
\`\`\`

## Datenfluss

\`\`\`
User → Pre-Login Pages → Auth (Supabase) → Dashboard
                           ↓
                    Stripe Checkout
                           ↓
                    Subscription Active
