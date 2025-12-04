-- =============================================================================
-- MIGRATION 035: Dokumentations-Tabelle für persistente Speicherung
-- =============================================================================
-- Datum: 2025-12-XX
-- Beschreibung: Erstellt Tabelle für persistente Speicherung von Dokumentationen
--               aus der Auto-Documentation Engine
-- =============================================================================

-- =============================================================================
-- STEP 1: Dokumentations-Tabelle erstellen
-- =============================================================================

CREATE TABLE IF NOT EXISTS documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadaten
  category TEXT NOT NULL CHECK (category IN (
    'change-log',
    'error-documentation',
    'feature-documentation',
    'architecture-decision',
    'optimization-report'
  )),
  author TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0',
  
  -- Inhalt
  summary TEXT,
  content TEXT NOT NULL,
  
  -- Referenzen und Historie (JSONB für Flexibilität)
  references JSONB DEFAULT '[]'::jsonb,
  change_history JSONB DEFAULT '[]'::jsonb,
  
  -- Multi-Tenant Support (optional, für company-spezifische Dokumentationen)
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- STEP 2: Indizes für Performance
-- =============================================================================

-- Index für Kategorie-Suche
CREATE INDEX IF NOT EXISTS idx_documentation_category ON documentation(category);

-- Index für Autor-Suche
CREATE INDEX IF NOT EXISTS idx_documentation_author ON documentation(author);

-- Index für Company-spezifische Abfragen
CREATE INDEX IF NOT EXISTS idx_documentation_company_id ON documentation(company_id) WHERE company_id IS NOT NULL;

-- Index für Volltext-Suche (PostgreSQL Full-Text Search)
CREATE INDEX IF NOT EXISTS idx_documentation_content_search ON documentation USING gin(to_tsvector('german', content));

-- Index für Referenzen-Suche (JSONB)
CREATE INDEX IF NOT EXISTS idx_documentation_references ON documentation USING gin(references);

-- =============================================================================
-- STEP 3: RLS (Row Level Security) aktivieren
-- =============================================================================

ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Policy: Alle authentifizierten Benutzer können Dokumentationen lesen
CREATE POLICY "documentation_select_authenticated"
ON documentation FOR SELECT
TO authenticated
USING (true); -- Alle Dokumentationen sind lesbar für authentifizierte Benutzer

-- Policy: Nur der Autor kann seine eigenen Dokumentationen bearbeiten
CREATE POLICY "documentation_update_author"
ON documentation FOR UPDATE
TO authenticated
USING (author = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Policy: Alle authentifizierten Benutzer können neue Dokumentationen erstellen
CREATE POLICY "documentation_insert_authenticated"
ON documentation FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Nur der Autor kann Dokumentationen löschen
CREATE POLICY "documentation_delete_author"
ON documentation FOR DELETE
TO authenticated
USING (author = (SELECT email FROM profiles WHERE id = auth.uid()));

-- =============================================================================
-- STEP 4: Trigger für automatisches updated_at
-- =============================================================================

-- Trigger-Funktion (falls noch nicht vorhanden)
CREATE OR REPLACE FUNCTION update_documentation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger anwenden
DROP TRIGGER IF EXISTS trigger_documentation_updated_at ON documentation;
CREATE TRIGGER trigger_documentation_updated_at
  BEFORE UPDATE ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_documentation_updated_at();

-- =============================================================================
-- STEP 5: Kommentare für Dokumentation
-- =============================================================================

COMMENT ON TABLE documentation IS 'Persistente Speicherung für Auto-Documentation Engine';
COMMENT ON COLUMN documentation.category IS 'Kategorie der Dokumentation (change-log, error-documentation, feature-documentation, architecture-decision, optimization-report)';
COMMENT ON COLUMN documentation.author IS 'Autor der Dokumentation (Agent-Name oder E-Mail)';
COMMENT ON COLUMN documentation.summary IS 'AI-generierte Kurzzusammenfassung';
COMMENT ON COLUMN documentation.content IS 'Hauptinhalt der Dokumentation';
COMMENT ON COLUMN documentation.references IS 'JSONB-Array mit Referenzen zu verwandten Dokumenten';
COMMENT ON COLUMN documentation.change_history IS 'JSONB-Array mit Änderungshistorie';
COMMENT ON COLUMN documentation.company_id IS 'Optional: Company-ID für company-spezifische Dokumentationen';

-- =============================================================================
-- STEP 6: Verifizierung
-- =============================================================================

-- Prüfe ob Tabelle korrekt erstellt wurde
DO $$
DECLARE
  table_exists BOOLEAN;
  index_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Prüfe Tabelle
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'documentation'
  ) INTO table_exists;
  
  -- Prüfe Indizes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'documentation';
  
  -- Prüfe Policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'documentation';
  
  -- Ausgabe
  IF table_exists AND index_count >= 5 AND policy_count >= 4 THEN
    RAISE NOTICE 'Dokumentations-Tabelle erfolgreich erstellt';
    RAISE NOTICE '  Tabelle: %, Indizes: %, Policies: %', table_exists, index_count, policy_count;
  ELSE
    RAISE WARNING 'Einige Komponenten fehlen noch!';
    RAISE WARNING '  Tabelle: %, Indizes: %, Policies: %', table_exists, index_count, policy_count;
  END IF;
END $$;

-- Zeige alle Indizes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'documentation'
ORDER BY indexname;

-- Zeige alle Policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'documentation'
ORDER BY policyname;

