"use client"

import { useState } from "react"
import Link from "next/link"
import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  Search,
  HelpCircle,
  CreditCard,
  Shield,
  Smartphone,
  Users,
  Zap,
  Bot,
  FileText,
  Phone,
} from "lucide-react"

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Card className="rounded-2xl border-border overflow-hidden hover:border-primary/50 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-accent/50 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <CardContent className="px-6 pb-5 pt-0">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </CardContent>
      )}
    </Card>
  )
}

const faqCategories = [
  {
    id: "allgemein",
    title: "Allgemein",
    icon: HelpCircle,
    faqs: [
      {
        question: "Was ist MyDispatch?",
        answer:
          "MyDispatch ist eine cloudbasierte Dispositionssoftware speziell für Taxi-, Mietwagen- und Chauffeurunternehmen. Die Software bietet Auftragsmanagement, Fahrerkoordination, Rechnungswesen und vieles mehr – alles in einer Plattform. Made in Germany mit deutschem Hosting und DSGVO-konform.",
      },
      {
        question: "Wie starte ich mit MyDispatch?",
        answer:
          "Nach der Registrierung erhalten Sie Zugang zu Ihrem Dashboard. Folgen Sie dem Setup-Assistenten, um Ihre Fahrer, Fahrzeuge und Konzessionen hinzuzufügen. Unser Onboarding-Team unterstützt Sie in den ersten 30 Tagen bei allen Fragen.",
      },
      {
        question: "Für welche Unternehmensgröße ist MyDispatch geeignet?",
        answer:
          "MyDispatch ist für alle Unternehmensgrößen geeignet – vom Einzelunternehmer bis zum Großbetrieb mit 100+ Fahrzeugen. Unsere Tarife passen sich flexibel Ihren Anforderungen an.",
      },
      {
        question: "Benötige ich eine Installation?",
        answer:
          "Nein, MyDispatch läuft komplett im Browser. Sie benötigen lediglich einen modernen Webbrowser und eine Internetverbindung. Für Fahrer gibt es zusätzlich native Apps für iOS und Android.",
      },
      {
        question: "Wie kann ich MyDispatch kennenlernen?",
        answer:
          "Kontaktieren Sie uns für eine persönliche Demo. Unser Team zeigt Ihnen alle Funktionen im Detail. Alle Tarife sind monatlich kündbar – Sie gehen kein Risiko ein.",
      },
    ],
  },
  {
    id: "preise",
    title: "Tarife & Abrechnung",
    icon: CreditCard,
    faqs: [
      {
        question: "Welche Tarife gibt es?",
        answer:
          "Wir bieten drei Tarife: Starter (39€/Monat) für kleine Unternehmen bis 3 Fahrer, Business (99€/Monat) für wachsende Unternehmen mit unbegrenzten Fahrern, und Enterprise (auf Anfrage) für Großunternehmen mit individuellen Anforderungen.",
      },
      {
        question: "Ist MyDispatch GoBD-konform?",
        answer:
          "Ja, MyDispatch erfüllt alle Anforderungen der GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern). Alle Rechnungen sind revisionssicher und unveränderbar archiviert. Die Software ist TSE-vorbereitet.",
      },
      {
        question: "Welche Zahlungsmethoden werden akzeptiert?",
        answer:
          "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express) sowie SEPA-Lastschrift. Für Jahresverträge bieten wir auch Rechnungskauf an.",
      },
      {
        question: "Kann ich mein Paket jederzeit wechseln?",
        answer:
          "Ja, Sie können Ihr Paket jederzeit upgraden oder downgraden. Die Kündigung ist monatlich möglich ohne Mindestlaufzeit. Bei einem Upgrade werden die zusätzlichen Funktionen sofort freigeschaltet.",
      },
      {
        question: "Gibt es einen Rabatt bei jährlicher Zahlung?",
        answer:
          "Ja, bei jährlicher Vorauszahlung gewähren wir 20% Rabatt auf den regulären Monatspreis. Das entspricht einer Ersparnis von zwei Monatsgebühren pro Jahr.",
      },
      {
        question: "Wie erfolgt die Rechnungsstellung?",
        answer:
          "Die Abrechnung erfolgt monatlich im Voraus. Sie erhalten eine übersichtliche Rechnung per E-Mail. Alle Rechnungen sind auch im Dashboard jederzeit abrufbar.",
      },
    ],
  },
  {
    id: "funktionen",
    title: "Funktionen & Features",
    icon: Zap,
    faqs: [
      {
        question: "Welche Kernfunktionen bietet MyDispatch?",
        answer:
          "MyDispatch bietet Auftragsmanagement, Fahrerkoordination mit Live-Tracking, Rechnungswesen mit ZUGFeRD-Export, Kundenportal für Online-Buchungen, Fahrzeugverwaltung inkl. TÜV-Erinnerungen, und umfangreiche Statistiken und Berichte.",
      },
      {
        question: "Gibt es eine mobile App für Fahrer?",
        answer:
          "Ja, ab dem Business-Paket ist eine dedizierte Smartphone-App für Fahrer (iOS & Android) inklusive. Fahrer können damit Aufträge annehmen, navigieren und den Auftragsstatus in Echtzeit aktualisieren.",
      },
      {
        question: "Kann ich Schnittstellen zu anderen Systemen nutzen?",
        answer:
          "Im Enterprise-Tarif bieten wir eine vollständige REST-API für die Integration mit Ihren bestehenden Systemen. Standardmäßig sind bereits Schnittstellen für Buchhaltungssoftware (DATEV) verfügbar.",
      },
      {
        question: "Wie funktioniert das Kundenportal?",
        answer:
          "Das Kundenportal ermöglicht Ihren Geschäftskunden, Fahrten online zu buchen, vergangene Fahrten einzusehen und Rechnungen herunterzuladen. Im Enterprise-Tarif kann das Portal an Ihre CI angepasst werden.",
      },
      {
        question: "Gibt es automatische Rechnungserstellung?",
        answer:
          "Ja, MyDispatch erstellt automatisch Rechnungen basierend auf den abgeschlossenen Aufträgen. Sie können Rechnungsvorlagen anpassen und den Rechnungsversand automatisieren.",
      },
    ],
  },
  {
    id: "sicherheit",
    title: "Datenschutz & Sicherheit",
    icon: Shield,
    faqs: [
      {
        question: "Wie sicher sind meine Daten?",
        answer:
          "Ihre Daten werden ausschließlich in ISO-27001-zertifizierten deutschen Rechenzentren gespeichert. Die Übertragung erfolgt SSL-verschlüsselt. Wir sind vollständig DSGVO-konform und haben einen Datenschutzbeauftragten bestellt.",
      },
      {
        question: "Wer hat Zugriff auf meine Daten?",
        answer:
          "Nur Sie und Ihre autorisierten Mitarbeiter haben Zugriff auf Ihre Daten. Unsere Techniker können im Supportfall mit Ihrer Erlaubnis temporär zugreifen. Eine Weitergabe an Dritte erfolgt nicht.",
      },
      {
        question: "Werden regelmäßige Backups erstellt?",
        answer:
          "Ja, wir erstellen täglich automatische Backups aller Daten. Diese werden georedundant in verschiedenen Rechenzentren gespeichert und für 30 Tage aufbewahrt.",
      },
      {
        question: "Wie wird die Software aktualisiert?",
        answer:
          "Updates werden automatisch eingespielt, ohne dass Sie etwas tun müssen. Größere Updates werden vorab angekündigt. Die Verfügbarkeit beträgt 99,9% im Jahresmittel.",
      },
      {
        question: "Kann ich einen Auftragsverarbeitungsvertrag (AVV) erhalten?",
        answer:
          "Selbstverständlich. Der AVV gemäß Art. 28 DSGVO wird automatisch bei Vertragsabschluss bereitgestellt und kann jederzeit im Dashboard heruntergeladen werden.",
      },
    ],
  },
  {
    id: "ki",
    title: "KI-Funktionen",
    icon: Bot,
    faqs: [
      {
        question: "Welche KI-Funktionen bietet MyDispatch?",
        answer:
          "MyDispatch nutzt KI für intelligente Auftragszuweisung, vorausschauende Wartungsplanung, Routenoptimierung und den Support-Chatbot. Die KI-Assistenten helfen bei der täglichen Arbeit und beantworten Fragen.",
      },
      {
        question: "Wie funktioniert die KI-gestützte Auftragszuweisung?",
        answer:
          "Die KI analysiert Faktoren wie Fahrerstandort, Verkehrslage, Fahrzeugtyp und Kundenhistorie, um den optimalen Fahrer für jeden Auftrag vorzuschlagen. Die finale Entscheidung liegt immer beim Disponenten.",
      },
      {
        question: "Werden meine Daten für das KI-Training verwendet?",
        answer:
          "Nein, Ihre Geschäftsdaten werden ausschließlich für Ihre eigene Nutzung verwendet und niemals für das Training von KI-Modellen weitergegeben. Dies ist vertraglich garantiert.",
      },
      {
        question: "Kann ich die KI-Funktionen deaktivieren?",
        answer:
          "Ja, alle KI-Funktionen können in den Einstellungen einzeln aktiviert oder deaktiviert werden. Sie behalten die volle Kontrolle über die Automatisierungsgrade.",
      },
      {
        question: "Entspricht die KI den EU-Vorschriften?",
        answer:
          "Ja, unsere KI-Implementierung entspricht vollständig dem EU AI Act. Die eingesetzten Systeme fallen unter die Kategorie 'minimales Risiko' und werden transparent dokumentiert.",
      },
    ],
  },
  {
    id: "support",
    title: "Support & Hilfe",
    icon: Phone,
    faqs: [
      {
        question: "Welchen Support erhalte ich?",
        answer:
          "Alle Kunden erhalten deutschsprachigen E-Mail-Support. Business-Kunden haben zusätzlich Zugang zu Priority Support mit Rückruf-Option. Enterprise-Kunden erhalten einen persönlichen Ansprechpartner und 24/7-Hotline.",
      },
      {
        question: "Wie schnell wird meine Anfrage bearbeitet?",
        answer:
          "Starter-Kunden erhalten Antwort innerhalb von 48 Stunden. Business-Kunden genießen Priority Support mit Antwortzeiten unter 24 Stunden. Enterprise-Kunden haben garantierte Reaktionszeiten von unter 4 Stunden.",
      },
      {
        question: "Gibt es Schulungen für neue Mitarbeiter?",
        answer:
          "Ja, wir bieten Online-Schulungen per Video-Meeting an. Für Enterprise-Kunden sind auch Vor-Ort-Schulungen verfügbar. Zusätzlich finden Sie umfangreiche Video-Tutorials in unserem Hilfebereich.",
      },
      {
        question: "Was passiert bei technischen Problemen?",
        answer:
          "Bei kritischen technischen Problemen steht Ihnen unser Notfall-Support zur Verfügung. Wir haben ein 24/7-Monitoring und werden bei Ausfällen proaktiv tätig, oft bevor Sie es bemerken.",
      },
    ],
  },
  {
    id: "fahrer",
    title: "Fahrer-App & Portal",
    icon: Smartphone,
    faqs: [
      {
        question: "Wie funktioniert die Fahrer-App?",
        answer:
          "Die Fahrer-App zeigt alle zugewiesenen Aufträge, ermöglicht Statusupdates, integrierte Navigation und Kommunikation mit der Zentrale. Fahrer können auch Fotos und Dokumente hochladen.",
      },
      {
        question: "Können Fahrer die App auch offline nutzen?",
        answer:
          "Ja, die wichtigsten Funktionen sind offline verfügbar. Aufträge werden zwischengespeichert und automatisch synchronisiert, sobald wieder eine Verbindung besteht.",
      },
      {
        question: "Wie werden Fahrer-Dokumente verwaltet?",
        answer:
          "Im Fahrer-Portal können Führerscheine, Personenbeförderungsscheine und andere Dokumente hochgeladen werden. Das System erinnert automatisch vor Ablaufdaten.",
      },
    ],
  },
  {
    id: "kunden",
    title: "Kunden & Buchungen",
    icon: Users,
    faqs: [
      {
        question: "Wie können Kunden Fahrten buchen?",
        answer:
          "Geschäftskunden können über das Kundenportal buchen. Außerdem sind telefonische Buchungen, E-Mail-Buchungen und im Enterprise-Tarif auch API-Integrationen möglich.",
      },
      {
        question: "Kann ich Stammdaten für Kunden hinterlegen?",
        answer:
          "Ja, für jeden Kunden können Stammdaten wie bevorzugte Adressen, Zahlungskonditionen und Sonderwünsche hinterlegt werden. Diese werden automatisch bei neuen Buchungen vorausgefüllt.",
      },
      {
        question: "Wie funktioniert die Kundenkommunikation?",
        answer:
          "Kunden erhalten automatische Benachrichtigungen per E-Mail oder SMS über Buchungsbestätigungen, Fahrerinformationen und Ankunftszeiten. Alle Vorlagen sind anpassbar.",
      },
    ],
  },
  {
    id: "rechtliches",
    title: "Rechtliches",
    icon: FileText,
    faqs: [
      {
        question: "Wo finde ich die AGB?",
        answer:
          "Unsere Allgemeinen Geschäftsbedingungen finden Sie unter my-dispatch.de/agb. Diese regeln alle Vertragsbedingungen einschließlich Laufzeit, Kündigung und Haftung.",
      },
      {
        question: "Wie kann ich kündigen?",
        answer:
          "Die Kündigung ist bei monatlicher Zahlung mit 14 Tagen Frist zum Monatsende möglich. Bei Jahresverträgen beträgt die Kündigungsfrist 30 Tage zum Laufzeitende. Eine Kündigung per E-Mail ist ausreichend.",
      },
      {
        question: "Was passiert mit meinen Daten nach Vertragsende?",
        answer:
          "Nach Vertragsende haben Sie 30 Tage Zeit, Ihre Daten zu exportieren. Danach werden alle Daten unwiderruflich gelöscht. Auf Wunsch stellen wir einen Nachweis über die Löschung aus.",
      },
    ],
  },
]

export default function FragenPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("allgemein")

  const filteredCategories = searchQuery
    ? faqCategories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((cat) => cat.faqs.length > 0)
    : faqCategories.filter((cat) => cat.id === activeCategory)

  const totalFaqs = faqCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader activePage="fragen" />

      <main className="pt-16">
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Häufig gestellte Fragen
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Hier finden Sie Antworten auf die wichtigsten Fragen zu MyDispatch. Durchsuchen Sie {totalFaqs} Fragen in{" "}
              {faqCategories.length} Kategorien.
            </p>

            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Suchen Sie nach Stichworten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {!searchQuery && (
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {faqCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.title}
                      <span className="ml-1 text-xs opacity-70">({category.faqs.length})</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* FAQ Items */}
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  {searchQuery && (
                    <div className="flex items-center gap-2 mb-4">
                      <category.icon className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
                    </div>
                  )}
                  <div className="space-y-4">
                    {category.faqs.map((faq, index) => (
                      <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Keine Ergebnisse für "{searchQuery}" gefunden.</p>
                  <button onClick={() => setSearchQuery("")} className="text-primary hover:underline">
                    Suche zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="rounded-2xl border-border bg-muted/30 p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Ihre Frage wurde nicht beantwortet?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Unser Support-Team hilft Ihnen gerne weiter. Kontaktieren Sie uns per E-Mail, Telefon oder nutzen Sie
                den Live-Chat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Kontakt aufnehmen
                </Link>
                <Link
                  href="mailto:support@my-dispatch.de"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  E-Mail senden
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  )
}
