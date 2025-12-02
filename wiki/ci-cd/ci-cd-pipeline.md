# CI/CD Pipeline

## Übersicht

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   Git Repository                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │  Push   │───▶│  Build  │───▶│  Test   │         │
│  └─────────┘    └─────────┘    └─────────┘         │
│                                      │              │
│                               ┌──────┴──────┐       │
│                               ▼             ▼       │
│                        ┌─────────┐   ┌─────────┐   │
│                        │ Preview │   │  Prod   │   │
│                        └─────────┘   └─────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
\`\`\`

## Git-Workflow

### Branches

| Branch | Zweck | Auto-Deploy |
|--------|-------|-------------|
| main | Production | Ja (Prod) |
| develop | Development | Ja (Preview) |
| feature/* | Features | Nein |
| bugfix/* | Bugfixes | Nein |
| hotfix/* | Hotfixes | Nein |

### Commit-Konventionen

\`\`\`
type(scope): description

Types:
- feat: Neues Feature
- fix: Bugfix
- docs: Dokumentation
- style: Formatierung
- refactor: Code-Umbau
- test: Tests
- chore: Maintenance

Beispiele:
feat(auth): add password reset functionality
fix(bookings): resolve date picker timezone issue
docs(readme): update installation instructions
\`\`\`

## Vercel Integration

### Automatische Deployments

\`\`\`yaml
# Trigger
- Push to main → Production
- Push to develop → Preview
- PR erstellt → Preview

# Build
- npm install
- npm run build
- npm run test (falls vorhanden)
\`\`\`

### Environment Variables

| Environment | Variables |
|-------------|-----------|
| Production | Alle Live-Keys |
| Preview | Alle Test-Keys |
| Development | Lokale .env.local |

## Quality Gates

### Pre-Commit (Husky)

\`\`\`bash
# .husky/pre-commit
npm run lint
npm run type-check
\`\`\`

### Pull Request

1. Code Review erforderlich
2. Tests müssen bestehen
3. Build muss erfolgreich sein
4. Keine Konflikte

### Pre-Deploy

1. Build erfolgreich
2. TypeScript-Fehler behoben
3. ESLint-Warnings behoben

## Rollback

### Vercel Rollback

\`\`\`bash
# Via CLI
vercel rollback

# Via Dashboard
# Deployments → Select → Promote to Production
\`\`\`

### Datenbank-Rollback

\`\`\`sql
-- Manuelle Migration rückgängig machen
-- Backup wiederherstellen falls nötig
\`\`\`

## Monitoring

### Vercel
- Deployment Logs
- Function Logs
- Analytics

### Fehler-Tracking
- Error-Logs in Vercel
- Optional: Sentry Integration

## Checkliste für Releases

- [ ] Alle Tests bestanden
- [ ] Code Review abgeschlossen
- [ ] Dokumentation aktualisiert
- [ ] Changelog aktualisiert
- [ ] Migration-Scripts vorhanden
- [ ] Rollback-Plan dokumentiert
