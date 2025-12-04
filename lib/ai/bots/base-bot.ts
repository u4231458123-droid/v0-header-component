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
import { loadDocumentationForBot, searchDocumentation, addDocumentation } from "@/lib/knowledge-base/documentation-api"
import type { DocumentationCategory } from "@/lib/knowledge-base/documentation-templates"
import {
  loadInformationSources,
  validateISTAnalysis,
  determineAgentRole,
  IST_ANALYSIS_REQUIREMENTS,
  INFORMATION_SOURCES,
} from "./agent-directives"
import { getGitProtocol, type GitProtocolResult } from "./git-protocol"
import { logError } from "@/lib/cicd/error-logger"
import { promises as fs } from "fs"
import path from "path"

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
  protected informationSources: {
    codebase: any
    planung: string
    documentation: any[]
  } | null = null
  protected istAnalysisCompleted: Record<string, boolean> = {}

  constructor(botName: string, area: string) {
    this.botName = botName
    this.area = area
    // Starte asynchrone Datenladung (wird in executeWithRecovery validiert)
    this.loadKnowledgeBase().catch((err) => {
      console.warn(`[${botName}] Fehler beim Laden der Knowledge-Base:`, err)
    })
    this.loadDocumentation().catch((err) => {
      console.warn(`[${botName}] Fehler beim Laden der Dokumentation:`, err)
    })
    this.loadInformationSources().catch((err) => {
      console.warn(`[${botName}] Fehler beim Laden der Informationsquellen:`, err)
    })
    this.initializeAIClient()
  }

  /**
   * Validiere dass alle obligatorischen Daten geladen wurden
   * OBLIGATORISCH: Muss vor jeder Aufgabe aufgerufen werden
   */
  protected async validateDataLoading(): Promise<{
    valid: boolean
    missing: string[]
  }> {
    const missing: string[] = []

    // Prüfe Knowledge-Base
    if (!this.knowledgeBase || (Array.isArray(this.knowledgeBase) && this.knowledgeBase.length === 0)) {
      missing.push("knowledgeBase")
      // Versuche erneut zu laden
      await this.loadKnowledgeBase()
    }

    // Prüfe Dokumentation
    if (!this.documentation || this.documentation.length === 0) {
      missing.push("documentation")
      // Versuche erneut zu laden
      await this.loadDocumentation()
    }

    // Prüfe Informationsquellen
    if (!this.informationSources) {
      missing.push("informationSources")
      // Versuche erneut zu laden
      await this.loadInformationSources()
    }

    return {
      valid: missing.length === 0,
      missing,
    }
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
      
      perfLogger.log(`[${this.botName}] Dokumentationen geladen: ${this.documentation.length}`)
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
   * Lade Informationen aus priorisierten Quellen
   * OBLIGATORISCH: Muss vor jeder Aufgabe aufgerufen werden
   */
  protected async loadInformationSources(categories?: DocumentationCategory[]): Promise<void> {
    try {
      this.informationSources = await loadInformationSources(categories)
      perfLogger.log(`[${this.botName}] Informationsquellen geladen`)
    } catch (error) {
      console.error(`[${this.botName}] Fehler beim Laden der Informationsquellen:`, error)
      this.informationSources = {
        codebase: null,
        planung: "",
        documentation: [],
      }
    }
  }

  /**
   * Führe obligatorische IST-Analyse durch
   * OBLIGATORISCH: Muss vor jeder neuen Aufgabe ausgeführt werden
   */
  protected async performMandatoryISTAnalysis(task: BotTask): Promise<{
    valid: boolean
    missing: string[]
    results: Record<string, any>
  }> {
    const results: Record<string, any> = {}

    // 1. Bestandsprüfung
    try {
      results.bestandspruefung = await this.checkIncompleteWork()
      this.istAnalysisCompleted.bestandspruefung = true
    } catch (error) {
      results.bestandspruefung = { error: (error as Error).message }
      this.istAnalysisCompleted.bestandspruefung = false
    }

    // 2. Fehlerdokumentation
    try {
      results.fehlerdokumentation = await this.documentAllErrors()
      this.istAnalysisCompleted.fehlerdokumentation = true
    } catch (error) {
      results.fehlerdokumentation = { error: (error as Error).message }
      this.istAnalysisCompleted.fehlerdokumentation = false
    }

    // 3. Abhängigkeitsanalyse
    try {
      results.abhaengigkeitsanalyse = await this.analyzeDependencies(task)
      this.istAnalysisCompleted.abhaengigkeitsanalyse = true
    } catch (error) {
      results.abhaengigkeitsanalyse = { error: (error as Error).message }
      this.istAnalysisCompleted.abhaengigkeitsanalyse = false
    }

    // 4. Konsolidierung
    try {
      results.konsolidierung = await this.consolidateTasks(task)
      this.istAnalysisCompleted.konsolidierung = true
    } catch (error) {
      results.konsolidierung = { error: (error as Error).message }
      this.istAnalysisCompleted.konsolidierung = false
    }

    // 5. Verifikation
    try {
      results.verifikation = await this.verifyGitStatus()
      this.istAnalysisCompleted.verifikation = true
    } catch (error) {
      results.verifikation = { error: (error as Error).message }
      this.istAnalysisCompleted.verifikation = false
    }

    const validation = validateISTAnalysis(this.istAnalysisCompleted)

    return {
      valid: validation.valid,
      missing: validation.missing,
      results,
    }
  }

  /**
   * Prüfe auf unvollständige Arbeiten
   */
  private async checkIncompleteWork(): Promise<{ incomplete: number; items: string[] }> {
    // TODO: Implementierung mit WorkTracker
    return { incomplete: 0, items: [] }
  }

  /**
   * Dokumentiere alle Fehler
   */
  private async documentAllErrors(): Promise<{ documented: number }> {
    // TODO: Implementierung mit error-logger
    return { documented: 0 }
  }

  /**
   * Analysiere Abhängigkeiten
   */
  private async analyzeDependencies(task: BotTask): Promise<{ dependencies: string[] }> {
    // TODO: Implementierung
    return { dependencies: [] }
  }

  /**
   * Konsolidiere Tasks
   */
  private async consolidateTasks(task: BotTask): Promise<{ consolidated: boolean }> {
    // TODO: Implementierung
    return { consolidated: true }
  }

  /**
   * Verifiziere Git-Status
   */
  private async verifyGitStatus(): Promise<{ clean: boolean; uncommitted: number }> {
    try {
      const gitProtocol = getGitProtocol()
      const isClean = await gitProtocol.isClean()
      const status = await gitProtocol.getStatus()
      return {
        clean: isClean,
        uncommitted: status.hasChanges ? 1 : 0,
      }
    } catch (error) {
      return { clean: false, uncommitted: 0 }
    }
  }

  /**
   * Führe Qualitätssicherungs-Pipeline aus
   * HuggingFace -> GitHub Copilot -> Iteration
   */
  protected async executeQualityPipeline(code: string, filePath: string): Promise<{
    passed: boolean
    issues: Array<{ severity: string; message: string; line?: number }>
    fixedCode?: string
  }> {
    // 1. HuggingFace für erste Analyse
    let hfResult: any
    try {
      const hfPrompt = `Analysiere folgenden Code auf Fehler und Verbesserungen:\n\n${code}`
      hfResult = await this.generateWithAI(hfPrompt, "code-analysis")
    } catch (error) {
      perfLogger.warn(`[${this.botName}] HuggingFace-Analyse fehlgeschlagen:`, error)
      hfResult = null
    }

    // 2. Copilot für Code-Review
    let copilotResult: any
    try {
      const { CopilotQualityBot } = await import("./copilot-quality-bot")
      const copilotBot = new CopilotQualityBot()
      copilotResult = await copilotBot.reviewCode(code, filePath, {
        taskDescription: "Code-Review durch Quality-Pipeline",
      })
    } catch (error) {
      perfLogger.warn(`[${this.botName}] Copilot-Review fehlgeschlagen:`, error)
      copilotResult = { passed: false, issues: [] }
    }

    // 3. Iteration bis Production-Ready
    let currentCode = code
    let iteration = 0
    const maxIterations = 5

    while (!copilotResult.passed && iteration < maxIterations) {
      iteration++
      perfLogger.log(`[${this.botName}] Quality-Pipeline Iteration ${iteration}/${maxIterations}`)

      // Wende Fixes an
      if (copilotResult.fixes && copilotResult.fixes.length > 0) {
        for (const fix of copilotResult.fixes) {
          currentCode = currentCode.replace(fix.oldCode, fix.newCode)
        }
      }

      // Erneutes Review
      try {
        const { CopilotQualityBot } = await import("./copilot-quality-bot")
        const copilotBot = new CopilotQualityBot()
        copilotResult = await copilotBot.reviewCode(currentCode, filePath)
      } catch (error) {
        break
      }
    }

    return {
      passed: copilotResult.passed || false,
      issues: copilotResult.issues || [],
      fixedCode: iteration > 0 ? currentCode : undefined,
    }
  }

  /**
   * Erzwinge Git-Protokoll nach Aufgabe
   * OBLIGATORISCH: Muss nach jeder abgeschlossenen Aufgabe aufgerufen werden
   */
  protected async enforceGitProtocol(
    task: BotTask,
    description: string
  ): Promise<GitProtocolResult> {
    try {
      const gitProtocol = getGitProtocol()
      const agentRole = determineAgentRole(task.type)

      const result = await gitProtocol.executeAfterTask({
        agentRole,
        taskId: task.id,
        description,
      })

      if (!result.success) {
        await logError({
          type: "git-protocol",
          severity: "high",
          category: this.botName,
          message: `Git-Protokoll fehlgeschlagen: ${result.errors?.join(", ")}`,
          context: { taskId: task.id, agentRole },
          botId: this.botName,
        })
      }

      return result
    } catch (error: any) {
      await logError({
        type: "git-protocol",
        severity: "critical",
        category: this.botName,
        message: `Git-Protokoll Fehler: ${error.message}`,
        context: { taskId: task.id },
        botId: this.botName,
      })

      return {
        success: false,
        errors: [error.message],
      }
    }
  }

  /**
   * Behandle Terminal-Fehler
   * Sofort-Stop, Root-Cause-Analyse, Dokumentation
   */
  protected async handleTerminalError(
    error: Error,
    context: { task?: BotTask; command?: string }
  ): Promise<{
    handled: boolean
    shouldStop: boolean
    documented: boolean
  }> {
    // Sofortige Dokumentation
    await logError({
      type: "terminal-error",
      severity: "critical",
      category: this.botName,
      message: `Terminal-Fehler: ${error.message}`,
      context: {
        taskId: context.task?.id,
        command: context.command,
        stack: error.stack,
      },
      botId: this.botName,
    })

    // Dokumentation in Documentation-API
    try {
      await addDocumentation({
        metadata: {
          category: "error-documentation",
          author: this.botName,
        },
        content: {
          content: `Terminal-Fehler aufgetreten: ${error.message}\n\nKontext: ${JSON.stringify(context, null, 2)}`,
          summary: `Terminal-Fehler in ${this.botName}`,
          references: [],
        },
      })
    } catch (docError) {
      perfLogger.warn(`[${this.botName}] Fehler bei Dokumentation:`, docError)
    }

    return {
      handled: true,
      shouldStop: true, // Sofort-Stop bei Terminal-Fehlern
      documented: true,
    }
  }

  /**
   * Abstrakte Methode: Führe Aufgabe aus
   */
  abstract execute(task: BotTask): Promise<BotResponse>

  /**
   * Führe Aufgabe mit Error-Recovery und Monitoring aus
   * Erweitert um obligatorische Workflow-Schritte
   */
  async executeWithRecovery(task: BotTask): Promise<BotResponse> {
    const timer = new PerformanceTimer()
    let retryCount = 0
    const maxRetries = 3

    try {
      // OBLIGATORISCH: Validiere Datenladung
      perfLogger.log(`[${this.botName}] Validiere obligatorische Datenladung...`)
      const dataValidation = await this.validateDataLoading()
      
      if (!dataValidation.valid) {
        perfLogger.warn(`[${this.botName}] Datenladung unvollständig. Fehlende: ${dataValidation.missing.join(", ")}`)
        // Versuche erneut zu laden
        if (dataValidation.missing.includes("knowledgeBase")) {
          await this.loadKnowledgeBase()
        }
        if (dataValidation.missing.includes("documentation")) {
          await this.loadDocumentation()
        }
        if (dataValidation.missing.includes("informationSources")) {
          await this.loadInformationSources()
        }
      }

      // OBLIGATORISCH: IST-Analyse vor Aufgabe
      perfLogger.log(`[${this.botName}] Führe obligatorische IST-Analyse durch...`)
      const istAnalysis = await this.performMandatoryISTAnalysis(task)
      
      if (!istAnalysis.valid) {
        perfLogger.warn(`[${this.botName}] IST-Analyse unvollständig. Fehlende Schritte: ${istAnalysis.missing.join(", ")}`)
        // Weiterführen, aber warnen
      }
    } catch (error: any) {
      // Terminal-Fehler behandeln
      const errorHandling = await this.handleTerminalError(error, { task })
      if (errorHandling.shouldStop) {
        return {
          success: false,
          errors: [`Terminal-Fehler: ${error.message}`],
          warnings: ["Aufgabe gestoppt aufgrund von Terminal-Fehler"],
        }
      }
    }

    while (retryCount <= maxRetries) {
      try {
        timer.checkpoint("start")
        
        // Führe Aufgabe aus
        const result = await this.execute(task)
        timer.checkpoint("end")
        
        // OBLIGATORISCH: Git-Protokoll nach erfolgreicher Aufgabe
        if (result.success) {
          try {
            const gitResult = await this.enforceGitProtocol(task, result.result || task.description)
            if (!gitResult.success) {
              result.warnings = [...(result.warnings || []), `Git-Protokoll fehlgeschlagen: ${gitResult.errors?.join(", ")}`]
            }
          } catch (gitError: any) {
            result.warnings = [...(result.warnings || []), `Git-Protokoll Fehler: ${gitError.message}`]
          }
        }
        
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
        // Terminal-Fehler behandeln
        const errorHandling = await this.handleTerminalError(error, { task })
        if (errorHandling.shouldStop) {
          return {
            success: false,
            errors: [`Terminal-Fehler: ${error.message}`],
            warnings: ["Aufgabe gestoppt aufgrund von Terminal-Fehler"],
          }
        }

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

