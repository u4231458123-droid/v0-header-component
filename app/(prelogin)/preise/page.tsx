"use client"

import { useState } from "react"
import Link from "next/link"
import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PreisePage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: "39",
      yearlyPrice: "31,20",
      description: "Perfekt für Einzelunternehmer und kleine Flotten",
      features: [
        "Bis zu 3 Fahrer",
        "Bis zu 3 Fahrzeuge",
        "Bis zu 100 Buchungen/Monat",
        "Kundenverwaltung",
        "Basis-Reporting",
        "GoBD-konforme Rechnungen",
        "E-Mail Support",
        "Kunden-Registrierung (Landingpage)",
      ],
      cta: "Jetzt starten",
      popular: false,
    },
    {
      id: "business",
      name: "Business",
      monthlyPrice: "99",
      yearlyPrice: "79,20",
      description: "Für wachsende Taxibetriebe mit Anspruch",
      features: [
        "Unbegrenzte Fahrer",
        "Unbegrenzte Fahrzeuge",
        "Unbegrenzte Buchungen",
        "Kundenverwaltung mit CRM",
        "Erweiterte Reports und Analytics",
        "Rechnungserstellung und Mahnwesen",
        "TSE-Vorbereitung",
        "API-Zugang",
        "Priority Support (24h)",
        "Fahrer-App (iOS und Android)",
        "Buchungs-Widget für Kunden",
        "KI-gestützte Kommunikation",
      ],
      cta: "Business wählen",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: "Individuell",
      yearlyPrice: "Individuell",
      description: "Für große Taxiunternehmen und Zentralen",
      features: [
        "Alle Business Features",
        "White-Label-Option",
        "Eigene Domain",
        "Dedizierter Account Manager",
        "24/7 Premium Support",
        "Telefon-Hotline",
        "Individuelle Anpassungen",
        "On-Premise Option",
        "SLA-Garantie",
      ],
      cta: "Kontakt aufnehmen",
      popular: false,
    },
  ]

  const featureMatrix = [
    {
      category: "Kernfunktionen",
      features: [
        {
          name: "Fahrer",
          starter: "Bis zu 3",
          business: "Unbegrenzt",
          enterprise: "Unbegrenzt",
          tooltip: "Anzahl der verwaltbaren Fahrer",
        },
        {
          name: "Fahrzeuge",
          starter: "Bis zu 3",
          business: "Unbegrenzt",
          enterprise: "Unbegrenzt",
          tooltip: "Anzahl der verwaltbaren Fahrzeuge",
        },
        {
          name: "Buchungen pro Monat",
          starter: "Bis zu 100",
          business: "Unbegrenzt",
          enterprise: "Unbegrenzt",
          tooltip: "Monatliches Buchungslimit",
        },
        {
          name: "Kundenverwaltung",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Kunden anlegen, bearbeiten und verwalten",
        },
        {
          name: "Auftragsmanagement",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Auftraege erstellen, zuweisen und verfolgen",
        },
        {
          name: "Fahrzeugverwaltung",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Fahrzeugdaten, Wartung und Status",
        },
      ],
    },
    {
      category: "Rechnungswesen",
      features: [
        {
          name: "GoBD-konforme Rechnungen",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Rechtskonforme Rechnungserstellung",
        },
        {
          name: "Rechnungserstellung",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Automatische Rechnungsgenerierung",
        },
        {
          name: "Mahnwesen",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Automatisches Mahnwesen bei offenen Rechnungen",
        },
        {
          name: "TSE-Vorbereitung",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Technische Sicherheitseinrichtung (Fiskalisierung)",
        },
        {
          name: "DATEV-Export",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Export fuer Steuerberater",
        },
      ],
    },
    {
      category: "Reporting und Analytics",
      features: [
        {
          name: "Basis-Reporting",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Grundlegende Auswertungen und Statistiken",
        },
        {
          name: "Erweiterte Reports",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Detaillierte Analysen, Trends und Prognosen",
        },
        {
          name: "Echtzeit-Dashboard",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Live-Uebersicht aller Kennzahlen",
        },
        {
          name: "Export (CSV, PDF)",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Datenexport in verschiedenen Formaten",
        },
        {
          name: "Individuelle Reports",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Massgeschneiderte Auswertungen",
        },
      ],
    },
    {
      category: "Kundenportal",
      features: [
        {
          name: "Eigene Landingpage",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Personalisierte Unternehmensseite fuer Kunden",
        },
        {
          name: "Kunden-Registrierung",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Kunden koennen sich selbst anmelden",
        },
        {
          name: "Online-Buchungs-Widget",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Kunden koennen online buchen",
        },
        {
          name: "Buchungsbestaetigung per E-Mail",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Automatische E-Mail-Benachrichtigungen",
        },
        {
          name: "White-Label",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Ihr Logo und Branding durchgaengig",
        },
        {
          name: "Eigene Domain",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "System unter Ihrer eigenen Domain",
        },
      ],
    },
    {
      category: "Fahrer-Funktionen",
      features: [
        {
          name: "Fahrer-App (iOS/Android)",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Mobile App fuer Fahrer",
        },
        {
          name: "Auftragsbenachrichtigungen",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Push-Benachrichtigungen fuer neue Auftraege",
        },
        {
          name: "GPS-Live-Tracking",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Echtzeit-Standortverfolgung",
        },
        {
          name: "Digitale Fahrtenbuecher",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Automatische Aufzeichnung aller Fahrten",
        },
        {
          name: "Fahrer-Dokumentenverwaltung",
          starter: true,
          business: true,
          enterprise: true,
          tooltip: "Fuehrerschein, P-Schein etc. verwalten",
        },
      ],
    },
    {
      category: "Integrationen und API",
      features: [
        {
          name: "API-Zugang",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "REST-API fuer eigene Integrationen",
        },
        {
          name: "Webhook-Benachrichtigungen",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Automatische Benachrichtigungen an externe Systeme",
        },
        {
          name: "KI-gestützte Kommunikation",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Automatisierte Kundenantworten mit KI",
        },
        {
          name: "Drittanbieter-Integrationen",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Anbindung an externe Systeme",
        },
      ],
    },
    {
      category: "Support und Service",
      features: [
        { name: "E-Mail Support", starter: true, business: true, enterprise: true, tooltip: "Support per E-Mail" },
        {
          name: "Priority Support (24h)",
          starter: false,
          business: true,
          enterprise: true,
          tooltip: "Antwort innerhalb von 24 Stunden garantiert",
        },
        {
          name: "Telefon-Hotline",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Direkter telefonischer Support",
        },
        {
          name: "24/7 Premium Support",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Rund-um-die-Uhr Erreichbarkeit",
        },
        {
          name: "Dedizierter Account Manager",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Persönlicher Ansprechpartner",
        },
        {
          name: "SLA-Garantie",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Garantierte Verfügbarkeit und Reaktionszeiten",
        },
        {
          name: "Onboarding und Schulung",
          starter: false,
          business: false,
          enterprise: true,
          tooltip: "Individuelle Einarbeitung Ihres Teams",
        },
      ],
    },
  ]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <PreLoginHeader activePage="preise" />

        <main className="pt-16">
          <div className="py-16 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Transparente Preise für jede Unternehmensgröße
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Wählen Sie das passende Paket für Ihr Taxiunternehmen. Alle Preise verstehen sich zzgl. MwSt.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <Button
                  variant={billingInterval === "monthly" ? "default" : "outline"}
                  onClick={() => setBillingInterval("monthly")}
                  className="rounded-xl"
                >
                  Monatlich
                </Button>
                <Button
                  variant={billingInterval === "yearly" ? "default" : "outline"}
                  onClick={() => setBillingInterval("yearly")}
                  className="rounded-xl"
                >
                  Jährlich
                </Button>
                <Badge className="bg-success text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-xl">-20%</Badge>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-5 max-w-6xl mx-auto mb-20 px-2">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative rounded-2xl transition-all duration-300 ${
                    plan.popular
                      ? "border-2 border-primary shadow-xl lg:scale-105 mt-6 md:mt-0"
                      : "border-border hover:border-primary/50 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 whitespace-nowrap">
                        Beliebteste Wahl
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`${plan.popular ? "pt-10" : "pt-8"}`}>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      {plan.id !== "enterprise" ? (
                        <>
                          <span className="text-5xl font-bold text-foreground">
                            {billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}€
                          </span>
                          <span className="text-muted-foreground ml-2">/ Monat</span>
                          {billingInterval === "yearly" && (
                            <p className="text-sm text-muted-foreground mt-2">20% Ersparnis bei jährlicher Zahlung</p>
                          )}
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-foreground">Auf Anfrage</span>
                      )}
                    </div>

                    <Link
                      href={
                        plan.id === "enterprise"
                          ? "/kontakt"
                          : `/auth/sign-up?plan=${plan.id}&interval=${billingInterval}`
                      }
                      className="block"
                    >
                      <Button
                        className={`w-full rounded-xl ${plan.popular ? "" : "variant-outline"}`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="max-w-6xl mx-auto mb-20">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Detaillierter Funktionsvergleich
                </h2>
                <p className="text-muted-foreground">
                  Alle Features im Überblick - finden Sie den passenden Tarif für Ihre Anforderungen
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-foreground w-1/3">Funktion</th>
                      <th className="text-center py-4 px-4 font-semibold text-foreground">
                        <div className="flex flex-col items-center gap-1">
                          <span>Starter</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            {billingInterval === "monthly" ? "39€" : "31€"}/Monat
                          </span>
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-foreground bg-primary/5 rounded-t-xl">
                        <div className="flex flex-col items-center gap-1">
                          <Badge className="bg-primary text-primary-foreground mb-1">Empfohlen</Badge>
                          <span>Business</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            {billingInterval === "monthly" ? "99€" : "79€"}/Monat
                          </span>
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-foreground">
                        <div className="flex flex-col items-center gap-1">
                          <span>Enterprise</span>
                          <span className="text-sm font-normal text-muted-foreground">Individuell</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureMatrix.map((category, categoryIndex) => (
                      <>
                        {/* Category Header */}
                        <tr key={`category-${categoryIndex}`} className="bg-muted/50">
                          <td colSpan={4} className="py-3 px-4 font-semibold text-foreground">
                            {category.category}
                          </td>
                        </tr>
                        {/* Features */}
                        {category.features.map((feature, featureIndex) => (
                          <tr
                            key={`feature-${categoryIndex}-${featureIndex}`}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {feature.name}
                                {feature.tooltip && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{feature.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {typeof feature.starter === "boolean" ? (
                                feature.starter ? (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-primary" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                      <X className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                )
                              ) : (
                                <span className="text-sm font-medium text-foreground">{feature.starter}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center bg-primary/5">
                              {typeof feature.business === "boolean" ? (
                                feature.business ? (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-primary" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                      <X className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                )
                              ) : (
                                <span className="text-sm font-medium text-foreground">{feature.business}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {typeof feature.enterprise === "boolean" ? (
                                feature.enterprise ? (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-primary" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                      <X className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                )
                              ) : (
                                <span className="text-sm font-medium text-foreground">{feature.enterprise}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CTA Buttons unter der Tabelle */}
              <div className="grid md:grid-cols-3 gap-5 mt-8">
                <Link href="/auth/sign-up?plan=starter" className="block">
                  <Button variant="outline" className="w-full rounded-xl bg-transparent">
                    Starter wählen
                  </Button>
                </Link>
                <Link href="/auth/sign-up?plan=business" className="block">
                  <Button className="w-full rounded-xl">Business wählen</Button>
                </Link>
                <Link href="/kontakt" className="block">
                  <Button variant="outline" className="w-full rounded-xl bg-transparent">
                    Enterprise anfragen
                  </Button>
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
                Häufige Fragen zu unseren Tarifen
              </h2>
              <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                Hier finden Sie Antworten auf die wichtigsten Fragen rund um MyDispatch, unsere Tarife und Funktionen.
              </p>

              {/* Kategorie: Tarife & Abrechnung */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    1
                  </span>
                  Tarife & Abrechnung
                </h3>
                <div className="grid gap-5">
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Kann ich meinen Tarif jederzeit wechseln?</h4>
                      <p className="text-sm text-muted-foreground">
                        Ja, Sie können jederzeit auf einen höheren Tarif upgraden. Die Differenz wird anteilig
                        berechnet. Ein Downgrade ist zum Ende der aktuellen Abrechnungsperiode möglich. Ihre Daten
                        bleiben dabei vollständig erhalten.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Gibt es eine Mindestvertragslaufzeit?</h4>
                      <p className="text-sm text-muted-foreground">
                        Nein, alle Tarife sind monatlich kündbar. Bei jährlicher Vorauszahlung erhalten Sie 20% Rabatt
                        auf den Gesamtpreis. Die Kündigung ist bis zum letzten Tag der Laufzeit möglich.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Welche Zahlungsmethoden werden akzeptiert?</h4>
                      <p className="text-sm text-muted-foreground">
                        Wir akzeptieren Visa, Mastercard, American Express sowie SEPA-Lastschrift für Geschäftskunden.
                        Enterprise-Kunden können auch per Rechnung zahlen. Alle Zahlungen werden sicher über Stripe
                        abgewickelt.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Erhalte ich eine ordnungsgemäße Rechnung?</h4>
                      <p className="text-sm text-muted-foreground">
                        Ja, Sie erhalten nach jeder Zahlung eine GoBD-konforme Rechnung per E-Mail. Alle Rechnungen sind
                        auch jederzeit in Ihrem Kundenbereich einsehbar und herunterladbar.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Kategorie: Funktionen & Limits */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    2
                  </span>
                  Funktionen & Limits
                </h3>
                <div className="grid gap-5">
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">
                        Was passiert, wenn ich meine Limits überschreite?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Sie erhalten rechtzeitig eine Benachrichtigung, wenn Sie sich den Limits nähern (bei 80% und
                        95%). Bei Erreichen des Limits können Sie nahtlos upgraden. Bestehende Buchungen und Daten
                        bleiben unberührt.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">
                        Welche Funktionen sind in allen Tarifen enthalten?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Alle Tarife beinhalten: Buchungsverwaltung, Kundenverwaltung, GoBD-konforme Rechnungserstellung,
                        Basis-Reporting, mobile Optimierung und SSL-Verschlüsselung. Die erweiterten Features wie
                        API-Zugang, Fahrer-App und KI-Funktionen sind ab dem Business-Tarif verfügbar.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Wie funktioniert die Fahrer-App?</h4>
                      <p className="text-sm text-muted-foreground">
                        Die Fahrer-App (ab Business-Tarif) ist für iOS und Android verfügbar. Fahrer können damit
                        Aufträge empfangen, Statusupdates senden, Navigation nutzen und digital unterschreiben lassen.
                        Die App synchronisiert sich in Echtzeit mit dem Dashboard.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Was bedeutet "KI-gestützte Kommunikation"?</h4>
                      <p className="text-sm text-muted-foreground">
                        Unsere KI hilft Ihnen bei der automatischen Erstellung von E-Mails, SMS-Vorlagen und
                        Kundenantworten. Sie analysiert auch Buchungsmuster und gibt Empfehlungen zur Optimierung Ihrer
                        Disposition. Die KI lernt kontinuierlich aus Ihren Daten.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Kategorie: Datenschutz & Sicherheit */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    3
                  </span>
                  Datenschutz & Sicherheit
                </h3>
                <div className="grid gap-5">
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Wo werden meine Daten gespeichert?</h4>
                      <p className="text-sm text-muted-foreground">
                        Alle Daten werden ausschließlich auf Servern in Deutschland und der EU gespeichert. Wir nutzen
                        ISO 27001-zertifizierte Rechenzentren und erfüllen alle Anforderungen der DSGVO. Regelmäßige
                        Backups gewährleisten die Datensicherheit.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Ist MyDispatch DSGVO-konform?</h4>
                      <p className="text-sm text-muted-foreground">
                        Ja, MyDispatch ist vollständig DSGVO-konform. Wir bieten Auftragsverarbeitungsverträge (AVV),
                        Datenexport-Funktionen, automatische Datenlöschung und transparente Datenschutzrichtlinien. Ein
                        Datenschutzbeauftragter steht für Fragen zur Verfügung.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Wie sicher ist die Datenübertragung?</h4>
                      <p className="text-sm text-muted-foreground">
                        Alle Datenübertragungen erfolgen über TLS 1.3-verschlüsselte Verbindungen. Passwörter werden mit
                        bcrypt gehasht und nie im Klartext gespeichert. Zusätzlich bieten wir
                        Zwei-Faktor-Authentifizierung (2FA) für alle Benutzer.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Kategorie: Support & Onboarding */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    4
                  </span>
                  Support & Onboarding
                </h3>
                <div className="grid gap-5">
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Wie schnell erhalte ich Support?</h4>
                      <p className="text-sm text-muted-foreground">
                        Starter: E-Mail-Support mit Antwort innerhalb von 48 Stunden (werktags). Business:
                        Priority-Support mit Antwort innerhalb von 24 Stunden. Enterprise: 24/7 Premium-Support mit
                        Telefon-Hotline und garantierter Reaktionszeit von 4 Stunden.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">Gibt es eine Einführung in das System?</h4>
                      <p className="text-sm text-muted-foreground">
                        Ja, alle Kunden erhalten Zugang zu unserer umfangreichen Wissensdatenbank mit Video-Tutorials.
                        Business-Kunden erhalten zusätzlich ein persönliches Onboarding-Gespräch. Enterprise-Kunden
                        bekommen ein vollständiges Schulungsprogramm für ihr Team.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">
                        Kann ich meine bestehenden Daten importieren?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Ja, wir unterstützen den Import von Kundendaten, Fahrzeugen und Fahrern via CSV und Excel. Für
                        Enterprise-Kunden bieten wir zusätzlich individuelle Migrationslösungen von anderen Systemen an,
                        inklusive Unterstützung durch unsere Techniker.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border">
                    <CardContent className="py-5">
                      <h4 className="font-semibold text-foreground mb-2">
                        Was passiert bei einer Kündigung mit meinen Daten?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Nach der Kündigung haben Sie 30 Tage Zeit, alle Daten zu exportieren. Wir bieten vollständige
                        Datenexporte im CSV- und JSON-Format. Nach Ablauf der Frist werden alle Daten gemäß DSGVO
                        unwiderruflich gelöscht.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Noch Fragen? CTA */}
              <Card className="rounded-2xl border-primary/20 bg-primary/5">
                <CardContent className="py-8 text-center">
                  <h3 className="font-semibold text-foreground text-lg mb-2">Noch Fragen?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Unser Team hilft Ihnen gerne persönlich weiter.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/kontakt">
                      <Button className="rounded-xl">Kontakt aufnehmen</Button>
                    </Link>
                    <Link href="/faq">
                      <Button variant="outline" className="rounded-xl bg-transparent">
                        Alle FAQs ansehen
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer Text */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Alle Tarife sind monatlich kündbar - ohne Mindestlaufzeit.</p>
              <p className="text-muted-foreground">
                Fragen?{" "}
                <Link href="/kontakt" className="text-primary font-medium hover:underline">
                  Kontaktieren Sie uns
                </Link>
              </p>
            </div>
          </div>
        </main>

        <PreLoginFooter />
      </div>
    </TooltipProvider>
  )
}
