/**
 * AI Analysis API Route
 * Nutzt Hugging Face für verschiedene Analysen
 */

import { type NextRequest, NextResponse } from "next/server"
import { analyzeSentiment, classifyTicket, translateText, summarizeText, extractEntities } from "@/lib/huggingface"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, text, options } = body

    switch (action) {
      case "sentiment":
        const sentimentResult = await analyzeSentiment(text)
        return NextResponse.json(sentimentResult)

      case "classify":
        const classifyResult = await classifyTicket(text)
        return NextResponse.json(classifyResult)

      case "translate":
        const direction = options?.direction || "de-en"
        const translateResult = await translateText(text, direction)
        return NextResponse.json(translateResult)

      case "summarize":
        const maxLength = options?.maxLength || 150
        const minLength = options?.minLength || 30
        const summaryResult = await summarizeText(text, maxLength, minLength)
        return NextResponse.json(summaryResult)

      case "entities":
        const nerResult = await extractEntities(text)
        return NextResponse.json(nerResult)

      default:
        return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 })
    }
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json({ error: "Analyse fehlgeschlagen" }, { status: 500 })
  }
}
