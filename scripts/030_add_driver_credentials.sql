-- Add fields for driver authentication
-- must_change_password: Flag to force password change on first login

ALTER TABLE drivers 
  ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;

-- Create unique index for username per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_company_username 
  ON drivers(company_id, username) 
  WHERE username IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN drivers.must_change_password IS 'Force password change on first login for legal compliance';
COMMENT ON COLUMN drivers.username IS 'Username for driver login (unique per company)';
COMMENT ON COLUMN drivers.last_login_at IS 'Timestamp of last successful login';
