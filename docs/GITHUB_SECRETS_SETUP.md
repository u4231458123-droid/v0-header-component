# GitHub Secrets Setup - MyDispatch

## Erforderliche Secrets

Die folgenden Secrets müssen in GitHub Repository Settings → Secrets and variables → Actions konfiguriert werden:

### Vercel Deployment
- `VERCEL_TOKEN`: `<Ihr-Vercel-Token>`
- `VERCEL_TEAM_ID`: `team_jO6cawqC6mFroPHujn47acpU` (KRITISCH - muss exakt sein!)
- `VERCEL_PROJECT_NAME`: `v0-header-component` (KRITISCH - muss exakt sein!)
- `VERCEL_ORG_ID`: (Optional - wird automatisch aus Token ermittelt)
- `VERCEL_PROJECT_ID`: (Optional - wird automatisch aus Projekt-Name ermittelt)

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: `https://ygpwuiygivxoqtyoigtg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQzNDIsImV4cCI6MjA3NjAyMDM0Mn0.1ZJtuko179K8j7bm6K3FwtpS5POY6RVu3Ixeh1ye3KE`

### AI/ML APIs
- `HUGGINGFACE_API_KEY`: `<Ihr-HuggingFace-API-Key>`
- `ANTHROPIC_API_KEY`: `<Ihr-Anthropic-API-Key>`
- `OPENAI_API_KEY`: `<Ihr-OpenAI-API-Key>` (Legacy support)
- `GEMINI_API_KEY`: `<Ihr-Gemini-API-Key>` (New standard)

### Supabase Service Role (für Backend-Operationen)
- `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0NDM0MywiZXhwIjoyMDc2MDIwMzQzfQ.W_rbOUxa57VffJiUX9TClCAFB6m11qS2GVxpEzWQ56Q`

### Vercel Webhook (für Deployment-Events)
- `VERCEL_WEBHOOK_SECRET`: `mbDmy0nOH2HjaK53lHX2gvLM` (KRITISCH - für Webhook-Signatur-Verifizierung)

## Setup-Anleitung

1. Gehe zu: https://github.com/u4231458123-droid/v0-header-component/settings/secrets/actions
2. Klicke auf "New repository secret"
3. Füge jeden Secret mit Name und Wert hinzu
4. Klicke auf "Add secret"

## Wichtig

- **Niemals** Secrets direkt im Code committen
- Secrets sind nur in GitHub Actions verfügbar
- Für lokale Entwicklung: `.env.local` Datei verwenden

## Lokale Entwicklung

Erstelle eine `.env.local` Datei im Projekt-Root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ygpwuiygivxoqtyoigtg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQzNDIsImV4cCI6MjA3NjAyMDM0Mn0.1ZJtuko179K8j7bm6K3FwtpS5POY6RVu3Ixeh1ye3KE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHd1aXlnaXZ4b3F0eW9pZ3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0NDM0MywiZXhwIjoyMDc2MDIwMzQzfQ.W_rbOUxa57VffJiUX9TClCAFB6m11qS2GVxpEzWQ56Q
HUGGINGFACE_API_KEY=<Ihr-HuggingFace-API-Key>
ANTHROPIC_API_KEY=<Ihr-Anthropic-API-Key>
GEMINI_API_KEY=<Ihr-Gemini-API-Key>
VERCEL_WEBHOOK_SECRET=mbDmy0nOH2HjaK53lHX2gvLM
```

**Wichtig**: `.env.local` ist in `.gitignore` und wird nicht committed.
