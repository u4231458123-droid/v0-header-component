/**
 * BOT-MONITORING-SYSTEM
 * =====================
 * Überwacht alle Bots und deren Performance
 */

import { promises as fs } from "fs"
import path from "path"
import { logError } from "./error-logger"

export interface BotMetrics {
  botId: string
  timestamp: string
  tasksCompleted: number
  tasksFailed: number
  averageResponseTime: number
  errors: number
  warnings: number
  lastActivity: string
  status: "active" | "idle" | "error" | "offline"
}

export interface BotHealthCheck {
  botId: string
  timestamp: string
  healthy: boolean
  issues: string[]
  performance: {
    responseTime: number
    successRate: number
    errorRate: number
  }
}

export class BotMonitor {
  private metricsPath: string
  private healthCheckPath: string

  constructor() {
    const cicdDir = path.join(process.cwd(), ".cicd")
    this.metricsPath = path.join(cicdDir, "bot-metrics.json")
    this.healthCheckPath = path.join(cicdDir, "bot-health-checks.json")
  }

  /**
   * Erfasse Bot-Metriken
   */
  async recordMetrics(botId: string, metrics: Partial<BotMetrics>): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.metricsPath), { recursive: true })
      
      let allMetrics: BotMetrics[] = []
      try {
        const content = await fs.readFile(this.metricsPath, "utf-8")
        allMetrics = JSON.parse(content)
      } catch {
        allMetrics = []
      }

      const botMetric: BotMetrics = {
        botId,
        timestamp: new Date().toISOString(),
        tasksCompleted: metrics.tasksCompleted || 0,
        tasksFailed: metrics.tasksFailed || 0,
        averageResponseTime: metrics.averageResponseTime || 0,
        errors: metrics.errors || 0,
        warnings: metrics.warnings || 0,
        lastActivity: new Date().toISOString(),
        status: metrics.status || "active",
      }

      // Entferne alte Einträge für diesen Bot
      allMetrics = allMetrics.filter((m) => m.botId !== botId)
      allMetrics.push(botMetric)

      // Behalte nur die letzten 1000 Einträge
      if (allMetrics.length > 1000) {
        allMetrics = allMetrics.slice(-1000)
      }

      await fs.writeFile(this.metricsPath, JSON.stringify(allMetrics, null, 2), "utf-8")
    } catch (error) {
      console.warn("Fehler beim Aufzeichnen von Bot-Metriken:", error)
    }
  }

  /**
   * Führe Health-Check für Bot durch
   */
  async performHealthCheck(botId: string): Promise<BotHealthCheck> {
    try {
      // Lade Metriken
      let allMetrics: BotMetrics[] = []
      try {
        const content = await fs.readFile(this.metricsPath, "utf-8")
        allMetrics = JSON.parse(content)
      } catch {
        allMetrics = []
      }

      const botMetrics = allMetrics.filter((m) => m.botId === botId)
      const latestMetric = botMetrics[botMetrics.length - 1]

      if (!latestMetric) {
        return {
          botId,
          timestamp: new Date().toISOString(),
          healthy: false,
          issues: ["Keine Metriken vorhanden"],
          performance: {
            responseTime: 0,
            successRate: 0,
            errorRate: 1,
          },
        }
      }

      const issues: string[] = []
      
      // Prüfe Status
      if (latestMetric.status === "error" || latestMetric.status === "offline") {
        issues.push(`Bot-Status: ${latestMetric.status}`)
      }

      // Prüfe Error-Rate
      const totalTasks = latestMetric.tasksCompleted + latestMetric.tasksFailed
      const errorRate = totalTasks > 0 ? latestMetric.tasksFailed / totalTasks : 0
      if (errorRate > 0.1) {
        issues.push(`Hohe Fehlerrate: ${(errorRate * 100).toFixed(1)}%`)
      }

      // Prüfe Response-Time
      if (latestMetric.averageResponseTime > 30000) {
        issues.push(`Lange Antwortzeit: ${latestMetric.averageResponseTime}ms`)
      }

      // Prüfe letzte Aktivität
      const lastActivity = new Date(latestMetric.lastActivity)
      const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60)
      if (hoursSinceActivity > 24) {
        issues.push(`Keine Aktivität seit ${hoursSinceActivity.toFixed(1)} Stunden`)
      }

      const successRate = totalTasks > 0 ? latestMetric.tasksCompleted / totalTasks : 0

      return {
        botId,
        timestamp: new Date().toISOString(),
        healthy: issues.length === 0,
        issues,
        performance: {
          responseTime: latestMetric.averageResponseTime,
          successRate,
          errorRate,
        },
      }
    } catch (error) {
      console.error("Fehler bei Health-Check:", error)
      return {
        botId,
        timestamp: new Date().toISOString(),
        healthy: false,
        issues: [`Fehler bei Health-Check: ${error}`],
        performance: {
          responseTime: 0,
          successRate: 0,
          errorRate: 1,
        },
      }
    }
  }

  /**
   * Führe Health-Check für alle Bots durch
   */
  async performAllHealthChecks(): Promise<BotHealthCheck[]> {
    const botIds = [
      "system-bot",
      "quality-bot",
      "master-bot",
      "prompt-optimization-bot",
      "documentation-bot",
      "documentation-assistant",
      "marketing-text-bot",
      "marketing-text-assistant",
      "legal-bot",
      "legal-assistant",
      "mailing-text-bot",
      "mailing-text-assistant",
      "text-quality-bot",
      "text-quality-assistant",
      "code-assistant",
      "quality-assistant",
    ]

    const healthChecks = await Promise.all(
      botIds.map((botId) => this.performHealthCheck(botId))
    )

    // Speichere Health-Checks
    try {
      await fs.mkdir(path.dirname(this.healthCheckPath), { recursive: true })
      
      let allHealthChecks: BotHealthCheck[] = []
      try {
        const content = await fs.readFile(this.healthCheckPath, "utf-8")
        allHealthChecks = JSON.parse(content)
      } catch {
        allHealthChecks = []
      }

      allHealthChecks.push(...healthChecks)

      // Behalte nur die letzten 100 Einträge
      if (allHealthChecks.length > 100) {
        allHealthChecks = allHealthChecks.slice(-100)
      }

      await fs.writeFile(this.healthCheckPath, JSON.stringify(allHealthChecks, null, 2), "utf-8")
    } catch (error) {
      console.warn("Fehler beim Speichern von Health-Checks:", error)
    }

    // Logge kritische Probleme
    for (const check of healthChecks) {
      if (!check.healthy && check.issues.length > 0) {
        await logError({
          type: "health-check",
          severity: "high",
          category: "bot-monitoring",
          message: `Bot ${check.botId} ist nicht gesund: ${check.issues.join(", ")}`,
          context: {
            botId: check.botId,
            issues: check.issues,
            performance: check.performance,
          },
          solution: "Bot-Status prüfen und Probleme beheben",
          botId: "bot-monitor",
        })
      }
    }

    return healthChecks
  }

  /**
   * Hole Bot-Metriken
   */
  async getMetrics(botId?: string): Promise<BotMetrics[]> {
    try {
      const content = await fs.readFile(this.metricsPath, "utf-8")
      const allMetrics: BotMetrics[] = JSON.parse(content)
      
      if (botId) {
        return allMetrics.filter((m) => m.botId === botId)
      }
      
      return allMetrics
    } catch {
      return []
    }
  }

  /**
   * Hole Health-Checks
   */
  async getHealthChecks(botId?: string): Promise<BotHealthCheck[]> {
    try {
      const content = await fs.readFile(this.healthCheckPath, "utf-8")
      const allHealthChecks: BotHealthCheck[] = JSON.parse(content)
      
      if (botId) {
        return allHealthChecks.filter((h) => h.botId === botId)
      }
      
      return allHealthChecks
    } catch {
      return []
    }
  }
}

// Singleton-Instanz
export const botMonitor = new BotMonitor()

