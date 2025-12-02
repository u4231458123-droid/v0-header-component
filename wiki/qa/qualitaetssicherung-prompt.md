# MyDispatch Qualitätssicherungs-Prompt

## Version 1.0 | Referenz-Dokument

---

## Vollsystem-QA Prompt

Bei jedem QA-Durchlauf wird folgender Prompt verwendet:

---

**PROMPT:**

Führe jetzt eine vollständige, systemweite, umfassende Qualitätssicherung des gesamten MyDispatch-Systems durch. Prüfe jedes Modul, jede Seite, jeden Link, jede Verbindung, jedes Formular, jede API, jede Tariflogik, jede Nutzerrolle und jede Funktion – vollständig, fehlerfrei und mit höchster Präzision.

Arbeite vollständig autonom, logisch, tiefgehend, methodisch und nach modernsten Qualitätsstandards.
Dein Ziel: 100 % Fehlerfreiheit, 100 % Funktionssicherheit, 100 % Rechtskonformität, 100 % Go-Live-Reife.

---

## 1. Vollsystem-Testung

Prüfe alle Systeme und Module:

- Pre-Login-Bereich
- Unternehmer-Landingpages
- Unternehmerportal
- Fahrerportal
- Kundenportal
- Tarif- und Abo-System
- Registrierung & Login
- Formularsysteme
- Dokumentenlogik
- Fahrerverwaltung
- Schichten & Zeitlogik
- Fahrtenannahme/-ablehnung
- Kommunikationssystem
- Buchungswidget (tarifabhängig)
- API-Verbindungen
- Datenbanktabellen & Verknüpfungen
- Frontend-Logiken
- Backend-Logiken
- Validierungen
- Uploadsystem
- dynamische Rechtstexte
- CI/CD-Funktionen
- mobile Darstellung
- Desktop Darstellung
- SEO & Performance
- Cookie-System (DSGVO)

**Nichts darf ausgelassen werden.**

---

## 2. Fehlererkennung & Ursachenanalyse

Für jeden gefundenen Fehler gilt:

1. Fehler reproduzieren
2. Vollständige Ursachenanalyse
3. Primärursache identifizieren (Root Cause)
4. Sekundäre Ursachen prüfen (Side Effects)
5. Zusammenhängende Module analysieren
6. Abhängigkeiten prüfen
7. Strukturelle Logikfehler identifizieren

**Keine Symptombehandlung – nur vollständige Ursachenbehebung.**

---

## 3. Fehlerbehebung

Nach der Ursachenanalyse:

- Fehler vollständig eliminieren
- Logik korrigieren
- Verknüpfungen reparieren
- API-Ziele korrigieren
- Falsche oder fehlende Links reparieren
- Eingabefelder korrigieren
- Validierungen ergänzen
- Sicherheitslücken schließen
- Formularlogiken korrigieren
- Tarifprüfungen korrigieren
- Fahrer-/Schichtlogik korrigieren
- Dokumentenlogik stabilisieren
- Layoutfehler beheben
- Mobile Fehler korrigieren
- Code vereinheitlichen
- Inkonsistenzen beseitigen

**Jede Korrektur muss nachhaltig, logisch und stabil sein.**

---

## 4. Link- & Routing-Prüfung

Prüfe und validiere:

- Alle Links
- Alle Buttons
- Alle Zielseiten
- Alle Landingpages
- Alle Weiterleitungen
- Alle Router-Pfade
- Alle API-Endpunkte
- Alle Deep Links
- Alle Login-Redirects
- Alle Logout-Redirects

**Regeln:**
- Kein Link darf ins Leere führen
- Keine Seite darf fehlen
- Keine 404/500 Fehler
- Jede Zielseite muss existieren
- Routing muss logisch, verständlich und stabil sein

---

## 5. Funktions- & Logikprüfung

### 5.1 Registrierung
- Alle Felder vorhanden
- Deutsche Standards (Anrede, Titel, Vorname, Nachname etc.)
- Validierung korrekt
- Tarifwahl korrekt
- Stripe-Flow funktioniert
- Konto erst nach Zahlung aktiv
- Fehlermeldungen korrekt

### 5.2 Login
- Rollenbasiert
- Rechte sauber gesetzt
- Redirects korrekt

### 5.3 Tarif-/Abo-Logik
- Nur bezahlte Tarife erhalten Zugang
- Limits korrekt enforced
- Starter ohne Buchungswidget
- Business/Pro mit allen Funktionen
- Stripe-Webhooks korrekt

### 5.4 Unternehmerportal
- Fahrerverwaltung
- Schichtplan
- Dokumentprüfung
- Unternehmensdaten
- Rechnungen
- Unternehmens-Landingpages
- Tarifverwaltung

### 5.5 Fahrerportal
- Schicht beginnen / beenden
- Pause setzen
- Fahrten annehmen/ablehnen
- Keine nachträglichen Änderungen möglich
- Dokumente sichtbar

### 5.6 Kundenportal
- Registrierung
- Login
- Profildaten
- Fahrtenübersicht
- Rechnungen (falls Unternehmer aktiviert)

---

## 6. Rechtskonforme Prüfung

Prüfe:

- Impressum
- Datenschutz (DSGVO)
- Cookie-Banner + Einstellungen
- Nutzungsbedingungen
- Dynamische Rechtstexte für Unternehmer
- KI-Hinweise (EU AI Act)
- PBefG-relevante Angaben

**Alles muss vollständig und korrekt sein.**

---

## 7. Mobile-Vollblast-Test

Teste ALLE Seiten auf:

- iPhone SE
- iPhone 12–16
- Samsung S20–S24
- Tablets
- Android-Standard

Alle Breakpoints prüfen:
- Layout
- Buttons
- Formulare
- Bilder
- Modal-Dialoge
- Tabellen
- Navigation
- Schriftgrößen
- Abstände

**Keine Überlappungen, keine abgeschnittenen Elemente.**

---

## 8. Performance & Sicherheit

Prüfe:

- Ladezeiten
- Bildoptimierung
- Codegröße
- Komprimierung
- API-Sicherheit
- Rechteprüfung serverseitig
- Datenvalidierung
- Session-Handling
- SQL-/API-Schutz

---

## 9. CI/CD Evaluation

Stelle sicher:

- Alle Tests grün
- Unit Tests korrekt
- Visuelle Regression fehlerfrei
- Mobile Snapshot Tests fehlerfrei
- Deployment stabil
- Keine Abhängigkeiten brechen
- Pipeline wiederholbar
- Pipeline robust bei Fehlern

---

## 10. Go-Live-Tauglichkeit

Prüfe vollständig:

- Alle Features funktionieren
- System ohne Fehlermeldungen
- Lückenloser Funktionsumfang
- Konsistente UX
- Keine toten Seiten
- Keine fehlenden Texte
- Keine Placeholder
- Keine doppelten Felder
- Keine Logikfehler
- Intuitive Bedienung
- Stabile Performance
- Rechtssicherer Betrieb
- Keine kritischen Bugs

**Ergebnis muss sein: Das System ist 100 % Go-Live-fähig.**

---

## 11. Abschlussbericht

Erstelle abschließend:

- Vollständige Fehlerliste
- Ursachenanalyse
- Korrekturen
- Erneute Testläufe
- Finaler Go-Live-Report
- Risikoanalyse
- Verbesserungsvorschläge
- Best-Practice-Empfehlungen

---

## Zusatz-Hinweise

- Niemals bunte SVGs - Ausnahmslos in CI-Farbe
- Alle Seiten müssen oben öffnen
- Alles muss dokumentiert als Pflichtenheft geführt werden
- Führe auch ein Cleanup durch

---

## Master Admin Account

| Attribut | Wert |
|----------|------|
| E-Mail | courbois1981@gmail.com |
| Passwort | 1def!xO2022!! |
| Rolle | master_admin |
| Tarifprüfung | Deaktiviert |
| Vollzugriff | Alle Daten, Unternehmen, Fahrer, Kunden, Landingpages, Tarife |
| Löschbar | NEIN |

---

**Dokument-Version:** 1.0  
**Letzte Aktualisierung:** 25.11.2025
