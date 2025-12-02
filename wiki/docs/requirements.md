# Anforderungen (Requirements)

## Funktionale Anforderungen

### FA-001: Benutzerregistrierung
- Multi-Step-Registrierung mit Tarif-Auswahl
- Stripe Checkout für kostenpflichtige Tarife
- E-Mail-Verifizierung
- Automatische Firmenerstellung

### FA-002: Authentifizierung
- Login mit E-Mail und Passwort
- Cookie-basierte Session-Verwaltung
- Automatischer Token-Refresh via Middleware
- Logout mit Cookie-Löschung

### FA-003: Buchungsverwaltung
- Erstellen, Bearbeiten, Löschen von Buchungen
- Status-Management (offen, angenommen, abgeschlossen)
- Fahrer- und Fahrzeugzuweisung
- Kundenverknüpfung

### FA-004: Fahrerverwaltung
- Fahrer anlegen und verwalten
- Dokumentenverwaltung (Führerschein, etc.)
- Status-Tracking (aktiv, inaktiv, im Einsatz)
- Limit basierend auf Tarif

### FA-005: Kundenverwaltung
- Kunden anlegen und verwalten
- Kontaktdaten und Adressen
- Buchungshistorie
- Notizen

### FA-006: Rechnungswesen
- Automatische Rechnungserstellung aus Buchungen
- Rechnungsstatus (offen, bezahlt, überfällig)
- Stripe-Integration für Online-Zahlung

### FA-007: Tenant-Landingpages
- Dynamische Unternehmensseiten unter /[slug]
- Buchungswidget für Business+ Tarife
- Kundenregistrierung für Starter Tarif

## Nicht-funktionale Anforderungen

### NFA-001: Performance
- Seitenladezeit < 3 Sekunden
- Time to First Byte < 200ms
- Core Web Vitals optimiert

### NFA-002: Skalierbarkeit
- Unterstützung für 1000+ gleichzeitige Benutzer
- Serverless Architecture für automatische Skalierung

### NFA-003: Sicherheit
- Row Level Security auf allen Tabellen
- HTTPS-Verschlüsselung
- Input-Validierung
- XSS-Schutz

### NFA-004: Verfügbarkeit
- 99.9% Uptime SLA
- Automatische Failover
- Backup-Strategie

### NFA-005: DSGVO-Compliance
- Cookie-Banner mit granularer Einwilligung
- Datenschutzerklärung
- Recht auf Löschung
- Datenexport

## Technische Anforderungen

### TA-001: Browser-Support
- Chrome (letzte 2 Versionen)
- Firefox (letzte 2 Versionen)
- Safari (letzte 2 Versionen)
- Edge (letzte 2 Versionen)

### TA-002: Mobile Support
- Responsive Design
- iOS Safari
- Android Chrome
- PWA-fähig (zukünftig)

### TA-003: Accessibility
- WCAG 2.1 AA Compliance
- Keyboard-Navigation
- Screen Reader Support
- Fokus-Management
