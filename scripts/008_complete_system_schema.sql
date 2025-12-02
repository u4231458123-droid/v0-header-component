-- =============================================================================
-- MyDispatch Complete System Schema Extension
-- Version 2.0 - Vollständige Erweiterung für alle Module
-- =============================================================================

-- =============================================================================
-- 1. DRIVER SHIFTS (Fahrer-Schichten)
-- =============================================================================
CREATE TABLE IF NOT EXISTS driver_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Schichtzeiten
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ,
  
  -- Pausen (als JSONB Array für mehrere Pausen)
  breaks JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"start": "timestamp", "end": "timestamp", "duration_minutes": 30}]
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'break', 'completed', 'cancelled')),
  
  -- Statistiken
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_distance_km NUMERIC(10,2) DEFAULT 0,
  
  -- Notizen (nur vom Unternehmer editierbar)
  notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für driver_shifts
ALTER TABLE driver_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own shifts" ON driver_shifts
  FOR SELECT USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Drivers can start/end own shifts" ON driver_shifts
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );

CREATE POLICY "Company admins can manage all shifts" ON driver_shifts
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'master_admin')
    )
  );

-- =============================================================================
-- 2. DOCUMENTS (Dokumente für Fahrer & Unternehmer)
-- =============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Zuordnung (entweder Fahrer oder Unternehmer)
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('driver', 'company')),
  
  -- Dokumenttyp
  document_type TEXT NOT NULL CHECK (document_type IN (
    -- Fahrer-Dokumente
    'drivers_license', 'drivers_license_back',
    'passenger_transport_permit', -- P-Schein / PBefG
    'id_card', 'id_card_back',
    'medical_certificate',
    'first_aid_certificate',
    'training_certificate',
    'photo',
    -- Unternehmens-Dokumente
    'business_license', -- Gewerbeschein
    'trade_register', -- Handelsregister
    'tax_certificate',
    'insurance_certificate',
    'concession', -- Konzession
    'other'
  )),
  
  -- Datei-Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Gültigkeit
  valid_from DATE,
  valid_until DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own documents" ON documents
  FOR SELECT USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );

CREATE POLICY "Drivers can upload own documents" ON documents
  FOR INSERT WITH CHECK (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );

CREATE POLICY "Company admins can manage all documents" ON documents
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'master_admin')
    )
  );

-- =============================================================================
-- 3. CUSTOMER_ACCOUNTS (Kundenportal-Accounts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Kundendaten
  salutation TEXT CHECK (salutation IN ('Herr', 'Frau', 'Divers')),
  title TEXT, -- Dr., Prof., etc.
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Adresse
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  
  -- Präferenzen
  preferred_payment_method TEXT DEFAULT 'cash' CHECK (preferred_payment_method IN ('cash', 'card', 'invoice', 'paypal')),
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  
  -- Verknüpfung zu Unternehmen (bei welchen Unternehmen ist der Kunde registriert)
  registered_companies UUID[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für customer_accounts
ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own account" ON customer_accounts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers can update own account" ON customer_accounts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Company admins can view registered customers" ON customer_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('owner', 'admin', 'master_admin')
      AND p.company_id = ANY(registered_companies)
    )
  );

-- =============================================================================
-- 4. COMPANY_BRANDING (Erweitertes Unternehmens-Branding)
-- =============================================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
  "primary_color": "#1e293b",
  "secondary_color": "#3b82f6",
  "accent_color": "#10b981",
  "font_family": "Inter",
  "logo_position": "left",
  "show_mydispatch_badge": true
}'::jsonb;

-- Erweiterte Landingpage-Felder
ALTER TABLE companies ADD COLUMN IF NOT EXISTS landingpage_meta JSONB DEFAULT '{
  "meta_title": "",
  "meta_description": "",
  "og_image_url": "",
  "keywords": []
}'::jsonb;

ALTER TABLE companies ADD COLUMN IF NOT EXISTS landingpage_sections JSONB DEFAULT '{
  "hero": {"enabled": true, "background_type": "gradient"},
  "features": {"enabled": true},
  "testimonials": {"enabled": false},
  "contact": {"enabled": true},
  "booking_widget": {"enabled": false}
}'::jsonb;

-- Rechtliche Texte (dynamisch pro Unternehmen)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_texts JSONB DEFAULT '{
  "impressum": "",
  "datenschutz": "",
  "agb": "",
  "widerrufsbelehrung": ""
}'::jsonb;

-- Kontaktdaten erweitert
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{
  "phone": "",
  "fax": "",
  "email": "",
  "whatsapp": "",
  "address": {
    "street": "",
    "house_number": "",
    "postal_code": "",
    "city": "",
    "country": "Deutschland"
  },
  "business_hours": {
    "monday": {"open": "06:00", "close": "22:00", "closed": false},
    "tuesday": {"open": "06:00", "close": "22:00", "closed": false},
    "wednesday": {"open": "06:00", "close": "22:00", "closed": false},
    "thursday": {"open": "06:00", "close": "22:00", "closed": false},
    "friday": {"open": "06:00", "close": "22:00", "closed": false},
    "saturday": {"open": "08:00", "close": "20:00", "closed": false},
    "sunday": {"open": "08:00", "close": "20:00", "closed": true}
  }
}'::jsonb;

-- Unternehmensrechtliche Daten
ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_info JSONB DEFAULT '{
  "company_type": "",
  "register_court": "",
  "register_number": "",
  "vat_id": "",
  "tax_number": "",
  "managing_director": "",
  "supervisory_authority": ""
}'::jsonb;

-- Bankverbindung
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_info JSONB DEFAULT '{
  "bank_name": "",
  "iban": "",
  "bic": "",
  "account_holder": ""
}'::jsonb;

-- =============================================================================
-- 5. DRIVER EXTENDED FIELDS (Erweiterte Fahrer-Felder)
-- =============================================================================
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS salutation TEXT CHECK (salutation IN ('Herr', 'Frau', 'Divers'));
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS title TEXT; -- Dr., Prof., etc.
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'deutsch';

-- Adresse strukturiert
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address_data JSONB DEFAULT '{
  "street": "",
  "house_number": "",
  "postal_code": "",
  "city": "",
  "country": "Deutschland"
}'::jsonb;

-- Führerschein-Details
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_data JSONB DEFAULT '{
  "license_classes": [],
  "license_number": "",
  "issuing_authority": "",
  "issue_date": null,
  "expiry_date": null
}'::jsonb;

-- PBefG (Personenbeförderungsschein)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS pbef_data JSONB DEFAULT '{
  "number": "",
  "issuing_authority": "",
  "issue_date": null,
  "expiry_date": null,
  "valid": false
}'::jsonb;

-- Beschäftigungsstatus
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS employment_data JSONB DEFAULT '{
  "type": "employee",
  "start_date": null,
  "contract_type": "full-time",
  "hourly_rate": null,
  "monthly_salary": null
}'::jsonb;

-- =============================================================================
-- 6. BOOKING WIDGET REQUESTS (Buchungsanfragen vom Widget)
-- =============================================================================
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_account_id UUID REFERENCES customer_accounts(id),
  
  -- Kontaktdaten (falls kein Account)
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  
  -- Fahrtdetails
  pickup_address TEXT NOT NULL,
  pickup_location POINT,
  dropoff_address TEXT NOT NULL,
  dropoff_location POINT,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  
  -- Optionen
  passengers INTEGER DEFAULT 1,
  luggage_count INTEGER DEFAULT 0,
  special_requests TEXT,
  vehicle_type TEXT, -- Standard, Kombi, Van, etc.
  
  -- Preis (falls berechnet)
  estimated_price NUMERIC(10,2),
  price_zone TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'
  )),
  
  -- Zuordnung
  assigned_driver_id UUID REFERENCES drivers(id),
  assigned_vehicle_id UUID REFERENCES vehicles(id),
  converted_booking_id UUID REFERENCES bookings(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage booking requests" ON booking_requests
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'master_admin', 'dispatcher')
    )
  );

CREATE POLICY "Customers can view own requests" ON booking_requests
  FOR SELECT USING (
    customer_account_id IN (SELECT id FROM customer_accounts WHERE user_id = auth.uid())
  );

-- =============================================================================
-- 7. COMMUNICATION LOG (Kommunikationsprotokoll)
-- =============================================================================
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Beteiligte
  sender_type TEXT NOT NULL CHECK (sender_type IN ('driver', 'dispatcher', 'customer', 'system', 'ai')),
  sender_id UUID,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('driver', 'dispatcher', 'customer', 'all_drivers')),
  recipient_id UUID,
  
  -- Nachricht
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'status_update', 'booking_info', 'alert', 'ai_response')),
  subject TEXT,
  content TEXT NOT NULL,
  
  -- Kontext
  booking_id UUID REFERENCES bookings(id),
  shift_id UUID REFERENCES driver_shifts(id),
  
  -- Status
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für communication_log
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communications" ON communication_log
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );

-- =============================================================================
-- 8. INDICES FÜR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_driver_shifts_driver ON driver_shifts(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_shifts_company ON driver_shifts(company_id);
CREATE INDEX IF NOT EXISTS idx_driver_shifts_status ON driver_shifts(status);
CREATE INDEX IF NOT EXISTS idx_driver_shifts_date ON driver_shifts(shift_start);

CREATE INDEX IF NOT EXISTS idx_documents_driver ON documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE INDEX IF NOT EXISTS idx_customer_accounts_user ON customer_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_email ON customer_accounts(email);

CREATE INDEX IF NOT EXISTS idx_booking_requests_company ON booking_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_datetime ON booking_requests(pickup_datetime);

CREATE INDEX IF NOT EXISTS idx_communication_company ON communication_log(company_id);
CREATE INDEX IF NOT EXISTS idx_communication_booking ON communication_log(booking_id);

-- =============================================================================
-- 9. TRIGGER FÜR updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_driver_shifts_updated_at ON driver_shifts;
CREATE TRIGGER update_driver_shifts_updated_at
  BEFORE UPDATE ON driver_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_accounts_updated_at ON customer_accounts;
CREATE TRIGGER update_customer_accounts_updated_at
  BEFORE UPDATE ON customer_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_requests_updated_at ON booking_requests;
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
