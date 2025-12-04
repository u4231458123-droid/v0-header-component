# QualityBot - Professionelle Integration

## Übersicht

Vollständig integriertes, automatisches QualityBot-System für professionelle Code-Qualitätssicherung.

## Architektur

### Komponenten

1. **AutoQualityChecker** (`lib/ai/bots/auto-quality-checker.ts`)
   - TypeScript-Implementierung mit vollständiger Auto-Fix-Logik
   - Prüft Code gegen Knowledge-Base
   - Behebt Fehler automatisch

2. **AutoQualityCheckerWrapper** (`lib/ai/bots/auto-quality-checker-wrapper.js`)
   - CommonJS-Wrapper für Node.js-Kompatibilität
   - Lädt TypeScript-Module dynamisch
   - Fallback auf QualityBot direkt

3. **CLI-Script** (`scripts/cicd/auto-quality-check.js`)
   - Professionelle Command-Line-Interface
   - Robuste Fehlerbehandlung
   - Detaillierte Ausgabe

## Verwendung

### Automatisch

Der QualityBot wird automatisch bei Code-Änderungen aktiviert.

### Manuell

```bash
# Prüfe einzelne Datei
npm run quality:check app/dashboard/page.tsx

# Oder direkt
node scripts/cicd/auto-quality-check.js app/dashboard/page.tsx
```

### In Code

```typescript
import { withQualityCheck } from "@/lib/ai/bots/quality-integration"

// Wrapper für Code-Änderungen
const { result, qualityCheck } = await withQualityCheck(
  "app/dashboard/page.tsx",
  async () => {
    // Deine Code-Änderung
    return "Ergebnis"
  },
  {
    autoFix: true,
    autoSave: true,
  }
)
```

## Auto-Fix-Funktionen

### Automatisch behebbar

- ✅ **Design-Violations**:
  - Hardcoded Farben → Design-Tokens
  - `rounded-lg` → `rounded-2xl` (für Cards)
  - `rounded-md` → `rounded-xl` (für Buttons)
  - `gap-4`/`gap-6` → `gap-5`

- ✅ **UI-Konsistenz**:
  - UI-Library-Imports (wenn möglich)

### Manuelle Eingriffe erforderlich

- ⚠️ **Kritische Violations**:
  - Logik-Fehler
  - Sicherheitsprobleme
  - Komplexe Design-Änderungen

## Ausgabe

### Erfolg
```
✅ Code-Qualität OK: app/dashboard/page.tsx
```

### Auto-Fix angewendet
```
✅ Auto-Fix angewendet: app/dashboard/page.tsx
   2 verbleibende Violations
```

### Manuelle Eingriffe
```
⚠️  Manuelle Eingriffe erforderlich: app/dashboard/page.tsx
   3 Violations gefunden:

   1. [HIGH] design
      Zeile 42: Hardcoded Farbe gefunden
      💡 Vorschlag: Ersetze durch bg-primary

   2. [CRITICAL] functionality
      Zeile 89: Logik-Fehler
      💡 Vorschlag: Implementiere Null-Check
```

## Best Practices

1. **Immer prüfen lassen** vor Commits
2. **Auto-Fix aktivieren** für schnelle Behebungen
3. **Manuelle Eingriffe** bei kritischen Violations
4. **Dokumentation** bei komplexen Änderungen

## Fehlerbehebung

### "TypeScript-Module müssen kompiliert werden"

**Lösung**: Der Wrapper verwendet automatisch einen Fallback auf QualityBot direkt.

### "Fehler beim Laden des QualityCheckers"

**Lösung**: 
1. Prüfe ob `lib/ai/bots/quality-bot.ts` existiert
2. Führe `npm install` aus
3. Prüfe Node.js-Version (>= 18)

## Integration in CI/CD

```yaml
# .github/workflows/quality-check.yml
- name: Quality Check
  run: |
    npm run quality:check ${{ github.event.pull_request.head.ref }}
```

## Status

✅ **Vollständig integriert und einsatzbereit**
✅ **Robuste Fehlerbehandlung**
✅ **Automatische Fallbacks**
✅ **Professionelle Ausgabe**

---

**Letzte Aktualisierung**: 2025-01-03

