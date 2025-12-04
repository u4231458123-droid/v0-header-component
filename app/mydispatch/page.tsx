import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MasterDashboard } from "@/components/mydispatch/MasterDashboard"

export const dynamic = "force-dynamic"

export default async function MyDispatchPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Nur Owner hat Zugang (normale Berechtigung)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .maybeSingle()

  const isOwner = profile?.role === "owner"

  if (!isOwner) {
    redirect("/dashboard")
  }

  // Fetch alle notwendigen Daten für beide Dashboards
  const [
    { data: companies },
    { data: contactRequests },
    { data: customers },
    { data: bookings },
    { data: drivers },
    { data: invoices },
  ] = await Promise.all([
    supabase.from("companies").select("*").order("created_at", { ascending: false }),
    supabase
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("customers").select("*, company:companies(id, name)").limit(100),
    supabase
      .from("bookings")
      .select("*, company:companies(id, name), customer:customers(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("drivers").select("*, company:companies(id, name)").limit(100),
    supabase
      .from("invoices")
      .select("*, company:companies(id, name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ])

  // Berechne Statistiken
  interface Company {
    id: string
    name?: string
    subscription_status?: string
  }
  interface Invoice {
    total_amount?: number | string | null
    company_id?: string
  }
  interface ContactRequest {
    status?: string
  }
  const stats = {
    totalCompanies: companies?.length || 0,
    activeSubscriptions: (companies as Company[])?.filter((c: Company) => c.subscription_status === "active").length || 0,
    totalRevenue: (invoices as Invoice[])?.reduce((sum: number, inv: Invoice) => sum + (Number(inv.total_amount) || 0), 0) || 0,
    totalBookings: bookings?.length || 0,
    pendingContactRequests: (contactRequests as ContactRequest[])?.filter((r: ContactRequest) => r.status === "new").length || 0,
    totalCustomers: customers?.length || 0,
    totalDrivers: drivers?.length || 0,
  }

  // Revenue pro Kunde berechnen
  const revenuePerCompany = (companies as Company[])?.map((company: Company) => {
    const companyInvoices = (invoices as Invoice[])?.filter((inv: Invoice) => inv.company_id === company.id) || []
    const revenue = companyInvoices.reduce((sum: number, inv: Invoice) => sum + (Number(inv.total_amount) || 0), 0)
    return {
      companyId: company.id,
      companyName: company.name || "Unbekannt",
      revenue,
      invoiceCount: companyInvoices.length,
    }
  }) || []

  return (
    <MasterDashboard
      companies={companies || []}
      contactRequests={contactRequests || []}
      customers={customers || []}
      bookings={bookings || []}
      drivers={drivers || []}
      invoices={invoices || []}
      stats={stats}
      revenuePerCompany={revenuePerCompany}
    />
  )
}

