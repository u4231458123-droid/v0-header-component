-- =============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- Version: 2.0
-- Date: 2025-11-25
-- 
-- Problem: The "Master admins have full access" policy on profiles causes
-- infinite recursion because it queries profiles to check the role.
--
-- Solution: Use SECURITY DEFINER functions that bypass RLS.
-- =============================================================================

-- STEP 1: Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Master admins have full access" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_company" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_master_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view company profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Master admins full access" ON profiles;

-- STEP 2: Drop ALL existing policies on companies
DROP POLICY IF EXISTS "Anyone can view public company data" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Public landingpages are viewable by anyone" ON companies;
DROP POLICY IF EXISTS "Master admins have full company access" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "companies_public_landing" ON companies;
DROP POLICY IF EXISTS "companies_select_own" ON companies;
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Admins can update own company" ON companies;
DROP POLICY IF EXISTS "Master admins full company access" ON companies;

-- STEP 3: Create or replace SECURITY DEFINER helper functions
-- These functions bypass RLS, preventing recursion

-- Function to get current user's company_id without triggering RLS
CREATE OR REPLACE FUNCTION auth_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

-- Function to check if current user is master_admin without triggering RLS
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
  )
$$;

-- Function to get current user's role without triggering RLS
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- STEP 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION auth_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_user_company_id() TO anon;
GRANT EXECUTE ON FUNCTION auth_is_master_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_is_master_admin() TO anon;
GRANT EXECUTE ON FUNCTION auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_user_role() TO anon;

-- =============================================================================
-- STEP 5: Create NEW RLS policies for PROFILES (no recursion)
-- =============================================================================

-- Policy: Users can INSERT their own profile (for registration)
CREATE POLICY "profiles_insert"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy: Users can SELECT their own profile (direct auth.uid() check)
CREATE POLICY "profiles_select_self"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy: Users can SELECT profiles in their company (uses helper function)
CREATE POLICY "profiles_select_company"
ON profiles FOR SELECT
TO authenticated
USING (company_id = auth_user_company_id() AND company_id IS NOT NULL);

-- Policy: Users can UPDATE their own profile
CREATE POLICY "profiles_update_self"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy: Master admins can do everything (uses helper function)
CREATE POLICY "profiles_master_admin"
ON profiles FOR ALL
TO authenticated
USING (auth_is_master_admin());

-- =============================================================================
-- STEP 6: Create NEW RLS policies for COMPANIES (no recursion)
-- =============================================================================

-- Policy: Public landing pages are visible to everyone
CREATE POLICY "companies_public_landing"
ON companies FOR SELECT
TO anon, authenticated
USING (landingpage_enabled = true);

-- Policy: Users can SELECT their own company
CREATE POLICY "companies_select_own"
ON companies FOR SELECT
TO authenticated
USING (id = auth_user_company_id());

-- Policy: Admins can UPDATE their own company
CREATE POLICY "companies_update_own"
ON companies FOR UPDATE
TO authenticated
USING (id = auth_user_company_id());

-- Policy: Master admins can do everything
CREATE POLICY "companies_master_admin"
ON companies FOR ALL
TO authenticated
USING (auth_is_master_admin());

-- Policy: Allow INSERT for new company creation during registration
CREATE POLICY "companies_insert"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================================================
-- STEP 7: Verify the setup
-- =============================================================================

-- Check that policies are created correctly
DO $$
BEGIN
  RAISE NOTICE 'RLS recursion fix complete!';
  RAISE NOTICE 'Profiles policies: %', (SELECT count(*) FROM pg_policies WHERE tablename = 'profiles');
  RAISE NOTICE 'Companies policies: %', (SELECT count(*) FROM pg_policies WHERE tablename = 'companies');
END
$$;
