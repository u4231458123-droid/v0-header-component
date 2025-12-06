# /orchestrate - Workflow-Orchestrierung

**Starte und steuere autonome AI-Agent-Workflows**

---

## Basis-Syntax

```
/orchestrate <action> [options]
```

---

## Actions

### `start` - Starte neuen Workflow

```
/orchestrate start <workflow-type> [name] [description]
```

**Workflow-Typen:**
- `qa` - Qualitätsprüfung und Bugfixing
- `feature` - Neues Feature implementieren
- `bugfix` - Bug analysieren und beheben
- `optimize` - Performance-Optimierung
- `refactor` - Code-Refactoring
- `migrate` - Datenbank-Migration

**Beispiele:**
```
/orchestrate start qa
/orchestrate start feature "Rechnungs-Export" "Exportiere Rechnungen als PDF"
/orchestrate start bugfix "Login-Fehler bei Multi-Tenant"
/orchestrate start optimize
```

### `status` - Workflow-Status prüfen

```
/orchestrate status [workflow-id]
```

**Beispiele:**
```
/orchestrate status                    # Alle aktiven Workflows
/orchestrate status workflow-123       # Spezifischer Workflow
```

### `cancel` - Workflow abbrechen

```
/orchestrate cancel <workflow-id>
```

### `history` - Workflow-Historie

```
/orchestrate history [limit]
```

---

## Parallele Tracks

Workflows werden in 3 parallelen Tracks ausgeführt:

| Track | Name | Tasks |
|-------|------|-------|
| Track 1 | QA & Bugfixing | quality-check, bug, fix, test |
| Track 2 | Feature-Completion | feature, implement, add |
| Track 3 | Workflow-Optimization | optimize, refactor, improve |

---

## Workflow-Phasen

```
1. context-fetch   → Nexus Bridge Context laden
2. planning        → Tasks an Bots verteilen
3. implementation  → Bots führen Tasks aus
4. validation      → Quality Gates prüfen
5. documentation   → Swimm-Docs aktualisieren
6. commit-push     → Git-Workflow ausführen
```

---

## Events

Workflows emittieren Events, die abonniert werden können:

- `workflow:started` - Workflow gestartet
- `workflow:completed` - Workflow erfolgreich
- `workflow:failed` - Workflow fehlgeschlagen
- `workflow:cancelled` - Workflow abgebrochen
- `phase:started` - Phase gestartet
- `phase:completed` - Phase abgeschlossen
- `task:completed` - Task abgeschlossen
- `task:failed` - Task fehlgeschlagen
- `context:loaded` - Kontext geladen

---

## Automatische Validierung

Jeder Workflow validiert automatisch:

1. ✅ TypeScript-Typen korrekt
2. ✅ ESLint keine Errors
3. ✅ Design-Token-Konsistenz
4. ✅ Keine verbotenen Begriffe
5. ✅ Unit-Tests bestehen
6. ✅ Compliance mit project_specs.md

---

## Self-Healing Integration

Bei Fehlern aktiviert sich automatisch Self-Healing:

```
Fehler erkannt → Self-Healing → Retry → Erfolg/Abbruch
```

**Heilbare Fehler:**
- Dependency-Konflikte
- Build-Fehler
- Lint-Fehler
- Type-Fehler
- Test-Fehler (Flaky-Tests)

---

## Beispiel: Vollständiger Feature-Workflow

```
/orchestrate start feature "Mitarbeiter-Dashboard" "Dashboard für Mitarbeiter-Übersicht mit KPIs"
```

**Automatischer Ablauf:**

1. **Context-Fetch**
   - Lade UI-Tokens von Nexus Bridge
   - Lade DB-Schema
   - Lade bestehende Routen

2. **Planning**
   - Erstelle Architektur-Diagramm
   - Verteile Tasks:
     - Backend-Agent: API-Endpoints
     - Frontend-Agent: UI-Komponenten
     - Testing-Agent: Unit/E2E-Tests
     - Doc-Agent: Swimm-Dokumentation

3. **Implementation**
   - Parallele Track-Ausführung
   - Automatische Code-Generierung
   - Design-Token-Validierung

4. **Validation**
   - Pre-Commit Gate
   - Unit-Tests
   - Compliance-Check

5. **Documentation**
   - Swimm-Doc erstellen
   - Code-Snippets verknüpfen

6. **Commit/Push**
   - Strukturierte Commit-Message
   - Push zu Feature-Branch
   - PR erstellen

---

## Tipps

1. **Starte mit QA**: Führe regelmäßig `/orchestrate start qa` aus
2. **Feature-Namen**: Verwende kurze, beschreibende Namen
3. **Bugfix-Beschreibung**: Je genauer, desto besser die Analyse
4. **Monitoring**: Prüfe Status mit `/orchestrate status`

