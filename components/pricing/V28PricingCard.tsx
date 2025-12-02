"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
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

interface V28PricingCardProps {
  name: string
  description: string
  price: string
  priceDetail: string
  icon: ReactNode
  badge?: string
  highlighted?: boolean
  ctaLabel: string
  ctaVariant?: "primary" | "secondary"
  features: { text: string; included: boolean }[]
  hasMoreFeatures?: boolean
  onCTAClick: () => void
  onShowAllFeatures?: () => void
  className?: string
}

export function V28PricingCard({
  name,
  description,
  price,
  priceDetail,
  icon,
  badge,
  highlighted,
  ctaLabel,
  ctaVariant = "primary",
  features,
  hasMoreFeatures,
  onCTAClick,
  onShowAllFeatures,
  className,
}: V28PricingCardProps) {
  return (
    <div
      className={cn(
        "relative p-8 rounded-2xl border bg-card",
        highlighted ? "border-primary/30 shadow-xl" : "border-border shadow-sm",
        className,
      )}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
          {badge}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <h3 className="text-2xl font-bold text-foreground">{name}</h3>
      </div>

      <p className="text-muted-foreground mb-6">{description}</p>

      <div className="mb-6">
        <div className="text-4xl font-bold text-foreground">{price}</div>
        <div className="text-sm text-muted-foreground">{priceDetail}</div>
      </div>

      <button
        onClick={onCTAClick}
        className={cn(
          "w-full py-3 px-6 rounded-xl font-semibold transition-all mb-6",
          ctaVariant === "primary"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-card text-foreground border border-border hover:bg-muted/50",
        )}
      >
        {ctaLabel}
      </button>

      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-sm text-foreground">{feature.text}</span>
          </li>
        ))}
      </ul>

      {hasMoreFeatures && onShowAllFeatures && (
        <button
          onClick={onShowAllFeatures}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
        >
          Alle Features anzeigen
        </button>
      )}
    </div>
  )
}
