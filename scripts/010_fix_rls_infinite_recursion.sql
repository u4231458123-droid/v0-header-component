-- Fix infinite recursion in profiles RLS policies
-- The issue is that policies reference the same table they're protecting

-- First, drop all existing policies on profiles
DROP POLICY IF EXISTS "Master admins have full access" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a security definer function to safely get user's company_id
-- This function bypasses RLS, preventing recursion
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

-- Create a security definer function to check if user is master admin
CREATE OR REPLACE FUNCTION is_master_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'master_admin'
  )
$$;

-- Now create new, non-recursive policies for profiles

-- 1. Users can always view their own profile (using auth.uid() directly)
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (id = auth.uid());

-- 2. Users can view other profiles in their company (using the helper function)
CREATE POLICY "profiles_select_company"
ON profiles FOR SELECT
USING (company_id = get_my_company_id());

-- 3. Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Master admins have full access to all profiles
CREATE POLICY "profiles_master_admin_all"
ON profiles FOR ALL
USING (is_master_admin());

-- 5. Allow INSERT for new user registration (auth.uid() matches the profile id being created)
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Also fix any potential issues with companies table policies
DROP POLICY IF EXISTS "Anyone can view public company data" ON companies;
DROP POLICY IF EXISTS "Public landingpages are viewable by anyone" ON companies;

-- Recreate companies policies without referencing profiles
CREATE POLICY "companies_public_landing"
ON companies FOR SELECT
USING (landingpage_enabled = true);

CREATE POLICY "companies_select_own"
ON companies FOR SELECT
USING (id = get_my_company_id());

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_company_id() TO anon;
GRANT EXECUTE ON FUNCTION is_master_admin() TO authenticated;
