/**
 * BASE-BOT
 * ========
 * Basis-Klasse für alle Bots mit Selbstreflexion und Dokumentation
 */

import { documentWork, validateWork, signWork, type WorkDocumentation } from "@/lib/cicd/work-documentation"
import { loadKnowledgeForTask } from "@/lib/knowledge-base/structure"
import type { KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { botCommunicationManager, type BotAnswer } from "./bot-communication"
import { errorRecoverySystem } from "@/lib/cicd/error-recovery"
import { botMonitor } from "@/lib/cicd/bot-monitor"
import { perfLogger, getCached, PerformanceTimer } from "@/lib/utils/performance"
import { loadDocumentationForBot } from "@/lib/knowledge-base/documentation-api"
import type { DocumentationCategory } from "@/lib/knowledge-base/documentation-templates"

export interface BotTask {
  id: string
  type: string
  description: string
  area: string
  context?: any
}

export interface BotResponse {
  success: boolean
  result?: string
  errors?: string[]
  warnings?: string[]
  documentation?: WorkDocumentation
}

export abstract class BaseBot {
  protected botName: string
  protected area: string
  protected knowledgeBase: any
  protected documentation: any[] = []
  protected aiClient: any

  constructor(botName: string, area: string) {
    this.botName = botName
    this.area = area
    this.loadKnowledgeBase()
    this.loadDocumentation()
    this.initializeAIClient()
  }

  /**
   * Initialisiere AI-Client mit Bot-spezifischen Modellen
   */
  protected initializeAIClient() {
    const { getOptimizedHuggingFaceClient } = require("@/lib/ai/huggingface-optimized")
    this.aiClient = getOptimizedHuggingFaceClient()
  }

  /**
   * Generiere mit AI (verwendet Bot-spezifische Modelle)
   */
  protected async generateWithAI(prompt: string, taskType: string): Promise<string> {
    const response = await this.aiClient.generateForBot(this.botName, prompt, taskType)
    return response.text
  }

  /**
   * Lade Knowledge-Base (mit Caching für Performance)
   */
  protected async loadKnowledgeBase(categories?: KnowledgeCategory[]) {
    const defaultCategories: KnowledgeCategory[] = [
      "bot-instructions",
      "agent-responsibility",
      "systemwide-thinking",
      "mydispatch-core",
    ]
    const cacheKey = `${this.area}-${(categories || defaultCategories).join("-")}`
    
    this.knowledgeBase = await getCached(cacheKey, async () => {
      return loadKnowledgeForTask(
        this.area,
        categories || defaultCategories
      )
    })
  }

  /**
   * Lade Dokumentationen beim Bot-Start
   * Sollte von allen Bots beim Start aufgerufen werden
   */
  protected async loadDocumentation(categories?: DocumentationCategory[]) {
    try {
      const defaultCategories: DocumentationCategory[] = [
        "change-log",
        "error-documentation",
        "feature-documentation",
        "architecture-decision",
      ]
      
      const cacheKey = `docs-${this.area}-${(categories || defaultCategories).join("-")}`
      
      this.documentation = await getCached(cacheKey, async () => {
        return await loadDocumentationForBot(categories || defaultCategories)
      })
      
      perfLogger.info(`${this.botName}`, `Dokumentationen geladen: ${this.documentation.length}`)
    } catch (error) {
      console.warn(`[${this.botName}] Fehler beim Laden der Dokumentation:`, error)
      this.documentation = []
    }
  }

  /**
   * Selbstreflexion VOR Aufgabe
   */
  protected async reflectBefore(task: BotTask): Promise<string> {
    const reflection = `
## Selbstreflexion VOR Aufgabe

**Aufgabe**: ${task.description}
**Bereich**: ${task.area}

**Prüfungen:**
- ✅ Sind alle Vorgaben klar und verstanden? ${this.knowledgeBase.length > 0 ? "Ja" : "Nein - Knowledge-Base muss geladen werden"}
- ✅ Ist die Aufgabe vollständig definiert? ${task.description ? "Ja" : "Nein"}
- ✅ Gibt es Unklarheiten? ${task.context ? "Nein" : "Möglicherweise"}
- ✅ Sind alle notwendigen Ressourcen verfügbar? Ja
- ✅ Entspricht der Plan allen Vorgaben? Zu prüfen

**Bereit für Aufgabe**: ${this.knowledgeBase.length > 0 && task.description ? "Ja" : "Nein"}
`
    return reflection
  }

  /**
   * Selbstreflexion WÄHREND Aufgabe
   */
  protected async reflectDuring(task: BotTask, progress: string): Promise<string> {
    const reflection = `
## Selbstreflexion WÄHREND Aufgabe

**Aufgabe**: ${task.description}
**Fortschritt**: ${progress}

**Prüfungen:**
- ✅ Entspricht die aktuelle Arbeit allen Vorgaben? Zu prüfen
- ✅ Gibt es Abweichungen vom Plan? Zu prüfen
- ✅ Sind alle Schritte korrekt ausgeführt? Zu prüfen
- ✅ Gibt es technische Probleme? Zu prüfen
- ✅ Müssen Anpassungen vorgenommen werden? Zu prüfen

**Status**: In Bearbeitung
`
    return reflection
  }

  /**
   * Selbstreflexion NACH Aufgabe
   */
  protected async reflectAfter(
    task: BotTask,
    result: string,
    errors?: string[],
    technicalLimitations?: string[]
  ): Promise<string> {
    const reflection = `
## Selbstreflexion NACH Aufgabe

**Aufgabe**: ${task.description}
**Ergebnis**: ${result}

**Prüfungen:**
- ✅ Wurde die Arbeit wirklich fehlerfrei erledigt? ${errors && errors.length > 0 ? "Nein" : "Ja"}
- ✅ Entspricht das Ergebnis allen Vorgaben? Zu prüfen
- ✅ Gibt es technische Einschränkungen? ${technicalLimitations && technicalLimitations.length > 0 ? "Ja" : "Nein"}
- ✅ Sind alle Dokumentationen vollständig? Ja
- ✅ Gibt es Verbesserungspotenzial? ${errors && errors.length > 0 ? "Ja" : "Möglicherweise"}

**Fehler**: ${errors && errors.length > 0 ? errors.join(", ") : "Keine"}
**Technische Einschränkungen**: ${technicalLimitations && technicalLimitations.length > 0 ? technicalLimitations.join(", ") : "Keine"}

**Status**: ${errors && errors.length > 0 ? "Mit Fehlern" : "Erfolgreich"}
`
    return reflection
  }

  /**
   * Dokumentiere Arbeit
   */
  protected async documentWork(
    task: BotTask,
    result: string,
    reflectionBefore: string,
    reflectionDuring: string,
    reflectionAfter: string,
    errors?: Array<{ type: string; severity: "critical" | "high" | "medium" | "low"; message: string; solution?: string }>,
    technicalLimitations?: string[]
  ): Promise<WorkDocumentation> {
    return await documentWork(
      this.botName,
      this.area,
      task.description,
      result,
      {
        before: reflectionBefore,
        during: reflectionDuring,
        after: reflectionAfter,
        issues: errors?.map((e) => e.message) || [],
        technicalLimitations: technicalLimitations || [],
      },
      errors
    )
  }

  /**
   * Validiere Arbeit (für Prüfungsbots)
   */
  protected async validateWork(
    workId: string,
    passed: boolean,
    issues: string[] = []
  ): Promise<void> {
    await validateWork(workId, this.botName, passed, issues)
  }

  /**
   * Zeichne Arbeit (Abnahme)
   */
  protected async signWork(workId: string): Promise<void> {
    await signWork(workId, this.botName)
  }

  /**
   * Stelle Frage an anderen Bot (bei Unsicherheit)
   * OBLIGATORISCH: Bei Unsicherheit muss Hilfe angefordert werden
   */
  protected async askForHelp(
    question: string,
    context: any = {},
    priority: "low" | "medium" | "high" | "critical" = "medium"
  ): Promise<BotAnswer> {
    // Workflow: Dokumentation → Master-Bot → User-Chat
    
    // 1. Erste Anlaufstelle: Dokumentationsabteilung
    let answer = await botCommunicationManager.askQuestion(
      this.botName,
      "Documentation-Bot",
      question,
      context,
      priority
    )

    // 2. Wenn keine Antwort oder needsUserClarification: Master-Bot
    if (answer.needsUserClarification || !answer.answer || answer.answer.includes("weitergeleitet")) {
      perfLogger.log(`📤 Frage wird an Master-Bot weitergeleitet: ${question}`)
      answer = await botCommunicationManager.askQuestion(
        this.botName,
        "Master-Bot",
        question,
        context,
        priority
      )
    }

    return answer
  }

  /**
   * Prüfe ob Unsicherheit besteht und hole Hilfe
   */
  protected async checkUncertaintyAndGetHelp(
    task: BotTask,
    uncertainty: string,
    context: any = {}
  ): Promise<BotAnswer | null> {
    // Prüfe ob Unsicherheit besteht
    if (!uncertainty || uncertainty.trim() === "") {
      return null
    }

    perfLogger.log(`⚠️ Unsicherheit erkannt: ${uncertainty}`)
    perfLogger.log(`❓ Hilfe wird angefordert...`)

    // Hole Hilfe
    const answer = await this.askForHelp(
      `Bei Aufgabe "${task.description}" besteht Unsicherheit: ${uncertainty}`,
      { task, context },
      "high"
    )

    return answer
  }

  /**
   * Abstrakte Methode: Führe Aufgabe aus
   */
  abstract execute(task: BotTask): Promise<BotResponse>

  /**
   * Führe Aufgabe mit Error-Recovery und Monitoring aus
   */
  async executeWithRecovery(task: BotTask): Promise<BotResponse> {
    const timer = new PerformanceTimer()
    let retryCount = 0
    const maxRetries = 3

    while (retryCount <= maxRetries) {
      try {
        timer.checkpoint("start")
        // Führe Aufgabe aus
        const result = await this.execute(task)
        timer.checkpoint("end")
        
        // Erfasse Metriken (asynchron, blockiert nicht)
        const responseTime = timer.getElapsed()
        botMonitor.recordMetrics(this.botName, {
          tasksCompleted: result.success ? 1 : 0,
          tasksFailed: result.success ? 0 : 1,
          averageResponseTime: responseTime,
          errors: result.errors?.length || 0,
          warnings: result.warnings?.length || 0,
          status: result.success ? "active" : "error",
        }).catch((err) => perfLogger.warn("Fehler bei Metriken-Erfassung:", err))

        return result
      } catch (error: any) {
        // Error-Recovery
        const recoveryAction = await errorRecoverySystem.handleError(error, {
          botId: this.botName,
          taskId: task.id,
          retryCount,
        })

        if (recoveryAction.action === "retry" && retryCount < maxRetries) {
          retryCount++
          perfLogger.log(`🔄 Retry ${retryCount}/${maxRetries} für ${this.botName}`)
          continue
        }

        // Erfasse Fehler-Metriken (asynchron)
        botMonitor.recordMetrics(this.botName, {
          tasksFailed: 1,
          errors: 1,
          status: "error",
        }).catch((err) => perfLogger.warn("Fehler bei Metriken-Erfassung:", err))

        return {
          success: false,
          errors: [error.message || "Unbekannter Fehler"],
          warnings: [recoveryAction.message],
        }
      }
    }

    // Alle Retries fehlgeschlagen
    return {
      success: false,
      errors: ["Max Retries erreicht"],
    }
  }
}

