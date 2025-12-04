/**
 * BOT-OPTIMIZATION-SYSTEM
 * ========================
 * Automatische Bot-Optimierung basierend auf Fehlern
 */

import { findErrorsByBot, findWorksByBot } from "@/lib/cicd/work-documentation"
import { analyzeErrorPatterns } from "@/lib/cicd/error-logger"
import { adjustmentRequestSystem } from "./adjustment-request-system"
import { logError } from "@/lib/cicd/error-logger"

export interface BotOptimization {
  botName: string
  errorCount: number
  errorPatterns: Array<{
    type: string
    count: number
    severity: "critical" | "high" | "medium" | "low"
  }>
  recommendations: string[]
  priority: "critical" | "high" | "medium" | "low"
  lastOptimized?: string
}

/**
 * Bot-Optimization-System
 */
export class BotOptimizationSystem {
  /**
   * Analysiere Bot und generiere Optimierungsvorschläge
   */
  async analyzeBot(botName: string): Promise<BotOptimization> {
    // Finde alle Fehler des Bots
    const errors = await findErrorsByBot(botName)
    
    // Analysiere Fehler-Patterns
    const allErrorEntries = errors.flatMap((doc) => doc.errors || [])
    const errorPatterns: BotOptimization["errorPatterns"] = []
    const typeCounts: Record<string, { count: number; severity: "critical" | "high" | "medium" | "low" }> = {}

    for (const error of allErrorEntries) {
      if (!typeCounts[error.type]) {
        typeCounts[error.type] = { count: 0, severity: error.severity }
      }
      typeCounts[error.type].count++
    }

    for (const [type, data] of Object.entries(typeCounts)) {
      errorPatterns.push({
        type,
        count: data.count,
        severity: data.severity,
      })
    }

    // Generiere Empfehlungen
    const recommendations: string[] = []

    if (errorPatterns.length > 0) {
      const mostCommon = errorPatterns.sort((a, b) => b.count - a.count)[0]
      recommendations.push(`Häufigster Fehler: ${mostCommon.type} (${mostCommon.count}x)`)
      recommendations.push(`Bot sollte ${mostCommon.type}-Fehler vermeiden`)
    }

    if (allErrorEntries.some((e) => e.severity === "critical")) {
      recommendations.push("Kritische Fehler vorhanden - sofortige Nachjustierung erforderlich")
    }

    if (allErrorEntries.length > 10) {
      recommendations.push("Viele Fehler - Bot benötigt umfassende Überarbeitung")
    }

    // Bestimme Priorität
    const hasCritical = allErrorEntries.some((e) => e.severity === "critical")
    const hasHigh = allErrorEntries.some((e) => e.severity === "high")
    const priority: BotOptimization["priority"] = hasCritical
      ? "critical"
      : hasHigh
      ? "high"
      : allErrorEntries.length > 5
      ? "medium"
      : "low"

    return {
      botName,
      errorCount: errors.length,
      errorPatterns,
      recommendations,
      priority,
    }
  }

  /**
   * Optimiere Bot automatisch
   */
  async optimizeBot(botName: string): Promise<void> {
    console.log(`🔧 Starte Bot-Optimierung für ${botName}...`)

    // Analysiere Bot
    const analysis = await this.analyzeBot(botName)

    if (analysis.errorCount === 0) {
      console.log(`✅ Keine Fehler für ${botName}, keine Optimierung nötig`)
      return
    }

    // Erstelle Nachjustierungsauftrag
    try {
      const adjustmentRequest = await adjustmentRequestSystem.createAdjustmentRequest(botName)
      await adjustmentRequestSystem.executeAdjustment(adjustmentRequest.id)
      console.log(`✅ Bot-Optimierung abgeschlossen für ${botName}`)
    } catch (error: any) {
      console.error(`❌ Fehler bei Bot-Optimierung: ${error.message}`)
    }
  }

  /**
   * Optimiere alle Bots mit Fehlern
   */
  async optimizeAllBotsWithErrors(): Promise<void> {
    const bots = [
      "system-bot",
      "quality-bot",
      "documentation-bot",
      "documentation-assistant",
      "marketing-text-bot",
      "marketing-text-assistant",
      "mailing-text-bot",
      "mailing-text-assistant",
      "legal-bot",
      "legal-assistant",
      "text-quality-bot",
      "text-quality-assistant",
      "code-assistant",
      "quality-assistant",
    ]

    console.log(`🔧 Starte Optimierung für alle Bots...`)

    for (const botName of bots) {
      try {
        await this.optimizeBot(botName)
      } catch (error: any) {
        console.error(`❌ Fehler bei Optimierung von ${botName}: ${error.message}`)
      }
    }

    console.log(`✅ Bot-Optimierung für alle Bots abgeschlossen`)
  }

  /**
   * Kontinuierliche Optimierung (sollte regelmäßig aufgerufen werden)
   */
  async continuousOptimization(): Promise<void> {
    // Analysiere Fehler-Patterns systemweit
    const patterns = await analyzeErrorPatterns()

    // Wenn viele kritische Fehler, optimiere alle Bots
    if (patterns.criticalErrors > 10) {
      console.log(`⚠️ Viele kritische Fehler (${patterns.criticalErrors}), starte Optimierung...`)
      await this.optimizeAllBotsWithErrors()
    }

    // Wenn viele aktuelle Fehler, optimiere alle Bots
    if (patterns.recentErrors > 50) {
      console.log(`⚠️ Viele aktuelle Fehler (${patterns.recentErrors}), starte Optimierung...`)
      await this.optimizeAllBotsWithErrors()
    }
  }
}

// Singleton-Instanz
export const botOptimizationSystem = new BotOptimizationSystem()

