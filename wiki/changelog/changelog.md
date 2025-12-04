# Changelog

Alle wichtigen Änderungen am MyDispatch-Projekt werden hier dokumentiert.

---

## [2.5.0] - Dezember 2025

### Added
- **Autonome Bot-Orchestrierung**
  - `lib/ai/bots/master-bot.ts` - Autonome Task-Verteilung an spezialisierte Bots
  - `distributeTask()` - Automatische Zuweisung von Aufgaben basierend auf Bot-Spezialisierungen
  - `validateBotResult()` - Vollständige Validierung aller Änderungen durch Quality-Bot
  - `commitAndPush()` - Automatischer Commit/Push nach erfolgreicher Validierung (sicher gegen Command Injection)

- **MCP-Integration vervollständigt**
  - `lib/ai/bots/mcp-integration.ts` - Alle 5 TODOs implementiert mit Fallback-Mechanismen
  - `validateSupabaseProject()` - MCP-Aufruf mit Fallback zu Supabase-Client
  - `validateSchemaTables()` - MCP-Aufruf mit Fallback zu Tabellen-Prüfung
  - `applyMigrationWithValidation()` - MCP-Aufruf mit Fallback zu RPC
  - `generateTypesWithValidation()` - MCP-Aufruf mit Fallback zu information_schema
  - `checkSecurityAdvisors()` - MCP-Aufruf mit Fallback zu RLS-Prüfung

- **E-Mail-Templates erweitert**
  - `REMINDER_TEMPLATE` - Allgemeine Erinnerungen (Dokumente, Zahlungen)
  - `DOCUMENT_REMINDER_TEMPLATE` - Dokument-Ablauf-Erinnerungen
  - `PAYMENT_REMINDER_TEMPLATE` - Zahlungserinnerungen mit Rechnungsdetails
  - Alle Templates in `lib/email/templates.ts` implementiert

- **Security Advisors Optimierung**
  - `scripts/036_optimize_security_advisors.sql` - Migration für Security-Prüfungen
  - Prüft Function search_path
  - Prüft Extension-Platzierung
  - Prüft RLS auf kritischen Tabellen
  - Security Score-Berechnung

- **Prompt-Optimization-Bot erweitert**
  - Hugging Face Integration für Prompt-Optimierung
  - Persistente Speicherung optimierter Prompts in Supabase
  - Integration in Knowledge-Base

### Fixed
- **Command Injection in commitAndPush**
  - `lib/ai/bots/master-bot.ts` - Verwendet jetzt `spawn` mit Argument-Arrays statt `execSync` mit String-Interpolation
  - Vollständige Validierung von Dateipfaden und Commit-Messages
  - Keine Command Injection mehr möglich

- **Validierung in validateBotResult**
  - Sammelt jetzt ALLE Verstöße vor Rückgabe (nicht nur bis zum ersten Fehler)
  - Vollständige Sichtbarkeit aller Probleme

- **MCP-Integration Fallbacks**
  - Duplikat-Warnungen in Migration-Fallback entfernt
  - Hardcodierte Function search_path Warnung entfernt
  - Korrekte Fehlerbehandlung bei information_schema-Zugriff

### Updated
- Bot-Spezialisierungen in Master-Bot definiert
- Alle Bots erweitert um Dokumentations-Laden beim Start
- CI/CD optimiert für schnellere Builds

---

## [2.4.0] - Dezember 2025

### Added
- **SQL-Validierung und Agent-Fehler-Prävention**
  - `lib/utils/sql-validator.ts` - Verhindert Ausführung von TypeScript/JavaScript-Dateien als SQL
  - Automatische Validierung vor jeder SQL-Ausführung
  - Integration in MCP-Integration (`lib/ai/bots/mcp-integration.ts`)
  - CI/CD-Validierung: `scripts/cicd/validate-sql-files.mjs`
  - Dokumentation in `AAAPlanung/planung.txt`

- **Mitarbeiter-Profile und Bearbeiter-Tracking**
  - SQL-Migrationen 031-034:
    - `031_fix_dsgvo_company_separation.sql` - DSGVO-konforme Unternehmenstrennung
    - `032_employee_documents.sql` - Mitarbeiter-Dokumenten-System
    - `033_add_created_updated_by.sql` - Bearbeiter-Tracking (created_by/updated_by)
    - `034_extend_profiles_schema.sql` - Erweiterte Profile-Felder für Team-Mitglieder
  - `components/settings/EmployeeDetailsDialog.tsx` - Mitarbeiter-Details-Dialog
  - `components/settings/EditEmployeeDialog.tsx` - Mitarbeiter-Bearbeitungs-Dialog
  - `components/finanzen/QuoteDetailsDialog.tsx` - Angebots-Details mit Bearbeiter-Tracking
  - `created_by`/`updated_by` in allen Create/Edit-Dialogen implementiert

- **Design-Guidelines**
  - `lib/design-system/DESIGN_GUIDELINES.md` - Verbindliche Design-Vorgaben
  - Design-Token-Regeln (keine hardcoded Farben)
  - Border-Radius-Standards (rounded-xl, rounded-2xl)
  - Spacing-Vorgaben (gap-5 als Standard)
  - CI/CD-Validierung: `scripts/cicd/auto-design-validator.mjs`

### Fixed
- **Design-Konsistenz-Fixes**
  - `rounded-lg` zu `rounded-xl` in TeamManagement
  - Design-Validierung strikt gemacht
  - Hardcoded Farben durch Design-Tokens ersetzt

- **Dead Code und TypeScript-Fixes**
  - Redundante null-checks entfernt
  - Mapping DB subscription_plan zu Code tier korrigiert

### Updated
- Pre-Commit Hook erweitert um SQL-Validierung
- MCP-Integration abgesichert mit SQL-Validierung
- Dokumentation in `AAAPlanung/planung.txt` aktualisiert

---

## [2.3.0] - 25.11.2025

### Fixed
- **Legal-Seiten (Impressum, Datenschutz, AGB) v0-Cache-Problem behoben**
  - Logo-URL auf direkte Blob-URL geändert
  - Company-Daten auf korrekte Pflichtenheft-Werte aktualisiert:
    - Inhaber: Ibrahim SIMSEK
    - Adresse: Ensbachmuehle 4, D-94571 Schaufling
    - Telefon: +49 170 8004423
  - Gerichtsstand in AGB auf Deggendorf geändert

### Added
- **Pflichtenheft-Dokumentation im Wiki**
  - `wiki/docs/pflichtenheft/master-anforderungen.md`
  - `wiki/docs/pflichtenheft/lastenheft-starter.md`
  - `wiki/docs/pflichtenheft/lastenheft-business.md`
  - `wiki/docs/pflichtenheft/lastenheft-portale.md`
  - `wiki/docs/pflichtenheft/lastenheft-formulare.md`
  - `wiki/docs/pflichtenheft/qa-checkliste.md`
  - `wiki/docs/pflichtenheft/fehlende-funktionen.md`

### Updated
- Go-Live-Report auf v2.3.0
- Wiki-Dokumentation vollständig aktualisiert

---

## [2.2.0] - 25.11.2025

### Added
- **Zentrale Unternehmensdaten** (`lib/company-data.ts`)
  - Domain: my-dispatch.de
  - Alle Firmendaten, Kontaktdaten, Tarifinformationen
  - Verwendung in allen Legal-Seiten

- **Dashboard-Preview im Hero**
  - Browser-Mockup mit MyDispatch Dashboard
  - Zeigt aktuelle Buchungen, Flottenübersicht, Stats
  - Glow-Effekt und moderne UI

### Fixed
- **Legal-Seiten (Impressum, Datenschutz, AGB)**
  - Alle verwenden jetzt natives `<img>` statt `next/image`
  - Import der Unternehmensdaten aus `lib/company-data.ts`
  - Kein "Failed to load lucide-react" mehr

- **MyDispatch-Logo überall eingebunden**
  - Header und Footer aller Pre-Login-Seiten
  - Verwendet Blob-URL direkt für v0-Kompatibilität

### Changed
- **Homepage komplett überarbeitet**
  - Hero mit Dashboard-Preview (MyDispatch in Aktion)
  - FAQs-Sektion statt "Das sagen unsere Kunden"
  - Korrekte Umlaute (ü, ä, ö) überall

---

## [2.1.0] - 25.11.2025

### Added
- **PWA-Unterstützung (Progressive Web App)**
  - `public/manifest.json` - Web App Manifest mit Icons und Shortcuts
  - `public/sw.js` - Service Worker für Offline-Funktionalität
  - `public/offline.html` - Offline-Fallback-Seite
  - `components/pwa/InstallPrompt.tsx` - Install-Banner für iOS und Android
  - `components/pwa/ServiceWorkerRegistration.tsx` - SW-Registrierung

### Changed
- **Rechtsseiten als Standalone-Seiten**
  - `app/impressum/page.tsx` - Komplett standalone ohne externe Imports
  - `app/datenschutz/page.tsx` - Komplett standalone ohne externe Imports
  - `app/agb/page.tsx` - Komplett standalone + §6 Testphase entfernt

### Fixed
- **AGB §6 "Testphase" entfernt** - Es gibt KEINE kostenlose Testphase
- **Layout mit PWA-Meta-Tags** - viewport, theme-color, apple-web-app

### Updated
- **app/layout.tsx** - PWA-Meta-Tags, SEO-Optimierung, Splash-Screens

---

## [2.0.0] - 25.11.2025

### Added
- **Split-Screen Auth-Seiten**
  - Login-Seite mit Branding links, Formular rechts
  - Sign-Up-Seite mit 4-Schritt-Stepper

### Changed
- **Homepage "Das sagen unsere Kunden" zu "FAQs"** - Keine Referenzen bis auf Weiteres
- **MyDispatch-Logo überall eingebunden**

### Fixed
- **KEINE kostenlose Testphase** - Alle Erwähnungen entfernt

---

## [1.9.0] - 25.11.2025

### Added
- **Kurzbefehl-Protokoll** (`wiki/qa/kurzbefehl-protokoll.md`)
  - Vollständiges 7-Phasen-Verhaltensprotokoll für AI-Assistenten
  - Verbindliche Ausführungsschritte bei Kurzbefehl-Eingabe
  - Gap-Analyse-Template mit Prioritäten
  - Akzeptanzkriterien-Checkliste
  - Pflichtartefakte-Liste nach Durchlauf

### Changed
- **prompt.md** auf v1.9.0 aktualisiert
  - Kurzbefehl prominent an erster Stelle platziert
  - Link zu vollständigem Protokoll hinzugefügt
  - Inhaltsverzeichnis um Kurzbefehl-Protokoll erweitert

### Documented
- Kurzbefehl `Lade prompt.md und stelle den vollständigen SOLL-Zustand her.` vollständig dokumentiert
- Alternative Kurzformen: `Lade prompt.md`, `SOLL-Zustand herstellen`, `QA-Durchlauf starten`

---

## [1.8.0] - 25.11.2025

### Added
- **Go-Live Report** - Vollständiger Deployment-Report unter `wiki/docs/golive-report.md`
  - Systemstatus-Übersicht
  - QA-Metriken
  - Rechts-Checkliste
  - Deployment-Checkliste
  - Freigabeempfehlung

### Fixed
- **Legal-Seiten auf SimpleMarketingLayout konvertiert**
  - `app/impressum/page.tsx` - Verwendet jetzt SimpleMarketingLayout
  - `app/datenschutz/page.tsx` - Verwendet jetzt SimpleMarketingLayout
  - `app/agb/page.tsx` - Verwendet jetzt SimpleMarketingLayout

### Changed
- **Impressum aktualisiert** - Korrekte Firmendaten (RideHub Solutions UG)
- **Datenschutz aktualisiert** - DSGVO-konforme Struktur
- **AGB aktualisiert** - Aktuelle Tarifstruktur und Vertragsbedingungen

### Documented
- **ERR-009** - v0 Build-Cache Global Loading Problem dokumentiert
- **Wiki-Dokumentation** auf Version 1.8.0 aktualisiert

---

## [1.7.0] - 25.11.2025

### Added
- **Master Admin Account** - Dauerhafter Admin mit Vollzugriff
- **QA-Dokumentation** - Vollständige Qualitätssicherungs-Prompts
- **SQL-Script** - `scripts/012_create_master_admin.sql`

---

## [1.6.0] - 25.11.2025

### Added
- **Hugging Face Integration** - Sentiment-Analyse, Klassifizierung, Speech-to-Text

---

## [1.5.0] - 25.11.2025

### Added
- **AI Integration** - OpenAI, Anthropic Chatbots für alle Bereiche

---

## [1.4.0] - 25.11.2025

### Added
- **Google Maps Integration** - AddressAutocomplete, FleetMap, WeatherWidget

---

## [1.3.0] - 25.11.2025

### Added
- **Pre-Login Route-Gruppe** - Standalone Seiten

---

## [1.2.0] - 25.11.2025

### Fixed
- **18 shadcn/ui Komponenten** - lucide-react durch Inline-SVGs ersetzt

---

## [1.1.0] - 25.11.2025

### Fixed
- **Supabase Clients** - Dynamische Imports

---

## [1.0.0] - 25.11.2025

### Added
- Vollständiges Wiki-System in Supabase
