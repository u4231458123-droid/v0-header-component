# 🚨 QUALITY-BOT SETUP - EINMALIGE EINRICHTUNG

## Schnellstart

```bash
# 1. Setup ausführen (einmalig)
npm run quality:setup

# 2. Testen
npm run quality:gate components/layout/MainLayout.tsx
```

## Manuelle Einrichtung

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-quality-gate.ps1
```

### Linux/Mac (Bash)

```bash
bash scripts/setup-quality-gate.sh
```

## Was wird eingerichtet?

1. ✅ **Git Hooks** (`.git/hooks/pre-commit`, `.git/hooks/pre-push`)
   - Automatische Prüfung vor jedem Commit/Push
   - Blockiert bei kritischen Fehlern

2. ✅ **QualityBot-System**
   - Verpflichtende Code-Qualitätsprüfung
   - Auto-Fix für einfache Violations

3. ✅ **Bot-Orchestrator**
   - Strukturierte Nutzung aller Bots
   - Vollständiger Workflow

## Verifikation

### Test 1: Quality Gate

```bash
npm run quality:gate components/layout/MainLayout.tsx
```

**Erwartetes Ergebnis:**
```
✅ QUALITY GATE BESTANDEN
```

### Test 2: Git Hook

```bash
git commit --allow-empty -m "test: quality gate"
```

**Erwartetes Ergebnis:**
```
🚨 MANDATORY QUALITY GATE - Pre-Commit Check
✅ QUALITY GATE BESTANDEN - Commit erlaubt
```

## Troubleshooting

### Git Hook funktioniert nicht

**Windows:**
```powershell
# Prüfe ob Hook existiert
Test-Path .git/hooks/pre-commit

# Falls nicht, manuell ausführen
node scripts/cicd/mandatory-quality-gate.js --pre-commit
```

**Linux/Mac:**
```bash
# Prüfe ob Hook ausführbar ist
ls -la .git/hooks/pre-commit

# Falls nicht, ausführbar machen
chmod +x .git/hooks/pre-commit
```

### QualityBot nicht verfügbar

```bash
# Prüfe Installation
npm install

# Prüfe Bot-Dateien
ls lib/ai/bots/quality-bot.ts
```

### Node.js Fehler

```bash
# Prüfe Node.js Version
node --version  # Sollte >= 18 sein

# Prüfe npm
npm --version
```

## Nächste Schritte

Nach erfolgreichem Setup:

1. ✅ **Arbeite normal** - QualityBot prüft automatisch
2. ✅ **Nutze Auto-Fix** - `npm run quality:auto-fix <filePath>`
3. ✅ **Nutze Bot-Orchestrator** - `npm run bots:workflow <filePath>`

## Dokumentation

- 📖 [QUALITY_BOT_MANDATORY_SYSTEM.md](./QUALITY_BOT_MANDATORY_SYSTEM.md) - Vollständige Dokumentation
- 📖 [QUALITY_BOT_PROFESSIONAL_SETUP.md](./QUALITY_BOT_PROFESSIONAL_SETUP.md) - Professionelles Setup

---

**Status**: ✅ Production-Ready
**Version**: 1.0.0

