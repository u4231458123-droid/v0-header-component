# CI/CD-Pipeline - Vollständige Dokumentation

## ✅ Status: Vollständig implementiert und einsatzbereit

Die CI/CD-Pipeline ist vollständig konfiguriert und kann automatisch alle Aufgaben erledigen.

## 🚀 Schnellstart

### Lokale Validierung
```bash
# Design & Layout
pnpm validate:layout

# Mobile Responsiveness
pnpm validate:mobile

# API-Endpoints
pnpm validate:api

# Security
pnpm validate:security

# Performance
pnpm validate:performance

# Accessibility
pnpm validate:accessibility

# Finale Validierung (alle)
pnpm validate:final
```

### AI-powered Analyse
```bash
# Bug-Analyse
pnpm ai:analyze

# Pattern-based Fixes
pnpm ai:fix
```

## 📁 Struktur

```
├── lib/
│   ├── ai/
│   │   ├── bots/
│   │   │   ├── system-bot.ts          # System-Wartung & Code-Analyse
│   │   │   ├── quality-bot.ts         # Code-Prüfung gegen Dokumentation
│   │   │   └── prompt-optimization-bot.ts  # Prompt-Optimierung
│   │   ├── huggingface.ts             # Hugging Face Client
│   │   └── models.ts                  # Modell-Konfigurationen
│   ├── knowledge-base/
│   │   ├── structure.ts               # Knowledge-Base Struktur
│   │   ├── cicd-entries.ts            # CI/CD-spezifische Entries
│   │   └── load-with-cicd.ts          # Loader mit CI/CD-Integration
│   └── cicd/
│       └── prompts.ts                 # Prompt-Templates
├── scripts/
│   ├── validate-*.js                 # Validierungs-Scripts
│   ├── ai-*.js                       # AI-powered Scripts
│   └── cicd/
│       ├── load-knowledge-base.js    # Knowledge-Base-Loader
│       └── analyze-codebase.js       # Codebase-Analyse
└── .github/workflows/
    ├── master-validation.yml          # Master Validation Pipeline
    ├── auto-fix-bugs.yml              # Auto-Fix Workflow (24/7)
    └── advanced-optimizations.yml     # Advanced Optimizations
```

## 🤖 Bot-Architektur

### System-Bot
- **Aufgabe**: Code-Analyse, Bug-Fix, Optimierung
- **Features**:
  - Lädt Knowledge-Base automatisch
  - Führt IST-Analyse durch
  - Hugging Face Integration
  - Dokumentiert Fehler

### Quality-Bot
- **Aufgabe**: Code-Prüfung gegen Dokumentation
- **Features**:
  - Prüft Design-Vorgaben
  - Prüft Funktionalität
  - Prüft verbotene Begriffe
  - Dokumentiert Verstöße

### Prompt-Optimization-Bot
- **Aufgabe**: Prompt-Optimierung
- **Features**:
  - Optimiert Prompts basierend auf Knowledge-Base
  - Integriert Support-Bot Wissen
  - Kontinuierliche Optimierung

## 🔧 Konfiguration

### Environment Variables
```bash
HUGGINGFACE_API_KEY=your_api_key_here
AUTO_COMMIT=false  # Optional: Auto-Commit aktivieren
```

### GitHub Secrets
Folgende Secrets müssen in GitHub gesetzt werden:
- `HUGGINGFACE_API_KEY` - API-Key für Hugging Face
- `NEXT_PUBLIC_SUPABASE_URL` - Für Builds
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Für Builds
- `VERCEL_TOKEN` - Für Deployment (optional)
- `VERCEL_ORG_ID` - Für Deployment (optional)
- `VERCEL_PROJECT_ID` - Für Deployment (optional)

## 📋 Workflows

### Master Validation Pipeline
- **Trigger**: Push auf main/develop, Pull Requests
- **Phasen**:
  1. Code-Qualität (TypeScript, ESLint)
  2. Parallele Validierungen (Layout, Frontend, Backend)
  3. Integration & Final
  4. Deployment (nur main)

### Auto-Fix Workflow (24/7)
- **Trigger**: Alle 2 Stunden, täglich 3:00 UTC, Push, Manual
- **Features**:
  - AI-powered Bug-Analyse
  - Pattern-based Fixes
  - TypeScript & ESLint Auto-Fix
  - Auto-Commit (optional)

### Advanced Optimizations
- **Trigger**: Push, Pull Requests, Weekly, Manual
- **Features**:
  - Matrix Builds (Node 18, 20, 22)
  - Bundle Analyzer
  - Lighthouse CI
  - Dependency Updates Check

## 📚 Knowledge Base

Die Knowledge-Base enthält:
- Design-Guidelines
- Coding-Rules
- Forbidden-Terms
- Account-Rules
- Routing-Rules
- PDF-Generation
- Email-Templates
- CI/CD-Regeln
- Error-Handling

Alle Bots laden die Knowledge-Base automatisch vor jeder Aufgabe.

## 🎯 Wichtige Regeln

1. **Knowledge-Base zuerst**: IMMER Knowledge-Base laden vor jeder Aufgabe
2. **IST-Analyse**: Vor JEDER Änderung obligatorisch
3. **Design-Vorgaben**: KEINE Design-Änderungen, nur Funktionalität
4. **Funktionalität**: KEINE Entfernung bestehender Features
5. **Account-Routing**: Master-Account führt ins /dashboard (NICHT /mydispatch automatisch)
6. **Logo**: Immer `company.logo_url || "/images/mydispatch-3d-logo.png"`
7. **PDF**: Briefpapier wenn vorhanden, Logo wenn vorhanden, Standard DIN-Norm sonst
8. **E-MAIL**: MyDispatch-Design für MyDispatch, professionelles Design für Unternehmer
9. **PARTNER**: Nur markierte Daten werden übermittelt, alle standardmäßig sichtbar
10. **VERBOTENE BEGRIFFE**: Niemals "kostenlos", "testen", "trial", etc.

## 🔍 Validierungen

### Layout & Design
- Design-Tokens (keine hardcoded Farben)
- rounded-2xl für Cards, rounded-xl für Buttons
- gap-5 als Standard
- Verbotene Begriffe
- Logo-Integration

### Mobile
- Media Queries
- Breakpoints (≤768px)
- Touch-Targets (≥44px)
- Viewport Meta Tag

### API
- Dokumentation
- Error Handling
- Input Validation
- Authentication
- Rate Limiting

### Security
- Keine hardcoded Secrets
- Input Validation
- XSS Prevention
- HTTPS nur
- CSRF Protection

### Performance
- Bundle-Größe < 2MB
- Code-Splitting
- Lazy-Loading
- Memoization
- Tree-Shaking

### Accessibility
- ARIA-Attribute
- Alt-Texte
- Keyboard-Navigation
- Color-Contrast
- Screen-Reader-Support

## 🧪 Testing

### Lokale Tests
```bash
# Alle Validierungen
pnpm validate:final

# AI-Analyse
pnpm ai:analyze
```

### GitHub Actions
Die Workflows laufen automatisch bei:
- Push auf main/develop
- Pull Requests
- Scheduled (Auto-Fix: alle 2 Stunden)
- Manual (workflow_dispatch)

## 📊 Monitoring

- Alle Fehler werden in Knowledge-Base dokumentiert
- Prompts werden kontinuierlich optimiert
- Pipeline lernt aus Fehlern
- Selbstheilung durch gespeicherte Erkenntnisse

## 🆘 Troubleshooting

### Hugging Face API-Fehler
- Prüfe `HUGGINGFACE_API_KEY` in GitHub Secrets
- Prüfe Rate-Limits
- Fallback-Modelle werden automatisch verwendet

### Validierungs-Fehler
- Prüfe Logs in GitHub Actions
- Führe lokale Validierung aus: `pnpm validate:final`
- Prüfe Knowledge-Base für Regeln

### Build-Fehler
- Prüfe TypeScript: `pnpm exec tsc --noEmit`
- Prüfe ESLint: `pnpm lint`
- Prüfe Dependencies: `pnpm install --frozen-lockfile`

## 📝 Changelog

### Version 2.0.1
- ✅ Vollständige CI/CD-Pipeline implementiert
- ✅ Bot-Architektur vervollständigt
- ✅ Hugging Face Integration
- ✅ Knowledge-Base mit CI/CD-Entries
- ✅ Alle Validierungs-Scripts
- ✅ GitHub Actions Workflows
- ✅ Dokumentation

## 🔗 Weitere Dokumentation

- [CI/CD Pipeline Details](./docs/CICD_PIPELINE.md)
- [Knowledge Base](./lib/knowledge-base/structure.ts)
- [Bot-Architektur](./lib/ai/bots/)

