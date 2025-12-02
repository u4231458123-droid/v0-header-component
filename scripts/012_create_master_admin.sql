-- =====================================================
-- MyDispatch Master Admin Account
-- =====================================================
-- Dieses Script erstellt den dauerhaften Master-Admin-Account
-- mit vollständigen Systemrechten.
--
-- WICHTIG: Vor Ausführung muss der Benutzer in Supabase Auth
-- manuell erstellt werden, da Auth-Benutzer nicht per SQL
-- erstellt werden können.
-- =====================================================

-- Master Admin Profil erstellen/aktualisieren
-- Nach Auth-Registrierung dieses Script ausführen

DO $$
DECLARE
  master_user_id UUID;
BEGIN
  -- Suche nach existierendem Auth-Benutzer
  SELECT id INTO master_user_id
  FROM auth.users
  WHERE email = 'courbois1981@gmail.com';

  IF master_user_id IS NOT NULL THEN
    -- Profil erstellen oder aktualisieren
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      role,
      phone,
      created_at,
      updated_at
    ) VALUES (
      master_user_id,
      'Master Administrator',
      'courbois1981@gmail.com',
      'master_admin',
      '+49 000 0000000',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'master_admin',
      full_name = 'Master Administrator',
      updated_at = NOW();

    RAISE NOTICE 'Master Admin Profil erstellt/aktualisiert für User ID: %', master_user_id;
  ELSE
    RAISE NOTICE 'Benutzer nicht gefunden. Bitte erst in Supabase Auth registrieren.';
  END IF;
END $$;

-- Zusätzliche RLS Policy für Master Admin (falls nicht vorhanden)
-- Master Admins haben Vollzugriff auf ALLE Daten

-- Companies Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full company access' 
    AND tablename = 'companies'
  ) THEN
    CREATE POLICY "Master admins have full company access"
    ON public.companies
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
      )
    );
  END IF;
END $$;

-- Profiles Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full access' 
    AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Master admins have full access"
    ON public.profiles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'master_admin'
      )
    );
  END IF;
END $$;

-- Bookings Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full booking access' 
    AND tablename = 'bookings'
  ) THEN
    CREATE POLICY "Master admins have full booking access"
    ON public.bookings
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
      )
    );
  END IF;
END $$;

-- Drivers Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full driver access' 
    AND tablename = 'drivers'
  ) THEN
    CREATE POLICY "Master admins have full driver access"
    ON public.drivers
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
      )
    );
  END IF;
END $$;

-- Vehicles Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full vehicle access' 
    AND tablename = 'vehicles'
  ) THEN
    CREATE POLICY "Master admins have full vehicle access"
    ON public.vehicles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
      )
    );
  END IF;
END $$;

-- Customers Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full customer access' 
    AND tablename = 'customers'
  ) THEN
    CREATE POLICY "Master admins have full customer access"
    ON public.customers
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
      )
    );
  END IF;
END $$;

-- Invoices Policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Master admins have full invoice access' 
    AND tablename = 'invoices'
  ) THEN
    CREATE POLICY "Master admins have full invoice access"
    ON public.invoices
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
      )
    );
  END IF;
END $$;
