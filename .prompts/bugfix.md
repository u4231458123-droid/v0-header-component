# TASK: Bug-Behebung (TDD-Approach)

**Template für Bug-Fixes mit Test-Driven Development**

---

## C - Context

```
@project_specs.md @active_file

**MCP Live-Kontext (automatisch laden):**
- `project://ui/tokens` - Design-Tokens
- `project://db/schema` - Datenbank-Schema
- `project://docs/active` - Aktive Regeln

**Bug-Kontext:**
- Betroffene Datei(en): [DATEIEN]
- Fehlerbeschreibung: [BESCHREIBUNG]
- Reproduktionsschritte: [STEPS]
```

---

## R - Role

```
Agiere als QA-Engineer und Bug-Fixer im NEO-GENESIS Stack.

Dein Approach:
- **Test First**: Erst Testfall schreiben (Red)
- **Minimal Fix**: Kleinste Änderung die den Bug behebt
- **Regression Prevention**: Sicherstellen dass nichts anderes bricht
```

---

## E - Execution

```
**TDD Bug-Fix Protokoll:**

1. **Context Fetch:**
   - Lade Projekt-Kontext via Nexus Bridge
   - Analysiere betroffene Komponenten
   - Identifiziere Root-Cause

2. **RED - Testfall erstellen:**
   - Schreibe reproduzierenden Testfall
   - Test muss FEHLSCHLAGEN (Bug bestätigt)
   ```typescript
   test('reproduces bug: [description]', () => {
     // Setup
     // Action that triggers bug
     // Assert expected behavior
   })
   ```

3. **GREEN - Bug fixen:**
   - Implementiere minimalen Fix
   - Test muss BESTEHEN
   - Keine zusätzlichen Änderungen

4. **REFACTOR - Aufräumen:**
   - Code verbessern falls nötig
   - Tests müssen weiterhin bestehen

5. **Regression Check:**
   - `pnpm run test` - Alle Tests
   - `pnpm run lint` - Keine neuen Fehler
   - `pnpm run type-check` - TypeScript OK

6. **Self-Healing bei Fehlern:**
   - Bei Lint-Errors: `selfHealing.heal('lint-error', details)`
   - Bei Type-Errors: `selfHealing.heal('type-error', details)`

7. **Documentation:**
   - Update Swimm-Doc falls Logik geändert
   - Kommentar im Code wenn Workaround
```

---

## D - Definition of Done

```
- [ ] Bug ist reproduzierbar (Testfall existiert)
- [ ] Testfall schlägt vor Fix fehl (Red)
- [ ] Testfall besteht nach Fix (Green)
- [ ] Alle anderen Tests bestehen (Regression)
- [ ] TypeScript kompiliert ohne Fehler
- [ ] ESLint zeigt keine Errors
- [ ] Code-Review-ready
- [ ] Root-Cause dokumentiert
- [ ] Pre-Commit Gate bestanden
```

---

## O - Output

```
**Erwartete Ausgabe:**

1. Testfall(e) für den Bug
2. Geänderte Datei(en) mit Fix
3. Root-Cause-Analyse (kurz)
4. Commit-Message: "fix([scope]): [beschreibung]

- Root-Cause: [Ursache]
- Solution: [Lösung]

Fixes #[issue-number]"
```

---

## User Input

**Bug-Beschreibung:** [HIER BUG BESCHREIBEN]

**Betroffene Datei(en):** [OPTIONAL - falls bekannt]

**Reproduktionsschritte:** [OPTIONAL - falls bekannt]

---

**EXECUTE.**

