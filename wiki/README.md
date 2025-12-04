# MyDispatch Wiki

Diese Wiki dokumentiert die technische Architektur und Entwicklungsrichtlinien für MyDispatch.

## Inhaltsverzeichnis

1. [Projektübersicht](./01-projektübersicht.md)
2. [Architektur](./02-architektur.md)
3. [Seiten-Struktur](./03-seiten-struktur.md)
4. [Komponenten](./04-komponenten.md)
5. [v0-Kompatibilität](./05-v0-kompatibilitaet.md)
6. [Datenbank](./06-datenbank.md)

## Quick Start

MyDispatch ist eine Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Dienste. Die App ist als Next.js 16 App Router Projekt mit Supabase als Backend aufgebaut.

### Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Supabase (Auth, Postgres, RLS)
- **Payments**: Stripe Subscriptions
- **Styling**: shadcn/ui + Custom Components

### Wichtige Hinweise für v0

Das Projekt verwendet eine **v0-kompatible Architektur** für Pre-Login-Seiten:
- Pricing, FAQ, Contact und Auth-Seiten verwenden **KEINE** shadcn/ui Komponenten
- Stattdessen werden Inline-SVG-Icons und natives HTML/Tailwind verwendet
- Details siehe [v0-Kompatibilität](./05-v0-kompatibilitaet.md)

## Wichtige Dokumentation

### Design & Entwicklung
- [Design-Guidelines](../lib/design-system/DESIGN_GUIDELINES.md) - Verbindliche Design-Vorgaben
- [SQL-Validierung](../lib/utils/sql-validator.ts) - Verhindert Agent-Fehler bei SQL-Ausführung
- [Arbeitsprotokoll Dezember 2025](../docs/ARBEITS_PROTOKOLL_2025_12.md) - Zentrale Übersicht aller Dezember-Arbeiten

### Changelog & Fehler
- [Changelog](./changelog/changelog.md) - Aktuelle Version: 2.4.0
- [Fehlerliste](./errors/fehlerliste.md) - ERR-013 (SQL-TypeScript-Verwechslung) dokumentiert
