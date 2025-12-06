# C.R.E.D.O. Framework Template

**Das C.R.E.D.O. Framework garantiert vollständige, ausführbare Prompts.**

---

## C - Context (Kontext)

```markdown
**Context (MCP Live-Daten):**
- `project://ui/tokens` - Design-Tokens aus config/design-tokens.ts
- `project://db/schema` - Datenbank-Schema aus types/supabase.ts
- `project://app/routes` - Alle Next.js Routen und API-Endpunkte
- `project://docs/active` - Aktive Dokumentation und Regeln

**Relevante Dateien:**
- @project_specs.md - Projektspezifikationen
- @types/supabase.ts - Datenbank-Typen
- [BETROFFENE_DATEIEN]
```

---

## R - Role (Rolle)

```markdown
**Role:**
Agiere als [ROLLE] im NEO-GENESIS Hyper-Stack.

Mögliche Rollen:
- **Architekt**: Systemdesign, Datenmodellierung, API-Design
- **Frontend-Developer**: UI/UX, React-Komponenten, Styling
- **Backend-Developer**: API, Server-Actions, Datenbank
- **QA-Engineer**: Testing, Validierung, Code-Review
- **DevOps-Engineer**: CI/CD, Deployment, Monitoring
- **Full-Stack Developer**: Alle Bereiche (Standard)
```

---

## E - Execution (Ausführung)

```markdown
**Execution Protocol:**

1. **Context Fetch (Nexus Bridge):**
   - Lade Projekt-Kontext: `loadProjectContext()`
   - Prüfe UI-Tokens, DB-Schema, App-Routes
   - Analysiere Abhängigkeiten und Patterns

2. **Planung:**
   - Falls Datenmodell ändert: Aktualisiere Diagramme in `docs/diagrams/`
   - Prüfe Konsistenz mit project_specs.md
   - Identifiziere betroffene Komponenten

3. **Implementation:**
   - [SCHRITT-FÜR-SCHRITT ANWEISUNGEN]
   - Nutze Design-Tokens (KEINE hardcoded Farben)
   - Nutze TypeScript strict mode

4. **Self-Correction:**
   - `pnpm run lint` - ESLint prüfen
   - `pnpm run type-check` - TypeScript prüfen
   - `pnpm run validate:design` - Design-Tokens prüfen
   - Bei Fehlern: Self-Healing aktivieren

5. **Quality Gates:**
   - Pre-Commit Gate muss bestehen
   - Alle Tests müssen grün sein
```

---

## D - Definition of Done (Fertigstellungskriterien)

```markdown
**Definition of Done:**

- [ ] Code kompiliert ohne Fehler (TypeScript strict)
- [ ] ESLint zeigt keine Errors
- [ ] Design-Token-Konsistenz geprüft
- [ ] Unit-Tests geschrieben/aktualisiert
- [ ] Keine verbotenen Begriffe (kostenlos, gratis, etc.)
- [ ] Swimm-Dokumentation aktualisiert
- [ ] Pre-Commit Gate bestanden
- [ ] Git Commit mit strukturierter Message
```

---

## O - Output (Ausgabe)

```markdown
**Output Format:**

1. **Code-Änderungen:**
   - Alle geänderten Dateien mit vollständigem Pfad
   - Diff oder vollständiger Code

2. **Dokumentation:**
   - Kurze Beschreibung der Änderungen
   - Betroffene Komponenten/Module

3. **Validierung:**
   - Ergebnis der Quality Gates
   - Test-Ergebnisse

4. **Commit:**
   - Commit-Message nach Conventional Commits
   - Referenz zu Issues/Tasks
```

---

## Verwendung

```markdown
# TASK: [Aufgabenname]

## C - Context
@project_specs.md @types/supabase.ts
- MCP: project://ui/tokens, project://db/schema
- Betroffene Dateien: [...]

## R - Role
Agiere als [Rolle] im NEO-GENESIS Stack.

## E - Execution
1. [Schritt 1]
2. [Schritt 2]
3. [...]

## D - Definition of Done
- [ ] [Kriterium 1]
- [ ] [Kriterium 2]
- [ ] [...]

## O - Output
- Code-Änderungen in [Dateien]
- Commit: "[type]: [message]"

**EXECUTE.**
```

