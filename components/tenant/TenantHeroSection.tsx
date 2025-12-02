"use client"

function PhoneIcon({ className }: { className?: string }) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

import { V28Button } from "@/components/design-system/V28Button"
import Image from "next/image"

interface Company {
  name: string
  logo_url: string
  landingpage_title: string
  landingpage_hero_text: string
  phone: string
  widget_enabled: boolean
  widget_button_text: string
}

interface TenantHeroSectionProps {
  company: Company
  onBookingClick: () => void
}

export function TenantHeroSection({ company, onBookingClick }: TenantHeroSectionProps) {
  const handleCallClick = () => {
    if (company.phone) {
      window.location.href = `tel:${company.phone}`
    }
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/5 to-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {company.logo_url && (
              <div className="mb-4">
                <Image
                  src={company.logo_url || "/placeholder.svg"}
                  alt={company.name}
                  width={200}
                  height={80}
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            <h1 className="text-balance text-4xl font-bold lg:text-6xl">
              {company.landingpage_title || `Willkommen bei ${company.name}`}
            </h1>

            <p className="text-pretty text-lg text-muted-foreground lg:text-xl">
              {company.landingpage_hero_text || "Ihr zuverlässiger Partner für Taxifahrten in der Region"}
            </p>

            <div className="flex flex-wrap gap-4">
              {company.phone && (
                <V28Button variant="primary" size="lg" onClick={handleCallClick}>
                  <PhoneIcon className="mr-2 h-5 w-5" />
                  Jetzt anrufen
                </V28Button>
              )}

              {company.widget_enabled && (
                <V28Button variant="secondary" size="lg" onClick={onBookingClick}>
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {company.widget_button_text || "Online buchen"}
                </V28Button>
              )}
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[500px]">
            <Image
              src="/modern-taxi-car-on-city-street.jpg"
              alt="Taxi Service"
              fill
              className="rounded-lg object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
