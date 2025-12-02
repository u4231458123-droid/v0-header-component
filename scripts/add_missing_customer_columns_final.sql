-- =====================================================
-- MIGRATION: Fehlende Customer-Spalten hinzufuegen
-- Datum: 29.11.2024
-- Beschreibung: Fuegt alle fehlenden Spalten zur customers-Tabelle hinzu
-- =====================================================

-- 1. Mobilnummer
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS mobile text;

-- 2. Firmenname
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS company_name text;

-- 3. Adresstyp (privat/geschaeftlich)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS address_type text DEFAULT 'private';

-- 4. Status (active/inactive)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 5. Ansprechpartner (fuer Firmenkunden)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS contact_person text;

-- 6. Geschaeftsadresse
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS business_address text;

-- 7. Geschaefts-PLZ
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS business_postal_code text;

-- 8. Geschaefts-Ort
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS business_city text;

COMMENT ON COLUMN public.customers.mobile IS 'Mobiltelefonnummer des Kunden';
COMMENT ON COLUMN public.customers.company_name IS 'Firmenname (nur bei Geschaeftskunden)';
COMMENT ON COLUMN public.customers.address_type IS 'Adresstyp: private oder business';
COMMENT ON COLUMN public.customers.status IS 'Kundenstatus: active, inactive, blocked';
COMMENT ON COLUMN public.customers.contact_person IS 'Ansprechpartner bei Firmenkunden';
COMMENT ON COLUMN public.customers.business_address IS 'Geschaeftsadresse';
COMMENT ON COLUMN public.customers.business_postal_code IS 'PLZ der Geschaeftsadresse';
COMMENT ON COLUMN public.customers.business_city IS 'Ort der Geschaeftsadresse';
