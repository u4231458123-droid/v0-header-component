"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

// =============================================================================
// DESIGN-GUIDELINES: Harmonisiert mit Sign-Up Seite
// - Primary-Farbe #323D5E für Branding-Seite
// - Einheitliche Abstände (gap-5, p-6)
// - Gleiche Typografie und Icon-Styles
// =============================================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase Umgebungsvariablen fehlen")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShowResendConfirmation(false)
    setResendSuccess(false)

    try {
      const supabase = getSupabaseClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        const errorMessages: Record<string, string> = {
          "Invalid login credentials": "Ungültige E-Mail-Adresse oder Passwort.",
          "Email not confirmed": "Ihre E-Mail-Adresse wurde noch nicht bestätigt.",
          "Invalid email or password": "Ungültige E-Mail-Adresse oder Passwort.",
        }
        const message = errorMessages[authError.message] || authError.message

        if (authError.message.includes("not confirmed") || authError.message.includes("Email not confirmed")) {
          setShowResendConfirmation(true)
        }
        throw new Error(message)
      }

      if (data.user) {
        // ROLLEN-BASIERTER REDIRECT
        const userId = data.user.id
        const userEmail = data.user.email

        // 0. Sonderfall: Bekannte Test-Accounts (explizite Zuweisung)
        if (userEmail === "courbois83@gmail.com") {
           // Prüfe ob Kunde und leite direkt weiter
           const { data: customer } = await supabase
            .from("customers")
            .select("company_id")
            .eq("user_id", userId)
            .maybeSingle()
            
           if (customer) {
             const { data: company } = await supabase.from("companies").select("company_slug").eq("id", customer.company_id).maybeSingle()
             if (company) {
               window.location.href = `/c/${company.company_slug}/kunde/portal`
               return
             }
             window.location.href = "/kunden-portal"
             return
           }
        }

        // 1. Prüfe ob Master Admin (Höchste Priorität)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, company_id")
          .eq("id", userId)
          .maybeSingle()

        if (profile && profile.role === "master_admin") {
          window.location.href = "/admin"
          return
        }

        // 2. Prüfe ob Fahrer (Oft sind Fahrer auch normale User, aber Fahrer-Rolle ist spezifisch)
        const { data: driver } = await supabase
          .from("drivers")
          .select("company_id")
          .eq("user_id", userId)
          .maybeSingle()

        if (driver) {
          const { data: company } = await supabase.from("companies").select("company_slug").eq("id", driver.company_id).maybeSingle()
          if (company) {
            window.location.href = `/c/${company.company_slug}/fahrer/portal`
          } else {
            window.location.href = "/fahrer-portal"
          }
          return
        }

        // 3. Prüfe ob Kunde (Vor Unternehmer, falls User beides ist, aber hier als Kunde agieren soll)
        const { data: customer } = await supabase
          .from("customers")
          .select("company_id")
          .eq("user_id", userId)
          .maybeSingle()

        if (customer) {
          const { data: company } = await supabase.from("companies").select("company_slug").eq("id", customer.company_id).maybeSingle()
          if (company) {
            window.location.href = `/c/${company.company_slug}/kunde/portal`
          } else {
            window.location.href = "/kunden-portal"
          }
          return
        }

        // 4. Prüfe ob Unternehmer (Erst jetzt, da dies der Standard-Fallback für Profile ist)
        if (profile && profile.company_id) {
          window.location.href = "/dashboard"
          return
        }

        // Fallback für undefinierte User
        window.location.href = "/dashboard"
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          setError("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.")
        } else {
          setError(err.message)
        }
      } else {
        setError("Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsLoading(true)
    setError(null)
    setResendSuccess(false)

    try {
      const supabase = getSupabaseClient()
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (resendError) {
        throw new Error(resendError.message)
      }

      setResendSuccess(true)
      setError(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          setError("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.")
        } else {
          setError(err.message)
        }
      } else {
        setError("Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Information */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary text-primary-foreground p-8 flex-col justify-between">
        <div>
          <Link href="/" className="inline-block mb-12">
            <Image
              src="/images/my-dispatch-logo.png"
              alt="MyDispatch - simply arrive"
              width={180}
              height={45}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>

          <h1 className="text-3xl font-bold mb-4">Willkommen zurück</h1>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Melden Sie sich an und verwalten Sie Ihre Flotte effizient mit MyDispatch.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-0.5">
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Echtzeit-Übersicht</p>
                <p className="text-primary-foreground/60 text-sm">
                  Alle Buchungen, Fahrer und Fahrzeuge auf einen Blick
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-0.5">
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Intelligente Disposition</p>
                <p className="text-primary-foreground/60 text-sm">Automatische Fahrerzuweisung und Routenoptimierung</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-0.5">
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">100% DSGVO-konform</p>
                <p className="text-primary-foreground/60 text-sm">Hosting in Deutschland, Ihre Daten sind sicher</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 mt-6">
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-primary-foreground/60 text-sm">Verfügbar</p>
            </div>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-primary-foreground/60 text-sm">Cloud-basiert</p>
            </div>
            <div>
              <p className="text-2xl font-bold">DE</p>
              <p className="text-primary-foreground/60 text-sm">Serverstandort</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/images/my-dispatch-logo.png"
                alt="MyDispatch - simply arrive"
                width={160}
                height={40}
                className="h-9 w-auto mx-auto"
              />
            </Link>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-card-foreground mb-1">Anmelden</h2>
              <p className="text-muted-foreground text-sm">Melden Sie sich mit Ihren Zugangsdaten an</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  E-Mail Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="ihre@email.de"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Passwort
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                    Vergessen?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                  {showResendConfirmation && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={isLoading || resendSuccess}
                      className="mt-2 text-sm text-destructive hover:text-destructive/80 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendSuccess ? "E-Mail wurde versendet" : "Bestätigungs-E-Mail erneut senden"}
                    </button>
                  )}
                </div>
              )}

              {resendSuccess && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary">
                    Die Bestätigungs-E-Mail wurde erneut versendet. Bitte prüfen Sie Ihr Postfach.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
              Jetzt starten
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <Link href="/impressum" className="hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-foreground">
              AGB
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
