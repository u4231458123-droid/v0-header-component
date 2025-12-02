"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import {
  SALUTATION_OPTIONS,
  TITLE_OPTIONS,
  VALIDATION_RULES,
  formatPostalCode,
  formatPhoneNumber,
} from "@/lib/form-constants"

export const dynamic = "force-dynamic"

export default function CustomerRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const companySlug = params.company as string

  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const supabaseRef = useRef<any>(null)

  const [form, setForm] = useState({
    salutation: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobile: "", // Added mobile field per PDF
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    country: "Deutschland",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
    acceptPrivacy: false,
  })

  useEffect(() => {
    supabaseRef.current = createClient()
    loadCompany()
  }, [companySlug])

  const loadCompany = async () => {
    if (!supabaseRef.current) return

    const { data, error } = await supabaseRef.current
      .from("companies")
      .select("id, name, logo_url, company_slug, subscription_status")
      .eq("company_slug", companySlug)
      .maybeSingle()

    if (error || !data) {
      setError("Unternehmen nicht gefunden")
      setLoading(false)
      return
    }

    if (data.subscription_status !== "active" && data.subscription_status !== "trialing") {
      setError("Registrierung derzeit nicht möglich")
      setLoading(false)
      return
    }

    setCompany(data)
    setLoading(false)
  }

  const handleFieldChange = (field: string, value: string) => {
    let formattedValue = value
    let error = ""

    // Apply formatting based on field type
    if (field === "postalCode") {
      formattedValue = formatPostalCode(value)
      if (formattedValue && formattedValue.length !== 5) {
        error = VALIDATION_RULES.postalCode.message
      }
    } else if (field === "phone" || field === "mobile") {
      formattedValue = formatPhoneNumber(value)
      if (formattedValue && formattedValue.length > 20) {
        error = VALIDATION_RULES.phone.message
      }
    }

    setForm({ ...form, [field]: formattedValue })
    setFieldErrors({ ...fieldErrors, [field]: error })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!form.salutation) {
      setError("Bitte wählen Sie eine Anrede aus")
      setSubmitting(false)
      return
    }

    if (form.password !== form.passwordConfirm) {
      setError("Passwörter stimmen nicht überein")
      setSubmitting(false)
      return
    }

    if (!form.acceptTerms || !form.acceptPrivacy) {
      setError("Bitte akzeptieren Sie die AGB und Datenschutzerklärung")
      setSubmitting(false)
      return
    }

    if (form.postalCode && !VALIDATION_RULES.postalCode.pattern.test(form.postalCode)) {
      setError(VALIDATION_RULES.postalCode.message)
      setSubmitting(false)
      return
    }

    try {
      const { data: existingCustomer } = await supabaseRef.current
        .from("customers")
        .select("id, email")
        .eq("company_id", company.id)
        .eq("email", form.email)
        .maybeSingle()

      if (existingCustomer) {
        setError("Ein Kunde mit dieser E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.")
        setSubmitting(false)
        return
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseRef.current.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/c/${companySlug}/kunde/portal`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Use email as unique identifier since phone can be empty
        const { error: customerError } = await supabaseRef.current.from("customers").insert({
          company_id: company.id,
          user_id: authData.user.id,
          salutation: form.salutation,
          title: form.title || null,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone && form.phone.trim() !== "" ? form.phone.trim() : null,
          mobile: form.mobile && form.mobile.trim() !== "" ? form.mobile.trim() : null,
          address: `${form.street} ${form.houseNumber}`,
          postal_code: form.postalCode,
          city: form.city,
          status: "active",
        })

        if (customerError) {
          if (customerError.code === "23505") {
            setError(
              "Ein Kunde mit diesen Daten existiert bereits. Bitte melden Sie sich an oder verwenden Sie andere Kontaktdaten.",
            )
          } else {
            throw customerError
          }
          return
        }
      }

      setSuccess(true)

      setTimeout(() => {
        window.location.href = `/c/${companySlug}/kunde/portal`
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline">Zur Startseite</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Registrierung erfolgreich!</h2>
            <p className="text-muted-foreground mb-6">
              Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
            </p>
            {/* Link to Tenant-Kunden-Portal is removed as there is an automatic redirect */}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={`/c/${companySlug}`} className="inline-flex items-center gap-3 mb-6">
            {company?.logo_url ? (
              <Image
                src={company.logo_url || "/placeholder.svg"}
                alt={company.name}
                width={48}
                height={48}
                className="h-12 w-auto"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {company?.name?.charAt(0) || "?"}
              </div>
            )}
            <span className="font-semibold text-lg">{company?.name}</span>
          </Link>
          <h1 className="text-3xl font-bold">Kunde werden</h1>
          <p className="text-muted-foreground mt-2">Registrieren Sie sich, um Fahrten bei {company?.name} zu buchen.</p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ihre Daten</CardTitle>
            <CardDescription>Alle Felder mit * sind Pflichtfelder.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-medium">Persönliche Daten</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salutation">Anrede *</Label>
                    <Select value={form.salutation} onValueChange={(v) => setForm({ ...form, salutation: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALUTATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel</Label>
                    <Select
                      value={form.title || "none"}
                      onValueChange={(v) => setForm({ ...form, title: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kein Titel</SelectItem>
                        {TITLE_OPTIONS.filter((t) => t.value).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-medium">Kontaktdaten</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="Festnetz"
                      maxLength={20}
                    />
                    {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobil</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => handleFieldChange("mobile", e.target.value)}
                      placeholder="Mobilnummer"
                      maxLength={20}
                    />
                    {fieldErrors.mobile && <p className="text-xs text-destructive">{fieldErrors.mobile}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-medium">Adresse</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="street">Straße *</Label>
                    <Input
                      id="street"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber">Hausnr. *</Label>
                    <Input
                      id="houseNumber"
                      value={form.houseNumber}
                      onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">PLZ *</Label>
                    <Input
                      id="postalCode"
                      value={form.postalCode}
                      onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                      required
                      maxLength={5}
                      inputMode="numeric"
                      pattern="\d{5}"
                      placeholder="12345"
                    />
                    {fieldErrors.postalCode && <p className="text-xs text-destructive">{fieldErrors.postalCode}</p>}
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="font-medium">Passwort</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Passwort bestätigen *</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      value={form.passwordConfirm}
                      onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={form.acceptTerms}
                    onCheckedChange={(c) => setForm({ ...form, acceptTerms: c === true })}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                    Ich akzeptiere die{" "}
                    <Link href="/agb" className="text-primary hover:underline" target="_blank">
                      AGB
                    </Link>{" "}
                    *
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={form.acceptPrivacy}
                    onCheckedChange={(c) => setForm({ ...form, acceptPrivacy: c === true })}
                  />
                  <Label htmlFor="acceptPrivacy" className="text-sm leading-relaxed">
                    Ich habe die{" "}
                    <Link href="/datenschutz" className="text-primary hover:underline" target="_blank">
                      Datenschutzerklärung
                    </Link>{" "}
                    gelesen *
                  </Label>
                </div>
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Wird registriert..." : "Registrieren"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Bereits registriert?{" "}
          <Link href={`/c/${companySlug}/login`} className="text-primary hover:underline">
            Hier anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
