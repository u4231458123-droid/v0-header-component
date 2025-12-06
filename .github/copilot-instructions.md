# GitHub Copilot Code Review Konfiguration

## Übersicht

Diese Datei enthält Anweisungen für GitHub Copilot Code Review, um konsistente und qualitativ hochwertige Code-Reviews durchzuführen.

## Code Review Prinzipien

### 1. Design-System-Konsistenz
- **Prüfe:** Werden Design-Tokens verwendet statt hardcoded Farben?
- **Prüfe:** Ist `gap-5` als Standard-Spacing verwendet?
- **Prüfe:** Werden `rounded-2xl` für Cards und `rounded-xl` für Buttons verwendet?
- **Prüfe:** Ist die Tonalität "Sie" (nicht "Du") durchgehend?

### 2. Verbotene Begriffe
**NIEMALS erlauben:**
- "kostenlos", "gratis", "free"
- "testen", "trial", "Probe"
- "billig", "günstig" (statt: "wirtschaftlich", "effizient")

### 3. TypeScript Best Practices
- **Prüfe:** Keine `any`-Types (außer in Ausnahmefällen mit Kommentar)
- **Prüfe:** Strikte Type-Checks aktiviert
- **Prüfe:** Alle Funktionen haben explizite Return-Types

### 4. Performance
- **Prüfe:** Werden große Komponenten mit `React.memo` optimiert?
- **Prüfe:** Werden `useMemo` und `useCallback` sinnvoll verwendet?
- **Prüfe:** Werden Lazy-Loading und Code-Splitting genutzt?

### 5. Sicherheit
- **Prüfe:** Keine SQL-Injection-Risiken
- **Prüfe:** Keine XSS-Risiken
- **Prüfe:** Sensitive Daten werden nicht in Logs ausgegeben
- **Prüfe:** API-Keys werden nicht hardcoded

### 6. Accessibility
- **Prüfe:** Alle interaktiven Elemente haben ARIA-Labels
- **Prüfe:** Keyboard-Navigation ist möglich
- **Prüfe:** Farbkontraste erfüllen WCAG AA

### 7. Error Handling
- **Prüfe:** Alle async-Funktionen haben Try-Catch
- **Prüfe:** Fehler werden dem User verständlich angezeigt
- **Prüfe:** Fehler werden geloggt (aber keine sensitive Daten)

### 8. Testing
- **Prüfe:** Neue Features haben Tests
- **Prüfe:** Kritische Funktionen haben E2E-Tests
- **Prüfe:** Tests sind nicht flaky

## Review-Kommentare Format

### Positive Reviews
```
✅ Gut gemacht! Die Implementierung folgt den Best Practices.
```

### Verbesserungsvorschläge
```
💡 Vorschlag: Verwende `bg-primary` statt `bg-slate-800` für Konsistenz.
```

### Kritische Probleme
```
❌ Kritisch: Diese Funktion hat keine Error-Behandlung. Bitte hinzufügen.
```

## Automatische Code Review Aktivierung

### Branch Protection Rules
- ✅ **Aktiviert:** "Automatically request Copilot code review"
- **Grund:** Zusätzliche AI-gestützte Code-Qualitätsprüfung

### Workflow-Integration
GitHub Copilot Code Review wird automatisch bei Pull Requests ausgelöst.

## Konfiguration

### Repository-Einstellungen
1. Gehe zu: `Settings → Code security and analysis`
2. Aktiviere: "GitHub Copilot Code Review"
3. Konfiguriere: Review-Regeln (siehe oben)

### Pull Request Template
Füge folgende Checkliste zu PR-Templates hinzu:
- [ ] Design-Tokens verwendet
- [ ] Keine verbotenen Begriffe
- [ ] TypeScript ohne Fehler
- [ ] Tests vorhanden
- [ ] Accessibility geprüft
- [ ] Performance optimiert

## Referenzen

- [GitHub Copilot Code Review](https://docs.github.com/en/copilot/github-copilot-code-review/about-github-copilot-code-review)
- [Design Guidelines](../docs/DESIGN_GUIDELINES.md)
- [Coding Standards](../docs/CODING_STANDARDS.md)
