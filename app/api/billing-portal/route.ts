// Stripe Billing Portal API Route
// ================================
// Erstellt eine Billing Portal Session fuer den Kunden
// und leitet zum Stripe Kundenportal weiter.

import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createBillingPortalSession } from "@/lib/stripe-config"

export async function POST(request: Request) {
  try {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    // Authentifizierung pruefen
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Company und Stripe Customer ID holen
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "Kein Unternehmen gefunden" }, { status: 404 })
    }

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_customer_id")
      .eq("id", profile.company_id)
      .single()

    if (!company?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Kein Stripe-Konto gefunden. Bitte erst ein Abonnement abschliessen." },
        { status: 404 },
      )
    }

    // Return URL aus Request oder Fallback
    const { returnUrl } = await request.json().catch(() => ({}))
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://v0-header-component-pink.vercel.app"
    const finalReturnUrl = returnUrl || `${baseUrl}/einstellungen`

    // Billing Portal Session erstellen
    const session = await createBillingPortalSession(company.stripe_customer_id, finalReturnUrl)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Billing Portal Error:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen der Portal-Session" }, { status: 500 })
  }
}
