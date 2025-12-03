# Supabase Keys Update - MyDispatch

## Neue Supabase-Konfiguration

**WICHTIG:** Alle alten Supabase-Keys wurden entfernt und durch die neuen ersetzt.

### Supabase Projekt-Informationen

- **Project Ref:** `ykfufejycdgwonrlbhzn`
- **Supabase URL:** `https://ykfufejycdgwonrlbhzn.supabase.co`
- **MCP URL:** `https://mcp.supabase.com/mcp?project_ref=ykfufejycdgwonrlbhzn&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage`

### API Keys

#### Anon Key (Public - für Browser)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0
```

#### Service Role Key (Backend-only - NIEMALS im Browser verwenden!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38
```

#### JWT Secret
```
qA/FVx0XbRVj1BeNr0ZfX6oTcvhTaKs4S9NUcJBa6PBUr2Ec6/lFJiNDE3p6OnzgE421MyIaGlF9Q8f8rduxYw==
```

## Environment Variables

### Für Vercel (Production)
Setze in Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ykfufejycdgwonrlbhzn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38
SUPABASE_JWT_SECRET=qA/FVx0XbRVj1BeNr0ZfX6oTcvhTaKs4S9NUcJBa6PBUr2Ec6/lFJiNDE3p6OnzgE421MyIaGlF9Q8f8rduxYw==
POSTGRES_PASSWORD=BYhr9zh4vOTsDXkm
POSTGRES_PRISMA_URL=postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL=postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### Für GitHub Secrets (CI/CD)
Setze in GitHub Repository Settings → Secrets and variables → Actions:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://ykfufejycdgwonrlbhzn.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0`
- `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38`

### Für lokale Entwicklung (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ykfufejycdgwonrlbhzn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38
SUPABASE_JWT_SECRET=qA/FVx0XbRVj1BeNr0ZfX6oTcvhTaKs4S9NUcJBa6PBUr2Ec6/lFJiNDE3p6OnzgE421MyIaGlF9Q8f8rduxYw==
POSTGRES_PASSWORD=BYhr9zh4vOTsDXkm
POSTGRES_PRISMA_URL=postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL=postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## MCP Integration

Für MCP (Model Context Protocol) Integration:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=ykfufejycdgwonrlbhzn&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    }
  }
}
```

## Wichtig

- ✅ **Anon Key** ist für öffentliche API-Zugriffe (Browser-safe mit RLS)
- ⚠️ **Service Role Key** NUR im Backend verwenden - NIEMALS im Browser!
- ⚠️ **JWT Secret** NUR im Backend verwenden - NIEMALS im Browser!
- ⚠️ **Postgres Passwords** NUR im Backend verwenden - NIEMALS im Browser!
- ✅ Alle alten Keys wurden entfernt - nur noch die neuen verwenden
- ✅ Alle Verbindungen wurden aktualisiert

## Login-Problem beheben

Nach dem Update der Keys:
1. Stelle sicher, dass alle Environment Variables in Vercel gesetzt sind
2. Teste die Login-Funktion
3. Prüfe die Browser-Konsole auf Fehler
4. Prüfe Vercel Logs für Backend-Fehler

