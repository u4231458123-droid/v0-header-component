-- =============================================================================
-- MIGRATION 032: Mitarbeiter-Dokumenten-System
-- =============================================================================
-- Datum: 2025-12-04
-- Beschreibung: Erweitert das Dokumenten-System um Mitarbeiter-Dokumente
--               (Krankenkassenkarte, Bankverbindung, Arbeitsvertrag, etc.)
-- =============================================================================

-- =============================================================================
-- STEP 1: Erweitere documents.owner_type um 'employee'
-- =============================================================================

-- Entferne alte CHECK-Constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_owner_type_check;

-- Fuege neue CHECK-Constraint mit 'employee' hinzu
ALTER TABLE documents ADD CONSTRAINT documents_owner_type_check 
  CHECK (owner_type IN ('driver', 'company', 'employee'));

-- =============================================================================
-- STEP 2: Fuege profile_id zu documents hinzu (fuer Mitarbeiter-Zuordnung)
-- =============================================================================

-- Fuege profile_id Spalte hinzu (falls nicht vorhanden)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Kommentar hinzufuegen
COMMENT ON COLUMN documents.profile_id IS 'Zuordnung zu Team-Mitglied (Mitarbeiter) wenn owner_type = employee';

-- =============================================================================
-- STEP 3: Erweitere document_type um Mitarbeiter-Dokumente
-- =============================================================================

-- Entferne alte CHECK-Constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Fuege neue CHECK-Constraint mit Mitarbeiter-Dokumenten hinzu
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
    -- Mitarbeiter-Dokumente (NEU)
    'health_insurance_card', -- Krankenkassenkarte
    'bank_card', -- Bankverbindung/Karte
    'employment_contract', -- Arbeitsvertrag
    'qualification_certificate', -- Qualifikationsnachweis
    'reference_letter', -- Zeugnis
    'employee_other', -- Sonstige Mitarbeiter-Dokumente
    -- Allgemein
    'other'
  ));

-- =============================================================================
-- STEP 4: Erweitere RLS-Policies fuer Mitarbeiter-Dokumente
-- =============================================================================

-- Policy: Mitarbeiter koennen eigene Dokumente sehen
CREATE POLICY IF NOT EXISTS "employees_can_view_own_documents" ON documents
  FOR SELECT
  TO authenticated
  USING (
    owner_type = 'employee' 
    AND profile_id = auth.uid()
  );

-- Policy: Mitarbeiter koennen eigene Dokumente hochladen
CREATE POLICY IF NOT EXISTS "employees_can_upload_own_documents" ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_type = 'employee' 
    AND profile_id = auth.uid()
    AND company_id = auth_user_company_id()
  );

-- Policy: Company-Admins koennen alle Mitarbeiter-Dokumente ihrer Firma sehen
CREATE POLICY IF NOT EXISTS "company_admins_can_view_employee_documents" ON documents
  FOR SELECT
  TO authenticated
  USING (
    owner_type = 'employee'
    AND company_id = auth_user_company_id()
    AND (
      -- Owner/Admin des Unternehmens
      auth_user_is_owner() = true
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND company_id = documents.company_id 
        AND role IN ('admin', 'owner')
      )
    )
  );

-- Policy: Company-Admins koennen Mitarbeiter-Dokumente verwalten
CREATE POLICY IF NOT EXISTS "company_admins_can_manage_employee_documents" ON documents
  FOR ALL
  TO authenticated
  USING (
    owner_type = 'employee'
    AND company_id = auth_user_company_id()
    AND (
      auth_user_is_owner() = true
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND company_id = documents.company_id 
        AND role IN ('admin', 'owner')
      )
    )
  )
  WITH CHECK (
    owner_type = 'employee'
    AND company_id = auth_user_company_id()
    AND (
      auth_user_is_owner() = true
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND company_id = documents.company_id 
        AND role IN ('admin', 'owner')
      )
    )
  );

-- =============================================================================
-- STEP 5: Index fuer Performance
-- =============================================================================

-- Index auf profile_id fuer schnelle Mitarbeiter-Dokument-Abfragen
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON documents(profile_id);

-- Index auf owner_type + profile_id fuer kombinierte Abfragen
CREATE INDEX IF NOT EXISTS idx_documents_owner_profile ON documents(owner_type, profile_id) 
  WHERE owner_type = 'employee';

-- =============================================================================
-- STEP 6: Verifizierung
-- =============================================================================

-- Pruefe ob alle Constraints korrekt gesetzt sind
DO $$
DECLARE
  owner_type_check_exists BOOLEAN;
  document_type_check_exists BOOLEAN;
  profile_id_exists BOOLEAN;
BEGIN
  -- Pruefe owner_type constraint
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_owner_type_check'
    AND table_name = 'documents'
  ) INTO owner_type_check_exists;
  
  -- Pruefe document_type constraint
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_document_type_check'
    AND table_name = 'documents'
  ) INTO document_type_check_exists;
  
  -- Pruefe profile_id Spalte
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'profile_id'
  ) INTO profile_id_exists;
  
  IF owner_type_check_exists AND document_type_check_exists AND profile_id_exists THEN
    RAISE NOTICE 'Mitarbeiter-Dokumenten-System erfolgreich eingerichtet';
  ELSE
    RAISE WARNING 'Einige Komponenten fehlen: owner_type_check=%, document_type_check=%, profile_id=%', 
      owner_type_check_exists, document_type_check_exists, profile_id_exists;
  END IF;
END $$;

-- Zeige alle Policies fuer documents
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'documents'
ORDER BY policyname;

