import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { GERMAN_CITIES, getCityBySlug, getAllCitySlugs, type GermanCity } from "@/lib/german-cities"
import { COMPANY } from "@/lib/company-data"

// Generiere statische Pfade für alle Städte
export async function generateStaticParams() {
  return getAllCitySlugs().map((slug) => ({ slug }))
}

// Dynamische Metadaten für SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const city = getCityBySlug(slug)

  if (!city) {
    return {
      title: "Stadt nicht gefunden | MyDispatch",
    }
  }

  return {
    title: `Taxi & Mietwagen Software ${city.name} | MyDispatch Dispositionssoftware`,
    description: `MyDispatch - Die professionelle Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Unternehmen in ${city.name} und ${city.umland.slice(0, 3).join(", ")}. Jetzt starten!`,
    keywords: [
      `Taxi Software ${city.name}`,
      `Mietwagen Software ${city.name}`,
      `Dispositionssoftware ${city.name}`,
      `Taxizentrale ${city.name}`,
      `Flottenverwaltung ${city.name}`,
      ...city.umland.map((u) => `Taxi ${u}`),
    ],
    openGraph: {
      title: `Taxi & Mietwagen Software für ${city.name} | MyDispatch`,
      description: `Die moderne Cloud-Lösung für Taxi- und Mietwagen-Unternehmen in ${city.name}. DSGVO-konform, GoBD-zertifiziert, Made in Germany.`,
      type: "website",
    },
  }
}

// Icons
function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
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

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <line x1="19" x2="5" y1="12" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function BuildingIcon({ className }: { className?: string }) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getCityBySlug(slug)

  if (!city) {
    notFound()
  }

  const features = [
    {
      icon: TruckIcon,
      title: "Flottenmanagement",
      description: `Verwalten Sie Ihre Fahrzeuge in ${city.name} zentral. Echtzeit-Tracking, Wartungsplanung und Konzessionsverwaltung.`,
    },
    {
      icon: CalendarIcon,
      title: "Buchungssystem",
      description: `Intuitive Auftragsverwaltung für ${city.name} und Umgebung. Automatische Fahrerzuweisung und optimierte Routen.`,
    },
    {
      icon: UsersIcon,
      title: "Kundenverwaltung",
      description: `CRM für Ihre Stammkunden in ${city.name}. Buchungshistorie, Präferenzen und automatische Benachrichtigungen.`,
    },
    {
      icon: BarChartIcon,
      title: "Reports & Analytics",
      description: `Detaillierte Auswertungen für Ihr Unternehmen in ${city.name}. Umsatz, Auslastung und Performance im Blick.`,
    },
    {
      icon: SmartphoneIcon,
      title: "Fahrer-App",
      description: `Native App für Ihre Fahrer in ${city.name}. Auftragsannahme, Navigation und Statusupdates in Echtzeit.`,
    },
    {
      icon: ShieldIcon,
      title: "DSGVO & GoBD",
      description: `Vollständig konform mit deutschen Vorschriften. Sichere Daten auf deutschen Servern.`,
    },
  ]

  // Finde benachbarte Städte für interne Verlinkung
  const nearbyFromUmland = city.umland
    .map((name) => GERMAN_CITIES.find((c) => c.name === name))
    .filter((c): c is GermanCity => c !== undefined)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
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
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/preise" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Preise
            </Link>
            <Link href="/fragen" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/kontakt" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Kontakt
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-muted-foreground hover:text-primary font-medium transition-colors">
              Anmelden
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              Jetzt starten
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Startseite
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/#staedte" className="text-muted-foreground hover:text-primary transition-colors">
              Standorte
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{city.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <MapPinIcon className="w-5 h-5" />
                <span className="font-medium">{city.bundesland}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Taxi & Mietwagen Software für <span className="text-primary">{city.name}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {city.beschreibung}. MyDispatch ist die professionelle Cloud-Lösung für Taxi-, Mietwagen- und
                Chauffeur-Unternehmen in {city.name} und Umgebung.
              </p>

              {/* Umland */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-2">Auch verfügbar für:</p>
                <div className="flex flex-wrap gap-2">
                  {city.umland.map((ort) => (
                    <span key={ort} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                      {ort}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/sign-up"
                  className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                >
                  Jetzt in {city.name} starten
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/preise"
                  className="px-8 py-4 border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted hover:border-primary/30 transition-colors text-center"
                >
                  Preise ansehen
                </Link>
              </div>
            </div>

            {/* Stadt-Info-Karte */}
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BuildingIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{city.name}</h2>
                  <p className="text-muted-foreground">{city.bundesland}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Einwohner</span>
                  <span className="font-semibold text-foreground">{city.einwohner.toLocaleString("de-DE")}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Bundesland</span>
                  <span className="font-semibold text-foreground">{city.bundesland}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Umlandgemeinden</span>
                  <span className="font-semibold text-foreground">{city.umland.length}</span>
                </div>
              </div>

              {/* Besonderheiten */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Besonderheiten</h3>
                <div className="flex flex-wrap gap-2">
                  {city.besonderheiten.map((item) => (
                    <span key={item} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warum MyDispatch in dieser Stadt */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Warum MyDispatch in {city.name}?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimieren Sie Ihren Taxi- oder Mietwagenbetrieb in {city.name} mit unserer Cloud-Lösung.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
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

      {/* Preise */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Unsere Tarife für {city.name}
            </h2>
            <p className="text-lg text-muted-foreground">
              Transparente Preise ohne versteckte Kosten. Monatlich kündbar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Starter */}
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 hover:border-primary/30 transition-colors">
              <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Für Einzelunternehmer in {city.name}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">39€</span>
                <span className="text-muted-foreground">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Bis zu 3 Fahrer", "Bis zu 3 Fahrzeuge", "Unbegrenzte Buchungen", "E-Mail Support"].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/sign-up?plan=starter"
                className="block w-full py-3 text-center bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors"
              >
                Starter wählen
              </Link>
            </div>

            {/* Business */}
            <div className="bg-card rounded-2xl border-2 border-primary p-6 lg:p-8 relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                Empfohlen
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Business</h3>
              <p className="text-muted-foreground mb-6">Für wachsende Flotten in {city.name}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">99€</span>
                <span className="text-muted-foreground">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Unbegrenzte Fahrer", "Unbegrenzte Fahrzeuge", "Fahrer-App inklusive", "Priority Support"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckIcon className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ),
                )}
              </ul>
              <Link
                href="/auth/sign-up?plan=business"
                className="block w-full py-3 text-center bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Business wählen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nachbarstädte */}
      {nearbyFromUmland.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">MyDispatch in der Region</h2>
              <p className="text-lg text-muted-foreground">Auch verfügbar in weiteren Städten rund um {city.name}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {nearbyFromUmland.map((nearbyCity) => (
                <Link
                  key={nearbyCity.slug}
                  href={`/stadt/${nearbyCity.slug}`}
                  className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{nearbyCity.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {nearbyCity.einwohner.toLocaleString("de-DE")} Einw.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Starten Sie jetzt in {city.name}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Digitalisieren Sie Ihren Taxi- oder Mietwagenbetrieb in {city.name} mit MyDispatch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
            >
              Jetzt registrieren
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground font-semibold rounded-xl hover:bg-primary-foreground/10 transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/images/my-dispatch-logo.png"
                alt="MyDispatch"
                width={120}
                height={28}
                className="h-7 w-auto brightness-0 invert"
              />
              <span className="text-primary-foreground/60 text-sm">Taxi & Mietwagen Software für {city.name}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-primary-foreground/70">
              <Link href="/impressum" className="hover:text-primary-foreground transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="hover:text-primary-foreground transition-colors">
                Datenschutz
              </Link>
              <Link href="/agb" className="hover:text-primary-foreground transition-colors">
                AGB
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} MyDispatch by {COMPANY.name}. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  )
}
