# Seiten-Struktur

## Pre-Login Seiten (Marketing)

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/` | HomePage | Landing Page |
| `/pricing` | PricingPage | Tarifübersicht |
| `/faq` | FAQPage | Häufige Fragen |
| `/contact` | ContactPage | Kontaktformular |

## Auth-Seiten

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/auth/login` | LoginPage | Anmeldung |
| `/auth/sign-up` | SignUpPage | Registrierung (4-Step Wizard) |
| `/auth/sign-up-success` | SuccessPage | Bestätigung |
| `/auth/forgot-password` | ForgotPasswordPage | Passwort zurücksetzen |

## Dashboard (Post-Login)

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/dashboard` | DashboardPage | Übersicht |
| `/dashboard/rides` | RidesPage | Fahrtenverwaltung |
| `/dashboard/customers` | CustomersPage | Kundenverwaltung |
| `/dashboard/vehicles` | VehiclesPage | Fahrzeuge |
| `/dashboard/drivers` | DriversPage | Fahrer |
| `/dashboard/invoices` | InvoicesPage | Rechnungen |

## Rechtliches

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/impressum` | ImpressumPage | Impressum |
| `/datenschutz` | DatenschutzPage | Datenschutz |
| `/agb` | AGBPage | AGB |
