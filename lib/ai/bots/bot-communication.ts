/**
 * BOT-KOMMUNIKATION
 * =================
 * Kommunikationssystem zwischen Bots
 */

export interface BotQuestion {
  id: string
  timestamp: string
  fromBot: string
  toBot: string
  question: string
  context: any
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "answered" | "escalated"
  answer?: string
  escalatedTo?: string
}

export interface BotAnswer {
  questionId: string
  answer: string
  sources?: string[]
  confidence: "low" | "medium" | "high"
  needsUserClarification: boolean
}

/**
 * Bot-Kommunikations-Manager
 */
export class BotCommunicationManager {
  private questions: BotQuestion[] = []

  /**
   * Stelle Frage an anderen Bot
   */
  async askQuestion(
    fromBot: string,
    toBot: string,
    question: string,
    context: any,
    priority: BotQuestion["priority"] = "medium"
  ): Promise<BotAnswer> {
    const botQuestion: BotQuestion = {
      id: `question-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      fromBot,
      toBot,
      question,
      context,
      priority,
      status: "pending",
    }

    this.questions.push(botQuestion)

    console.log(`❓ Frage gestellt: ${fromBot} → ${toBot}: ${question}`)

    // Simuliere Antwort (sollte durch echte Bot-Kommunikation ersetzt werden)
    return await this.handleQuestion(botQuestion)
  }

  /**
   * Behandle Frage
   */
  private async handleQuestion(question: BotQuestion): Promise<BotAnswer> {
    // Wenn an Documentation-Bot/Assistant: Recherche durchführen
    if (question.toBot === "Documentation-Bot" || question.toBot === "Documentation-Assistant") {
      return await this.handleDocumentationQuestion(question)
    }

    // Wenn an Master-Bot: Weiterleitung an User-Chat
    if (question.toBot === "Master-Bot") {
      return await this.handleMasterBotQuestion(question)
    }

    // Standard-Antwort
    return {
      questionId: question.id,
      answer: "Antwort wird bearbeitet",
      confidence: "medium",
      needsUserClarification: false,
    }
  }

  /**
   * Behandle Frage an Documentation-Bot/Assistant (mit Internet-Recherche)
   */
  private async handleDocumentationQuestion(question: BotQuestion): Promise<BotAnswer> {
    try {
      const { internetResearchService } = await import("./internet-research")
      
      console.log(`🔍 Documentation-Bot recherchiert: ${question.question}`)

      // Führe echte Internet-Recherche durch
      const researchResult = await internetResearchService.research(question.question, question.context)
      
      // Formatiere Antwort
      const answer = `
Recherche-Ergebnis für: ${question.question}

## Ergebnisse
${researchResult.results.map((r) => `- **${r.title}**: ${r.snippet} (${r.url})`).join("\n")}

## Best Practices
${researchResult.bestPractices.map((bp) => `- ${bp}`).join("\n")}

## Quellen
${researchResult.sources.map((s) => `- ${s}`).join("\n")}
`.trim()

      question.status = "answered"
      question.answer = answer

      return {
        questionId: question.id,
        answer,
        sources: researchResult.sources,
        confidence: researchResult.results.length > 0 ? "high" : "medium",
        needsUserClarification: false,
      }
    } catch (error: any) {
      console.error("Fehler bei Documentation-Recherche:", error)
      
      // Bei Fehler: Weiterleitung an Master-Bot
      return await this.handleMasterBotQuestion(question)
    }
  }

  /**
   * Recherchiere Frage (Internet-Zugriff)
   */
  private async researchQuestion(question: string): Promise<string> {
    // Verwende Internet-Research-Service
    const { internetResearchService } = await import("./internet-research")
    const researchResult = await internetResearchService.research(question)
    
    // Formatiere Antwort
    return `
Recherche-Ergebnis für: ${question}

## Ergebnisse
${researchResult.results.map((r) => `- **${r.title}**: ${r.snippet}`).join("\n")}

## Best Practices
${researchResult.bestPractices.map((bp) => `- ${bp}`).join("\n")}
`.trim()
  }

  /**
   * Behandle Frage an Master-Bot (Weiterleitung an User-Chat)
   */
  private async handleMasterBotQuestion(question: BotQuestion): Promise<BotAnswer> {
    console.log(`📤 Master-Bot leitet Frage an User-Chat weiter: ${question.question}`)

    question.status = "escalated"
    question.escalatedTo = "User-Chat"

    return {
      questionId: question.id,
      answer: "Frage wurde an User-Chat weitergeleitet. Warte auf Antwort.",
      confidence: "low",
      needsUserClarification: true,
    }
  }

  /**
   * Beantworte Frage
   */
  async answerQuestion(questionId: string, answer: string, sources?: string[]): Promise<void> {
    const question = this.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new Error(`Frage ${questionId} nicht gefunden`)
    }

    question.status = "answered"
    question.answer = answer

    console.log(`✅ Frage beantwortet: ${questionId}`)
  }

  /**
   * Lade offene Fragen
   */
  getPendingQuestions(botName?: string): BotQuestion[] {
    if (botName) {
      return this.questions.filter((q) => q.toBot === botName && q.status === "pending")
    }
    return this.questions.filter((q) => q.status === "pending")
  }
}

// Singleton-Instanz
export const botCommunicationManager = new BotCommunicationManager()

