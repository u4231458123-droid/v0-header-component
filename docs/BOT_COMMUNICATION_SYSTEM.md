# Bot-Kommunikationssystem - MyDispatch

## Übersicht

Vollständiges Kommunikationssystem zwischen Bots mit klarem Workflow für offene Fragen und Internet-Recherche.

## Kernprinzip

**JEDER BOT UND JEDER ASSISTENT muss bei Unsicherheit kommunizieren:**
- ✅ **KEINE Halluzinationen** - niemals erfinden oder raten
- ✅ **KEINE falschen Handlungen** - bei Unsicherheit Hilfe holen
- ✅ **Verpflichtung zur Kommunikation** - bei offenen Fragen Hilfe anfordern

## Kommunikations-Workflow

### 1. Erste Anlaufstelle: Dokumentationsabteilung
```
Bot hat Frage
  ↓
Bot fragt Documentation-Bot/Assistant
  ↓
Documentation-Bot/Assistant recherchiert (Internet-Zugriff)
  ↓
Antwort aus vertrauensvollen Quellen
```

### 2. Zweite Anlaufstelle: Master-Bot
```
Documentation-Bot/Assistant hat keine Antwort
  ↓
Frage wird an Master-Bot weitergeleitet
  ↓
Master-Bot klärt im nächsten Chat mit User
```

### 3. Dritte Anlaufstelle: User-Chat
```
Master-Bot hat keine Antwort
  ↓
Master-Bot fragt User im Chat
  ↓
User gibt Vorgabe
  ↓
Vorgabe wird dokumentiert
  ↓
Aufgabe wird nach Vorgabe umgesetzt
```

## Internet-Zugriff

### Nur Documentation-Bot und Documentation-Assistant
- ✅ Recherche auf vertrauensvollen Seiten
- ✅ Best Practices recherchieren
- ✅ Aktuelle Informationen einholen
- ✅ Technische Dokumentation recherchieren

### Alle anderen Bots
- ❌ KEIN direkter Internet-Zugriff
- ✅ Müssen über Documentation-Bot/Assistant recherchieren

## Verpflichtungen

### Jeder Bot/Assistent
- ✅ **MUSS** bei Unsicherheit Hilfe anfordern
- ✅ **MUSS** bei offenen Fragen Dokumentationsabteilung kontaktieren
- ✅ **DARF NICHT** halluzinieren oder erfinden
- ✅ **DARF NICHT** raten oder annehmen
- ✅ **MUSS** ehrlich kommunizieren, wenn etwas unklar ist

### Documentation-Bot/Assistant
- ✅ **MUSS** Internet-Zugriff nutzen für Recherche
- ✅ **MUSS** vertrauensvolle Quellen verwenden
- ✅ **MUSS** Best Practices recherchieren
- ✅ **MUSS** Antworten dokumentieren
- ✅ **MUSS** bei fehlender Antwort an Master-Bot weiterleiten

### Master-Bot
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

## Implementierung

### BaseBot
- ✅ `askForHelp()` - Stelle Frage an anderen Bot
- ✅ `checkUncertaintyAndGetHelp()` - Prüfe Unsicherheit und hole Hilfe

### Documentation-Bot/Assistant
- ✅ `answerQuestion()` - Beantworte Frage mit Internet-Recherche
- ✅ `researchQuestion()` - Recherchiere im Internet
- ✅ `handleIncomingQuestion()` - Behandle eingehende Fragen

### Master-Bot
- ✅ `handleIncomingQuestion()` - Behandle eingehende Fragen
- ✅ `answerQuestionAfterUserChat()` - Beantworte nach User-Chat
- ✅ `documentQuestionForUserChat()` - Dokumentiere für User-Chat

### BotCommunicationManager
- ✅ `askQuestion()` - Stelle Frage
- ✅ `answerQuestion()` - Beantworte Frage
- ✅ `getPendingQuestions()` - Lade offene Fragen

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

## Zusammenfassung

**Vollständiges Kommunikationssystem implementiert:**
- ✅ Workflow: Dokumentation → Master-Bot → User-Chat
- ✅ Internet-Zugriff nur für Documentation-Bot/Assistant
- ✅ Verpflichtung zur Kommunikation bei Unsicherheit
- ✅ Keine Halluzinationen, keine falschen Handlungen
- ✅ Vollständige Dokumentation aller Fragen und Antworten

**Das System ist bereit für den Einsatz!**

