"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"

// Inline Sparkles SVG
const SparklesIcon = () => (
  <svg
    className="w-3.5 h-3.5 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg
    className="w-5 h-5"
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

const AwardIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

export const HomeHeroSection = () => {
  return (
    <V28MarketingSection background="white" className="pt-16 md:pt-24 pb-12 md:pb-20 relative overflow-hidden">
      <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 px-4 sm:px-6">
        {/* Left: Text & CTA */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Badge - slate-800 -> primary */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide">
            <SparklesIcon />
            <span className="whitespace-nowrap">KI-GESTÜTZTE DISPOSITIONS-SOFTWARE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
            Taxi, Mietwagen & Chauffeur.
            <br />
            <span className="text-muted-foreground">Intelligent digitalisiert.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
            MyDispatch ist die <strong className="text-foreground">All-in-One Plattform</strong> für professionelle
            Personenbeförderung in Deutschland. Automatisierte KI-Disposition, GoBD-konforme Rechnungserstellung,
            digitale Fahrer-App mit Schichtmanagement und eigene Kunden-Landingpage –
            <strong className="text-foreground">
              {" "}
              entwickelt für Taxiunternehmen, Mietwagenservices und Chauffeur-Betriebe.
            </strong>
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-muted-foreground">
              <ShieldCheckIcon />
              DSGVO-konform
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-muted-foreground">
              <AwardIcon />
              GoBD-zertifiziert
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-muted-foreground">
              <ShieldCheckIcon />
              Server in Deutschland
            </span>
          </div>

          {/* CTA Buttons - slate-800 -> primary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 pt-2 sm:pt-4">
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 w-full"
              >
                Jetzt starten
              </Button>
            </Link>
            <Link href="/preise" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted text-base px-8 w-full bg-transparent"
              >
                Preise & Tarife
              </Button>
            </Link>
          </div>

          <div className="pt-6 sm:pt-8 grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-5 text-sm border-t border-border">
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl text-foreground">24/7</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Immer verfuegbar</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl text-foreground">100%</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Cloud-basiert</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl text-foreground">DSGVO</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Konform</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl text-foreground">DE</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Serverstandort</span>
            </div>
          </div>

          {/* Made in Germany Badge */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="inline-block w-3 h-2 bg-black rounded-sm" />
              <span className="inline-block w-3 h-2 bg-destructive rounded-sm" />
              <span className="inline-block w-3 h-2 bg-yellow-400 rounded-sm" />
            </div>
            <span className="text-xs sm:text-sm">Made in Germany - Entwickelt und gehostet in Deutschland</span>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="order-1 lg:order-2 relative w-full">
          <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-border bg-muted">
            <Image
              src="/images/mydispatch-dashboard-hero.png"
              alt="MyDispatch - Premium Taxi & Chauffeur Dispositions-Software Dashboard"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-primary/40 to-transparent" />
          </div>

          {/* Floating Stats Card - slate-800 -> primary */}
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-border hidden md:block">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aktive Aufträge</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">287</p>
              </div>
            </div>
          </div>

          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-border hidden lg:block">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <SparklesIcon />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">KI-Optimierung</p>
                <p className="text-sm font-semibold text-foreground">+35% Effizienz</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </V28MarketingSection>
  )
}

export default HomeHeroSection
