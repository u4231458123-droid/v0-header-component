# Vollständiges Bot-Workflow-System

## Übersicht

Dieses Dokument beschreibt das vollständige, strukturierte Arbeitskonzept für alle Bots im MyDispatch-System. Jeder Bot hat detaillierte Arbeitsanweisungen, die niemals umgangen, übergangen oder ignoriert werden dürfen.

## 1. Systemweites Denken - Zentrale Regel

### Grundregel
**NIEMALS nur Teilbereiche bedenken - AUSNAHMSLOS SYSTEMWEIT!**

### Beispiel: UI-Library
Wenn von "Header, Footer, Logo, Navigation" gesprochen wird, sind damit **ALLE UI-Elemente** gemeint:
- Header, Footer, Logo, Navigation
- Buttons, Cards, Forms, Inputs
- Modals, Dialogs, Dropdowns
- Tables, Lists, Badges
- Icons, Images, Avatars
- **JEDES UI-ELEMENT SYSTEMWEIT**

### Anwendung
Bei jeder Änderung, jedem Fix, jeder Optimierung:
1. **Systemweite Analyse**: Welche Bereiche sind betroffen?
2. **Systemweite Prüfung**: Gibt es Abhängigkeiten?
3. **Systemweite Umsetzung**: Alle betroffenen Bereiche berücksichtigen
4. **Systemweite Validierung**: Alle Bereiche prüfen

## 2. Strukturiertes Bot-Arbeitskonzept

### Allgemeine Struktur für alle Bots

#### Phase 1: VORBEREITUNG (OBLIGATORISCH)
1. **Knowledge-Base laden** (OBLIGATORISCH)
   - Alle relevanten Kategorien laden
   - Systemweites Denken aktivieren
   - Vorgaben verstehen

2. **IST-Analyse durchführen** (OBLIGATORISCH)
   - Aktuellen Zustand analysieren
   - Abhängigkeiten identifizieren
   - Systemweite Auswirkungen prüfen

3. **Kontext sammeln** (OBLIGATORISCH)
   - Codebase-Analyse
   - Fehler-Logs prüfen
   - Dokumentation prüfen

#### Phase 2: AUSFÜHRUNG (STRUKTURIERT)
1. **Task verstehen** (OBLIGATORISCH)
   - Task vollständig verstehen
   - Systemweite Auswirkungen prüfen
   - Abhängigkeiten identifizieren

2. **Lösung entwickeln** (STRUKTURIERT)
   - Systemweite Lösung entwickeln
   - Alle betroffenen Bereiche berücksichtigen
   - Notfall-Lösungen prüfen

3. **Umsetzung** (STRUKTURIERT)
   - Schrittweise Umsetzung
   - Jeden Schritt validieren
   - Systemweite Konsistenz prüfen

#### Phase 3: VALIDIERUNG (OBLIGATORISCH)
1. **Selbst-Validierung** (OBLIGATORISCH)
   - Eigene Arbeit prüfen
   - Vorgaben prüfen
   - Systemweite Auswirkungen prüfen

2. **Quality-Bot-Validierung** (OBLIGATORISCH)
   - Quality-Bot prüfen lassen
   - Fehler beheben
   - Erneut validieren

3. **Dokumentation** (OBLIGATORISCH)
   - Änderungen dokumentieren
   - Knowledge-Base aktualisieren
   - Fehler-Logs aktualisieren

#### Phase 4: NOTFALL & SONDERFÄLLE
1. **Notfall-Erkennung** (OBLIGATORISCH)
   - Kritische Fehler erkennen
   - Systemweite Auswirkungen prüfen
   - Sofortmaßnahmen einleiten

2. **Sonderfall-Behandlung** (OBLIGATORISCH)
   - Sonderfälle erkennen
   - Master-Bot konsultieren
   - Dokumentierte Lösung anwenden

## 3. Bot-spezifische Arbeitsanweisungen

### 3.1 System-Bot

#### Identität
- Code-Analyse
- Bug-Fixing
- Code-Optimierung
- Systemweite Wartung

#### Obligatorische Schritte
1. **Knowledge-Base laden** (OBLIGATORISCH)
   - Alle relevanten Kategorien
   - Systemweites Denken aktivieren

2. **IST-Analyse durchführen** (OBLIGATORISCH)
   - Aktuellen Zustand analysieren
   - Systemweite Auswirkungen prüfen

3. **Code analysieren** (STRUKTURIERT)
   - Code vollständig lesen
   - Gegen Knowledge-Base prüfen
   - Fehler identifizieren und priorisieren

4. **Lösung entwickeln** (STRUKTURIERT)
   - Systemweite Lösung entwickeln
   - Alle betroffenen Bereiche berücksichtigen

5. **Validierung** (OBLIGATORISCH)
   - Selbst-Validierung
   - Quality-Bot-Validierung
   - Dokumentation

#### Detaillierte Anweisungen
Siehe: `lib/knowledge-base/bot-instructions/system-bot-instructions.ts`

### 3.2 Quality-Bot

#### Identität
- Code-Qualitätssicherung
- Validierung gegen Dokumentation
- Validierung gegen Knowledge-Base
- Cross-Verification

#### Obligatorische Schritte
1. **Knowledge-Base laden** (OBLIGATORISCH)
   - Alle relevanten Kategorien
   - Systemweites Denken aktivieren

2. **Code gegen Dokumentation prüfen** (STRUKTURIERT)
   - Code vollständig verstehen
   - Gegen Dokumentation prüfen
   - Abweichungen dokumentieren

3. **Code gegen Knowledge-Base prüfen** (STRUKTURIERT)
   - Design-Guidelines prüfen
   - Coding-Rules prüfen
   - UI-Konsistenz prüfen
   - Text-Qualität prüfen

4. **Validierungs-Bericht erstellen** (OBLIGATORISCH)
   - Alle Verstöße auflisten
   - Systemweite Auswirkungen dokumentieren
   - Priorisieren

#### Detaillierte Anweisungen
Siehe: `lib/knowledge-base/bot-instructions/quality-bot-instructions.ts`

### 3.3 Master-Bot

#### Identität
- Systemweite Verantwortung
- Change-Request-Review
- Vorgaben-Korrektur
- Systemweite Änderungen
- Chat-Interface für User

#### Obligatorische Schritte
1. **Knowledge-Base laden** (OBLIGATORISCH)
   - ALLE Kategorien (vollständige Knowledge-Base)
   - Systemweites Denken aktivieren

2. **Change-Request-Review** (STRUKTURIERT)
   - Request vollständig verstehen
   - Systemweite Auswirkungen prüfen
   - Entscheidung treffen

3. **Systemweite Änderungen** (STRUKTURIERT)
   - Änderung planen
   - Systemweite Auswirkungen analysieren
   - Änderung umsetzen
   - Dokumentation

4. **Chat-Interface** (STRUKTURIERT)
   - User-Request verstehen
   - Antwort entwickeln
   - Antwort validieren

#### Detaillierte Anweisungen
Siehe: `lib/knowledge-base/bot-instructions/master-bot-instructions.ts`

## 4. Notfall-Lösungen & Sonderfälle

### 4.1 Notfall-Erkennung

#### Kritische Fehler (Sofortmaßnahmen erforderlich)
1. **System-Crash**
   - Sofort: Master-Bot benachrichtigen
   - Rollback einleiten
   - Fehler dokumentieren

2. **Datenverlust**
   - Sofort: Backup prüfen
   - Master-Bot benachrichtigen
   - Datenwiederherstellung einleiten

3. **Sicherheitslücke**
   - Sofort: Master-Bot benachrichtigen
   - Lücke schließen
   - Security-Audit durchführen

### 4.2 Sonderfälle

#### Sonderfall 1: Vorgabe widerspricht Best Practice
**Verhalten**:
1. Widerspruch dokumentieren
2. Master-Bot konsultieren
3. Change-Request erstellen
4. Auf Entscheidung warten
5. **NIEMALS eigenmächtig ändern**

#### Sonderfall 2: Unklare Vorgabe
**Verhalten**:
1. Unklarheit dokumentieren
2. Master-Bot konsultieren
3. Klärung anfordern
4. Auf Klärung warten
5. **NIEMALS raten oder annehmen**

#### Sonderfall 3: Fehlende Information
**Verhalten**:
1. Fehlende Information dokumentieren
2. Knowledge-Base prüfen
3. Master-Bot konsultieren
4. Information anfordern
5. **NIEMALS ohne Information handeln**

## 5. Validierung & Testing

### 5.1 Bot-Verständnis-Test
Ein Test-Script (`scripts/cicd/test-bot-comprehension.mjs`) prüft jeden Bot:
- Knowledge-Base-Laden
- Systemweites Denken verstehen
- Arbeitsanweisungen verstehen
- Funktionalität testen

### 5.2 Ausführung
\`\`\`bash
pnpm cicd:test-bots
\`\`\`

## 6. Wichtige Regeln

### Verboten
- ❌ Obligatorische Schritte überspringen
- ❌ Systemweite Prüfung ignorieren
- ❌ Dokumentation vergessen
- ❌ Eigenmächtige Entscheidungen bei Sonderfällen
- ❌ Master-Bot nicht konsultieren
- ❌ Phasen umgehen

### Erforderlich
- ✅ Alle obligatorischen Schritte
- ✅ Systemweite Prüfung
- ✅ Vollständige Dokumentation
- ✅ Master-Bot konsultieren bei Sonderfällen
- ✅ Notfall-Protokoll befolgen
- ✅ Strukturiertes Arbeitskonzept befolgen

## 7. Knowledge-Base-Entries

Die folgenden Knowledge-Base-Entries wurden erstellt:
- `systemwide-thinking-001`: Systemweites Denken - Zentrale Regel
- `bot-workflow-001`: Strukturiertes Bot-Arbeitskonzept
- `emergency-special-cases-001`: Notfall-Lösungen & Sonderfälle
- `system-bot-instructions-001`: System-Bot: Detaillierte Arbeitsanweisungen
- `quality-bot-instructions-001`: Quality-Bot: Detaillierte Arbeitsanweisungen
- `master-bot-instructions-001`: Master-Bot: Detaillierte Arbeitsanweisungen

Diese Einträge sind in allen Bots verfügbar und werden automatisch bei jeder Aufgabe berücksichtigt.

## 8. Integration

### 8.1 Knowledge-Base-Integration
Alle Bot-Instruktionen sind in der Knowledge-Base verfügbar und werden automatisch geladen.

### 8.2 Prompt-Integration
Alle Prompt-Templates enthalten Verweise auf:
- Systemweites Denken
- Bot-Arbeitskonzept
- Notfall-Lösungen

### 8.3 Bot-Integration
Alle Bots laden automatisch:
- Systemweites Denken
- Bot-Arbeitskonzept
- Ihre spezifischen Arbeitsanweisungen

## 9. Nächste Schritte

1. **Bot-Testing durchführen**: `pnpm cicd:test-bots`
2. **Feintuning**: Basierend auf Test-Ergebnissen
3. **Dokumentation aktualisieren**: Bei Bedarf
4. **Knowledge-Base erweitern**: Bei neuen Anforderungen

## 10. Zusammenfassung

Das vollständige Bot-Workflow-System stellt sicher, dass:
- Alle Bots systemweit denken und handeln
- Alle Bots strukturiert arbeiten
- Alle Bots obligatorische Schritte befolgen
- Alle Bots Notfall-Lösungen kennen
- Alle Bots Sonderfälle korrekt behandeln
- Alle Bots vollständig dokumentieren

Dies gewährleistet einen fehlerfreien, professionellen Betrieb des MyDispatch-Systems.

