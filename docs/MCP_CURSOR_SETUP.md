# MCP Supabase - Cursor Setup Anleitung

## ✅ Aktuelle MCP-Konfiguration

**Projekt-Ref:** `ykfufejycdgwonrlbhzn`

## 📋 Cursor MCP-Konfiguration einrichten

### Option 1: Über Cursor Settings (Empfohlen)

1. Öffne Cursor Settings:
   - `Ctrl+,` (Windows/Linux) oder `Cmd+,` (Mac)
   - Oder: File → Preferences → Settings

2. Suche nach "MCP" oder "Model Context Protocol"

3. Füge die Supabase MCP-Konfiguration hinzu:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=ykfufejycdgwonrlbhzn&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    }
  }
}
```

### Option 2: Über Konfigurationsdatei

1. Erstelle oder bearbeite die Datei: `.cursor/mcp.json` im Projekt-Root

2. Füge folgende Konfiguration ein:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=ykfufejycdgwonrlbhzn&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    }
  }
}
```

3. Starte Cursor neu, damit die Konfiguration geladen wird

## ✅ Verfügbare MCP-Funktionen

Nach der Konfiguration stehen folgende Funktionen zur Verfügung:

### Datenbank-Operationen
- `mcp_supabase_list_tables` - Tabellen auflisten
- `mcp_supabase_execute_sql` - SQL direkt ausführen
- `mcp_supabase_apply_migration` - Migrationen anwenden
- `mcp_supabase_list_migrations` - Migrationen auflisten

### Schema-Management
- `mcp_supabase_list_extensions` - Extensions auflisten
- `mcp_supabase_generate_typescript_types` - TypeScript-Typen generieren

### Edge Functions
- `mcp_supabase_list_edge_functions` - Edge Functions auflisten
- `mcp_supabase_get_edge_function` - Edge Function abrufen
- `mcp_supabase_deploy_edge_function` - Edge Function deployen

### Monitoring & Debugging
- `mcp_supabase_get_logs` - Logs abrufen
- `mcp_supabase_get_advisors` - Sicherheits- und Performance-Beratung

### Projekt-Informationen
- `mcp_supabase_get_project_url` - Projekt-URL abrufen
- `mcp_supabase_get_anon_key` - Anon-Key abrufen

### Branching (Development)
- `mcp_supabase_create_branch` - Development-Branch erstellen
- `mcp_supabase_list_branches` - Branches auflisten
- `mcp_supabase_merge_branch` - Branch mergen
- `mcp_supabase_rebase_branch` - Branch rebasen
- `mcp_supabase_reset_branch` - Branch zurücksetzen
- `mcp_supabase_delete_branch` - Branch löschen

## 🔍 Verifizierung

Nach der Konfiguration kannst du testen:

1. Öffne Cursor Chat
2. Frage: "Liste alle Tabellen in Supabase auf"
3. Die MCP-Funktion sollte automatisch verwendet werden

## 📝 Wichtig

- Die MCP-Konfiguration ist bereits in `config/mcp-supabase.json` gespeichert
- Diese Datei dient als Referenz
- Die tatsächliche Konfiguration muss in Cursor Settings oder `.cursor/mcp.json` erfolgen

## 🔗 Weitere Informationen

- Siehe auch: `docs/MCP_SUPABASE_INTEGRATION.md`
- Siehe auch: `docs/SUPABASE_KEYS_UPDATE.md`

