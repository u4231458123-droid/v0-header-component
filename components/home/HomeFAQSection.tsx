"use client"

import { useState } from "react"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"
import { cn } from "@/lib/utils"

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

const faqs = [
  {
    question: "Wie schnell kann ich starten?",
    answer:
      "Nach der Registrierung können Sie sofort loslegen. Unsere intuitive Benutzeroberfläche ermöglicht einen schnellen Einstieg ohne lange Einarbeitung.",
  },
  {
    question: "Welche Zahlungsmethoden werden akzeptiert?",
    answer:
      "Wir akzeptieren alle gängigen Kreditkarten, SEPA-Lastschrift und PayPal. Rechnungszahlung ist für Enterprise-Kunden verfügbar.",
  },
  {
    question: "Ist meine Datensicherheit gewährleistet?",
    answer:
      "Ja, absolut. Alle Daten werden verschlüsselt auf deutschen Servern gespeichert. Wir sind vollständig DSGVO-konform.",
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, alle Tarife sind monatlich kündbar. Es gibt keine Mindestvertragslaufzeit oder versteckten Kosten.",
  },
  {
    question: "Wie kann ich MyDispatch kennenlernen?",
    answer:
      "Kontaktieren Sie uns für eine persönliche Demo. Unser Team zeigt Ihnen alle Funktionen und beantwortet Ihre Fragen. Alle Tarife sind monatlich kündbar.",
  },
]

export const HomeFAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <V28MarketingSection
      background="canvas"
      title="Häufig gestellte Fragen"
      description="Finden Sie schnell Antworten auf die wichtigsten Fragen"
    >
      <div className="max-w-3xl mx-auto">
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-muted/50"
                aria-expanded={openIndex === idx}
              >
                <span className="font-sans text-base font-semibold text-foreground">{faq.question}</span>
                <ChevronDownIcon
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300",
                    openIndex === idx && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === idx ? "max-h-96" : "max-h-0",
                )}
              >
                <div className="px-6 pb-4">
                  <p className="font-sans text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </V28MarketingSection>
  )
}

export default HomeFAQSection
