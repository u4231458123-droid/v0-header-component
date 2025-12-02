# GitHub Secrets Setup - MyDispatch

## Erforderliche Secrets

Die folgenden Secrets müssen in GitHub Repository Settings → Secrets and variables → Actions konfiguriert werden:

### Vercel Deployment
- `VERCEL_TOKEN`: `<Ihr-Vercel-Token>`
- `VERCEL_ORG_ID`: (Optional - wird automatisch aus Token ermittelt)
- `VERCEL_PROJECT_ID`: `<Ihre-Vercel-Projekt-ID>`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: `<Ihre-Supabase-URL>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<Ihr-Supabase-Anon-Key>`

### AI/ML APIs
- `HUGGINGFACE_API_KEY`: `<Ihr-HuggingFace-API-Key>`
- `ANTHROPIC_API_KEY`: `<Ihr-Anthropic-API-Key>`
- `OPENAI_API_KEY`: `<Ihr-OpenAI-API-Key>` (Legacy support)
- `GEMINI_API_KEY`: `<Ihr-Gemini-API-Key>` (New standard)

### Supabase Service Role (für Backend-Operationen)
- `SUPABASE_SERVICE_ROLE_KEY`: `<Ihr-Supabase-Service-Role-Key>`

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
NEXT_PUBLIC_SUPABASE_URL=<Ihre-Supabase-URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Ihr-Supabase-Anon-Key>
HUGGINGFACE_API_KEY=<Ihr-HuggingFace-API-Key>
ANTHROPIC_API_KEY=<Ihr-Anthropic-API-Key>
GEMINI_API_KEY=<Ihr-Gemini-API-Key>
```

**Wichtig**: `.env.local` ist in `.gitignore` und wird nicht committed.
