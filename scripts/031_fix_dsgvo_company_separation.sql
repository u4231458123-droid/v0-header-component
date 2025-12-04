-- =============================================================================
-- MIGRATION 031: DSGVO-konforme Unternehmenstrennung
-- =============================================================================
-- Datum: 2025-12-04
-- Problem: Master-Admin-Policies erlauben Zugriff auf ALLE Unternehmen
--          Dies verletzt die DSGVO, da Benutzer verschiedener Unternehmen
--          sich gegenseitig sehen können.
-- Lösung: Entferne alle Master-Admin-Policies und ersetze durch
--         strikt company-basierte Trennung
-- =============================================================================

-- =============================================================================
-- STEP 1: Entferne ALLE Master-Admin-Policies von ALLEN Tabellen
-- =============================================================================

-- Profiles
DROP POLICY IF EXISTS "profiles_master_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_master_admin_all" ON profiles;
DROP POLICY IF EXISTS "Master admins have full access" ON profiles;
DROP POLICY IF EXISTS "Master admins full access" ON profiles;

-- Companies
DROP POLICY IF EXISTS "companies_master_admin" ON companies;
DROP POLICY IF EXISTS "Master admins have full company access" ON companies;
DROP POLICY IF EXISTS "Master admins full company access" ON companies;
DROP POLICY IF EXISTS "Master admins have full access" ON companies;

-- Bookings
DROP POLICY IF EXISTS "Master admins have full booking access" ON bookings;
DROP POLICY IF EXISTS "Master admins have full access" ON bookings;

-- Drivers
DROP POLICY IF EXISTS "Master admins have full driver access" ON drivers;
DROP POLICY IF EXISTS "Master admins have full access" ON drivers;

-- Vehicles
DROP POLICY IF EXISTS "Master admins have full vehicle access" ON vehicles;
DROP POLICY IF EXISTS "Master admins have full access" ON vehicles;

-- Customers
DROP POLICY IF EXISTS "Master admins have full customer access" ON customers;
DROP POLICY IF EXISTS "Master admins have full access" ON customers;

-- Invoices
DROP POLICY IF EXISTS "Master admins have full invoice access" ON invoices;
DROP POLICY IF EXISTS "Master admins have full access" ON invoices;

-- Quotes
DROP POLICY IF EXISTS "Master admins have full quote access" ON quotes;
DROP POLICY IF EXISTS "Master admins have full access" ON quotes;

-- Quote Items
DROP POLICY IF EXISTS "Master admins have full quote item access" ON quote_items;
DROP POLICY IF EXISTS "Master admins have full access" ON quote_items;

-- Documents
DROP POLICY IF EXISTS "Master admins have full document access" ON documents;
DROP POLICY IF EXISTS "Master admins have full access" ON documents;

-- Cash Book Entries (nur wenn Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cash_book_entries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Master admins have full cash book access" ON cash_book_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Master admins have full access" ON cash_book_entries';
  END IF;
END $$;

-- Booking Requests (nur wenn Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_requests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Master admins have full booking request access" ON booking_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Master admins have full access" ON booking_requests';
  END IF;
END $$;

-- Communication Log (nur wenn Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communication_log') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Master admins have full communication log access" ON communication_log';
    EXECUTE 'DROP POLICY IF EXISTS "Master admins have full access" ON communication_log';
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Entferne oder ersetze Master-Admin-Helper-Funktionen
-- =============================================================================

-- Entferne auth_is_master_admin() Funktion (DSGVO-Verletzung)
DROP FUNCTION IF EXISTS auth_is_master_admin() CASCADE;
DROP FUNCTION IF EXISTS is_master_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_master_admin() CASCADE;

-- Erstelle Owner-Helper-Funktion (nur fuer Owner des eigenen Unternehmens)
CREATE OR REPLACE FUNCTION auth_user_is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'owner' AND company_id IS NOT NULL 
     FROM profiles WHERE id = auth.uid()),
    false
  )
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth_user_is_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_user_is_owner() TO anon;

-- =============================================================================
-- STEP 3: Stelle sicher, dass auth_user_company_id() existiert
-- =============================================================================

-- Erstelle/Ersetze auth_user_company_id() falls nicht vorhanden
CREATE OR REPLACE FUNCTION auth_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION auth_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_user_company_id() TO anon;

-- =============================================================================
-- STEP 4: Stelle sicher, dass alle Policies company-basiert sind
-- =============================================================================

-- PROFILES: Nur eigene Company sehen
-- (profiles_select_company sollte bereits existieren, aber wir stellen sicher)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'profiles_select_company'
  ) THEN
    CREATE POLICY "profiles_select_company"
    ON profiles FOR SELECT
    TO authenticated
    USING (company_id = auth_user_company_id() AND company_id IS NOT NULL);
  END IF;
END $$;

-- COMPANIES: Nur eigene Company sehen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' 
    AND policyname = 'companies_select_own'
  ) THEN
    CREATE POLICY "companies_select_own"
    ON companies FOR SELECT
    TO authenticated
    USING (id = auth_user_company_id());
  END IF;
END $$;

-- =============================================================================
-- STEP 5: Verifizierung
-- =============================================================================

-- Pruefe ob noch Master-Admin-Policies vorhanden sind
DO $$
DECLARE
  master_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO master_policy_count
  FROM pg_policies
  WHERE policyname ILIKE '%master%admin%'
     OR policyname ILIKE '%master_admin%';
  
  IF master_policy_count > 0 THEN
    RAISE WARNING 'Noch % Master-Admin-Policies gefunden!', master_policy_count;
  ELSE
    RAISE NOTICE 'DSGVO-Fix erfolgreich: Keine Master-Admin-Policies mehr vorhanden';
  END IF;
END $$;

-- Zeige alle verbleibenden Policies fuer wichtige Tabellen
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'companies', 'bookings', 'invoices', 'quotes')
ORDER BY tablename, policyname;

-- =============================================================================
-- HINWEIS: Dieses Script muss VOR allen anderen Migrations-Scripts ausgefuehrt werden
-- =============================================================================

