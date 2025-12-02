# Datenbank

## Supabase Setup

MyDispatch verwendet Supabase als Backend mit PostgreSQL und Row Level Security.

## Tabellen

### users (auth.users)
Supabase Auth - automatisch verwaltet.

### profiles
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### companies
\`\`\`sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### subscription_plans
\`\`\`sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER,
  price_yearly INTEGER,
  max_drivers INTEGER,
  max_vehicles INTEGER,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT
);
\`\`\`

## Row Level Security

Alle Tabellen haben RLS aktiviert:

\`\`\`sql
-- Beispiel für companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company"
ON companies FOR SELECT
USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
\`\`\`

## Migrations

SQL-Skripte liegen in `/scripts/` und werden über die v0-UI ausgeführt.
