# MyDispatch - NEO-GENESIS AI-Agent Steuerung

**Zentrale Cursor-Steuerung für alle AI-Agenten und Workflows**

---

## Verfügbare Kommandos

### `/mydispatch workflow <name>`
Starte einen definierten Workflow.

**Verfügbare Workflows:**
- `qa` - QA & Bugfixing Workflow
- `feature <name>` - Neues Feature implementieren
- `bugfix <description>` - Bug beheben
- `optimize` - Performance-Optimierung

### `/mydispatch gate <name>`
Führe Quality Gate aus.

**Verfügbare Gates:**
- `pre-commit` - Vor Commit (lint, type-check, forbidden-terms)
- `pre-push` - Vor Push (+ unit-tests, compliance)
- `pre-deploy` - Vor Deployment (+ e2e, build, security)
- `post-deploy` - Nach Deployment (health, smoke-tests)

### `/mydispatch heal <type>`
Aktiviere Self-Healing für Fehlertyp.

**Heilbare Fehlertypen:**
- `dependency` - NPM/PNPM Dependency-Probleme
- `test-failure` - Fehlgeschlagene Tests
- `build-error` - Build-Fehler
- `lint-error` - Lint-Fehler
- `type-error` - TypeScript-Fehler

### `/mydispatch context`
Lade vollständigen Projekt-Kontext von Nexus Bridge.

**Gibt zurück:**
- UI Design-Tokens
- DB Schema
- App-Routen
- Aktive Dokumentation

### `/mydispatch status`
Zeige aktuellen Status aller Systeme.

---

## Beispiele

### QA-Workflow starten
```
/mydispatch workflow qa
```

### Neues Feature implementieren
```
/mydispatch workflow feature Rechnungs-Export
```

### Pre-Commit Gate prüfen
```
/mydispatch gate pre-commit
```

### Build-Fehler selbst heilen
```
/mydispatch heal build-error
```

---

## Workflow-Phasen

Jeder Workflow durchläuft automatisch diese Phasen:

1. **Context-Fetch** - Nexus Bridge lädt Projekt-Kontext
2. **Planning** - Architektur-Prüfung und Task-Verteilung
3. **Implementation** - Bots führen Tasks aus
4. **Validation** - Quality Gates prüfen Ergebnisse
5. **Documentation** - Swimm-Dokumentation aktualisieren
6. **Commit/Push** - Git-Workflow ausführen

---

## AI-Agent-Hierarchie

```
CURSOR (Du bist hier)
         |
         v
┌─────────────────┐
│   MASTER-BOT    │ → Orchestrierung & Überwachung
└────────┬────────┘
         |
    ┌────┴────┬─────────┐
    v         v         v
┌────────┐ ┌────────┐ ┌────────┐
│QUALITY │ │SYSTEM  │ │  DOC   │
│  BOT   │ │  BOT   │ │  BOT   │
└────────┘ └────────┘ └────────┘
```

---

## Wichtige Hinweise

1. **Zero User-Intervention**: Alle Tasks laufen autonom
2. **Self-Healing**: Fehler werden automatisch behoben
3. **Quality First**: Kein Deployment ohne bestandene Gates
4. **Context-Aware**: Nexus Bridge liefert Live-Kontext
5. **Fully Documented**: Automatische Swimm-Dokumentation
