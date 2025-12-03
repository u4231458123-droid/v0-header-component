# Schema-Initialisierung - Vollständige Anleitung

## Übersicht

Dieses Dokument beschreibt die vollständige Initialisierung des MyDispatch-Datenbank-Schemas.

## KRITISCHES PROBLEM

Die Supabase-Datenbank ist aktuell **LEER** - keine Tabellen existieren. Dies muss behoben werden, bevor das System funktioniert.

## Lösung: Vollständige Schema-Initialisierung

### Schritt 1: Core-Schema erstellen

Die Migration `scripts/migrations/000_initialize_complete_schema.sql` erstellt alle Basis-Tabellen:

- ✅ `companies` - Multi-Tenant Root
- ✅ `profiles` - User Management
- ✅ `customers` - Kunden
- ✅ `drivers` - Fahrer
- ✅ `vehicles` - Fahrzeuge
- ✅ `bookings` - Buchungen
- ✅ `invoices` - Rechnungen
- ✅ `quotes` - Angebote
- ✅ `quote_items` - Angebotspositionen
- ✅ `cash_book_entries` - Kassenbuch-Einträge

### Schritt 2: Migration anwenden

#### Option A: Via Supabase Dashboard (Empfohlen)

1. Öffne Supabase Dashboard: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Gehe zu **SQL Editor**
4. Öffne `scripts/migrations/000_initialize_complete_schema.sql`
5. Kopiere den gesamten SQL-Inhalt
6. Füge ihn in den SQL Editor ein
7. Klicke auf **Run**

#### Option B: Via MCP (Automatisiert)

```typescript
import { mcp_supabase_apply_migration } from '@/lib/ai/bots/mcp-integration'

const schemaSQL = fs.readFileSync('scripts/migrations/000_initialize_complete_schema.sql', 'utf-8')

await mcp_supabase_apply_migration(
  'initialize_complete_schema',
  schemaSQL,
  ['companies', 'profiles', 'customers', 'drivers', 'vehicles', 'bookings', 'invoices', 'quotes']
)
```

### Schritt 3: Validierung

Nach der Migration prüfen:

```sql
-- Tabellen auflisten
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Erwartete Tabellen:
-- companies, profiles, customers, drivers, vehicles, bookings, invoices, quotes, quote_items, cash_book_entries
```

### Schritt 4: Weitere Migrationen

Nach dem Core-Schema können weitere Migrationen ausgeführt werden:

1. `scripts/migrations/001_optimize_dashboard_stats.sql` - Dashboard-Optimierung
2. `scripts/migrations/002_create_messaging_system.sql` - Kommunikations-System
3. `scripts/008_complete_system_schema.sql` - Erweiterte Tabellen (driver_shifts, documents, etc.)
4. `scripts/015_create_quotes_cashbook.sql` - Erweiterte Quotes/Cashbook-Features

## Reihenfolge der Migrationen

### Phase 1: Core (KRITISCH)
1. ✅ `000_initialize_complete_schema.sql` - Basis-Tabellen

### Phase 2: Optimierungen
2. ✅ `001_optimize_dashboard_stats.sql` - Dashboard-RPC
3. ✅ `002_create_messaging_system.sql` - Chat-System

### Phase 3: Erweiterungen
4. ⏳ `008_complete_system_schema.sql` - Erweiterte Features
5. ⏳ `015_create_quotes_cashbook.sql` - Erweiterte Quotes/Cashbook

## Validierung nach Migration

### Prüfe Tabellen
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Sollte mindestens 10 Tabellen sein
```

### Prüfe RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- Alle Tabellen sollten rowsecurity = true haben
```

### Prüfe Indizes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
-- Sollte mehrere Indizes geben
```

## Fehlerbehandlung

### Fehler: "relation already exists"
- **Ursache**: Tabelle existiert bereits
- **Lösung**: Migration verwendet `CREATE TABLE IF NOT EXISTS`, sollte kein Problem sein

### Fehler: "permission denied"
- **Ursache**: Keine Berechtigung für Schema-Änderungen
- **Lösung**: Verwende Service-Role-Key oder Admin-Zugang

### Fehler: "foreign key constraint"
- **Ursache**: Abhängige Tabelle existiert nicht
- **Lösung**: Führe Migrationen in der richtigen Reihenfolge aus

## Nächste Schritte nach Schema-Initialisierung

1. ✅ TypeScript-Typen generieren
2. ✅ Code gegen Schema validieren
3. ✅ Frontend testen
4. ✅ Bots aktivieren
5. ✅ CI/CD Pipeline testen

## Automatisierung

Das System-Bot kann die Schema-Initialisierung automatisch durchführen:

```typescript
const systemBot = new SystemBot()
await systemBot.initializeDatabaseSchema()
```

## Dokumentation

- `docs/MCP_KRITISCHE_ERKENNTNISSE.md` - Problem-Identifikation
- `docs/MCP_VOLLSTAENDIGE_ANALYSE_UND_LOESUNG.md` - Vollständige Analyse
- `docs/MASTER_IMPLEMENTATION_PLAN.md` - Master-Plan

