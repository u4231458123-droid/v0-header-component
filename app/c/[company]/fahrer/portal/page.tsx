import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TenantDriverPortal } from "./TenantDriverPortal"

interface PageProps {
  params: Promise<{ company: string }>
}

export default async function TenantDriverPortalPage({ params }: PageProps) {
  const { company: companySlug } = await params
  const supabase = await createClient()

  // Get company data
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("company_slug", companySlug)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/c/${companySlug}/login`)
  }

  // Check if user is a driver for this company
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("*, company:companies(*)")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single()

  if (driverError || !driver) {
    redirect(`/c/${companySlug}/login`)
  }

  // Check if driver must change password
  if (driver.must_change_password) {
    redirect(`/c/${companySlug}/login`)
  }

  // Get driver's assigned bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("driver_id", driver.id)
    .order("pickup_time", { ascending: true })

  // Get driver's shifts
  const { data: shifts } = await supabase
    .from("driver_shifts")
    .select("*")
    .eq("driver_id", driver.id)
    .gte("shift_end", new Date().toISOString())
    .order("shift_start", { ascending: true })

  // Transform bookings to match expected interface
  interface BookingData {
    id: string
    passenger_name?: string
    pickup_address?: string
    dropoff_address?: string
    pickup_time?: string
    status?: string
    passengers?: number
    notes?: string
    price?: number
  }
  const transformedBookings = (bookings || []).map((b: BookingData) => ({
    id: b.id,
    customer_name: b.passenger_name || "Unbekannt",
    pickup_address: b.pickup_address || "",
    destination_address: b.dropoff_address || "",
    pickup_time: b.pickup_time,
    status: b.status || "pending",
    passenger_count: b.passengers || 1,
    notes: b.notes,
    price: b.price,
  }))

  // Transform shifts to match expected interface
  interface ShiftData {
    id: string
    shift_start?: string
    shift_end?: string
    status?: string
  }
  const transformedShifts = (shifts || []).map((s: ShiftData) => ({
    id: s.id,
    start_time: s.shift_start,
    end_time: s.shift_end,
    status: s.status || "scheduled",
  }))

  return (
    <TenantDriverPortal company={company} driver={driver} bookings={transformedBookings} shifts={transformedShifts} />
  )
}
