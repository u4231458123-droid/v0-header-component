# TASK: QA-Workflow (Qualitätsprüfung)

**Template für vollständige Qualitätsprüfung**

---

## C - Context

```
@project_specs.md @DESIGN_GUIDELINES.md

**MCP Live-Kontext (automatisch laden):**
- `project://ui/tokens` - Design-Tokens
- `project://db/schema` - Datenbank-Schema
- `project://app/routes` - Alle Routen
- `project://docs/active` - Aktive Dokumentation

**Prüfbereich:**
- [ ] Gesamtes Projekt
- [ ] Spezifischer Bereich: [BEREICH]
- [ ] Letzte Änderungen (seit letztem Commit)
```

---

## R - Role

```
Agiere als QA-Lead und Code-Reviewer im NEO-GENESIS Stack.

Deine Verantwortung:
- **Code Quality**: TypeScript, ESLint, Best Practices
- **Design Compliance**: Design-Token-Konsistenz
- **Security**: Keine Schwachstellen, RLS-Policies
- **Performance**: Bundle-Size, Query-Optimierung
- **Documentation**: Vollständigkeit, Aktualität
```

---

## E - Execution

```
**QA-Workflow Protokoll:**

1. **Context Fetch:**
   - Lade vollständigen Projekt-Kontext
   - Identifiziere kürzlich geänderte Dateien
   - Lade alle aktiven Regeln und Vorgaben

2. **Code Quality Check:**
   - `pnpm run lint` - ESLint Prüfung
   - `pnpm run type-check` - TypeScript Prüfung
   - Prüfe auf Code-Smells (Duplikation, Komplexität)

3. **Design Compliance:**
   - `pnpm run validate:design` - Design-Token-Prüfung
   - Prüfe Rundungen: Cards=rounded-2xl, Buttons=rounded-xl
   - Prüfe Spacing: Standard gap-5
   - Keine hardcoded Farben

4. **Security Check:**
   - `pnpm audit` - Dependency-Vulnerabilities
   - RLS-Policies für alle Tabellen vorhanden?
   - Keine Master-Admin-Policies (DSGVO)
   - Input-Validierung (Zod) vorhanden?

5. **Test Coverage:**
   - `pnpm run test:coverage` - Coverage Report
   - Kritische Pfade getestet?
   - E2E-Tests für User-Journeys?

6. **Documentation Check:**
   - Swimm-Docs aktuell?
   - JSDoc für öffentliche APIs?
   - README für Module?

7. **Performance Check:**
   - Bundle-Size unter 500KB?
   - Keine N+1 Queries?
   - Images optimiert?

8. **Forbidden Terms:**
   - Keine verbotenen Begriffe (kostenlos, gratis, testen, etc.)
   - UI-Texte auf Deutsch (Sie-Form)

9. **Report erstellen:**
   - Alle Findings dokumentieren
   - Priorität zuweisen (Critical/High/Medium/Low)
   - Lösungsvorschläge
```

---

## D - Definition of Done

```
- [ ] Alle Checks durchgeführt
- [ ] Keine Critical/High Issues offen
- [ ] Medium Issues dokumentiert
- [ ] Low Issues als Technical Debt erfasst
- [ ] Report erstellt
- [ ] Empfehlungen formuliert
```

---

## O - Output

```
**QA-Report Format:**

# QA-Report [Datum]

## Summary
- ✅ Passed: [Anzahl]
- ⚠️ Warnings: [Anzahl]
- ❌ Failed: [Anzahl]

## Critical Issues
1. [Issue] - [Datei] - [Lösung]

## High Issues
1. [Issue] - [Datei] - [Lösung]

## Medium Issues
1. [Issue] - [Datei] - [Lösung]

## Recommendations
1. [Empfehlung]

## Next Steps
1. [Action Item]
```

---

## User Input

**Prüfbereich:** [GESAMTPROJEKT / SPEZIFISCHER BEREICH]

**Fokus:** [OPTIONAL - z.B. nur Security, nur Design]

---

**EXECUTE.**

