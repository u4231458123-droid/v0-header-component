# TASK: Feature Implementierung

**Template für neue Features im NEO-GENESIS Stack**

---

## C - Context

```
@project_specs.md @types/supabase.ts

**MCP Live-Kontext (automatisch laden):**
- `project://ui/tokens` - Design-Tokens
- `project://db/schema` - Datenbank-Schema
- `project://app/routes` - App-Routen

**Betroffene Bereiche:**
- [ ] Frontend (UI/Components)
- [ ] Backend (API/Server-Actions)
- [ ] Datenbank (Schema/Migrations)
- [ ] Tests (Unit/E2E)
```

---

## R - Role

```
Agiere als autonomer Full-Stack Developer im NEO-GENESIS Hyper-Stack.

Du vereinst:
- **Architekt**: Systemdesign, skalierbare Lösungen
- **Designer**: UI/UX Excellence, Design-Token-Compliance
- **Developer**: Clean Code, TypeScript strict mode
```

---

## E - Execution

```
**Protokoll für Feature-Implementierung:**

1. **Context Fetch (Nexus Bridge):**
   - Lade `loadProjectContext()`
   - Prüfe bestehende Patterns in verwandten Komponenten
   - Identifiziere wiederverwendbare Abstraktionen

2. **Architecture Check:**
   - Muss das Datenmodell erweitert werden?
   - Falls ja: Erstelle Migration in `scripts/` ZUERST
   - Aktualisiere Diagramm in `docs/diagrams/` falls nötig

3. **Implementation:**
   - Erstelle Route in `/app/[route]/` (Next.js App Router)
   - Implementiere UI mit Shadcn + Tailwind (STRICT Token usage)
   - Nutze Server Components als Default
   - Client Components nur wenn interaktiv ("use client")

4. **Background Jobs (falls nötig):**
   - Tasks >10s → Trigger.dev Job in `trigger/jobs/`
   - Nutze Vercel AI SDK für AI-Logik

5. **Self-Correction:**
   - `pnpm run lint` + `pnpm run type-check`
   - `pnpm run validate:design`
   - Bei Fehlern: `selfHealing.heal(errorType, details)`

6. **Quality Gates:**
   - `Gates.preCommit()` muss bestehen
   - Unit-Tests für neue Logik schreiben

7. **Documentation:**
   - Swimm-Doc erstellen/aktualisieren
   - JSDoc für öffentliche Funktionen
```

---

## D - Definition of Done

```
- [ ] Feature funktioniert wie spezifiziert
- [ ] TypeScript kompiliert ohne Fehler (strict mode)
- [ ] ESLint zeigt keine Errors
- [ ] Design-Tokens verwendet (keine hardcoded Farben)
- [ ] UI-Texte auf Deutsch (Sie-Form, DIN 5008)
- [ ] Keine verbotenen Begriffe
- [ ] Unit-Tests geschrieben
- [ ] Swimm-Dokumentation aktualisiert
- [ ] Pre-Commit Gate bestanden
- [ ] Responsive Design (Mobile-First)
- [ ] Loading States implementiert
- [ ] Error Handling vorhanden
```

---

## O - Output

```
**Erwartete Ausgabe:**

1. Alle geänderten/neuen Dateien
2. Migration (falls DB-Änderung)
3. Test-Ergebnisse
4. Commit-Message: "feat([scope]): [beschreibung]"
```

---

## User Input

**Feature Name:** [HIER FEATURE-NAME EINFÜGEN]

**Beschreibung:** [HIER BESCHREIBUNG EINFÜGEN]

**Zusätzliche Anforderungen:** [OPTIONAL]

---

**EXECUTE.**

