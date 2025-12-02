/**
 * DOCUMENTATION-BOT
 * =================
 * Verwaltet gesamte Dokumentation, stellt sicher, dass alle Vorgaben eingehalten werden
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { getBotArchitectureForArea } from "./bot-architecture"
import { findErrorsByBot, findWorksByBot } from "@/lib/cicd/work-documentation"
import { botCommunicationManager, type BotAnswer } from "./bot-communication"

export class DocumentationBot extends BaseBot {
  constructor() {
    super("Documentation-Bot", "documentation")
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
   * Prüfe Dokumentation
   */
  async reviewDocumentation(workId: string): Promise<{ passed: boolean; issues: string[] }> {
    const works = await findWorksByBot("Documentation-Assistant")
    const work = works.find((w) => w.id === workId)
    
    if (!work) {
      return { passed: false, issues: ["Dokumentation nicht gefunden"] }
    }
    
    const issues: string[] = []
    
    // Prüfe Vollständigkeit
    if (!work.result || work.result.trim() === "") {
      issues.push("Dokumentation ist leer")
    }
    
    // Prüfe Reflexion
    if (!work.reflection.after || work.reflection.after.trim() === "") {
      issues.push("Selbstreflexion nach Aufgabe fehlt")
    }
    
    // Prüfe Fehler
    if (work.errors && work.errors.length > 0) {
      issues.push(`Dokumentation hat ${work.errors.length} Fehler`)
    }
    
    const passed = issues.length === 0
    
    // Validiere Arbeit
    await this.validateWork(workId, passed, issues)
    
    // Wenn bestanden, zeichne Arbeit
    if (passed) {
      await this.signWork(workId)
    }
    
    return { passed, issues }
  }

  /**
   * Finde Fehler und erstelle Nachjustierungsauftrag
   */
  async findErrorsAndCreateAdjustmentRequest(botName: string): Promise<void> {
    const { adjustmentRequestSystem } = await import("./adjustment-request-system")
    
    try {
      const request = await adjustmentRequestSystem.createAdjustmentRequest(botName)
      console.log(`🔧 Nachjustierungsauftrag erstellt: ${request.id} für ${botName}`)
      
      // Starte Nachjustierung automatisch
      await adjustmentRequestSystem.executeAdjustment(request.id)
    } catch (error: any) {
      if (error.message.includes("Keine Fehler gefunden")) {
        console.log(`✅ Keine Fehler für ${botName}, keine Nachjustierung nötig`)
      } else {
        console.error(`❌ Fehler beim Erstellen des Nachjustierungsauftrags: ${error.message}`)
      }
    }
  }

  /**
   * Beantworte Frage (mit Internet-Recherche)
   * NUR Documentation-Bot/Assistant haben Internet-Zugriff
   */
  async answerQuestion(question: string, context: any = {}): Promise<BotAnswer> {
    console.log(`🔍 Documentation-Bot recherchiert: ${question}`)

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

