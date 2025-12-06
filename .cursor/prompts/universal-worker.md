# Universal Worker Prompt

**NEO-GENESIS Hyper-Stack - Standard-Prompt für tägliche Aufgaben**

---

## Prompt-Template

```
@project_specs.md @schema.keel (oder Supabase Schema)

Agiere als autonomer Fullstack Developer im NEO-GENESIS Stack.

Task: [TASK BESCHREIBUNG]

**Protokoll:**

1. **Context Fetch (MCP Filesystem/Memory):**
   - Analysiere via MCP-Server, welche Dateien betroffen sind
   - Prüfe Abhängigkeiten und bestehende Patterns
   - Identifiziere potenzielle Konflikte

2. **Planung (Eraser.io):**
   - Falls sich das Datenmodell ändert, aktualisiere erst Diagramme in `docs/diagrams/`
   - Definiere Business-Logik in `project_specs.md` falls nötig

3. **Code (AI SDK):**
   - Implementiere die Logik
   - Nutze Vercel AI SDK für Streaming-Responses im Frontend
   - Nutze Trigger.dev für langlaufende Tasks (>10s)

4. **Background (Trigger.dev):**
   - Wenn der Task länger als 10s dauert, erstelle einen Trigger.dev Job dafür
   - Nutze `trigger/jobs/` für neue Background-Jobs

5. **Self-Correction:**
   - Führe `npm run test` lokal aus
   - Prüfe TypeScript-Errors: `npm run type-check`
   - Validiere Design-Tokens: `npm run validate:design`

6. **Documentation (Swimm):**
   - Erstelle/Update das Swimm-Doc für diesen Code
   - Verknüpfe kritische Code-Snippets

Start.
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

- **Immer** MCP-Server für Context-Fetch nutzen
- **Immer** Architektur-Planung vor Code
- **Immer** Self-Healing bei Fehlern
- **Immer** Swimm-Doku parallel zur Implementierung
- **Nie** Commits ohne Tests und Validierung

