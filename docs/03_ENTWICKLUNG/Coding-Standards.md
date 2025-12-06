# Coding-Standards

## TypeScript

### Strikte Type-Checking
```typescript
// ✅ GUT
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

function getUser(id: string): Promise<User> {
  // Implementation
}

// ❌ FALSCH
function getUser(id) {
  return data.find(u => u.id === id)
}
```

### Keine `any` Typen
```typescript
// ✅ GUT
import type { FC } from 'react'

const MyComponent: FC<{ name: string }> = ({ name }) => (
  <div>{name}</div>
)

// ❌ FALSCH
const MyComponent = ({ name }: any) => {
  return <div>{name}</div>
}
```

### Generics für Wiederverwendbarkeit
```typescript
// ✅ GUT
interface ApiResponse<T> {
  data: T
  error: null | string
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // Implementation
}

// ❌ FALSCH
async function fetchData(url) {
  const res = await fetch(url)
  return res.json()
}
```

## React Komponenten

### Komponenten-Struktur
```typescript
'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import type { FC } from 'react'

interface Props {
  title: string
  onSubmit: (value: string) => Promise<void>
}

export const MyComponent: FC<Props> = ({ title, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (formData: FormData) => {
    try {
      setIsLoading(true)
      setError(null)
      await onSubmit(formData.get('value') as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }, [onSubmit])

  return (
    <div>
      <h2>{title}</h2>
      {error && <div className="text-red-600">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="value" required />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Wird bearbeitet...' : 'Absenden'}
        </Button>
      </form>
    </div>
  )
}
```

### Naming Conventions
- **Komponenten-Dateien**: PascalCase
- **Komponenten-Namen**: PascalCase
- **Props-Interfaces**: `<ComponentName>Props`
- **Event-Handler**: `handle<Action>` (z.B. `handleSubmit`)
- **State Updater**: `set<StateName>` (z.B. `setIsLoading`)

## Styling

### Tailwind CSS
```typescript
// ✅ GUT - Responsive, Utility-First
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  <Card>...</Card>
</div>

// ❌ FALSCH - Custom CSS, Inline-Styles
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
  <Card>...</Card>
</div>
```

### Design-Tokens
```typescript
// ✅ GUT - CSS Variables
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>

// ❌ FALSCH - Hardcoded Colors
<button style={{ backgroundColor: '#3b82f6' }}>
  Click me
</button>
```

## Error Handling

### Try-Catch-Finally Pattern
```typescript
async function saveData(data: unknown) {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      console.error('Save failed:', error.message)
      throw error
    }
    throw new Error('Unknown error')
  }
}
```

### Fehlerbehandlung in Komponenten
```typescript
'use client'

import { useState } from 'react'

interface Props {
  onSave: () => Promise<void>
}

export function SaveButton({ onSave }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await onSave()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="bg-red-100 text-red-700 p-2">{error}</div>}
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Wird gespeichert...' : 'Speichern'}
      </button>
    </div>
  )
}
```

## API Routes

### GET Request
```typescript
// app/api/customers/route.ts
import { supabase } from '@/lib/supabase'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { user } = await supabase.auth.getUser()
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', user.id)

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return Response.json({ error: message }, { status: 500 })
  }
}
```

### POST Request
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.name || typeof body.name !== 'string') {
      return Response.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { user } = await supabase.auth.getUser()
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{ name: body.name, company_id: user.id }])
      .select()

    if (error) throw error

    return Response.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return Response.json({ error: message }, { status: 500 })
  }
}
```

## Imports

### Absolute Imports
```typescript
// ✅ GUT - Konfiguriert in tsconfig.json
import { Button } from '@/components/ui/button'
import { getData } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

// ❌ FALSCH - Relative Imports
import Button from '../../../components/ui/button'
```

### Import Order
```typescript
// 1. External packages
import React, { useState } from 'react'
import type { FC } from 'react'

// 2. Internal imports
import { Button } from '@/components/ui/button'
import { getData } from '@/lib/api'
import type { User } from '@/types'

// 3. Styles (falls vorhanden)
import '@/styles/custom.css'
```

## Kommentierung

### Code-Kommentierung
```typescript
// ✅ GUT - Erklärt WARUM, nicht WAS
// Verwende Supabase RLS statt Client-seitigem Filter,
// um Sicherheit auf Datenbankebene zu gewährleisten
const { data } = await supabase
  .from('customers')
  .select('*')

// ❌ FALSCH - Offensichtlich, was der Code tut
const { data } = await supabase.from('customers').select('*') // Fetch all customers
```

### JSDoc für Funktionen
```typescript
/**
 * Speichert Kundendaten in der Datenbank
 * 
 * @param customer - Kundendaten (Name, E-Mail, etc.)
 * @returns Promise mit gespeichertem Kunden inkl. ID
 * @throws Error wenn Datenspeicherung fehlschlägt
 * 
 * @example
 * const customer = await saveCustomer({ name: 'Max', email: 'max@example.com' })
 */
async function saveCustomer(customer: NewCustomer): Promise<Customer> {
  // Implementation
}
```

## Performance

### Memoization
```typescript
// ✅ GUT - useCallback für Event-Handler
const handleClick = useCallback(() => {
  onDelete(id)
}, [id, onDelete])

// ✅ GUT - useMemo für teure Berechnungen
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name))
}, [data])
```

### Lazy Loading
```typescript
// ✅ GUT - Dynamic imports für große Komponenten
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <div>Wird geladen...</div>
})
```

## Testing

### E2E Tests (Playwright)
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('User can login', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login')
  
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('http://localhost:3000/dashboard')
})
```

## Checkliste vor Commit

- [ ] Code wird mit `npm run lint` validiert
- [ ] Build funktioniert mit `npm run build`
- [ ] TypeScript Errors behoben
- [ ] Komponenten auf mobile Geräte getestet
- [ ] Deutsche Texte überprüft
- [ ] Error Handling implementiert
- [ ] Keine `console.log`-Statements mehr vorhanden

---

**Weitere Dokumentation**: [Design-Guidelines](./Design-Guidelines.md)
