-- =====================================================
-- MyDispatch - Vehicle Location Tracking Schema
-- Fuer PWA-App Standort-Updates und Dashboard-Anzeige
-- =====================================================

-- Fuege Standort-Spalten zur vehicles-Tabelle hinzu
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS heading DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS speed DECIMAL(6, 2);

-- Index fuer schnelle Standort-Abfragen
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(company_id, current_lat, current_lng);
CREATE INDEX IF NOT EXISTS idx_vehicles_location_updated ON vehicles(company_id, location_updated_at DESC);

-- Tabelle fuer Standort-Historie (optional, fuer Auswertungen)
CREATE TABLE IF NOT EXISTS vehicle_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(6, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index fuer Historie-Abfragen
CREATE INDEX IF NOT EXISTS idx_vehicle_location_history_vehicle ON vehicle_location_history(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_location_history_company ON vehicle_location_history(company_id, recorded_at DESC);

-- RLS fuer Standort-Historie
ALTER TABLE vehicle_location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company vehicle history" ON vehicle_location_history
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company vehicle history" ON vehicle_location_history
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Funktion zum Aktualisieren des Fahrzeug-Standorts (von PWA-App aufgerufen)
CREATE OR REPLACE FUNCTION update_vehicle_location(
  p_vehicle_id UUID,
  p_lat DECIMAL(10, 8),
  p_lng DECIMAL(11, 8),
  p_heading DECIMAL(5, 2) DEFAULT NULL,
  p_speed DECIMAL(6, 2) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Hole company_id
  SELECT company_id INTO v_company_id FROM vehicles WHERE id = p_vehicle_id;
  
  -- Update aktueller Standort
  UPDATE vehicles 
  SET 
    current_lat = p_lat,
    current_lng = p_lng,
    heading = p_heading,
    speed = p_speed,
    location_updated_at = NOW()
  WHERE id = p_vehicle_id;
  
  -- Speichere in Historie (alle 5 Minuten)
  INSERT INTO vehicle_location_history (vehicle_id, company_id, lat, lng, heading, speed)
  SELECT p_vehicle_id, v_company_id, p_lat, p_lng, p_heading, p_speed
  WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_location_history 
    WHERE vehicle_id = p_vehicle_id 
    AND recorded_at > NOW() - INTERVAL '5 minutes'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute auf die Funktion
GRANT EXECUTE ON FUNCTION update_vehicle_location TO authenticated;

-- Cleanup alte Historie-Eintraege (aelter als 30 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_location_history()
RETURNS VOID AS $$
BEGIN
  DELETE FROM vehicle_location_history 
  WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
