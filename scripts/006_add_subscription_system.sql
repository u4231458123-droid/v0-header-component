-- Add subscription fields to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS driver_limit INTEGER DEFAULT 5;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vehicle_limit INTEGER DEFAULT 5;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Add master_admin role to profiles
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Update profiles RLS to allow master_admin full access
CREATE POLICY "Master admins have full access" ON profiles
FOR ALL USING (role = 'master_admin');

CREATE POLICY "Master admins have full company access" ON companies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'master_admin'
  )
);

-- Add subscription check function
CREATE OR REPLACE FUNCTION check_subscription_active(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM companies
    WHERE id = company_uuid
    AND (
      subscription_status = 'active'
      OR subscription_status = 'trialing'
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.company_id = company_uuid
        AND profiles.role = 'master_admin'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create master admin user insert function
CREATE OR REPLACE FUNCTION create_master_admin()
RETURNS void AS $$
DECLARE
  master_company_id UUID;
  master_user_id UUID;
BEGIN
  -- Create master company
  INSERT INTO companies (name, email, subscription_status, subscription_tier)
  VALUES ('Master Admin Company', 'courbois1981@gmail.com', 'active', 'enterprise')
  RETURNING id INTO master_company_id;

  -- Note: The actual user creation must be done via Supabase Auth
  -- This function prepares the company
  
  RAISE NOTICE 'Master company created with ID: %', master_company_id;
END;
$$ LANGUAGE plpgsql;

-- Execute master admin setup
SELECT create_master_admin();
