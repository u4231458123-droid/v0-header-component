-- Migration: Füge fehlende Spalten hinzu für vollständige Formular-Unterstützung
-- Timestamp: 2025-11-29

-- ============================================
-- CUSTOMERS TABELLE - Erweiterte Felder
-- ============================================
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS address_type text DEFAULT 'private';

-- ============================================
-- VEHICLES TABELLE - Konzession und Dokumente
-- ============================================
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS concession_number text,
ADD COLUMN IF NOT EXISTS concession_due_date date,
ADD COLUMN IF NOT EXISTS fahrzeugschein_url text,
ADD COLUMN IF NOT EXISTS konzessionsauszug_url text;

-- ============================================
-- VEHICLE_INSURANCE TABELLE - Erweiterte Versicherungsdaten
-- ============================================
ALTER TABLE vehicle_insurance
ADD COLUMN IF NOT EXISTS sf_class_liability text,
ADD COLUMN IF NOT EXISTS sf_class_kasko text,
ADD COLUMN IF NOT EXISTS deductible_partial integer,
ADD COLUMN IF NOT EXISTS deductible_full integer;

-- ============================================
-- CONTACT_REQUESTS TABELLE - Erweiterte Kontaktdaten
-- ============================================
ALTER TABLE contact_requests
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'general';

-- ============================================
-- Kommentare für Dokumentation
-- ============================================
COMMENT ON COLUMN customers.status IS 'Kundenstatus: active, inactive, blocked';
COMMENT ON COLUMN customers.mobile IS 'Mobiltelefonnummer';
COMMENT ON COLUMN customers.company_name IS 'Firmenname bei Geschäftskunden';
COMMENT ON COLUMN customers.address_type IS 'Adresstyp: private, business';

COMMENT ON COLUMN vehicles.concession_number IS 'Konzessionsnummer';
COMMENT ON COLUMN vehicles.concession_due_date IS 'Konzession gültig bis';
COMMENT ON COLUMN vehicles.fahrzeugschein_url IS 'URL zum Fahrzeugschein-Dokument';
COMMENT ON COLUMN vehicles.konzessionsauszug_url IS 'URL zum Konzessionsauszug-Dokument';

COMMENT ON COLUMN vehicle_insurance.sf_class_liability IS 'SF-Klasse Haftpflicht';
COMMENT ON COLUMN vehicle_insurance.sf_class_kasko IS 'SF-Klasse Kasko';
COMMENT ON COLUMN vehicle_insurance.deductible_partial IS 'Selbstbeteiligung Teilkasko in Euro';
COMMENT ON COLUMN vehicle_insurance.deductible_full IS 'Selbstbeteiligung Vollkasko in Euro';

COMMENT ON COLUMN contact_requests.company IS 'Firmenname des Absenders';
COMMENT ON COLUMN contact_requests.phone IS 'Telefonnummer des Absenders';
COMMENT ON COLUMN contact_requests.type IS 'Anfragetyp: general, demo, support, partnership';
