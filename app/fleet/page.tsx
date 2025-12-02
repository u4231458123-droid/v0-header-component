export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { FleetPageClient } from "@/components/fleet/FleetPageClient"

export default async function FleetPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect("/auth/login")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  let drivers: any[] = []
  let vehicles: any[] = []

  if (profile?.company_id) {
    const [driversRes, vehiclesRes] = await Promise.all([
      supabase.from("drivers").select("*").eq("company_id", profile.company_id).order("last_name"),
      supabase.from("vehicles").select("*").eq("company_id", profile.company_id).order("license_plate"),
    ])
    drivers = driversRes.data || []
    vehicles = vehiclesRes.data || []
  }

  return (
    <MainLayout>
      <FleetPageClient
        initialDrivers={drivers}
        initialVehicles={vehicles}
        companyId={profile?.company_id || null}
      />
    </MainLayout>
  )
}
