-- Add missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS contact_person text,
ADD COLUMN IF NOT EXISTS address_type text,
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS business_postal_code text,
ADD COLUMN IF NOT EXISTS business_city text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add comment
COMMENT ON COLUMN customers.mobile IS 'Mobile phone number';
COMMENT ON COLUMN customers.company_name IS 'Company name for business customers';
COMMENT ON COLUMN customers.contact_person IS 'Contact person name for business customers';
COMMENT ON COLUMN customers.address_type IS 'private or business';
COMMENT ON COLUMN customers.business_address IS 'Business address if different from private';
COMMENT ON COLUMN customers.status IS 'Customer status: active, inactive, blocked';
