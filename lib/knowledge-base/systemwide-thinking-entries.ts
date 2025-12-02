/**
 * SYSTEMWEITES DENKEN & ARBEITSKONZEPT
 * =====================================
 * Zentrale Regel: Niemals nur Teilbereiche, immer systemweit denken und handeln
 * Strukturierte Arbeitsanweisungen für alle Bots
 */

import type { KnowledgeEntry } from "./structure"

export const SYSTEMWIDE_THINKING_RULE: KnowledgeEntry = {
  id: "systemwide-thinking-001",
  category: "best-practices",
  title: "Systemweites Denken - UNVERÄNDERLICH",
  content: `
# Systemweites Denken - UNVERÄNDERLICH

## GRUNDREGEL
**NIEMALS nur Teilbereiche bedenken - AUSNAHMSLOS SYSTEMWEIT!**

## BEISPIEL: UI-Library
Wenn von "Header, Footer, Logo, Navigation" gesprochen wird, sind damit **ALLE UI-Elemente** gemeint:
- Header, Footer, Logo, Navigation
- Buttons, Cards, Forms, Inputs
- Modals, Dialogs, Dropdowns
- Tables, Lists, Badges
- Icons, Images, Avatars
- **JEDES UI-ELEMENT SYSTEMWEIT**

## ANWENDUNG
Bei jeder Änderung, jedem Fix, jeder Optimierung:
1. **Systemweite Analyse**: Welche Bereiche sind betroffen?
2. **Systemweite Prüfung**: Gibt es Abhängigkeiten?
3. **Systemweite Umsetzung**: Alle betroffenen Bereiche berücksichtigen
4. **Systemweite Validierung**: Alle Bereiche prüfen

## VERBOTEN
- ❌ Nur einen Teilbereich bedenken
- ❌ Abhängigkeiten ignorieren
- ❌ Isolierte Lösungen
- ❌ Teilweise Umsetzung

## ERFORDERLICH
- ✅ Systemweite Analyse
- ✅ Systemweite Prüfung
- ✅ Systemweite Umsetzung
- ✅ Systemweite Validierung
- ✅ Systemweite Dokumentation

## BEISPIEL-SZENARIEN

### Szenario 1: UI-Komponente ändern
**FALSCH**: Nur die Komponente ändern
**RICHTIG**: 
- Komponente ändern
- Alle Verwendungen prüfen
- Dokumentation aktualisieren
- Tests aktualisieren
- Knowledge-Base aktualisieren

### Szenario 2: Text ändern
**FALSCH**: Nur den Text ändern
**RICHTIG**:
- Text ändern
- SEO-Meta-Tags prüfen
- Übersetzungen prüfen
- Accessibility prüfen
- Dokumentation aktualisieren

### Szenario 3: Feature hinzufügen
**FALSCH**: Nur Feature implementieren
**RICHTIG**:
- Feature implementieren
- UI-Konsistenz prüfen
- Dokumentation aktualisieren
- Tests schreiben
- Knowledge-Base aktualisieren
- Customer-Onboarding aktualisieren
`,
  tags: ["systemwide", "thinking", "rule", "critical"],
  relatedEntries: ["ui-consistency-001", "bot-workflow-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const BOT_WORKFLOW_STRUCTURE: KnowledgeEntry = {
  id: "bot-workflow-001",
  category: "ci-cd",
  title: "Strukturiertes Bot-Arbeitskonzept",
  content: `
# Strukturiertes Bot-Arbeitskonzept

## ALLGEMEINE STRUKTUR FÜR ALLE BOTS

### Phase 1: VORBEREITUNG (OBLIGATORISCH)
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

### Phase 2: AUSFÜHRUNG (STRUKTURIERT)
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

### Phase 3: VALIDIERUNG (OBLIGATORISCH)
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

### Phase 4: NOTFALL & SONDERFÄLLE
1. **Notfall-Erkennung** (OBLIGATORISCH)
   - Kritische Fehler erkennen
   - Systemweite Auswirkungen prüfen
   - Sofortmaßnahmen einleiten

2. **Sonderfall-Behandlung** (OBLIGATORISCH)
   - Sonderfälle erkennen
   - Master-Bot konsultieren
   - Dokumentierte Lösung anwenden

## VERBOTEN
- ❌ Phase überspringen
- ❌ Obligatorische Schritte umgehen
- ❌ Systemweite Prüfung ignorieren
- ❌ Dokumentation vergessen

## ERFORDERLICH
- ✅ Alle Phasen durchführen
- ✅ Alle obligatorischen Schritte
- ✅ Systemweite Prüfung
- ✅ Vollständige Dokumentation
`,
  tags: ["bot", "workflow", "structure", "critical"],
  relatedEntries: ["systemwide-thinking-001", "bot-instructions-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const EMERGENCY_AND_SPECIAL_CASES: KnowledgeEntry = {
  id: "emergency-special-cases-001",
  category: "error-handling",
  title: "Notfall-Lösungen & Sonderfälle",
  content: `
# Notfall-Lösungen & Sonderfälle

## NOTFALL-ERKENNUNG

### Kritische Fehler (Sofortmaßnahmen erforderlich)
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

### Hoch-Priorität Fehler (Schnelle Maßnahmen)
1. **Funktionalitäts-Ausfall**
   - Schnell: Fehler analysieren
   - Fix entwickeln
   - Systemweite Prüfung

2. **Performance-Probleme**
   - Schnell: Bottleneck identifizieren
   - Optimierung durchführen
   - Monitoring aktivieren

## SONDERFÄLLE

### Sonderfall 1: Vorgabe widerspricht Best Practice
**Verhalten**:
1. Widerspruch dokumentieren
2. Master-Bot konsultieren
3. Change-Request erstellen
4. Auf Entscheidung warten
5. **NIEMALS eigenmächtig ändern**

### Sonderfall 2: Unklare Vorgabe
**Verhalten**:
1. Unklarheit dokumentieren
2. Master-Bot konsultieren
3. Klärung anfordern
4. Auf Klärung warten
5. **NIEMALS raten oder annehmen**

### Sonderfall 3: Fehlende Information
**Verhalten**:
1. Fehlende Information dokumentieren
2. Knowledge-Base prüfen
3. Master-Bot konsultieren
4. Information anfordern
5. **NIEMALS ohne Information handeln**

### Sonderfall 4: Konflikt zwischen Bots
**Verhalten**:
1. Konflikt dokumentieren
2. Master-Bot konsultieren
3. Entscheidung abwarten
4. **NIEMALS eigenmächtig entscheiden**

## NOTFALL-PROTOKOLL

### Schritt 1: Erkennung
- Fehler-Typ identifizieren
- Schweregrad bestimmen
- Systemweite Auswirkungen prüfen

### Schritt 2: Benachrichtigung
- Master-Bot benachrichtigen
- Fehler-Log erstellen
- Dokumentation starten

### Schritt 3: Maßnahmen
- Sofortmaßnahmen einleiten
- Systemweite Prüfung
- Fix entwickeln

### Schritt 4: Validierung
- Fix validieren
- Systemweite Prüfung
- Dokumentation abschließen

## VERBOTEN
- ❌ Eigenmächtige Entscheidungen bei Sonderfällen
- ❌ Notfall-Protokoll umgehen
- ❌ Master-Bot nicht konsultieren

## ERFORDERLICH
- ✅ Notfall-Protokoll befolgen
- ✅ Master-Bot konsultieren
- ✅ Vollständige Dokumentation
`,
  tags: ["emergency", "special-cases", "error-handling", "critical"],
  relatedEntries: ["systemwide-thinking-001", "bot-workflow-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

