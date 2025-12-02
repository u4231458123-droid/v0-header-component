import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { BookingsPageClient } from "@/components/bookings/BookingsPageClient"

export const dynamic = "force-dynamic"

export default async function BookingsPage() {
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

  let bookings: any[] = []
  let drivers: any[] = []
  let vehicles: any[] = []
  let customers: any[] = []

  if (profile?.company_id) {
    const [bookingsRes, driversRes, vehiclesRes, customersRes] = await Promise.all([
      supabase
        .from("bookings")
        .select(`*, customer:customers(*), driver:drivers(*), vehicle:vehicles(*)`)
        .eq("company_id", profile.company_id)
        .order("pickup_time", { ascending: false }),
      supabase
        .from("drivers")
        .select("id, first_name, last_name, status")
        .eq("company_id", profile.company_id)
        .eq("status", "active"),
      supabase
        .from("vehicles")
        .select("id, license_plate, make, model, status")
        .eq("company_id", profile.company_id)
        .eq("status", "active"),
      supabase.from("customers").select("id, first_name, last_name, salutation").eq("company_id", profile.company_id),
    ])
    bookings = bookingsRes.data || []
    drivers = driversRes.data || []
    vehicles = vehiclesRes.data || []
    customers = customersRes.data || []
  }

  return (
    <MainLayout>
      <BookingsPageClient
        bookings={bookings}
        drivers={drivers}
        vehicles={vehicles}
        customers={customers}
        companyId={profile?.company_id || null}
      />
    </MainLayout>
  )
}
