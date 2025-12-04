import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { AdminDashboardClient } from "./AdminDashboardClient"

export const dynamic = "force-dynamic"

/**
 * ADMIN-SEITE
 * ===========
 * Diese Seite ist NUR für Master-Admin zugänglich
 * Normale Kunden werden zum Dashboard weitergeleitet
 */

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Prüfe ob User Owner ist (normale Berechtigung)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .maybeSingle()

  const isOwner = profile?.role === "owner"

  if (!isOwner) {
    // Keine Berechtigung - zum Dashboard weiterleiten
    redirect("/dashboard")
  }

  // Lade Admin-Daten
  const { data: companies, count: companiesCount } = await supabase
    .from("companies")
    .select("id, name, email, subscription_tier, subscription_status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(10)

  const { count: activeSubscriptions } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active")

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })

  const { count: totalDrivers } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })

  const { count: totalVehicles } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })

  return (
    <MainLayout>
      <AdminDashboardClient
        stats={{
          companies: companiesCount || 0,
          activeSubscriptions: activeSubscriptions || 0,
          totalBookings: totalBookings || 0,
          totalDrivers: totalDrivers || 0,
          totalVehicles: totalVehicles || 0,
        }}
        recentCompanies={companies || []}
      />
    </MainLayout>
  )
}
