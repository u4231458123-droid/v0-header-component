# System-Übersicht

## MyDispatch - Cloud-basierte Dispositionssoftware

### Projektziel
MyDispatch ist eine cloud-basierte SaaS-Dispositionssoftware für Taxi-, Mietwagen- und Chauffeurunternehmen. Die Plattform ermöglicht die vollständige digitale Verwaltung von Buchungen, Fahrern, Fahrzeugen, Kunden und Rechnungen.

### Zielgruppe
- Taxiunternehmen (Einzelunternehmer bis Zentralen)
- Mietwagenunternehmen
- Chauffeurservices
- Fahrdienste und Shuttle-Betreiber

### Technologie-Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Datenbank | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Cookie-basiert, @supabase/ssr) |
| Payments | Stripe (Subscriptions) |
| Hosting | Vercel |

### Systemkomponenten

1. **Pre-Login Bereich**
   - Homepage, Pricing, FAQ, Docs
   - Registrierung mit Stripe Checkout
   - Login mit Cookie-Session

2. **Unternehmerportal**
   - Dashboard mit Übersicht
   - Buchungsverwaltung
   - Fahrer- und Fahrzeugverwaltung
   - Kundenverwaltung
   - Rechnungswesen
   - Einstellungen

3. **Fahrerportal**
   - Schichtverwaltung
   - Fahrtenübersicht
   - Dokumentenverwaltung

4. **Kundenportal**
   - Buchungsübersicht
   - Profilmanagement

5. **Tenant-Landingpages**
   - Dynamische Unternehmensseiten
   - Buchungswidget (Business+)
   - Kundenregistrierung

### Sicherheitsarchitektur

- **Row Level Security (RLS)** auf allen Tabellen
- **Cookie-basierte Sessions** mit automatischem Token-Refresh
- **HTTPS-verschlüsselte** Datenübertragung
- **DSGVO-konform** mit Cookie-Banner und Datenschutz

### Deployment

- **Vercel** für Frontend und Serverless Functions
- **Supabase** für Datenbank und Auth
- **Stripe** für Payments
- **Automatische Deployments** via GitHub Integration
