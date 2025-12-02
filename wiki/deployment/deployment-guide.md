# Deployment Guide

## Voraussetzungen

### Software
- Node.js 18+
- npm oder yarn
- Git

### Accounts
- Supabase Account
- Stripe Account
- Vercel Account (optional)
- GitHub Account

## Schritt-für-Schritt Anleitung

### 1. Repository klonen

\`\`\`bash
git clone [repo-url]
cd mydispatch
\`\`\`

### 2. Abhängigkeiten installieren

\`\`\`bash
npm install
\`\`\`

### 3. Umgebungsvariablen

\`\`\`bash
cp .env.example .env.local
\`\`\`

Variablen ausfüllen:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# URLs
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com/auth/callback
\`\`\`

### 4. Datenbank-Migrationen

Im Supabase SQL Editor ausführen:

\`\`\`bash
# In dieser Reihenfolge:
scripts/001_create_core_schema.sql
scripts/002_create_triggers.sql
scripts/003_create_functions.sql
scripts/006_add_subscription_system.sql
scripts/010_fix_rls_infinite_recursion.sql
scripts/011_create_wiki_system.sql
\`\`\`

### 5. Stripe-Produkte erstellen

\`\`\`bash
npm run setup:stripe
\`\`\`

Oder manuell in Stripe Dashboard:
- Starter: 49€/Monat, 470€/Jahr
- Business: 99€/Monat, 950€/Jahr
- Fleet & Driver Add-On: 9€/Monat

### 6. Build testen

\`\`\`bash
npm run build
\`\`\`

### 7. Lokal testen

\`\`\`bash
npm run dev
\`\`\`

## Vercel Deployment

### Option A: Via GitHub

1. Repository zu GitHub pushen
2. In Vercel: "Import Project"
3. GitHub Repository auswählen
4. Umgebungsvariablen setzen
5. Deploy

### Option B: Via CLI

\`\`\`bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Production
vercel --prod
\`\`\`

### Umgebungsvariablen in Vercel

Settings → Environment Variables:

| Variable | Environment |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | All |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | All |
| SUPABASE_SERVICE_ROLE_KEY | Production, Preview |
| STRIPE_SECRET_KEY | Production, Preview |
| STRIPE_PUBLISHABLE_KEY | Production |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | All |

## Post-Deployment

### 1. Domain konfigurieren
- In Vercel: Settings → Domains
- DNS Records setzen

### 2. Stripe Webhooks
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events: checkout.session.completed, invoice.paid, customer.subscription.*

### 3. Monitoring aktivieren
- Vercel Analytics
- Error Tracking (Sentry)

### 4. Backup-Strategie
- Supabase: Point-in-Time Recovery aktivieren
- Regelmäßige Database Dumps

## Rollback

### Bei Fehlern

\`\`\`bash
# Letzte erfolgreiche Deployment wiederherstellen
vercel rollback
\`\`\`

### Datenbank-Rollback

\`\`\`sql
-- Letzte Migration rückgängig machen
-- (Spezifisch für jede Migration)
\`\`\`

## Checkliste

- [ ] Alle Umgebungsvariablen gesetzt
- [ ] Datenbank-Migrationen ausgeführt
- [ ] RLS Policies aktiv
- [ ] Stripe-Produkte erstellt
- [ ] Webhook konfiguriert
- [ ] Domain konfiguriert
- [ ] SSL aktiv
- [ ] Monitoring aktiviert
- [ ] Backup konfiguriert
