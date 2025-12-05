"use client"

import type { ReactNode } from "react"

interface V28HeroPremiumProps {
  variant?: "home" | "product"
  backgroundVariant?: "3d-premium" | "gradient" | "solid"
  badge?: { text: string; icon: ReactNode }
  title: string
  subtitle?: string
  description: string
  primaryCTA: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  showPWAButton?: boolean
  visual?: ReactNode
  businessMetrics?: Array<{ label: string; value: string; sublabel: string }>
  trustElements?: boolean
}

export function V28HeroPremium({
  badge,
  title,
  subtitle,
  description,
  primaryCTA,
  visual,
  businessMetrics,
}: V28HeroPremiumProps) {
  return (
    <section className="relative py-16 md:py-24 bg-linear-to-br from-muted/50 to-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full mb-6">
                {badge.icon}
                <span className="text-sm font-medium text-muted-foreground">{badge.text}</span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">{title}</h1>

            {subtitle && <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">{subtitle}</h2>}

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{description}</p>

            <button
              onClick={primaryCTA.onClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-lg"
            >
              {primaryCTA.icon}
              {primaryCTA.label}
            </button>

            {businessMetrics && (
              <div className="grid grid-cols-3 gap-5 mt-12">
                {businessMetrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-xs text-muted-foreground/70">{metric.sublabel}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {visual && <div>{visual}</div>}
        </div>
      </div>
    </section>
  )
}
