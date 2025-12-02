-- ============================================================================
-- MyDispatch: Partner-Unternehmen-System
-- Stand: 25.11.2025
-- Vollstaendige Implementierung gemaess Lastenheft
-- ============================================================================

-- ============================================================================
-- 1. MD-ID SPALTE ZU COMPANIES HINZUFUEGEN
-- ============================================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS md_id VARCHAR(10) UNIQUE;

-- Generiere MD-IDs fuer bestehende Companies
UPDATE companies 
SET md_id = 'MD-' || UPPER(SUBSTRING(id::text FROM 1 FOR 6))
WHERE md_id IS NULL;

-- ============================================================================
-- 2. PARTNER-VERBINDUNGEN TABELLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Unternehmen A (Anfragender)
  company_a_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Unternehmen B (Angefragter)
  company_b_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Status: pending, accepted, rejected, blocked
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Optionales Notizfeld
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_partner_connection UNIQUE (company_a_id, company_b_id),
  CONSTRAINT no_self_partnership CHECK (company_a_id != company_b_id)
);

-- Index fuer schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_partner_connections_company_a ON partner_connections(company_a_id);
CREATE INDEX IF NOT EXISTS idx_partner_connections_company_b ON partner_connections(company_b_id);
CREATE INDEX IF NOT EXISTS idx_partner_connections_status ON partner_connections(status);

-- ============================================================================
-- 3. PARTNER-AUFTRAEGE TABELLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Original-Auftrag Referenz
  original_booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Quell-Unternehmen (hat den Auftrag erstellt)
  source_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Partner-Unternehmen (fuehrt den Auftrag aus)
  partner_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Zugewiesener Fahrer beim Partner
  partner_driver_id UUID REFERENCES drivers(id),
  
  -- Zugewiesenes Fahrzeug beim Partner
  partner_vehicle_id UUID REFERENCES vehicles(id),
  
  -- Status-Synchronisation
  partner_status VARCHAR(30) NOT NULL DEFAULT 'eingegangen',
  
  -- Provision/Abrechnung
  commission_percent DECIMAL(5,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_partner_booking UNIQUE (original_booking_id, partner_company_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_partner_bookings_source ON partner_bookings(source_company_id);
CREATE INDEX IF NOT EXISTS idx_partner_bookings_partner ON partner_bookings(partner_company_id);
CREATE INDEX IF NOT EXISTS idx_partner_bookings_status ON partner_bookings(partner_status);
CREATE INDEX IF NOT EXISTS idx_partner_bookings_original ON partner_bookings(original_booking_id);

-- ============================================================================
-- 4. PARTNER-AUFTRAEGE HISTORIE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_booking_id UUID NOT NULL REFERENCES partner_bookings(id) ON DELETE CASCADE,
  
  -- Welches Unternehmen hat die Aenderung gemacht
  changed_by_company_id UUID NOT NULL REFERENCES companies(id),
  changed_by_user_id UUID REFERENCES profiles(id),
  
  -- Status vorher/nachher
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  
  -- Optionaler Kommentar
  comment TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_history_booking ON partner_booking_history(partner_booking_id);

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Partner Connections RLS
ALTER TABLE partner_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_connections_select" ON partner_connections
  FOR SELECT USING (
    company_a_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR company_b_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin')
  );

CREATE POLICY "partner_connections_insert" ON partner_connections
  FOR INSERT WITH CHECK (
    company_a_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "partner_connections_update" ON partner_connections
  FOR UPDATE USING (
    company_b_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR company_a_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "partner_connections_delete" ON partner_connections
  FOR DELETE USING (
    company_a_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR company_b_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Partner Bookings RLS
ALTER TABLE partner_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_bookings_select" ON partner_bookings
  FOR SELECT USING (
    source_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR partner_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin')
  );

CREATE POLICY "partner_bookings_insert" ON partner_bookings
  FOR INSERT WITH CHECK (
    source_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "partner_bookings_update" ON partner_bookings
  FOR UPDATE USING (
    source_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR partner_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Partner Booking History RLS
ALTER TABLE partner_booking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_history_select" ON partner_booking_history
  FOR SELECT USING (
    partner_booking_id IN (
      SELECT id FROM partner_bookings 
      WHERE source_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
         OR partner_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin')
  );

CREATE POLICY "partner_history_insert" ON partner_booking_history
  FOR INSERT WITH CHECK (
    changed_by_company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- 6. TRIGGER FUER UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_partner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_partner_connections_updated ON partner_connections;
CREATE TRIGGER trigger_partner_connections_updated
  BEFORE UPDATE ON partner_connections
  FOR EACH ROW EXECUTE FUNCTION update_partner_updated_at();

DROP TRIGGER IF EXISTS trigger_partner_bookings_updated ON partner_bookings;
CREATE TRIGGER trigger_partner_bookings_updated
  BEFORE UPDATE ON partner_bookings
  FOR EACH ROW EXECUTE FUNCTION update_partner_updated_at();

-- ============================================================================
-- FERTIG
-- ============================================================================
