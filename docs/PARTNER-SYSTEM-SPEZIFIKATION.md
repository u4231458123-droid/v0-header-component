# Partner-Unternehmen-System - Vollständige Spezifikation

## Version 1.0 | Für Phase 2

---

## 1. ÜBERBLICK

Das Partner-System ermöglicht es MyDispatch-Unternehmen, sich zu vernetzen und Aufträge gegenseitig zuzuweisen.

**Use Case:**
Ein Taxi-Unternehmen A erhält eine Buchung, kann diese aber nicht bedienen (z.B. alle Fahrer sind belegt). Es weist den Auftrag einem Partner-Unternehmen B zu, das den Auftrag annimmt und abarbeitet.

---

## 2. DATENBANK-SCHEMA

### 2.1 Neue Tabelle: company_partnerships

\`\`\`sql
CREATE TABLE company_partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_a_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  company_b_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Status: pending (Anfrage offen), active (aktiv), blocked (geblockt)
  status TEXT CHECK (status IN ('pending', 'active', 'blocked')) DEFAULT 'pending',
  
  -- Wer hat die Verbindung angefragt?
  requested_by UUID REFERENCES companies(id) NOT NULL,
  
  -- Optionale Notiz
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  blocked_at TIMESTAMPTZ,
  blocked_by UUID REFERENCES companies(id),
  
  -- Verhindert Duplikate (A→B und B→A sind dasselbe)
  CONSTRAINT unique_partnership UNIQUE(company_a_id, company_b_id),
  -- Firma kann sich nicht selbst als Partner hinzufügen
  CONSTRAINT no_self_partnership CHECK(company_a_id != company_b_id)
);

-- Index für schnelle Abfragen
CREATE INDEX idx_partnerships_company_a ON company_partnerships(company_a_id);
CREATE INDEX idx_partnerships_company_b ON company_partnerships(company_b_id);
CREATE INDEX idx_partnerships_status ON company_partnerships(status);

-- RLS Policy
ALTER TABLE company_partnerships ENABLE ROW LEVEL SECURITY;

-- Unternehmen sieht nur eigene Partnerschaften
CREATE POLICY "view_own_partnerships"
ON company_partnerships
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE company_id IN (company_a_id, company_b_id)
  )
);

-- Unternehmen kann Partnerschaftsanfragen erstellen
CREATE POLICY "create_partnership_request"
ON company_partnerships
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE company_id = requested_by
  )
);

-- Unternehmen kann Status ändern (akzeptieren/blocken)
CREATE POLICY "update_own_partnership"
ON company_partnerships
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE company_id IN (company_a_id, company_b_id)
  )
);
\`\`\`

### 2.2 Erweitere bookings Tabelle

\`\`\`sql
-- Neue Spalten für Partner-Aufträge
ALTER TABLE bookings ADD COLUMN is_partner_booking BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN partner_company_id UUID REFERENCES companies(id);
ALTER TABLE bookings ADD COLUMN originating_company_id UUID REFERENCES companies(id);
ALTER TABLE bookings ADD COLUMN partner_notes TEXT;
ALTER TABLE bookings ADD COLUMN assigned_at TIMESTAMPTZ;

-- Index
CREATE INDEX idx_bookings_partner ON bookings(partner_company_id) WHERE is_partner_booking = TRUE;

-- RLS Policy: Partner sieht zugewiesene Aufträge
CREATE POLICY "partners_view_assigned_bookings"
ON bookings
FOR SELECT
USING (
  is_partner_booking = TRUE AND
  partner_company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Partner kann zugewiesene Aufträge bearbeiten
CREATE POLICY "partners_update_assigned_bookings"
ON bookings
FOR UPDATE
USING (
  is_partner_booking = TRUE AND
  partner_company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);
\`\`\`

---

## 3. BACKEND-LOGIK (Server Actions)

### 3.1 Partnership Management

\`\`\`typescript
// app/actions/partnerships.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function requestPartnership(partnerMdId: string, notes?: string) {
  const supabase = await createClient()
  
  // Get current user's company
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()
    
  if (!profile?.company_id) {
    return { success: false, error: 'No company assigned' }
  }
  
  // Find partner company by MD-ID (company_slug)
  const { data: partnerCompany } = await supabase
    .from('companies')
    .select('id, name')
    .eq('company_slug', partnerMdId)
    .single()
    
  if (!partnerCompany) {
    return { success: false, error: 'Partner nicht gefunden' }
  }
  
  // Check if partnership already exists
  const { data: existing } = await supabase
    .from('company_partnerships')
    .select('id, status')
    .or(`and(company_a_id.eq.${profile.company_id},company_b_id.eq.${partnerCompany.id}),and(company_a_id.eq.${partnerCompany.id},company_b_id.eq.${profile.company_id})`)
    .maybeSingle()
    
  if (existing) {
    if (existing.status === 'blocked') {
      return { success: false, error: 'Partnerschaft wurde blockiert' }
    }
    return { success: false, error: 'Partnerschaftsanfrage existiert bereits' }
  }
  
  // Create partnership request
  const { error } = await supabase
    .from('company_partnerships')
    .insert({
      company_a_id: profile.company_id,
      company_b_id: partnerCompany.id,
      requested_by: profile.company_id,
      notes,
      status: 'pending'
    })
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/partner')
  return { success: true }
}

export async function acceptPartnership(partnershipId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('company_partnerships')
    .update({
      status: 'active',
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', partnershipId)
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/partner')
  return { success: true }
}

export async function blockPartnership(partnershipId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()
  
  const { error } = await supabase
    .from('company_partnerships')
    .update({
      status: 'blocked',
      blocked_at: new Date().toISOString(),
      blocked_by: profile?.company_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', partnershipId)
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/partner')
  return { success: true }
}

export async function getActivePartners() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()
    
  if (!profile?.company_id) return []
  
  const { data: partnerships } = await supabase
    .from('company_partnerships')
    .select(`
      id,
      company_a_id,
      company_b_id,
      companies!company_a_id(id, name, company_slug),
      companies!company_b_id(id, name, company_slug)
    `)
    .eq('status', 'active')
    .or(`company_a_id.eq.${profile.company_id},company_b_id.eq.${profile.company_id}`)
    
  return partnerships || []
}
\`\`\`

### 3.2 Partner Booking Management

\`\`\`typescript
// app/actions/partner-bookings.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignBookingToPartner(
  bookingId: string,
  partnerCompanyId: string,
  notes?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()
    
  if (!profile?.company_id) {
    return { success: false, error: 'No company assigned' }
  }
  
  // Verify partnership is active
  const { data: partnership } = await supabase
    .from('company_partnerships')
    .select('id')
    .eq('status', 'active')
    .or(`and(company_a_id.eq.${profile.company_id},company_b_id.eq.${partnerCompanyId}),and(company_a_id.eq.${partnerCompanyId},company_b_id.eq.${profile.company_id})`)
    .maybeSingle()
    
  if (!partnership) {
    return { success: false, error: 'Keine aktive Partnerschaft' }
  }
  
  // Update booking
  const { error } = await supabase
    .from('bookings')
    .update({
      is_partner_booking: true,
      partner_company_id: partnerCompanyId,
      originating_company_id: profile.company_id,
      partner_notes: notes,
      assigned_at: new Date().toISOString(),
      status: 'assigned_to_partner'
    })
    .eq('id', bookingId)
    .eq('company_id', profile.company_id) // Nur eigene Aufträge
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  // TODO: Send notification email to partner
  
  revalidatePath('/auftraege')
  return { success: true }
}

export async function updatePartnerBookingStatus(
  bookingId: string,
  newStatus: string
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bookings')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .eq('is_partner_booking', true)
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/auftraege')
  return { success: true }
}
\`\`\`

---

## 4. FRONTEND-KOMPONENTEN

### 4.1 Partner-Übersicht (`app/partner/page.tsx`)

\`\`\`tsx
'use server'

import { getActivePartners } from '@/app/actions/partnerships'
import PartnerList from '@/components/partner/PartnerList'
import PartnerRequestForm from '@/components/partner/PartnerRequestForm'

export default async function PartnerPage() {
  const partners = await getActivePartners()
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Partner-Unternehmen</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Neue Partnerschaft anfragen */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Neuen Partner hinzufügen</h2>
          <PartnerRequestForm />
        </div>
        
        {/* Aktive Partner */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Aktive Partner ({partners.length})</h2>
          <PartnerList partners={partners} />
        </div>
      </div>
    </div>
  )
}
\`\`\`

### 4.2 Booking-Liste mit Partner-Filter

\`\`\`tsx
// components/bookings/BookingList.tsx (Erweiterung)

export function BookingList({ bookings }: { bookings: Booking[] }) {
  const [showPartnerOnly, setShowPartnerOnly] = useState(false)
  
  const filteredBookings = showPartnerOnly
    ? bookings.filter(b => b.is_partner_booking)
    : bookings
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPartnerOnly}
            onChange={(e) => setShowPartnerOnly(e.target.checked)}
          />
          <span>Nur Partner-Aufträge</span>
        </label>
      </div>
      
      <div className="space-y-4">
        {filteredBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
\`\`\`

---

## 5. SICHERHEITS-ANFORDERUNGEN

### 5.1 Datenschutz

**Was Partner SEHEN dürfen:**
- Zugewiesene Aufträge (Zeitpunkt, Abholung, Ziel, Passagierzahl)
- Status-Updates des Auftrags
- Kommunikation zu diesem Auftrag

**Was Partner NICHT sehen dürfen:**
- Andere Aufträge des Unternehmens
- Kundenlisten
- Fahrer-Listen
- Fahrzeug-Listen
- Statistiken
- Unternehmensdaten (außer Name)

### 5.2 RLS-Policies

\`\`\`sql
-- Partner sehen KEINE Kunden, Fahrer, Fahrzeuge
CREATE POLICY "partners_no_access_customers"
ON customers
FOR SELECT
USING (FALSE WHERE EXISTS (
  SELECT 1 FROM bookings
  WHERE bookings.customer_id = customers.id
  AND bookings.is_partner_booking = TRUE
  AND bookings.partner_company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
));
\`\`\`

---

## 6. REALTIME-SYNCHRONISATION

\`\`\`typescript
// hooks/use-partner-bookings.ts

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export function usePartnerBookings(companyId: string) {
  const [bookings, setBookings] = useState<any[]>([])
  const supabase = createBrowserClient()
  
  useEffect(() => {
    // Subscribe to partner bookings
    const channel = supabase
      .channel('partner-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `partner_company_id=eq.${companyId}`
        },
        (payload) => {
          console.log('[v0] Partner booking updated:', payload)
          // Update local state
          if (payload.eventType === 'INSERT') {
            setBookings(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev => 
              prev.map(b => b.id === payload.new.id ? payload.new : b)
            )
          }
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId])
  
  return bookings
}
\`\`\`

---

## 7. E-MAIL-BENACHRICHTIGUNGEN

\`\`\`typescript
// lib/email/partner-notifications.ts

export async function sendPartnerBookingNotification(
  partnerCompanyId: string,
  bookingDetails: any
) {
  // TODO: Implement with Resend or similar
  
  const emailContent = `
    Neuer Partner-Auftrag erhalten
    
    Sie haben einen neuen Auftrag von einem Partner-Unternehmen erhalten.
    
    Details:
    - Abholung: ${bookingDetails.pickup_address}
    - Ziel: ${bookingDetails.dropoff_address}
    - Zeit: ${bookingDetails.pickup_time}
    - Passagiere: ${bookingDetails.passengers}
    
    Bitte melden Sie sich an, um den Auftrag anzunehmen.
  `
  
  // Send email...
}
\`\`\`

---

## 8. TESTING-CHECKLISTE

### 8.1 Functional Tests

- [ ] Partnerschaftsanfrage erstellen
- [ ] Partnerschaftsanfrage akzeptieren
- [ ] Partnerschaft blocken
- [ ] Auftrag an Partner zuweisen
- [ ] Partner-Auftrag annehmen
- [ ] Status-Synchronisation testen
- [ ] RLS-Policies verifizieren

### 8.2 Security Tests

- [ ] Partner kann KEINE fremden Kunden sehen
- [ ] Partner kann KEINE fremden Fahrer sehen
- [ ] Partner kann KEINE Statistiken sehen
- [ ] Partner kann nur zugewiesene Aufträge bearbeiten
- [ ] Ungültige Partnerschaft wird abgelehnt

---

## 9. ROLLOUT-PLAN

### Phase 1: MVP (Minimum Viable Product)
- Basis-Partnerschaftsverwaltung
- Manuelle Auftragszuweisung
- Einfache Status-Updates

### Phase 2: Erweitert
- Realtime-Synchronisation
- Automatische E-Mail-Benachrichtigungen
- Erweiterte Filter & Suche

### Phase 3: Pro
- Vermittlungs-Provisionen
- Automatische Auftragsvergabe
- Partner-Statistiken & Analytics

---

**Erstellt:** 25.11.2025  
**Autor:** v0 AI Senior Developer  
**Status:** Bereit für Implementierung
