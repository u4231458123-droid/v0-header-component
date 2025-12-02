# MyDispatch - Professionelle Fuhrpark- und Auftragsverwaltung

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mydispatchs-projects/v0-header-component)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/sBCRQ9pBmG4)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

## 🚀 Überblick

MyDispatch ist eine vollumfängliche SaaS-Plattform für Personenbeförderungsunternehmen. Die Anwendung bietet:

- **Auftragsverwaltung**: Erstellen, verwalten und verfolgen Sie Fahraufträge
- **Kundenportal**: Self-Service für Ihre Kunden
- **Fahrerportal**: Mobile-optimierte Ansicht für Fahrer
- **Flottenverwaltung**: Fahrer und Fahrzeuge organisieren
- **Finanzmodul**: Rechnungen, Angebote und Kassenbuch
- **Partner-System**: White-Label Landingpages für Mandanten

## 🏗️ Architektur

\`\`\`
├── app/                    # Next.js App Router Pages
│   ├── api/               # API Routes (AI, Billing, Contact, Webhooks)
│   ├── dashboard/         # Hauptdashboard
│   ├── auftraege/         # Auftragsverwaltung
│   ├── finanzen/          # Finanzen (Rechnungen, Angebote, Kassenbuch)
│   ├── fleet/             # Flottenverwaltung
│   ├── kunden/            # Kundenverwaltung
│   ├── auth/              # Authentifizierung
│   └── c/[company]/       # Dynamische Mandanten-Landingpages
├── components/            # React Komponenten
│   ├── design-system/     # Wiederverwendbare UI-Komponenten
│   ├── bookings/          # Auftrags-Komponenten
│   ├── finanzen/          # Finanz-Komponenten
│   ├── layout/            # Layout-Komponenten (Sidebar, Header)
│   └── ui/                # shadcn/ui Basis-Komponenten
├── lib/                   # Utilities und Services
│   ├── supabase/          # Supabase Client
│   ├── ai/                # AI-Konfiguration
│   └── stripe/            # Stripe-Integration
└── hooks/                 # Custom React Hooks
\`\`\`

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Sprache**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui + Radix UI
- **Auth & DB**: Supabase
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

## 📦 Installation

\`\`\`bash
# Dependencies installieren
pnpm install

# Development Server starten
pnpm dev

# Production Build
pnpm build
\`\`\`

## 🔐 Umgebungsvariablen

Erstellen Sie eine `.env.local` Datei:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-key
OPENAI_API_KEY=your-openai-key
\`\`\`

## 📄 Lizenz

Proprietär - © 2025 MyDispatch. Alle Rechte vorbehalten.
