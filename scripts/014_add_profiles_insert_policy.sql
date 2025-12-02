-- ============================================================================
-- Script 014: Add missing INSERT policy on profiles table
-- ============================================================================
-- Datum: 25.11.2025
-- Problem: Neue Benutzer können sich nicht registrieren
-- Lösung: INSERT-Policy hinzufügen

-- Step 1: Create SECURITY DEFINER helper functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION auth_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_is_master_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'master_admin' FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Step 2: Add missing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Step 3: Verify policies
SELECT 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
