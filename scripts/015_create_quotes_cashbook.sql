-- ==================================================================================
-- MIGRATION 015: Angebote (Quotes) und Kassenbuch (Cash Book) System
-- ==================================================================================
-- Erstellt am: 2024-11-27
-- Beschreibung: Erweitert das System um Angebotsverwaltung und deutsches Kassenbuch
-- ==================================================================================

-- ==================================================================================
-- 1. ANGEBOTE (QUOTES) TABELLE
-- ==================================================================================
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

    -- Angebotsnummer (fortlaufend pro Unternehmen)
    quote_number VARCHAR(50) NOT NULL,

    -- Status: draft, sent, accepted, rejected, expired, converted
    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    -- Gültigkeitsdauer
    valid_until DATE,

    -- Beträge
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Fahrt-Referenz (optional - wenn Angebot für eine Fahrt)
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Fahrtdetails direkt im Angebot
    pickup_address TEXT,
    dropoff_address TEXT,
    pickup_date DATE,
    pickup_time TIME,
    passengers INTEGER DEFAULT 1,
    vehicle_type VARCHAR(50),
    distance_km DECIMAL(10,2),
    estimated_duration INTEGER, -- in Minuten

    -- Notizen
    notes TEXT,
    internal_notes TEXT,

    -- Zahlungsbedingungen
    payment_terms TEXT,

    -- Konvertierung zu Rechnung
    converted_to_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,

    -- PDF URL
    pdf_url TEXT,

    -- Versand
    sent_at TIMESTAMPTZ,
    sent_to_email VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- ==================================================================================
-- 2. ANGEBOTSPOSITIONEN (QUOTE ITEMS) TABELLE
-- ==================================================================================
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

    -- Position
    position INTEGER NOT NULL DEFAULT 1,

    -- Beschreibung
    description TEXT NOT NULL,

    -- Mengenangaben
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'Stück',

    -- Preise
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

-- ==================================================================================
-- 3. KASSENBUCH (CASH BOOK) TABELLE - Nach deutschen GoBD Vorgaben
-- ==================================================================================
CREATE TABLE IF NOT EXISTS cash_book_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Fortlaufende Belegnummer (pro Unternehmen und Jahr)
    entry_number VARCHAR(20) NOT NULL,

    -- Datum des Geschäftsvorfalls
    entry_date DATE NOT NULL,

    -- Buchungstext (Beschreibung)
    description TEXT NOT NULL,

    -- Typ: income (Einnahme) oder expense (Ausgabe)
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('income', 'expense')),

    -- Beträge
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),

    -- Saldo nach dieser Buchung
    balance_after DECIMAL(10,2) NOT NULL,

    -- Kategorien für Auswertungen
    category VARCHAR(50),

    -- Steuerrelevante Angaben
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),

    -- Referenzen
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Belegnummer (extern - z.B. Quittungsnummer)
    receipt_number VARCHAR(50),

    -- Beleg-Upload
    receipt_url TEXT,

    -- Storno-Kennzeichen
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cancellation_reason TEXT,

    -- Erstellt von
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für Kassenbuch
CREATE INDEX IF NOT EXISTS idx_cash_book_company ON cash_book_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_book_date ON cash_book_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_cash_book_type ON cash_book_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_cash_book_number ON cash_book_entries(entry_number);

-- ==================================================================================
-- 4. KASSENBUCH TAGESABSCHLÜSSE (Daily Closings)
-- ==================================================================================
CREATE TABLE IF NOT EXISTS cash_book_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Datum des Tagesabschlusses
    closing_date DATE NOT NULL,

    -- Anfangsbestand
    opening_balance DECIMAL(10,2) NOT NULL,

    -- Summen
    total_income DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_expense DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Endbestand
    closing_balance DECIMAL(10,2) NOT NULL,

    -- Gezählter Kassenbestand (für Differenzen)
    counted_balance DECIMAL(10,2),
    difference DECIMAL(10,2) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'verified')),

    -- Abgeschlossen von
    closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Notizen
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cash_book_closings_unique ON cash_book_closings(company_id, closing_date);

-- ==================================================================================
-- 5. KASSENBUCH KATEGORIEN
-- ==================================================================================
CREATE TABLE IF NOT EXISTS cash_book_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'both')),

    -- Standard-Kategorien können nicht gelöscht werden
    is_system BOOLEAN DEFAULT FALSE,

    -- Sortierung
    sort_order INTEGER DEFAULT 0,

    -- Aktiv/Inaktiv
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_book_categories_company ON cash_book_categories(company_id);

-- ==================================================================================
-- 6. STANDARD-KATEGORIEN EINFÜGEN
-- ==================================================================================
-- Diese werden pro Unternehmen bei Bedarf erstellt (via Trigger oder Application)

-- ==================================================================================
-- 7. TRIGGER FÜR UPDATED_AT
-- ==================================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cash_book_entries_updated_at ON cash_book_entries;
CREATE TRIGGER update_cash_book_entries_updated_at
    BEFORE UPDATE ON cash_book_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================================================
-- 8. FUNKTION: Nächste Angebotsnummer generieren
-- ==================================================================================
CREATE OR REPLACE FUNCTION get_next_quote_number(p_company_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_year VARCHAR(4);
    v_count INTEGER;
    v_number VARCHAR(50);
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COUNT(*) + 1 INTO v_count
    FROM quotes
    WHERE company_id = p_company_id
    AND quote_number LIKE 'ANG-' || v_year || '-%';

    v_number := 'ANG-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- ==================================================================================
-- 9. FUNKTION: Nächste Kassenbuch-Belegnummer generieren
-- ==================================================================================
CREATE OR REPLACE FUNCTION get_next_cash_book_entry_number(p_company_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_year VARCHAR(4);
    v_count INTEGER;
    v_number VARCHAR(20);
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COUNT(*) + 1 INTO v_count
    FROM cash_book_entries
    WHERE company_id = p_company_id
    AND entry_number LIKE 'KB-' || v_year || '-%';

    v_number := 'KB-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- ==================================================================================
-- 10. RLS POLICIES
-- ==================================================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_book_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_book_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_book_categories ENABLE ROW LEVEL SECURITY;

-- Quotes Policies
CREATE POLICY quotes_company_access ON quotes
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Quote Items Policies
CREATE POLICY quote_items_company_access ON quote_items
    FOR ALL USING (
        quote_id IN (
            SELECT q.id FROM quotes q
            JOIN profiles p ON q.company_id = p.company_id
            WHERE p.id = auth.uid()
        )
    );

-- Cash Book Entries Policies
CREATE POLICY cash_book_entries_company_access ON cash_book_entries
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Cash Book Closings Policies
CREATE POLICY cash_book_closings_company_access ON cash_book_closings
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Cash Book Categories Policies
CREATE POLICY cash_book_categories_company_access ON cash_book_categories
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ==================================================================================
-- MIGRATION COMPLETE
-- ==================================================================================
