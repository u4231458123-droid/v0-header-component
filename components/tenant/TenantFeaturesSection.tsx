"use client"

import type { ReactNode } from "react"

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
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
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
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  )
}

interface FeatureBoxProps {
  icon: ReactNode
  title: string
  description: string
}

function FeatureBox({ icon, title, description }: FeatureBoxProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
      <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

const DEFAULT_FEATURES = [
  {
    icon: <ClockIcon className="h-6 w-6" />,
    title: "24/7 Service",
    description: "Wir sind rund um die Uhr für Sie erreichbar",
  },
  {
    icon: <ShieldIcon className="h-6 w-6" />,
    title: "Sicher & Zuverlässig",
    description: "Geprüfte Fahrer und moderne Fahrzeuge",
  },
  {
    icon: <MapPinIcon className="h-6 w-6" />,
    title: "GPS-Tracking",
    description: "Verfolgen Sie Ihre Fahrt in Echtzeit",
  },
  {
    icon: <StarIcon className="h-6 w-6" />,
    title: "Top bewertet",
    description: "Über 1000 zufriedene Kunden",
  },
]

interface TenantFeaturesSectionProps {
  company: {
    name: string
  }
}

export function TenantFeaturesSection({ company }: TenantFeaturesSectionProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Warum {company.name}?</h2>
          <p className="text-lg text-muted-foreground">Ihre Vorteile auf einen Blick</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {DEFAULT_FEATURES.map((feature, index) => (
            <FeatureBox key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  )
}
