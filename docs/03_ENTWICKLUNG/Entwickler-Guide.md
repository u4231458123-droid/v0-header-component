# Entwickler-Guide

## Quick Start

1. **Repository clonen**
   ```bash
   git clone <repo-url>
   cd workspace
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   # oder
   pnpm install
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.example .env.local
   # Konfiguriere Supabase, Stripe, Google Maps Keys
   ```

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

5. **Im Browser öffnen**
   ```
   http://localhost:3000
   ```

## Projekt-Struktur

```
/workspace
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard-Pages
│   ├── (prelogin)/         # Marketing-Pages
│   ├── auth/               # Authentication-Pages
│   ├── api/                # API Routes & Backend
│   ├── c/                  # Tenant-Routes (Subdomains)
│   └── ...
├── components/             # React Components
│   ├── ui/                 # shadcn/ui Components
│   └── *Dialog.tsx         # Dialog-Komponenten
├── lib/                    # Utilities & Services
│   ├── utils/              # Helper Functions
│   ├── design-system/      # Design Guidelines
│   └── knowledge-base/     # AI Knowledge Base
├── hooks/                  # Custom React Hooks
├── types/                  # TypeScript Typings
├── wiki/                   # Technical Documentation
├── docs/                   # Product Documentation
└── scripts/                # Build & Automation Scripts
```

## Entwicklungs-Workflow

### 1. Feature-Branch erstellen
```bash
git checkout -b feature/neue-funktionalitaet
```

### 2. Code schreiben
- Neue Features in entsprechenden Komponenten
- TypeScript strict mode verwenden
- Design-Guidelines beachten

### 3. Testen
```bash
npm run lint              # ESLint
npm run build            # TypeScript Check
npm run test:e2e         # E2E Tests (optional)
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: beschreibung"
git push origin feature/neue-funktionalitaet
```

### 5. Pull Request erstellen
- Beschreibung: Was wurde geändert? Warum?
- Linked Issues: `Closes #123`
- Screenshots für UI-Änderungen

## Wichtige Konzepte

### Server- vs. Client-Komponenten
- **Server-Komponenten** (default): Für Daten-Fetching
- **Client-Komponenten** (`'use client'`): Für Interaktivität, State, Hooks

```typescript
// Server Component
import { getData } from '@/lib/api'

export default async function Page() {
  const data = await getData()
  return <ClientComponent data={data} />
}

// Client Component
'use client'
import { useState } from 'react'

export function ClientComponent({ data }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>...</button>
}
```

### Datenbank-Zugriff
- Verwende Supabase Client: `@/lib/supabase`
- Row-Level Security (RLS) ist **immer aktiv**
- Authentifizierung über JWT

```typescript
import { supabase } from '@/lib/supabase'

// Get Data
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('company_id', userId)

// Insert Data
const { error } = await supabase
  .from('customers')
  .insert([{ name: 'Neuer Kunde', company_id: userId }])
```

### API Routes
- Location: `/app/api/[resource]/route.ts`
- Verwende POST/GET/PUT/DELETE
- Authentifizierung mit JWT Tokens

```typescript
// app/api/customers/route.ts
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { user } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('company_id', user.id)
  
  return Response.json(data)
}
```

## Commands

| Command | Beschreibung |
|---------|------------|
| `npm run dev` | Entwicklungsserver (http://localhost:3000) |
| `npm run build` | Production Build |
| `npm run start` | Production Server |
| `npm run lint` | ESLint prüfen |
| `npm run validate` | Alle Validierungen |
| `npm run test:e2e` | End-to-End Tests |

## Coding Standards

Siehe: [Design-Guidelines](./Design-Guidelines.md)

- Deutsch als Standard-Sprache für UI-Text
- TypeScript Strict Mode
- Keine `any` Typen
- Komponenten: PascalCase
- Funktionen: camelCase
- Konstanten: UPPER_CASE

## Debugging

### Browser DevTools
- Network-Tab: API Requests
- Console: Errors & Logs
- React DevTools Extension

### Server Logs
```bash
# In neuem Terminal
npm run dev
# Logs erscheinen hier
```

### Database
```bash
# Supabase Dashboard
https://supabase.com/dashboard

# Direct SQL
SELECT * FROM customers WHERE company_id = '...';
```

## Häufige Probleme

**Problem**: "Module not found"
- **Lösung**: `npm install` ausführen oder Imports prüfen

**Problem**: "Supabase auth error"
- **Lösung**: `.env.local` mit korrekten Keys prüfen

**Problem**: "Type error in build"
- **Lösung**: `npm run build` lokal ausführen und Errors fixen

## Weiterführende Dokumentation

- [Architektur-Übersicht](../02_ARCHITEKTUR/Systemarchitektur.md)
- [Design-Guidelines](./Design-Guidelines.md)
- [API-Dokumentation](../02_ARCHITEKTUR/API-Dokumentation.md)
