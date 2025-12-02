-- =============================================================================
-- MyDispatch: Erweiterte Fahrer-Tabelle
-- Datum: 2025-01-26
-- =============================================================================

-- Erweitere drivers Tabelle mit allen Feldern aus PDF-Vorgaben
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS salutation VARCHAR(10);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(5);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_classes TEXT[]; -- Array der Fuehrerscheinklassen
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_issued DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_file_url TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS p_schein_number VARCHAR(10);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS p_schein_issued DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS p_schein_expiry DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS p_schein_file_url TEXT;

-- Kommentare fuer Dokumentation
COMMENT ON COLUMN drivers.salutation IS 'Anrede: Herr/Frau/Divers';
COMMENT ON COLUMN drivers.mobile IS 'Mobilnummer (max. 20 Zeichen)';
COMMENT ON COLUMN drivers.address IS 'Strasse und Hausnummer';
COMMENT ON COLUMN drivers.postal_code IS 'Postleitzahl (5-stellig)';
COMMENT ON COLUMN drivers.city IS 'Ort';
COMMENT ON COLUMN drivers.license_classes IS 'Fuehrerscheinklassen als Array (AM, A1, A2, A, B, BE, B96, C1, C1E, C, CE, D1, D1E, D, DE, L, T)';
COMMENT ON COLUMN drivers.license_issued IS 'Fuehrerschein Erteilungsdatum';
COMMENT ON COLUMN drivers.license_file_url IS 'URL zum Fuehrerschein-Scan (PDF/JPG)';
COMMENT ON COLUMN drivers.p_schein_number IS 'P-Schein Nummer (max. 10 Zeichen)';
COMMENT ON COLUMN drivers.p_schein_issued IS 'P-Schein Erteilungsdatum';
COMMENT ON COLUMN drivers.p_schein_expiry IS 'P-Schein Ablaufdatum';
COMMENT ON COLUMN drivers.p_schein_file_url IS 'URL zum P-Schein-Scan (PDF/JPG)';

-- Index fuer P-Schein Ablauf (wichtig fuer Erinnerungen)
CREATE INDEX IF NOT EXISTS idx_drivers_p_schein_expiry ON drivers(p_schein_expiry) WHERE p_schein_expiry IS NOT NULL;

-- Storage Bucket fuer Dokumente erstellen (falls nicht vorhanden)
-- Hinweis: Dies muss ueber Supabase Dashboard oder API erfolgen
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;
