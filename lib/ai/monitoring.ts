/**
 * Monitoring System
 * =================
 * Echtzeit-Überwachung aller AI-Agent-Aktivitäten und Workflows.
 * Implementiert das NEO-GENESIS Monitoring-Prinzip.
 *
 * Features:
 * - Bot-Status-Tracking
 * - Workflow-Metriken
 * - Error-Rate-Monitoring
 * - Performance-Dashboards
 * - Health-Checks
 */

import { logError } from "@/lib/cicd/error-logger"
import { nexusBridge } from "./bots/nexus-bridge-integration"

// Monitoring-Metriken
export interface Metrics {
  timestamp: string
  bots: {
    [botId: string]: BotMetrics
  }
  workflows: WorkflowMetrics
  qualityGates: QualityGateMetrics
  selfHealing: SelfHealingMetrics
  system: SystemMetrics
}

export interface BotMetrics {
  status: "active" | "idle" | "error"
  tasksCompleted: number
  tasksFailed: number
  averageTaskDuration: number
  lastActivity: string
  errors: string[]
}

export interface WorkflowMetrics {
  total: number
  active: number
  completed: number
  failed: number
  averageDuration: number
  byPhase: {
    [phase: string]: {
      count: number
      averageDuration: number
    }
  }
}

export interface QualityGateMetrics {
  total: number
  passed: number
  failed: number
  byGate: {
    [gateName: string]: {
      total: number
      passed: number
      failed: number
      averageDuration: number
    }
  }
}

export interface SelfHealingMetrics {
  total: number
  successful: number
  failed: number
  byProtocol: {
    [protocol: string]: {
      total: number
      successful: number
      failed: number
      averageAttempts: number
    }
  }
}

export interface SystemMetrics {
  uptime: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  nodeVersion: string
  projectHealth: {
    lint: boolean
    typeCheck: boolean
    build: boolean
  }
}

// Health-Status
export interface HealthStatus {
  healthy: boolean
  timestamp: string
  checks: {
    name: string
    status: "healthy" | "degraded" | "unhealthy"
    message: string
    lastCheck: string
  }[]
  overall: "healthy" | "degraded" | "unhealthy"
}

// Alert
export interface Alert {
  id: string
  timestamp: string
  severity: "info" | "warning" | "error" | "critical"
  type: string
  message: string
  context?: Record<string, unknown>
  acknowledged: boolean
}

/**
 * Monitoring Engine
 */
export class MonitoringEngine {
  private static instance: MonitoringEngine
  private metricsHistory: Metrics[] = []
  private alerts: Alert[] = []
  private startTime: number
  private botMetrics: Map<string, BotMetrics> = new Map()
  private workflowCounts = {
    total: 0,
    active: 0,
    completed: 0,
    failed: 0,
    durations: [] as number[],
    byPhase: new Map<string, { count: number; durations: number[] }>(),
  }
  private gateCounts = {
    total: 0,
    passed: 0,
    failed: 0,
    byGate: new Map<string, { total: number; passed: number; failed: number; durations: number[] }>(),
  }
  private healingCounts = {
    total: 0,
    successful: 0,
    failed: 0,
    byProtocol: new Map<string, { total: number; successful: number; failed: number; attempts: number[] }>(),
  }

  private constructor() {
    this.startTime = Date.now()
    this.initializeBotMetrics()
  }

  static getInstance(): MonitoringEngine {
    if (!MonitoringEngine.instance) {
      MonitoringEngine.instance = new MonitoringEngine()
    }
    return MonitoringEngine.instance
  }

  /**
   * Initialisiere Bot-Metriken
   */
  private initializeBotMetrics(): void {
    const bots = ["master-bot", "system-bot", "quality-bot", "prompt-optimization-bot", "documentation-bot"]
    for (const bot of bots) {
      this.botMetrics.set(bot, {
        status: "idle",
        tasksCompleted: 0,
        tasksFailed: 0,
        averageTaskDuration: 0,
        lastActivity: new Date().toISOString(),
        errors: [],
      })
    }
  }

  /**
   * Registriere Bot-Aktivität
   */
  recordBotActivity(
    botId: string,
    taskStatus: "started" | "completed" | "failed",
    duration?: number,
    error?: string
  ): void {
    let metrics = this.botMetrics.get(botId)
    if (!metrics) {
      metrics = {
        status: "idle",
        tasksCompleted: 0,
        tasksFailed: 0,
        averageTaskDuration: 0,
        lastActivity: new Date().toISOString(),
        errors: [],
      }
      this.botMetrics.set(botId, metrics)
    }

    metrics.lastActivity = new Date().toISOString()

    switch (taskStatus) {
      case "started":
        metrics.status = "active"
        break
      case "completed":
        metrics.status = "idle"
        metrics.tasksCompleted++
        if (duration) {
          // Update average duration
          const totalTasks = metrics.tasksCompleted
          metrics.averageTaskDuration =
            (metrics.averageTaskDuration * (totalTasks - 1) + duration) / totalTasks
        }
        break
      case "failed":
        metrics.status = "error"
        metrics.tasksFailed++
        if (error) {
          metrics.errors.push(error)
          // Behalte nur die letzten 10 Fehler
          if (metrics.errors.length > 10) {
            metrics.errors = metrics.errors.slice(-10)
          }
        }
        break
    }
  }

  /**
   * Registriere Workflow-Aktivität
   */
  recordWorkflowActivity(
    status: "started" | "completed" | "failed",
    duration?: number,
    phase?: string
  ): void {
    switch (status) {
      case "started":
        this.workflowCounts.total++
        this.workflowCounts.active++
        break
      case "completed":
        this.workflowCounts.active--
        this.workflowCounts.completed++
        if (duration) {
          this.workflowCounts.durations.push(duration)
        }
        break
      case "failed":
        this.workflowCounts.active--
        this.workflowCounts.failed++
        break
    }

    if (phase && duration) {
      let phaseData = this.workflowCounts.byPhase.get(phase)
      if (!phaseData) {
        phaseData = { count: 0, durations: [] }
        this.workflowCounts.byPhase.set(phase, phaseData)
      }
      phaseData.count++
      phaseData.durations.push(duration)
    }
  }

  /**
   * Registriere Quality-Gate-Aktivität
   */
  recordGateActivity(gateName: string, passed: boolean, duration: number): void {
    this.gateCounts.total++
    if (passed) {
      this.gateCounts.passed++
    } else {
      this.gateCounts.failed++
    }

    let gateData = this.gateCounts.byGate.get(gateName)
    if (!gateData) {
      gateData = { total: 0, passed: 0, failed: 0, durations: [] }
      this.gateCounts.byGate.set(gateName, gateData)
    }
    gateData.total++
    if (passed) {
      gateData.passed++
    } else {
      gateData.failed++
    }
    gateData.durations.push(duration)
  }

  /**
   * Registriere Self-Healing-Aktivität
   */
  recordHealingActivity(protocol: string, successful: boolean, attempts: number): void {
    this.healingCounts.total++
    if (successful) {
      this.healingCounts.successful++
    } else {
      this.healingCounts.failed++
    }

    let protocolData = this.healingCounts.byProtocol.get(protocol)
    if (!protocolData) {
      protocolData = { total: 0, successful: 0, failed: 0, attempts: [] }
      this.healingCounts.byProtocol.set(protocol, protocolData)
    }
    protocolData.total++
    if (successful) {
      protocolData.successful++
    } else {
      protocolData.failed++
    }
    protocolData.attempts.push(attempts)
  }

  /**
   * Erstelle Alert
   */
  createAlert(
    severity: Alert["severity"],
    type: string,
    message: string,
    context?: Record<string, unknown>
  ): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity,
      type,
      message,
      context,
      acknowledged: false,
    }

    this.alerts.push(alert)

    // Behalte nur die letzten 100 Alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    // Logge kritische Alerts
    if (severity === "critical" || severity === "error") {
      logError({
        type: "monitoring-alert",
        severity: severity === "critical" ? "critical" : "high",
        category: "monitoring",
        message: `[${type}] ${message}`,
        context,
        botId: "monitoring-engine",
      })
    }

    return alert
  }

  /**
   * Bestätige Alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
    }
  }

  /**
   * Hole aktuelle Metriken
   */
  async getMetrics(): Promise<Metrics> {
    // Hole System-Metriken
    const memoryUsage = process.memoryUsage()
    const projectHealth = await this.checkProjectHealth()

    const metrics: Metrics = {
      timestamp: new Date().toISOString(),
      bots: Object.fromEntries(this.botMetrics),
      workflows: {
        total: this.workflowCounts.total,
        active: this.workflowCounts.active,
        completed: this.workflowCounts.completed,
        failed: this.workflowCounts.failed,
        averageDuration: this.calculateAverage(this.workflowCounts.durations),
        byPhase: Object.fromEntries(
          Array.from(this.workflowCounts.byPhase.entries()).map(([phase, data]) => [
            phase,
            {
              count: data.count,
              averageDuration: this.calculateAverage(data.durations),
            },
          ])
        ),
      },
      qualityGates: {
        total: this.gateCounts.total,
        passed: this.gateCounts.passed,
        failed: this.gateCounts.failed,
        byGate: Object.fromEntries(
          Array.from(this.gateCounts.byGate.entries()).map(([gate, data]) => [
            gate,
            {
              total: data.total,
              passed: data.passed,
              failed: data.failed,
              averageDuration: this.calculateAverage(data.durations),
            },
          ])
        ),
      },
      selfHealing: {
        total: this.healingCounts.total,
        successful: this.healingCounts.successful,
        failed: this.healingCounts.failed,
        byProtocol: Object.fromEntries(
          Array.from(this.healingCounts.byProtocol.entries()).map(([protocol, data]) => [
            protocol,
            {
              total: data.total,
              successful: data.successful,
              failed: data.failed,
              averageAttempts: this.calculateAverage(data.attempts),
            },
          ])
        ),
      },
      system: {
        uptime: Date.now() - this.startTime,
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
        },
        nodeVersion: process.version,
        projectHealth,
      },
    }

    // Speichere in Historie
    this.metricsHistory.push(metrics)
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000)
    }

    return metrics
  }

  /**
   * Hole Health-Status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks: HealthStatus["checks"] = []
    const now = new Date().toISOString()

    // Bot-Health
    for (const [botId, metrics] of this.botMetrics.entries()) {
      let status: "healthy" | "degraded" | "unhealthy" = "healthy"
      let message = "Bot ist aktiv"

      if (metrics.status === "error") {
        status = "unhealthy"
        message = `Bot hat Fehler: ${metrics.errors[metrics.errors.length - 1] || "Unbekannt"}`
      } else if (metrics.tasksFailed > metrics.tasksCompleted * 0.1) {
        status = "degraded"
        message = `Bot hat hohe Fehlerrate: ${metrics.tasksFailed}/${metrics.tasksCompleted + metrics.tasksFailed}`
      }

      checks.push({
        name: `bot:${botId}`,
        status,
        message,
        lastCheck: now,
      })
    }

    // Workflow-Health
    const workflowErrorRate =
      this.workflowCounts.total > 0 ? this.workflowCounts.failed / this.workflowCounts.total : 0

    checks.push({
      name: "workflows",
      status: workflowErrorRate > 0.2 ? "unhealthy" : workflowErrorRate > 0.1 ? "degraded" : "healthy",
      message: `Fehlerrate: ${(workflowErrorRate * 100).toFixed(1)}%`,
      lastCheck: now,
    })

    // Quality-Gate-Health
    const gatePassRate = this.gateCounts.total > 0 ? this.gateCounts.passed / this.gateCounts.total : 1

    checks.push({
      name: "quality-gates",
      status: gatePassRate < 0.8 ? "unhealthy" : gatePassRate < 0.9 ? "degraded" : "healthy",
      message: `Pass-Rate: ${(gatePassRate * 100).toFixed(1)}%`,
      lastCheck: now,
    })

    // Self-Healing-Health
    const healingSuccessRate =
      this.healingCounts.total > 0 ? this.healingCounts.successful / this.healingCounts.total : 1

    checks.push({
      name: "self-healing",
      status: healingSuccessRate < 0.5 ? "unhealthy" : healingSuccessRate < 0.7 ? "degraded" : "healthy",
      message: `Erfolgsrate: ${(healingSuccessRate * 100).toFixed(1)}%`,
      lastCheck: now,
    })

    // Nexus Bridge Health
    try {
      const health = await nexusBridge.getProjectHealth()
      checks.push({
        name: "nexus-bridge",
        status: health?.healthy ? "healthy" : "degraded",
        message: health?.healthy ? "Nexus Bridge verfügbar" : "Nexus Bridge zeigt Probleme",
        lastCheck: now,
      })
    } catch {
      checks.push({
        name: "nexus-bridge",
        status: "unhealthy",
        message: "Nexus Bridge nicht erreichbar",
        lastCheck: now,
      })
    }

    // Bestimme Gesamt-Status
    const unhealthyCount = checks.filter((c) => c.status === "unhealthy").length
    const degradedCount = checks.filter((c) => c.status === "degraded").length

    let overall: "healthy" | "degraded" | "unhealthy" = "healthy"
    if (unhealthyCount > 0) {
      overall = "unhealthy"
    } else if (degradedCount > 0) {
      overall = "degraded"
    }

    return {
      healthy: overall === "healthy",
      timestamp: now,
      checks,
      overall,
    }
  }

  /**
   * Prüfe Projekt-Health
   */
  private async checkProjectHealth(): Promise<SystemMetrics["projectHealth"]> {
    try {
      const health = await nexusBridge.getProjectHealth()
      return {
        lint: health?.lint.passed ?? true,
        typeCheck: health?.typeCheck.passed ?? true,
        build: health?.build.passed ?? true,
      }
    } catch {
      return {
        lint: true,
        typeCheck: true,
        build: true,
      }
    }
  }

  /**
   * Berechne Durchschnitt
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  /**
   * Hole Alerts
   */
  getAlerts(unacknowledgedOnly = false): Alert[] {
    if (unacknowledgedOnly) {
      return this.alerts.filter((a) => !a.acknowledged)
    }
    return this.alerts
  }

  /**
   * Hole Metriken-Historie
   */
  getMetricsHistory(limit?: number): Metrics[] {
    if (limit) {
      return this.metricsHistory.slice(-limit)
    }
    return this.metricsHistory
  }

  /**
   * Generiere Dashboard-Daten
   */
  async getDashboard(): Promise<{
    metrics: Metrics
    health: HealthStatus
    alerts: Alert[]
    summary: {
      botsActive: number
      workflowsActive: number
      gatesPassRate: number
      healingSuccessRate: number
    }
  }> {
    const metrics = await this.getMetrics()
    const health = await this.getHealthStatus()
    const alerts = this.getAlerts(true)

    const botsActive = Array.from(this.botMetrics.values()).filter((b) => b.status === "active").length

    return {
      metrics,
      health,
      alerts,
      summary: {
        botsActive,
        workflowsActive: this.workflowCounts.active,
        gatesPassRate: this.gateCounts.total > 0 ? this.gateCounts.passed / this.gateCounts.total : 1,
        healingSuccessRate:
          this.healingCounts.total > 0 ? this.healingCounts.successful / this.healingCounts.total : 1,
      },
    }
  }

  /**
   * Reset Metriken (für Tests)
   */
  reset(): void {
    this.metricsHistory = []
    this.alerts = []
    this.startTime = Date.now()
    this.initializeBotMetrics()
    this.workflowCounts = {
      total: 0,
      active: 0,
      completed: 0,
      failed: 0,
      durations: [],
      byPhase: new Map(),
    }
    this.gateCounts = {
      total: 0,
      passed: 0,
      failed: 0,
      byGate: new Map(),
    }
    this.healingCounts = {
      total: 0,
      successful: 0,
      failed: 0,
      byProtocol: new Map(),
    }
  }
}

/**
 * Singleton-Export
 */
export const monitoring = MonitoringEngine.getInstance()

