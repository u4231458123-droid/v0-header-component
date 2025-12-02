/**
 * SELBSTREFLEXION FÜR ALLE BOTS UND ASSISTENTEN
 * ============================================
 * Obligatorische Selbstreflexion vor, während und nach Aufgaben
 */

import type { KnowledgeEntry } from "./structure"

export const SELF_REFLECTION_MANDATORY: KnowledgeEntry = {
  id: "self-reflection-001",
  category: "bot-instructions",
  title: "Selbstreflexion: Obligatorisch für alle Bots und Assistenten",
  content: `
# Selbstreflexion: Obligatorisch für alle Bots und Assistenten

## Kernprinzip

**JEDER BOT UND JEDER ASSISTENT muss sich stets selbst reflektieren:**
- ✅ **VOR** der Aufgabe
- ✅ **WÄHREND** der Aufgabe
- ✅ **NACH** der Aufgabe

## Reflexions-Punkte

### 1. Vor der Aufgabe
- ✅ Sind alle Vorgaben klar und verstanden?
- ✅ Ist die Aufgabe vollständig definiert?
- ✅ Gibt es Unklarheiten, die geklärt werden müssen?
- ✅ Sind alle notwendigen Ressourcen verfügbar?
- ✅ Entspricht der Plan allen Vorgaben?

### 2. Während der Aufgabe
- ✅ Entspricht die aktuelle Arbeit allen Vorgaben?
- ✅ Gibt es Abweichungen vom Plan?
- ✅ Sind alle Schritte korrekt ausgeführt?
- ✅ Gibt es technische Probleme (z.B. Code-Abschneiden)?
- ✅ Müssen Anpassungen vorgenommen werden?

### 3. Nach der Aufgabe
- ✅ Wurde die Arbeit wirklich fehlerfrei erledigt?
- ✅ Entspricht das Ergebnis allen Vorgaben?
- ✅ Gibt es technische Einschränkungen (z.B. Code-Abschneiden)?
- ✅ Sind alle Dokumentationen vollständig?
- ✅ Gibt es Verbesserungspotenzial?

## Dokumentation

**Jede ausgeführte Arbeit MUSS dokumentiert werden mit:**
- ✅ **Uhrzeit** (deutsche Zeit - MEZ/MESZ)
- ✅ **Datum** (deutsches Format: DD.MM.YYYY)
- ✅ **Name** (Name des Bots/Assistenten)
- ✅ **Aufgabe** (Was wurde gemacht?)
- ✅ **Ergebnis** (Was ist das Ergebnis?)
- ✅ **Reflexion** (Selbstreflexion-Ergebnis)
- ✅ **Fehler** (Falls vorhanden, detailliert)

## Nachvollziehbarkeit

**Dokumentation ermöglicht:**
- ✅ Klare Nachvollziehbarkeit, wer Fehler gemacht hat
- ✅ Sofortige Nachjustierung fehlermachender Bots
- ✅ Kontinuierliche Verbesserung
- ✅ Vollständige Transparenz

## Technische Einschränkungen

**Bei technischen Einschränkungen (z.B. Code-Abschneiden):**
- ✅ Dokumentiere die Einschränkung sofort
- ✅ Beschreibe was fehlt oder unvollständig ist
- ✅ Melde an zuständigen Bot/Assistenten
- ✅ Erstelle Nachjustierungsauftrag

## Obligatorisch

**Diese Selbstreflexion ist OBLIGATORISCH und darf NIEMALS übersprungen werden!**
`,
  tags: ["self-reflection", "mandatory", "documentation", "quality"],
  relatedEntries: ["agent-responsibility-001", "work-tracking-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

