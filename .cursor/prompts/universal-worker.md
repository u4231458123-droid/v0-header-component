# Universal Worker Prompt

**NEO-GENESIS Hyper-Stack - Standard-Prompt für tägliche Aufgaben**

---

## C.R.E.D.O. Framework

Jeder Prompt folgt dem C.R.E.D.O. Framework:
- **C**ontext: MCP-Resources, relevante Dateien
- **R**ole: Spezialisierte Rolle (Architekt, Developer, QA, etc.)
- **E**xecution: Schritt-für-Schritt Protokoll
- **D**efinition of Done: Akzeptanzkriterien
- **O**utput: Erwartetes Ergebnis

---

## Prompt-Template

```
@project_specs.md @types/supabase.ts

## C - Context
- MCP: `project://ui/tokens`, `project://db/schema`, `project://app/routes`
- Betroffene Bereiche: [Frontend/Backend/Database/Tests]

## R - Role
Agiere als autonomer Full-Stack Developer im NEO-GENESIS Stack.

## E - Execution

Task: [TASK BESCHREIBUNG]

**Protokoll:**

1. **Context Fetch (Nexus Bridge):**
   - Lade Projekt-Kontext: `loadProjectContext()`
   - UI-Tokens, DB-Schema, App-Routen, Aktive Docs
   - Prüfe Abhängigkeiten und bestehende Patterns

2. **Planung:**
   - Falls sich das Datenmodell ändert, aktualisiere erst Diagramme in `docs/diagrams/`
   - Definiere Business-Logik in `project_specs.md` falls nötig

3. **Implementation:**
   - Implementiere die Logik
   - Nutze Design-Tokens (KEINE hardcoded Farben)
   - Nutze Server Components als Default

4. **Background (Trigger.dev):**
   - Tasks >10s → Trigger.dev Job in `trigger/jobs/`

5. **Self-Correction + Self-Healing:**
   - `pnpm run lint` + `pnpm run type-check`
   - `pnpm run validate:design`
   - Bei Fehlern: `selfHealing.heal(errorType, details)`

6. **Quality Gates:**
   - `Gates.preCommit()` muss bestehen vor Commit

7. **Documentation (Swimm):**
   - Erstelle/Update Swimm-Doc

## D - Definition of Done
- [ ] TypeScript kompiliert ohne Fehler
- [ ] ESLint zeigt keine Errors
- [ ] Design-Token-Konsistenz geprüft
- [ ] Keine verbotenen Begriffe
- [ ] Pre-Commit Gate bestanden

## O - Output
- Commit: `[type]([scope]): [beschreibung]`

**EXECUTE.**
```

---

## Beispiel-Verwendung

### Beispiel 1: Neues Feature

```
@project_specs.md

Agiere als autonomer Fullstack Developer im NEO-GENESIS Stack.

Task: Implementiere "Rechnungs-Export als PDF" Feature

**Protokoll:**
1. Context Fetch: Prüfe bestehende Rechnungs-Komponenten
2. Planung: Aktualisiere Architektur-Diagramm falls nötig
3. Code: Nutze Trigger.dev Job für PDF-Generierung
4. Background: Erstelle `trigger/jobs/pdf-generation.ts` Job
5. Self-Correction: Tests und Validierung
6. Documentation: Swimm-Doc für PDF-Export-Feature

Start.
```

### Beispiel 2: Bugfix

```
@project_specs.md

Agiere als autonomer Fullstack Developer im NEO-GENESIS Stack.

Task: Fixe "Design-Token-Verletzung in BookingDialog"

**Protokoll:**
1. Context Fetch: Prüfe BookingDialog und verwandte Komponenten
2. Planung: Keine Architektur-Änderung nötig
3. Code: Ersetze hardcoded Farben durch Design-Tokens
4. Background: Nicht nötig (schneller Fix)
5. Self-Correction: `npm run validate:design`
6. Documentation: Update Swimm-Doc falls nötig

Start.
```

---

## Wichtige Hinweise

- **Immer** Nexus Bridge für Context-Fetch nutzen (`loadProjectContext()`)
- **Immer** Architektur-Planung vor Code
- **Immer** Self-Healing bei Fehlern (`selfHealing.heal()`)
- **Immer** Quality Gates vor Commit (`Gates.preCommit()`)
- **Immer** Swimm-Doku parallel zur Implementierung
- **Nie** Commits ohne Tests und Validierung

---

## Code-Imports

```typescript
// Nexus Bridge
import { nexusBridge, loadProjectContext, validateBotOutput } from "@/lib/ai/bots/nexus-bridge-integration"

// Workflow-Orchestrierung
import { workflowOrchestrator, QuickWorkflows } from "@/lib/ai/workflow-orchestrator"

// Self-Healing
import { selfHealing } from "@/lib/ai/self-healing"

// Quality Gates
import { qualityGates, Gates } from "@/lib/ai/quality-gates"

// Monitoring
import { monitoring } from "@/lib/ai/monitoring"
```

---

## Quick-Start Workflows

```typescript
// QA-Workflow starten
await QuickWorkflows.qa()

// Feature implementieren
await QuickWorkflows.feature("Rechnungs-Export", "PDF-Export für Rechnungen")

// Bug beheben
await QuickWorkflows.bugfix("Login-Fehler bei Multi-Tenant")

// Optimierung
await QuickWorkflows.optimize()
```

