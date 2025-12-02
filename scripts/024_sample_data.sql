-- =====================================================
-- MUSTERDATEN / SAMPLE DATA
-- Diese Daten koennen spaeter einfach geloescht werden
-- Loeschen: DELETE FROM ... WHERE id IN (SELECT id FROM ... WHERE email LIKE '%@muster.de')
-- =====================================================

-- Muster-Kunde (Privat)
INSERT INTO customers (
  id, company_id, salutation, first_name, last_name, email, mobile, phone,
  private_address, private_postal_code, private_city, status
) VALUES (
  'muster-kunde-0001-0000-000000000001',
  (SELECT id FROM companies LIMIT 1),
  'Herr',
  'Max',
  'MUSTERMANN',
  'max.mustermann@muster.de',
  '01701234567',
  '08512345678',
  'Musterstrasse 1',
  '94571',
  'Schaufling',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Muster-Kunde (Geschaeftlich)
INSERT INTO customers (
  id, company_id, salutation, first_name, last_name, email, mobile, phone,
  business_company_name, business_contact_person, business_address, business_postal_code, business_city, status
) VALUES (
  'muster-kunde-0002-0000-000000000002',
  (SELECT id FROM companies LIMIT 1),
  'Frau',
  'Erika',
  'MUSTERFRAU',
  'erika.musterfrau@muster.de',
  '01709876543',
  '08519876543',
  'Muster GmbH',
  'Erika Musterfrau',
  'Industriestrasse 10',
  '94469',
  'Deggendorf',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Muster-Fahrer
INSERT INTO drivers (
  id, company_id, salutation, first_name, last_name, email, mobile, phone,
  address, postal_code, city,
  license_number, license_issued_date, license_classes,
  p_license_number, p_license_issued_date, p_license_expiry_date,
  status
) VALUES (
  'muster-fahrer-0001-0000-000000000001',
  (SELECT id FROM companies LIMIT 1),
  'Herr',
  'Thomas',
  'MUSTERFAHRER',
  'thomas.musterfahrer@muster.de',
  '01705551234',
  '08515551234',
  'Fahrerweg 5',
  '94571',
  'Schaufling',
  'B123456789012345',
  '2015-03-15',
  ARRAY['B', 'BE', 'C1', 'C1E'],
  'P12345',
  '2018-06-20',
  '2028-06-20',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Muster-Fahrzeug
INSERT INTO vehicles (
  id, company_id, license_plate, manufacturer, model, vin,
  hsn, tsn, power_kw, power_ps, color, year, first_registration_date,
  mileage_at_purchase, tuev_date,
  concession_number, concession_expiry_date,
  insurance_name, insurance_number, sf_class_liability, sf_class_comprehensive,
  deductible_partial, deductible_full,
  status
) VALUES (
  'muster-fahrzeug-0001-0000-000000001',
  (SELECT id FROM companies LIMIT 1),
  'DEG-TX 123',
  'Mercedes-Benz',
  'E-Klasse (W213)',
  'WDD2130421A123456',
  '1234',
  '567',
  '143',
  '194',
  'Obsidianschwarz',
  2022,
  '2022-01-15',
  15000,
  '2026-01-15',
  '12345',
  '2027-12-31',
  'HUK-COBURG',
  'VN-123456789',
  'SF 12',
  'SF 10',
  150,
  500,
  'available'
) ON CONFLICT (id) DO NOTHING;

-- Muster-Auftrag
INSERT INTO bookings (
  id, company_id, customer_id, driver_id, vehicle_id,
  pickup_time, pickup_address, dropoff_address,
  passenger_count, passenger_names, vehicle_category,
  payment_method, cost_center, special_requests,
  pickup_type, flight_train_number, departure_location,
  price, status
) VALUES (
  'muster-auftrag-0001-0000-000000000001',
  (SELECT id FROM companies LIMIT 1),
  'muster-kunde-0001-0000-000000000001',
  'muster-fahrer-0001-0000-000000000001',
  'muster-fahrzeug-0001-0000-000000001',
  NOW() + INTERVAL '2 days',
  'Musterstrasse 1, 94571 Schaufling',
  'Flughafen Muenchen, Terminal 2',
  2,
  'Max Mustermann, Anna Mustermann',
  'Business',
  'Rechnung',
  'KST-2024-001',
  'Kindersitz benoetigt',
  'airport',
  'LH 1234',
  'Muenchen (MUC)',
  189.50,
  'confirmed'
) ON CONFLICT (id) DO NOTHING;

-- Muster-Auftrag 2 (ohne Flug)
INSERT INTO bookings (
  id, company_id, customer_id,
  pickup_time, pickup_address, dropoff_address,
  passenger_count, passenger_names, vehicle_category,
  payment_method, special_requests,
  price, status
) VALUES (
  'muster-auftrag-0002-0000-000000000002',
  (SELECT id FROM companies LIMIT 1),
  'muster-kunde-0002-0000-000000000002',
  NOW() + INTERVAL '5 days',
  'Industriestrasse 10, 94469 Deggendorf',
  'Messe Muenchen, Eingang Ost',
  4,
  'Erika Musterfrau, Peter Mueller, Hans Schmidt, Lisa Weber',
  'Van',
  'Kreditkarte',
  'Grosse Gepaeckstuecke',
  245.00,
  'pending'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- LOESCHANLEITUNG:
-- Um alle Musterdaten zu loeschen, fuehren Sie folgende Befehle aus:
-- 
-- DELETE FROM bookings WHERE id LIKE 'muster-%';
-- DELETE FROM vehicles WHERE id LIKE 'muster-%';
-- DELETE FROM drivers WHERE id LIKE 'muster-%';
-- DELETE FROM customers WHERE id LIKE 'muster-%';
-- =====================================================
