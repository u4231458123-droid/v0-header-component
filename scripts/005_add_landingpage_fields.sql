-- Add landingpage-specific fields to companies table if not exists
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS company_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS landingpage_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS widget_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS landingpage_title TEXT,
ADD COLUMN IF NOT EXISTS landingpage_description TEXT,
ADD COLUMN IF NOT EXISTS landingpage_hero_text TEXT,
ADD COLUMN IF NOT EXISTS widget_button_text TEXT DEFAULT 'Online buchen',
ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- Create index on company_slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(company_slug);

-- Add RLS policy for public landingpage access
CREATE POLICY "Public landingpages are viewable by anyone"
ON companies FOR SELECT
USING (landingpage_enabled = true);

-- Sample data for testing
UPDATE companies 
SET 
  company_slug = 'demo-taxi',
  landingpage_enabled = true,
  widget_enabled = true,
  landingpage_title = 'Ihr zuverlässiges Taxi-Unternehmen',
  landingpage_hero_text = 'Schnell, sicher und komfortabel an Ihr Ziel',
  business_hours = '{
    "Montag": "00:00 - 24:00",
    "Dienstag": "00:00 - 24:00",
    "Mittwoch": "00:00 - 24:00",
    "Donnerstag": "00:00 - 24:00",
    "Freitag": "00:00 - 24:00",
    "Samstag": "00:00 - 24:00",
    "Sonntag": "00:00 - 24:00"
  }'::jsonb
WHERE email = 'info@my-dispatch.de';
