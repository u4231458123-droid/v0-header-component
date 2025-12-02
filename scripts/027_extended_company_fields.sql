-- ============================================================================
-- MyDispatch: Erweiterte Unternehmensfelder
-- Datum: 2025-01-26
-- ============================================================================

-- Neue Spalten fuer companies Tabelle
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip VARCHAR(5);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_salutation VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_first_name VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_last_name VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gewerbeanmeldung_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS briefpapier_url TEXT;

-- Kommentare fuer Dokumentation
COMMENT ON COLUMN companies.mobile IS 'Mobiltelefon (max. 20 Zeichen)';
COMMENT ON COLUMN companies.zip IS 'Postleitzahl (5-stellig)';
COMMENT ON COLUMN companies.city IS 'Ort/Stadt';
COMMENT ON COLUMN companies.owner_salutation IS 'Anrede des Inhabers (Herr/Frau/Divers)';
COMMENT ON COLUMN companies.owner_first_name IS 'Vorname des Inhabers';
COMMENT ON COLUMN companies.owner_last_name IS 'Nachname des Inhabers (Grossbuchstaben)';
COMMENT ON COLUMN companies.gewerbeanmeldung_url IS 'URL zur Gewerbeanmeldung (PDF/JPG)';
COMMENT ON COLUMN companies.briefpapier_url IS 'URL zum Briefpapier-Vordruck (PDF/JPG)';
