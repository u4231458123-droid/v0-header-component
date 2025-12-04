-- =====================================================
-- NEXIFY BUSINESS ACCOUNT SETUP
-- =====================================================
-- Dieses Script erstellt das Nexify Business-Unternehmen
-- für nexify.login@gmail.com mit Business-Tarif
-- =====================================================

-- 1. Erstelle Nexify Unternehmen (falls nicht vorhanden)
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
  legal_info,
  created_at,
  updated_at
) VALUES (
  'nexify-company-0001',
  'Nexify',
  'nexify.login@gmail.com',
  NULL,
  NULL,
  'business',
  'active',
  'business',
  'nexify',
  -1, -- Unbegrenzt (Business-Tarif)
  -1, -- Unbegrenzt (Business-Tarif)
  true,
  true,
  jsonb_build_object(
    'primary_color', '#1e293b',
    'secondary_color', '#3b82f6',
    'logo_url', null
  ),
  jsonb_build_object(
    'email', 'nexify.login@gmail.com',
    'phone', null,
    'website', null
  ),
  jsonb_build_object(
    'company_name', 'Nexify',
    'legal_form', null,
    'register_court', null,
    'register_number', null,
    'vat_id', null,
    'managing_director', null
  ),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  subscription_plan = EXCLUDED.subscription_plan,
  driver_limit = EXCLUDED.driver_limit,
  vehicle_limit = EXCLUDED.vehicle_limit,
  updated_at = NOW();

-- 2. Aktualisiere Profil für nexify.login@gmail.com mit company_id und role: "owner"
-- HINWEIS: Auth-User muss manuell in Supabase Dashboard erstellt werden:
--   - Email: nexify.login@gmail.com
--   - Passwort: 1def!xO2022!!
--   - Email bestätigt: Ja
UPDATE profiles
SET 
  company_id = 'nexify-company-0001',
  role = 'owner',
  updated_at = NOW()
WHERE email = 'nexify.login@gmail.com';

-- 3. Falls Profil noch nicht existiert, wird es beim ersten Login automatisch erstellt
-- (via Supabase Auth Trigger)

-- Verifizierung
SELECT 
  p.email,
  p.role,
  p.company_id,
  c.name as company_name,
  c.subscription_tier,
  c.subscription_status,
  c.driver_limit,
  c.vehicle_limit
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.email = 'nexify.login@gmail.com' OR c.id = 'nexify-company-0001';
