"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Globe,
  Palette,
  Layout,
  FileText,
  Phone,
  Plus,
  Trash2,
  Star,
  Users,
  Car,
  Clock,
  HelpCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Briefcase,
  Shield,
  Zap,
  Heart,
  Award,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

// Constants
const VEHICLE_CATEGORIES = [
  { value: "sedan", label: "Limousine" },
  { value: "van", label: "Van / Kleinbus" },
  { value: "suv", label: "SUV" },
  { value: "luxury", label: "Luxusklasse" },
  { value: "electric", label: "Elektrofahrzeug" },
]

const COLOR_PRESETS = [
  { name: "MyDispatch", primary: "#323D5E", secondary: "#4A5568", accent: "#F59E0B" },
  { name: "Klassisch", primary: "#1a1a2e", secondary: "#16213e", accent: "#e94560" },
  { name: "Modern", primary: "#0f172a", secondary: "#1e293b", accent: "#3b82f6" },
  { name: "Elegant", primary: "#18181b", secondary: "#27272a", accent: "#f97316" },
]

const SERVICE_ICONS = [
  { value: "car", label: "Auto", icon: Car },
  { value: "users", label: "Personen", icon: Users },
  { value: "clock", label: "Uhr", icon: Clock },
  { value: "briefcase", label: "Business", icon: Briefcase },
  { value: "shield", label: "Sicherheit", icon: Shield },
  { value: "zap", label: "Schnell", icon: Zap },
  { value: "heart", label: "Herz", icon: Heart },
  { value: "award", label: "Auszeichnung", icon: Award },
  { value: "star", label: "Stern", icon: Star },
  { value: "check", label: "Check", icon: CheckCircle },
]

interface LandingpageSections {
  services_enabled: boolean
  services_title: string
  services: Array<{ id: string; title: string; description: string; icon: string }>
  about_enabled: boolean
  about_title: string
  about_text: string
  vehicles_enabled: boolean
  vehicles_title: string
  vehicles: Array<{ id: string; name: string; category: string; passengers: number; image_url: string }>
  testimonials_enabled: boolean
  testimonials_title: string
  testimonials: Array<{ id: string; name: string; text: string; rating: number }>
  faq_enabled: boolean
  faq_title: string
  faqs: Array<{ id: string; question: string; answer: string }>
  cta_enabled: boolean
  cta_title: string
  cta_text: string
  cta_button_text: string
  contact_phone: string
  contact_email: string
  contact_address: string
  social_facebook: string
  social_instagram: string
  social_twitter: string
  social_linkedin: string
}

interface LandingpageEditorProps {
  formData: {
    landingpage_enabled: boolean
    company_slug: string
    title: string
    subtitle: string
    description: string
    primary_color: string
    secondary_color: string
    accent_color: string
    landingpage_sections?: LandingpageSections
  }
  setFormData: (data: any) => void
  companyName?: string
  logoUrl?: string
}

const DEFAULT_SECTIONS: LandingpageSections = {
  services_enabled: true,
  services_title: "Unsere Services",
  services: [
    { id: "1", title: "Flughafentransfer", description: "Pünktlich und zuverlässig zum Flughafen", icon: "car" },
    { id: "2", title: "Business-Fahrten", description: "Professioneller Chauffeurservice", icon: "briefcase" },
    { id: "3", title: "Eventservice", description: "Für besondere Anlässe", icon: "star" },
  ],
  about_enabled: true,
  about_title: "Über uns",
  about_text: "Wir sind Ihr zuverlässiger Partner für erstklassige Transportlösungen.",
  vehicles_enabled: true,
  vehicles_title: "Unsere Fahrzeuge",
  vehicles: [],
  testimonials_enabled: true,
  testimonials_title: "Kundenbewertungen",
  testimonials: [],
  faq_enabled: true,
  faq_title: "Häufige Fragen",
  faqs: [
    {
      id: "1",
      question: "Wie kann ich buchen?",
      answer: "Sie können uns telefonisch oder über unser Kontaktformular erreichen.",
    },
    {
      id: "2",
      question: "Welche Zahlungsmethoden akzeptieren Sie?",
      answer: "Wir akzeptieren Bargeld, EC-Karte und Kreditkarte.",
    },
  ],
  cta_enabled: true,
  cta_title: "Jetzt buchen",
  cta_text: "Kontaktieren Sie uns für Ihre nächste Fahrt",
  cta_button_text: "Kontakt aufnehmen",
  contact_phone: "",
  contact_email: "",
  contact_address: "",
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_linkedin: "",
}

interface LandingpagePreviewProps {
  formData: LandingpageEditorProps["formData"]
  sections: LandingpageSections
  companyName?: string
  logoUrl?: string
  previewDevice: "desktop" | "tablet" | "mobile"
}

function LandingpagePreview({ formData, sections, companyName, logoUrl, previewDevice }: LandingpagePreviewProps) {
  const { primary_color, secondary_color, accent_color } = formData

  const deviceStyles = {
    desktop: { width: "100%", minHeight: "600px" },
    tablet: {
      width: "768px",
      minHeight: "600px",
      margin: "0 auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      borderRadius: "12px",
    },
    mobile: {
      width: "375px",
      minHeight: "600px",
      margin: "0 auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      borderRadius: "24px",
    },
  }

  const previewStyle = deviceStyles[previewDevice]

  return (
    <div
      className="overflow-auto bg-card text-foreground rounded-xl"
      style={{
        ...previewStyle,
        ["--preview-primary" as any]: primary_color || "#323D5E",
        ["--preview-secondary" as any]: secondary_color || "#4A5568",
        ["--preview-accent" as any]: accent_color || "#F59E0B",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 py-4 px-6 flex items-center justify-between border-b"
        style={{ backgroundColor: primary_color || "#323D5E" }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl || "/placeholder.svg"} alt={companyName} className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-card/20 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">{companyName?.charAt(0) || "M"}</span>
            </div>
          )}
          <span className="text-primary-foreground font-semibold text-sm">{companyName || "Ihr Unternehmen"}</span>
        </div>
        <nav className="hidden md:flex items-center gap-5">
          {sections.services_enabled && <span className="text-primary-foreground/80 text-xs">Services</span>}
          {sections.about_enabled && <span className="text-primary-foreground/80 text-xs">Über uns</span>}
          {sections.vehicles_enabled && <span className="text-primary-foreground/80 text-xs">Fahrzeuge</span>}
          <span className="text-primary-foreground/80 text-xs">Kontakt</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative py-16 px-6"
        style={{
          background: `linear-gradient(135deg, ${primary_color || "#323D5E"} 0%, ${secondary_color || "#4A5568"} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">{formData.title || "Willkommen"}</h1>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            {formData.subtitle || "Ihr zuverlässiger Partner für erstklassige Fahrdienstleistungen"}
          </p>
          <button
            className="px-8 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
            style={{ backgroundColor: accent_color || "#F59E0B" }}
          >
            {sections.cta_button_text || "Jetzt buchen"}
          </button>
        </div>
      </section>

      {/* Services Section */}
      {sections.services_enabled && sections.services.length > 0 && (
        <section className="py-12 px-6 bg-muted">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary_color }}>
              {sections.services_title || "Unsere Services"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sections.services.slice(0, 6).map((service) => {
                const IconComponent = SERVICE_ICONS.find((ic) => ic.value === service.icon)?.icon || Car
                return (
                  <div key={service.id} className="bg-card p-6 rounded-xl shadow-sm border">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${primary_color}15` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: primary_color }} />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{service.title}</h3>
                    <p className="text-sm text-foreground">{service.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {sections.about_enabled && (
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: primary_color }}>
              {sections.about_title || "Über uns"}
            </h2>
            <p className="text-foreground max-w-2xl mx-auto">
              {sections.about_text || "Beschreibung Ihres Unternehmens..."}
            </p>
          </div>
        </section>
      )}

      {/* Vehicles Section */}
      {sections.vehicles_enabled && sections.vehicles.length > 0 && (
        <section className="py-12 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary_color }}>
              {sections.vehicles_title || "Unsere Fahrzeuge"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sections.vehicles.slice(0, 6).map((vehicle) => (
                <div key={vehicle.id} className="bg-card p-6 rounded-xl shadow-sm border text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Car className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {VEHICLE_CATEGORIES.find((c) => c.value === vehicle.category)?.label} • {vehicle.passengers}{" "}
                    Passagiere
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {sections.testimonials_enabled && sections.testimonials.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary_color }}>
              {sections.testimonials_title || "Kundenbewertungen"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sections.testimonials.slice(0, 4).map((testimonial) => (
                <div key={testimonial.id} className="bg-background p-6 rounded-xl">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? "text-warning fill-warning" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-3 italic">"{testimonial.text}"</p>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {sections.faq_enabled && sections.faqs.length > 0 && (
        <section className="py-12 px-6 bg-background">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primary_color }}>
              {sections.faq_title || "Häufige Fragen"}
            </h2>
            <div className="space-y-4">
              {sections.faqs.map((faq) => (
                <div key={faq.id} className="bg-card p-4 rounded-xl border">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {sections.cta_enabled && (
        <section
          className="py-12 px-6"
          style={{
            background: `linear-gradient(135deg, ${primary_color || "#323D5E"} 0%, ${secondary_color || "#4A5568"} 100%)`,
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-primary-foreground mb-3">{sections.cta_title || "Jetzt buchen"}</h2>
            <p className="text-primary-foreground/80 mb-6">{sections.cta_text || "Kontaktieren Sie uns für Ihre nächste Fahrt"}</p>
            <button
              className="px-8 py-3 rounded-xl text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              style={{ backgroundColor: accent_color || "#F59E0B" }}
            >
              {sections.cta_button_text || "Kontakt aufnehmen"}
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-3">{companyName || "Ihr Unternehmen"}</h4>
              <p className="text-sm text-muted-foreground">{formData.description || "Ihr zuverlässiger Partner"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Kontakt</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {sections.contact_phone && <p>{sections.contact_phone}</p>}
                {sections.contact_email && <p>{sections.contact_email}</p>}
                {sections.contact_address && <p>{sections.contact_address}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Folgen Sie uns</h4>
              <div className="flex gap-3">
                {sections.social_facebook && <Facebook className="w-5 h-5 text-muted-foreground" />}
                {sections.social_instagram && <Instagram className="w-5 h-5 text-muted-foreground" />}
                {sections.social_twitter && <Twitter className="w-5 h-5 text-muted-foreground" />}
                {sections.social_linkedin && <Linkedin className="w-5 h-5 text-muted-foreground" />}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {companyName || "Ihr Unternehmen"}. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  )
}

export function LandingpageEditor({ formData, setFormData, companyName, logoUrl }: LandingpageEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [activeTab, setActiveTab] = useState("inhalt")

  const sections = formData.landingpage_sections || DEFAULT_SECTIONS

  const updateSections = (updates: Partial<LandingpageSections>) => {
    setFormData({
      ...formData,
      landingpage_sections: { ...sections, ...updates },
    })
  }

  const addService = () => {
    updateSections({
      services: [...sections.services, { id: Date.now().toString(), title: "", description: "", icon: "car" }],
    })
  }

  const removeService = (id: string) => {
    updateSections({ services: sections.services.filter((s) => s.id !== id) })
  }

  const updateService = (id: string, updates: Partial<(typeof sections.services)[0]>) => {
    updateSections({
      services: sections.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })
  }

  const addVehicle = () => {
    updateSections({
      vehicles: [
        ...sections.vehicles,
        { id: Date.now().toString(), name: "", category: "sedan", passengers: 4, image_url: "" },
      ],
    })
  }

  const removeVehicle = (id: string) => {
    updateSections({ vehicles: sections.vehicles.filter((v) => v.id !== id) })
  }

  const updateVehicle = (id: string, updates: Partial<(typeof sections.vehicles)[0]>) => {
    updateSections({
      vehicles: sections.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })
  }

  const addTestimonial = () => {
    updateSections({
      testimonials: [...sections.testimonials, { id: Date.now().toString(), name: "", text: "", rating: 5 }],
    })
  }

  const removeTestimonial = (id: string) => {
    updateSections({ testimonials: sections.testimonials.filter((t) => t.id !== id) })
  }

  const updateTestimonial = (id: string, updates: Partial<(typeof sections.testimonials)[0]>) => {
    updateSections({
      testimonials: sections.testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })
  }

  const addFaq = () => {
    updateSections({
      faqs: [...sections.faqs, { id: Date.now().toString(), question: "", answer: "" }],
    })
  }

  const removeFaq = (id: string) => {
    updateSections({ faqs: sections.faqs.filter((f) => f.id !== id) })
  }

  const updateFaq = (id: string, updates: Partial<(typeof sections.faqs)[0]>) => {
    updateSections({
      faqs: sections.faqs.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Landingpage-Editor</CardTitle>
              <CardDescription>Gestalten Sie Ihre öffentliche Unternehmensseite</CardDescription>
            </div>
          </div>
          {formData.landingpage_enabled && (
            <div className="flex items-center gap-2">
              <Button
                variant={showPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"}
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
          <div className={showPreview ? "grid grid-cols-1 xl:grid-cols-2 gap-5" : ""}>
            {/* Editor Panel */}
            <div className="space-y-6">
              {/* Device selector wenn Vorschau aktiv */}
              {showPreview && (
                <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-xl xl:hidden">
                  <Button
                    variant={previewDevice === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("desktop")}
                    className="gap-2"
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewDevice === "tablet" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("tablet")}
                    className="gap-2"
                  >
                    <Tablet className="w-4 h-4" />
                    Tablet
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("mobile")}
                    className="gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobil
                  </Button>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="inhalt" className="gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Inhalt</span>
                  </TabsTrigger>
                  <TabsTrigger value="sektionen" className="gap-2">
                    <Layout className="w-4 h-4" />
                    <span className="hidden sm:inline">Sektionen</span>
                  </TabsTrigger>
                  <TabsTrigger value="kontakt" className="gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Kontakt</span>
                  </TabsTrigger>
                  <TabsTrigger value="design" className="gap-2">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">Design</span>
                  </TabsTrigger>
                </TabsList>

                {/* Inhalt Tab */}
                <TabsContent value="inhalt" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>URL-Slug</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">my-dispatch.de/c/</span>
                      <Input
                        value={formData.company_slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        placeholder="ihr-unternehmen"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Titel (Hero-Bereich)</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Willkommen bei Ihrem Fahrservice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Untertitel</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Ihr zuverlässiger Partner für erstklassige Transportlösungen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung (Footer)</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Kurze Beschreibung Ihres Unternehmens..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Sektionen Tab */}
                <TabsContent value="sektionen" className="space-y-4 mt-4">
                  <Accordion type="multiple" className="space-y-2">
                    {/* Services */}
                    <AccordionItem value="services" className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span>Services</span>
                          <Badge variant={sections.services_enabled ? "default" : "secondary"} className="ml-2">
                            {sections.services_enabled ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Sektion aktivieren</Label>
                          <Switch
                            checked={sections.services_enabled}
                            onCheckedChange={(checked) => updateSections({ services_enabled: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={sections.services_title}
                            onChange={(e) => updateSections({ services_title: e.target.value })}
                            placeholder="Unsere Services"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Services ({sections.services.length})</Label>
                            <Button variant="outline" size="sm" onClick={addService} className="gap-1 bg-transparent">
                              <Plus className="w-3 h-3" />
                              Hinzufügen
                            </Button>
                          </div>
                          {sections.services.map((service) => (
                            <div key={service.id} className="p-3 border rounded-xl space-y-2 bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={service.icon}
                                  onValueChange={(value) => updateService(service.id, { icon: value })}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SERVICE_ICONS.map((icon) => (
                                      <SelectItem key={icon.value} value={icon.value}>
                                        <div className="flex items-center gap-2">
                                          <icon.icon className="w-4 h-4" />
                                          {icon.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={service.title}
                                  onChange={(e) => updateService(service.id, { title: e.target.value })}
                                  placeholder="Service-Titel"
                                  className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeService(service.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                              <Textarea
                                value={service.description}
                                onChange={(e) => updateService(service.id, { description: e.target.value })}
                                placeholder="Beschreibung..."
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* About */}
                    <AccordionItem value="about" className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Über uns</span>
                          <Badge variant={sections.about_enabled ? "default" : "secondary"} className="ml-2">
                            {sections.about_enabled ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Sektion aktivieren</Label>
                          <Switch
                            checked={sections.about_enabled}
                            onCheckedChange={(checked) => updateSections({ about_enabled: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={sections.about_title}
                            onChange={(e) => updateSections({ about_title: e.target.value })}
                            placeholder="Über uns"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Text</Label>
                          <Textarea
                            value={sections.about_text}
                            onChange={(e) => updateSections({ about_text: e.target.value })}
                            placeholder="Beschreiben Sie Ihr Unternehmen..."
                            rows={4}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Vehicles */}
                    <AccordionItem value="vehicles" className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Car className="w-4 h-4 text-primary" />
                          <span>Fahrzeuge</span>
                          <Badge variant={sections.vehicles_enabled ? "default" : "secondary"} className="ml-2">
                            {sections.vehicles_enabled ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Sektion aktivieren</Label>
                          <Switch
                            checked={sections.vehicles_enabled}
                            onCheckedChange={(checked) => updateSections({ vehicles_enabled: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={sections.vehicles_title}
                            onChange={(e) => updateSections({ vehicles_title: e.target.value })}
                            placeholder="Unsere Fahrzeuge"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Fahrzeuge ({sections.vehicles.length})</Label>
                            <Button variant="outline" size="sm" onClick={addVehicle} className="gap-1 bg-transparent">
                              <Plus className="w-3 h-3" />
                              Hinzufügen
                            </Button>
                          </div>
                          {sections.vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="p-3 border rounded-xl space-y-2 bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={vehicle.name}
                                  onChange={(e) => updateVehicle(vehicle.id, { name: e.target.value })}
                                  placeholder="Fahrzeugname"
                                  className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeVehicle(vehicle.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Select
                                  value={vehicle.category}
                                  onValueChange={(value) => updateVehicle(vehicle.id, { category: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Kategorie" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {VEHICLE_CATEGORIES.map((cat) => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={vehicle.passengers}
                                  onChange={(e) =>
                                    updateVehicle(vehicle.id, { passengers: Number.parseInt(e.target.value) || 1 })
                                  }
                                  placeholder="Passagiere"
                                  min={1}
                                  max={50}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Testimonials */}
                    <AccordionItem value="testimonials" className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Star className="w-4 h-4 text-primary" />
                          <span>Bewertungen</span>
                          <Badge variant={sections.testimonials_enabled ? "default" : "secondary"} className="ml-2">
                            {sections.testimonials_enabled ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Sektion aktivieren</Label>
                          <Switch
                            checked={sections.testimonials_enabled}
                            onCheckedChange={(checked) => updateSections({ testimonials_enabled: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={sections.testimonials_title}
                            onChange={(e) => updateSections({ testimonials_title: e.target.value })}
                            placeholder="Kundenbewertungen"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Bewertungen ({sections.testimonials.length})</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addTestimonial}
                              className="gap-1 bg-transparent"
                            >
                              <Plus className="w-3 h-3" />
                              Hinzufügen
                            </Button>
                          </div>
                          {sections.testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="p-3 border rounded-xl space-y-2 bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={testimonial.name}
                                  onChange={(e) => updateTestimonial(testimonial.id, { name: e.target.value })}
                                  placeholder="Kundenname"
                                  className="flex-1"
                                />
                                <Select
                                  value={testimonial.rating.toString()}
                                  onValueChange={(value) =>
                                    updateTestimonial(testimonial.id, { rating: Number.parseInt(value) })
                                  }
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                      <SelectItem key={r} value={r.toString()}>
                                        {r} ★
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => removeTestimonial(testimonial.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                              <Textarea
                                value={testimonial.text}
                                onChange={(e) => updateTestimonial(testimonial.id, { text: e.target.value })}
                                placeholder="Bewertungstext..."
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* FAQ */}
                    <AccordionItem value="faq" className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 text-primary" />
                          <span>FAQ</span>
                          <Badge variant={sections.faq_enabled ? "default" : "secondary"} className="ml-2">
                            {sections.faq_enabled ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Sektion aktivieren</Label>
                          <Switch
                            checked={sections.faq_enabled}
                            onCheckedChange={(checked) => updateSections({ faq_enabled: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={sections.faq_title}
                            onChange={(e) => updateSections({ faq_title: e.target.value })}
                            placeholder="Häufige Fragen"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Fragen ({sections.faqs.length})</Label>
                            <Button variant="outline" size="sm" onClick={addFaq} className="gap-1 bg-transparent">
                              <Plus className="w-3 h-3" />
                              Hinzufügen
                            </Button>
                          </div>
                          {sections.faqs.map((faq) => (
                            <div key={faq.id} className="p-3 border rounded-xl space-y-2 bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={faq.question}
                                  onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
                                  placeholder="Frage"
                                  className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeFaq(faq.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                              <Textarea
                                value={faq.answer}
                                onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
                                placeholder="Antwort..."
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* CTA */}
                    <AccordionItem value="cta" className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>Call-to-Action</span>
                          <Badge variant={sections.cta_enabled ? "default" : "secondary"} className="ml-2">
                            {sections.cta_enabled ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Sektion aktivieren</Label>
                          <Switch
                            checked={sections.cta_enabled}
                            onCheckedChange={(checked) => updateSections({ cta_enabled: checked })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={sections.cta_title}
                            onChange={(e) => updateSections({ cta_title: e.target.value })}
                            placeholder="Jetzt buchen"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Text</Label>
                          <Input
                            value={sections.cta_text}
                            onChange={(e) => updateSections({ cta_text: e.target.value })}
                            placeholder="Kontaktieren Sie uns..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button-Text</Label>
                          <Input
                            value={sections.cta_button_text}
                            onChange={(e) => updateSections({ cta_button_text: e.target.value })}
                            placeholder="Kontakt aufnehmen"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>

                {/* Kontakt Tab */}
                <TabsContent value="kontakt" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Kontaktdaten
                    </h4>
                    <div className="grid gap-5">
                      <div className="space-y-2">
                        <Label>Telefon</Label>
                        <Input
                          value={sections.contact_phone}
                          onChange={(e) => updateSections({ contact_phone: e.target.value })}
                          placeholder="+49 123 456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-Mail</Label>
                        <Input
                          value={sections.contact_email}
                          onChange={(e) => updateSections({ contact_email: e.target.value })}
                          placeholder="info@beispiel.de"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Textarea
                          value={sections.contact_address}
                          onChange={(e) => updateSections({ contact_address: e.target.value })}
                          placeholder="Musterstraße 1, 12345 Musterstadt"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Social Media
                    </h4>
                    <div className="grid gap-5">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </Label>
                        <Input
                          value={sections.social_facebook}
                          onChange={(e) => updateSections({ social_facebook: e.target.value })}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </Label>
                        <Input
                          value={sections.social_instagram}
                          onChange={(e) => updateSections({ social_instagram: e.target.value })}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          Twitter/X
                        </Label>
                        <Input
                          value={sections.social_twitter}
                          onChange={(e) => updateSections({ social_twitter: e.target.value })}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </Label>
                        <Input
                          value={sections.social_linkedin}
                          onChange={(e) => updateSections({ social_linkedin: e.target.value })}
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Farbschema-Vorlagen
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          className="p-3 border rounded-xl hover:border-primary transition-colors text-left"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              primary_color: preset.primary,
                              secondary_color: preset.secondary,
                              accent_color: preset.accent,
                            })
                          }
                        >
                          <div className="flex gap-2 mb-2">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <p className="text-sm font-medium">{preset.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Eigene Farben</h4>
                    <div className="grid gap-5">
                      <div className="space-y-2">
                        <Label>Primärfarbe</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.primary_color || "#323D5E"}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={formData.primary_color || "#323D5E"}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            placeholder="#323D5E"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Sekundärfarbe</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.secondary_color || "#4A5568"}
                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={formData.secondary_color || "#4A5568"}
                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                            placeholder="#4A5568"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Akzentfarbe</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.accent_color || "#F59E0B"}
                            onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={formData.accent_color || "#F59E0B"}
                            onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                            placeholder="#F59E0B"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel - nur auf xl Screens sichtbar wenn showPreview aktiv */}
            {showPreview && (
              <div className="hidden xl:block sticky top-20">
                <div className="border rounded-xl bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Live-Vorschau
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        variant={previewDevice === "desktop" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewDevice("desktop")}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewDevice === "tablet" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewDevice("tablet")}
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewDevice === "mobile" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewDevice("mobile")}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-xl p-4 overflow-auto max-h-[calc(100vh-200px)]">
                    <LandingpagePreview
                      formData={formData}
                      sections={sections}
                      companyName={companyName}
                      logoUrl={logoUrl}
                      previewDevice={previewDevice}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
