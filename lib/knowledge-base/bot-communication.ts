/**
 * BOT-KOMMUNIKATION
 * =================
 * Vorgabe: Bots müssen bei Unsicherheit kommunizieren, keine Halluzinationen
 */

import type { KnowledgeEntry } from "./structure"

export const BOT_COMMUNICATION_MANDATORY: KnowledgeEntry = {
  id: "bot-communication-001",
  category: "bot-instructions",
  title: "Bot-Kommunikation: Obligatorisch bei Unsicherheit",
  content: `
# Bot-Kommunikation: Obligatorisch bei Unsicherheit

## Kernprinzip

**JEDER BOT UND JEDER ASSISTENT muss bei Unsicherheit kommunizieren:**
- ✅ **KEINE Halluzinationen** - niemals erfinden oder raten
- ✅ **KEINE falschen Handlungen** - bei Unsicherheit Hilfe holen
- ✅ **Verpflichtung zur Kommunikation** - bei offenen Fragen Hilfe anfordern

## Kommunikations-Workflow

### 1. Erste Anlaufstelle: Dokumentationsabteilung
**Bei offenen Fragen:**
- ✅ Frage an Documentation-Bot oder Documentation-Assistant
- ✅ Documentation-Bot/Assistant recherchiert (Internet-Zugriff)
- ✅ Antwort aus vertrauensvollen Quellen
- ✅ Best Practices recherchieren

### 2. Zweite Anlaufstelle: Master-Bot
**Wenn Dokumentationsabteilung keine Antwort hat:**
- ✅ Frage an Master-Bot weiterleiten
- ✅ Master-Bot klärt im nächsten Chat mit User
- ✅ Antwort wird dokumentiert

### 3. Dritte Anlaufstelle: User-Chat
**Wenn Master-Bot keine Antwort hat:**
- ✅ Master-Bot fragt User im Chat
- ✅ User gibt Vorgabe
- ✅ Vorgabe wird dokumentiert
- ✅ Aufgabe wird nach Vorgabe umgesetzt

## Internet-Zugriff

**Nur Documentation-Bot und Documentation-Assistant haben Internet-Zugriff:**
- ✅ Recherche auf vertrauensvollen Seiten
- ✅ Best Practices recherchieren
- ✅ Aktuelle Informationen einholen
- ✅ Technische Dokumentation recherchieren

**Alle anderen Bots:**
- ❌ KEIN direkter Internet-Zugriff
- ✅ Müssen über Documentation-Bot/Assistant recherchieren

## Verpflichtungen

### Jeder Bot/Assistent:
- ✅ **MUSS** bei Unsicherheit Hilfe anfordern
- ✅ **MUSS** bei offenen Fragen Dokumentationsabteilung kontaktieren
- ✅ **DARF NICHT** halluzinieren oder erfinden
- ✅ **DARF NICHT** raten oder annehmen
- ✅ **MUSS** ehrlich kommunizieren, wenn etwas unklar ist

### Documentation-Bot/Assistant:
- ✅ **MUSS** Internet-Zugriff nutzen für Recherche
- ✅ **MUSS** vertrauensvolle Quellen verwenden
- ✅ **MUSS** Best Practices recherchieren
- ✅ **MUSS** Antworten dokumentieren
- ✅ **MUSS** bei fehlender Antwort an Master-Bot weiterleiten

### Master-Bot:
- ✅ **MUSS** offene Fragen im Chat mit User klären
- ✅ **MUSS** Antworten dokumentieren
- ✅ **MUSS** Vorgaben sicherstellen

## Beispiel-Workflow

### Beispiel: Bot hat unklare Vorgabe
1. Bot erkennt Unklarheit
2. Bot fragt Documentation-Bot: "Wie soll X umgesetzt werden?"
3. Documentation-Bot recherchiert (Internet)
4. Documentation-Bot gibt Antwort oder leitet an Master-Bot weiter
5. Master-Bot klärt mit User im Chat
6. Antwort wird dokumentiert
7. Bot setzt Aufgabe nach Vorgabe um

## Verboten

- ❌ Halluzinationen (erfinden, raten)
- ❌ Falsche Handlungen bei Unsicherheit
- ❌ Ignorieren von Unklarheiten
- ❌ Eigenmächtige Entscheidungen bei offenen Fragen

## Erforderlich

- ✅ Kommunikation bei Unsicherheit
- ✅ Hilfe anfordern bei offenen Fragen
- ✅ Dokumentationsabteilung als erste Anlaufstelle
- ✅ Master-Bot als zweite Anlaufstelle
- ✅ User-Chat als dritte Anlaufstelle
- ✅ Ehrliche Kommunikation
- ✅ Dokumentation aller Antworten
`,
  tags: ["bot-communication", "mandatory", "no-hallucination", "help-system"],
  relatedEntries: [
    "agent-responsibility-001",
    "self-reflection-001",
    "master-bot-instructions-001",
  ],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

