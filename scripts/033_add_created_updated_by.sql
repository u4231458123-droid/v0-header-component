-- =============================================================================
-- MIGRATION 033: Bearbeiter-Tracking (created_by/updated_by)
-- =============================================================================
-- Datum: 2025-12-04
-- Beschreibung: Fuegt Bearbeiter-Tracking zu bookings, invoices und quotes hinzu
--               Damit kann nachvollzogen werden, wer Auftraege/Angebote/Rechnungen
--               erstellt und bearbeitet hat (DSGVO-konform, Zeitstempel)
-- =============================================================================

-- =============================================================================
-- STEP 1: BOOKINGS - Bearbeiter-Tracking hinzufuegen
-- =============================================================================

-- Fuege created_by hinzu (falls nicht vorhanden)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Kommentare hinzufuegen
COMMENT ON COLUMN bookings.created_by IS 'Profil-ID des Benutzers, der den Auftrag erstellt hat';
COMMENT ON COLUMN bookings.updated_by IS 'Profil-ID des Benutzers, der den Auftrag zuletzt bearbeitet hat';

-- Index fuer Performance
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON bookings(created_by);
CREATE INDEX IF NOT EXISTS idx_bookings_updated_by ON bookings(updated_by);

-- =============================================================================
-- STEP 2: INVOICES - Bearbeiter-Tracking hinzufuegen
-- =============================================================================

-- Fuege created_by hinzu (falls nicht vorhanden)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Kommentare hinzufuegen
COMMENT ON COLUMN invoices.created_by IS 'Profil-ID des Benutzers, der die Rechnung erstellt hat';
COMMENT ON COLUMN invoices.updated_by IS 'Profil-ID des Benutzers, der die Rechnung zuletzt bearbeitet hat';

-- Index fuer Performance
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_updated_by ON invoices(updated_by);

-- =============================================================================
-- STEP 3: QUOTES - Bearbeiter-Tracking hinzufuegen
-- =============================================================================

-- Pruefe ob quotes Tabelle existiert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
    -- Fuege created_by hinzu (falls nicht vorhanden)
    EXECUTE 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL';
    EXECUTE 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL';
    
    -- Kommentare hinzufuegen
    EXECUTE 'COMMENT ON COLUMN quotes.created_by IS ''Profil-ID des Benutzers, der das Angebot erstellt hat''';
    EXECUTE 'COMMENT ON COLUMN quotes.updated_by IS ''Profil-ID des Benutzers, der das Angebot zuletzt bearbeitet hat''';
    
    -- Index fuer Performance
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_quotes_updated_by ON quotes(updated_by)';
  ELSE
    RAISE NOTICE 'Tabelle quotes existiert nicht - ueberspringe';
  END IF;
END $$;

-- =============================================================================
-- STEP 4: Trigger fuer automatisches updated_by Setzen
-- =============================================================================

-- Funktion: Setze updated_by automatisch bei UPDATE
CREATE OR REPLACE FUNCTION set_updated_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Setze updated_by auf aktuellen Benutzer
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

-- Trigger fuer bookings
DROP TRIGGER IF EXISTS trigger_bookings_updated_by ON bookings;
CREATE TRIGGER trigger_bookings_updated_by
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_by();

-- Trigger fuer invoices
DROP TRIGGER IF EXISTS trigger_invoices_updated_by ON invoices;
CREATE TRIGGER trigger_invoices_updated_by
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_by();

-- Trigger fuer quotes (nur wenn Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_quotes_updated_by ON quotes';
    EXECUTE 'CREATE TRIGGER trigger_quotes_updated_by BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION set_updated_by()';
  END IF;
END $$;

-- =============================================================================
-- STEP 5: Verifizierung
-- =============================================================================

-- Pruefe ob alle Spalten korrekt hinzugefuegt wurden
DO $$
DECLARE
  bookings_created_by_exists BOOLEAN;
  bookings_updated_by_exists BOOLEAN;
  invoices_created_by_exists BOOLEAN;
  invoices_updated_by_exists BOOLEAN;
  quotes_created_by_exists BOOLEAN;
  quotes_updated_by_exists BOOLEAN;
BEGIN
  -- Pruefe bookings
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'created_by'
  ) INTO bookings_created_by_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'updated_by'
  ) INTO bookings_updated_by_exists;
  
  -- Pruefe invoices
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'created_by'
  ) INTO invoices_created_by_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'updated_by'
  ) INTO invoices_updated_by_exists;
  
  -- Pruefe quotes (nur wenn Tabelle existiert)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'created_by'
    ) INTO quotes_created_by_exists;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'updated_by'
    ) INTO quotes_updated_by_exists;
  ELSE
    quotes_created_by_exists := true; -- Nicht vorhanden, aber OK
    quotes_updated_by_exists := true;
  END IF;
  
  -- Ausgabe
  IF bookings_created_by_exists AND bookings_updated_by_exists 
     AND invoices_created_by_exists AND invoices_updated_by_exists 
     AND quotes_created_by_exists AND quotes_updated_by_exists THEN
    RAISE NOTICE 'Bearbeiter-Tracking erfolgreich eingerichtet';
    RAISE NOTICE '  bookings: created_by=%, updated_by=%', bookings_created_by_exists, bookings_updated_by_exists;
    RAISE NOTICE '  invoices: created_by=%, updated_by=%', invoices_created_by_exists, invoices_updated_by_exists;
    RAISE NOTICE '  quotes: created_by=%, updated_by=%', quotes_created_by_exists, quotes_updated_by_exists;
  ELSE
    RAISE WARNING 'Einige Spalten fehlen noch!';
  END IF;
END $$;

-- Zeige alle Trigger
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%updated_by%'
ORDER BY event_object_table, trigger_name;

