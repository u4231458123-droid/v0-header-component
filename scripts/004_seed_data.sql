-- Seed Master Account Company
INSERT INTO companies (id, name, email, phone, subscription_plan, landingpage_enabled)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'MyDispatch Master',
  'info@my-dispatch.de',
  '+49 123 456789',
  'enterprise',
  false
) ON CONFLICT DO NOTHING;

-- Seed Demo Company
INSERT INTO companies (
  id, 
  name, 
  email, 
  phone, 
  address,
  company_slug, 
  landingpage_enabled, 
  widget_enabled,
  landingpage_title,
  landingpage_hero_text,
  business_hours
)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Taxi Demo GmbH',
  'kontakt@taxi-demo.de',
  '+49 30 12345678',
  'Musterstraße 123, 10115 Berlin',
  'taxi-demo',
  true,
  true,
  'Ihr zuverlässiger Taxi-Service in Berlin',
  'Schnell, sicher und komfortabel zu Ihrem Ziel',
  '{"monday": "00:00-24:00", "tuesday": "00:00-24:00", "wednesday": "00:00-24:00", "thursday": "00:00-24:00", "friday": "00:00-24:00", "saturday": "00:00-24:00", "sunday": "00:00-24:00"}'::jsonb
) ON CONFLICT DO NOTHING;
