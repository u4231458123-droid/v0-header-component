/**
 * UI-KONSISTENZ DETAILLIERT
 * =========================
 * Exakte Platzierung, Konsistenz bis ins kleinste Detail
 * Visuelle & logische Prüfung aus Nutzersicht
 */

import type { KnowledgeEntry } from "./structure"

export const UI_CONSISTENCY_DETAILED: KnowledgeEntry = {
  id: "ui-consistency-detailed-001",
  category: "design-guidelines",
  title: "UI-Konsistenz Detailliert - Exakte Platzierung",
  content: `
# UI-Konsistenz Detailliert - Exakte Platzierung

## GRUNDPRINZIP: EXAKTE KONSISTENZ
Jedes UI-Element muss an **EXAKT DER GLEICHEN STELLE** auf allen Seiten sein.

## BUTTONS

### Dashboard-Seiten
- **Platzierung**: IMMER an exakt der gleichen Stelle
- **Abstände**: IMMER identisch
- **Größe**: IMMER identisch
- **Farbe**: IMMER identisch
- **Text**: Konsistente Formulierungen

### Beispiel-Regel:
- Primär-Button: Oben rechts, 16px vom Rand, 44px Höhe
- Sekundär-Button: Rechts daneben, 8px Abstand
- **Diese Regel gilt für ALLE Dashboard-Seiten**

## HILFE-TEXTE

### Hilfe-Pages
- **Platzierung**: IMMER an exakt der gleichen Stelle
- **Format**: IMMER identisch
- **Struktur**: IMMER identisch
- **Navigation**: IMMER identisch

### Beispiel-Regel:
- Hilfe-Button: Oben rechts, neben User-Menü
- Hilfe-Text: Links, 24px vom Rand, 16px Schriftgröße
- **Diese Regel gilt für ALLE Hilfe-Pages**

## TEXT-AUSRICHTUNGEN

### Konsistenz
- **Linksbündig**: Standard für Fließtext
- **Zentriert**: Nur für Überschriften
- **Rechtsbündig**: Nur für Zahlen, Preise
- **Textumbrüche**: IMMER identisch

### Beispiel-Regel:
- Überschriften: Zentriert, 24px Schriftgröße, 32px Abstand oben
- Fließtext: Linksbündig, 16px Schriftgröße, 24px Zeilenabstand
- **Diese Regel gilt für ALLE Seiten**

## FARBABSTIMMUNGEN

### Konsistenz
- **Primärfarbe**: IMMER identisch (#323D5E)
- **Sekundärfarbe**: IMMER identisch
- **Akzentfarbe**: IMMER identisch
- **Hover-States**: IMMER identisch

### Beispiel-Regel:
- Primär-Button: #323D5E, Hover: #2A3449
- Sekundär-Button: Grau, Hover: Dunkelgrau
- **Diese Regel gilt für ALLE Buttons**

## ANORDNUNGEN

### Layout-Konsistenz
- **Grid-System**: IMMER identisch
- **Abstände**: IMMER identisch (gap-5 Standard)
- **Padding**: IMMER identisch
- **Margins**: IMMER identisch

### Beispiel-Regel:
- Container: Max-Breite 1400px, zentriert
- Grid: 12 Spalten, gap-5 (20px)
- **Diese Regel gilt für ALLE Layouts**

## FUNKTIONEN

### Konsistenz
- **Verhalten**: IMMER identisch
- **Feedback**: IMMER identisch
- **Fehlerbehandlung**: IMMER identisch
- **Loading-States**: IMMER identisch

### Beispiel-Regel:
- Button-Klick: Sofortiges visuelles Feedback, Loading-Spinner
- Erfolg: Toast-Notification oben rechts
- Fehler: Toast-Notification oben rechts, rot
- **Diese Regel gilt für ALLE Funktionen**

## PRÜFUNG (OBLIGATORISCH)

### Visuelle Prüfung
- [ ] Buttons an exakt der gleichen Stelle?
- [ ] Hilfe-Texte an exakt der gleichen Stelle?
- [ ] Text-Ausrichtungen identisch?
- [ ] Farbabstimmungen identisch?
- [ ] Anordnungen identisch?

### Logische Prüfung (aus Nutzersicht)
- [ ] Macht die Platzierung Sinn?
- [ ] Ist die Navigation intuitiv?
- [ ] Sind die Abstände angenehm?
- [ ] Ist die Hierarchie klar?
- [ ] Ist die Bedienung einfach?

## VERBOTEN
- ❌ Unterschiedliche Platzierungen
- ❌ Inkonsistente Abstände
- ❌ Unterschiedliche Farben
- ❌ Inkonsistente Anordnungen
- ❌ Unterschiedliche Funktionen

## ERFORDERLICH
- ✅ Exakt identische Platzierung
- ✅ Exakt identische Abstände
- ✅ Exakt identische Farben
- ✅ Exakt identische Anordnungen
- ✅ Exakt identische Funktionen
`,
  tags: ["ui", "consistency", "placement", "critical"],
  relatedEntries: ["ui-consistency-001", "quality-assurance-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const VISUAL_LOGICAL_VALIDATION: KnowledgeEntry = {
  id: "visual-logical-validation-001",
  category: "best-practices",
  title: "Visuelle & Logische Prüfung - Nutzersicht",
  content: `
# Visuelle & Logische Prüfung - Nutzersicht

## GRUNDPRINZIP: NUTZERSICHT
Nicht nur Datenwerte prüfen, sondern auch **visuell und logisch aus Nutzersicht** überdenken.

## PRÜFUNGSMETHODEN

### 1. Visuelle Prüfung
- **Augenprüfung**: Wie sieht es aus?
- **Konsistenz**: Sind alle Elemente konsistent?
- **Hierarchie**: Ist die visuelle Hierarchie klar?
- **Abstände**: Sind die Abstände angenehm?
- **Farben**: Passen die Farben zusammen?

### 2. Logische Prüfung (aus Nutzersicht)
- **Intuitivität**: Ist es intuitiv?
- **Navigation**: Ist die Navigation logisch?
- **Bedienung**: Ist die Bedienung einfach?
- **Verständlichkeit**: Ist es verständlich?
- **Erwartung**: Entspricht es den Erwartungen?

### 3. Funktionale Prüfung
- **Funktionalität**: Funktioniert es?
- **Performance**: Ist es schnell?
- **Fehlerbehandlung**: Werden Fehler gut behandelt?
- **Feedback**: Gibt es ausreichend Feedback?

## NICHT NUR AUF DOKUMENTATIONEN VERLASSEN

### Obligatorisch
- ✅ Visuelle Prüfung durchführen
- ✅ Logische Prüfung aus Nutzersicht durchführen
- ✅ Funktionale Prüfung durchführen
- ✅ Dokumentation als Basis, aber nicht als einzige Quelle

### Beispiel
**FALSCH**: "Dokumentation sagt, Button ist 44px hoch - also ist es korrekt"
**RICHTIG**: "Button ist 44px hoch, aber visuell wirkt er zu klein im Kontext - prüfe und passe an"

## PRÜFUNGSPUNKTE

### Text-Ausrichtungen
- [ ] Visuell: Sieht die Ausrichtung gut aus?
- [ ] Logisch: Macht die Ausrichtung Sinn?
- [ ] Konsistenz: Ist die Ausrichtung konsistent?

### Textumbrüche
- [ ] Visuell: Siehen die Umbrüche gut aus?
- [ ] Logisch: Sind die Umbrüche sinnvoll?
- [ ] Lesbarkeit: Ist der Text gut lesbar?

### Farbabstimmungen
- [ ] Visuell: Passen die Farben zusammen?
- [ ] Logisch: Unterstützen die Farben die Hierarchie?
- [ ] Kontrast: Ist der Kontrast ausreichend?

### Anordnungen
- [ ] Visuell: Sieht die Anordnung gut aus?
- [ ] Logisch: Ist die Anordnung intuitiv?
- [ ] Balance: Ist die Anordnung ausgewogen?

### Funktionen
- [ ] Visuell: Ist die Funktion visuell klar?
- [ ] Logisch: Macht die Funktion Sinn?
- [ ] Bedienung: Ist die Bedienung einfach?

## QUALITÄT BIS INS KLEINSTE DETAIL

### Ausrichtungen
- Pixelgenaue Ausrichtung
- Konsistente Abstände
- Klare Hierarchie

### Farbabstimmungen
- Harmonische Farbpalette
- Konsistente Verwendung
- Ausreichender Kontrast

### Anordnungen
- Logische Gruppierung
- Ausgewogene Balance
- Klare Struktur

### Funktionen
- Intuitive Bedienung
- Klare Feedback
- Fehlerfreie Umsetzung

## VERBOTEN
- ❌ Nur auf Dokumentationen verlassen
- ❌ Nur Datenwerte prüfen
- ❌ Visuelle Prüfung ignorieren
- ❌ Logische Prüfung ignorieren

## ERFORDERLICH
- ✅ Visuelle Prüfung durchführen
- ✅ Logische Prüfung aus Nutzersicht durchführen
- ✅ Funktionale Prüfung durchführen
- ✅ Qualität bis ins kleinste Detail
`,
  tags: ["validation", "visual", "logical", "user-perspective", "critical"],
  relatedEntries: ["ui-consistency-detailed-001", "quality-assurance-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const QUALITY_THINKING_DETAILED: KnowledgeEntry = {
  id: "quality-thinking-detailed-001",
  category: "best-practices",
  title: "Qualitätsdenken bis ins kleinste Detail",
  content: `
# Qualitätsdenken bis ins kleinste Detail

## GRUNDPRINZIP: QUALITÄT AN OBERSTER STELLE
Qualitätsdenken ist ausnahmslos bis ins kleinste Detail an oberster Stelle zu setzen.

## BEREICHE

### 1. Ausrichtungen
- Pixelgenaue Ausrichtung
- Konsistente Abstände
- Klare Hierarchie
- Ausgewogene Balance

### 2. Farbabstimmungen
- Harmonische Farbpalette
- Konsistente Verwendung
- Ausreichender Kontrast
- Professionelle Darstellung

### 3. Anordnungen
- Logische Gruppierung
- Ausgewogene Balance
- Klare Struktur
- Intuitive Navigation

### 4. Funktionen
- Intuitive Bedienung
- Klare Feedback
- Fehlerfreie Umsetzung
- Schnelle Performance

### 5. SEO
- Relevante Keywords
- Optimierte Meta-Tags
- Strukturierte Inhalte
- Schnelle Ladezeiten

### 6. Kommunikation
- Klare, verständliche Texte
- Professionelle Sprache
- Konsistente Formulierungen
- Nutzerfreundliche Anweisungen

### 7. E-Mails
- Professionelles Design
- Konsistente Branding
- Klare Struktur
- Fehlerfreie Inhalte

## KLEINIGKEITEN & DETAILS

### Was den Unterschied macht:
- **Konsistente Abstände**: Wirkt professionell
- **Pixelgenaue Ausrichtung**: Wirkt präzise
- **Harmonische Farben**: Wirkt hochwertig
- **Klare Hierarchie**: Wirkt strukturiert
- **Intuitive Bedienung**: Wirkt benutzerfreundlich

### Beispiel:
**FALSCH**: Button hat 15px Abstand statt 16px - "ist ja fast gleich"
**RICHTIG**: Button hat exakt 16px Abstand - Konsistenz ist wichtig

## PRÜFUNG (OBLIGATORISCH)

### Für jeden Bereich:
1. **Ausrichtungen**: Pixelgenau? Konsistent?
2. **Farbabstimmungen**: Harmonisch? Konsistent?
3. **Anordnungen**: Logisch? Ausgewogen?
4. **Funktionen**: Intuitiv? Fehlerfrei?
5. **SEO**: Optimiert? Strukturiert?
6. **Kommunikation**: Klar? Professionell?
7. **E-Mails**: Professionell? Konsistent?

## UNTERSCHEIDUNGSMERKMALE

### Hohe Qualität
- ✅ Pixelgenaue Umsetzung
- ✅ Konsistente Abstände
- ✅ Harmonische Farben
- ✅ Klare Hierarchie
- ✅ Intuitive Bedienung

### Nutzerfreundlichkeit
- ✅ Einfache Bedienung
- ✅ Klare Navigation
- ✅ Verständliche Texte
- ✅ Schnelle Performance
- ✅ Fehlerfreie Umsetzung

### Durchdachte Bedienbarkeit
- ✅ Logische Struktur
- ✅ Intuitive Navigation
- ✅ Klare Feedback
- ✅ Ausgewogene Balance
- ✅ Professionelle Darstellung

### Übersichtliche & saubere Darstellung
- ✅ Klare Struktur
- ✅ Konsistente Abstände
- ✅ Harmonische Farben
- ✅ Professionelles Design
- ✅ Fehlerfreie Umsetzung

## VERBOTEN
- ❌ "Ist ja fast gleich" - Einstellung
- ❌ "Funktioniert ja" - Einstellung
- ❌ "Sieht schon ok aus" - Einstellung
- ❌ Kompromisse bei Qualität

## ERFORDERLICH
- ✅ Pixelgenaue Umsetzung
- ✅ Konsistente Abstände
- ✅ Harmonische Farben
- ✅ Klare Hierarchie
- ✅ Intuitive Bedienung
- ✅ Fehlerfreie Umsetzung
- ✅ Professionelle Darstellung
`,
  tags: ["quality", "detail", "thinking", "critical"],
  relatedEntries: ["mydispatch-core-values-001", "visual-logical-validation-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

