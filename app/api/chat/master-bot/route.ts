/**
 * MASTER-BOT CHAT API
 * ===================
 * API-Endpoint für Master-Bot Chat
 */

import { NextRequest, NextResponse } from "next/server"
import { MasterBot } from "@/lib/ai/bots/master-bot"
import { getHuggingFaceClient } from "@/lib/ai/huggingface"
import { loadKnowledgeForTaskWithCICD } from "@/lib/knowledge-base/load-with-cicd"

const masterBot = new MasterBot()

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Keine Nachrichten erhalten" },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage.content

    // 1. Lade Knowledge-Base für Kontext
    const knowledge = loadKnowledgeForTaskWithCICD("master-chat", [
      "design-guidelines",
      "coding-rules",
      "forbidden-terms",
      "architecture",
      "best-practices",
      "account-rules",
      "routing-rules",
      "pdf-generation",
      "email-templates",
      "functionality-rules",
      "ci-cd",
      "error-handling",
    ])

    // 2. Erstelle System-Prompt für Master-Bot
    const systemPrompt = `
Sie sind der Master-Bot von MyDispatch - der systemweite Verantwortungsträger.

## IHRE ROLLE:
- Systemweite Verantwortung für das gesamte System
- Gewissenhafte, geprüfte Entscheidungen - NIEMALS ungeprüft, unbedacht oder leichtsinnig
- Jede Änderung muss SYSTEMWEIT umgesetzt werden - NIEMALS nur ein Bereich
- Vollständige Berücksichtigung aller Abhängigkeiten (Docs, Onboarding, Browser-Führung, Kundenbeschreibungen)

## WICHTIGE REGELN:
1. SYSTEMWEITE ÄNDERUNGEN: Jede Änderung betrifft IMMER mehrere Bereiche
2. VOLLSTÄNDIGE ABHÄNGIGKEITEN: Docs, Onboarding, Browser-Führung, Kundenbeschreibungen MÜSSEN berücksichtigt werden
3. GEWISSENHAFTE PRÜFUNG: Niemals ungeprüft, unbedacht oder leichtsinnig handeln
4. HARMONIE: Nutzerfreundlichkeit, CI und unternehmerische Ausrichtung NIEMALS verlieren

## IHRE FÄHIGKEITEN:
- Optimierungsvorschläge diskutieren und planen
- Änderungen systemweit planen und umsetzen
- Anträge prüfen und genehmigen/ablehnen
- Systemweite Auswirkungen analysieren
- Vollständige Dokumentation erstellen

## AKTUELLE VORGABEN:
${knowledge.map((entry) => `### ${entry.title}\n${entry.content.substring(0, 200)}...`).join("\n\n")}

Antworte als Master-Bot: gewissenhaft, durchdacht, systemweit denkend.
`.trim()

    // 3. Erstelle Chat-Prompt
    const chatPrompt = `${systemPrompt}\n\n## CHAT-VERLAUF:\n${messages
      .slice(-5)
      .map((msg: any) => `${msg.role === "user" ? "Benutzer" : "Master-Bot"}: ${msg.content}`)
      .join("\n")}\n\n## AKTUELLE FRAGE:\nBenutzer: ${userMessage}\n\nMaster-Bot:`

    // 4. Generiere Antwort mit Hugging Face
    const hfClient = getHuggingFaceClient()
    const response = await hfClient.generate(chatPrompt, "code-generation", undefined, 2048)

    // 5. Prüfe ob Optimierungsvorschlag oder Änderungsplan enthalten ist
    const responseText = response.text.trim()
    const hasOptimization = /optimier|änderung|vorschlag|plan/i.test(responseText)
    const hasChangeRequest = /antrag|genehmig|prüf/i.test(responseText)

    // 6. Wenn Optimierung/Änderung, erstelle Change Request
    if (hasOptimization || hasChangeRequest) {
      // Extrahiere Vorschlag aus Antwort
      const suggestionMatch = responseText.match(/(?:vorschlag|änderung|optimier|plan)[\s\S]*?(?:\n\n|$)/i)
      if (suggestionMatch) {
        const suggestion = suggestionMatch[0]
        
        // Erstelle Change Request
        await masterBot.createChangeRequest({
          requesterBot: "user-chat",
          type: "best-practice-suggestion",
          title: `Chat-Vorschlag: ${userMessage.substring(0, 50)}...`,
          description: `Vorschlag aus Master-Bot Chat: ${suggestion}`,
          justification: `Vorschlag aus Chat-Diskussion: ${userMessage}`,
          priority: "medium",
        })

        // Füge Hinweis zur Antwort hinzu
        const enhancedResponse = `${responseText}\n\n---\n✅ **Vorschlag wurde als Change Request erstellt und wird systemweit geprüft.**`
        return NextResponse.json({ message: enhancedResponse })
      }
    }

    return NextResponse.json({ message: responseText })
  } catch (error: any) {
    console.error("Master-Bot Chat Fehler:", error)
    return NextResponse.json(
      { error: `Fehler beim Verarbeiten der Nachricht: ${error.message}` },
      { status: 500 }
    )
  }
}

