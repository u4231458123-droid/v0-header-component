# CI/CD-Pipeline Dokumentation

## Übersicht

Die CI/CD-Pipeline ist vollständig konfiguriert und kann automatisch:
- Code analysieren (mit Knowledge-Base)
- Bugs finden und fixen (mit KI-Modellen)
- Code optimieren (Performance, Qualität)
- Validierungen durchführen (Layout, Mobile, API, Security, Performance, Accessibility)
- Design-Vorgaben prüfen
- Account-Routing prüfen
- Alle weiteren Aufgaben erledigen

## Komponenten

### 1. Knowledge Base
- **Datei**: `lib/knowledge-base/cicd-entries.ts`
- **Loader**: `lib/knowledge-base/load-with-cicd.ts`
- Enthält alle CI/CD-Regeln, MyDispatch-spezifische Vorgaben, Error-Handling

### 2. Hugging Face Integration
- **Client**: `lib/ai/huggingface.ts`
- **Modelle**: `lib/ai/models.ts`
- **Modelle**: DeepSeek V3, StarCoder2 15B, CodeLlama 13B, WizardCoder 15B
- Automatischer Fallback zwischen Modellen

### 3. Prompt-Templates
- **Datei**: `lib/cicd/prompts.ts`
- Code-Analyse, Bug-Analyse, Optimierung
- Alle mit Knowledge-Base-Integration

### 4. Validierungs-Scripts
- `scripts/validate-layout.js` - Design-System
- `scripts/validate-mobile.js` - Mobile Responsiveness
- `scripts/validate-api.js` - API-Endpoints
- `scripts/validate-security.js` - Security
- `scripts/validate-performance.js` - Performance
- `scripts/validate-accessibility.js` - Accessibility
- `scripts/validate-final.js` - Finale Validierung

### 5. AI-powered Scripts
- `scripts/ai-bug-analysis.js` - Bug-Analyse mit KI
- `scripts/fix-patterns.js` - Pattern-based Fixes

### 6. Bot-Architektur
- **System-Bot**: `lib/ai/bots/system-bot.ts` - Code-Analyse, Bug-Fix, Optimierung
- **Quality-Bot**: `lib/ai/bots/quality-bot.ts` - Code-Prüfung gegen Dokumentation
- **Prompt-Optimization-Bot**: `lib/ai/bots/prompt-optimization-bot.ts` - Prompt-Optimierung

### 7. GitHub Actions Workflows
- **Master Validation**: `.github/workflows/master-validation.yml`
- **Auto-Fix**: `.github/workflows/auto-fix-bugs.yml` (24/7)
- **Advanced Optimizations**: `.github/workflows/advanced-optimizations.yml`

## Verwendung

### Lokale Validierung
```bash
pnpm exec node scripts/validate-layout.js
pnpm exec node scripts/validate-mobile.js
pnpm exec node scripts/validate-api.js
pnpm exec node scripts/validate-security.js
pnpm exec node scripts/validate-performance.js
pnpm exec node scripts/validate-accessibility.js
pnpm exec node scripts/validate-final.js
```

### AI-powered Analyse
```bash
pnpm exec node scripts/ai-bug-analysis.js
pnpm exec node scripts/fix-patterns.js
```

## Konfiguration

### Environment Variables
- `HUGGINGFACE_API_KEY` - API-Key für Hugging Face
- `AUTO_COMMIT` - Auto-Commit aktivieren (optional)

### GitHub Secrets
- `HUGGINGFACE_API_KEY` - Muss in GitHub Secrets gesetzt werden
- `NEXT_PUBLIC_SUPABASE_URL` - Für Builds
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Für Builds

## Wichtige Regeln

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

## Kontinuierliche Verbesserung

- Fehler werden in Knowledge-Base dokumentiert
- Prompts werden kontinuierlich optimiert
- Pipeline lernt aus Fehlern
- Selbstheilung durch gespeicherte Erkenntnisse

