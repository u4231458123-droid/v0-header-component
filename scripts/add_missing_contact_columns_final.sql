-- =====================================================
-- MIGRATION: Fehlende Contact-Request-Spalten hinzufuegen
-- Datum: 29.11.2024
-- Beschreibung: Fuegt alle fehlenden Spalten zur contact_requests-Tabelle hinzu
-- =====================================================

-- 1. Firmenname
ALTER TABLE public.contact_requests
ADD COLUMN IF NOT EXISTS company text;

-- 2. Telefonnummer
ALTER TABLE public.contact_requests
ADD COLUMN IF NOT EXISTS phone text;

-- 3. Anfrage-Typ
ALTER TABLE public.contact_requests
ADD COLUMN IF NOT EXISTS type text DEFAULT 'general';

COMMENT ON COLUMN public.contact_requests.company IS 'Firmenname des Anfragenden';
COMMENT ON COLUMN public.contact_requests.phone IS 'Telefonnummer des Anfragenden';
COMMENT ON COLUMN public.contact_requests.type IS 'Anfrage-Typ: general, demo, support, partnership';
