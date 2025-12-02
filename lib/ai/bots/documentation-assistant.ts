/**
 * DOCUMENTATION-ASSISTANT
 * =======================
 * Führt Dokumentationsaufgaben aus, nimmt Berichte entgegen, koordiniert Prüfungen
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { getBotArchitectureForArea } from "./bot-architecture"
import { botCommunicationManager, type BotAnswer } from "./bot-communication"

export class DocumentationAssistant extends BaseBot {
  constructor() {
    super("Documentation-Assistant", "documentation")
  }

  /**
   * Führe Aufgabe aus
   */
  async execute(task: BotTask): Promise<BotResponse> {
    // 1. Selbstreflexion VOR Aufgabe
    const reflectionBefore = await this.reflectBefore(task)
    
    // 2. Lade Knowledge-Base
    await this.loadKnowledgeBase([
      "bot-instructions",
      "agent-responsibility",
      "documentation",
      "systemwide-thinking",
    ])
    
    // 3. Führe Aufgabe aus
    let result = ""
    let errors: Array<{ type: string; severity: "critical" | "high" | "medium" | "low"; message: string; solution?: string }> = []
    let technicalLimitations: string[] = []
    
    try {
      // Selbstreflexion WÄHREND Aufgabe
      const reflectionDuring = await this.reflectDuring(task, "Dokumentation wird erstellt...")
      
      // Führe Dokumentationsaufgabe aus
      result = await this.performDocumentationTask(task)
      
      // Selbstreflexion NACH Aufgabe
      const reflectionAfter = await this.reflectAfter(task, result, errors.map((e) => e.message), technicalLimitations)
      
      // Dokumentiere Arbeit
      const documentation = await this.documentWork(
        task,
        result,
        reflectionBefore,
        reflectionDuring,
        reflectionAfter,
        errors.length > 0 ? errors : undefined,
        technicalLimitations.length > 0 ? technicalLimitations : undefined
      )
      
      // Gebe Prüfungsauftrag weiter
      await this.forwardValidationRequest(documentation.id)
      
      return {
        success: errors.length === 0,
        result,
        errors: errors.map((e) => e.message),
        documentation,
      }
    } catch (error: any) {
      errors.push({
        type: "execution-error",
        severity: "critical",
        message: `Fehler bei Dokumentationsaufgabe: ${error.message}`,
        solution: "Prüfe Fehler und behebe",
      })
      
      const reflectionAfter = await this.reflectAfter(task, "Fehler", errors.map((e) => e.message), technicalLimitations)
      
      const documentation = await this.documentWork(
        task,
        "Fehler",
        reflectionBefore,
        await this.reflectDuring(task, "Fehler aufgetreten"),
        reflectionAfter,
        errors,
        technicalLimitations
      )
      
      return {
        success: false,
        result: "Fehler",
        errors: errors.map((e) => e.message),
        documentation,
      }
    }
  }

  /**
   * Führe Dokumentationsaufgabe aus
   */
  private async performDocumentationTask(task: BotTask): Promise<string> {
    // Implementierung je nach Task-Typ
    return "Dokumentation erstellt"
  }

  /**
   * Weiterleitung Prüfungsauftrag
   */
  private async forwardValidationRequest(workId: string): Promise<void> {
    const { validationCoordinator } = await import("./validation-coordinator")
    
    // Erstelle Prüfungsauftrag über Validation-Coordinator
    await validationCoordinator.createValidationRequest(workId, this.area)
    console.log(`📋 Prüfungsauftrag erstellt: ${workId}`)
  }

  /**
   * Sammle Prüfungsergebnisse
   */
  async collectValidationResults(workId: string): Promise<any> {
    const { validationCoordinator } = await import("./validation-coordinator")
    
    // Sammle Ergebnisse über Validation-Coordinator
    const results = await validationCoordinator.collectValidationResults(workId)
    console.log(`📊 Prüfungsergebnisse gesammelt für ${workId}`)
    return results
  }

  /**
   * Erstelle Auswertung
   */
  async createEvaluation(workId: string, botReport: any, validationResults: any): Promise<string> {
    // Erstelle vollständige Auswertung: Bot-Angaben vs. reale Prüfungsdaten
    
    // Analysiere Übereinstimmungen und Abweichungen
    const matches: string[] = []
    const deviations: string[] = []
    const recommendations: string[] = []

    // Vergleiche Bot-Angaben mit Prüfungsergebnissen
    if (validationResults.results) {
      for (const [botId, result] of Object.entries(validationResults.results)) {
        if (result.passed) {
          matches.push(`${botId}: Prüfung bestanden`)
        } else {
          deviations.push(`${botId}: ${result.issues?.join(", ") || "Prüfung fehlgeschlagen"}`)
        }
      }
    }

    // Generiere Empfehlungen basierend auf Abweichungen
    if (deviations.length > 0) {
      recommendations.push("Nachjustierung erforderlich")
      recommendations.push("Prüfungsauftrag für Nachjustierung erstellen")
    }

    const evaluation = `
# Auswertung: ${workId}

## Bot-Angaben
${JSON.stringify(botReport, null, 2)}

## Prüfungsergebnisse
${JSON.stringify(validationResults, null, 2)}

## Vergleich

### Übereinstimmungen
${matches.length > 0 ? matches.map((m) => `- ${m}`).join("\n") : "- Keine Übereinstimmungen"}

### Abweichungen
${deviations.length > 0 ? deviations.map((d) => `- ${d}`).join("\n") : "- Keine Abweichungen"}

### Empfehlungen
${recommendations.length > 0 ? recommendations.map((r) => `- ${r}`).join("\n") : "- Keine Empfehlungen"}

## Status
- **Prüfungsstatus**: ${validationResults.status || "unbekannt"}
- **Abgeschlossen**: ${validationResults.completedAt || "noch nicht abgeschlossen"}
`
    return evaluation
  }

  /**
   * Beantworte Frage (mit Internet-Recherche)
   * NUR Documentation-Bot/Assistant haben Internet-Zugriff
   */
  async answerQuestion(question: string, context: any = {}): Promise<BotAnswer> {
    console.log(`🔍 Documentation-Assistant recherchiert: ${question}`)

    // Internet-Recherche durchführen
    const answer = await this.researchQuestion(question, context)

    return answer
  }

  /**
   * Recherchiere Frage im Internet
   * NUR Documentation-Bot/Assistant haben Internet-Zugriff
   */
  private async researchQuestion(question: string, context: any): Promise<BotAnswer> {
    const { internetResearchService } = await import("./internet-research")
    
    // Führe Internet-Recherche durch
    const researchResult = await internetResearchService.research(question, context)
    
    // Formatiere Antwort
    const answer = `
Recherche-Ergebnis für: ${question}

## Ergebnisse
${researchResult.results.map((r) => `- **${r.title}**: ${r.snippet} (${r.url})`).join("\n")}

## Best Practices
${researchResult.bestPractices.map((bp) => `- ${bp}`).join("\n")}

## Quellen
${researchResult.sources.map((s) => `- ${s}`).join("\n")}
`.trim()

    return {
      questionId: `research-${Date.now()}`,
      answer,
      sources: researchResult.sources,
      confidence: researchResult.results.length > 0 ? "high" : "medium",
      needsUserClarification: false,
    }
  }

  /**
   * Behandle eingehende Fragen von anderen Bots
   */
  async handleIncomingQuestion(questionId: string): Promise<void> {
    const pendingQuestions = botCommunicationManager.getPendingQuestions(this.botName)
    const question = pendingQuestions.find((q) => q.id === questionId)

    if (!question) {
      console.warn(`Frage ${questionId} nicht gefunden`)
      return
    }

    // Recherchiere Antwort
    const answer = await this.researchQuestion(question.question, question.context)

    // Beantworte Frage
    await botCommunicationManager.answerQuestion(questionId, answer.answer, answer.sources)

    console.log(`✅ Frage beantwortet: ${questionId}`)
  }
}

