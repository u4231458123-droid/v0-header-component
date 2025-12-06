# CI/CD Automatisierung & Self-Healing

## Übersicht

Dieses Dokument beschreibt die vollständige CI/CD-Pipeline-Strategie für MyDispatch mit Fokus auf autonome Ausführung, Self-Healing und Zero-User-Input-Operationen.

---

## 1. Automatisierungs-Prinzip

### 1.1 Keine manuellen USER-Eingriffe

**WICHTIG**: Alle Arbeiten sind vollständig durch den AI-Agenten auszuführen. Manuelle Eingriffe durch den USER sind zu vermeiden.

### 1.2 Automatisierte Systemzugriffe

Der AI-Agent hat Zugriff auf:

#### Supabase (via MCP Server)
- **Datenbankoperationen**: Schema-Änderungen, Daten-Migrationen, Query-Optimierung
- **Authentication & Authorization**: User-Management, JWT-Policies, RLS
- **Storage-Management**: Bucket-Erstellung, Policies, CDN
- **Edge Functions**: Deployment, Environment-Variables

#### GitHub (via API)
- **Repository-Management**: Branches, PRs, Issues, Commits
- **CI/CD-Pipeline**: Workflow-Updates, Secrets, Deployments
- **Code-Reviews**: Automatische Reviews, Quality-Checks

### 1.3 Autonome Ausführung

Der AI-Agent:
- ✅ Führt alle Operationen selbstständig aus
- ✅ Verifiziert jede Aktion automatisch
- ✅ Implementiert Rollback bei Fehlern
- ✅ Dokumentiert alle durchgeführten Änderungen
- ❌ Fordert KEINE manuellen Eingriffe an

---

## 2. CI/CD Pipeline Struktur

### 2.1 Main Pipeline (ci.yml)

```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --maxWorkers=4

  build:
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: ./scripts/deploy.sh
```

### 2.2 Optimierungen

- ✅ Caching von Dependencies (npm cache)
- ✅ Parallelisierung unabhängiger Jobs
- ✅ Matrix-Builds für Multi-Platform-Testing
- ✅ Conditional Jobs (Deploy nur bei main-Branch)
- ✅ Artifact-Sharing zwischen Jobs

### 2.3 Workflow-Härtungs-Richtlinien

**WICHTIG**: Kritische Validierungs-Steps dürfen NICHT mit `|| true` abgeschlossen werden!

#### Verboten in kritischen Workflows (ci.yml, master-validation.yml):

```yaml
# ❌ FALSCH - Fehler werden ignoriert
- name: Type Check
  run: pnpm run type-check || true

# ❌ FALSCH - continue-on-error für kritische Schritte
- name: Lint
  run: pnpm run lint
  continue-on-error: true
```

#### Korrekte Verwendung:

```yaml
# ✅ RICHTIG - Fehler blockieren den Workflow
- name: Type Check
  run: pnpm run type-check

# ✅ RICHTIG - continue-on-error nur mit Validierung
- name: Lint
  run: pnpm run lint
  continue-on-error: ${{ github.event_name == 'schedule' }}
```

#### Erlaubte Ausnahmen für `|| true`:

1. **Cleanup-Aktionen** (z.B. Server-Stop in E2E-Tests):
   ```yaml
   - name: Stop Server
     if: always()
     run: kill $SERVER_PID 2>/dev/null || true
   ```

2. **Informative Prüfungen** (nur bei schedule/workflow_dispatch):
   ```yaml
   - name: Check Updates
     run: pnpm outdated || true
   ```

3. **Auto-Fix-Fallbacks** (nur wenn Hauptbefehl fehlschlägt):
   ```yaml
   - name: ESLint Fix
     run: pnpm run lint:fix 2>/dev/null || pnpm exec eslint --fix || true
   ```

#### Workflow-Kategorien:

| Kategorie | `|| true` erlaubt | `continue-on-error` erlaubt |
|-----------|-------------------|----------------------------|
| CI/CD Main (ci.yml) | ❌ Nein | ❌ Nein |
| Validation (master-validation.yml) | ❌ Nein | ❌ Nein |
| E2E Tests (e2e-tests.yml) | ✅ Nur Cleanup | ✅ Mit Bedingung |
| Auto-Fix (auto-*.yml) | ✅ Als Fallback | ✅ Ja |
| Scheduled Jobs | ✅ Ja | ✅ Ja |

---

## 3. Self-Healing Workflows

### 3.1 Auto-Format Workflow

```yaml
name: Auto-Format on Push
on:
  push:
    branches-ignore:
      - main

jobs:
  auto-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-Format
        run: |
          npm run format
          npm run lint -- --fix

      - name: Commit if changed
        run: |
          git config user.name "AI Agent"
          git config user.email "ai-agent@mydispatch.de"
          git add .
          git diff --staged --quiet || git commit -m "style: auto-format code"
          git push
```

### 3.2 Dependency Self-Healing

Bei Dependency-Problemen führt das System automatisch folgende Schritte aus:

1. **Standard Install** versuchen
2. **Legacy Peer Deps** falls nötig
3. **Clean Install** als Fallback
4. **AI-powered Version Resolution** bei Konflikten

### 3.3 Test Failure Handling

- Flaky Test Detection und automatisches Retry
- AI-powered Test Fixing bei persistenten Failures
- Team-Notification bei kritischen Fehlern

### 3.4 Deployment Rollback

```yaml
- name: Health Check
  run: |
    for i in {1..10}; do
      if curl -f https://api.mydispatch.de/health; then
        exit 0
      fi
      sleep 5
    done
    exit 1

- name: Automated Rollback
  if: failure()
  run: ./scripts/rollback.sh ${{ steps.current.outputs.version }}
```

---

## 4. Verifizierungs-System

### 4.1 Pre-Execution Checks

Vor jeder Ausführung werden geprüft:

| Check | Beschreibung |
|-------|-------------|
| Node.js Version | >= 18 erforderlich |
| .env Datei | Muss existieren |
| Supabase Connection | Verbindungstest |
| GitHub Token | Muss gesetzt sein |

### 4.2 Post-Deployment Checks

- Health-Endpoint-Verification
- Performance-Baseline-Check
- Critical-Path-E2E-Tests

---

## 5. Scripts

### 5.1 Setup Script

```bash
#!/bin/bash
set -euo pipefail

echo "🚀 Starting automated setup..."
npm install
node scripts/supabase-setup.js
npx husky install
npm run validate
echo "✨ Setup complete!"
```

### 5.2 Validation Script

```bash
#!/bin/bash
set -e

npm run type-check
npm run lint
npm run test:unit -- --coverage
npm run build
npm audit --audit-level=moderate
node scripts/check-bundle-size.js
```

### 5.3 Rollback Script

```bash
#!/bin/bash
VERSION=$1
gh release download "v$VERSION" --pattern "*.tar.gz"
tar -xzf "app-v$VERSION.tar.gz"
./deploy.sh
./scripts/health-check.sh
```

---

## 6. Performance-Metriken

### 6.1 Zielwerte

| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Build-Zeit | < 5 min | 2 min ✅ |
| Test-Ausführung | < 10 min | 6 min ✅ |
| Deployment | < 2 min | 1:40 min ✅ |
| Cache Hit Rate | > 85% | 87% ✅ |

### 6.2 Optimierungsmaßnahmen

- Dependency-Caching
- Build-Artefakt-Caching
- Job-Parallelisierung
- Inkrementelles Building
- Test-Sharding

---

## 7. Monitoring & Alerting

### 7.1 Pipeline-Überwachung

- Duration Trending
- Success Rate
- Cache Hit Rate
- Artifact Sizes

### 7.2 Alerting

- Slack-Notification bei Failures
- Email bei kritischen Deployments
- Automatische Issue-Erstellung bei wiederkehrenden Problemen

---

## 8. Best Practices

1. **Immer parallele Jobs nutzen** wo möglich
2. **Caching aktivieren** für alle Dependencies
3. **Fail-fast deaktivieren** für E2E-Tests (alle durchlaufen lassen)
4. **Automatisches Retry** für flaky Tests
5. **Health-Checks** vor und nach Deployments
6. **Rollback-Strategie** immer bereithalten
7. **Dokumentation** aller Änderungen automatisch generieren
