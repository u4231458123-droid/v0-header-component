-- =====================================================
-- MIGRATION: Fehlende Insurance-Spalten hinzufuegen
-- Datum: 29.11.2024
-- Beschreibung: Fuegt alle fehlenden Spalten zur vehicle_insurance-Tabelle hinzu
-- =====================================================

-- 1. SF-Klasse Haftpflicht
ALTER TABLE public.vehicle_insurance
ADD COLUMN IF NOT EXISTS sf_class_liability text;

-- 2. SF-Klasse Kasko
ALTER TABLE public.vehicle_insurance
ADD COLUMN IF NOT EXISTS sf_class_kasko text;

-- 3. Selbstbeteiligung Teilkasko
ALTER TABLE public.vehicle_insurance
ADD COLUMN IF NOT EXISTS deductible_partial integer;

-- 4. Selbstbeteiligung Vollkasko
ALTER TABLE public.vehicle_insurance
ADD COLUMN IF NOT EXISTS deductible_full integer;

-- 5. Versicherungsnehmer (falls abweichend)
ALTER TABLE public.vehicle_insurance
ADD COLUMN IF NOT EXISTS policy_holder text;

COMMENT ON COLUMN public.vehicle_insurance.sf_class_liability IS 'Schadenfreiheitsklasse Haftpflicht (z.B. SF15)';
COMMENT ON COLUMN public.vehicle_insurance.sf_class_kasko IS 'Schadenfreiheitsklasse Kasko (z.B. SF5)';
COMMENT ON COLUMN public.vehicle_insurance.deductible_partial IS 'Selbstbeteiligung Teilkasko in EUR';
COMMENT ON COLUMN public.vehicle_insurance.deductible_full IS 'Selbstbeteiligung Vollkasko in EUR';
COMMENT ON COLUMN public.vehicle_insurance.policy_holder IS 'Versicherungsnehmer (Name)';
