export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { FinanzenPageClient } from "@/components/finanzen/FinanzenPageClient"

export default async function FinanzenPage() {
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

  let invoices: any[] = []
  let quotes: any[] = []
  let cashBookEntries: any[] = []
  let customers: any[] = []
  let bookings: any[] = []
  let company: any = null

  if (profile?.company_id) {
    const [invoicesRes, customersRes, bookingsRes, companyRes] = await Promise.all([
      supabase
        .from("invoices")
        .select(`
          *,
          customer:customers(id, first_name, last_name, email, salutation),
          booking:bookings(id, pickup_address, dropoff_address, pickup_time)
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("customers")
        .select("id, first_name, last_name, salutation, email, phone, address, postal_code, city")
        .eq("company_id", profile.company_id)
        .order("last_name"),
      supabase
        .from("bookings")
        .select("id, pickup_address, dropoff_address, pickup_time, price, customer_id, status")
        .eq("company_id", profile.company_id),
      supabase.from("companies").select("*").eq("id", profile.company_id).single(),
    ])

    invoices = invoicesRes.data || []
    customers = customersRes.data || []
    bookings = bookingsRes.data || []
    company = companyRes.data || null

    // Versuche Angebote zu laden (falls Tabelle existiert)
    try {
      const quotesRes = await supabase
        .from("quotes")
        .select(`
          *,
          customer:customers(id, first_name, last_name, email, salutation)
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false })

      quotes = quotesRes.data || []
    } catch {
      quotes = []
    }

    // Versuche Kassenbucheinträge zu laden (falls Tabelle existiert)
    try {
      const cashBookRes = await supabase
        .from("cashbook_entries")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("entry_date", { ascending: false })
        .limit(100)

      cashBookEntries = cashBookRes.data || []
    } catch {
      cashBookEntries = []
    }
  }

  return (
    <MainLayout>
      <FinanzenPageClient
        invoices={invoices}
        quotes={quotes}
        cashBookEntries={cashBookEntries}
        customers={customers}
        bookings={bookings}
        company={company}
        companyId={profile?.company_id || null}
      />
    </MainLayout>
  )
}
