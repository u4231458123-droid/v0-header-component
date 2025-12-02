import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { TenantBookingForm } from "./TenantBookingForm"

interface PageProps {
  params: Promise<{ company: string }>
}

export default async function TenantBookingPage({ params }: PageProps) {
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
            // Ignore
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
    redirect(`/c/${companySlug}/login`)
  }

  // Lade verfuegbare Fahrzeugkategorien
  const { data: vehicleCategories } = await supabase
    .from("vehicle_categories")
    .select("*")
    .eq("company_id", company.id)
    .order("name")

  return <TenantBookingForm company={company} customer={customer} vehicleCategories={vehicleCategories || []} />
}
