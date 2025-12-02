/**
 * ADJUSTMENT-REQUEST-SYSTEM
 * =========================
 * System für Nachjustierungsaufträge für fehlermachende Bots
 */

import { findErrorsByBot } from "@/lib/cicd/work-documentation"
import { logError } from "@/lib/cicd/error-logger"

export interface AdjustmentRequest {
  id: string
  botName: string
  errors: Array<{
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    solution?: string
  }>
  priority: "critical" | "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed" | "failed"
  createdAt: string
  completedAt?: string
  adjustments: string[]
}

/**
 * Adjustment-Request-System
 */
export class AdjustmentRequestSystem {
  private requests: AdjustmentRequest[] = []

  /**
   * Erstelle Nachjustierungsauftrag für Bot
   */
  async createAdjustmentRequest(botName: string): Promise<AdjustmentRequest> {
    // Finde alle Fehler des Bots
    const errors = await findErrorsByBot(botName)
    
    if (errors.length === 0) {
      throw new Error(`Keine Fehler gefunden für ${botName}`)
    }

    // Bestimme Priorität basierend auf Fehler-Schweregrad
    const hasCritical = errors.some((e) => e.severity === "critical")
    const hasHigh = errors.some((e) => e.severity === "high")
    const priority: AdjustmentRequest["priority"] = hasCritical
      ? "critical"
      : hasHigh
      ? "high"
      : "medium"

    const request: AdjustmentRequest = {
      id: `adjustment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      botName,
      errors: errors.map((e) => ({
        type: e.type,
        severity: e.severity,
        message: e.message,
        solution: e.solution,
      })),
      priority,
      status: "pending",
      createdAt: new Date().toISOString(),
      adjustments: [],
    }

    this.requests.push(request)

    // Logge Nachjustierungsauftrag
    await logError({
      type: "change-request",
      severity: priority,
      category: "bot-adjustment",
      message: `Nachjustierungsauftrag für ${botName}: ${errors.length} Fehler`,
      context: {
        botName,
        errorCount: errors.length,
        requestId: request.id,
      },
      solution: "Bot muss nachjustiert werden",
      botId: "master-bot",
    })

    console.log(`🔧 Nachjustierungsauftrag erstellt: ${request.id} für ${botName}`)

    return request
  }

  /**
   * Führe Nachjustierung aus
   */
  async executeAdjustment(requestId: string): Promise<void> {
    const request = this.requests.find((r) => r.id === requestId)
    if (!request) {
      throw new Error(`Nachjustierungsauftrag ${requestId} nicht gefunden`)
    }

    request.status = "in-progress"

    // Generiere Anpassungen basierend auf Fehlern
    const adjustments: string[] = []

    for (const error of request.errors) {
      if (error.solution) {
        adjustments.push(`- ${error.message}: ${error.solution}`)
      } else {
        adjustments.push(`- ${error.message}: Prüfe und behebe`)
      }
    }

    request.adjustments = adjustments

    // Dokumentiere Anpassungen und erstelle Optimierungsauftrag
    console.log(`🔧 Nachjustierung für ${request.botName}:`)
    adjustments.forEach((adj) => console.log(`   ${adj}`))

    // Erstelle Optimierungsauftrag für Bot-Optimization-System
    const { botOptimizationSystem } = await import("./bot-optimization-system")
    await botOptimizationSystem.optimizeBot(request.botName)
    
    console.log(`✅ Bot-Optimierung für ${request.botName} durchgeführt`)

    request.status = "completed"
    request.completedAt = new Date().toISOString()

    // Logge Abschluss
    await logError({
      type: "change-request",
      severity: request.priority,
      category: "bot-adjustment",
      message: `Nachjustierung abgeschlossen für ${request.botName}`,
      context: {
        botName: request.botName,
        requestId: request.id,
        adjustments: request.adjustments,
      },
      solution: "Bot wurde nachjustiert",
      botId: "master-bot",
    })
  }

  /**
   * Hole Nachjustierungsauftrag
   */
  getAdjustmentRequest(requestId: string): AdjustmentRequest | undefined {
    return this.requests.find((r) => r.id === requestId)
  }

  /**
   * Hole alle offenen Nachjustierungsaufträge
   */
  getPendingAdjustments(): AdjustmentRequest[] {
    return this.requests.filter((r) => r.status === "pending" || r.status === "in-progress")
  }

  /**
   * Hole Nachjustierungsaufträge für Bot
   */
  getAdjustmentsForBot(botName: string): AdjustmentRequest[] {
    return this.requests.filter((r) => r.botName === botName)
  }
}

// Singleton-Instanz
export const adjustmentRequestSystem = new AdjustmentRequestSystem()

