# TASK: Code-Refactoring

**Template für sicheres Refactoring ohne Funktionsverlust**

---

## C - Context

```
@project_specs.md

**MCP Live-Kontext (automatisch laden):**
- `project://ui/tokens` - Design-Tokens
- `project://db/schema` - Datenbank-Schema
- `project://app/routes` - App-Routen

**Refactoring-Ziel:**
- Betroffene Datei(en): [DATEIEN]
- Art des Refactorings: [ART]
- Motivation: [WARUM]
```

---

## R - Role

```
Agiere als Senior Software Architect im NEO-GENESIS Stack.

Deine Prinzipien:
- **Behavior Preservation**: Funktionalität darf sich NICHT ändern
- **Incremental Changes**: Kleine, verifizierbare Schritte
- **Test Coverage**: Vor Refactoring Tests sicherstellen
- **Clean Code**: SOLID, DRY, KISS Prinzipien
```

---

## E - Execution

```
**Refactoring Protokoll:**

1. **Pre-Refactoring Checks:**
   - Alle Tests müssen bestehen
   - Keine uncommitted Changes
   - Backup/Branch erstellen

2. **Analyse:**
   - Code vollständig verstehen
   - Abhängigkeiten identifizieren
   - Risiken bewerten

3. **Test Coverage sicherstellen:**
   - Bestehende Tests prüfen
   - Fehlende Tests hinzufügen
   - Characterization Tests falls nötig

4. **Refactoring (Schritt für Schritt):**
   
   **Mögliche Refactorings:**
   - Extract Function/Method
   - Extract Component
   - Rename (Variable, Function, File)
   - Move (to another file/module)
   - Inline (unused abstraction)
   - Replace Magic Numbers with Constants
   - Extract Interface/Type
   - Simplify Conditionals
   - Remove Dead Code
   - DRY (Extract common logic)

5. **Nach jedem Schritt:**
   - `pnpm run test` - Tests müssen bestehen
   - `pnpm run lint` - Keine neuen Errors
   - `pnpm run type-check` - TypeScript OK
   - Commit wenn OK (atomic commits)

6. **Self-Healing bei Fehlern:**
   - Bei Build-Error: `selfHealing.heal('build-error', details)`
   - Rollback wenn nötig

7. **Post-Refactoring:**
   - Alle Tests bestehen
   - Code-Review bereit
   - Dokumentation aktualisiert
```

---

## D - Definition of Done

```
- [ ] Alle Tests bestehen (vor und nach Refactoring)
- [ ] Funktionalität unverändert
- [ ] Code ist cleaner/besser strukturiert
- [ ] TypeScript kompiliert ohne Fehler
- [ ] ESLint zeigt keine Errors
- [ ] Keine neuen Warnings
- [ ] Dokumentation aktualisiert
- [ ] Atomic Commits für jeden Schritt
- [ ] Pre-Commit Gate bestanden
```

---

## O - Output

```
**Erwartete Ausgabe:**

1. Alle geänderten Dateien (mit Diff)
2. Test-Ergebnisse (vor/nach)
3. Beschreibung der Änderungen
4. Commit-Message: "refactor([scope]): [beschreibung]

- [Änderung 1]
- [Änderung 2]

No functional changes."
```

---

## Refactoring-Typen

```
**Extract:**
- `extract-function` - Extrahiere Funktion
- `extract-component` - Extrahiere React-Komponente
- `extract-hook` - Extrahiere Custom Hook
- `extract-type` - Extrahiere TypeScript-Typ

**Rename:**
- `rename-variable` - Variable umbenennen
- `rename-function` - Funktion umbenennen
- `rename-file` - Datei umbenennen

**Move:**
- `move-to-shared` - Nach components/shared verschieben
- `move-to-utils` - Nach lib/utils verschieben

**Simplify:**
- `simplify-conditional` - Bedingte Logik vereinfachen
- `remove-dead-code` - Ungenutzten Code entfernen
- `inline-abstraction` - Unnötige Abstraktion auflösen

**Structure:**
- `apply-solid` - SOLID-Prinzipien anwenden
- `apply-dry` - Duplikation entfernen
```

---

## User Input

**Was soll refactored werden:** [BESCHREIBUNG]

**Betroffene Datei(en):** [DATEIEN]

**Art des Refactorings:** [ART - siehe oben]

---

**EXECUTE.**

