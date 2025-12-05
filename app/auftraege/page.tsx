import { MainLayout } from "@/components/layout/MainLayout"
import { createClient } from "@/lib/supabase/server"
import dynamicImport from "next/dynamic"
import { redirect } from "next/navigation"

// Lazy Loading für große Komponente
const BookingsPageClient = dynamicImport(() => import("@/components/bookings/BookingsPageClient"), {
  loading: () => <div className="h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Lade Buchungen...</div></div>,
  ssr: false,
})

export const dynamic = "force-dynamic" as const

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

  let bookings: Array<Record<string, unknown>> = []
  let drivers: Array<Record<string, unknown>> = []
  let vehicles: Array<Record<string, unknown>> = []
  let customers: Array<Record<string, unknown>> = []

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
