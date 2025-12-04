-- =============================================================================
-- MIGRATION 034: Erweiterte Profile-Felder für Team-Mitglieder
-- =============================================================================
-- Datum: 2025-12-04
-- Beschreibung: Erweitert die profiles Tabelle um zusätzliche Felder
--               analog zu drivers (Anrede, Adresse, Geburtsdatum, etc.)
-- =============================================================================

-- =============================================================================
-- STEP 1: Erweiterte persönliche Daten
-- =============================================================================

-- Anrede (Herr/Frau/Divers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salutation TEXT CHECK (salutation IN ('Herr', 'Frau', 'Divers'));

-- Titel (Dr., Prof., etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;

-- Geburtsdatum
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Nationalität
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'deutsch';

-- =============================================================================
-- STEP 2: Adressdaten (strukturiert als JSONB)
-- =============================================================================

-- Adresse strukturiert (analog zu drivers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_data JSONB DEFAULT '{
  "street": "",
  "house_number": "",
  "postal_code": "",
  "city": "",
  "country": "Deutschland"
}'::jsonb;

-- =============================================================================
-- STEP 3: Kontaktdaten erweitert
-- =============================================================================

-- Mobilnummer (zusätzlich zu phone)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_mobile TEXT;

-- =============================================================================
-- STEP 4: Beschäftigungsdaten (strukturiert als JSONB)
-- =============================================================================

-- Beschäftigungsdaten (analog zu drivers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_data JSONB DEFAULT '{
  "start_date": null,
  "contract_type": "full-time",
  "department": "",
  "position": "",
  "working_hours": null,
  "hourly_rate": null,
  "monthly_salary": null
}'::jsonb;

-- =============================================================================
-- STEP 5: Kommentare für Dokumentation
-- =============================================================================

COMMENT ON COLUMN profiles.salutation IS 'Anrede: Herr/Frau/Divers';
COMMENT ON COLUMN profiles.title IS 'Titel: Dr., Prof., etc.';
COMMENT ON COLUMN profiles.date_of_birth IS 'Geburtsdatum';
COMMENT ON COLUMN profiles.nationality IS 'Nationalität';
COMMENT ON COLUMN profiles.address_data IS 'Strukturierte Adressdaten (street, house_number, postal_code, city, country)';
COMMENT ON COLUMN profiles.phone_mobile IS 'Mobilnummer (zusätzlich zu phone)';
COMMENT ON COLUMN profiles.employment_data IS 'Beschäftigungsdaten (start_date, contract_type, department, position, working_hours, hourly_rate, monthly_salary)';

-- =============================================================================
-- STEP 6: Index für Performance
-- =============================================================================

-- Index auf date_of_birth für Altersabfragen
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- Index auf address_data für Adresssuche (GIN Index für JSONB)
CREATE INDEX IF NOT EXISTS idx_profiles_address_data ON profiles USING GIN (address_data);

-- =============================================================================
-- STEP 7: Verifizierung
-- =============================================================================

-- Prüfe ob alle Spalten korrekt hinzugefügt wurden
DO $$
DECLARE
  salutation_exists BOOLEAN;
  title_exists BOOLEAN;
  date_of_birth_exists BOOLEAN;
  nationality_exists BOOLEAN;
  address_data_exists BOOLEAN;
  phone_mobile_exists BOOLEAN;
  employment_data_exists BOOLEAN;
BEGIN
  -- Prüfe alle neuen Spalten
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'salutation'
  ) INTO salutation_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'title'
  ) INTO title_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) INTO date_of_birth_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'nationality'
  ) INTO nationality_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address_data'
  ) INTO address_data_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_mobile'
  ) INTO phone_mobile_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'employment_data'
  ) INTO employment_data_exists;
  
  -- Ausgabe
  IF salutation_exists AND title_exists AND date_of_birth_exists 
     AND nationality_exists AND address_data_exists 
     AND phone_mobile_exists AND employment_data_exists THEN
    RAISE NOTICE 'Erweiterte Profile-Felder erfolgreich hinzugefügt';
    RAISE NOTICE '  salutation: %, title: %, date_of_birth: %', salutation_exists, title_exists, date_of_birth_exists;
    RAISE NOTICE '  nationality: %, address_data: %, phone_mobile: %', nationality_exists, address_data_exists, phone_mobile_exists;
    RAISE NOTICE '  employment_data: %', employment_data_exists;
  ELSE
    RAISE WARNING 'Einige Spalten fehlen noch!';
  END IF;
END $$;

-- Zeige alle Spalten der profiles Tabelle
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

