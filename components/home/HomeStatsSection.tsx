"use client"

import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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

const ShieldIcon = ({ className }: { className?: string }) => (
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
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const CloudIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
)

const GlobeIcon = ({ className }: { className?: string }) => (
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
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
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
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const HomeStatsSection = () => {
  const stats = [
    {
      icon: CloudIcon,
      value: "24/7",
      label: "Cloud-Verfuegbarkeit",
      description: "Immer und ueberall zugreifen",
    },
    {
      icon: ShieldIcon,
      value: "DSGVO",
      label: "Datenschutz-konform",
      description: "Hoechste Sicherheitsstandards",
    },
    {
      icon: GlobeIcon,
      value: "DE",
      label: "Deutsche Server",
      description: "Hosting in Deutschland",
    },
    {
      icon: CheckCircleIcon,
      value: "100%",
      label: "Funktionsumfang",
      description: "Alle Features inklusive",
    },
  ]

  return (
    <V28MarketingSection background="white" className="py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Warum MyDispatch?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professionelle Flottenmanagement-Software fuer Taxi- und Mietwagenunternehmen
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm md:text-base font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.description}</div>
            </div>
          )
        })}
      </div>
    </V28MarketingSection>
  )
}
