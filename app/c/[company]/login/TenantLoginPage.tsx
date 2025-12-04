"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, AlertCircle, Car, Users, Building2, Eye, EyeOff, KeyRound } from "lucide-react"

interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  logo_url: string | null
  company_slug: string
  branding: any
}

interface TenantLoginPageProps {
  company: Company
}

function getSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function TenantLoginPage({ company }: TenantLoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const branding = company.branding || {}
  const primaryColor = branding.primary_color || branding.primaryColor || "#343f60"

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (newPassword.length < 8) {
        throw new Error("Das neue Passwort muss mindestens 8 Zeichen haben")
      }

      if (newPassword !== newPasswordConfirm) {
        throw new Error("Die Passwoerter stimmen nicht ueberein")
      }

      const supabase = getSupabaseClient()

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      // Update driver record to mark password as changed
      if (userId) {
        await supabase
          .from("drivers")
          .update({ must_change_password: false, last_login_at: new Date().toISOString() })
          .eq("user_id", userId)
      }

      // Redirect to tenant-specific driver portal
      window.location.href = `/c/${company.company_slug}/fahrer/portal`
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // 1. Authentifizierung
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        const errorMessages: Record<string, string> = {
          "Invalid login credentials": "Ungueltige E-Mail-Adresse oder Passwort.",
          "Email not confirmed": "Ihre E-Mail-Adresse wurde noch nicht bestaetigt.",
          "Invalid email or password": "Ungueltige E-Mail-Adresse oder Passwort.",
        }
        throw new Error(errorMessages[authError.message] || authError.message)
      }

      if (!authData.user) {
        throw new Error("Login fehlgeschlagen")
      }

      // 2. Nutzertyp ermitteln
      const currentUserId = authData.user.id

      // Pruefe ob Unternehmer/Admin (profiles mit company_id)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", currentUserId)
        .maybeSingle()

      if (profile && profile.company_id === company.id) {
        window.location.href = "/dashboard"
        return
      }

      // Pruefe ob Fahrer dieses Unternehmens
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, company_id, status, must_change_password")
        .eq("user_id", currentUserId)
        .eq("company_id", company.id)
        .maybeSingle()

      if (driver) {
        if (driver.must_change_password) {
          setUserId(currentUserId)
          setMustChangePassword(true)
          setIsLoading(false)
          return
        }

        // Update last login
        await supabase.from("drivers").update({ last_login_at: new Date().toISOString() }).eq("id", driver.id)

        // Redirect to tenant-specific driver portal
        window.location.href = `/c/${company.company_slug}/fahrer/portal`
        return
      }

      // Prüfe ob Kunde dieses Unternehmens
      // 1. Prüfe customers Tabelle (direkte Zuordnung)
      const { data: customer } = await supabase
        .from("customers")
        .select("id, company_id, user_id")
        .eq("user_id", currentUserId)
        .eq("company_id", company.id)
        .maybeSingle()

      if (customer) {
        window.location.href = `/c/${company.company_slug}/kunde/portal`
        return
      }

      // 2. Prüfe customer_accounts Tabelle (für registrierte Kunden)
      const { data: customerAccount } = await supabase
        .from("customer_accounts")
        .select("id, registered_companies")
        .eq("user_id", currentUserId)
        .maybeSingle()

      if (customerAccount) {
        const registeredCompanies = customerAccount.registered_companies || []
        if (registeredCompanies.includes(company.id)) {
          window.location.href = `/c/${company.company_slug}/kunde/portal`
          return
        }
      }

      // 3. Prüfe ob User ein Profil hat (Unternehmer) - bereits oben geprüft
      // Die erste Prüfung auf profile (Zeile ~125) behandelt diesen Fall bereits

      // Kein Zugang zu diesem Unternehmen
      throw new Error("Sie haben keinen Zugang zu diesem Unternehmen. Bitte registrieren Sie sich zuerst oder wenden Sie sich an das Unternehmen.")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (mustChangePassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <header className="py-6 px-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between">
            <Link href={`/c/${company.company_slug}`} className="flex items-center gap-3">
              {company.logo_url ? (
                <Image
                  src={company.logo_url || "/placeholder.svg"}
                  alt={company.name}
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {company.name.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-xl text-slate-900">{company.name}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div
                className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <KeyRound className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <CardTitle className="text-2xl font-bold">Passwort aendern</CardTitle>
              <CardDescription className="text-base">
                Aus Sicherheitsgruenden muessen Sie beim ersten Login ein neues Passwort festlegen.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Neues Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mindestens 8 Zeichen"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPasswordConfirm">Passwort bestaetigen</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPasswordConfirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Passwort wiederholen"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    "Passwort speichern & fortfahren"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>

        <footer className="py-4 px-4 text-center text-sm text-slate-500 border-t border-slate-200">
          <p>
            &copy; {new Date().getFullYear()} {company.name}. Alle Rechte vorbehalten.
          </p>
        </footer>
      </div>
    )
  }

  // ... existing login form return ...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header mit Unternehmensbranding */}
      <header className="py-6 px-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={`/c/${company.company_slug}`} className="flex items-center gap-3">
            {company.logo_url ? (
              <Image
                src={company.logo_url || "/placeholder.svg"}
                alt={company.name}
                width={48}
                height={48}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {company.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-xl text-slate-900">{company.name}</span>
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Willkommen zurueck</CardTitle>
            <CardDescription className="text-base">Melden Sie sich bei {company.name} an</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Nutzertyp-Info */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 text-center">
                <Building2 className="h-5 w-5 mb-1" style={{ color: primaryColor }} />
                <span className="text-xs text-slate-500">Unternehmer</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 text-center">
                <Car className="h-5 w-5 mb-1" style={{ color: primaryColor }} />
                <span className="text-xs text-slate-500">Fahrer</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 text-center">
                <Users className="h-5 w-5 mb-1" style={{ color: primaryColor }} />
                <span className="text-xs text-slate-500">Kunden</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link href="/auth/reset-password" className="text-sm hover:underline" style={{ color: primaryColor }}>
                    Passwort vergessen?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: primaryColor }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmelden...
                  </>
                ) : (
                  "Anmelden"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p>
                Noch kein Konto?{" "}
                <Link
                  href={`/c/${company.company_slug}/kunde/registrieren`}
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Als Kunde registrieren
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-sm text-slate-500 border-t border-slate-200">
        <p>
          &copy; {new Date().getFullYear()} {company.name}. Alle Rechte vorbehalten.
        </p>
      </footer>
    </div>
  )
}
