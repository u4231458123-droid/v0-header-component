import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { TenantCustomerPortal } from "./TenantCustomerPortal"

interface PageProps {
  params: Promise<{ company: string }>
}

export default async function TenantCustomerPortalPage({ params }: PageProps) {
  const { company: companySlug } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
    },
  )

  // Pruefe Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/c/${companySlug}/login`)
  }

  // Lade Company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("company_slug", companySlug)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Pruefe ob Kunde dieses Unternehmens
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single()

  if (!customer) {
    // Kein Kunde dieses Unternehmens - zurueck zur Login-Seite
    redirect(`/c/${companySlug}/login`)
  }

  // Lade Buchungen des Kunden
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      driver:drivers(first_name, last_name, phone),
      vehicle:vehicles(brand, model, license_plate)
    `)
    .eq("customer_id", customer.id)
    .order("pickup_time", { ascending: false })
    .limit(50)

  // Lade Rechnungen des Kunden
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <TenantCustomerPortal company={company} customer={customer} bookings={bookings || []} invoices={invoices || []} />
  )
}
