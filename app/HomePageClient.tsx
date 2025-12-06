"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { LeadChatWidget } from "@/components/ai/LeadChatWidget"
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton"
import { GERMAN_CITIES_SORTED } from "@/lib/german-cities"
import { HomePricingSection } from "@/components/home/HomePricingSection"

// =============================================================================
// INLINE SVG ICONS - No external dependencies
// =============================================================================

function TruckIcon({ className }: { className?: string }) {
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function BarChartIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function SmartphoneIcon({ className }: { className?: string }) {
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
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <line x1="12" x2="12.01" y1="18" y2="18" />
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

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
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
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
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

// =============================================================================
// HEADER - Inline Component mit CI-Farben
// =============================================================================

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/my-dispatch-logo.png"
            alt="MyDispatch - simply arrive"
            width={160}
            height={36}
            className="h-8 sm:h-9 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/auth/login" className="text-muted-foreground hover:text-primary font-medium transition-colors">
            Anmelden
          </Link>
          <PWAInstallButton
            className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            App installieren
          </PWAInstallButton>
        </div>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-6 animate-fade-in">
          <nav className="flex flex-col gap-2">
            <hr className="border-border my-2" />
            <Link
              href="/auth/login"
              className="text-foreground hover:text-primary font-medium py-3 px-4 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Anmelden
            </Link>
            <PWAInstallButton
              className="mt-2 px-5 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-center inline-flex items-center justify-center gap-2"
            >
              App installieren
            </PWAInstallButton>
          </nav>
        </div>
      )}
    </header>
  )
}

// =============================================================================
// FOOTER - Inline Component mit CI-Farben
// =============================================================================

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="sm:col-span-2 md:col-span-1">
            <Image
              src="/images/my-dispatch-logo.png"
              alt="MyDispatch - simply arrive"
              width={140}
              height={32}
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Die moderne Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Unternehmen. Made in Germany.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="/preise" className="hover:text-primary-foreground transition-colors">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/fragen" className="hover:text-primary-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="hover:text-primary-foreground transition-colors">
                  Registrieren
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-primary-foreground transition-colors">
                  Anmelden
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="/impressum" className="hover:text-primary-foreground transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-primary-foreground transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-primary-foreground transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/nutzungsbedingungen" className="hover:text-primary-foreground transition-colors">
                  Nutzungsbedingungen
                </Link>
              </li>
              <li>
                <Link href="/ki-vorschriften" className="hover:text-primary-foreground transition-colors">
                  KI-Vorschriften
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="/kontakt" className="hover:text-primary-foreground transition-colors">
                  Kontaktformular
                </Link>
              </li>
              <li>
                <a href="mailto:info@my-dispatch.de" className="hover:text-primary-foreground transition-colors">
                  info@my-dispatch.de
                </a>
              </li>
              <li>
                <a href="tel:+4917080044230" className="hover:text-primary-foreground transition-colors">
                  +49 170 8004423
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} MyDispatch. Alle Rechte vorbehalten.
          </p>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("cookie-consent")
                localStorage.removeItem("cookieConsent")
                window.location.reload()
              }
            }}
            className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Cookie-Einstellungen
          </button>
        </div>
      </div>
    </footer>
  )
}

// =============================================================================
// FAQ ITEM COMPONENT
// =============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden hover:border-primary/30 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 animate-fade-in">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// CITIES SECTION COMPONENT - Ersetzt FAQ Section
// =============================================================================

function CitiesSection() {
  const [visibleCount, setVisibleCount] = useState(24)
  const cities = GERMAN_CITIES_SORTED
  const visibleCities = cities.slice(0, visibleCount)
  const hasMore = visibleCount < cities.length

  return (
    <section id="staedte" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">MyDispatch in Ihrer Stadt</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Taxi- und Mietwagen-Software für alle deutschen Großstädte und Regionen. Finden Sie Ihren Standort.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
          {visibleCities.map((city) => (
            <Link
              key={city.slug}
              href={`/stadt/${city.slug}`}
              className="bg-card rounded-xl border border-border p-3 sm:p-4 text-center hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-primary/15 transition-colors">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{city.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {city.einwohner >= 1000000
                  ? `${(city.einwohner / 1000000).toFixed(1)} Mio.`
                  : `${Math.round(city.einwohner / 1000)}k`}
              </p>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 24, cities.length))}
              className="px-8 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors inline-flex items-center gap-2"
            >
              Mehr Städte laden
              <span className="text-muted-foreground text-sm">({cities.length - visibleCount} weitere)</span>
            </button>
          </div>
        )}

        {!hasMore && visibleCount > 24 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">Alle {cities.length} Städte werden angezeigt</p>
          </div>
        )}
      </div>
    </section>
  )
}

// =============================================================================
// HOMEPAGE
// =============================================================================

export function HomePageClient() {
  const features = [
    {
      icon: TruckIcon,
      title: "Flotten-Verwaltung",
      description: "Verwalten Sie Ihre Fahrzeuge, Fahrer und Konzessionen an einem Ort. Echtzeit-Tracking inklusive.",
    },
    {
      icon: CalendarIcon,
      title: "Buchungs-System",
      description:
        "Intuitive Auftrags-Verwaltung mit Drag & Drop. Automatische Fahrer-Zuweisung und Routen-Optimierung.",
    },
    {
      icon: UsersIcon,
      title: "Kunden-Verwaltung",
      description: "CRM-Funktionen für Stamm-Kunden. Buchungs-Historie, Präferenzen und automatische Erinnerungen.",
    },
    {
      icon: BarChartIcon,
      title: "Reports & Analytics",
      description: "Detaillierte Auswertungen über Umsatz, Auslastung und Fahrer-Performance. Export nach Excel.",
    },
    {
      icon: ShieldIcon,
      title: "GoBD-Konform",
      description:
        "Ja, MyDispatch erfüllt alle Anforderungen der GoBD. Alle Rechnungen sind revisionssicher und unveränderbar archiviert. Die Software ist TSE-vorbereitet.",
    },
    {
      icon: SmartphoneIcon,
      title: "Fahrer-App",
      description: "Native App für iOS & Android. Auftrags-Annahme, Navigation und Status-Updates in Echtzeit.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
              Die Dispositions-Software für
              <span className="text-primary block mt-2">Taxi, Mietwagen & Chauffeur</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty leading-relaxed">
              Verwalten Sie Ihre Flotte, Buchungen und Kunden in einer modernen Cloud-Lösung. Made in Germany.
              DSGVO-konform. GoBD-zertifiziert.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link
                href="/auth/sign-up"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                Jetzt starten
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/preise"
                className="px-8 py-4 border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted hover:border-primary/30 transition-all"
              >
                Preise ansehen
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Keine Einrichtungsgebühr · Monatlich kündbar · Support inklusive
            </p>
          </div>

          <div className="relative mt-12 lg:mt-16">
            <div className="absolute -inset-4 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-3xl opacity-50" />
            <div className="relative rounded-2xl lg:rounded-3xl shadow-2xl border border-border overflow-hidden bg-card">
              <Image
                src="/images/mydispatch-dashboard-hero.png"
                alt="MyDispatch Dashboard - Professionelle Dispositionssoftware"
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-background border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">Immer verfuegbar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Cloud-basiert</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">DSGVO</div>
              <div className="text-sm text-muted-foreground mt-1">Konform</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">DE</div>
              <div className="text-sm text-muted-foreground mt-1">Serverstandort</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Alles was Sie für Ihre Flotte brauchen
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Eine vollständige Lösung für die tägliche Disposition – von der Buchung bis zur Rechnung.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <HomePricingSection />

      <CitiesSection />

      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Bereit, Ihre Disposition zu digitalisieren?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Starten Sie jetzt mit MyDispatch und optimieren Sie Ihren Betrieb.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-card text-primary font-semibold rounded-xl hover:bg-card/90 transition-all shadow-lg hover:shadow-xl"
          >
            Jetzt starten
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
      <LeadChatWidget />
    </div>
  )
}
