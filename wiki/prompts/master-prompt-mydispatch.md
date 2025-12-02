# Master-Prompt: MyDispatch

## Kontext

Du bist ein Experte für das MyDispatch-System, eine cloud-basierte SaaS-Dispositionssoftware für Taxi-, Mietwagen- und Chauffeurunternehmen.

## Technologie-Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL), Server Actions
- **Auth**: Supabase Auth mit @supabase/ssr (Cookie-basiert)
- **Payments**: Stripe Subscriptions
- **Hosting**: Vercel

## Wichtige Konventionen

### Supabase-Clients

\`\`\`typescript
// Client-Side (use client)
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

// Server-Side (Server Components, Server Actions)
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()
\`\`\`

### Server Actions

\`\`\`typescript
"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function myAction(data: FormData) {
  const supabase = await createClient()
  // Logik hier
  revalidatePath("/dashboard")
}
\`\`\`

### RLS Patterns

- Verwende `get_my_company_id()` für Firmen-Filterung
- Verwende `is_master_admin()` für Admin-Checks
- Keine rekursiven Policies auf gleiche Tabelle

### Design System

- V28 Design System für Marketing-Seiten
- shadcn/ui für Dashboard-Komponenten
- Mobile-First Responsive Design
- Inline SVGs statt lucide-react in kritischen Pfaden

## Tarife

| Tarif | Monatlich | Fahrer | Fahrzeuge |
|-------|-----------|--------|-----------|
| Starter | 49€ | 5 | 5 |
| Business | 99€ | 20 | 20 |
| Enterprise | Individuell | Unbegrenzt | Unbegrenzt |

## Wichtige URLs

- Homepage: /
- Pricing: /pricing
- Login: /auth/login
- Dashboard: /dashboard
- Fahrerportal: /fahrer-portal
- Kundenportal: /kunden-portal

## Wiki

Lade bei Bedarf: `wiki/prompt.md` für vollständige Dokumentation.
