# Deployment & Operations Guide

## Überblick

Das Deployment erfolgt vollständig **automatisiert** über Vercel CI/CD mit GitHub Actions als Orchestrator.

## Deployment-Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Code in Git pushen (main branch)                        │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 2. GitHub Actions Trigger                                   │
│    - Lint Check (ESLint)                                   │
│    - Type Check (TypeScript)                               │
│    - Security Scan                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────▼──────────┐
         │ Alle Checks OK?  │
         └───────┬──────────┘
                 │ ✅ JA
┌────────────────▼────────────────────────────────────────────┐
│ 3. Vercel Auto-Deployment                                   │
│    - Build Next.js Projekt                                 │
│    - Optimierung                                           │
│    - Production-Ready                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 4. Live auf https://v0-header-component.vercel.app        │
└─────────────────────────────────────────────────────────────┘
```

## Umgebungen

| Umgebung | URL | Trigger |
|----------|-----|---------|
| **Development** | localhost:3000 | `npm run dev` lokal |
| **Staging** | staging.v0-header-component.vercel.app | Preview Deployment |
| **Production** | v0-header-component.vercel.app | Push zu main |

## GitHub Actions Workflows

### `.github/workflows/build-and-deploy.yml`
```yaml
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test:e2e || true
```

**Durchlaufzeit**: ~8-15 Minuten

### `.github/workflows/preview-pr.yml`
```yaml
on:
  pull_request:

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
```

**Nur bei PR**: Erzeugt temporären Preview-Link

## Environment-Variablen

### Production (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIz...
TAVILY_API_KEY=tvly-...
```

**Verwaltung**: Vercel Dashboard → Settings → Environment Variables

### Secrets (GitHub)
```
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
```

**Verwaltung**: GitHub → Settings → Secrets and variables

## Deployment-Checklist

### Vor dem Deployment

- [ ] Alle Tests bestanden (`npm run lint`, `npm run build`)
- [ ] Code Review genehmigt
- [ ] Keine ERROR-Level Console Logs
- [ ] Environment-Variablen sind aktuell
- [ ] Database Migrations durchgeführt (falls nötig)
- [ ] Design-Guidelines eingehalten
- [ ] Deutsche Texte überprüft

### Nach dem Deployment

- [ ] Website lädt (Status 200)
- [ ] Alle Pages funktionieren
- [ ] Dashboard Login funktioniert
- [ ] Keine 404/500 Errors in Console
- [ ] Performance: Lighthouse Score >80
- [ ] Mobile Version responsiv

## Rollback

### Schnell zurückrollen
```bash
# Vorheriger Commit
git revert HEAD
git push origin main

# oder manual
git checkout <previous-commit>
git push -f origin main
```

**Vercel** stellt automatisch vorherige Builds bereit:
Vercel Dashboard → Deployments → Redeploy

## Monitoring

### Fehler-Tracking
- **Sentry** (optional): Automatische Error Reports
- **GitHub Logs**: Actions Logs ansehen
- **Vercel Logs**: Real-time Logs beim Deployment

### Performance
- **Vercel Analytics**: Automatisch aktiviert
- **Web Vitals**: NextJS built-in
- **Lighthouse**: Vor jedem Release prüfen

```bash
npm run analyze  # Bundle-Größe analyieren
```

## Disaster Recovery

### Datenbank-Backup
```bash
# Manuelles Backup (Supabase)
supabase db push --dry-run

# Automatische Backups
- Supabase Pro: täglich
- Supabase Enterprise: stündlich
```

### Gesamtes System-Rollback
```bash
# Fall 1: Production vollständig down
→ Vercel: Redeploy aus vorheriger Version

# Fall 2: Database korrupt
→ Supabase: Restore aus Backup-Punkt

# Fall 3: Vollständiger Systemfehler
→ GitHub: Checkout stabiler Branch, neu deployen
```

## Häufige Deployment-Probleme

### Problem: Build fehlgeschlagen
```
❌ TypeError: Cannot read property 'map' of undefined
```
**Lösung**: 
1. Lokal `npm run build` ausführen
2. Fehler lokal debuggen
3. Fix committen
4. Neuer Push

### Problem: Environment-Variablen vergessen
```
❌ Error: SUPABASE_URL is not defined
```
**Lösung**:
1. Vercel Dashboard öffnen
2. Settings → Environment Variables
3. Variable hinzufügen
4. Neuen Deployment triggern (Redeploy Button)

### Problem: Supabase-Connection fehlgeschlagen
```
❌ Error: Connection refused
```
**Lösung**:
1. Supabase Status-Seite prüfen
2. Service-Keys überprüfen
3. IP-Whitelist prüfen (falls vorhanden)
4. Neuer Deploy nach Service-Wiederherstellung

## Commands

| Command | Beschreibung |
|---------|------------|
| `npm run build` | Production Build lokal |
| `npm run analyze` | Bundle-Größe analyzer |
| `vercel logs` | Real-time Production Logs |
| `vercel env pull` | Umgebungsvariablen abrufen |

---

**Weitere Dokumentation**:
- [CI/CD Pipeline](./CI-CD-Pipeline.md)
- [Environment Setup](./Environment-Setup.md)
