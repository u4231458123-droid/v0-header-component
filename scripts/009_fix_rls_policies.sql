-- Fix RLS policies to prevent infinite recursion
-- The issue is that policies on "profiles" table reference themselves

-- First, drop the problematic policies on profiles
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Master admins have full access" ON profiles;

-- Create a security definer function to get user's company_id without triggering RLS
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

-- Create a function to check if user is master admin
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

-- Recreate policies using the security definer functions

-- Policy 1: Users can view their own profile (always allowed)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Users can view profiles in their company (uses function to avoid recursion)
CREATE POLICY "Users can view company profiles"
ON profiles FOR SELECT
USING (company_id = get_user_company_id());

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 4: Master admins have full access (uses function)
CREATE POLICY "Master admins full access"
ON profiles FOR ALL
USING (is_master_admin());

-- Also fix policies on other tables that might have similar issues
-- Fix companies table policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Master admins have full company access" ON companies;

-- Recreate companies policies with security definer function
CREATE POLICY "Users can view own company"
ON companies FOR SELECT
USING (id = get_user_company_id());

CREATE POLICY "Admins can update own company"
ON companies FOR UPDATE
USING (id = get_user_company_id());

CREATE POLICY "Master admins full company access"
ON companies FOR ALL
USING (is_master_admin());

-- Fix bookings table policies  
DROP POLICY IF EXISTS "Users can view bookings in their company" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings in their company" ON bookings;
DROP POLICY IF EXISTS "Users can update bookings in their company" ON bookings;

CREATE POLICY "View company bookings"
ON bookings FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Create company bookings"
ON bookings FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Update company bookings"
ON bookings FOR UPDATE
USING (company_id = get_user_company_id());

-- Fix customers table policies
DROP POLICY IF EXISTS "Users can view customers in their company" ON customers;
DROP POLICY IF EXISTS "Users can create customers in their company" ON customers;
DROP POLICY IF EXISTS "Users can update customers in their company" ON customers;

CREATE POLICY "View company customers"
ON customers FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Create company customers"
ON customers FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Update company customers"
ON customers FOR UPDATE
USING (company_id = get_user_company_id());

-- Fix drivers table policies
DROP POLICY IF EXISTS "Users can view drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can create drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can update drivers in their company" ON drivers;

CREATE POLICY "View company drivers"
ON drivers FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Create company drivers"
ON drivers FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Update company drivers"
ON drivers FOR UPDATE
USING (company_id = get_user_company_id());

-- Fix vehicles table policies
DROP POLICY IF EXISTS "Users can view vehicles in their company" ON vehicles;
DROP POLICY IF EXISTS "Users can create vehicles in their company" ON vehicles;
DROP POLICY IF EXISTS "Users can update vehicles in their company" ON vehicles;

CREATE POLICY "View company vehicles"
ON vehicles FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Create company vehicles"
ON vehicles FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Update company vehicles"
ON vehicles FOR UPDATE
USING (company_id = get_user_company_id());

-- Fix invoices table policies
DROP POLICY IF EXISTS "Users can view invoices in their company" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices in their company" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices in their company" ON invoices;

CREATE POLICY "View company invoices"
ON invoices FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Create company invoices"
ON invoices FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Update company invoices"
ON invoices FOR UPDATE
USING (company_id = get_user_company_id());
