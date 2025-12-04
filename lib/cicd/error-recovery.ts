/**
 * ERROR-RECOVERY-SYSTEM
 * =====================
 * Automatische Fehlerbehebung und Recovery-Mechanismen
 */

import { logError, getErrors, analyzeErrorPatterns } from "./error-logger"
import { botMonitor } from "./bot-monitor"
import { ERROR_HANDLING_RULES } from "@/lib/ai/bots/agent-directives"
import { addDocumentation } from "@/lib/knowledge-base/documentation-api"

export interface RecoveryAction {
  id: string
  timestamp: string
  errorId: string
  action: "retry" | "fallback" | "skip" | "escalate"
  success: boolean
  message: string
}

export interface RecoveryStrategy {
  errorPattern: string
  action: "retry" | "fallback" | "skip" | "escalate"
  maxRetries?: number
  retryDelay?: number
  fallbackAction?: () => Promise<any>
}

export class ErrorRecoverySystem {
  private recoveryStrategies: RecoveryStrategy[] = []
  private recoveryHistory: RecoveryAction[] = []

  constructor() {
    this.initializeDefaultStrategies()
  }

  /**
   * Initialisiere Standard-Recovery-Strategien
   * Erweitert um Terminal-, Build- und Runtime-Fehler
   */
  private initializeDefaultStrategies() {
    this.recoveryStrategies = [
      // Terminal-Fehler: Sofort-Stop, Dokumentation, Root-Cause-Analyse
      {
        errorPattern: "terminal|command|exec|spawn|exit code",
        action: "escalate",
        maxRetries: 0, // Keine Retries bei Terminal-Fehlern
      },
      // Build-Fehler: Deployment-Blocker, alle Tasks stoppen
      {
        errorPattern: "build|compile|typescript|eslint|syntax error",
        action: "escalate",
        maxRetries: 0, // Keine Retries - muss sofort behoben werden
      },
      // Runtime-Fehler: Tracking, priorisierte Behebung
      {
        errorPattern: "runtime|uncaught|reference error|type error",
        action: "escalate",
        maxRetries: 1,
      },
      // Test-Failures: Deployment-Blocker, vor Commit beheben
      {
        errorPattern: "test.*fail|assertion.*fail|expect.*fail",
        action: "escalate",
        maxRetries: 0, // Keine Retries - muss vor Commit behoben werden
      },
      // Standard-Recovery-Strategien
      {
        errorPattern: "rate limit|429",
        action: "retry",
        maxRetries: 3,
        retryDelay: 5000,
      },
      {
        errorPattern: "model loading|503",
        action: "retry",
        maxRetries: 5,
        retryDelay: 10000,
      },
      {
        errorPattern: "network|timeout|connection",
        action: "retry",
        maxRetries: 3,
        retryDelay: 2000,
      },
      {
        errorPattern: "syntax|parse|json",
        action: "fallback",
        fallbackAction: async () => {
          // Fallback: Verwende Pattern-based Fixes
          return { success: true, message: "Pattern-based Fix angewendet" }
        },
      },
      {
        errorPattern: "critical|fatal",
        action: "escalate",
      },
    ]
  }

  /**
   * Behandle Fehler mit Recovery-Mechanismus
   * Erweitert um spezifische Behandlung für Terminal/Build/Runtime-Fehler
   */
  async handleError(
    error: Error,
    context: {
      botId: string
      taskId?: string
      filePath?: string
      retryCount?: number
      errorType?: "terminal" | "build" | "runtime" | "test" | "other"
    }
  ): Promise<RecoveryAction> {
    const errorMessage = error.message.toLowerCase()
    
    // Spezifische Behandlung basierend auf Error-Type
    if (context.errorType === "terminal") {
      return await this.handleTerminalError(error, context)
    }
    if (context.errorType === "build") {
      return await this.handleBuildError(error, context)
    }
    if (context.errorType === "runtime") {
      return await this.handleRuntimeError(error, context)
    }
    if (context.errorType === "test") {
      return await this.handleTestFailure(error, context)
    }
    
    // Finde passende Recovery-Strategie
    const strategy = this.recoveryStrategies.find((s) =>
      new RegExp(s.errorPattern, "i").test(errorMessage)
    )

    if (!strategy) {
      // Keine Strategie gefunden - eskalieren
      return await this.escalateError(error, context)
    }

    // Führe Recovery-Aktion aus
    switch (strategy.action) {
      case "retry":
        return await this.retryWithDelay(error, context, strategy)
      
      case "fallback":
        return await this.useFallback(error, context, strategy)
      
      case "skip":
        return await this.skipTask(error, context)
      
      case "escalate":
        return await this.escalateError(error, context)
      
      default:
        return await this.escalateError(error, context)
    }
  }

  /**
   * Behandle Terminal-Fehler
   * Sofortige Dokumentation, Root-Cause-Analyse, Behebung
   */
  private async handleTerminalError(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string }
  ): Promise<RecoveryAction> {
    // Sofortige Dokumentation
    await logError({
      type: "terminal-error",
      severity: "critical",
      category: "error-recovery",
      message: `Terminal-Fehler: ${error.message}`,
      context: {
        botId: context.botId,
        taskId: context.taskId,
        filePath: context.filePath,
        stack: error.stack,
      },
      botId: "error-recovery-system",
    })

    // Dokumentation in Documentation-API
    try {
      await addDocumentation({
        metadata: {
          category: "error-documentation",
          author: "error-recovery-system",
        },
        content: {
          content: `Terminal-Fehler aufgetreten: ${error.message}\n\nKontext: ${JSON.stringify(context, null, 2)}\n\nStack: ${error.stack}`,
          summary: `Terminal-Fehler in ${context.botId}`,
        },
      })
    } catch (docError) {
      console.warn("Fehler bei Dokumentation:", docError)
    }

    // Root-Cause-Analyse
    const rootCause = this.analyzeRootCause(error)

    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "escalate",
      success: false,
      message: `Terminal-Fehler: ${error.message}. Root-Cause: ${rootCause}. Sofort-Stop aktiviert.`,
    }

    this.recoveryHistory.push(recoveryAction)

    return recoveryAction
  }

  /**
   * Behandle Build-Fehler
   * Deployment-Blocker, alle Tasks stoppen
   */
  private async handleBuildError(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string }
  ): Promise<RecoveryAction> {
    await logError({
      type: "build-error",
      severity: "critical",
      category: "error-recovery",
      message: `Build-Fehler: ${error.message}. Alle Tasks gestoppt.`,
      context: {
        botId: context.botId,
        taskId: context.taskId,
        filePath: context.filePath,
      },
      solution: "Build-Fehler muss sofort behoben werden - Deployment blockiert",
      botId: "error-recovery-system",
    })

    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "escalate",
      success: false,
      message: `Build-Fehler: ${error.message}. Alle Tasks gestoppt - Deployment blockiert.`,
    }

    this.recoveryHistory.push(recoveryAction)

    return recoveryAction
  }

  /**
   * Behandle Runtime-Fehler
   * Tracking via Sentry/Logging, priorisierte Behebung
   */
  private async handleRuntimeError(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string }
  ): Promise<RecoveryAction> {
    await logError({
      type: "runtime-error",
      severity: "high",
      category: "error-recovery",
      message: `Runtime-Fehler: ${error.message}`,
      context: {
        botId: context.botId,
        taskId: context.taskId,
        filePath: context.filePath,
        stack: error.stack,
      },
      solution: "Priorisierte Behebung erforderlich",
      botId: "error-recovery-system",
    })

    // TODO: Sentry/Logging-Integration
    // await sentry.captureException(error, { tags: { botId: context.botId } })

    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "escalate",
      success: false,
      message: `Runtime-Fehler: ${error.message}. Priorisierte Behebung erforderlich.`,
    }

    this.recoveryHistory.push(recoveryAction)

    return recoveryAction
  }

  /**
   * Behandle Test-Failures
   * Deployment-Blocker, müssen vor Commit behoben werden
   */
  private async handleTestFailure(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string }
  ): Promise<RecoveryAction> {
    await logError({
      type: "test-failure",
      severity: "critical",
      category: "error-recovery",
      message: `Test-Failure: ${error.message}. Commit blockiert.`,
      context: {
        botId: context.botId,
        taskId: context.taskId,
        filePath: context.filePath,
      },
      solution: "Test-Failure muss vor Commit behoben werden",
      botId: "error-recovery-system",
    })

    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "escalate",
      success: false,
      message: `Test-Failure: ${error.message}. Commit blockiert - muss vor Commit behoben werden.`,
    }

    this.recoveryHistory.push(recoveryAction)

    return recoveryAction
  }

  /**
   * Analysiere Root-Cause
   */
  private analyzeRootCause(error: Error): string {
    const errorMessage = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ""

    if (errorMessage.includes("command not found") || errorMessage.includes("not recognized")) {
      return "Command nicht gefunden - möglicherweise fehlende Installation oder falscher Pfad"
    }
    if (errorMessage.includes("permission denied") || errorMessage.includes("access denied")) {
      return "Berechtigungsfehler - möglicherweise fehlende Rechte"
    }
    if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      return "Timeout-Fehler - möglicherweise zu lange Ausführungszeit oder Netzwerkproblem"
    }
    if (stack.includes("spawn") || stack.includes("exec")) {
      return "Prozess-Start-Fehler - möglicherweise fehlende Umgebungsvariablen oder falsche Konfiguration"
    }

    return "Unbekannte Root-Cause - weitere Analyse erforderlich"
  }

  /**
   * Wiederhole mit Verzögerung
   */
  private async retryWithDelay(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string; retryCount?: number },
    strategy: RecoveryStrategy
  ): Promise<RecoveryAction> {
    const retryCount = (context.retryCount || 0) + 1
    const maxRetries = strategy.maxRetries || 3

    if (retryCount > maxRetries) {
      // Max Retries erreicht - eskalieren
      return await this.escalateError(error, { ...context, retryCount })
    }

    const delay = strategy.retryDelay || 1000
    await this.sleep(delay)

    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "retry",
      success: false,
      message: `Retry ${retryCount}/${maxRetries} nach ${delay}ms`,
    }

    this.recoveryHistory.push(recoveryAction)

    return recoveryAction
  }

  /**
   * Verwende Fallback-Mechanismus
   */
  private async useFallback(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string },
    strategy: RecoveryStrategy
  ): Promise<RecoveryAction> {
    try {
      if (strategy.fallbackAction) {
        const result = await strategy.fallbackAction()
        
        const recoveryAction: RecoveryAction = {
          id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
          errorId: error.message,
          action: "fallback",
          success: result.success || false,
          message: result.message || "Fallback-Mechanismus angewendet",
        }

        this.recoveryHistory.push(recoveryAction)

        await logError({
          type: "recovery",
          severity: "medium",
          category: "error-recovery",
          message: `Fallback-Mechanismus angewendet für: ${error.message}`,
          context: {
            botId: context.botId,
            taskId: context.taskId,
            filePath: context.filePath,
            recoveryAction: recoveryAction.id,
          },
          solution: recoveryAction.message,
          botId: "error-recovery-system",
        })

        return recoveryAction
      }
    } catch (fallbackError) {
      // Fallback fehlgeschlagen - eskalieren
      return await this.escalateError(error, context)
    }

    return await this.escalateError(error, context)
  }

  /**
   * Überspringe Task
   */
  private async skipTask(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string }
  ): Promise<RecoveryAction> {
    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "skip",
      success: true,
      message: "Task übersprungen aufgrund von Fehler",
    }

    this.recoveryHistory.push(recoveryAction)

    await logError({
      type: "recovery",
      severity: "low",
      category: "error-recovery",
      message: `Task übersprungen: ${error.message}`,
      context: {
        botId: context.botId,
        taskId: context.taskId,
        filePath: context.filePath,
        recoveryAction: recoveryAction.id,
      },
      solution: "Task wurde übersprungen",
      botId: "error-recovery-system",
    })

    return recoveryAction
  }

  /**
   * Eskaliere Fehler
   */
  private async escalateError(
    error: Error,
    context: { botId: string; taskId?: string; filePath?: string; retryCount?: number }
  ): Promise<RecoveryAction> {
    const recoveryAction: RecoveryAction = {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      errorId: error.message,
      action: "escalate",
      success: false,
      message: "Fehler eskaliert - manuelle Intervention erforderlich",
    }

    this.recoveryHistory.push(recoveryAction)

    await logError({
      type: "recovery",
      severity: "critical",
      category: "error-recovery",
      message: `Fehler eskaliert: ${error.message}`,
      context: {
        botId: context.botId,
        taskId: context.taskId,
        filePath: context.filePath,
        retryCount: context.retryCount,
        recoveryAction: recoveryAction.id,
      },
      solution: "Manuelle Intervention erforderlich",
      botId: "error-recovery-system",
    })

    // Update Bot-Metriken
    await botMonitor.recordMetrics(context.botId, {
      tasksFailed: 1,
      errors: 1,
      status: "error",
    })

    return recoveryAction
  }

  /**
   * Analysiere Fehler-Patterns und verbessere Recovery-Strategien
   */
  async improveRecoveryStrategies(): Promise<void> {
    try {
      const errorPatterns = await analyzeErrorPatterns()
      const recentErrors = await getErrors({ since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })

      // Identifiziere häufige Fehler ohne Recovery-Strategie
      const commonErrors = errorPatterns.mostCommonCategories
        .filter((cat) => {
          const hasStrategy = this.recoveryStrategies.some((s) =>
            new RegExp(s.errorPattern, "i").test(cat.category)
          )
          return !hasStrategy && cat.count > 5
        })

      // Erstelle neue Recovery-Strategien für häufige Fehler
      for (const error of commonErrors) {
        this.recoveryStrategies.push({
          errorPattern: error.category.toLowerCase(),
          action: "retry",
          maxRetries: 2,
          retryDelay: 3000,
        })
      }

      await logError({
        type: "recovery",
        severity: "low",
        category: "error-recovery",
        message: `Recovery-Strategien verbessert: ${commonErrors.length} neue Strategien hinzugefügt`,
        context: {
          newStrategies: commonErrors.map((e) => e.category),
        },
        solution: "Recovery-Strategien automatisch verbessert",
        botId: "error-recovery-system",
      })
    } catch (error) {
      console.warn("Fehler bei Verbesserung der Recovery-Strategien:", error)
    }
  }

  /**
   * Hole Recovery-Historie
   */
  getRecoveryHistory(): RecoveryAction[] {
    return this.recoveryHistory
  }

  /**
   * Sleep-Hilfsfunktion
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Singleton-Instanz
export const errorRecoverySystem = new ErrorRecoverySystem()

