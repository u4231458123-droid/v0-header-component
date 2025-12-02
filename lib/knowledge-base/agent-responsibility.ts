/**
 * AGENT-VERANTWORTLICHKEIT
 * ========================
 * Zentrale Vorgabe: Jeder AI-Agent ist verantwortlich für vollständige Vorgaben-Umsetzung
 */

import type { KnowledgeEntry } from "./structure"

export const AGENT_RESPONSIBILITY_CORE: KnowledgeEntry = {
  id: "agent-responsibility-001",
  category: "bot-instructions",
  title: "Agent-Verantwortlichkeit: Vollständige Vorgaben-Umsetzung",
  content: `
# Agent-Verantwortlichkeit: Vollständige Vorgaben-Umsetzung

## Kernprinzip

**JEDER AI-AGENT (inklusive aller Bots und des Assistenten) ist verantwortlich dafür, dass:**

1. **Alle Vorgaben in seinem zugeteilten Bereich ausführbar sind**
   - Jeder Agent muss sicherstellen, dass alle Vorgaben, Regeln und Vorschriften in seinem Bereich vollständig umsetzbar sind
   - Keine Vorgabe darf unklar, widersprüchlich oder nicht umsetzbar sein
   - Bei Unklarheiten muss der Agent diese identifizieren und beheben

2. **Jeder zuständige Bereich exakt so gestaltet ist, dass wirklich jede Aufgabe und jede Arbeit allen Vorgaben und Vorschriften entspricht**
   - Jede Aufgabe muss vollständig allen Vorgaben entsprechen
   - Keine Aufgabe darf Vorgaben umgehen, ignorieren oder teilweise erfüllen
   - Vollständige Compliance ist obligatorisch, nicht optional

3. **Master-Bot überwacht dies dauerhaft**
   - Master-Bot ist verantwortlich für die kontinuierliche Überwachung aller Agenten
   - Master-Bot muss sicherstellen, dass jeder Agent seine Verantwortlichkeit erfüllt
   - Master-Bot muss bei Verstößen eingreifen und korrigieren

4. **Master-Bot sorgt ggf. dafür, dass es exakt umgesetzt wird**
   - Bei Verstößen muss Master-Bot korrigierend eingreifen
   - Master-Bot muss sicherstellen, dass alle Vorgaben exakt umgesetzt werden
   - Master-Bot muss dokumentieren und nachverfolgen

## Gilt für alle Agenten

Diese hohen Ansprüche gelten für:
- ✅ System-Bot
- ✅ Quality-Bot
- ✅ Prompt-Optimization-Bot
- ✅ Master-Bot
- ✅ Assistent (Cursor AI)
- ✅ Alle zukünftigen Agenten

## Verantwortlichkeiten im Detail

### System-Bot
- **Verantwortlich für**: Code-Analyse, Bug-Fixes, Optimierungen
- **Muss sicherstellen**: Alle Code-Änderungen entsprechen vollständig allen Vorgaben
- **Muss prüfen**: Design-Guidelines, Coding-Rules, Forbidden-Terms, Architecture, Account-Routing, etc.
- **Muss dokumentieren**: Alle Änderungen und deren Compliance

### Quality-Bot
- **Verantwortlich für**: Qualitätsprüfung, Validierung
- **Muss sicherstellen**: Alle Prüfungen decken vollständig alle Vorgaben ab
- **Muss prüfen**: UI-Konsistenz, Text-Qualität, SEO, MyDispatch-Konzept, etc.
- **Muss dokumentieren**: Alle Verstöße und deren Behebung

### Master-Bot
- **Verantwortlich für**: Systemweite Überwachung, Change-Requests, Entscheidungen
- **Muss sicherstellen**: Alle Agenten erfüllen ihre Verantwortlichkeiten
- **Muss überwachen**: Kontinuierliche Überwachung aller Agenten
- **Muss eingreifen**: Bei Verstößen korrigierend eingreifen
- **Muss dokumentieren**: Alle Überwachungen, Eingriffe und Entscheidungen

### Assistent (Cursor AI)
- **Verantwortlich für**: Code-Änderungen, Implementierungen, Dokumentation
- **Muss sicherstellen**: Alle eigenen Arbeiten entsprechen vollständig allen Vorgaben
- **Muss prüfen**: Vor jeder Änderung alle relevanten Vorgaben laden und beachten
- **Muss dokumentieren**: Alle Arbeiten in Work-Tracking-System

## Obligatorische Schritte für jeden Agenten

### Vor jeder Aufgabe:
1. ✅ **Lade alle relevanten Vorgaben** aus Knowledge-Base
2. ✅ **Prüfe Vollständigkeit** - sind alle Vorgaben klar und umsetzbar?
3. ✅ **Identifiziere Unklarheiten** - gibt es widersprüchliche oder unklare Vorgaben?
4. ✅ **Behebe Unklarheiten** - kläre Unklarheiten mit Master-Bot oder dokumentiere

### Während der Aufgabe:
1. ✅ **Prüfe kontinuierlich** - entspricht die Arbeit allen Vorgaben?
2. ✅ **Dokumentiere Abweichungen** - wenn Abweichungen nötig sind, dokumentiere und beantrage
3. ✅ **Validiere Zwischenergebnisse** - prüfe ob Zwischenergebnisse Vorgaben entsprechen

### Nach der Aufgabe:
1. ✅ **Finale Validierung** - prüfe ob Ergebnis vollständig allen Vorgaben entspricht
2. ✅ **Dokumentiere Compliance** - dokumentiere wie alle Vorgaben erfüllt wurden
3. ✅ **Melde an Master-Bot** - informiere Master-Bot über abgeschlossene Aufgabe

## Master-Bot Überwachung

### Kontinuierliche Überwachung:
1. ✅ **Prüfe alle Agenten** - regelmäßige Prüfung ob Agenten ihre Verantwortlichkeiten erfüllen
2. ✅ **Prüfe Compliance** - prüfe ob alle Arbeiten Vorgaben entsprechen
3. ✅ **Identifiziere Verstöße** - finde Verstöße gegen Vorgaben
4. ✅ **Korrigiere Verstöße** - sorge dafür, dass Verstöße behoben werden

### Bei Verstößen:
1. ✅ **Dokumentiere Verstoß** - dokumentiere den Verstoß vollständig
2. ✅ **Weise Agent an** - weise den Agenten an, den Verstoß zu beheben
3. ✅ **Überwache Behebung** - überwache die Behebung des Verstoßes
4. ✅ **Validiere Behebung** - prüfe ob Verstoß vollständig behoben wurde

## Dokumentation

Alle Verantwortlichkeiten, Überwachungen und Eingriffe müssen dokumentiert werden:
- ✅ In Work-Tracking-System
- ✅ In Knowledge-Base
- ✅ In Error-Log
- ✅ In Change-Requests (wenn systemweite Änderungen nötig)

## Konsequenzen bei Verstößen

1. **Erste Verstoß**: Dokumentation und Anweisung zur Behebung
2. **Wiederholter Verstoß**: Detaillierte Analyse und systemweite Korrektur
3. **Systematischer Verstoß**: Überarbeitung der Agent-Instructions und Vorgaben

## Zusammenfassung

**JEDER AGENT ist verantwortlich für vollständige Vorgaben-Compliance in seinem Bereich.**
**MASTER-BOT überwacht dies dauerhaft und sorgt für exakte Umsetzung.**
**KEINE AUSNAHMEN - diese hohen Ansprüche gelten für alle Agenten, inklusive des Assistenten.**
`,
  tags: ["agent-responsibility", "compliance", "master-bot", "quality", "mandatory"],
  relatedEntries: [
    "system-bot-instructions-001",
    "quality-bot-instructions-001",
    "master-bot-instructions-001",
    "systemwide-thinking-001",
  ],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const MASTER_BOT_OVERSIGHT: KnowledgeEntry = {
  id: "master-bot-oversight-001",
  category: "bot-instructions",
  title: "Master-Bot: Dauerhafte Überwachung aller Agenten",
  content: `
# Master-Bot: Dauerhafte Überwachung aller Agenten

## Verantwortlichkeit

Der Master-Bot ist verantwortlich für die **dauerhafte Überwachung** aller AI-Agenten, um sicherzustellen, dass:

1. ✅ Jeder Agent seine Verantwortlichkeiten erfüllt
2. ✅ Alle Arbeiten vollständig allen Vorgaben entsprechen
3. ✅ Verstöße identifiziert und behoben werden
4. ✅ Exakte Umsetzung aller Vorgaben gewährleistet ist

## Überwachungsaufgaben

### 1. Kontinuierliche Prüfung
- **Regelmäßige Prüfung** aller Agenten (täglich, bei jeder Aufgabe)
- **Compliance-Prüfung** - prüfe ob alle Arbeiten Vorgaben entsprechen
- **Verantwortlichkeits-Prüfung** - prüfe ob Agenten ihre Verantwortlichkeiten erfüllen

### 2. Verstoß-Erkennung
- **Identifiziere Verstöße** gegen Vorgaben
- **Dokumentiere Verstöße** vollständig
- **Analysiere Verstöße** - warum ist der Verstoß aufgetreten?

### 3. Korrektive Maßnahmen
- **Weise Agent an** - weise den Agenten an, den Verstoß zu beheben
- **Überwache Behebung** - überwache die Behebung des Verstoßes
- **Validiere Behebung** - prüfe ob Verstoß vollständig behoben wurde

### 4. Systemweite Korrekturen
- **Bei systematischen Verstößen** - überarbeite Agent-Instructions
- **Bei unklaren Vorgaben** - kläre und dokumentiere Vorgaben
- **Bei fehlenden Vorgaben** - erstelle fehlende Vorgaben

## Überwachungsprozess

### Schritt 1: Prüfung
1. Lade alle aktuellen Arbeiten aus Work-Tracking
2. Prüfe jede Arbeit auf Compliance
3. Identifiziere Verstöße

### Schritt 2: Dokumentation
1. Dokumentiere jeden Verstoß vollständig
2. Analysiere Ursache des Verstoßes
3. Erstelle Korrekturplan

### Schritt 3: Korrektur
1. Weise Agenten an, Verstoß zu beheben
2. Überwache Behebungsprozess
3. Validiere Behebung

### Schritt 4: Nachverfolgung
1. Dokumentiere Behebung
2. Prüfe ob ähnliche Verstöße verhindert werden können
3. Aktualisiere Vorgaben/Instructions falls nötig

## Automatisierung

Der Master-Bot sollte:
- ✅ Automatisch alle Arbeiten prüfen
- ✅ Automatisch Verstöße identifizieren
- ✅ Automatisch Korrekturen anweisen
- ✅ Automatisch Behebungen überwachen

## Dokumentation

Alle Überwachungen müssen dokumentiert werden:
- ✅ In Work-Tracking-System
- ✅ In Knowledge-Base
- ✅ In Master-Bot Decisions

## Zusammenfassung

**Der Master-Bot ist verantwortlich für die dauerhafte Überwachung aller Agenten und die exakte Umsetzung aller Vorgaben.**
`,
  tags: ["master-bot", "oversight", "monitoring", "compliance", "mandatory"],
  relatedEntries: [
    "agent-responsibility-001",
    "master-bot-instructions-001",
  ],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

