-- Add missing columns to vehicle_insurance table
ALTER TABLE vehicle_insurance
ADD COLUMN IF NOT EXISTS sf_class_liability text,
ADD COLUMN IF NOT EXISTS sf_class_kasko text,
ADD COLUMN IF NOT EXISTS deductible_partial integer,
ADD COLUMN IF NOT EXISTS deductible_full integer,
ADD COLUMN IF NOT EXISTS policy_holder text,
ADD COLUMN IF NOT EXISTS license_plate text;

-- Add comment
COMMENT ON COLUMN vehicle_insurance.sf_class_liability IS 'Schadenfreiheitsklasse Haftpflicht';
COMMENT ON COLUMN vehicle_insurance.sf_class_kasko IS 'Schadenfreiheitsklasse Kasko';
COMMENT ON COLUMN vehicle_insurance.deductible_partial IS 'Selbstbeteiligung Teilkasko (EUR)';
COMMENT ON COLUMN vehicle_insurance.deductible_full IS 'Selbstbeteiligung Vollkasko (EUR)';
COMMENT ON COLUMN vehicle_insurance.policy_holder IS 'Versicherungsnehmer';
COMMENT ON COLUMN vehicle_insurance.license_plate IS 'Vehicle license plate';
