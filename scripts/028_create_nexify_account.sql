-- =====================================================
-- NEXIFY BUSINESS ACCOUNT SETUP
-- =====================================================
-- Dieses Script erstellt das Nexify Business-Unternehmen
-- für login.nexify@gmail.com mit Business-Tarif
-- =====================================================

-- 1. Erstelle Nexify Unternehmen (falls nicht vorhanden)
-- Verwende echte UUID statt String-ID
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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, -- Feste UUID fuer Nexify
  'Nexify',
  'login.nexify@gmail.com',
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
    'email', 'login.nexify@gmail.com',
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

-- 2. Aktualisiere Profil für login.nexify@gmail.com mit company_id und role: "owner"
-- HINWEIS: Auth-User muss manuell in Supabase Dashboard erstellt werden:
--   - Email: login.nexify@gmail.com
--   - Passwort: 1def!xO2022!!
--   - Email bestätigt: Ja
UPDATE profiles
SET 
  company_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  role = 'owner',
  updated_at = NOW()
WHERE email = 'login.nexify@gmail.com';

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
WHERE p.email = 'login.nexify@gmail.com' OR c.id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;
