# Supabase Keys Update - MyDispatch

## Neue Supabase-Konfiguration

**WICHTIG:** Alle alten Supabase-Keys wurden entfernt und durch die neuen ersetzt.

### Supabase Projekt-Informationen

- **Project Ref:** `ygpwuiygivxoqtyoigtg`
- **Supabase URL:** `https://ygpwuiygivxoqtyoigtg.supabase.co`
- **MCP URL:** `https://mcp.supabase.com/mcp?project_ref=ygpwuiygivxoqtyoigtg&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage`

### API Keys

#### Publishable Key (Browser-safe)
```
sb_publishable_UkegNzGng02Bk1O00Z2d1A_5UUyEYdp
```

#### Anon Key (Public - für Browser)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQzNDIsImV4cCI6MjA3NjAyMDM0Mn0.1ZJtuko179K8j7bm6K3FwtpS5POY6RVu3Ixeh1ye3KE
```

#### Service Role Key (Backend-only - NIEMALS im Browser verwenden!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0NDM0MywiZXhwIjoyMDc2MDIwMzQzfQ.W_rbOUxa57VffJiUX9TClCAFB6m11qS2GVxpEzWQ56Q
```

## Environment Variables

### Für Vercel (Production)
Setze in Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ygpwuiygivxoqtyoigtg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQzNDIsImV4cCI6MjA3NjAyMDM0Mn0.1ZJtuko179K8j7bm6K3FwtpS5POY6RVu3Ixeh1ye3KE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0NDM0MywiZXhwIjoyMDc2MDIwMzQzfQ.W_rbOUxa57VffJiUX9TClCAFB6m11qS2GVxpEzWQ56Q
```

### Für GitHub Secrets (CI/CD)
Setze in GitHub Repository Settings → Secrets and variables → Actions:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://ygpwuiygivxoqtyoigtg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQzNDIsImV4cCI6MjA3NjAyMDM0Mn0.1ZJtuko179K8j7bm6K3FwtpS5POY6RVu3Ixeh1ye3KE`
- `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0NDM0MywiZXhwIjoyMDc2MDIwMzQzfQ.W_rbOUxa57VffJiUX9TClCAFB6m11qS2GVxpEzWQ56Q`

### Für lokale Entwicklung (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ygpwuiygivxoqtyoigtg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQzNDIsImV4cCI6MjA3NjAyMDM0Mn0.1ZJtuko179K8j7bm6K3FwtpS5POY6RVu3Ixeh1ye3KE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0NDM0MywiZXhwIjoyMDc2MDIwMzQzfQ.W_rbOUxa57VffJiUX9TClCAFB6m11qS2GVxpEzWQ56Q
```

## MCP Integration

Für MCP (Model Context Protocol) Integration:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=ygpwuiygivxoqtyoigtg&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    }
  }
}
```

## Wichtig

- ✅ **Publishable Key** kann im Browser verwendet werden (mit RLS aktiviert)
- ✅ **Anon Key** ist für öffentliche API-Zugriffe
- ⚠️ **Service Role Key** NUR im Backend verwenden - NIEMALS im Browser!
- ⚠️ Alte Keys wurden entfernt - nur noch die neuen verwenden
- ✅ Alle Verbindungen wurden aktualisiert

## Login-Problem beheben

Nach dem Update der Keys:
1. Stelle sicher, dass alle Environment Variables in Vercel gesetzt sind
2. Teste die Login-Funktion
3. Prüfe die Browser-Konsole auf Fehler
4. Prüfe Vercel Logs für Backend-Fehler

