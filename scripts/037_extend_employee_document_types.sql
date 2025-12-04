-- =============================================================================
-- MIGRATION 037: Erweiterte Mitarbeiter-Dokumenttypen
-- =============================================================================
-- Datum: 2025-12-04
-- Beschreibung: Fügt zusätzliche Dokumenttypen für Mitarbeiter hinzu
--               (Sozialversicherungsausweis, Steuer-ID, Gesundheitszeugnis, etc.)
-- =============================================================================

-- =============================================================================
-- STEP 1: Erweitere document_type CHECK-Constraint
-- =============================================================================

-- Entferne alte CHECK-Constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Füge neue CHECK-Constraint mit ALLEN Dokumenttypen hinzu
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
  CHECK (document_type IN (
    -- Fahrer-Dokumente
    'drivers_license', 
    'drivers_license_back',
    'passenger_transport_permit', -- P-Schein / PBefG
    'id_card', 
    'id_card_back',
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
    -- Mitarbeiter-Dokumente (erweitert)
    'health_insurance_card', -- Krankenkassenkarte
    'health_certificate', -- Gesundheitszeugnis (NEU)
    'bank_card', -- Bankverbindung/Karte (legacy)
    'bank_details', -- Bankverbindung (NEU - bevorzugt)
    'employment_contract', -- Arbeitsvertrag
    'social_security_card', -- Sozialversicherungsausweis (NEU)
    'tax_id_confirmation', -- Steuer-ID Bestätigung (NEU)
    'qualification_certificate', -- Qualifikationsnachweis
    'reference_letter', -- Zeugnis
    'employee_other', -- Sonstige Mitarbeiter-Dokumente
    -- Allgemein
    'other'
  ));

-- =============================================================================
-- STEP 2: Kommentare für neue Dokumenttypen
-- =============================================================================

COMMENT ON CONSTRAINT documents_document_type_check ON documents IS 
  'Erlaubte Dokumenttypen für Fahrer, Unternehmen und Mitarbeiter. 
   Erweitert in Migration 037 um: social_security_card, tax_id_confirmation, 
   health_certificate, bank_details';

-- =============================================================================
-- STEP 3: Verifizierung
-- =============================================================================

DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_document_type_check'
    AND table_name = 'documents'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    RAISE NOTICE 'Erweiterte Dokumenttypen erfolgreich hinzugefügt';
    RAISE NOTICE 'Neue Typen: social_security_card, tax_id_confirmation, health_certificate, bank_details';
  ELSE
    RAISE WARNING 'CHECK-Constraint wurde nicht korrekt erstellt!';
  END IF;
END $$;


