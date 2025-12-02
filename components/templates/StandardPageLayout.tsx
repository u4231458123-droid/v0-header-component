"use client"

import type React from "react"
import type { ReactNode } from "react"
import { SEOHead } from "@/components/shared/SEOHead"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { V28Button } from "@/components/design-system/V28Button"
import { Input } from "@/lib/compat"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface StatCard {
  label: string
  value: string | number
  icon: ReactNode
  className?: string
}

interface StandardPageLayoutProps {
  // SEO & Navigation
  title: string
  description: string
  canonical?: string

  // Background (V28.1 Premium)
  background?: "white" | "canvas" | "orbs-light"

  // Hero Section (optional)
  heroIcon?: ReactNode
  heroTitle?: string
  heroSubtitle?: string
  heroBadge?: ReactNode

  // Header
  subtitle?: string
  onCreateNew?: () => void
  createButtonLabel?: string
  createButtonDisabled?: boolean
  headerExtra?: ReactNode

  // Stats (optional)
  stats?: StatCard[]

  // Filter/Search
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onShowArchivedToggle?: () => void
  filterComponents?: ReactNode

  // Content
  children: ReactNode

  // Footer (optional)
  footerContent?: ReactNode

  // Card Title
  cardTitle?: string
  cardIcon?: ReactNode

  // Custom styling
  className?: string
  style?: React.CSSProperties
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function ArchiveIcon({ className }: { className?: string }) {
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
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}

function ActivityIcon({ className }: { className?: string }) {
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
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  )
}

export function StandardPageLayout({
  title,
  description,
  canonical,
  background = "canvas",
  heroIcon,
  heroTitle,
  heroSubtitle,
  heroBadge,
  subtitle,
  onCreateNew,
  createButtonLabel = "Neu erstellen",
  createButtonDisabled = false,
  headerExtra,
  stats,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Suchen...",
  onShowArchivedToggle,
  filterComponents,
  children,
  footerContent,
  cardTitle,
  cardIcon,
  className,
  style,
}: StandardPageLayoutProps) {
  return (
    <>
      <SEOHead title={title} description={description} canonical={canonical} />

      <div className={`space-y-6 font-sans ${className || ""}`} style={style}>
        {/* HERO-BEREICH - Optional, Tailwind CSS Design */}
        {heroIcon && (
          <div className="relative w-full h-[200px] sm:h-[250px] lg:h-[300px] mb-6 rounded-lg overflow-hidden bg-linear-to-br from-primary via-primary/80 to-secondary/30 shadow-lg">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-4 p-6 rounded-full bg-foreground/10 backdrop-blur-sm">{heroIcon}</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">{heroTitle || title}</h2>
              <p className="text-sm sm:text-base text-foreground/80 max-w-2xl">{heroSubtitle || description}</p>
              {heroBadge && <div className="mt-3">{heroBadge}</div>}
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent pointer-events-none" />
          </div>
        )}

        {/* HEADER - Desktop: Info-Bereich, Mobile: Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          {/* MOBILE: Button anzeigen */}
          <div className="flex lg:hidden flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {onCreateNew && (
              <V28Button
                onClick={onCreateNew}
                disabled={createButtonDisabled}
                variant="primary"
                className="min-h-11 min-w-11 w-full sm:w-auto rounded-full font-semibold text-sm transition-all duration-300 h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02]"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                <span>{createButtonLabel}</span>
              </V28Button>
            )}
          </div>

          {/* DESKTOP: Info-Bereich (Datum, Zeit, Status) */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Datum & Zeit */}
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold tabular-nums text-foreground">{format(new Date(), "HH:mm:ss")}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
              </span>
            </div>

            {/* System-Status Badge */}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <ActivityIcon className="h-3 w-3 mr-1.5" />
              System Online
            </Badge>

            {/* Optional: Benutzer-Avatar */}
            {headerExtra}
          </div>
        </div>

        {/* STATS - Optional */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.className || ""}`}>{stat.value}</p>
                    </div>
                    <div className="h-4 w-4 text-muted-foreground">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* MAIN CARD - Immer gleiche Struktur */}
        <Card>
          <CardHeader>
            {cardTitle && (
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {cardIcon}
                {cardTitle}
              </CardTitle>
            )}

            {/* FILTER/SEARCH - Immer gleich positioniert */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="flex gap-3 items-center flex-1">
                <div className="relative w-full sm:flex-1 sm:min-w-[280px] md:min-w-[350px] lg:min-w-[450px] xl:min-w-[550px]">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-11 w-full"
                  />
                </div>
                {onShowArchivedToggle && (
                  <V28Button
                    variant="secondary"
                    size="md"
                    onClick={onShowArchivedToggle}
                    className="min-h-11 min-w-11 whitespace-nowrap"
                  >
                    <ArchiveIcon className="h-4 w-4 mr-2" />
                    <span>Archivierte anzeigen</span>
                  </V28Button>
                )}
              </div>
              {filterComponents && <div className="flex items-center gap-2">{filterComponents}</div>}
            </div>
          </CardHeader>

          <CardContent>{children}</CardContent>
        </Card>

        {/* FOOTER - Optional */}
        {footerContent && (
          <div className="bg-muted/50 p-4 rounded-lg text-xs sm:text-sm text-muted-foreground">{footerContent}</div>
        )}
      </div>
    </>
  )
}
