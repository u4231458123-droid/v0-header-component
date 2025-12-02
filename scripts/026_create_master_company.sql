-- =====================================================
-- MASTER ACCOUNT + MYDISPATCH UNTERNEHMEN SETUP
-- =====================================================
-- Dieses Script erstellt das MyDispatch Master-Unternehmen
-- und weist es dem Master-Admin Account zu
-- =====================================================

-- 1. Erstelle MyDispatch Master-Unternehmen (falls nicht vorhanden)
INSERT INTO companies (
  id,
  name,
  email,
  phone,
  address,
  subscription_tier,
  subscription_status,
  subscription_plan,
  company_slug,
  driver_limit,
  vehicle_limit,
  landingpage_enabled,
  widget_enabled,
  branding,
  contact_info,
  legal_info
) VALUES (
  'mydispatch-master-company-0001',
  'MyDispatch GmbH',
  'info@my-dispatch.de',
  '+49 123 456789',
  'Musterstraße 1, 12345 Berlin, Deutschland',
  'enterprise',
  'active',
  'enterprise',
  'mydispatch-admin',
  -1, -- Unbegrenzt
  -1, -- Unbegrenzt
  false,
  false,
  jsonb_build_object(
    'primary_color', '#1e293b',
    'secondary_color', '#3b82f6',
    'logo_url', null
  ),
  jsonb_build_object(
    'email', 'info@my-dispatch.de',
    'phone', '+49 123 456789',
    'website', 'https://my-dispatch.de'
  ),
  jsonb_build_object(
    'company_name', 'MyDispatch GmbH',
    'legal_form', 'GmbH',
    'register_court', 'Amtsgericht Berlin',
    'register_number', 'HRB 123456',
    'vat_id', 'DE123456789',
    'managing_director', 'Max Mustermann'
  )
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  driver_limit = EXCLUDED.driver_limit,
  vehicle_limit = EXCLUDED.vehicle_limit;

-- 2. Aktualisiere Master-Admin Profil mit company_id
UPDATE profiles
SET 
  company_id = 'mydispatch-master-company-0001',
  role = 'master_admin'
WHERE email = 'courbois1981@gmail.com';

-- 3. Erstelle auch einen Fallback: Alle master_admin ohne company_id bekommen das Master-Unternehmen
UPDATE profiles
SET company_id = 'mydispatch-master-company-0001'
WHERE role = 'master_admin' AND company_id IS NULL;

-- Verifizierung
SELECT 
  p.email,
  p.role,
  p.company_id,
  c.name as company_name,
  c.subscription_tier
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.role = 'master_admin';
