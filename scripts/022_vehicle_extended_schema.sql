-- =====================================================
-- MyDispatch: Erweitertes Fahrzeug-Schema
-- Basierend auf PDF-Vorgaben (2_MyDispatch_Eingabe-Felder.pdf)
-- =====================================================

-- Erweitere vehicles Tabelle um fehlende Felder
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS vin VARCHAR(17),
ADD COLUMN IF NOT EXISTS hsn VARCHAR(4),
ADD COLUMN IF NOT EXISTS tsn VARCHAR(3),
ADD COLUMN IF NOT EXISTS kw INTEGER,
ADD COLUMN IF NOT EXISTS ps INTEGER,
ADD COLUMN IF NOT EXISTS first_registration DATE,
ADD COLUMN IF NOT EXISTS km_at_purchase INTEGER,
ADD COLUMN IF NOT EXISTS fahrzeugschein_url TEXT,
ADD COLUMN IF NOT EXISTS tuev_due_date DATE,
ADD COLUMN IF NOT EXISTS concession_number VARCHAR(5),
ADD COLUMN IF NOT EXISTS concession_due_date DATE,
ADD COLUMN IF NOT EXISTS konzessionsauszug_url TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'business';

-- Erstelle vehicle_insurance Tabelle fuer KFZ-Versicherungsdaten
CREATE TABLE IF NOT EXISTS vehicle_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  license_plate VARCHAR(15),
  insurance_name VARCHAR(100),
  insurance_number VARCHAR(50),
  sf_class_liability VARCHAR(10),
  sf_class_kasko VARCHAR(10),
  deductible_partial INTEGER,
  deductible_full INTEGER,
  documents_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index fuer schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_vehicle_insurance_vehicle_id ON vehicle_insurance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_insurance_company_id ON vehicle_insurance(company_id);

-- RLS Policies fuer vehicle_insurance
ALTER TABLE vehicle_insurance ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer koennen nur ihre eigenen Versicherungsdaten sehen
CREATE POLICY "Users can view own vehicle insurance" ON vehicle_insurance
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Benutzer koennen Versicherungsdaten ihrer Firma einfuegen
CREATE POLICY "Users can insert own vehicle insurance" ON vehicle_insurance
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Benutzer koennen Versicherungsdaten ihrer Firma aktualisieren
CREATE POLICY "Users can update own vehicle insurance" ON vehicle_insurance
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Benutzer koennen Versicherungsdaten ihrer Firma loeschen
CREATE POLICY "Users can delete own vehicle insurance" ON vehicle_insurance
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Trigger fuer updated_at
CREATE OR REPLACE FUNCTION update_vehicle_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_insurance_updated_at
  BEFORE UPDATE ON vehicle_insurance
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_insurance_updated_at();

-- Storage Bucket fuer Dokumente (falls nicht vorhanden)
-- Muss in Supabase Dashboard erstellt werden:
-- Bucket: "documents" mit public access

COMMENT ON TABLE vehicle_insurance IS 'KFZ-Versicherungsdaten fuer Fahrzeuge';
COMMENT ON COLUMN vehicles.vin IS 'Fahrzeug-Identifikationsnummer (17 Zeichen)';
COMMENT ON COLUMN vehicles.hsn IS 'Herstellerschluesselnummer (4 Zeichen)';
COMMENT ON COLUMN vehicles.tsn IS 'Typschluesselnummer (3 Zeichen)';
COMMENT ON COLUMN vehicles.concession_number IS 'Taxi/Mietwagen Konzessionsnummer (max 5 Zeichen)';
