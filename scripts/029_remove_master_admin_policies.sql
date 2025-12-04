-- =====================================================
-- ENTFERNUNG ALLER MASTER-ADMIN RLS-POLICIES
-- =====================================================
-- Dieses Script entfernt alle Master-Admin-Policies und Funktionen
-- um die Codebase zu vereinheitlichen
-- =====================================================

-- 1. Entferne alle Master-Admin-Policies von allen Tabellen

-- Companies Policies
DROP POLICY IF EXISTS "Master admins have full company access" ON companies;
DROP POLICY IF EXISTS "Master admins have full access" ON companies;

-- Profiles Policies
DROP POLICY IF EXISTS "Master admins have full access" ON profiles;
DROP POLICY IF EXISTS "Master admins full access" ON profiles;
DROP POLICY IF EXISTS "profiles_master_admin_all" ON profiles;

-- Bookings Policies
DROP POLICY IF EXISTS "Master admins have full booking access" ON bookings;
DROP POLICY IF EXISTS "Master admins have full access" ON bookings;

-- Drivers Policies
DROP POLICY IF EXISTS "Master admins have full driver access" ON drivers;
DROP POLICY IF EXISTS "Master admins have full access" ON drivers;

-- Vehicles Policies
DROP POLICY IF EXISTS "Master admins have full vehicle access" ON vehicles;
DROP POLICY IF EXISTS "Master admins have full access" ON vehicles;

-- Customers Policies
DROP POLICY IF EXISTS "Master admins have full customer access" ON customers;
DROP POLICY IF EXISTS "Master admins have full access" ON customers;

-- Invoices Policies
DROP POLICY IF EXISTS "Master admins have full invoice access" ON invoices;
DROP POLICY IF EXISTS "Master admins have full access" ON invoices;

-- Quotes Policies
DROP POLICY IF EXISTS "Master admins have full quote access" ON quotes;
DROP POLICY IF EXISTS "Master admins have full access" ON quotes;

-- Cash Book Entries Policies
DROP POLICY IF EXISTS "Master admins have full cash book access" ON cash_book_entries;
DROP POLICY IF EXISTS "Master admins have full access" ON cash_book_entries;

-- 2. Entferne Master-Admin-Funktionen

-- Entferne is_master_admin() Funktion falls vorhanden
DROP FUNCTION IF EXISTS is_master_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_master_admin() CASCADE;

-- 3. Verifizierung: Prüfe ob noch Master-Admin-Policies vorhanden sind
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE policyname ILIKE '%master%admin%'
   OR policyname ILIKE '%master_admin%'
ORDER BY tablename, policyname;

-- Erwartetes Ergebnis: Keine Policies mehr vorhanden

