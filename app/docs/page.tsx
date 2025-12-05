import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"
import { V28MarketingCard } from "@/components/design-system/V28MarketingCard"

const Icons = {
  BookOpen: ({ className }: { className?: string }) => (
    <svg className={className || "h-6 w-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  Video: ({ className }: { className?: string }) => (
    <svg className={className || "h-6 w-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg className={className || "h-6 w-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  HelpCircle: ({ className }: { className?: string }) => (
    <svg className={className || "h-6 w-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Code: ({ className }: { className?: string }) => (
    <svg className={className || "h-6 w-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Zap: ({ className }: { className?: string }) => (
    <svg className={className || "h-6 w-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
}

export default function DocsPage() {
  const docSections = [
    {
      icon: Icons.BookOpen,
      title: "Erste Schritte",
      description: "Lernen Sie die Grundlagen von MyDispatch kennen und starten Sie in wenigen Minuten",
      links: [
        { title: "Installation & Setup-Assistent", href: "#setup" },
        { title: "Dashboard-Übersicht & Navigation", href: "#dashboard" },
        { title: "Erste Buchung erstellen", href: "#booking" },
        { title: "Fahrer und Fahrzeuge anlegen", href: "#fleet" },
        { title: "Benutzerrollen & Berechtigungen", href: "#permissions" },
      ],
    },
    {
      icon: Icons.Video,
      title: "Video-Tutorials",
      description: "Schritt-für-Schritt Anleitungen im Video-Format für schnelles Lernen",
      links: [
        { title: "Dashboard-Tour (5 Min)", href: "#video-dashboard" },
        { title: "Aufträge disponieren (8 Min)", href: "#video-dispatch" },
        { title: "Fahrer-App einrichten (4 Min)", href: "#video-driver-app" },
        { title: "Rechnungen erstellen (6 Min)", href: "#video-invoices" },
        { title: "Reporting & Analytics (7 Min)", href: "#video-reports" },
      ],
    },
    {
      icon: Icons.FileText,
      title: "Funktionen & Module",
      description: "Detaillierte Dokumentation aller Features und Taxi-spezifischen Module",
      links: [
        { title: "Auftragsverwaltung & Disposition", href: "#orders" },
        { title: "Kundenverwaltung & CRM", href: "#customers" },
        { title: "Fuhrparkverwaltung (TÜV, Konzessionen)", href: "#fleet-mgmt" },
        { title: "Rechnungswesen & GoBD-Compliance", href: "#invoicing" },
        { title: "Fahrer-App & Mobile Features", href: "#mobile" },
        { title: "Partnernetzwerk & Vermittlung", href: "#partners" },
      ],
    },
    {
      icon: Icons.HelpCircle,
      title: "Häufige Fragen",
      description: "Antworten auf die am häufigsten gestellten Fragen",
      links: [
        { title: "Allgemeine Fragen", href: "/fragen" },
        { title: "Abrechnungs-FAQ", href: "/fragen#billing" },
        { title: "Technischer Support", href: "/kontakt" },
        { title: "Datenschutz & DSGVO", href: "/datenschutz" },
      ],
    },
    {
      icon: Icons.Code,
      title: "API & Entwickler",
      description: "Technische Dokumentation für API-Integration (Enterprise)",
      links: [
        { title: "API-Übersicht & Authentication", href: "#api" },
        { title: "Webhooks & Events", href: "#webhooks" },
        { title: "DATEV-Export & Schnittstellen", href: "#integrations" },
        { title: "Custom White-Label Apps", href: "#whitelabel" },
      ],
    },
    {
      icon: Icons.Zap,
      title: "Best Practices",
      description: "Tipps und Tricks für optimale Nutzung von MyDispatch",
      links: [
        { title: "Effizienzsteigerung im Tagesgeschäft", href: "#efficiency" },
        { title: "Schichtplanung optimieren", href: "#scheduling" },
        { title: "Fuhrpark-Auslastung erhöhen", href: "#utilization" },
        { title: "Kundenbindung durch CRM", href: "#crm-tips" },
      ],
    },
  ]

  return (
    <MarketingLayout currentPage="docs" background="white">
      <V28MarketingSection className="pt-24 pb-16">
        <div className="text-center mb-16 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Dokumentation & Support</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Alles, was Sie über MyDispatch wissen müssen – von den Grundlagen bis zu erweiterten Features und
            API-Integration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto px-4">
          {docSections.map((section) => {
            const IconComponent = section.icon
            return (
              <V28MarketingCard key={section.title} className="h-full">
                <div className="p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex items-center gap-3 sm:gap-5 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{section.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">{section.description}</p>
                  <ul className="space-y-2 mt-auto">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        <a
                          href={link.href}
                          className="text-sm sm:text-base text-muted-foreground hover:text-foreground font-medium transition-colors flex items-start"
                        >
                          <span className="mr-2 text-primary">→</span>
                          <span>{link.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </V28MarketingCard>
            )
          })}
        </div>

        <div className="mt-16 text-center px-4">
          <div className="bg-muted border border-border rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Benötigen Sie persönliche Hilfe?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Unser Support-Team steht Ihnen bei Fragen zur Seite. Professional- und Enterprise-Kunden haben Zugang zu
              Prioritäts-Support und dediziertem Account Management.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <a
                href="/kontakt"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                Support kontaktieren
              </a>
              <a
                href="/preise"
                className="inline-block border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-muted transition-colors text-sm sm:text-base"
              >
                Pakete vergleichen
              </a>
            </div>
          </div>
        </div>
      </V28MarketingSection>
    </MarketingLayout>
  )
}
