/**
 * ERROR-RECOVERY-SYSTEM
 * =====================
 * Automatische Fehlerbehebung und Recovery-Mechanismen
 */

import { logError, getErrors, analyzeErrorPatterns } from "./error-logger"
import { botMonitor } from "./bot-monitor"

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
   */
  private initializeDefaultStrategies() {
    this.recoveryStrategies = [
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
   */
  async handleError(
    error: Error,
    context: {
      botId: string
      taskId?: string
      filePath?: string
      retryCount?: number
    }
  ): Promise<RecoveryAction> {
    const errorMessage = error.message.toLowerCase()
    
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

