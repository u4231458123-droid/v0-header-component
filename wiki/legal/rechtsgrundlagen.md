# Rechtsgrundlagen

## Übersicht

MyDispatch muss folgende rechtliche Anforderungen erfüllen:

## 1. DSGVO (Datenschutz-Grundverordnung)

### Anforderungen
- Datenschutzerklärung auf der Website
- Cookie-Banner mit granularer Einwilligung
- Recht auf Auskunft, Löschung, Übertragbarkeit
- Auftragsverarbeitungsvertrag mit Supabase

### Implementierung
- `/datenschutz` - Vollständige Datenschutzerklärung
- `V28CookieConsent` - DSGVO-konformer Cookie-Banner
- Supabase: EU-Region für Datenhaltung

## 2. TMG (Telemediengesetz)

### Anforderungen
- Impressum mit vollständigen Angaben
- Leicht erreichbar von jeder Seite

### Implementierung
- `/impressum` mit allen Pflichtangaben
- Footer-Link auf allen Seiten

## 3. PBefG (Personenbeförderungsgesetz)

### Anforderungen
- Dokumentation der Fahrten
- Aufbewahrungspflichten
- Fahrerlaubnisnachweis

### Implementierung
- Fahrten werden in `bookings` Tabelle gespeichert
- Fahrer-Dokumente in `drivers` Tabelle
- Führerschein-Ablaufdatum wird geprüft

## 4. GoBD (Grundsätze ordnungsmäßiger Buchführung)

### Anforderungen
- Unveränderlichkeit der Rechnungen
- Nachvollziehbarkeit
- 10 Jahre Aufbewahrung

### Implementierung
- Rechnungen werden nicht gelöscht
- Audit-Trail via `created_at`, `updated_at`
- Supabase Backup-Retention

## 5. Stripe-Compliance

### PCI DSS
- Stripe übernimmt Kartenverarbeitung
- Keine Kartendaten auf unseren Servern

### SCA (Strong Customer Authentication)
- Stripe Checkout unterstützt 3D Secure
- Automatische Compliance durch Stripe

## Dokumente

### Vorlagen
- `/wiki/legal/rechtstexte-template.md` - AGB-Vorlage
- `/impressum` - Impressum
- `/datenschutz` - Datenschutzerklärung
- `/agb` - AGB

### Zu prüfen vor Go-Live
- [ ] Impressum mit korrekten Angaben
- [ ] Datenschutzerklärung vollständig
- [ ] AGB vollständig
- [ ] Cookie-Banner funktioniert
- [ ] Stripe Webhooks konfiguriert
