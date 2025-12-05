# Komponenten-Dokumentation

## Übersicht

MyDispatch nutzt eine modulare Komponenten-Architektur basierend auf shadcn/ui und custom React-Komponenten. Alle Komponenten folgen den Design-Guidelines und sind vollständig TypeScript-typiert.

## Komponenten-Struktur

### `/components/ui` - Base UI Komponenten

shadcn/ui Komponenten (konfiguriert in `components.json`):
- Button
- Dialog/Modal
- Form
- Input
- Select
- Dropdown-Menu
- Card
- Table
- Badge
- Toast
- Avatar
- Tabs
- Tooltip
- Sidebar
- Navigation

**Stil**: New York Theme, CSS Variables, Neutral Basecolor

### `/components` - Custom Komponenten

#### Layout & Navigation
- `StandardPageLayout.tsx` - Standard-Seitenlayout
- `UnifiedPageTemplate.tsx` - Vereinheitlichtes Template
- `AuthPageLayout.tsx` - Auth-Seiten Layout
- `DashboardHeader.tsx` - Dashboard-Header
- `AuthHeader.tsx` & `AuthFooter.tsx` - Auth-Seiten Header/Footer

#### Daten-Tabellen
- `CustomersTable.tsx` - Kundenliste
- `DriverTable.tsx` - Fahrerliste
- `VehiclesTable.tsx` - Fahzeugliste
- `BookingsTable.tsx` - Aufträge-Tabelle

#### Dialoge & Modals
- `NewCustomerDialog.tsx` - Neuer Kunde
- `EditCustomerDialog.tsx` - Kunde bearbeiten
- `CustomerDetailsDialog.tsx` - Kundendetails
- `NewVehicleDialog.tsx` - Neues Fahrzeug
- `EditVehicleDialog.tsx` - Fahrzeug bearbeiten
- `NewDriverDialog.tsx` - Neuer Fahrer
- `EditDriverDialog.tsx` - Fahrer bearbeiten
- `EditBookingDialog.tsx` - Auftrag bearbeiten
- `CreateBookingDialog.tsx` - Neuer Auftrag
- `NewQuoteDialog.tsx` - Neues Angebot
- `BookingDetailsDialog.tsx` - Auftragsdetails mit PDF-Druck

#### Karten & Visualisierung
- `DashboardMapWidget.tsx` - Kartendarstellung
- `FleetMap.tsx` - Flottenübersicht-Karte
- `DashboardCharts.tsx` - Statistik-Diagramme
- `WeatherWidget.tsx` - Wetter-Widget

#### Eingabe-Komponenten
- `AddressAutocomplete.tsx` - Google Maps Adress-Vervollständigung
- `VoiceInput.tsx` - Sprachein gabe

#### Chat & Hilfe
- `ChatWidget.tsx` - Chat-Widget für Benutzer
- `LeadChatWidget.tsx` - Chat-Widget für Lead-Erfassung
- `DashboardHelpBot.tsx` - Dashboard-Hilfe-Bot
- `DriverHelpBot.tsx` - Fahrer-Hilfe-Bot
- `CustomerHelpBot.tsx` - Kunden-Hilfe-Bot

#### Status & Badges
- `StatCard.tsx` - Statistik-Kartenseite
- `SentimentBadge.tsx` - Stimmungs-Badge
- `TicketCategoryBadge.tsx` - Ticket-Kategorie Badge

#### Marketing-Komponenten
- `V28MarketingSection.tsx` - Marketing-Sektion
- `V28PricingCard.tsx` - Preiskarte
- `PremiumDashboardContent.tsx` - Premium-Dashboard

## Komponenten-Konventionen

### Benennung
- **Komponenten-Dateien**: PascalCase (z.B. `CustomersTable.tsx`)
- **Client-Komponenten**: Suffix `Client` wenn `'use client'` erforderlich
- **Seiten-Komponenten**: Suffix oder `Page` wenn notwendig

### Struktur
```typescript
'use client' // Falls erforderlich

import React from 'react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import type { FC } from 'react'

interface Props {
  // Prop-Definition
}

export const MyComponent: FC<Props> = ({ ... }) => {
  // Component Logic
  return (
    // JSX
  )
}
```

### TypeScript
- Alle Props sind vollständig typisiert
- Keine `any`-Typen
- Verwendung von Generics wo sinnvoll
- Strikte Type-Checking in `tsconfig.json`

### Styling
- Tailwind CSS v4
- CSS-Variablen für Design-Tokens
- shadcn/ui Komponenten
- Keine inline-Styles
- Keine externe CSS-Dateien außer `globals.css`

## Design-Guidelines für Komponenten

Siehe: [Design-Guidelines](../lib/design-system/DESIGN_GUIDELINES.md)

- Konsistente Farben (Primary, Secondary, Accent)
- Einheitliche Abstände (Spacing-Skala)
- Deutsche Texte und Labels
- Responsive Design (Mobile-first)
- Zugänglichkeit (ARIA-Labels, Semantik)

## Komponenten-Kategoren nach Verwendung

### Page-Level Komponenten (für `/app`)
- `*PageClient.tsx` - Client-Seiten
- Verwenden Sub-Komponenten
- Koordinieren Daten-Fetching

### Wiederverwendbare Komponenten
- `Dialog`, `Table`, `Form`, `Card`
- In `components/ui` oder `components`
- Exportiert aus entsprechendem Index

### Feature-Spezifische Komponenten
- Namensräume nach Feature (z.B. `booking/`, `customer/`)
- In Feature-Ordnern organisiert
- Nur innerhalb Feature verwendbar

## Zugriff & Imports

```typescript
// Base UI Komponenten
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'

// Custom Komponenten
import { CustomersTable } from '@/components/CustomersTable'
import { DashboardHeader } from '@/components/DashboardHeader'
```

## Weiterführende Dokumentation

- [Seiten-Struktur](./03-seiten-struktur.md)
- [Architektur](./02-architektur.md)
- [v0-Kompatibilität](./05-v0-kompatibilitaet.md)
