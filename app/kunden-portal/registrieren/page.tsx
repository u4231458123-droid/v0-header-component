"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import type { SupabaseClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function CarIcon({ className }: { className?: string }) {
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
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}
function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}
function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function CheckIcon({ className }: { className?: string }) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export default function CustomerRegistrationPage() {
  const searchParams = useSearchParams()
  const companySlug = searchParams.get("company")

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    salutation: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    preferredPayment: "cash",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  })

  const supabaseRef = useRef<SupabaseClient | null>(null)
  if (typeof window !== "undefined" && !supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current!

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.salutation || !formData.firstName || !formData.lastName) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.")
      return false
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.")
      return false
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async () => {
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      setError("Bitte akzeptieren Sie die AGB und Datenschutzerklärung.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback?type=signup&next=/kunden-portal`,
        },
      })

      if (authError) throw authError

      // 2. Create Customer Account
      if (authData.user) {
        const { error: customerError } = await supabase.from("customer_accounts").insert({
          user_id: authData.user.id,
          salutation: formData.salutation,
          title: formData.title || null,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          street: formData.street || null,
          house_number: formData.houseNumber || null,
          postal_code: formData.postalCode || null,
          city: formData.city || null,
          preferred_payment_method: formData.preferredPayment,
          notification_preferences: {
            email: true,
            sms: false,
            push: true,
            marketing: formData.acceptMarketing,
          },
        })

        if (customerError) throw customerError
      }

      // Success - redirect to confirmation
      setStep(3)
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-primary to-primary/90 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/images/my-dispatch-logo.png" alt="MyDispatch" className="h-10 mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-primary-foreground mt-6">Kundenkonto erstellen</h1>
          <p className="text-primary-foreground/70 mt-2">
            Registrieren Sie sich und buchen Sie Ihre Fahrten bequem online.
          </p>
        </div>

        {/* Benefits */}
        {step === 1 && (
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <CarIcon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-primary-foreground/70">Fahrtenübersicht</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <ClockIcon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-primary-foreground/70">Schneller buchen</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <ShieldIcon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-primary-foreground/70">Sichere Daten</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {step < 3 && (
          <div className="flex items-center justify-center mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 1 ? "bg-primary" : "bg-muted"} text-primary-foreground text-sm font-medium`}
            >
              {step > 1 ? <CheckIcon className="h-4 w-4" /> : "1"}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 2 ? "bg-primary" : "bg-muted"} text-primary-foreground text-sm font-medium`}
            >
              {step > 2 ? <CheckIcon className="h-4 w-4" /> : "2"}
            </div>
          </div>
        )}

        <Card className="bg-card/90 border-border backdrop-blur">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-foreground">Persönliche Daten</CardTitle>
                <CardDescription>Ihre Kontaktdaten und Zugangsdaten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">Anrede *</Label>
                    <Select value={formData.salutation} onValueChange={(v) => updateField("salutation", v)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Herr">Herr</SelectItem>
                        <SelectItem value="Frau">Frau</SelectItem>
                        <SelectItem value="Divers">Divers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Titel</Label>
                    <Select value={formData.title} onValueChange={(v) => updateField("title", v)}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kein Titel</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Prof.">Prof.</SelectItem>
                        <SelectItem value="Prof. Dr.">Prof. Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">Vorname *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className="bg-background border-border"
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Nachname *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className="bg-background border-border"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">E-Mail-Adresse *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="bg-background border-border"
                    placeholder="max@beispiel.de"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Telefonnummer</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="bg-background border-border"
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">Passwort *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="bg-background border-border"
                      placeholder="Min. 8 Zeichen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Passwort bestätigen *</Label>
                    <Input
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={(e) => updateField("passwordConfirm", e.target.value)}
                      className="bg-background border-border"
                      placeholder="Wiederholen"
                    />
                  </div>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => validateStep1() && setStep(2)}>
                  Weiter
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-foreground">Adresse & Einstellungen</CardTitle>
                <CardDescription>Optional: Ihre Adresse für schnellere Buchungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-5">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-foreground">Straße</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => updateField("street", e.target.value)}
                      className="bg-background border-border"
                      placeholder="Musterstraße"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Hausnr.</Label>
                    <Input
                      value={formData.houseNumber}
                      onChange={(e) => updateField("houseNumber", e.target.value)}
                      className="bg-background border-border"
                      placeholder="1a"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">PLZ</Label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      className="bg-background border-border"
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Stadt</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="bg-background border-border"
                      placeholder="Berlin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Bevorzugte Zahlungsart</Label>
                  <Select value={formData.preferredPayment} onValueChange={(v) => updateField("preferredPayment", v)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Bargeld</SelectItem>
                      <SelectItem value="card">Kartenzahlung</SelectItem>
                      <SelectItem value="invoice">Rechnung</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(v) => updateField("acceptTerms", v)}
                    />
                    <label htmlFor="terms" className="text-sm text-primary-foreground/70">
                      Ich akzeptiere die{" "}
                      <Link href="/agb" className="text-primary hover:underline">
                        AGB
                      </Link>{" "}
                      *
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(v) => updateField("acceptPrivacy", v)}
                    />
                    <label htmlFor="privacy" className="text-sm text-primary-foreground/70">
                      Ich akzeptiere die{" "}
                      <Link href="/datenschutz" className="text-primary hover:underline">
                        Datenschutzerklärung
                      </Link>{" "}
                      *
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      checked={formData.acceptMarketing}
                      onCheckedChange={(v) => updateField("acceptMarketing", v)}
                    />
                    <label htmlFor="marketing" className="text-sm text-primary-foreground/70">
                      Ich möchte über Angebote und Neuigkeiten informiert werden
                    </label>
                  </div>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-border bg-transparent" onClick={() => setStep(1)}>
                    Zurück
                  </Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Wird erstellt..." : "Konto erstellen"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-primary-foreground mb-2">Registrierung erfolgreich!</h2>
                <p className="text-primary-foreground/70 mb-6">
                  Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte klicken Sie auf den Link in der E-Mail, um
                  Ihr Konto zu aktivieren.
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/auth/login">Zum Login</Link>
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-primary-foreground/70 text-sm mt-6">
          Bereits ein Konto?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
