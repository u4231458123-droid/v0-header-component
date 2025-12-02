-- Add missing columns to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS concession_number text,
ADD COLUMN IF NOT EXISTS concession_due_date date,
ADD COLUMN IF NOT EXISTS fahrzeugschein_url text,
ADD COLUMN IF NOT EXISTS konzessionsauszug_url text;

-- Add comment
COMMENT ON COLUMN vehicles.concession_number IS 'Taxi/Mietwagen Konzessionsnummer';
COMMENT ON COLUMN vehicles.concession_due_date IS 'Konzession expiry date';
COMMENT ON COLUMN vehicles.fahrzeugschein_url IS 'Vehicle registration document URL';
COMMENT ON COLUMN vehicles.konzessionsauszug_url IS 'Concession extract document URL';
