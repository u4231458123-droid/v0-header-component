# MCP Supabase Integration - Vollständige Dokumentation

## Übersicht

Diese Dokumentation beschreibt die vollständige Integration des Model Context Protocol (MCP) mit Supabase für die MyDispatch-Anwendung. MCP ermöglicht direkten Zugriff auf die Supabase-Datenbank und erlaubt fehlerfreie Implementierungen direkt im "Haus" (Supabase).

## Aktuelle Projekt-Konfiguration

### Supabase-Projekt
- **URL**: `https://pwddkkpltcqonqwfmhhs.supabase.co`
- **Projekt-ID**: `pwddkkpltcqonqwfmhhs` (aus URL extrahiert)

### Wichtige Erkenntnisse
⚠️ **KRITISCH**: Bei jeder Deployment-Änderung wurde ein neues Vercel-Projekt erstellt, was zu Fehlern führte, da die falsche Projekt-ID verwendet wurde.

## MCP Supabase Funktionen

### Verfügbare MCP-Funktionen

1. **Datenbank-Operationen**
   - `mcp_supabase_list_tables` - Tabellen auflisten
   - `mcp_supabase_execute_sql` - SQL direkt ausführen
   - `mcp_supabase_apply_migration` - Migrationen anwenden
   - `mcp_supabase_list_migrations` - Migrationen auflisten

2. **Schema-Management**
   - `mcp_supabase_list_extensions` - Extensions auflisten
   - `mcp_supabase_generate_typescript_types` - TypeScript-Typen generieren

3. **Edge Functions**
   - `mcp_supabase_list_edge_functions` - Edge Functions auflisten
   - `mcp_supabase_get_edge_function` - Edge Function abrufen
   - `mcp_supabase_deploy_edge_function` - Edge Function deployen

4. **Monitoring & Debugging**
   - `mcp_supabase_get_logs` - Logs abrufen
   - `mcp_supabase_get_advisors` - Sicherheits- und Performance-Beratung

5. **Projekt-Informationen**
   - `mcp_supabase_get_project_url` - Projekt-URL abrufen
   - `mcp_supabase_get_anon_key` - Anon-Key abrufen

6. **Branching (Development)**
   - `mcp_supabase_create_branch` - Development-Branch erstellen
   - `mcp_supabase_list_branches` - Branches auflisten
   - `mcp_supabase_merge_branch` - Branch mergen
   - `mcp_supabase_rebase_branch` - Branch rebasen
   - `mcp_supabase_reset_branch` - Branch zurücksetzen
   - `mcp_supabase_delete_branch` - Branch löschen

## Vorteile der MCP-Integration

### 1. Direkte Datenbank-Operationen
- Keine Umwege über API-Routen
- Direkte SQL-Ausführung
- Sofortige Validierung

### 2. Fehlerfreie Implementierung
- Validierung direkt in Supabase
- Keine Projekt-ID-Verwechslungen
- Konsistente Datenbank-Struktur

### 3. Automatisierung
- Migrationen direkt anwenden
- Edge Functions direkt deployen
- Logs direkt abrufen

### 4. TypeScript-Integration
- Automatische Typ-Generierung
- Type-Safety garantiert
- Keine manuellen Typ-Definitionen

## Best Practices

### 1. Migrationen
```typescript
// IMMER Migrationen verwenden, nie direkte SQL-Änderungen
await mcp_supabase_apply_migration({
  name: "add_driver_vehicle_selection",
  query: `
    ALTER TABLE quotes 
    ADD COLUMN driver_id UUID REFERENCES drivers(id),
    ADD COLUMN vehicle_id UUID REFERENCES vehicles(id);
  `
})
```

### 2. SQL-Ausführung
```typescript
// Für SELECT-Queries
const result = await mcp_supabase_execute_sql({
  query: "SELECT * FROM drivers WHERE company_id = $1",
  // Parameter werden automatisch escaped
})
```

### 3. Type-Generierung
```typescript
// Nach Schema-Änderungen IMMER Typen neu generieren
const types = await mcp_supabase_generate_typescript_types()
// In types/database.types.ts speichern
```

### 4. Logs & Monitoring
```typescript
// Regelmäßig Logs prüfen
const logs = await mcp_supabase_get_logs({ service: "api" })
// Advisors für Sicherheit prüfen
const security = await mcp_supabase_get_advisors({ type: "security" })
```

## Umsetzungsplan

### Phase 1: Validierung & Analyse
1. ✅ Projekt-URL bestätigt: `https://pwddkkpltcqonqwfmhhs.supabase.co`
2. ⏳ Tabellen-Struktur prüfen
3. ⏳ Migrationen auflisten
4. ⏳ Edge Functions prüfen
5. ⏳ Sicherheits-Advisors prüfen

### Phase 2: Fehlerbehebung
1. ⏳ Falsche Projekt-IDs identifizieren
2. ⏳ Korrekte Konfiguration sicherstellen
3. ⏳ Vercel-Projekt-ID validieren

### Phase 3: Implementierung
1. ⏳ Fahrer-/Fahrzeugauswahl in Datenbank prüfen
2. ⏳ Fehlende Spalten hinzufügen (falls nötig)
3. ⏳ TypeScript-Typen aktualisieren
4. ⏳ Code-Implementierung validieren

### Phase 4: Validierung
1. ⏳ SQL-Queries testen
2. ⏳ Logs prüfen
3. ⏳ Sicherheits-Advisors prüfen
4. ⏳ Performance-Advisors prüfen

## Fehlerprävention

### Projekt-ID-Verwechslung vermeiden
1. **IMMER** MCP verwenden für Supabase-Operationen
2. Projekt-URL aus MCP abrufen, nicht hardcoden
3. Vercel-Projekt-ID in GitHub Secrets speichern
4. Validierung vor jedem Deployment

### Code-Qualität
1. Migrationen für alle Schema-Änderungen
2. TypeScript-Typen nach Schema-Änderungen aktualisieren
3. Logs regelmäßig prüfen
4. Advisors regelmäßig prüfen

## Nächste Schritte

1. **Sofort**: Tabellen-Struktur prüfen
2. **Sofort**: Migrationen validieren
3. **Sofort**: Fehlende Spalten identifizieren
4. **Dann**: Migrationen anwenden
5. **Dann**: TypeScript-Typen aktualisieren
6. **Dann**: Code-Implementierung validieren

## Dokumentation für Bots

### Quality-Bot
- Prüft Schema-Konsistenz
- Validiert Migrationen
- Prüft TypeScript-Typen

### System-Bot
- Wendet Migrationen an
- Generiert TypeScript-Typen
- Validiert SQL-Queries

### Master-Bot
- Überwacht alle MCP-Operationen
- Validiert Projekt-Konfiguration
- Prüft Sicherheits-Advisors

