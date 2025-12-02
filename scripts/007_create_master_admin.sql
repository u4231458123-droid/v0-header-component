-- Create Master Admin Account
-- This script creates the permanent master admin account

-- First check if user already exists
DO $$
BEGIN
  -- Create master admin company if not exists
  INSERT INTO public.companies (
    id,
    name,
    email,
    subscription_status,
    subscription_tier,
    driver_limit,
    vehicle_limit,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    'Master Admin Company',
    'courbois1981@gmail.com',
    'active',
    'enterprise',
    999999,
    999999,
    now(),
    now()
  )
  ON CONFLICT (email) DO NOTHING;

  -- Note: The actual user creation needs to be done via Supabase Auth
  -- This can be triggered via the /admin/setup-master page
END $$;

-- Add comment
COMMENT ON TABLE public.companies IS 'Companies table with master admin support';
