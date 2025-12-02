import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"
import { V28MarketingCard } from "@/components/design-system/V28MarketingCard"

function CodeIcon({ className }: { className?: string }) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function ServerIcon({ className }: { className?: string }) {
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
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
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

function ZapIcon({ className }: { className?: string }) {
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
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

export default function NeXifySupportPage() {
  return (
    <MarketingLayout currentPage="nexify" background="orbs-light">
      <V28MarketingSection className="pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">NeXify IT-Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium IT-Support und technische Beratung für Ihr Taxiunternehmen
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-16">
          <V28MarketingCard>
            <div className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <CodeIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Individuelle Entwicklung</h3>
              <p className="text-muted-foreground">
                Maßgeschneiderte Softwarelösungen und Erweiterungen für Ihre spezifischen Anforderungen.
              </p>
            </div>
          </V28MarketingCard>

          <V28MarketingCard>
            <div className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ServerIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">System-Integration</h3>
              <p className="text-muted-foreground">
                Nahtlose Integration von MyDispatch in Ihre bestehende IT-Infrastruktur.
              </p>
            </div>
          </V28MarketingCard>

          <V28MarketingCard>
            <div className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Sicherheitsberatung</h3>
              <p className="text-muted-foreground">
                Umfassende Sicherheitsanalysen und Implementierung von Best Practices.
              </p>
            </div>
          </V28MarketingCard>

          <V28MarketingCard>
            <div className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ZapIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Performance-Optimierung</h3>
              <p className="text-muted-foreground">
                Analyse und Optimierung Ihrer MyDispatch-Installation für maximale Effizienz.
              </p>
            </div>
          </V28MarketingCard>
        </div>

        <V28MarketingCard className="max-w-3xl mx-auto">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Interesse an NeXify IT-Service?</h2>
            <p className="text-muted-foreground mb-6">
              Kontaktieren Sie uns für ein Beratungsgespräch und erfahren Sie, wie wir Ihre IT-Infrastruktur optimieren
              können.
            </p>
            <a
              href="/kontakt"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Jetzt Beratung anfragen
            </a>
          </div>
        </V28MarketingCard>
      </V28MarketingSection>
    </MarketingLayout>
  )
}
