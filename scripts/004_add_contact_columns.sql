-- Add missing columns to contact_requests table
ALTER TABLE contact_requests
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'general';

-- Add comment
COMMENT ON COLUMN contact_requests.company IS 'Company name of the contact';
COMMENT ON COLUMN contact_requests.phone IS 'Phone number of the contact';
COMMENT ON COLUMN contact_requests.type IS 'Type of inquiry: general, demo, support, sales';
