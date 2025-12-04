"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Star,
  Check,
  Users,
  Car,
  Calendar,
  Menu,
  X,
  LogIn,
  Plane,
  Building2,
  Heart,
  Award,
  ThumbsUp,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from "lucide-react"

// =============================================================================
// TYPES - Simplified and Safe
// =============================================================================

interface Company {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  logo_url?: string | null
  company_slug: string
  landingpage_enabled?: boolean
  landingpage_title?: string | null
  landingpage_description?: string | null
  landingpage_hero_text?: string | null
  landingpage_sections?: Record<string, unknown> | null
  landingpage_meta?: Record<string, unknown> | null
  widget_enabled?: boolean
  widget_button_text?: string | null
  branding?: Record<string, unknown> | null
  contact_info?: Record<string, unknown> | null
  legal_texts?: Record<string, unknown> | null
  legal_info?: Record<string, unknown> | null
  subscription_tier?: string
  subscription_status?: string
}

interface TenantLandingPageProps {
  company: Company
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function safeGet<T>(obj: Record<string, unknown> | null | undefined, key: string, fallback: T): T {
  if (!obj || typeof obj !== "object") return fallback
  const value = obj[key]
  if (value === undefined || value === null) return fallback
  return value as T
}

// =============================================================================
// DEFAULT CONTENT
// =============================================================================

const DEFAULT_HERO_IMAGE = "/images/tenant-hero-bg.jpg"

const defaultServices = [
  {
    id: "1",
    title: "Flughafentransfer",
    description:
      "Zuverlaessige und puenktliche Abholung sowie Lieferung zu allen deutschen Flughaefen - entspannt und stressfrei.",
    icon: "plane",
  },
  {
    id: "2",
    title: "Geschaeftsfahrten",
    description: "Diskreter und professioneller Chauffeurservice fuer Ihre wichtigen Geschaeftstermine und Meetings.",
    icon: "building",
  },
  {
    id: "3",
    title: "Eventservice",
    description: "Stilvolle und elegante Befoerderung zu Hochzeiten, Galas und besonderen Anlaessen.",
    icon: "heart",
  },
  {
    id: "4",
    title: "Stadtrundfahrten",
    description: "Entdecken Sie die Highlights der Stadt mit unserem erfahrenen und ortskundigen Fahrer.",
    icon: "car",
  },
]

const defaultTestimonials = [
  {
    id: "1",
    name: "Thomas Mueller",
    rating: 5,
    text: "Absolut zuverlaessiger und professioneller Service! Die Fahrer sind immer puenktlich und aeusserst hoeflich.",
    date: "vor 2 Wochen",
  },
  {
    id: "2",
    name: "Sandra Klein",
    rating: 5,
    text: "Perfekt fuer meinen woechentlichen Flughafentransfer. Komfortabel, sauber und immer on time.",
    date: "vor 1 Monat",
  },
  {
    id: "3",
    name: "Michael Bauer",
    rating: 5,
    text: "Nutze den Service regelmaessig fuer Geschaeftstermine. Immer erstklassig und zuverlaessig!",
    date: "vor 3 Wochen",
  },
]

const defaultFAQs = [
  {
    id: "1",
    question: "Wie kann ich eine Fahrt buchen?",
    answer:
      "Sie erreichen uns telefonisch, per E-Mail oder ueber unser praktisches Kontaktformular. Wir bestaetigen Ihre Buchung umgehend und sind auch kurzfristig fuer Sie da.",
  },
  {
    id: "2",
    question: "Wie frueh sollte ich meine Fahrt buchen?",
    answer:
      "Fuer optimale Verfuegbarkeit empfehlen wir eine Buchung mindestens 24 Stunden im Voraus. Bei Flughafentransfers gerne 48 Stunden vorher. Kurzfristige Anfragen sind nach Verfuegbarkeit moeglich.",
  },
  {
    id: "3",
    question: "Welche Zahlungsmethoden akzeptieren Sie?",
    answer:
      "Wir akzeptieren Barzahlung, EC-Karte, alle gaengigen Kreditkarten sowie Rechnung fuer Geschaeftskunden. Die Zahlung erfolgt bequem nach der Fahrt.",
  },
  {
    id: "4",
    question: "Sind Ihre Fahrer geschult und lizenziert?",
    answer:
      "Selbstverstaendlich! Alle unsere Fahrer verfuegen ueber einen Personenbefoerderungsschein und werden regelmaessig geschult. Zudem sind alle Fahrzeuge vollversichert.",
  },
]

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  car: Car,
  plane: Plane,
  users: Users,
  calendar: Calendar,
  shield: Shield,
  star: Star,
  clock: Clock,
  building: Building2,
  heart: Heart,
  award: Award,
  thumbsup: ThumbsUp,
}

function getIcon(iconName: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  return iconMap[iconName?.toLowerCase()] || Car
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TenantLandingPage({ company }: TenantLandingPageProps) {
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  // Safe extraction of branding
  const branding = company.branding || {}
  const primaryColor = safeGet(branding, "primary_color", safeGet(branding, "primaryColor", "#1e3a5f"))

  // Safe extraction of contact info
  const contactInfo = company.contact_info || {}
  const businessHours = safeGet(contactInfo, "business_hours", "Mo-So: 00:00-24:00 Uhr")

  // Safe extraction of sections
  const sectionsRaw = company.landingpage_sections || {}
  const servicesArr = safeGet<unknown[]>(sectionsRaw, "services", [])
  const testimonialsArr = safeGet<unknown[]>(sectionsRaw, "testimonials", [])
  const faqsArr = safeGet<unknown[]>(sectionsRaw, "faqs", [])

  const services = servicesArr.length > 0 ? servicesArr : defaultServices
  const testimonials = testimonialsArr.length > 0 ? testimonialsArr : defaultTestimonials
  const faqs = faqsArr.length > 0 ? faqsArr : defaultFAQs

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contactForm, company_id: company.id, type: "tenant_contact" }),
      })
      setSubmitSuccess(true)
      setContactForm({ name: "", email: "", phone: "", message: "" })
    } catch (error) {
      console.error("Contact form error:", error)
    }
    setIsSubmitting(false)
  }

  const CIStarIcon = ({ filled = true, className = "" }: { filled?: boolean; className?: string }) => (
    <Star
      className={`h-5 w-5 ${className}`}
      style={{
        color: primaryColor,
        fill: filled ? primaryColor : "transparent",
      }}
    />
  )

  return (
    <div className="min-h-screen bg-card">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/c/${company.company_slug}`} className="flex items-center gap-3 group">
              {company.logo_url ? (
                <Image
                  src={company.logo_url || "/placeholder.svg"}
                  alt={company.name}
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg transition-transform group-hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  {company.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-xl hidden sm:block text-foreground">{company.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {["Leistungen", "Ueber uns", "Kontakt", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all hover:after:w-full"
                  style={{ ["--tw-after-bg" as string]: primaryColor }}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="hidden md:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
                  style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}
                >
                  <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                  {company.phone}
                </a>
              )}
              <Link href={`/c/${company.company_slug}/login`}>
                <Button
                  size="sm"
                  className="hidden sm:flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <LogIn className="h-4 w-4" />
                  Anmelden
                </Button>
              </Link>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
              {["Leistungen", "Ueber uns", "Kontakt", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium py-2 hover:opacity-70 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: primaryColor }}
                >
                  {item}
                </a>
              ))}
              <Link
                href={`/c/${company.company_slug}/login`}
                className="flex items-center gap-2 text-sm font-medium py-2"
                style={{ color: primaryColor }}
              >
                <LogIn className="h-4 w-4" />
                Anmelden
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Hintergrundbild */}
        <div className="absolute inset-0">
          <Image
            src={(safeGet(branding, "hero_image", DEFAULT_HERO_IMAGE) as string) || "/placeholder.svg"}
            alt="Premium Chauffeur Service"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Eleganter Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}f0 0%, ${primaryColor}cc 40%, ${primaryColor}99 100%)`,
            }}
          />
          {/* Zusaetzlicher Overlay fuer Tiefe */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" style={{ color: "white" }} />
              Ihr zuverlaessiger Chauffeur- & Fahrservice
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
              {company.landingpage_title || `Willkommen bei ${company.name}`}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/95 mb-10 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
              {company.landingpage_description ||
                "Exzellente Personenbefoerderung mit hoechstem Komfort und Zuverlaessigkeit - fuer jeden Anlass."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#kontakt">
                <Button
                  size="lg"
                  className="bg-card hover:bg-card/95 text-foreground font-semibold px-8 shadow-2xl hover:shadow-xl transition-all group"
                >
                  <Phone className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Jetzt unverbindlich anfragen
                </Button>
              </a>
              <a href="#leistungen">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent font-semibold"
                >
                  Unsere Leistungen entdecken
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-14 flex flex-wrap justify-center gap-4">
              {[
                { icon: Clock, text: "24/7 Erreichbar" },
                { icon: Shield, text: "Lizenziert & Versichert" },
                { icon: Star, text: "Top bewertet" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm rounded-full px-5 py-2.5 border border-primary-foreground/20"
                >
                  <badge.icon className="h-4 w-4 text-primary-foreground" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dekorative Welle */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-card"
            />
          </svg>
        </div>
      </section>

      {/* SERVICES */}
      <section id="leistungen" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Car className="h-3.5 w-3.5 mr-1.5" style={{ color: primaryColor }} />
              Unsere Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Erstklassige Leistungen fuer Sie</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Von zuverlaessigen Flughafentransfers bis hin zu eleganten Eventfahrten - wir sind fuer Sie da.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(services as Array<{ id: string; title: string; description: string; icon: string }>).map((service) => {
              const IconComponent = getIcon(service.icon)
              return (
                <Card
                  key={service.id}
                  className="hover:shadow-2xl transition-all duration-500 border-0 bg-card shadow-lg group hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                      style={{ backgroundColor: `${primaryColor}12` }}
                    >
                      <IconComponent className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="ueber-uns" className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 px-4 py-1.5"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Award className="h-3.5 w-3.5 mr-1.5" style={{ color: primaryColor }} />
                Ueber uns
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Ihr Partner fuer erstklassige Mobilitaet
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                {company.name} steht fuer hoechste Qualitaet, absolute Puenktlichkeit und unuebertroffene
                Zuverlaessigkeit im Bereich der professionellen Personenbefoerderung. Mit jahrelanger Erfahrung und
                einem engagierten Team garantieren wir Ihnen einen Service, der keine Wuensche offen laesst.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: Shield, text: "Vollständig lizenziert & versichert" },
                  { icon: Clock, text: "Garantierte Pünktlichkeit" },
                  { icon: Users, text: "Geschulte & erfahrene Fahrer" },
                  { icon: Car, text: "Gepflegte Premium-Fahrzeuge" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}12` }}
                    >
                      <item.icon className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/luxury-chauffeur-service.jpg"
                  alt={`${company.name} Service`}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Schwebende Statistik-Karte */}
              <div className="absolute -bottom-8 -left-8 bg-card rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ThumbsUp className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Kundenzufriedenheit</div>
                  </div>
                </div>
              </div>
              {/* Zweite schwebende Karte */}
              <div className="absolute -top-6 -right-6 bg-card rounded-2xl shadow-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <CIStarIcon key={i} className="h-5 w-5" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-center">Bestbewertet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" style={{ color: primaryColor }} />
              Kundenstimmen
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Das sagen unsere zufriedenen Kunden</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Ueberzeugen Sie sich selbst von unserem erstklassigen Service.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(testimonials as Array<{ id: string; name: string; rating: number; text: string; date?: string }>).map(
              (testimonial) => (
                <Card
                  key={testimonial.id}
                  className="border-0 bg-muted hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <CIStarIcon key={i} />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 italic text-lg leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{testimonial.name}</div>
                        {testimonial.date && <div className="text-sm text-muted-foreground">{testimonial.date}</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Haeufige Fragen
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Haben Sie Fragen? Wir haben Antworten.
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {(faqs as Array<{ id: string; question: string; answer: string }>).map((faq) => (
              <div
                key={faq.id}
                className="bg-card rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                >
                  <span className="font-semibold text-foreground text-lg pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${openFAQ === faq.id ? "rotate-180" : ""}`}
                    style={{ color: primaryColor }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFAQ === faq.id ? "max-h-96" : "max-h-0"}`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="kontakt" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" style={{ color: primaryColor }} />
              Kontakt
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Wir freuen uns auf Ihre Anfrage</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Haben Sie Fragen oder moechten Sie eine Fahrt buchen? Kontaktieren Sie uns - wir sind fuer Sie da!
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Kontaktinformationen */}
            <Card className="border-0 bg-muted shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 text-foreground">So erreichen Sie uns</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="flex items-start gap-4 group p-4 bg-card rounded-xl hover:shadow-md transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${primaryColor}12` }}
                      >
                        <Phone className="h-6 w-6" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:underline">Telefon</div>
                        <div className="text-sm text-muted-foreground">{company.phone}</div>
                      </div>
                    </a>
                  )}
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-start gap-4 group p-4 bg-card rounded-xl hover:shadow-md transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${primaryColor}12` }}
                      >
                        <Mail className="h-6 w-6" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:underline">E-Mail</div>
                        <div className="text-sm text-muted-foreground break-all">{company.email}</div>
                      </div>
                    </a>
                  )}
                  {company.address && (
                    <div className="flex items-start gap-4 p-4 bg-card rounded-xl">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${primaryColor}12` }}
                      >
                        <MapPin className="h-6 w-6" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Adresse</div>
                        <div className="text-sm text-muted-foreground">{company.address}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4 p-4 bg-card rounded-xl">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}12` }}
                    >
                      <Clock className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Erreichbarkeit</div>
                      <div className="text-sm text-muted-foreground">{businessHours}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kontaktformular */}
            <Card className="border-0 bg-muted shadow-lg">
              <CardContent className="p-8">
                {submitSuccess ? (
                  <div className="text-center py-12">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}12` }}
                    >
                      <Check className="h-10 w-10" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Vielen Dank!</h3>
                    <p className="text-muted-foreground">
                      Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns schnellstmoeglich bei Ihnen.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-foreground font-medium">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          required
                          placeholder="Ihr vollstaendiger Name"
                          className="mt-1.5 bg-card"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-foreground font-medium">
                          E-Mail *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                          placeholder="ihre@email.de"
                          className="mt-1.5 bg-card"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground font-medium">
                        Telefon *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+49 123 456789"
                        required
                        className="mt-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-foreground font-medium">
                        Ihre Nachricht *
                      </Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        placeholder="Beschreiben Sie Ihren Fahrtwunsch oder stellen Sie Ihre Frage..."
                        rows={5}
                        className="mt-1.5 bg-white resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: primaryColor }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Wird gesendet..." : "Nachricht absenden"}
                      <MessageCircle className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Mit dem Absenden stimmen Sie unserer Datenschutzerklaerung zu.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-primary-foreground text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Bereit fuer Ihre naechste Fahrt?</h2>
              <p className="text-primary-foreground/85 text-lg max-w-xl">
                Kontaktieren Sie uns jetzt fuer ein unverbindliches Angebot. Wir freuen uns, Sie bald an Bord zu haben!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {company.phone && (
                <a href={`tel:${company.phone}`}>
                  <Button
                    size="lg"
                    className="bg-card hover:bg-card/95 text-foreground font-semibold shadow-xl hover:shadow-2xl transition-all px-8"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Jetzt anrufen
                  </Button>
                </a>
              )}
              <Link href={`/c/${company.company_slug}/login`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent font-semibold px-8"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Zum Kundenportal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url || "/placeholder.svg"}
                    alt={company.name}
                    width={48}
                    height={48}
                    className="h-12 w-auto"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {company.name.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-xl">{company.name}</span>
              </div>
              <p className="text-primary-foreground/60 mb-5 max-w-md leading-relaxed">
                {company.landingpage_description ||
                  "Ihr zuverlaessiger Partner fuer professionelle Personenbefoerderung mit hoechstem Anspruch an Qualitaet und Service."}
              </p>
              {company.address && (
                <p className="text-primary-foreground/50 text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  {company.address}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-lg mb-5">Schnellzugriff</h4>
              <ul className="space-y-3">
                {[
                  { href: "#leistungen", text: "Leistungen" },
                  { href: "#ueber-uns", text: "Ueber uns" },
                  { href: "#kontakt", text: "Kontakt" },
                  { href: `#`, text: "Anmelden", link: `/c/${company.company_slug}/login` },
                ].map((item) => (
                  <li key={item.text}>
                    {item.link ? (
                      <Link href={item.link} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                        {item.text}
                      </Link>
                    ) : (
                      <a href={item.href} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                        {item.text}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-5">Rechtliches</h4>
              <ul className="space-y-3">
                {[
                  { href: `/c/${company.company_slug}/impressum`, text: "Impressum" },
                  { href: `/c/${company.company_slug}/datenschutz`, text: "Datenschutz" },
                  { href: `/c/${company.company_slug}/agb`, text: "AGB" },
                ].map((item) => (
                  <li key={item.text}>
                    <Link href={item.href} className="text-white/60 hover:text-white transition-colors">
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} {company.name}. Alle Rechte vorbehalten.
            </p>
            <p className="text-sm text-white/30">
              Powered by{" "}
              <Link href="/" className="hover:text-white/50 transition-colors">
                MyDispatch
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
