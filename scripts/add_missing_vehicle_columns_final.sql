-- =====================================================
-- MIGRATION: Fehlende Vehicle-Spalten hinzufuegen
-- Datum: 29.11.2024
-- Beschreibung: Fuegt alle fehlenden Spalten zur vehicles-Tabelle hinzu
-- =====================================================

-- 1. Konzessionsnummer
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS concession_number text;

-- 2. Konzession Ablaufdatum
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS concession_due_date date;

-- 3. Fahrzeugschein URL
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS fahrzeugschein_url text;

-- 4. Konzessionsauszug URL
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS konzessionsauszug_url text;

COMMENT ON COLUMN public.vehicles.concession_number IS 'Konzessionsnummer (Taxi/Mietwagen)';
COMMENT ON COLUMN public.vehicles.concession_due_date IS 'Ablaufdatum der Konzession';
COMMENT ON COLUMN public.vehicles.fahrzeugschein_url IS 'URL zum Fahrzeugschein-Dokument';
COMMENT ON COLUMN public.vehicles.konzessionsauszug_url IS 'URL zum Konzessionsauszug-Dokument';
