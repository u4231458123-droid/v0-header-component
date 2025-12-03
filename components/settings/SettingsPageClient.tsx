"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/design-system/PageHeader"
import {
  Building2,
  Users,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Globe,
  Settings,
  AlertTriangle,
  Save,
  Eye,
  ExternalLink,
  Upload,
  Trash2,
  Phone,
  MapPin,
  FileText,
  ImageIcon,
} from "lucide-react"

import { TeamManagement } from "./TeamManagement"

/**
 * SETTINGS PAGE CLIENT
 * ====================
 * Diese Komponente ist NUR für MyDispatch-KUNDEN (Unternehmer)
 * KEINE Master-Admin-Funktionen hier!
 */

// SVG Icons
const Loader2Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
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

interface Company {
  id?: string
  name?: string
  email?: string
  phone?: string
  mydispatch_id?: string
  company_slug?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  website?: string
  logo_url?: string
  tax_id?: string
  vat_id?: string
  landingpage_enabled?: boolean
  landingpage_title?: string
  landingpage_hero_text?: string
  landingpage_description?: string
  landingpage_sections?: LandingpageSections
  landingpage_meta?: {
    keywords?: string
    og_image?: string
  }
  widget_enabled?: boolean
  widget_button_text?: string
  subscription_plan?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  owner_salutation?: string
  owner_first_name?: string
  owner_last_name?: string
  minimum_lead_time?: number
  accepted_payment_methods?: string[]
  branding?: {
    primary_color?: string
    secondary_color?: string
    accent_color?: string
    font_family?: string
  }
  contact_info?: {
    support_email?: string
    support_phone?: string
    whatsapp?: string
  }
  bank_info?: {
    iban?: string
    bic?: string
    bank_name?: string
  }
  legal_info?: {
    company_registration?: string
    tax_id?: string
    vat_id?: string
  }
  is_small_business?: boolean
  small_business_note?: string
  opening_hours?: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  gewerbeanmeldung_url?: string
  briefpapier_url?: string
}

interface LandingpageService {
  id: string
  title: string
  description: string
  icon: string
  enabled: boolean
}

interface LandingpageVehicle {
  id: string
  name: string
  category: string
  passengers: number
  image_url?: string
  enabled: boolean
}

interface LandingpageFAQ {
  id: string
  question: string
  answer: string
  enabled: boolean
}

interface LandingpageTestimonial {
  id: string
  name: string
  rating: number
  text: string
  date?: string
  enabled: boolean
}

interface LandingpageSections {
  services_enabled: boolean
  services_title: string
  services: LandingpageService[]
  about_enabled: boolean
  about_title: string
  about_text: string
  about_image_url?: string
  vehicles_enabled: boolean
  vehicles_title: string
  vehicles: LandingpageVehicle[]
  testimonials_enabled: boolean
  testimonials_title: string
  testimonials: LandingpageTestimonial[]
  faq_enabled: boolean
  faq_title: string
  faqs: LandingpageFAQ[]
  social_links: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  cta_enabled: boolean
  cta_title: string
  cta_text: string
  cta_button_text: string
}

interface Profile {
  id?: string
  full_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  role?: string
  company_id?: string
}

interface TeamMember {
  id: string
  full_name?: string
  email?: string
  role?: string
  avatar_url?: string
  created_at?: string
}

interface SettingsPageClientProps {
  company?: Company | null
  profile?: Profile | null
  teamMembers?: TeamMember[]
  usage?: {
    drivers: number
    vehicles: number
    bookings: number
  }
}

const TIER_LIMITS = {
  starter: { drivers: 3, vehicles: 3, bookings: 100 },
  business: { drivers: -1, vehicles: -1, bookings: -1 }, // Business: Unbegrenzt
  enterprise: { drivers: -1, vehicles: -1, bookings: -1 },
}

const TIER_INFO = {
  starter: { name: "Starter", price: 39 },
  business: { name: "Business", price: 99 },
  enterprise: { name: "Enterprise", price: null },
}

export function SettingsPageClient({
  company = null,
  profile = null,
  teamMembers = [],
  usage = { drivers: 0, vehicles: 0, bookings: 0 },
}: SettingsPageClientProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState(company ? "company" : "profile")
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const gewerbeanmeldungInputRef = useRef<HTMLInputElement>(null)
  const briefpapierInputRef = useRef<HTMLInputElement>(null)

  const tier = (company?.subscription_plan as keyof typeof TIER_LIMITS) || "starter"
  const limits = TIER_LIMITS[tier]
  const tierInfo = TIER_INFO[tier]

  // Form state
  const [formData, setFormData] = useState({
    // Company basics
    name: company?.name || "",
    email: company?.email || "",
    phone: company?.phone || "",
    mobile: (company as any)?.mobile || "",
    address: company?.address || "",
    zip: company?.postal_code || (company as any)?.zip || "", // Unterstützt beide Spaltennamen
    city: company?.city || "",
    // Owner info
    owner_salutation: company?.owner_salutation || "",
    owner_first_name: company?.owner_first_name || "",
    owner_last_name: company?.owner_last_name || "",
    // Landingpage
    company_slug: company?.company_slug || "",
    landingpage_enabled: company?.landingpage_enabled || false,
    widget_enabled: company?.widget_enabled || false,
    landingpage_title: company?.landingpage_title || "",
    landingpage_description: company?.landingpage_description || "",
    landingpage_hero_text: company?.landingpage_hero_text || "",
    widget_button_text: company?.widget_button_text || "Jetzt buchen",
    widget_size: (company as any)?.widget_size || "medium",
    // Branding
    primary_color: company?.branding?.primary_color || "#323D5E",
    secondary_color: company?.branding?.secondary_color || "#f5f5f5",
    accent_color: company?.branding?.accent_color || "#10b981",
    // Contact
    support_email: company?.contact_info?.support_email || "",
    support_phone: company?.contact_info?.support_phone || "",
    whatsapp: company?.contact_info?.whatsapp || "",
    // Bank
    iban: company?.bank_info?.iban || "",
    bic: company?.bank_info?.bic || "",
    bank_name: company?.bank_info?.bank_name || "",
    // Legal
    company_registration: company?.legal_info?.company_registration || "",
    tax_id: company?.legal_info?.tax_id || "",
    vat_id: company?.legal_info?.vat_id || "",
    is_small_business: company?.is_small_business || false,
    small_business_note: company?.small_business_note || "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
    // Opening Hours
    monday: company?.opening_hours?.monday || "08:00 - 18:00",
    tuesday: company?.opening_hours?.tuesday || "08:00 - 18:00",
    wednesday: company?.opening_hours?.wednesday || "08:00 - 18:00",
    thursday: company?.opening_hours?.thursday || "08:00 - 18:00",
    friday: company?.opening_hours?.friday || "08:00 - 18:00",
    saturday: company?.opening_hours?.saturday || "09:00 - 14:00",
    sunday: company?.opening_hours?.sunday || "Geschlossen",
    minimum_lead_time: company?.minimum_lead_time || 30,
    accepted_payment_methods: company?.accepted_payment_methods || ["cash", "card", "invoice"],
    // </CHANGE>
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSave = async () => {
    if (!company || !company.id) {
      toast.error("Kein Unternehmen gefunden")
      return
    }

    setLoading(true)

    try {
      // Prüfe ob User authentifiziert ist
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.")
        router.push("/auth/login")
        return
      }

      const updateData: any = {
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        mobile: formData.mobile || null,
        address: formData.address || null,
        postal_code: formData.zip || null, // Korrigiert: zip -> postal_code
        city: formData.city || null,
        owner_salutation: formData.owner_salutation || null,
        owner_first_name: formData.owner_first_name || null,
        owner_last_name: formData.owner_last_name || null,
        company_slug: formData.company_slug || null,
        landingpage_enabled: formData.landingpage_enabled || false,
        widget_enabled: formData.widget_enabled || false,
        landingpage_title: formData.landingpage_title || null,
        landingpage_description: formData.landingpage_description || null,
        landingpage_hero_text: formData.landingpage_hero_text || null,
        widget_button_text: formData.widget_button_text || null,
        widget_size: formData.widget_size || "medium",
        branding: {
          primary_color: formData.primary_color || null,
          secondary_color: formData.secondary_color || null,
          accent_color: formData.accent_color || null,
        },
        contact_info: {
          support_email: formData.support_email || null,
          support_phone: formData.support_phone || null,
          whatsapp: formData.whatsapp || null,
        },
        bank_info: {
          iban: formData.iban || null,
          bic: formData.bic || null,
          bank_name: formData.bank_name || null,
        },
        legal_info: {
          company_registration: formData.company_registration || null,
          tax_id: formData.tax_id || null,
          vat_id: formData.vat_id || null,
        },
        is_small_business: formData.is_small_business || false,
        small_business_note: formData.small_business_note || null,
        opening_hours: {
          monday: formData.monday || null,
          tuesday: formData.tuesday || null,
          wednesday: formData.wednesday || null,
          thursday: formData.thursday || null,
          friday: formData.friday || null,
          saturday: formData.saturday || null,
          sunday: formData.sunday || null,
        },
        minimum_lead_time: formData.minimum_lead_time || 30,
        accepted_payment_methods: formData.accepted_payment_methods || [],
      }

      console.log("[Settings] Updating company:", company.id, updateData)

      const { data, error } = await supabase
        .from("companies")
        .update(updateData)
        .eq("id", company.id)
        .select()

      if (error) {
        console.error("[Settings] Update error:", error)
        throw error
      }

      console.log("[Settings] Update successful:", data)

      toast.success("Einstellungen erfolgreich gespeichert")
      router.refresh()
    } catch (error: any) {
      console.error("[Settings] Error saving settings:", error)
      const errorMessage = error?.message || error?.details || "Unbekannter Fehler"
      toast.error(`Fehler beim Speichern: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !company || !company.id) return

    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${company.id}-logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("company-assets").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("companies")
        .update({ logo_url: publicUrl })
        .eq("id", company.id)

      if (updateError) throw updateError

      toast.success("Logo erfolgreich hochgeladen")
      router.refresh()
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Fehler beim Hochladen des Logos")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!company) return

    try {
      const { error } = await supabase.from("companies").update({ logo_url: null }).eq("id", company.id)

      if (error) throw error

      toast.success("Logo entfernt")
      router.refresh()
    } catch (error) {
      console.error("Error removing logo:", error)
      toast.error("Fehler beim Entfernen des Logos")
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen lang sein")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      toast.success("Passwort erfolgreich geändert")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Fehler beim Ändern des Passworts")
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/billing-portal", {
        method: "POST",
      })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
      toast.error("Fehler beim Öffnen des Kundenportals")
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min((current / limit) * 100, 100)
  }

  // Tabs NUR für Kunden (KEINE Admin-Tabs!)
  const availableTabs = []

  if (company) {
    availableTabs.push(
      { id: "company", label: "Unternehmen", icon: Building2 },
      { id: "landingpage", label: "Landingpage", icon: Globe },
      { id: "branding", label: "Branding", icon: Palette },
      { id: "team", label: "Team", icon: Users },
      { id: "billing", label: "Abrechnung", icon: CreditCard },
      { id: "notifications", label: "Benachrichtigungen", icon: Bell },
    )
  }

  availableTabs.push({ id: "profile", label: "Mein Profil", icon: Settings })
  availableTabs.push({ id: "security", label: "Sicherheit", icon: Shield })

  // The following line was the cause of the lint error. The 'setTeamMembers' state is managed within the TeamManagement component or needs to be passed down correctly.
  // As a workaround, we are removing the explicit setTeamMembers call here, assuming TeamManagement handles its own data fetching or updates.
  // If a parent-level update is truly needed, the state management strategy would need to be revisited.
  const [currentTeamMembers, setCurrentTeamMembers] = useState<TeamMember[]>(teamMembers)

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <PageHeader title="Einstellungen" description="Verwalten Sie Ihr Unternehmen, Ihre Landingpage und Präferenzen">
        <div className="flex items-center gap-3">
          {company?.subscription_plan && (
            <Badge variant="outline" className="capitalize">
              {company.subscription_plan} Plan
            </Badge>
          )}
          <Button onClick={handleSave} disabled={loading} className="gap-2 rounded-xl">
            {loading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {/* Kein Unternehmen - Registrierung nötig */}
      {!company && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400">Kein Unternehmen gefunden</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sie haben noch kein Unternehmen registriert. Bitte schließen Sie zuerst die Registrierung ab.
                </p>
                <Button className="mt-3" size="sm" onClick={() => router.push("/auth/sign-up")}>
                  Unternehmen erstellen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 h-auto">
          {availableTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 rounded-xl border bg-card hover:bg-accent transition-colors"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          {!company ? (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Kein Unternehmen gefunden</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sie haben noch kein Unternehmen registriert. Bitte schließen Sie zuerst die Registrierung ab.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Unternehmensdaten
                </CardTitle>
                <CardDescription>Grundlegende Informationen zu Ihrem Unternehmen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* Firmenname */}
              <div className="space-y-2">
                <Label htmlFor="name">Firmenname *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Taxi Mustermann GmbH"
                />
              </div>

              {/* Inhaber */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Inhaber / Ansprechpartner</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="owner_salutation">Anrede</Label>
                    <select
                      id="owner_salutation"
                      value={formData.owner_salutation}
                      onChange={(e) => setFormData({ ...formData, owner_salutation: e.target.value })}
                      className="w-full h-10 px-3 border border-input rounded-xl bg-background"
                    >
                      <option value="">Bitte wählen</option>
                      <option value="Herr">Herr</option>
                      <option value="Frau">Frau</option>
                      <option value="Divers">Divers</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_first_name">Vorname</Label>
                    <Input
                      id="owner_first_name"
                      value={formData.owner_first_name}
                      onChange={(e) => setFormData({ ...formData, owner_first_name: e.target.value })}
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_last_name">NACHNAME</Label>
                    <Input
                      id="owner_last_name"
                      value={formData.owner_last_name}
                      onChange={(e) => setFormData({ ...formData, owner_last_name: e.target.value.toUpperCase() })}
                      placeholder="MUSTERMANN"
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adresse
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Straße und Hausnummer</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Musterstraße 1"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="zip">PLZ</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) =>
                          setFormData({ ...formData, zip: e.target.value.replace(/\D/g, "").slice(0, 5) })
                        }
                        placeholder="12345"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="city">Ort</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Berlin"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kontakt */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Kontakt
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+49 123 456789"
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobil</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+49 170 1234567"
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">E-Mail Adresse *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@taxi-mustermann.de"
                    />
                  </div>
                </div>
              </div>

              {/* Rechtliche Angaben */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Rechtliche Angaben
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vat_id">USt-IdNr.</Label>
                    <Input
                      id="vat_id"
                      value={formData.vat_id}
                      onChange={(e) => setFormData({ ...formData, vat_id: e.target.value.toUpperCase() })}
                      placeholder="DE123456789"
                      maxLength={11}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Steuernummer</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      placeholder="123/456/78901"
                      maxLength={13}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_small_business">Kleinunternehmerregelung</Label>
                      <p className="text-sm text-muted-foreground">Gemäß § 19 UStG keine Umsatzsteuer ausweisen</p>
                    </div>
                    <Switch
                      id="is_small_business"
                      checked={formData.is_small_business}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_small_business: checked })}
                    />
                  </div>

                  {formData.is_small_business && (
                    <div className="space-y-2">
                      <Label htmlFor="small_business_note">Hinweistext auf Rechnungen</Label>
                      <Input
                        id="small_business_note"
                        value={formData.small_business_note}
                        onChange={(e) => setFormData({ ...formData, small_business_note: e.target.value })}
                        placeholder="Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
                      />
                      <p className="text-xs text-muted-foreground">Dieser Text wird auf allen Rechnungen angezeigt.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bankverbindung */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Bankverbindung</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="Commerzbank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                      placeholder="DE89 3704 0044 0532 0130 00"
                      maxLength={27}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bic">BIC</Label>
                    <Input
                      id="bic"
                      value={formData.bic}
                      onChange={(e) => setFormData({ ...formData, bic: e.target.value.toUpperCase() })}
                      placeholder="COBADEFFXXX"
                      maxLength={11}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Buchungseinstellungen (Neue Sektion) */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Buchungseinstellungen
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minimum_lead_time">Mindestvorlaufzeit (Minuten)</Label>
                    <Input
                      id="minimum_lead_time"
                      type="number"
                      value={formData.minimum_lead_time}
                      onChange={(e) =>
                        setFormData({ ...formData, minimum_lead_time: Number.parseInt(e.target.value, 10) || 0 })
                      }
                      placeholder="30"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wie viele Minuten im Voraus muss eine Fahrt gebucht werden?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Akzeptierte Zahlungsmethoden</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "cash", label: "Barzahlung" },
                        { value: "card", label: "Kartenzahlung" },
                        { value: "paypal", label: "PayPal" },
                        { value: "invoice", label: "Rechnung" },
                      ].map((method) => (
                        <Button
                          key={method.value}
                          variant="outline"
                          size="sm"
                          className={`rounded-xl capitalize ${
                            formData.accepted_payment_methods.includes(method.value)
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() => {
                            const newMethods = formData.accepted_payment_methods.includes(method.value)
                              ? formData.accepted_payment_methods.filter((m) => m !== method.value)
                              : [...formData.accepted_payment_methods, method.value]
                            setFormData({ ...formData, accepted_payment_methods: newMethods })
                          }}
                        >
                          {method.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Landingpage Tab - ERWEITERTER EDITOR */}
        <TabsContent value="landingpage" className="space-y-6">
          {!company ? (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Kein Unternehmen gefunden</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sie müssen zuerst ein Unternehmen erstellen, um eine Landingpage zu konfigurieren.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Landingpage-Editor
                  </CardTitle>
                  <CardDescription>Gestalten Sie Ihre öffentliche Unternehmensseite</CardDescription>
                </div>
                {formData.landingpage_enabled && formData.company_slug && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-2">
                      <Eye className="w-4 h-4" />
                      {showPreview ? "Editor" : "Vorschau"}
                    </Button>
                    <Link href={`/c/${formData.company_slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ExternalLink className="w-4 h-4" />
                        Live-Seite
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Aktivierung */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                <div className="space-y-1">
                  <p className="font-medium">Landingpage aktivieren</p>
                  <p className="text-sm text-muted-foreground">
                    Ihre Kunden finden Sie unter my-dispatch.de/c/{formData.company_slug || "ihr-slug"}
                  </p>
                </div>
                <Switch
                  checked={formData.landingpage_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, landingpage_enabled: checked })}
                />
              </div>

              {formData.landingpage_enabled && (
                <>
                  {/* URL-Slug */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_slug">URL-Slug *</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">my-dispatch.de/c/</span>
                        <Input
                          id="company_slug"
                          value={formData.company_slug}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                            })
                          }
                          placeholder="ihr-unternehmen"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Nur Kleinbuchstaben, Zahlen und Bindestriche</p>
                    </div>
                  </div>

                  {/* Hero-Bereich */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Hero-Bereich</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="landingpage_title">Hauptüberschrift</Label>
                        <Input
                          id="landingpage_title"
                          value={formData.landingpage_title}
                          onChange={(e) => setFormData({ ...formData, landingpage_title: e.target.value })}
                          placeholder="Ihr zuverlässiger Taxiservice in Berlin"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landingpage_hero_text">Beschreibungstext</Label>
                        <Textarea
                          id="landingpage_hero_text"
                          value={formData.landingpage_hero_text}
                          onChange={(e) => setFormData({ ...formData, landingpage_hero_text: e.target.value })}
                          placeholder="Beschreiben Sie Ihren Service in 2-3 Sätzen..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">SEO & Meta-Daten</h3>
                    <div className="space-y-2">
                      <Label htmlFor="landingpage_description">Meta-Beschreibung (für Google)</Label>
                      <Textarea
                        id="landingpage_description"
                        value={formData.landingpage_description}
                        onChange={(e) => setFormData({ ...formData, landingpage_description: e.target.value })}
                        placeholder="Diese Beschreibung erscheint in den Google-Suchergebnissen..."
                        rows={2}
                        maxLength={160}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.landingpage_description.length}/160 Zeichen
                      </p>
                    </div>
                  </div>

                  {/* Buchungs-Widget */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                      <div className="space-y-1">
                        <p className="font-medium">Online-Buchungswidget</p>
                        <p className="text-sm text-muted-foreground">
                          Kunden können direkt über Ihre Landingpage Fahrten buchen
                        </p>
                        {tier === "starter" && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600 mt-1">
                            Upgrade auf Business für diese Funktion
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={formData.widget_enabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, widget_enabled: checked })}
                        disabled={tier === "starter"}
                      />
                    </div>

                    {formData.widget_enabled && tier !== "starter" && (
                      <div className="mt-4 space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="widget_button_text">Button-Text</Label>
                          <Input
                            id="widget_button_text"
                            value={formData.widget_button_text}
                            onChange={(e) => setFormData({ ...formData, widget_button_text: e.target.value })}
                            placeholder="Jetzt buchen"
                          />
                        </div>

                        {/* Widget-Einbettungscode */}
                        <div className="border-t border-border pt-6">
                          <h3 className="font-semibold mb-4">Widget in externe Webseite einbinden</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Kopieren Sie den folgenden Code und fügen Sie ihn in Ihre Webseite ein.
                          </p>

                          {/* Größen-Auswahl */}
                          <div className="mb-4">
                            <Label>Widget-Größe</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {[
                                { value: "small", label: "Klein", size: "400x600" },
                                { value: "medium", label: "Mittel", size: "500x700" },
                                { value: "large", label: "Groß", size: "600x800" },
                              ].map((size) => (
                                <Button
                                  key={size.value}
                                  variant={formData.widget_size === size.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setFormData({ ...formData, widget_size: size.value })}
                                  className="rounded-xl"
                                >
                                  {size.label}
                                  <span className="text-xs ml-1 opacity-70">({size.size})</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Einbettungscode */}
                          <div className="space-y-2">
                            <Label>Einbettungscode</Label>
                            <div className="relative">
                              <Textarea
                                readOnly
                                value={`<iframe src="${typeof window !== "undefined" ? window.location.origin : "https://my-dispatch.de"}/widget/${formData.company_slug || "ihr-slug"}?size=${formData.widget_size || "medium"}" width="${formData.widget_size === "small" ? "400" : formData.widget_size === "large" ? "600" : "500"}" height="${formData.widget_size === "small" ? "600" : formData.widget_size === "large" ? "800" : "700"}" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`}
                                className="font-mono text-xs"
                                rows={3}
                                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  const code = `<iframe src="${typeof window !== "undefined" ? window.location.origin : "https://my-dispatch.de"}/widget/${formData.company_slug || "ihr-slug"}?size=${formData.widget_size || "medium"}" width="${formData.widget_size === "small" ? "400" : formData.widget_size === "large" ? "600" : "500"}" height="${formData.widget_size === "small" ? "600" : formData.widget_size === "large" ? "800" : "700"}" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`
                                  navigator.clipboard.writeText(code)
                                  toast.success("Code in Zwischenablage kopiert")
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Fügen Sie diesen Code in den HTML-Bereich Ihrer Webseite ein, wo das Widget angezeigt werden soll.
                            </p>
                          </div>

                          {/* Vorschau */}
                          <div className="mt-4 p-4 bg-muted rounded-xl">
                            <Label className="mb-2 block">Vorschau</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background">
                              <div className="text-center text-muted-foreground text-sm">
                                Widget-Vorschau ({formData.widget_size || "medium"})
                                <br />
                                <span className="text-xs">
                                  {formData.widget_size === "small" ? "400 × 600 px" : formData.widget_size === "large" ? "600 × 800 px" : "500 × 700 px"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Öffnungszeiten */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Öffnungszeiten</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        { key: "monday", label: "Montag" },
                        { key: "tuesday", label: "Dienstag" },
                        { key: "wednesday", label: "Mittwoch" },
                        { key: "thursday", label: "Donnerstag" },
                        { key: "friday", label: "Freitag" },
                        { key: "saturday", label: "Samstag" },
                        { key: "sunday", label: "Sonntag" },
                      ].map((day) => (
                        <div key={day.key} className="flex items-center gap-2">
                          <Label className="w-24 text-sm">{day.label}</Label>
                          <Input
                            value={(formData as any)[day.key]}
                            onChange={(e) => setFormData({ ...formData, [day.key]: e.target.value })}
                            placeholder="08:00 - 18:00"
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kontakt auf Landingpage */}
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Kontaktinformationen (Landingpage)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="support_email">Support E-Mail</Label>
                        <Input
                          id="support_email"
                          type="email"
                          value={formData.support_email}
                          onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                          placeholder="support@ihr-taxi.de"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="support_phone">Support Telefon</Label>
                        <Input
                          id="support_phone"
                          value={formData.support_phone}
                          onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                          placeholder="+49 123 456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
                        <Input
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="+49 170 1234567"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          {!company ? (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Kein Unternehmen gefunden</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sie müssen zuerst ein Unternehmen erstellen, um Branding-Einstellungen zu konfigurieren.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Logo & Branding
              </CardTitle>
              <CardDescription>Passen Sie das Erscheinungsbild Ihrer Landingpage an</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Unternehmenslogo
                </Label>
                <div className="flex items-start gap-6">
                  <div className="w-40 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                    {company?.logo_url ? (
                      <Image
                        src={company.logo_url || "/placeholder.svg"}
                        alt="Logo"
                        width={160}
                        height={96}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Kein Logo</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploading}
                      className="rounded-xl"
                    >
                      {uploading ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                          Hochladen...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Logo hochladen
                        </>
                      )}
                    </Button>
                    {company?.logo_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Entfernen
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">PNG, JPG oder SVG. Max. 2MB. Empfohlen: 400x200px</p>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Farben</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primärfarbe</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer rounded-xl"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#323D5E"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Sekundärfarbe</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer rounded-xl"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="#f5f5f5"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Akzentfarbe</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer rounded-xl"
                      />
                      <Input
                        value={formData.accent_color}
                        onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dokumente */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Dokumente</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Gewerbeanmeldung */}
                  <div className="space-y-2">
                    <Label>Gewerbeanmeldung</Label>
                    <div
                      onClick={() => gewerbeanmeldungInputRef.current?.click()}
                      className="border-2 border-dashed border-input rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center"
                    >
                      <input ref={gewerbeanmeldungInputRef} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" />
                      {company?.gewerbeanmeldung_url ? (
                        <span className="text-sm text-green-600 flex items-center justify-center gap-2">
                          <CheckIcon className="w-4 h-4" />
                          Hochgeladen
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">PDF oder JPG hochladen</span>
                      )}
                    </div>
                  </div>

                  {/* Briefpapier */}
                  <div className="space-y-2">
                    <Label>Briefpapier Vorlage</Label>
                    <div
                      onClick={() => briefpapierInputRef.current?.click()}
                      className="border-2 border-dashed border-input rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center"
                    >
                      <input ref={briefpapierInputRef} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" />
                      {company?.briefpapier_url ? (
                        <span className="text-sm text-green-600 flex items-center justify-center gap-2">
                          <CheckIcon className="w-4 h-4" />
                          Hochgeladen
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">PDF oder JPG hochladen</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Ihr Abonnement
              </CardTitle>
              <CardDescription>Verwalten Sie Ihren Plan und Ihre Zahlungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="p-6 rounded-xl border-2 border-primary bg-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{tierInfo.name}</h3>
                      <Badge className="bg-primary text-primary-foreground">Aktuell</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {tierInfo.price ? `${tierInfo.price}€ / Monat` : "Individueller Preis"}
                    </p>
                  </div>
                  <CheckIcon className="h-6 w-6 text-primary" />
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    <span>{limits.drivers === -1 ? "Unbegrenzte" : `Bis zu ${limits.drivers}`} Fahrer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    <span>{limits.vehicles === -1 ? "Unbegrenzte" : `Bis zu ${limits.vehicles}`} Fahrzeuge</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    <span>{limits.bookings === -1 ? "Unbegrenzte" : `${limits.bookings}`} Buchungen/Monat</span>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div className="space-y-4">
                <h4 className="font-medium">Aktuelle Nutzung</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-sm text-muted-foreground">Fahrer</p>
                    <p className="text-2xl font-bold">{usage.drivers}</p>
                    {limits.drivers !== -1 && (
                      <div className="mt-2">
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${getUsagePercentage(usage.drivers, limits.drivers)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">von {limits.drivers} verfügbar</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-sm text-muted-foreground">Fahrzeuge</p>
                    <p className="text-2xl font-bold">{usage.vehicles}</p>
                    {limits.vehicles !== -1 && (
                      <div className="mt-2">
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${getUsagePercentage(usage.vehicles, limits.vehicles)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">von {limits.vehicles} verfügbar</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-sm text-muted-foreground">Buchungen (Monat)</p>
                    <p className="text-2xl font-bold">{usage.bookings}</p>
                    {limits.bookings !== -1 && (
                      <div className="mt-2">
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${getUsagePercentage(usage.bookings, limits.bookings)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">von {limits.bookings} verfügbar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manage Subscription */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                <Button onClick={handleManageSubscription} variant="outline" className="rounded-xl bg-transparent">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Zahlungen verwalten
                </Button>
                <Link href="/preise">
                  <Button variant="default" className="rounded-xl">
                    Plan upgraden
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {!company ? (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Kein Unternehmen gefunden</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sie müssen zuerst ein Unternehmen erstellen, um Benachrichtigungen zu konfigurieren.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Benachrichtigungseinstellungen
              </CardTitle>
              <CardDescription>Wählen Sie, wie und wann Sie benachrichtigt werden möchten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                  <div className="space-y-1">
                    <p className="font-medium">Neue Buchung</p>
                    <p className="text-sm text-muted-foreground">Benachrichtigung bei neuen Buchungen</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                  <div className="space-y-1">
                    <p className="font-medium">Fristüberschreitung</p>
                    <p className="text-sm text-muted-foreground">Warnung bei ablaufenden Fristen</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                  <div className="space-y-1">
                    <p className="font-medium">Wichtige Systemupdates</p>
                    <p className="text-sm text-muted-foreground">Informationen zu neuen Funktionen und Änderungen</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          {!company || !company.id ? (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Kein Unternehmen gefunden</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sie müssen zuerst ein Unternehmen erstellen, um Team-Mitglieder zu verwalten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <TeamManagement
              companyId={company.id}
            currentUserId={profile?.id || ""}
            currentUserRole={profile?.role || "user"}
            teamMembers={currentTeamMembers as any} // Use the local state (type compatibility)
            onRefresh={async () => {
              // Reload team members
              const { data } = await supabase
                .from("profiles")
                .select("id, email, full_name, avatar_url, role, created_at")
                .eq("company_id", company?.id)
              if (data) {
                // Map profiles to TeamMember format (compatible with TeamManagement component)
                const mappedMembers = data.map((p: any) => ({
                  id: p.id,
                  email: p.email || "",
                  full_name: p.full_name || null,
                  avatar_url: p.avatar_url || null,
                  role: p.role || "user",
                  created_at: p.created_at || new Date().toISOString(),
                }))
                setCurrentTeamMembers(mappedMembers as any)
              }
            }}
          />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Mein Profil
              </CardTitle>
              <CardDescription>Ihre persönlichen Einstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={profile?.full_name || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>E-Mail</Label>
                  <Input value={profile?.email || ""} disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Um Ihre E-Mail-Adresse zu ändern, kontaktieren Sie bitte den Support.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sicherheitseinstellungen
              </CardTitle>
              <CardDescription>Verwalten Sie Ihr Passwort und Ihre Sicherheitsoptionen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Passwort ändern</h4>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Neues Passwort</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Mindestens 8 Zeichen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Passwort wiederholen"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!passwordData.newPassword || !passwordData.confirmPassword || loading}
                    className="rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                        Speichern...
                      </>
                    ) : (
                      "Passwort ändern"
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-4">Aktive Sitzung</h4>
                <div className="p-4 rounded-xl bg-muted flex items-center justify-between">
                  <div>
                    <p className="font-medium">Aktuelle Sitzung</p>
                    <p className="text-sm text-muted-foreground">Angemeldet als {profile?.email}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Aktiv
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
