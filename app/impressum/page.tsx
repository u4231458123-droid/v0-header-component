"use client"

import Link from "next/link"
import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Mail, Phone, Globe, Clock, Scale, Shield, FileText } from "lucide-react"

const COMPANY = {
  name: "RideHub Solutions",
  legalForm: "Einzelunternehmen",
  owner: "Ibrahim SIMSEK",
  street: "Ensbachmühle 4",
  zip: "94571",
  city: "Schaufling",
  country: "Deutschland",
  phone: "+49 170 8004423",
  email: "info@my-dispatch.de",
  support: "support@my-dispatch.de",
  domain: "my-dispatch.de",
  businessHours: "Mo-Fr: 09:00-17:00 Uhr",
  copyright: `© ${new Date().getFullYear()} my-dispatch.de by RideHub Solutions`,
  description: "Die moderne Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Unternehmen. Made in Germany.",
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader />

      <main className="pt-16">
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Impressum</h1>
              <p className="text-lg text-muted-foreground">Angaben gemäß § 5 TMG und § 55 Abs. 2 RStV</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Anbieter</h2>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="font-semibold text-foreground">{COMPANY.name}</p>
                    <p>{COMPANY.legalForm}</p>
                    <p>Inhaber: {COMPANY.owner}</p>
                    <p className="pt-2">{COMPANY.street}</p>
                    <p>
                      D-{COMPANY.zip} {COMPANY.city}
                    </p>
                    <p>{COMPANY.country}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Kontakt</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${COMPANY.phone}`} className="text-muted-foreground hover:text-primary">
                        {COMPANY.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${COMPANY.email}`} className="text-muted-foreground hover:text-primary">
                        {COMPANY.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">www.{COMPANY.domain}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{COMPANY.businessHours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground m-0">Verantwortlich für den Inhalt</h2>
                  </div>
                  <p className="text-muted-foreground m-0">
                    Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
                    <br />
                    {COMPANY.owner}
                    <br />
                    {COMPANY.street}
                    <br />
                    D-{COMPANY.zip} {COMPANY.city}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground m-0">EU-Streitschlichtung</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                  </p>
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    https://ec.europa.eu/consumers/odr →
                  </a>
                  <p className="text-muted-foreground mt-4 mb-0">
                    Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an
                    Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground m-0">Haftung für Inhalte</h2>
                  </div>
                  <p className="text-muted-foreground mb-0">
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                    allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                    verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
                    zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                  </p>
                  <p className="text-muted-foreground mt-4 mb-0">
                    Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
                    Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
                    Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
                    Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground m-0">Haftung für Links</h2>
                  </div>
                  <p className="text-muted-foreground mb-0">
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss
                    haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
                    der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                  <p className="text-muted-foreground mt-4 mb-0">
                    Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
                    Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente
                    inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
                    Rechtsverletzung nicht zumutbar.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground m-0">Urheberrecht</h2>
                  </div>
                  <p className="text-muted-foreground mb-0">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
                    deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
                    außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
                    bzw. Erstellers.
                  </p>
                  <p className="text-muted-foreground mt-4 mb-0">
                    Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
                    Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
                    Dritter beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten
                    wir um einen entsprechenden Hinweis.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              <Link
                href="/datenschutz"
                className="p-4 rounded-2xl border border-border text-center hover:border-primary/50 transition-colors"
              >
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="font-medium text-foreground">Datenschutz</span>
              </Link>
              <Link
                href="/agb"
                className="p-4 rounded-2xl border border-border text-center hover:border-primary/50 transition-colors"
              >
                <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="font-medium text-foreground">AGB</span>
              </Link>
              <Link
                href="/kontakt"
                className="p-4 rounded-2xl border border-border text-center hover:border-primary/50 transition-colors"
              >
                <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="font-medium text-foreground">Kontakt</span>
              </Link>
            </div>

            <p className="text-center text-muted-foreground text-sm mt-12">Stand: November 2025</p>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  )
}
