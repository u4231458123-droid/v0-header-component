/**
 * Prompt Learning System
 * ======================
 * Selbstlernendes System für kontinuierliche Prompt-Optimierung.
 * Speichert erfolgreiche Prompts und verbessert Templates basierend auf Erfolgsrate.
 *
 * Funktionen:
 * - savePromptExecution() - Speichere Ausführungsergebnis
 * - getSuccessfulTemplates() - Hole erfolgreiche Vorlagen
 * - improveTemplateFromHistory() - Optimiere Templates
 * - calculatePromptScore() - Bewerte Prompt-Qualität
 */

import { promises as fs } from "fs"
import path from "path"
import { logError } from "@/lib/cicd/error-logger"
import type { TaskType, OptimizedPrompt, ExecutionResult } from "./prompt-architect"

// Prompt-Ausführungs-Record
export interface PromptExecution {
  id: string
  timestamp: string
  originalInput: string
  optimizedPrompt: string
  taskType: TaskType
  success: boolean
  duration: number
  errors: string[]
  metadata: {
    complexity: string
    affectedFiles: string[]
    workflowId?: string
  }
}

// Template-Statistiken
export interface TemplateStats {
  taskType: TaskType
  totalExecutions: number
  successCount: number
  failureCount: number
  successRate: number
  averageDuration: number
  commonPatterns: string[]
  lastImprovement: string
}

// Lern-Empfehlung
export interface LearningRecommendation {
  type: "pattern" | "template" | "context" | "execution"
  priority: "high" | "medium" | "low"
  recommendation: string
  basedOn: string[]
}

// Prompt-Score
export interface PromptScore {
  overall: number
  clarity: number
  specificity: number
  actionability: number
  contextRichness: number
}

/**
 * Prompt Learning Engine
 */
export class PromptLearningEngine {
  private static instance: PromptLearningEngine
  private historyPath: string
  private history: PromptExecution[] = []
  private templateStats: Map<TaskType, TemplateStats> = new Map()
  private maxHistorySize = 1000
  private loaded = false

  private constructor() {
    this.historyPath = path.join(process.cwd(), ".prompt-history.json")
  }

  static getInstance(): PromptLearningEngine {
    if (!PromptLearningEngine.instance) {
      PromptLearningEngine.instance = new PromptLearningEngine()
    }
    return PromptLearningEngine.instance
  }

  /**
   * Initialisiere und lade Historie
   */
  async initialize(): Promise<void> {
    if (this.loaded) return

    try {
      const data = await fs.readFile(this.historyPath, "utf-8")
      const parsed = JSON.parse(data)
      this.history = parsed.history || []
      this.updateTemplateStats()
      this.loaded = true
    } catch {
      // Datei existiert nicht - starte mit leerer Historie
      this.history = []
      this.loaded = true
    }
  }

  /**
   * Speichere Prompt-Ausführung
   */
  async savePromptExecution(
    prompt: OptimizedPrompt,
    result: ExecutionResult
  ): Promise<void> {
    await this.initialize()

    const execution: PromptExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      originalInput: prompt.original,
      optimizedPrompt: prompt.optimized,
      taskType: prompt.metadata.taskType as TaskType,
      success: result.success,
      duration: result.duration,
      errors: result.errors,
      metadata: {
        complexity: prompt.metadata.complexity,
        affectedFiles: prompt.metadata.affectedFiles,
        workflowId: result.workflowId
      }
    }

    this.history.push(execution)

    // Historie-Größe begrenzen
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }

    // Statistiken aktualisieren
    this.updateTemplateStats()

    // Persistieren
    await this.saveHistory()
  }

  /**
   * Hole erfolgreiche Templates für Task-Typ
   */
  async getSuccessfulTemplates(taskType: TaskType): Promise<PromptExecution[]> {
    await this.initialize()

    return this.history
      .filter(exec => exec.taskType === taskType && exec.success)
      .sort((a, b) => b.duration - a.duration) // Schnellste zuerst
      .slice(0, 10)
  }

  /**
   * Hole beste Patterns für Task-Typ
   */
  async getBestPatterns(taskType: TaskType): Promise<string[]> {
    const successfulExecutions = await this.getSuccessfulTemplates(taskType)

    // Extrahiere gemeinsame Phrasen/Muster
    const patterns: Map<string, number> = new Map()

    for (const exec of successfulExecutions) {
      const words = exec.optimizedPrompt.toLowerCase().split(/\s+/)

      // Bi-gramme und Tri-gramme extrahieren
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`
        patterns.set(bigram, (patterns.get(bigram) || 0) + 1)

        if (i < words.length - 2) {
          const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
          patterns.set(trigram, (patterns.get(trigram) || 0) + 1)
        }
      }
    }

    // Top-Patterns nach Häufigkeit
    return Array.from(patterns.entries())
      .filter(([_, count]) => count >= 2) // Mindestens 2x vorgekommen
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern]) => pattern)
  }

  /**
   * Verbessere Template basierend auf Historie
   */
  async improveTemplateFromHistory(
    taskType: TaskType,
    currentTemplate: string
  ): Promise<{
    improved: string
    changes: string[]
    confidence: number
  }> {
    await this.initialize()

    const stats = this.templateStats.get(taskType)
    const bestPatterns = await this.getBestPatterns(taskType)
    const successfulTemplates = await this.getSuccessfulTemplates(taskType)

    const changes: string[] = []
    let improved = currentTemplate

    // Wenn keine Daten, gib Original zurück
    if (!stats || successfulTemplates.length === 0) {
      return {
        improved,
        changes: ["Keine historischen Daten verfügbar"],
        confidence: 0
      }
    }

    // 1. Füge erfolgreiche Patterns hinzu die fehlen
    for (const pattern of bestPatterns.slice(0, 3)) {
      if (!improved.toLowerCase().includes(pattern)) {
        // Prüfe ob Pattern relevant ist
        const relevantKeywords = ["context", "execution", "validation", "test", "quality"]
        if (relevantKeywords.some(kw => pattern.includes(kw))) {
          changes.push(`Hinzugefügtes erfolgreiches Pattern: "${pattern}"`)
        }
      }
    }

    // 2. Lerne aus häufigen Fehlermustern
    const failedExecutions = this.history.filter(
      exec => exec.taskType === taskType && !exec.success
    )

    if (failedExecutions.length > 0) {
      const commonErrors = this.findCommonErrors(failedExecutions)
      for (const error of commonErrors.slice(0, 2)) {
        if (!improved.includes("Fehlervermeidung")) {
          improved += `\n\n**Fehlervermeidung (gelernt):**\n- ${error}`
          changes.push(`Hinzugefügte Fehlervermeidung: "${error}"`)
        }
      }
    }

    // 3. Optimiere basierend auf Durchschnittsdauer
    if (stats.averageDuration > 60000) { // > 1 Minute
      if (!improved.includes("Optimierung")) {
        improved += `\n\n**Performance-Hinweis:**\n- Dieser Task-Typ dauert durchschnittlich ${Math.round(stats.averageDuration / 1000)}s`
        changes.push("Performance-Hinweis hinzugefügt")
      }
    }

    // Berechne Konfidenz basierend auf Datenmenge
    const confidence = Math.min(100, stats.totalExecutions * 10)

    return {
      improved,
      changes,
      confidence
    }
  }

  /**
   * Berechne Prompt-Score
   */
  calculatePromptScore(prompt: string): PromptScore {
    const words = prompt.split(/\s+/)
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim())

    // Klarheit: Durchschnittliche Satzlänge (optimal: 10-20 Wörter)
    const avgSentenceLength = words.length / sentences.length
    const clarity = Math.max(0, 100 - Math.abs(15 - avgSentenceLength) * 5)

    // Spezifität: Anteil spezifischer Begriffe
    const specificTerms = [
      "komponente", "funktion", "api", "button", "dialog", "page", "route",
      "component", "function", "table", "column", "migration", "test"
    ]
    const specificCount = specificTerms.filter(t =>
      prompt.toLowerCase().includes(t)
    ).length
    const specificity = Math.min(100, specificCount * 20)

    // Aktionierbarkeit: Hat Aktionsverben und Ziele
    const actionVerbs = ["erstelle", "implementiere", "fixe", "teste", "create", "implement", "fix", "test"]
    const hasAction = actionVerbs.some(v => prompt.toLowerCase().includes(v))
    const actionability = hasAction ? 80 : 30

    // Kontext-Reichhaltigkeit: MCP-Referenzen, Dateipfade, etc.
    const contextIndicators = [
      /project:\/\//g,
      /@\w+\.(?:md|ts|tsx)/g,
      /components\//g,
      /lib\//g,
      /app\//g
    ]
    const contextMatches = contextIndicators.reduce(
      (count, regex) => count + (prompt.match(regex)?.length || 0),
      0
    )
    const contextRichness = Math.min(100, contextMatches * 25)

    // Gesamtscore
    const overall = Math.round(
      (clarity + specificity + actionability + contextRichness) / 4
    )

    return {
      overall,
      clarity: Math.round(clarity),
      specificity: Math.round(specificity),
      actionability: Math.round(actionability),
      contextRichness: Math.round(contextRichness)
    }
  }

  /**
   * Generiere Lern-Empfehlungen
   */
  async generateRecommendations(): Promise<LearningRecommendation[]> {
    await this.initialize()

    const recommendations: LearningRecommendation[] = []

    // Analysiere jeden Task-Typ
    for (const [taskType, stats] of this.templateStats.entries()) {
      // Niedrige Erfolgsrate
      if (stats.successRate < 70 && stats.totalExecutions >= 5) {
        recommendations.push({
          type: "template",
          priority: "high",
          recommendation: `Template für "${taskType}" überarbeiten (Erfolgsrate: ${stats.successRate.toFixed(0)}%)`,
          basedOn: [`${stats.failureCount} fehlgeschlagene Ausführungen`]
        })
      }

      // Lange Durchschnittsdauer
      if (stats.averageDuration > 120000) { // > 2 Minuten
        recommendations.push({
          type: "execution",
          priority: "medium",
          recommendation: `Optimiere Ausführung für "${taskType}" (Durchschnitt: ${Math.round(stats.averageDuration / 1000)}s)`,
          basedOn: [`${stats.totalExecutions} Ausführungen analysiert`]
        })
      }

      // Wenig Kontext in erfolgreichen Prompts
      const successfulPrompts = await this.getSuccessfulTemplates(taskType)
      const avgContextScore = successfulPrompts.reduce((sum, exec) => {
        const score = this.calculatePromptScore(exec.optimizedPrompt)
        return sum + score.contextRichness
      }, 0) / (successfulPrompts.length || 1)

      if (avgContextScore < 50) {
        recommendations.push({
          type: "context",
          priority: "medium",
          recommendation: `Mehr Kontext in "${taskType}"-Prompts hinzufügen`,
          basedOn: [`Durchschnittlicher Kontext-Score: ${avgContextScore.toFixed(0)}%`]
        })
      }
    }

    // Allgemeine Empfehlungen
    if (this.history.length < 20) {
      recommendations.push({
        type: "pattern",
        priority: "low",
        recommendation: "Mehr Prompts ausführen um bessere Lernmuster zu entwickeln",
        basedOn: [`Nur ${this.history.length} Ausführungen in Historie`]
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * Exportiere Statistiken
   */
  async getStatistics(): Promise<{
    totalExecutions: number
    successRate: number
    averageDuration: number
    byTaskType: Record<TaskType, TemplateStats>
    topPatterns: string[]
  }> {
    await this.initialize()

    const totalExecutions = this.history.length
    const successCount = this.history.filter(e => e.success).length
    const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0
    const averageDuration = totalExecutions > 0
      ? this.history.reduce((sum, e) => sum + e.duration, 0) / totalExecutions
      : 0

    const byTaskType: Record<TaskType, TemplateStats> = {} as Record<TaskType, TemplateStats>
    for (const [taskType, stats] of this.templateStats.entries()) {
      byTaskType[taskType] = stats
    }

    // Top-Patterns über alle Task-Typen
    const allPatterns: Map<string, number> = new Map()
    for (const taskType of this.templateStats.keys()) {
      const patterns = await this.getBestPatterns(taskType)
      for (const pattern of patterns) {
        allPatterns.set(pattern, (allPatterns.get(pattern) || 0) + 1)
      }
    }
    const topPatterns = Array.from(allPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern)

    return {
      totalExecutions,
      successRate,
      averageDuration,
      byTaskType,
      topPatterns
    }
  }

  // === Private Methoden ===

  /**
   * Aktualisiere Template-Statistiken
   */
  private updateTemplateStats(): void {
    this.templateStats.clear()

    const taskTypes: TaskType[] = [
      "feature", "bugfix", "qa", "refactor", "migration",
      "documentation", "optimization", "unknown"
    ]

    for (const taskType of taskTypes) {
      const executions = this.history.filter(e => e.taskType === taskType)

      if (executions.length === 0) continue

      const successCount = executions.filter(e => e.success).length
      const totalDuration = executions.reduce((sum, e) => sum + e.duration, 0)

      this.templateStats.set(taskType, {
        taskType,
        totalExecutions: executions.length,
        successCount,
        failureCount: executions.length - successCount,
        successRate: (successCount / executions.length) * 100,
        averageDuration: totalDuration / executions.length,
        commonPatterns: [], // Wird bei Bedarf berechnet
        lastImprovement: new Date().toISOString()
      })
    }
  }

  /**
   * Finde gemeinsame Fehler
   */
  private findCommonErrors(failedExecutions: PromptExecution[]): string[] {
    const errorCounts: Map<string, number> = new Map()

    for (const exec of failedExecutions) {
      for (const error of exec.errors) {
        // Normalisiere Fehlermeldung
        const normalized = error.toLowerCase().replace(/\d+/g, "N")
        errorCounts.set(normalized, (errorCounts.get(normalized) || 0) + 1)
      }
    }

    return Array.from(errorCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error]) => error)
  }

  /**
   * Persistiere Historie
   */
  private async saveHistory(): Promise<void> {
    try {
      const data = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        history: this.history
      }
      await fs.writeFile(this.historyPath, JSON.stringify(data, null, 2))
    } catch (error) {
      await logError({
        type: "file-operation",
        message: `Fehler beim Speichern der Prompt-Historie: ${error}`,
        severity: "warning",
        component: "PromptLearningEngine",
        botId: "prompt-learning"
      })
    }
  }

  /**
   * Lösche Historie (für Tests)
   */
  async clearHistory(): Promise<void> {
    this.history = []
    this.templateStats.clear()
    try {
      await fs.unlink(this.historyPath)
    } catch {
      // Ignoriere wenn Datei nicht existiert
    }
  }
}

/**
 * Singleton-Export
 */
export const promptLearning = PromptLearningEngine.getInstance()

/**
 * Convenience-Funktionen
 */
export async function saveExecution(
  prompt: OptimizedPrompt,
  result: ExecutionResult
): Promise<void> {
  return promptLearning.savePromptExecution(prompt, result)
}

export async function getSuccessfulTemplates(
  taskType: TaskType
): Promise<PromptExecution[]> {
  return promptLearning.getSuccessfulTemplates(taskType)
}

export function calculatePromptScore(prompt: string): PromptScore {
  return promptLearning.calculatePromptScore(prompt)
}

export async function getRecommendations(): Promise<LearningRecommendation[]> {
  return promptLearning.generateRecommendations()
}

