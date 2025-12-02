# v0-Kompatibilität

## Problem

Die v0-Runtime unterstützt `lucide-react` nicht nativ. Da shadcn/ui Komponenten intern lucide-react Icons verwenden, führt dies zu Import-Fehlern:

\`\`\`
Import Error: Failed to load "lucide-react"
\`\`\`

## Lösung

Pre-Login-Seiten (Pricing, FAQ, Contact, Auth) verwenden eine **v0-kompatible Architektur**:

### 1. SimpleMarketingLayout

Statt der komplexen MarketingLayout-Komponente mit shadcn/ui verwenden Pre-Login-Seiten das `SimpleMarketingLayout`:

\`\`\`tsx
// components/layout/SimpleMarketingLayout.tsx
- Keine shadcn/ui Dependencies
- Inline SVG Icons
- Natives HTML + Tailwind
\`\`\`

### 2. Inline SVG Icons

Statt lucide-react:

\`\`\`tsx
// ❌ NICHT VERWENDEN (verursacht Fehler)
import { Check } from 'lucide-react'

// ✅ VERWENDEN (v0-kompatibel)
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
\`\`\`

### 3. Native HTML-Inputs

Statt shadcn/ui Input:

\`\`\`tsx
// ❌ NICHT VERWENDEN
import { Input } from "@/components/ui/input"
<Input type="email" />

// ✅ VERWENDEN
<input
  type="email"
  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
/>
\`\`\`

## Betroffene Seiten

| Seite | Status | Layout |
|-------|--------|--------|
| `/pricing` | ✅ v0-kompatibel | SimpleMarketingLayout |
| `/faq` | ✅ v0-kompatibel | SimpleMarketingLayout |
| `/contact` | ✅ v0-kompatibel | SimpleMarketingLayout |
| `/auth/login` | ✅ v0-kompatibel | Standalone |
| `/auth/sign-up` | ✅ v0-kompatibel | Standalone |
| `/dashboard/*` | ❌ Nicht v0-kompatibel | DashboardLayout (shadcn/ui) |

## Dashboard-Seiten

Dashboard-Seiten sind **nach Login** erreichbar und verwenden weiterhin shadcn/ui. Da sie auth-geschützt sind, ist v0-Kompatibilität dort nicht kritisch für die Marketing-Demo.

## Best Practices

1. **Pre-Login = Standalone** - Keine shadcn/ui für Marketing-Seiten
2. **Icons = Inline SVG** - Keine lucide-react Imports
3. **Inputs = Native HTML** - Mit Tailwind gestylt
4. **Layouts = SimpleMarketingLayout** - Für Pre-Login-Seiten
