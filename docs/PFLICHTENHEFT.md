# MyDispatch - Pflichtenheft

## Version 1.0.0 | Stand: 24.11.2025

---

## 1. Projektübersicht

### 1.1 Projektziel
MyDispatch ist eine cloud-basierte SaaS-Dispositionssoftware für Taxi-, Mietwagen- und Chauffeurunternehmen. Die Plattform ermöglicht die vollständige digitale Verwaltung von Buchungen, Fahrern, Fahrzeugen, Kunden und Rechnungen.

### 1.2 Zielgruppe
- Taxiunternehmen (Einzelunternehmer bis Zentralen)
- Mietwagenunternehmen
- Chauffeurservices
- Fahrdienste und Shuttle-Betreiber

### 1.3 Technologie-Stack
| Bereich | Technologie |
|---------|-------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Datenbank | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe (Subscriptions) |
| Hosting | Vercel |

---

## 2. Systemarchitektur

### 2.1 Datenbank-Schema
\`\`\`
profiles (id, company_id, email, full_name, role, phone, avatar_url)
companies (id, name, email, subscription_tier, stripe_customer_id, ...)
drivers (id, company_id, first_name, last_name, email, phone, status, ...)
vehicles (id, company_id, license_plate, make, model, status, ...)
customers (id, company_id, first_name, last_name, email, phone, address, ...)
bookings (id, company_id, customer_id, driver_id, status, pickup_time, ...)
invoices (id, company_id, customer_id, booking_id, amount, status, ...)
\`\`\`

### 2.2 Row Level Security (RLS)
Alle Tabellen sind mit RLS geschützt:
- Benutzer sehen nur Daten ihrer eigenen Firma
- Master-Admin hat vollen Zugriff
- Öffentliche Landingpages sind für alle lesbar

---

## 3. Funktionsumfang

### 3.1 Pre-Login Bereich
| Seite | Route | Status |
|-------|-------|--------|
| Homepage | / | Fertig |
| Preise | /pricing | Fertig |
| FAQ | /faq | Fertig |
| Dokumentation | /docs | Fertig |
| Kontakt | /contact | Fertig |
| Impressum | /impressum | Fertig |
| Datenschutz | /datenschutz | Fertig |
| AGB | /agb | Fertig |
| Login | /auth/login | Fertig |
| Registrierung | /auth/sign-up | Fertig |

### 3.2 Unternehmerportal (Dashboard)
| Funktion | Route | Status |
|----------|-------|--------|
| Dashboard | /dashboard | Fertig |
| Buchungen | /auftraege | Fertig |
| Fahrer | /fahrer | Fertig |
| Kunden | /kunden | Fertig |
| Rechnungen | /rechnungen | Fertig |
| Einstellungen | /einstellungen | Fertig |

### 3.3 Fahrerportal
| Funktion | Route | Status |
|----------|-------|--------|
| Dashboard | /fahrer-portal | Fertig |
| Dokumente | /fahrer-portal/dokumente | Fertig |
| Schicht starten/beenden | - | Fertig |
| Fahrten annehmen/ablehnen | - | Fertig |

### 3.4 Kundenportal
| Funktion | Route | Status |
|----------|-------|--------|
| Dashboard | /kunden-portal | Fertig |
| Registrierung | /kunden-portal/registrieren | Fertig |

### 3.5 Tenant-Landingpages
| Funktion | Route | Status |
|----------|-------|--------|
| Dynamische Landingpage | /[slug] | Fertig |
| Buchungswidget (Business+) | - | Fertig |
| Kundenregistrierung (Starter) | - | Fertig |

---

## 4. Tarifstruktur

### 4.1 Tarife
| Tarif | Monatlich | Jährlich (-20%) | Limits |
|-------|-----------|-----------------|--------|
| Starter | 39€ | 31,20€ | 3 Fahrer, 3 Fahrzeuge |
| Business | 99€ | 79,20€ | Unbegrenzt |
| Enterprise | Individuell | Individuell | Unbegrenzt |

### 4.2 Add-Ons
| Add-On | Preis | Beschreibung |
|--------|-------|--------------|
| Fleet & Driver | 9€/Monat | +1 Fahrer + 1 Fahrzeug (nur Starter) |

### 4.3 Feature-Matrix
| Feature | Starter | Business | Enterprise |
|---------|---------|----------|------------|
| Buchungsverwaltung | Ja | Ja | Ja |
| Kundenverwaltung | Ja | Ja | Ja |
| Fahrerverwaltung | Bis 5 | Bis 20 | Unbegrenzt |
| Fahrzeugverwaltung | Bis 5 | Bis 20 | Unbegrenzt |
| Landingpage | Ja | Ja | Ja |
| Buchungswidget | Nein | Ja | Ja |
| API-Zugang | Nein | Ja | Ja |
| Custom Branding | Nein | Ja | Ja |
| White-Label | Nein | Nein | Ja |

---

## 5. Sicherheit & Compliance

### 5.1 Datenschutz (DSGVO)
- Cookie-Banner mit granularer Einwilligung
- Vollständige Datenschutzerklärung
- Impressum mit allen Pflichtangaben
- Nutzungsbedingungen

### 5.2 Technische Sicherheit
- Row Level Security (RLS) auf allen Tabellen
- Verschlüsselte Datenübertragung (HTTPS)
- Sichere Session-Verwaltung
- Input-Validierung

### 5.3 Branchenspezifisch
- GoBD-konforme Rechnungserstellung
- PBefG-relevante Datenfelder
- TSE-Vorbereitung (Business+)

---

## 6. Bekannte Einschränkungen

### 6.1 v0-Build-Umgebung
Die folgenden Fehler sind spezifisch für die v0-Build-Umgebung und treten bei normalem npm-Build NICHT auf:

| Paket | Beschreibung |
|-------|--------------|
| @supabase/ssr | NPM-Paket kann nicht über Blob-URLs geladen werden |
| lucide-react | NPM-Paket kann nicht über Blob-URLs geladen werden |

**Lösung:** Projekt exportieren und lokal oder auf Vercel deployen.

---

## 7. Deployment-Anleitung

### 7.1 Voraussetzungen
- Node.js 18+
- npm oder yarn
- Supabase-Projekt
- Stripe-Account

### 7.2 Installation
\`\`\`bash
# Repository klonen
git clone [repo-url]
cd mydispatch

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen setzen
cp .env.example .env.local
# Variablen ausfüllen

# RLS-Policies anwenden
# Supabase SQL Editor: scripts/010_fix_rls_infinite_recursion.sql

# Build testen
npm run build

# Starten
npm run dev
\`\`\`

### 7.3 Vercel Deployment
1. Repository mit GitHub verbinden
2. Projekt auf Vercel importieren
3. Umgebungsvariablen in Vercel setzen
4. Supabase Integration aktivieren
5. Stripe Integration aktivieren
6. Deploy

---

## 8. Wartung & Support

### 8.1 Ansprechpartner
- Technischer Support: support@my-dispatch.de
- NeXify IT-Service: nexify@my-dispatch.de

### 8.2 Versionierung
Dieses Dokument wird bei jeder Release aktualisiert.

---

**Dokumentversion:** 1.0.0  
**Erstellt:** 24.11.2025  
**Autor:** v0 AI  
**Status:** Go-Live-Ready
