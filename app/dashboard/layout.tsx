import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { checkSubscriptionAccess } from "@/lib/subscription-server"

export const dynamic = "force-dynamic"

// Kunden-Account Email - sollte ins Kunden-Portal
const CUSTOMER_ACCOUNT_EMAIL = "courbois83@gmail.com"

function isCustomerAccount(email: string | undefined | null): boolean {
  if (!email) return false
  return email.toLowerCase().trim() === CUSTOMER_ACCOUNT_EMAIL
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect("/auth/login")
    }

    // Spezielle Routing-Logik für Kunden-Account
    if (isCustomerAccount(user.email)) {
      // Prüfe ob Kunde in customers Tabelle existiert
      const { data: customer } = await supabase
        .from("customers")
        .select("id, company_id, company:companies(company_slug)")
        .eq("user_id", user.id)
        .single()

      if (customer) {
        const companySlug = (customer.company as { company_slug?: string })?.company_slug
        if (companySlug) {
          redirect(`/c/${companySlug}/kunde/portal`)
        }
        redirect("/kunden-portal")
      }
      // Fallback: Weiterleitung ins Kunden-Portal
      redirect("/kunden-portal")
    }

    const subscriptionAccess = await checkSubscriptionAccess()

    if (!subscriptionAccess.hasAccess) {
      redirect("/subscription-required")
    }

    return <>{children}</>
  } catch (error) {
    const { ErrorHandler } = await import("@/lib/utils/error-handler")
    ErrorHandler.handleSilent(error, { component: "DashboardLayout", action: "authCheck" })
    redirect("/auth/login")
  }
}
