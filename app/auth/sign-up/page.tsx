"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@/lib/supabase/client"
import { createSubscription } from "@/app/actions/create-subscription"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, Plus, Minus, Sparkles } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription"

// =============================================================================
// DESIGN-GUIDELINES: Harmonisiert mit Login Seite
// - Primary-Farbe #323D5E für Branding-Seite
// - Einheitliche Abstände (gap-5, p-6)
// - Gleiche Typografie und Icon-Styles
// =============================================================================

const supabase = createBrowserClient()

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")

  const [step, setStep] = useState(1)
  const totalSteps = 4
  const stepTitles = ["Zugangsdaten", "Persönliche Daten", "Unternehmen", "Tarif wählen"]

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Zugangsdaten
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Persönliche Daten
    salutation: "",
    title: "",
    firstName: "",
    lastName: "",
    // Step 3: Unternehmen
    companyName: "",
    address: "",
    zip: "",
    city: "",
    country: "Deutschland",
    vatId: "",
    taxNumber: "",
    isSmallBusiness: false,
    // Step 4: Tarif
    plan: "starter" as "starter" | "business" | "enterprise",
    billingInterval: "monthly" as "monthly" | "yearly",
    addOnQuantity: 0,
    acceptTerms: false,
    acceptPrivacy: false,
  })

  useEffect(() => {
    if (canceled === "true") {
      setError("Zahlung wurde abgebrochen. Bitte versuchen Sie es erneut.")
    }
  }, [canceled])

  const updateForm = (field: string, value: string | boolean | number | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (): boolean => {
    setError(null)

    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError("Bitte füllen Sie alle Pflichtfelder aus")
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Bitte geben Sie eine gültige E-Mail-Adresse ein")
        return false
      }
      if (formData.password.length < 8) {
        setError("Das Passwort muss mindestens 8 Zeichen lang sein")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Die Passwörter stimmen nicht überein")
        return false
      }
    }

    if (step === 2) {
      if (!formData.salutation || !formData.firstName || !formData.lastName) {
        setError("Bitte füllen Sie alle Pflichtfelder aus")
        return false
      }
    }

    if (step === 3) {
      if (!formData.companyName || !formData.address || !formData.zip || !formData.city) {
        setError("Bitte füllen Sie alle Pflichtfelder aus")
        return false
      }
    }

    if (step === 4) {
      if (!formData.acceptTerms || !formData.acceptPrivacy) {
        setError("Bitte akzeptieren Sie die AGB und Datenschutzbestimmungen")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await createSubscription({
        email: formData.email,
        password: formData.password,
        salutation: formData.salutation,
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        address: formData.address,
        zip: formData.zip,
        city: formData.city,
        country: formData.country,
        vatId: formData.vatId,
        plan: formData.plan,
        billingInterval: formData.billingInterval,
        addOnQuantity: formData.addOnQuantity,
      })

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result.redirectToContact) {
        router.push("/kontakt?subject=enterprise")
      } else {
        setError(result.error || "Ein Fehler ist aufgetreten")
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePrice = () => {
    const plan = SUBSCRIPTION_PLANS[formData.plan]
    if (!plan) return { basePrice: 0, addOnPrice: 0, total: 0 }

    const basePrice = formData.billingInterval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
    const addOnPrice = formData.addOnQuantity * 10
    const total = basePrice + addOnPrice

    return { basePrice, addOnPrice, total }
  }

  const prices = calculatePrice()

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

          <h1 className="text-3xl font-bold mb-4">Starten Sie jetzt</h1>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Erstellen Sie Ihr Konto und verwalten Sie Ihre Flotte effizient mit MyDispatch.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-0.5">
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Sofort einsatzbereit</p>
                <p className="text-primary-foreground/60 text-sm">Nach Registrierung direkt loslegen</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-0.5">
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Schnelle Einrichtung</p>
                <p className="text-primary-foreground/60 text-sm">In weniger als 5 Minuten einsatzbereit</p>
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

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background overflow-y-auto">
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

          {/* Progress Steps */}
          <div className="mb-8">
            <p className="text-center text-xs sm:text-sm font-medium tracking-widest text-muted-foreground mb-6">
              SCHRITT {step} VON {totalSteps}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-5">
              {stepTitles.map((_, index) => {
                const stepNum = index + 1
                const isActive = stepNum === step
                const isCompleted = stepNum < step

                return (
                  <div key={stepNum} className="flex items-center">
                    {/* Step Circle */}
                    <div className="relative">
                      {isActive && <div className="absolute inset-0 -m-1 rounded-full border-2 border-primary" />}
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {stepNum}
                      </div>
                    </div>
                    {/* Connector Line */}
                    {stepNum < totalSteps && (
                      <div className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 ${stepNum < step ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-card-foreground mb-1">Konto erstellen</h2>
              <p className="text-muted-foreground text-sm">
                Schritt {step} von {totalSteps}: {stepTitles[step - 1]}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Zugangsdaten */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                      E-Mail Adresse *
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="ihre@email.de"
                      required
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                      Passwort *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mindestens 8 Zeichen"
                        required
                        value={formData.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                      Passwort bestätigen *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Passwort wiederholen"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => updateForm("confirmPassword", e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Persönliche Daten */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="salutation" className="block text-sm font-medium text-foreground mb-1.5">
                        Anrede *
                      </label>
                      <Select value={formData.salutation} onValueChange={(v) => updateForm("salutation", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Herr">Herr</SelectItem>
                          <SelectItem value="Frau">Frau</SelectItem>
                          <SelectItem value="Divers">Divers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                        Titel
                      </label>
                      <Select value={formData.title} onValueChange={(v) => updateForm("title", v)}>
                        <SelectTrigger>
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

                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
                      Vorname *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Max"
                      required
                      value={formData.firstName}
                      onChange={(e) => updateForm("firstName", e.target.value)}
                      className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
                      Nachname *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Mustermann"
                      required
                      value={formData.lastName}
                      onChange={(e) => updateForm("lastName", e.target.value)}
                      className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Unternehmen */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1.5">
                      Firmenname *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      placeholder="Muster GmbH"
                      required
                      value={formData.companyName}
                      onChange={(e) => updateForm("companyName", e.target.value)}
                      className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
                      Straße und Hausnummer *
                    </label>
                    <input
                      id="address"
                      type="text"
                      placeholder="Musterstraße 123"
                      required
                      value={formData.address}
                      onChange={(e) => updateForm("address", e.target.value)}
                      className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label htmlFor="zip" className="block text-sm font-medium text-foreground mb-1.5">
                        PLZ *
                      </label>
                      <input
                        id="zip"
                        type="text"
                        placeholder="12345"
                        required
                        value={formData.zip}
                        onChange={(e) => updateForm("zip", e.target.value)}
                        className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">
                        Stadt *
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="Berlin"
                        required
                        value={formData.city}
                        onChange={(e) => updateForm("city", e.target.value)}
                        className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1.5">
                      Land *
                    </label>
                    <Select value={formData.country} onValueChange={(v) => updateForm("country", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                        <SelectItem value="Österreich">Österreich</SelectItem>
                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="vatId" className="block text-sm font-medium text-foreground mb-1.5">
                      USt-IdNr. (optional)
                    </label>
                    <input
                      id="vatId"
                      type="text"
                      placeholder="DE123456789"
                      value={formData.vatId}
                      onChange={(e) => updateForm("vatId", e.target.value.toUpperCase())}
                      className="w-full px-3 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="isSmallBusiness"
                      checked={formData.isSmallBusiness}
                      onCheckedChange={(checked) => updateForm("isSmallBusiness", !!checked)}
                    />
                    <label htmlFor="isSmallBusiness" className="text-sm font-normal cursor-pointer">
                      Kleinunternehmerregelung nach §19 UStG
                    </label>
                  </div>
                </div>
              )}

              {/* Step 4: Tarif wählen */}
              {step === 4 && (
                <div className="space-y-4">
                  {/* Billing Interval */}
                  <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateForm("billingInterval", "monthly")}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        formData.billingInterval === "monthly"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Monatlich
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm("billingInterval", "yearly")}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        formData.billingInterval === "yearly"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Jährlich
                      <Badge variant="secondary" className="ml-2 text-xs">
                        -20%
                      </Badge>
                    </button>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-3">
                    {/* Starter Plan */}
                    <div
                      onClick={() => updateForm("plan", "starter")}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.plan === "starter"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Starter</h3>
                          <p className="text-sm text-muted-foreground">Bis zu 3 Fahrer & 3 Fahrzeuge</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {formData.billingInterval === "yearly" ? "31,20" : "39"}€
                          </div>
                          <div className="text-xs text-muted-foreground">/Monat</div>
                        </div>
                      </div>
                    </div>

                    {/* Business Plan */}
                    <div
                      onClick={() => updateForm("plan", "business")}
                      className={`p-4 border rounded-xl cursor-pointer transition-all relative ${
                        formData.plan === "business"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Badge className="absolute -top-2 right-4 bg-primary">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Empfohlen
                      </Badge>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Business</h3>
                          <p className="text-sm text-muted-foreground">Unbegrenzte Fahrer & Fahrzeuge</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {formData.billingInterval === "yearly" ? "79,20" : "99"}€
                          </div>
                          <div className="text-xs text-muted-foreground">/Monat</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add-On for Starter */}
                  {formData.plan === "starter" && (
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">Erweiterung</h4>
                          <p className="text-xs text-muted-foreground">+1 Fahrer & +1 Fahrzeug für 10€/Monat</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateForm("addOnQuantity", Math.max(0, formData.addOnQuantity - 1))}
                            disabled={formData.addOnQuantity === 0}
                            className="h-8 w-8 rounded-xl border border-input bg-background flex items-center justify-center hover:bg-muted disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{formData.addOnQuantity}</span>
                          <button
                            type="button"
                            onClick={() => updateForm("addOnQuantity", formData.addOnQuantity + 1)}
                            className="h-8 w-8 rounded-xl border border-input bg-background flex items-center justify-center hover:bg-muted"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="p-4 bg-muted rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Grundpreis</span>
                      <span>{prices.basePrice.toFixed(2)}€</span>
                    </div>
                    {prices.addOnPrice > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Erweiterungen ({formData.addOnQuantity}x)</span>
                        <span>{prices.addOnPrice.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Gesamt</span>
                      <span>{prices.total.toFixed(2)}€/Monat</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => updateForm("acceptTerms", !!checked)}
                      />
                      <label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer leading-tight">
                        Ich akzeptiere die{" "}
                        <Link href="/agb" className="text-primary hover:underline" target="_blank">
                          AGB
                        </Link>{" "}
                        und{" "}
                        <Link href="/nutzungsbedingungen" className="text-primary hover:underline" target="_blank">
                          Nutzungsbedingungen
                        </Link>
                        *
                      </label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptPrivacy"
                        checked={formData.acceptPrivacy}
                        onCheckedChange={(checked) => updateForm("acceptPrivacy", !!checked)}
                      />
                      <label htmlFor="acceptPrivacy" className="text-sm font-normal cursor-pointer leading-tight">
                        Ich habe die{" "}
                        <Link href="/datenschutz" className="text-primary hover:underline" target="_blank">
                          Datenschutzerklärung
                        </Link>{" "}
                        gelesen und akzeptiere diese *
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 py-2.5 px-4 border border-input rounded-xl font-medium hover:bg-muted transition-colors text-sm flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center justify-center"
                  >
                    Weiter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Wird verarbeitet...
                      </>
                    ) : (
                      "Zur Zahlung"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Bereits ein Konto?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Jetzt anmelden
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
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
