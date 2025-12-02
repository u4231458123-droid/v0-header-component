-- Partner-Verbindungen Tabelle
CREATE TABLE IF NOT EXISTS partner_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receiver_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(sender_company_id, receiver_company_id)
);

-- Partner-Auftraege Tabelle
CREATE TABLE IF NOT EXISTS partner_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  sender_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receiver_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES partner_connections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  
  -- Uebermittelte Daten (anklickbar beim Senden)
  shared_fields JSONB NOT NULL DEFAULT '{}',
  
  -- Auftragsdaten
  booking_date DATE,
  booking_time TIME,
  customer_salutation TEXT,
  customer_first_name TEXT,
  customer_last_name TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  passenger_count INTEGER,
  passenger_names TEXT,
  vehicle_category TEXT,
  flight_train_origin TEXT,
  flight_train_number TEXT,
  assigned_driver_name TEXT,
  assigned_vehicle TEXT,
  license_plate TEXT,
  price NUMERIC(10,2),
  
  -- Interne Nachrichten
  internal_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Partner-Nachrichten Tabelle
CREATE TABLE IF NOT EXISTS partner_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES partner_connections(id) ON DELETE CASCADE,
  sender_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES partner_bookings(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MD-ID Spalte zu companies hinzufuegen falls nicht vorhanden
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'md_id') THEN
    ALTER TABLE companies ADD COLUMN md_id TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'city') THEN
    ALTER TABLE companies ADD COLUMN city TEXT;
  END IF;
END $$;

-- Automatische MD-ID Generierung
CREATE OR REPLACE FUNCTION generate_md_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.md_id IS NULL THEN
    NEW.md_id := 'MD-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_md_id ON companies;
CREATE TRIGGER set_md_id
  BEFORE INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION generate_md_id();

-- RLS aktivieren
ALTER TABLE partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies fuer partner_connections
CREATE POLICY "Users can view own company connections" ON partner_connections
  FOR SELECT USING (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR receiver_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create connections for own company" ON partner_connections
  FOR INSERT WITH CHECK (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own company connections" ON partner_connections
  FOR UPDATE USING (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR receiver_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- RLS Policies fuer partner_bookings
CREATE POLICY "Users can view partner bookings" ON partner_bookings
  FOR SELECT USING (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR receiver_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create partner bookings" ON partner_bookings
  FOR INSERT WITH CHECK (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update partner bookings" ON partner_bookings
  FOR UPDATE USING (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR receiver_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- RLS Policies fuer partner_messages
CREATE POLICY "Users can view partner messages" ON partner_messages
  FOR SELECT USING (
    connection_id IN (
      SELECT id FROM partner_connections 
      WHERE sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
         OR receiver_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can send partner messages" ON partner_messages
  FOR INSERT WITH CHECK (
    sender_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Indizes
CREATE INDEX IF NOT EXISTS idx_partner_connections_sender ON partner_connections(sender_company_id);
CREATE INDEX IF NOT EXISTS idx_partner_connections_receiver ON partner_connections(receiver_company_id);
CREATE INDEX IF NOT EXISTS idx_partner_connections_status ON partner_connections(status);
CREATE INDEX IF NOT EXISTS idx_partner_bookings_sender ON partner_bookings(sender_company_id);
CREATE INDEX IF NOT EXISTS idx_partner_bookings_receiver ON partner_bookings(receiver_company_id);
CREATE INDEX IF NOT EXISTS idx_partner_messages_connection ON partner_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_companies_md_id ON companies(md_id);
