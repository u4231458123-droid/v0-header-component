"use server"

import { createClient } from "@/lib/supabase/server"
import type { PartnerBookingStatus } from "./types"

// ============================================================================
// PARTNER VERBINDUNGEN
// ============================================================================

export async function searchPartnerByMdId(mdId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!profile?.company_id) {
    return { success: false, error: "Nicht authentifiziert" }
  }

  // Suche Partner nach MD-ID
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, email, md_id")
    .eq("md_id", mdId.toUpperCase())
    .neq("id", profile.company_id)
    .single()

  if (error || !company) {
    return { success: false, error: "Partner nicht gefunden" }
  }

  // Pruefe ob bereits Verbindung existiert
  const { data: existing } = await supabase
    .from("partner_connections")
    .select("id, status")
    .or(
      `and(company_a_id.eq.${profile.company_id},company_b_id.eq.${company.id}),and(company_a_id.eq.${company.id},company_b_id.eq.${profile.company_id})`,
    )
    .single()

  return {
    success: true,
    company,
    existingConnection: existing,
  }
}

export async function sendPartnerRequest(partnerCompanyId: string, notes?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert" }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen zugeordnet" }
  }

  // Erstelle Verbindungsanfrage
  const { data, error } = await supabase
    .from("partner_connections")
    .insert({
      company_a_id: profile.company_id,
      company_b_id: partnerCompanyId,
      status: "pending",
      notes,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Verbindungsanfrage existiert bereits" }
    }
    return { success: false, error: error.message }
  }

  return { success: true, connection: data }
}

export async function respondToPartnerRequest(connectionId: string, response: "accepted" | "rejected") {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert" }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen zugeordnet" }
  }

  // Aktualisiere Verbindung (nur wenn wir company_b sind)
  const updateData: any = {
    status: response,
    updated_at: new Date().toISOString(),
  }

  if (response === "accepted") {
    updateData.accepted_at = new Date().toISOString()
  } else {
    updateData.rejected_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("partner_connections")
    .update(updateData)
    .eq("id", connectionId)
    .eq("company_b_id", profile.company_id)
    .eq("status", "pending")

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getPartnerConnections() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert", connections: [] }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen", connections: [] }
  }

  const { data, error } = await supabase
    .from("partner_connections")
    .select(`
      *,
      company_a:company_a_id(id, name, email, md_id),
      company_b:company_b_id(id, name, email, md_id)
    `)
    .or(`company_a_id.eq.${profile.company_id},company_b_id.eq.${profile.company_id}`)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, connections: [] }
  }

  return {
    success: true,
    connections: data || [],
    myCompanyId: profile.company_id,
  }
}

export async function blockPartner(connectionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("partner_connections")
    .update({ status: "blocked", updated_at: new Date().toISOString() })
    .eq("id", connectionId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================================================
// PARTNER AUFTRAEGE
// ============================================================================

export async function assignBookingToPartner(bookingId: string, partnerCompanyId: string, commissionPercent = 0) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert" }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen" }
  }

  // Pruefe ob Partner-Verbindung aktiv ist
  const { data: connection } = await supabase
    .from("partner_connections")
    .select("id")
    .or(
      `and(company_a_id.eq.${profile.company_id},company_b_id.eq.${partnerCompanyId}),and(company_a_id.eq.${partnerCompanyId},company_b_id.eq.${profile.company_id})`,
    )
    .eq("status", "accepted")
    .single()

  if (!connection) {
    return { success: false, error: "Keine aktive Partner-Verbindung" }
  }

  // Hole Buchungspreis fuer Provisions-Berechnung
  const { data: booking } = await supabase
    .from("bookings")
    .select("price")
    .eq("id", bookingId)
    .eq("company_id", profile.company_id)
    .single()

  if (!booking) {
    return { success: false, error: "Auftrag nicht gefunden" }
  }

  const commissionAmount = (booking.price || 0) * (commissionPercent / 100)

  // Erstelle Partner-Auftrag
  const { data: partnerBooking, error } = await supabase
    .from("partner_bookings")
    .insert({
      original_booking_id: bookingId,
      source_company_id: profile.company_id,
      partner_company_id: partnerCompanyId,
      partner_status: "eingegangen",
      commission_percent: commissionPercent,
      commission_amount: commissionAmount,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Erstelle Historie-Eintrag
  await supabase.from("partner_booking_history").insert({
    partner_booking_id: partnerBooking.id,
    changed_by_company_id: profile.company_id,
    changed_by_user_id: user.id,
    new_status: "eingegangen",
    comment: "Auftrag an Partner zugewiesen",
  })

  return { success: true, partnerBooking }
}

export async function updatePartnerBookingStatus(
  partnerBookingId: string,
  newStatus: PartnerBookingStatus,
  comment?: string,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert" }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen" }
  }

  // Hole aktuellen Status
  const { data: current } = await supabase
    .from("partner_bookings")
    .select("partner_status")
    .eq("id", partnerBookingId)
    .single()

  if (!current) {
    return { success: false, error: "Partner-Auftrag nicht gefunden" }
  }

  // Aktualisiere Status
  const updateData: any = {
    partner_status: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (newStatus === "abgeschlossen") {
    updateData.completed_at = new Date().toISOString()
  } else if (newStatus === "zugewiesen") {
    updateData.accepted_at = new Date().toISOString()
  }

  const { error } = await supabase.from("partner_bookings").update(updateData).eq("id", partnerBookingId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Erstelle Historie-Eintrag
  await supabase.from("partner_booking_history").insert({
    partner_booking_id: partnerBookingId,
    changed_by_company_id: profile.company_id,
    changed_by_user_id: user.id,
    old_status: current.partner_status,
    new_status: newStatus,
    comment,
  })

  return { success: true }
}

export async function getPartnerBookings(type: "sent" | "received" | "all" = "all") {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert", bookings: [] }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen", bookings: [] }
  }

  let query = supabase.from("partner_bookings").select(`
      *,
      original_booking:original_booking_id(
        id, pickup_address, dropoff_address, pickup_time, price, status,
        customer:customer_id(first_name, last_name, phone)
      ),
      source_company:source_company_id(id, name, md_id),
      partner_company:partner_company_id(id, name, md_id)
    `)

  if (type === "sent") {
    query = query.eq("source_company_id", profile.company_id)
  } else if (type === "received") {
    query = query.eq("partner_company_id", profile.company_id)
  } else {
    query = query.or(`source_company_id.eq.${profile.company_id},partner_company_id.eq.${profile.company_id}`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, bookings: [] }
  }

  return {
    success: true,
    bookings: data || [],
    myCompanyId: profile.company_id,
  }
}

export async function getPartnerBookingHistory(partnerBookingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_booking_history")
    .select(`
      *,
      changed_by_company:changed_by_company_id(name),
      changed_by_user:changed_by_user_id(full_name)
    `)
    .eq("partner_booking_id", partnerBookingId)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, history: [] }
  }

  return { success: true, history: data || [] }
}

// ============================================================================
// PARTNER STATISTIKEN
// ============================================================================

export async function getPartnerStatistics() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht authentifiziert" }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return { success: false, error: "Kein Unternehmen" }
  }

  // Zaehle aktive Partner
  const { count: activePartners } = await supabase
    .from("partner_connections")
    .select("*", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`company_a_id.eq.${profile.company_id},company_b_id.eq.${profile.company_id}`)

  // Zaehle gesendete Auftraege
  const { count: sentBookings } = await supabase
    .from("partner_bookings")
    .select("*", { count: "exact", head: true })
    .eq("source_company_id", profile.company_id)

  // Zaehle empfangene Auftraege
  const { count: receivedBookings } = await supabase
    .from("partner_bookings")
    .select("*", { count: "exact", head: true })
    .eq("partner_company_id", profile.company_id)

  // Berechne Provisionen
  const { data: commissions } = await supabase
    .from("partner_bookings")
    .select("commission_amount")
    .eq("source_company_id", profile.company_id)
    .eq("partner_status", "abgeschlossen")

  const totalCommission = commissions?.reduce((sum: number, b: { commission_amount?: number | null }) => sum + (b.commission_amount || 0), 0) || 0

  return {
    success: true,
    stats: {
      activePartners: activePartners || 0,
      sentBookings: sentBookings || 0,
      receivedBookings: receivedBookings || 0,
      totalCommission,
    },
  }
}
