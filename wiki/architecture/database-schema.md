# Datenbank-Schema

## Übersicht

MyDispatch verwendet Supabase (PostgreSQL) mit Row Level Security (RLS).

## Tabellen

### profiles
Benutzerprofile, verknüpft mit Supabase Auth.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel (= auth.uid) |
| company_id | UUID | FK zu companies |
| email | TEXT | E-Mail-Adresse |
| full_name | TEXT | Vollständiger Name |
| role | TEXT | Rolle (admin, dispatcher, driver) |
| phone | TEXT | Telefonnummer |
| avatar_url | TEXT | Profilbild-URL |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

### companies
Firmendaten und Subscription-Informationen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| name | TEXT | Firmenname |
| email | TEXT | Firmen-E-Mail |
| phone | TEXT | Telefon |
| address | TEXT | Adresse |
| company_slug | TEXT | URL-Slug für Landingpage |
| subscription_tier | TEXT | starter, business, enterprise |
| subscription_status | TEXT | active, trialing, past_due |
| stripe_customer_id | TEXT | Stripe Customer ID |
| stripe_subscription_id | TEXT | Stripe Subscription ID |
| driver_limit | INTEGER | Max. Fahrer |
| vehicle_limit | INTEGER | Max. Fahrzeuge |
| landingpage_enabled | BOOLEAN | Landingpage aktiv |
| widget_enabled | BOOLEAN | Buchungswidget aktiv |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

### drivers
Fahrerdaten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| company_id | UUID | FK zu companies |
| user_id | UUID | FK zu auth.users (optional) |
| first_name | TEXT | Vorname |
| last_name | TEXT | Nachname |
| email | TEXT | E-Mail |
| phone | TEXT | Telefon |
| license_number | TEXT | Führerscheinnummer |
| license_expiry | DATE | Führerschein-Ablauf |
| status | TEXT | active, inactive, on_trip |
| current_location | POINT | GPS-Position |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

### vehicles
Fahrzeugdaten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| company_id | UUID | FK zu companies |
| license_plate | TEXT | Kennzeichen |
| make | TEXT | Hersteller |
| model | TEXT | Modell |
| year | INTEGER | Baujahr |
| color | TEXT | Farbe |
| seats | INTEGER | Sitzplätze |
| status | TEXT | available, in_use, maintenance |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

### customers
Kundendaten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| company_id | UUID | FK zu companies |
| user_id | UUID | FK zu auth.users (optional) |
| first_name | TEXT | Vorname |
| last_name | TEXT | Nachname |
| email | TEXT | E-Mail |
| phone | TEXT | Telefon |
| address | TEXT | Adresse |
| customer_number | TEXT | Kundennummer |
| notes | TEXT | Notizen |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

### bookings
Buchungen/Fahrten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| company_id | UUID | FK zu companies |
| customer_id | UUID | FK zu customers |
| driver_id | UUID | FK zu drivers |
| vehicle_id | UUID | FK zu vehicles |
| status | TEXT | pending, accepted, in_progress, completed, cancelled |
| pickup_time | TIMESTAMP | Abholzeit |
| pickup_address | TEXT | Abholadresse |
| pickup_location | POINT | GPS-Koordinaten |
| dropoff_address | TEXT | Zieladresse |
| dropoff_location | POINT | GPS-Koordinaten |
| passengers | INTEGER | Anzahl Passagiere |
| price | NUMERIC | Preis |
| payment_status | TEXT | pending, paid |
| payment_method | TEXT | cash, card, invoice |
| notes | TEXT | Notizen |
| completed_at | TIMESTAMP | Abschlusszeit |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

### invoices
Rechnungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| company_id | UUID | FK zu companies |
| customer_id | UUID | FK zu customers |
| booking_id | UUID | FK zu bookings |
| invoice_number | TEXT | Rechnungsnummer |
| amount | NUMERIC | Nettobetrag |
| tax_amount | NUMERIC | MwSt. |
| total_amount | NUMERIC | Bruttobetrag |
| status | TEXT | draft, sent, paid, overdue |
| due_date | DATE | Fälligkeitsdatum |
| paid_date | DATE | Zahldatum |
| created_at | TIMESTAMP | Erstelldatum |
| updated_at | TIMESTAMP | Änderungsdatum |

## RLS Policies

Alle Tabellen sind mit Row Level Security geschützt:

\`\`\`sql
-- Beispiel: Benutzer sehen nur Daten ihrer Firma
CREATE POLICY "Users can view their company data" ON bookings
FOR SELECT USING (
  company_id = get_my_company_id()
);

-- Master-Admin hat vollen Zugriff
CREATE POLICY "Master admins have full access" ON bookings
FOR ALL USING (
  is_master_admin()
);
\`\`\`

## ERD (Entity Relationship Diagram)

\`\`\`
profiles ────────────┐
                     │
companies ◄──────────┼──────────────────────┐
    │                │                       │
    ├── drivers ─────┤                       │
    │                │                       │
    ├── vehicles ────┤                       │
    │                │                       │
    ├── customers ───┼── bookings ───── invoices
    │                │
    └── wiki_* ──────┘
