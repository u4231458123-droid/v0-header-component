# /heal - Self-Healing Protokolle

**Automatische Fehlerbehebung ohne User-Intervention**

---

## Basis-Syntax

```
/heal <error-type> [options]
```

---

## Fehlertypen

### `dependency` - Dependency-Probleme

```
/heal dependency
```

**Automatische Fixes:**
1. `pnpm install` (Standard)
2. Cache löschen + Clean Install
3. Legacy Peer Deps Install

### `test-failure` - Test-Fehler

```
/heal test-failure
```

**Automatische Fixes:**
1. Tests mit Retry ausführen
2. Flaky-Test-Detection
3. Nur fehlgeschlagene Tests wiederholen

### `build-error` - Build-Fehler

```
/heal build-error
```

**Automatische Fixes:**
1. Cache löschen (.next)
2. TypeScript-Typen neu generieren
3. Vollständiger Reset (node_modules + .next)

### `lint-error` - Lint-Fehler

```
/heal lint-error
```

**Automatische Fixes:**
1. ESLint AutoFix (`--fix`)
2. Prettier Formatierung
3. Lint-Check zur Bestätigung

### `type-error` - TypeScript-Fehler

```
/heal type-error
```

**Automatische Fixes:**
1. Typen neu generieren
2. Type-Check erneut ausführen

---

## Optionen

| Option | Beschreibung |
|--------|--------------|
| `--max-attempts=N` | Maximale Versuche (Standard: 3) |
| `--delay=N` | Verzögerung zwischen Versuchen in ms (Standard: 2000) |
| `--auto-commit` | Automatisch committen nach erfolgreichem Fix |
| `--silent` | Keine Ausgabe |

---

## Beispiele

### Dependency-Probleme beheben
```
/heal dependency
```

### Build-Fehler mit 5 Versuchen
```
/heal build-error --max-attempts=5
```

### Lint-Fehler mit Auto-Commit
```
/heal lint-error --auto-commit
```

---

## Protokoll-Ablauf

```
Fehler erkannt
      |
      v
┌─────────────────┐
│ Fehlertyp       │
│ identifizieren  │
└────────┬────────┘
         |
         v
┌─────────────────┐
│ Heilbar?        │──No──> Manueller Fix nötig
└────────┬────────┘
         | Yes
         v
┌─────────────────┐
│ Versuch 1       │──Erfolg──> ✅ Done
└────────┬────────┘
         | Fehlgeschlagen
         v
┌─────────────────┐
│ Versuch 2       │──Erfolg──> ✅ Done
└────────┬────────┘
         | Fehlgeschlagen
         v
┌─────────────────┐
│ Versuch 3       │──Erfolg──> ✅ Done
└────────┬────────┘
         | Fehlgeschlagen
         v
❌ Self-Healing fehlgeschlagen
   → Manueller Fix erforderlich
```

---

## Heilungshistorie

Alle Heilungsversuche werden protokolliert:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "protocol": "build-error-recovery",
  "result": {
    "success": true,
    "attempts": 2,
    "fixes": ["Cache gelöscht", "Build nach Cache-Clear erfolgreich"],
    "duration": 45000
  }
}
```

---

## Integration mit Workflows

Self-Healing wird automatisch aktiviert bei:

1. **Workflow-Fehlern** → Automatischer Retry
2. **CI/CD-Fehlern** → Build-Recovery
3. **Quality-Gate-Fehlern** → Lint/Type-Fix

---

## Best Practices

1. **Erst Self-Healing versuchen** vor manuellem Fix
2. **Logs prüfen** bei wiederholten Fehlern
3. **Root-Cause analysieren** bei Pattern-Fehlern
4. **Dokumentieren** wenn manueller Fix nötig war

---

## Einschränkungen

Self-Healing kann **nicht** automatisch beheben:

- Logik-Fehler im Code
- Fehlende Implementierungen
- Architektur-Probleme
- Datenbank-Migrationsfehler
- Security-Vulnerabilities

Diese erfordern manuellen Eingriff durch AI-Agenten oder Entwickler.

