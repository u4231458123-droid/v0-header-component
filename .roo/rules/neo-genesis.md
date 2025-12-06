# NEO-GENESIS: Autonomous AI-Agent Hyper-Stack Rules

**Version:** 3.0 (Integrated Hyper-Stack)
**Standard:** DIN/ISO-Compliant & AI-Native
**Philosophie:** "Architecture as Code, Documentation as Truth, Quality as Default"

---

## 📜 Präambel: Die autonome Doktrin

Dieses Dokument definiert das Betriebssystem für die Softwareentwicklung der nächsten Generation. Es ersetzt den klassischen "Developer-Loop" durch eine orchestrierte Kette spezialisierter KI-Agenten und Tools.

**Grundregeln für den ausführenden Agenten (Roo Code / Cursor):**

1. **Denk-Primat:** Bevor Code entsteht, muss die Architektur (Eraser.io) und das Schema (Supabase/Keel) stehen.
2. **Holistisches Verständnis:** Nutze MCP-Server (GitHub, Filesystem, Memory), um den Kontext des *gesamten* Repos zu verstehen, nicht nur der offenen Datei.
3. **Self-Healing:** Warte nicht auf QA. Nutze Octomind und CodeRabbit Feedback, um Fehler sofort zu beheben.
4. **Living Documentation:** Code ohne Swimm-Dokumentation ist ungültig.

---

## ⚙️ Workflow-Phasen (Der Loop)

Dieser Prozess ist strikt einzuhalten.

### Phase 1: Planung & Visualisierung (Eraser.io)

Bevor eine Zeile Code geschrieben wird:

1. Erstelle/Update das ER-Diagramm oder Flowchart in **Eraser.io** (in `docs/diagrams/`).
2. Definiere die Business-Logik in `project_specs.md`.
3. Prüfe bestehende Architektur-Dokumentation.

### Phase 2: Implementierung (Roo Code + Supabase)

Der Agent (Roo Code) übernimmt:

1. **Backend:** Nutze Supabase MCP für Schema-Änderungen und API-Generierung.
2. **Frontend:** Nutze das **Vercel AI SDK**, um intelligente UIs zu bauen.
3. **Background:** Lagert komplexe Aufgaben (z.B. "Generiere Report") in **Trigger.dev** Jobs aus.
4. **Kontext-Check:** Nutze Filesystem/Memory MCP, um zu prüfen: "Verletzt mein neuer Code bestehende Patterns?"

### Phase 3: Dokumentation (Swimm)

Parallel zur Codierung:

1. Erstelle "Swimm Docs" für neue Features.
2. Verknüpfe kritische Code-Snippets.
3. Stelle sicher, dass der CI-Check von Swimm grün ist (Doku ist synchron).

### Phase 4: Validierung (CodeRabbit + Octomind + Enforcer)

Nach dem `git push`:

1. **CodeRabbit** kommentiert den PR innerhalb von Minuten.
2. **Octomind** startet eine Test-Suite gegen das Preview-Deployment (Vercel).
3. **The Enforcer** prüft gegen die `project_specs.md`: Wurden alle DIN-Normen/Sprachregeln eingehalten?
4. Agent (Roo Code) liest das Feedback und fixt Fehler autonom.

---

## 🛠️ Tool-Konsultations-Reihenfolge

### Vor jeder Code-Änderung:

1. **Context Fetch (MCP Filesystem/Memory):**
   - Analysiere welche Dateien betroffen sind
   - Prüfe Abhängigkeiten und bestehende Patterns
   - Identifiziere potenzielle Konflikte

2. **Architecture Check (Eraser.io):**
   - Falls sich das Datenmodell ändert, aktualisiere erst Diagramme
   - Prüfe Konsistenz mit bestehender Architektur

3. **Implementation (Roo Code):**
   - Implementiere die Logik
   - Nutze Vercel AI SDK für Streaming-Responses im Frontend
   - Nutze Trigger.dev für langlaufende Tasks (>10s)

4. **Self-Correction:**
   - Führe `npm run test` lokal aus
   - Prüfe TypeScript-Errors
   - Validiere Design-Tokens

5. **Documentation (Swimm):**
   - Erstelle/Update das Swimm-Doc für diesen Code
   - Verknüpfe kritische Code-Snippets

---

## 🛡️ Self-Healing-Protokoll

### Automatische Fehlerbehebung:

1. **Terminal-Fehler:**
   - Sofort stoppen
   - Root-Cause analysieren
   - Fix implementieren
   - Dokumentieren

2. **Build-Fehler:**
   - Blockieren alle weiteren Tasks
   - Dependency-Resolution versuchen
   - TypeScript-Errors beheben
   - Erneut bauen

3. **Test-Failures:**
   - Flaky-Test-Detection
   - Retry-Mechanismus (max 3 Versuche)
   - AI-powered Test-Fixing (falls möglich)
   - Bei persistierenden Fehlern: Team benachrichtigen

4. **Code Review Feedback (CodeRabbit):**
   - Kommentare automatisch lesen
   - Kritische Issues sofort fixen
   - PR aktualisieren

---

## 🔍 Greptile-Konsultation (Context Intelligence)

### Vor jeder Änderung:

1. **Frage stellen:**
   - "Welche Auswirkungen hat diese Änderung in `[Datei]` auf das Modul `[Modul]`?"
   - "Gibt es ähnliche Patterns im Codebase?"
   - "Welche Tests sind betroffen?"

2. **Abhängigkeiten prüfen:**
   - Import-Graph analysieren
   - Zirkuläre Abhängigkeiten vermeiden
   - Breaking Changes identifizieren

3. **Konsistenz sicherstellen:**
   - Design-Token-Verwendung
   - Namenskonventionen
   - Code-Stil

---

## 📋 Quality Gates

### Vor jedem Commit:

- [ ] TypeScript strict mode: Keine Errors
- [ ] ESLint: Keine Errors
- [ ] Design-Token-Konsistenz geprüft
- [ ] Tests: Alle grün
- [ ] Swimm-Doku: Aktualisiert
- [ ] Keine verbotenen Begriffe (kostenlos, gratis, testen, etc.)

### Vor jedem Merge:

- [ ] CodeRabbit: Approved
- [ ] Octomind: Keine kritischen UI-Fehler
- [ ] Enforcer: PASS
- [ ] Swimm: Code-Coverage > 80%

---

## 🚀 MCP-Server Nutzung

### Supabase MCP:
- Schema-Änderungen
- Migrationen
- RLS-Policies
- Edge Functions

### GitHub MCP:
- PR-Erstellung
- Issue-Tracking
- Branch-Management
- Code-Review-Automatisierung

### Filesystem MCP:
- Codebase-Analyse
- Abhängigkeits-Graph
- Pattern-Matching

### Memory MCP:
- Persistenter Kontext
- Session-Übergreifende Informationen
- Projekt-Historie

### Browser MCP:
- E2E-Test-Automatisierung
- UI-Verifikation
- Screenshot-Vergleich

### Hugging Face MCP:
- AI-Modell-Zugriff
- Text-Generierung
- Dokumentation-Erstellung

---

## 📝 Commit-Protokoll

Jede abgeschlossene Task endet ZWINGEND mit:

```bash
git add -A
git commit -m "feat|fix|refactor|docs|style: Beschreibung

- Detaillierte Liste der Änderungen
- Design-Konsistenz-Fixes
- Abhängigkeiten berücksichtigt"
git push origin main
```

---

## ⚠️ Wichtige Regeln

1. **NIEMALS** Code ohne vorherige Architektur-Planung schreiben
2. **IMMER** MCP-Server für Context-Fetch nutzen
3. **IMMER** Self-Healing bei Fehlern aktivieren
4. **IMMER** Swimm-Doku parallel zur Implementierung
5. **NIEMALS** Commits ohne Tests und Validierung

