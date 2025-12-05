"use client"

import Link from "next/link"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"
import { V28MarketingCard } from "@/components/design-system/V28MarketingCard"
import { V28IconBox } from "@/components/design-system/V28IconBox"
import { cn } from "@/lib/utils"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

const ClipboardListIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
)

const CarIcon = () => (
  <svg
    className="w-6 h-6"
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

const UsersIcon = () => (
  <svg
    className="w-6 h-6"
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

const FileTextIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
)

const HandshakeIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
)

const ShieldIcon = () => (
  <svg
    className="w-6 h-6"
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

const SmartphoneIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
)

const ZapIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg
    className="w-4 h-4"
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

const features = [
  {
    icon: <ClipboardListIcon />,
    title: "Intelligente Auftrags-Disposition",
    description:
      "Erfassen, planen und dispatchen Sie Taxifahrten mit automatischem Routing und intelligenter Fahrerzuweisung in Echtzeit.",
    link: "/docs",
  },
  {
    icon: <CarIcon />,
    title: "Digitale Fuhrpark-Verwaltung",
    description:
      "TÜV-Überwachung, Wartungsplaner, Taxi-Konzession und P-Schein-Verwaltung für Ihr gesamtes Taxi- und Mietwagenflotte.",
    link: "/docs",
  },
  {
    icon: <UsersIcon />,
    title: "Fahrermanagement & Schichtplanung",
    description:
      "Digitale Schichtzettel, Führerschein-Ablaufdaten und automatisierte Provisionsabrechnungen für Taxifahrer.",
    link: "/docs",
  },
  {
    icon: <FileTextIcon />,
    title: "GoBD-konforme Rechnungen",
    description:
      "Quittungen, Angebote und Rechnungen für Taxi- und Chauffeurfahrten. Rechtssicher und TSE-vorbereitet.",
    link: "/docs",
  },
  {
    icon: <HandshakeIcon />,
    title: "Partner-Netzwerk & Vermittlung",
    description: "Vergeben Sie Aufträge an Partner-Unternehmen und verwalten Sie Vermittlungsprovisionen transparent.",
    link: "/docs",
  },
  {
    icon: <TrendingUpIcon />,
    title: "Echtzeit-KPIs & Business Intelligence",
    description:
      "Dashboards mit Umsätzen, Auslastung, Fahrerperformance und Verkehrsdaten für optimierte Entscheidungen.",
    link: "/docs",
  },
  {
    icon: <ShieldIcon />,
    title: "DSGVO & Datensicherheit",
    description:
      "Made in Germany. Server in deutschen Rechenzentren. Höchste Datenschutzstandards für Taxiunternehmen.",
    link: "/datenschutz",
  },
  {
    icon: <SmartphoneIcon />,
    title: "Online-Buchungswidget für Kunden",
    description: "Ihre Fahrgäste buchen online Taxi oder Chauffeur – automatisch in Ihr System synchronisiert.",
    link: "/docs",
  },
  {
    icon: <ZapIcon />,
    title: "Live-Traffic & Wetterinformation",
    description: "Echtzeit-Verkehrsinformationen und Wettervorhersage für schnellere und sicherere Fahrten.",
    link: "/docs",
  },
]

export const HomeFeaturesSection = () => {
  const { ref: featuresRef, isVisible: featuresVisible } = useIntersectionObserver()

  return (
    <V28MarketingSection
      background="canvas"
      title="Professionelle Taxidisposition – einfach, sicher, transparent"
      description="Alles, was Sie für moderne Taxi- und Mietwagenflotten benötigen – in einer zentralen Plattform."
    >
      <div className="max-w-7xl mx-auto relative">
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              href={feature.link}
              className={cn("group", featuresVisible && "animate-fade-in")}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <V28MarketingCard className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer h-full">
                <div className="absolute inset-0 bg-linear-to-br from-muted via-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                <div className="relative z-10">
                  <V28IconBox
                    icon={feature.icon}
                    variant="slate"
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <h3 className="font-sans text-lg font-semibold mb-2 mt-4 text-foreground">{feature.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Mehr erfahren</span>
                    <ArrowRightIcon />
                  </div>
                </div>
              </V28MarketingCard>
            </Link>
          ))}
        </div>
      </div>
    </V28MarketingSection>
  )
}

export default HomeFeaturesSection
