import { generateText } from "ai"
import { NextResponse } from "next/server"
import { SYSTEM_PROMPTS, AI_MODELS } from "@/lib/ai/config"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    const systemPromptMap = {
      lead: SYSTEM_PROMPTS.leadSupport,
      dashboard: SYSTEM_PROMPTS.dashboardHelp,
      driver: SYSTEM_PROMPTS.driverHelp,
      customer: SYSTEM_PROMPTS.customerHelp,
    }

    const systemPrompt = systemPromptMap[context as keyof typeof systemPromptMap] || SYSTEM_PROMPTS.leadSupport

    // Format messages for AI SDK
    const formattedMessages = messages.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: typeof m.content === "string" ? m.content : "",
    }))

    try {
      // Wähle Modell basierend auf Kontext oder Komplexität
      // Für Standard-Chat nutzen wir das Default-Modell (Claude)
      // Für komplexe Analysen könnte man 'advanced' (Gemini) nutzen
      const modelToUse = AI_MODELS.default

      const result = await generateText({
        model: modelToUse,
        system: systemPrompt,
        messages: formattedMessages,
      })

      return NextResponse.json({ response: result.text })
    } catch (aiError) {
      console.warn("[AI Chat] AI Gateway error, using fallback:", aiError)
      return NextResponse.json({
        response: getFallbackResponse(formattedMessages[formattedMessages.length - 1]?.content || "", context),
      })
    }
  } catch (error) {
    console.error("[AI Chat] Error:", error)
    return NextResponse.json({
      response:
        "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns unter info@my-dispatch.de.",
    })
  }
}

function getFallbackResponse(userMessage: string, context: string): string {
  const lowerMessage = userMessage.toLowerCase()

  // Preis-Fragen
  if (
    lowerMessage.includes("preis") ||
    lowerMessage.includes("kosten") ||
    lowerMessage.includes("kostet") ||
    lowerMessage.includes("tarif")
  ) {
    return `MyDispatch Tarife:

Starter: 39 Euro/Monat (oder 31.20 Euro bei Jahresabo)
- Bis zu 3 Fahrer und 3 Fahrzeuge
- Auftragsverwaltung, Kundenmanagement, E-Mail-Versand

Business: 99 Euro/Monat (oder 79.20 Euro bei Jahresabo)
- Unbegrenzte Fahrer und Fahrzeuge
- Kunden-Login mit Selbstbuchung
- Partner-Netzwerk, erweiterter Support

Alle Tarife beinhalten: Dashboard, Dokumentenverwaltung, Rechnungsstellung

Interesse? Registrieren Sie sich auf my-dispatch.de oder kontaktieren Sie uns unter info@my-dispatch.de`
  }

  // Funktions-Fragen
  if (lowerMessage.includes("funktion") || lowerMessage.includes("feature") || lowerMessage.includes("kann")) {
    return `MyDispatch Kernfunktionen:

- Auftragsverwaltung mit Echtzeit-Status
- Fahrer- und Fahrzeugmanagement
- Fuehrerschein- und TUeV-Ueberwachung mit Erinnerungen
- Kundenportal fuer Online-Buchungen
- Fahrerportal (Mobile-optimiert)
- Rechnungsstellung und Kassenbuch
- Partner-Netzwerk fuer Auftragsaustausch
- Eigene Unternehmens-Landingpage

Was moechten Sie genauer wissen?`
  }

  // Demo-Fragen
  if (lowerMessage.includes("demo") || lowerMessage.includes("test") || lowerMessage.includes("ausprobieren")) {
    return `Fuer eine persoenliche Vorfuehrung von MyDispatch kontaktieren Sie uns gerne:

E-Mail: info@my-dispatch.de
Telefon: +49 170 8004423
Geschaeftszeiten: Mo-Fr 09:00-17:00 Uhr

Wir zeigen Ihnen alle Funktionen und beantworten Ihre Fragen.`
  }

  // Auftrag/Buchung
  if (lowerMessage.includes("auftrag") || lowerMessage.includes("buchung")) {
    if (context === "dashboard") {
      return `Neuen Auftrag erstellen:

1. Klicken Sie im Menu auf "Auftraege"
2. Klicken Sie auf "Neuer Auftrag"
3. Geben Sie Datum, Uhrzeit, Abhol- und Zieladresse ein
4. Waehlen Sie optional Fahrgastname und Personenanzahl
5. Weisen Sie einen Fahrer zu
6. Speichern Sie den Auftrag

Der Fahrer wird automatisch benachrichtigt.`
    }
    if (context === "customer") {
      return `So buchen Sie eine Fahrt:

1. Geben Sie Ihre Abholadresse ein
2. Geben Sie die Zieladresse ein
3. Waehlen Sie Datum und Uhrzeit
4. Geben Sie die Personenanzahl an
5. Bestaetigen Sie die Buchung

Sie erhalten eine Bestaetigung und werden benachrichtigt, wenn Ihr Fahrer unterwegs ist.`
    }
    return "Fuer Buchungen nutzen Sie bitte das Kundenportal oder kontaktieren Sie das Transportunternehmen direkt."
  }

  // Rechnung
  if (lowerMessage.includes("rechnung") || lowerMessage.includes("faktur")) {
    return `Rechnung erstellen:

1. Gehen Sie zu "Finanzen" im Menu
2. Waehlen Sie den Tab "Rechnungen"
3. Klicken Sie auf "Neue Rechnung"
4. Waehlen Sie den Kunden
5. Waehlen Sie die abgeschlossenen Auftraege
6. Die Rechnung wird automatisch generiert
7. Versenden per E-Mail oder als PDF herunterladen`
  }

  // Fahrer-Fragen
  if (context === "driver") {
    if (lowerMessage.includes("annehmen") || lowerMessage.includes("auftrag")) {
      return `So nehmen Sie einen Auftrag an:

1. Neuer Auftrag erscheint in Ihrer Liste
2. Pruefen Sie die Details (Zeit, Adresse, Kunde)
3. Klicken Sie auf "Annehmen"
4. Setzen Sie Status auf "Unterwegs" wenn Sie losfahren
5. "Angekommen" wenn Sie beim Kunden sind
6. "Abgeschlossen" nach Beendigung der Fahrt`
    }
  }

  // Kontakt
  if (
    lowerMessage.includes("kontakt") ||
    lowerMessage.includes("telefon") ||
    lowerMessage.includes("email") ||
    lowerMessage.includes("hilfe")
  ) {
    return `Kontaktieren Sie uns:

RideHub Solutions
Inhaber: Ibrahim SIMSEK

Telefon: +49 170 8004423
E-Mail: info@my-dispatch.de
Website: www.my-dispatch.de

Geschaeftszeiten: Mo-Fr 09:00-17:00 Uhr

Wir helfen Ihnen gerne weiter!`
  }

  // Standard-Antworten je Kontext
  const defaultResponses: Record<string, string> = {
    lead: "Willkommen bei MyDispatch! Ich helfe Ihnen gerne bei Fragen zu unserer Dispositions-Software. Fragen Sie mich zu Tarifen, Funktionen oder Kontaktmoeglichkeiten.",
    dashboard:
      "Ich bin Ihr Dashboard-Assistent! Wie kann ich Ihnen bei der Nutzung von MyDispatch helfen? Fragen Sie mich zu Auftraegen, Fahrern, Kunden, Rechnungen oder Einstellungen.",
    driver:
      "Hallo! Ich bin Ihr Fahrer-Assistent. Wie kann ich Ihnen helfen? Fragen Sie mich zur Auftragsannahme, Status-Updates oder Navigation.",
    customer:
      "Willkommen! Wie kann ich Ihnen bei Ihrer Buchung helfen? Fragen Sie mich zum Buchungsprozess, Stornierungen oder Zahlungsmoeglichkeiten.",
  }

  return defaultResponses[context] || defaultResponses.lead
}
