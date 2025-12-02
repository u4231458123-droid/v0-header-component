import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { CustomersPageClient } from "@/components/customers/CustomersPageClient"

export const dynamic = "force-dynamic"

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  )
}

export default async function CustomersPage() {
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

  let customers: any[] = []
  let bookings: any[] = []
  let invoices: any[] = []

  if (profile?.company_id) {
    const [customersResult, bookingsResult, invoicesResult] = await Promise.all([
      supabase
        .from("customers")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("id, customer_id, status, price, created_at")
        .eq("company_id", profile.company_id),
      supabase.from("invoices").select("id, customer_id, status, total_amount").eq("company_id", profile.company_id),
    ])

    customers = customersResult.data || []
    bookings = bookingsResult.data || []
    invoices = invoicesResult.data || []
  }

  return (
    <MainLayout>
      <CustomersPageClient
        initialCustomers={customers}
        bookings={bookings}
        invoices={invoices}
        companyId={profile?.company_id || null}
      />
    </MainLayout>
  )
}
