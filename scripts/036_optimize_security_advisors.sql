-- =============================================================================
-- MIGRATION 036: Security Advisors Optimierung
-- =============================================================================
-- Datum: 2025-12-XX
-- Beschreibung: Optimiert Security Advisors gemäß Best Practices
-- =============================================================================

-- =============================================================================
-- STEP 1: Function search_path setzen
-- =============================================================================

-- Prüfe ob Funktionen ohne search_path existieren
DO $$
DECLARE
  func_record RECORD;
  func_count INTEGER := 0;
BEGIN
  -- Finde Funktionen ohne expliziten search_path
  FOR func_record IN
    SELECT 
      p.proname as function_name,
      pg_get_functiondef(p.oid) as function_def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND pg_get_functiondef(p.oid) NOT LIKE '%SET search_path%'
  LOOP
    func_count := func_count + 1;
    RAISE NOTICE 'Funktion ohne search_path gefunden: %', func_record.function_name;
  END LOOP;
  
  IF func_count > 0 THEN
    RAISE NOTICE 'Hinweis: % Funktion(en) ohne expliziten search_path gefunden. Bitte manuell prüfen und search_path setzen.', func_count;
  ELSE
    RAISE NOTICE 'Alle Funktionen haben search_path gesetzt.';
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Extension verschieben (wenn nötig)
-- =============================================================================

-- Prüfe Extensions im public Schema
DO $$
DECLARE
  ext_record RECORD;
BEGIN
  FOR ext_record IN
    SELECT extname
    FROM pg_extension
    WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    RAISE NOTICE 'Extension im public Schema gefunden: %. Bitte prüfen ob Verschiebung in separates Schema sinnvoll ist.', ext_record.extname;
  END LOOP;
END $$;

-- =============================================================================
-- STEP 3: Leaked password protection aktivieren
-- =============================================================================

-- Prüfe ob pg_trgm Extension für Passwort-Prüfung verfügbar ist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    RAISE NOTICE 'pg_trgm Extension nicht gefunden. Für erweiterte Passwort-Prüfung installieren: CREATE EXTENSION IF NOT EXISTS pg_trgm;';
  ELSE
    RAISE NOTICE 'pg_trgm Extension ist installiert.';
  END IF;
END $$;

-- =============================================================================
-- STEP 4: RLS auf kritischen Tabellen prüfen
-- =============================================================================

DO $$
DECLARE
  table_record RECORD;
  rls_enabled BOOLEAN;
  critical_tables TEXT[] := ARRAY['profiles', 'companies', 'bookings', 'invoices', 'customers', 'drivers', 'vehicles'];
  missing_rls TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = ANY(critical_tables)
  LOOP
    -- Prüfe ob RLS aktiviert ist
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_record.tablename
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF NOT rls_enabled THEN
      missing_rls := array_append(missing_rls, table_record.tablename);
      RAISE WARNING 'RLS nicht aktiviert auf Tabelle: %', table_record.tablename;
    END IF;
  END LOOP;
  
  IF array_length(missing_rls, 1) > 0 THEN
    RAISE WARNING 'Folgende kritische Tabellen haben kein RLS aktiviert: %', array_to_string(missing_rls, ', ');
  ELSE
    RAISE NOTICE 'Alle kritischen Tabellen haben RLS aktiviert.';
  END IF;
END $$;

-- =============================================================================
-- STEP 5: Indizes auf sensiblen Spalten prüfen
-- =============================================================================

-- Prüfe ob Indizes auf sensiblen Spalten vorhanden sind
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  -- Prüfe Indizes auf email-Spalten
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexdef LIKE '%email%';
  
  IF index_count = 0 THEN
    RAISE NOTICE 'Hinweis: Keine Indizes auf email-Spalten gefunden. Für Performance empfohlen.';
  ELSE
    RAISE NOTICE 'Gefunden: % Index(es) auf email-Spalten.', index_count;
  END IF;
END $$;

-- =============================================================================
-- STEP 6: Verifizierung
-- =============================================================================

DO $$
DECLARE
  security_score INTEGER := 100;
  issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Prüfe RLS
  IF EXISTS (
    SELECT 1 FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
      AND t.tablename IN ('profiles', 'companies', 'bookings')
      AND NOT c.relrowsecurity
  ) THEN
    security_score := security_score - 20;
    issues := array_append(issues, 'RLS fehlt auf kritischen Tabellen');
  END IF;
  
  -- Prüfe Extensions
  IF EXISTS (
    SELECT 1 FROM pg_extension
    WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    security_score := security_score - 10;
    issues := array_append(issues, 'Extensions im public Schema');
  END IF;
  
  -- Ausgabe
  IF array_length(issues, 1) > 0 THEN
    RAISE WARNING 'Security Score: %%. Gefundene Probleme: %', security_score, array_to_string(issues, ', ');
  ELSE
    RAISE NOTICE 'Security Score: %%. Keine kritischen Probleme gefunden.', security_score;
  END IF;
END $$;

-- =============================================================================
-- Zusammenfassung
-- =============================================================================

-- Diese Migration prüft und dokumentiert Security-Probleme
-- Sie führt keine automatischen Änderungen durch, sondern informiert nur
-- Kritische Änderungen müssen manuell durchgeführt werden:
-- 1. Function search_path bei allen Funktionen setzen
-- 2. Extensions in separates Schema verschieben (optional)
-- 3. pg_trgm für Passwort-Prüfung installieren (optional)
-- 4. RLS auf allen kritischen Tabellen aktivieren (falls noch nicht geschehen)

