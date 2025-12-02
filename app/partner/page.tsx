import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { PartnerPageClient } from "@/components/partner/PartnerPageClient"
import { checkFeatureAccess } from "@/lib/subscription-server"

export const dynamic = "force-dynamic"

export default async function PartnerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const hasPartnerAccess = await checkFeatureAccess("apiAccess")
  if (!hasPartnerAccess) {
    redirect("/subscription-required?feature=partner")
  }

  const { data: profile } = await supabase.from("profiles").select("company_id, role").eq("id", user.id).single()

  if (!profile?.company_id) redirect("/dashboard")

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, mydispatch_id, email, phone, address, bank_info, contact_info, legal_info, logo_url")
    .eq("id", profile.company_id)
    .single()

  const { data: connections } = await supabase
    .from("partner_connections")
    .select(`
      *,
      requester_company:companies!partner_connections_requester_company_id_fkey(id, name, mydispatch_id, email, phone, address, bank_info, contact_info, legal_info, logo_url),
      target_company:companies!partner_connections_target_company_id_fkey(id, name, mydispatch_id, email, phone, address, bank_info, contact_info, legal_info, logo_url)
    `)
    .or(`requester_company_id.eq.${profile.company_id},target_company_id.eq.${profile.company_id}`)
    .order("created_at", { ascending: false })

  const { data: partnerBookings } = await supabase
    .from("partner_bookings")
    .select("*")
    .or(`source_company_id.eq.${profile.company_id},target_company_id.eq.${profile.company_id}`)
    .order("created_at", { ascending: false })

  // Lade Fahrer und Fahrzeuge fuer Auftragszuweisung
  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, first_name, last_name, status")
    .eq("company_id", profile.company_id)
    .eq("status", "active")

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, license_plate, seats, status")
    .eq("company_id", profile.company_id)
    .eq("status", "active")

  return (
    <MainLayout>
      <PartnerPageClient
        company={company}
        connections={connections || []}
        partnerBookings={partnerBookings || []}
        drivers={drivers || []}
        vehicles={vehicles || []}
      />
    </MainLayout>
  )
}
