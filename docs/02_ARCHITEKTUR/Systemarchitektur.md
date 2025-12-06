# Systemarchitektur

## Überblick

MyDispatch folgt einer **Three-Tier-Architektur** mit klarer Trennung von Präsentation, Geschäftslogik und Datenschicht:

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js)                 │
│     React + TypeScript + Tailwind CSS       │
└────────────────────┬────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼──────────┐  ┌────────▼──────────┐
│  API Routes       │  │  Server Components│
│  (Next.js /api)   │  │  (Data Fetching)  │
└────────┬──────────┘  └────────┬──────────┘
         │                       │
         └───────────┬───────────┘
                     │
┌────────────────────▼──────────────────────┐
│    Supabase (Backend-as-a-Service)        │
├──────────────────────────────────────────┤
│  • PostgreSQL Database                   │
│  • Authentication (JWT)                  │
│  • Row-Level Security (RLS)              │
│  • Real-time Subscriptions               │
│  • Storage (Files)                       │
└──────────────────────────────────────────┘
```

## Frontend-Architektur

### Next.js App Router

```
/app
├── (dashboard)              # Hauptanwendung (nach Login)
│   ├── mydispatch/          # Dashboard Übersicht
│   ├── auftraege/           # Auftragsverwaltung
│   ├── finanzen/            # Finanzmodul
│   ├── kunden/              # Kundenverwaltung
│   └── layout.tsx           # Dashboard-Layout
├── (prelogin)               # Marketing-Seiten (vor Login)
│   ├── page.tsx             # Home
│   ├── pricing/             # Tarifübersicht
│   ├── faq/                 # FAQ
│   └── contact/             # Kontaktformular
├── auth/                    # Authentifizierung
│   ├── login/
│   ├── sign-up/
│   ├── forgot-password/
│   └── reset-password/
├── c/[company]/             # Tenant-spezifische Routes
│   ├── kunde/               # Kundenportal
│   ├── fahrer/              # Fahrerportal
│   └── landing/             # Landing Page
└── api/                     # Backend API Routes
    ├── chat/
    ├── billing/
    ├── contact/
    └── webhooks/
```

### Client vs. Server Components

**Server-Components** (Standard):
- Daten-Fetching (keine `fetch` im Browser)
- Direkter Datenbankzugriff
- Sichere API-Keys
- Kleinere Bundle-Size

**Client-Components** (`'use client'`):
- Interaktivität (onClick, onChange, etc.)
- React Hooks (useState, useEffect, etc.)
- Browser APIs
- Event-Handler

```typescript
// Server Component (app/dashboard/page.tsx)
export default async function DashboardPage() {
  const { data } = await supabase.from('bookings').select('*')
  return <DashboardClient bookings={data} />
}

// Client Component (components/DashboardClient.tsx)
'use client'
export function DashboardClient({ bookings }) {
  const [selected, setSelected] = useState(null)
  return <div onClick={() => setSelected(bookings[0])}>...</div>
}
```

## Backend-Architektur

### Supabase

**Datenbank**:
- PostgreSQL
- 20+ Tabellen (Kunden, Fahrer, Fahrzeuge, Aufträge, etc.)
- Foreign Keys & Constraints
- Indexes für Performance

**Authentifizierung**:
- JWT-basiert
- OAuth-Provider (Google, GitHub optional)
- E-Mail/Passwort Standard
- Session Management

**Row-Level Security (RLS)**:
- Jeder Benutzer sieht nur seine Daten
- Policies pro Tabelle
- Automatische Filterung

```sql
-- Beispiel RLS Policy
CREATE POLICY "Users can only see their own customers"
ON customers FOR SELECT
USING (company_id = auth.uid());
```

### API Routes

Location: `/app/api/[resource]/route.ts`

**Pattern**:
```typescript
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { user } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { data, error } = await supabase
      .from('resource')
      .select('*')
      .eq('company_id', user.id)
    
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Externes Services

| Service | Verwendung | Konfiguration |
|---------|-----------|--------------|
| **Stripe** | Payments & Subscriptions | `STRIPE_SECRET_KEY` |
| **Google Maps** | Adress-Vervollständigung | `NEXT_PUBLIC_GOOGLE_MAPS_KEY` |
| **OpenAI / Claude** | AI-Features | `OPENAI_API_KEY` |
| **Hugging Face** | NLP | `HUGGINGFACE_API_KEY` |
| **Tavily** | Web-Recherche | `TAVILY_API_KEY` |
| **Resend** | E-Mail | `RESEND_API_KEY` |

## Datenfluss

### Beispiel: Neue Auftrag erstellen

1. **Frontend (Client)**
   - Benutzer füllt Formular aus
   - Klick auf "Speichern"
   - State wird aktualisiert

2. **Frontend (Sende)**
   ```typescript
   const response = await fetch('/api/bookings', {
     method: 'POST',
     body: JSON.stringify({ customer_id, driver_id, vehicle_id, ... })
   })
   ```

3. **Backend (API Route)**
   ```typescript
   export async function POST(request: Request) {
     const { user } = await supabase.auth.getUser()
     const body = await request.json()
     
     const { data, error } = await supabase
       .from('bookings')
       .insert([{ ...body, company_id: user.id }])
       .select()
   }
   ```

4. **Datenbank (Supabase)**
   - Insert in `bookings` Tabelle
   - RLS filtert automatisch
   - Return gespeicherte Daten

5. **Frontend (Response)**
   - Dialog schließt
   - Liste wird aktualisiert
   - Toast zeigt "Auftrag erstellt"

## Security

### Authentication
- JWT Tokens in HTTP-Only Cookies
- Automatisches Refresh
- Logout invalidiert Token

### Authorization
- Row-Level Security auf DB-Level
- API-Route Checks
- Company-ID Validation

### Data Protection
- HTTPS nur
- Encrypted Passwords
- No Logs of sensitive data

## Performance

### Frontend
- Code Splitting (Dynamic Imports)
- Image Optimization
- CSS Tree-shaking
- No Unused Dependencies

### Backend
- Database Indexing
- Connection Pooling
- Query Optimization
- Caching (Redis optional)

### Monitoring
- Error Tracking (Sentry optional)
- Performance Monitoring (Web Vitals)
- User Analytics (GA)

## Skalierbarkeit

- **Horizontal**: Vercel Auto-Scaling
- **Vertikal**: Supabase Pro/Enterprise
- **Database**: PostgreSQL Replication
- **CDN**: Vercel Edge Network
- **Storage**: Supabase S3-compatible

---

**Weitere Dokumentation**:
- [Datenbank-Schema](./Datenbank-Schema.md)
- [API-Dokumentation](./API-Dokumentation.md)
- [Deployment-Guide](../05_DEPLOYMENT_UND_OPERATIONS/Deployment-Guide.md)
