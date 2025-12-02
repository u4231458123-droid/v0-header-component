# MyDispatch Kurzbefehl-Protokoll

## Version 1.0 | Verbindliches Verhaltensprotokoll

---

## Kurzbefehl

\`\`\`
Lade prompt.md und stelle den vollständigen SOLL-Zustand her.
\`\`\`

**Alternative Kurzformen:**
- `Lade prompt.md`
- `SOLL-Zustand herstellen`
- `QA-Durchlauf starten`

---

## Verbindliches Verhalten bei Ausführung

Bei Eingabe des Kurzbefehls führt der AI-Assistent (Opus 4.5, Claude, GPT) **alle folgenden Schritte autonom, fehlerfrei und ohne Unterbrechungen** aus:

---

## Phase 1: Wissensbasis laden & validieren

### 1.1 Dateien laden
\`\`\`
wiki/prompt.md                    → Master-Datei
wiki/errors/fehlerliste.md        → Bekannte Fehler
wiki/todos/todo.md                → Offene Tasks
wiki/changelog/changelog.md       → Änderungshistorie
wiki/docs/golive-report.md        → Go-Live Status
wiki/qa/master-prompt.md          → QA-Anforderungen
wiki/qa/kurzbefehl-protokoll.md   → Dieses Protokoll
wiki/integrations/*.md            → Alle Integrationen
\`\`\`

### 1.2 Integrationen prüfen
- Supabase-Verbindung und Schema abrufen
- Stripe-Verbindung prüfen
- Environment Variables validieren

### 1.3 Wissens-Hydration erstellen
- Konsolidierter Projektzustand dokumentieren
- Alle Module inventarisieren:
  - Pre-Login-Seiten
  - Unternehmer-Landingpages
  - Dashboard-Portale (Unternehmer, Fahrer, Kunden)
  - Tarif-/Abo-Logik
  - Rechtstexte
  - CI/CD
  - QA
  - API/DB
  - Integrationen

---

## Phase 2: IST/SOLL-Analyse (systemweit)

### 2.1 IST-Zustand ermitteln
- **Alle Pre-Login-Seiten** visuell prüfen (InspectSite)
- **Code-Struktur** analysieren (GrepRepo, LSRepo, ReadFile)
- **Datenbank-Schema** validieren (GetOrRequestIntegration)
- **Import-Ketten** auf Fehler prüfen
- **Routing** auf 404/500 testen

### 2.2 SOLL-Zustand definieren
Basierend auf:
- wiki/prompt.md (Master-Definition)
- wiki/qa/master-prompt.md (Qualitätsstandards)
- Tarif-/Abo-Logik
- Deutsche Rechtskonformität (DE/EU)

### 2.3 Gap-Analyse dokumentieren
Jede Abweichung als prüfbares Gap erfassen:

| Gap-ID | Bereich | IST | SOLL | Priorität |
|--------|---------|-----|------|-----------|
| GAP-001 | ... | ... | ... | KRITISCH/HOCH/MITTEL/NIEDRIG |

---

## Phase 3: SOLL herstellen (autonom)

### 3.1 Priorisierte Reihenfolge
1. **KRITISCH** - Systemblockierende Fehler
2. **HOCH** - Funktionale Fehler
3. **MITTEL** - UX/Design-Probleme
4. **NIEDRIG** - Optimierungen

### 3.2 Pflicht-Prüfbereiche

| Nr | Bereich | Prüfpunkte |
|----|---------|------------|
| 1 | Import-Ketten | Keine zirkulären Imports, keine fehlenden Module |
| 2 | Pre-Login-Seiten | Alle ohne Fehler renderbar |
| 3 | Auth-Flow | Login/Signup/Logout funktional |
| 4 | Tarif-Gatekeeping | Serverseitig durchgesetzt |
| 5 | Master-Admin | Uneingeschränkter Zugriff |
| 6 | Rechtstexte | Impressum, DSGVO, AGB vollständig |
| 7 | Mobile-UX | Alle Breakpoints korrekt |
| 8 | Datenbank | RLS-Policies aktiv |
| 9 | API-Endpoints | Keine 500-Fehler |
| 10 | Integrationen | Google Maps, AI, Stripe funktional |

### 3.3 Autonome Korrektur
Bei jedem gefundenen Fehler:
1. Root-Cause identifizieren
2. Korrektur implementieren
3. Erneut testen
4. Bei Erfolg: weiter zum nächsten Gap
5. Bei Misserfolg: Alternative Lösung versuchen

---

## Phase 4: Qualitätssicherung (integriert)

### 4.1 Automatisierte Checks
- Lint (ESLint)
- Typprüfung (TypeScript)
- Visual Regression
- Mobile Snapshots
- Lighthouse (Performance, SEO, A11y)
- Security Checks

### 4.2 Manuelle Validierung
- Alle Seiten visuell prüfen (InspectSite)
- Formulare durchspielen
- Auth-Flow testen

### 4.3 Akzeptanzkriterien
- [ ] 0 kritische/mittlere Fehler
- [ ] Alle Routes funktional (keine 404/500)
- [ ] Tarif-Policy serverseitig durchgesetzt
- [ ] Rechtstexte dynamisch und vollständig
- [ ] Mobile 100% funktional
- [ ] Premium-Design-Niveau
- [ ] Pipeline grün

---

## Phase 5: Dokumentationspflicht erfüllen

### 5.1 Pflicht-Updates

| Datei | Inhalt |
|-------|--------|
| `wiki/prompt.md` | Version hochzählen, Status aktualisieren |
| `wiki/errors/fehlerliste.md` | Neue/behobene Fehler mit Root-Cause |
| `wiki/todos/todo.md` | Erledigte Tasks markieren, neue hinzufügen |
| `wiki/changelog/changelog.md` | Neuer Eintrag mit Datum, Änderungen |
| `wiki/docs/golive-report.md` | Aktueller Go-Live-Status |

### 5.2 Changelog-Format
\`\`\`markdown
## [X.Y.Z] - TT.MM.JJJJ

### Hinzugefügt
- ...

### Geändert
- ...

### Behoben
- ...

### Dokumentation
- ...
\`\`\`

---

## Phase 6: Abnahme & Go-Live-Check

### 6.1 Go-Live-Report aktualisieren
- IST→SOLL Zusammenfassung (vorher/nachher)
- Grüne QA-Metriken mit Schwellenwerten
- Rechts-Checkliste (DE/EU) → erfüllt
- Tarif-/Abo-Gatekeeping → verifiziert
- Mobile-Abdeckung → verifiziert
- Risiken/Restlasten + Gegenmaßnahmen
- Freigabeempfehlung

### 6.2 Freigabe-Entscheidung
- **GO-LIVE-FÄHIG**: Alle Akzeptanzkriterien erfüllt
- **BEDINGT GO-LIVE-FÄHIG**: Minor-Issues, aber funktionsfähig
- **NICHT FREIGEBEN**: Kritische Blocker, mit Begründung + Plan

---

## Phase 7: Stabilität & Prävention

### 7.1 Präventionseinträge
Für jede behobene Ursache:
- Wie künftig vermeiden?
- Regel/Test/Lint/Policy hinzufügen
- In fehlerliste.md dokumentieren

### 7.2 CI/CD-Erweiterung
Bei Bedarf neue automatisierte Checks hinzufügen und dokumentieren.

---

## Pflichtartefakte nach Durchlauf

Nach vollständiger Ausführung müssen folgende Dateien aktualisiert sein:

1. ✅ `wiki/prompt.md` (Version, Timestamp, Status)
2. ✅ `wiki/docs/golive-report.md`
3. ✅ `wiki/errors/fehlerliste.md`
4. ✅ `wiki/todos/todo.md`
5. ✅ `wiki/changelog/changelog.md`
6. ✅ Betroffene Fach-MDs (falls relevant)

---

## Beispiel-Ablauf

\`\`\`
USER: Lade prompt.md und stelle den vollständigen SOLL-Zustand her.

AI:
1. Lädt wiki/prompt.md und alle verlinkten Dateien
2. Prüft Supabase/Stripe Integrationen
3. Inspiziert alle Pre-Login-Seiten visuell
4. Erstellt IST/SOLL-Gap-Analyse
5. Behebt Gaps in priorisierter Reihenfolge
6. Testet nach jeder Korrektur
7. Aktualisiert Wiki-Dokumentation
8. Erstellt Go-Live-Report
9. Gibt Abschlussbericht aus
\`\`\`

---

## Hinweise für AI-Assistenten

- **Keine Unterbrechungen**: Der gesamte Durchlauf erfolgt autonom
- **Keine Rückfragen**: Bei Unklarheiten beste Lösung wählen
- **Dokumentation ist Pflicht**: Jede Änderung wird dokumentiert
- **Fehler werden behoben**: Nicht nur gemeldet, sondern gelöst
- **Qualität vor Geschwindigkeit**: Lieber gründlich als schnell

---

**Protokoll-Version:** 1.0  
**Erstellt:** 25.11.2025  
**Gültig ab:** Sofort
