# Standalone Pages Pattern

## Übersicht

Legal- und Marketing-Seiten (Impressum, Datenschutz, AGB, Contact) verwenden das **Standalone Pattern** für maximale Stabilität in v0-Preview.

## Warum Standalone?

### Problem mit Shared Components
- Import von `@/lib/company-data` verursacht Build-Cache-Probleme
- Import von `lucide-react` auf Pre-Login-Seiten führt zu Fehlern
- Shared Layouts (MarketingLayout) können unvorhergesehene Nebeneffekte haben

### Lösung: Standalone Pages
Jede Legal-Seite enthält:
1. **Inline Company Data** - Keine externen Imports
2. **Inline SVG Icons** - Keine lucide-react Abhängigkeit
3. **Vollständiges Header/Footer** - Keine Layout-Komponenten
4. **Blob-URLs für Bilder** - Maximale Kompatibilität

## Struktur einer Standalone Page

\`\`\`tsx
"use client"

import { useState } from "react"
import Link from "next/link"

// =============================================================================
// INLINE COMPANY DATA - Single Source of Truth
// =============================================================================
const COMPANY = {
  name: "RideHub Solutions UG (haftungsbeschränkt)",
  owner: "Jason Courbois",
  street: "Graf-Zeppelin-Str. 6",
  zip: "46149",
  city: "Oberhausen",
  // ... weitere Daten
}

const LOGO_URL = "/images/image-1.jpg"

export default function Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Inline Header */}
      <header>...</header>

      {/* Main Content */}
      <main>...</main>

      {/* Inline Footer */}
      <footer>...</footer>
    </div>
  )
}
\`\`\`

## Betroffene Seiten

| Seite | Pattern | Status |
|-------|---------|--------|
| `/impressum` | Standalone | FUNKTIONIERT |
| `/datenschutz` | Standalone | FUNKTIONIERT |
| `/agb` | Standalone | FUNKTIONIERT |
| `/contact` | Standalone | FUNKTIONIERT |

## Firmendaten (Single Source of Truth)

Alle Standalone-Seiten verwenden identische Firmendaten:

\`\`\`typescript
const COMPANY = {
  name: "RideHub Solutions UG (haftungsbeschränkt)",
  owner: "Jason Courbois",
  street: "Graf-Zeppelin-Str. 6",
  zip: "46149",
  city: "Oberhausen",
  country: "Deutschland",
  phone: "+49 (0) 208 740 90 222",
  email: "info@my-dispatch.de",
  support: "support@my-dispatch.de",
  domain: "my-dispatch.de",
  registergericht: "Amtsgericht Duisburg",
  registernummer: "HRB 35441",
  ustIdNr: "DE 351764511",
}
\`\`\`

## Best Practices

1. **Keine externen Imports** für Company-Daten
2. **Inline SVG Icons** statt lucide-react
3. **Blob-URLs** für Logo und Bilder
4. **Vollständiger Header/Footer** in jeder Seite
5. **Konsistente Navigation** (Startseite, Preise, FAQ, Kontakt, Anmelden, Registrieren)

## Wartung

Bei Änderungen an Firmendaten:
1. Alle 4 Standalone-Seiten aktualisieren
2. `app/impressum/page.tsx`
3. `app/datenschutz/page.tsx`
4. `app/agb/page.tsx`
5. `app/contact/page.tsx`

---

**Erstellt:** 25.11.2025  
**Version:** 1.9.0
