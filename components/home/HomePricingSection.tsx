"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { V28BillingToggle } from "@/components/design-system/V28BillingToggle"
import { V28PricingCard } from "@/components/pricing/V28PricingCard"
import { ALL_TARIFFS } from "@/lib/tariff/tariff-definitions"
import { cn } from "@/lib/utils"

const RocketIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

const Building2Icon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
)

const CrownIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" />
  </svg>
)

export const HomePricingSection = () => {
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const getTariffIcon = (tariffId: string) => {
    switch (tariffId) {
      case "starter":
        return <RocketIcon />
      case "business":
        return <Building2Icon />
      case "enterprise":
        return <CrownIcon />
      default:
        return <RocketIcon />
    }
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Transparente Preise, faire Konditionen
          </h2>
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Wählen Sie den Tarif, der zu Ihrer Flottengröße passt. Monatlich kündbar, ohne versteckte Kosten.
          </p>
        </div>

        <div className="flex justify-center mb-28 md:mb-36">
          <V28BillingToggle billingPeriod={billingPeriod} onToggle={setBillingPeriod} discountText="-20%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 lg:gap-10 md:items-start">
          {ALL_TARIFFS.map((tariff) => {
            const includedFeatures = tariff.features.filter((f) => f.included)
            const displayLimit = tariff.highlighted ? 8 : 5
            const displayedFeatures = includedFeatures.slice(0, displayLimit)
            const hasMoreFeatures = includedFeatures.length > displayLimit

            return (
              <div
                key={tariff.id}
                className={cn(
                  "transition-all duration-300",
                  tariff.highlighted && "md:-translate-y-12 lg:-translate-y-16",
                )}
              >
                <V28PricingCard
                  name={tariff.name}
                  description={tariff.description}
                  price={billingPeriod === "monthly" ? tariff.priceMonthlyFormatted : tariff.priceYearlyFormatted}
                  priceDetail={billingPeriod === "monthly" ? "pro Monat" : "pro Jahr"}
                  icon={getTariffIcon(tariff.id)}
                  badge={tariff.badge}
                  highlighted={tariff.highlighted}
                  ctaLabel={tariff.ctaText}
                  ctaVariant={tariff.highlighted ? "primary" : "secondary"}
                  features={displayedFeatures.map((f) => ({ text: f.name, included: true }))}
                  hasMoreFeatures={hasMoreFeatures}
                  onCTAClick={() => router.push(tariff.id === "enterprise" ? "/contact" : "/auth/sign-up")}
                  onShowAllFeatures={hasMoreFeatures ? () => router.push("/pricing") : undefined}
                  className={cn(
                    "animate-fade-in",
                    tariff.highlighted
                      ? "hover:shadow-[0_20px_60px_-12px_rgba(71,85,105,0.3)] transition-all duration-300"
                      : "hover:shadow-2xl transition-shadow duration-300",
                  )}
                />
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <a
            href="/preise"
            className="font-sans text-base font-medium no-underline transition-all duration-300 hover:opacity-80 text-muted-foreground hover:text-foreground"
          >
            Alle Features vergleichen
          </a>
        </div>
      </div>
    </section>
  )
}

export default HomePricingSection
