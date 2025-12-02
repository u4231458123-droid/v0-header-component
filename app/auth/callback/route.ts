import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Auth Callback Route
 * Diese Route verarbeitet E-Mail-Verifizierungs-Links und Magic Links
 * und tauscht den Code gegen eine gültige Session aus.
 *
 * Unterstuetzte Typen:
 * - signup: E-Mail-Bestaetigung nach Registrierung
 * - recovery: Passwort-Zuruecksetzen
 * - email_change: E-Mail-Adresse aendern
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const type = searchParams.get("type") // signup, recovery, email_change, etc.

  console.log("[v0] Auth callback:", { type, hasCode: !!code, next })

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Diese Methode wird von createServerClient benötigt
          },
        },
      },
    )

    // Response erstellen um Cookies zu setzen
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabaseWithCookies = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    // Code gegen Session austauschen
    const { error } = await supabaseWithCookies.auth.exchangeCodeForSession(code)

    if (!error) {
      // Erfolg - je nach Typ unterschiedliche Weiterleitung
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      if (type === "signup") {
        return NextResponse.redirect(`${origin}/auth/sign-up-success?verified=true`)
      }
      // Standard: Redirect zum Dashboard oder next-Parameter
      return response
    }

    // Fehler beim Code-Austausch
    console.error("[v0] Auth callback error:", error.message)
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  // Kein Code vorhanden - pruefe ob Token vorhanden (fuer OTP)
  const token_hash = searchParams.get("token_hash")
  if (token_hash) {
    // OTP-Verifizierung
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      },
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type === "recovery" ? "recovery" : "email",
    })

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error("[v0] OTP verification error:", error.message)
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  // Kein Code und kein Token vorhanden
  return NextResponse.redirect(`${origin}/auth/error?error=missing_code`)
}
