-- ============================================================================
-- MyDispatch: Master Admin und Demo Accounts erstellen
-- Stand: 25.11.2025
-- ============================================================================

-- HINWEIS: Diese Accounts müssen in Supabase Auth manuell erstellt werden!
-- Dieses Script erstellt nur die Profile und Companies in der Datenbank.

-- ============================================================================
-- 1. MASTER ADMIN COMPANY
-- ============================================================================
INSERT INTO companies (
  id,
  name,
  email,
  subscription_status,
  subscription_tier,
  driver_limit,
  vehicle_limit
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'RideHub Solutions - Master Admin',
  'info@my-dispatch.de',
  'active',
  'enterprise',
  999999,
  999999
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subscription_status = EXCLUDED.subscription_status,
  subscription_tier = EXCLUDED.subscription_tier;

-- ============================================================================
-- 2. DEMO STARTER COMPANY
-- ============================================================================
INSERT INTO companies (
  id,
  name,
  email,
  subscription_status,
  subscription_tier,
  driver_limit,
  vehicle_limit
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Demo Starter GmbH',
  'demo.starter@my-dispatch.de',
  'active',
  'starter',
  3,
  3
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subscription_status = EXCLUDED.subscription_status,
  subscription_tier = EXCLUDED.subscription_tier,
  driver_limit = EXCLUDED.driver_limit,
  vehicle_limit = EXCLUDED.vehicle_limit;

-- ============================================================================
-- 3. DEMO BUSINESS COMPANY
-- ============================================================================
INSERT INTO companies (
  id,
  name,
  email,
  subscription_status,
  subscription_tier,
  driver_limit,
  vehicle_limit
) VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,
  'Demo Business GmbH',
  'demo.business@my-dispatch.de',
  'active',
  'business',
  999999,
  999999
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subscription_status = EXCLUDED.subscription_status,
  subscription_tier = EXCLUDED.subscription_tier,
  driver_limit = EXCLUDED.driver_limit,
  vehicle_limit = EXCLUDED.vehicle_limit;

-- ============================================================================
-- HINWEIS für v0/Entwickler:
-- ============================================================================
-- Die folgenden Accounts müssen manuell in Supabase Authentication erstellt werden:
--
-- 1. MASTER ADMIN:
--    - E-Mail: info@my-dispatch.de
--    - Passwort: #25_FS.42-FKS!
--    - Rolle: master_admin
--
-- 2. DEMO STARTER:
--    - E-Mail: demo.starter@my-dispatch.de
--    - Passwort: De.25-STR_#mO_!
--    - Rolle: admin
--
-- 3. DEMO BUSINESS:
--    - E-Mail: demo.business@my-dispatch.de
--    - Passwort: De.BsS_25#mO_!
--    - Rolle: admin
--
-- Nach Erstellung in Auth, Profiles aktualisieren mit korrekten Auth-User-IDs
-- ============================================================================
