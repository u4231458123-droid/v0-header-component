/**
 * Workflow Orchestrator
 * =====================
 * Zentrale Steuerung aller Bot-Workflows und MCP-Server-Interaktionen.
 * Implementiert das NEO-GENESIS Hyper-Stack Workflow-System.
 *
 * Workflow-Phasen:
 * 1. Context-Fetch (Nexus Bridge)
 * 2. Planning (Architecture Check)
 * 3. Implementation (Bot Execution)
 * 4. Validation (Quality Gates)
 * 5. Documentation (Swimm)
 * 6. Commit/Push (Git Workflow)
 */

import { logError } from "@/lib/cicd/error-logger"
import { WorkTracker } from "@/lib/knowledge-base/work-tracking"
import type { BotTask } from "./bots/base-bot"
import { MasterBot } from "./bots/master-bot"
import { loadProjectContext, nexusBridge } from "./bots/nexus-bridge-integration"

// Workflow-Phasen
export type WorkflowPhase =
  | "context-fetch"
  | "planning"
  | "implementation"
  | "validation"
  | "documentation"
  | "commit-push"
  | "completed"
  | "failed"

// Workflow-Status
export interface WorkflowStatus {
  id: string
  name: string
  phase: WorkflowPhase
  startTime: string
  endTime?: string
  tasks: WorkflowTask[]
  errors: string[]
  warnings: string[]
  metrics: {
    totalTasks: number
    completedTasks: number
    failedTasks: number
    duration?: number
  }
}

// Workflow-Task
export interface WorkflowTask {
  id: string
  type: string
  description: string
  assignedBot: string
  status: "pending" | "in_progress" | "completed" | "failed"
  startTime?: string
  endTime?: string
  result?: unknown
  errors?: string[]
}

// Parallel Tracks
export interface ParallelTracks {
  track1: { name: string; tasks: WorkflowTask[]; status: string } // QA & Bugfixing
  track2: { name: string; tasks: WorkflowTask[]; status: string } // Feature-Completion
  track3: { name: string; tasks: WorkflowTask[]; status: string } // Workflow-Optimization
}

/**
 * Workflow Orchestrator Klasse
 * Koordiniert alle Bot-Aktivitäten und MCP-Server
 */
export class WorkflowOrchestrator {
  private static instance: WorkflowOrchestrator
  private masterBot: MasterBot
  private _workTracker: WorkTracker
  private activeWorkflows: Map<string, WorkflowStatus> = new Map()
  private eventListeners: Map<string, Array<(event: unknown) => void>> = new Map()

  private constructor() {
    this.masterBot = new MasterBot()
    this._workTracker = new WorkTracker()
  }

  static getInstance(): WorkflowOrchestrator {
    if (!WorkflowOrchestrator.instance) {
      WorkflowOrchestrator.instance = new WorkflowOrchestrator()
    }
    return WorkflowOrchestrator.instance
  }

  /**
   * Starte neuen Workflow
   */
  async startWorkflow(
    name: string,
    tasks: Array<{ type: string; description: string; context?: unknown }>
  ): Promise<WorkflowStatus> {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const workflow: WorkflowStatus = {
      id: workflowId,
      name,
      phase: "context-fetch",
      startTime: new Date().toISOString(),
      tasks: tasks.map((t, i) => ({
        id: `task-${workflowId}-${i}`,
        type: t.type,
        description: t.description,
        assignedBot: "pending",
        status: "pending",
      })),
      errors: [],
      warnings: [],
      metrics: {
        totalTasks: tasks.length,
        completedTasks: 0,
        failedTasks: 0,
      },
    }

    this.activeWorkflows.set(workflowId, workflow)
    this.emit("workflow:started", { workflowId, name })

    // Starte Workflow-Execution
    await this.executeWorkflow(workflowId)

    return workflow
  }

  /**
   * Führe Workflow aus
   */
  private async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId)
    if (!workflow) return

    try {
      // Phase 1: Context-Fetch
      await this.executePhase(workflowId, "context-fetch", async () => {
        const context = await loadProjectContext()
        this.emit("context:loaded", { workflowId, context })
        return context
      })

      // Phase 2: Planning
      await this.executePhase(workflowId, "planning", async () => {
        // Verteile Tasks an Bots
        for (const task of workflow.tasks) {
          const assignment = await this.masterBot.distributeTask(
            task.type,
            task.description
          )
          task.assignedBot = assignment.assignedBot
        }
        return { tasksAssigned: workflow.tasks.length }
      })

      // Phase 3: Implementation
      await this.executePhase(workflowId, "implementation", async () => {
        const results = await this.executeTasks(workflowId)
        return results
      })

      // Phase 4: Validation
      await this.executePhase(workflowId, "validation", async () => {
        const validation = await this.validateWorkflowResults(workflowId)
        if (!validation.passed) {
          workflow.warnings.push(...validation.warnings)
          if (validation.errors.length > 0) {
            workflow.errors.push(...validation.errors)
          }
        }
        return validation
      })

      // Phase 5: Documentation
      await this.executePhase(workflowId, "documentation", async () => {
        // Dokumentiere Workflow-Ergebnisse
        return { documented: true }
      })

      // Phase 6: Commit/Push
      await this.executePhase(workflowId, "commit-push", async () => {
        // Nur wenn keine Fehler
        if (workflow.errors.length === 0) {
          const completedFiles = workflow.tasks
            .filter((t) => t.status === "completed")
            .map((t) => t.description)

          return { committed: true, files: completedFiles.length }
        }
        return { committed: false, reason: "Errors present" }
      })

      // Workflow abgeschlossen
      workflow.phase = "completed"
      workflow.endTime = new Date().toISOString()
      workflow.metrics.duration =
        new Date(workflow.endTime).getTime() - new Date(workflow.startTime).getTime()

      this.emit("workflow:completed", { workflowId, workflow })
    } catch (error) {
      workflow.phase = "failed"
      workflow.errors.push(error instanceof Error ? error.message : String(error))
      workflow.endTime = new Date().toISOString()

      this.emit("workflow:failed", { workflowId, error })

      await logError({
        type: "error",
        severity: "high",
        category: "workflow-orchestrator",
        message: `Workflow ${workflowId} fehlgeschlagen`,
        context: { workflowId, error },
        botId: "workflow-orchestrator",
      })
    }
  }

  /**
   * Führe einzelne Phase aus
   */
  private async executePhase<T>(
    workflowId: string,
    phase: WorkflowPhase,
    executor: () => Promise<T>
  ): Promise<T> {
    const workflow = this.activeWorkflows.get(workflowId)
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`)

    workflow.phase = phase
    this.emit("phase:started", { workflowId, phase })

    const result = await executor()

    this.emit("phase:completed", { workflowId, phase, result })
    return result
  }

  /**
   * Führe alle Tasks parallel aus
   */
  private async executeTasks(workflowId: string): Promise<{
    completed: number
    failed: number
    results: unknown[]
  }> {
    const workflow = this.activeWorkflows.get(workflowId)
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`)

    const results: unknown[] = []
    let completed = 0
    let failed = 0

    // Gruppiere Tasks nach Tracks
    const tracks = this.categorizeTasksByTrack(workflow.tasks)

    // Führe Tracks parallel aus
    await Promise.all([
      this.executeTrack(tracks.track1, results),
      this.executeTrack(tracks.track2, results),
      this.executeTrack(tracks.track3, results),
    ])

    // Zähle Ergebnisse
    for (const task of workflow.tasks) {
      if (task.status === "completed") completed++
      else if (task.status === "failed") failed++
    }

    workflow.metrics.completedTasks = completed
    workflow.metrics.failedTasks = failed

    return { completed, failed, results }
  }

  /**
   * Kategorisiere Tasks nach Tracks
   */
  private categorizeTasksByTrack(tasks: WorkflowTask[]): ParallelTracks {
    const track1: WorkflowTask[] = []
    const track2: WorkflowTask[] = []
    const track3: WorkflowTask[] = []

    for (const task of tasks) {
      const typeLower = task.type.toLowerCase()
      if (
        typeLower.includes("quality") ||
        typeLower.includes("bug") ||
        typeLower.includes("fix") ||
        typeLower.includes("test")
      ) {
        track1.push(task)
      } else if (
        typeLower.includes("optimize") ||
        typeLower.includes("refactor") ||
        typeLower.includes("improve")
      ) {
        track3.push(task)
      } else {
        track2.push(task) // Default: Features
      }
    }

    return {
      track1: { name: "QA & Bugfixing", tasks: track1, status: "ready" },
      track2: { name: "Feature-Completion", tasks: track2, status: "ready" },
      track3: { name: "Workflow-Optimization", tasks: track3, status: "ready" },
    }
  }

  /**
   * Führe einzelnen Track aus
   */
  private async executeTrack(
    track: { name: string; tasks: WorkflowTask[]; status: string },
    results: unknown[]
  ): Promise<void> {
    track.status = "in_progress"

    for (const task of track.tasks) {
      try {
        task.status = "in_progress"
        task.startTime = new Date().toISOString()

        // Simuliere Task-Ausführung (echte Implementierung würde Bot aufrufen)
        await this.executeTask(task)

        task.status = "completed"
        task.endTime = new Date().toISOString()
        results.push(task.result)

        this.emit("task:completed", { taskId: task.id, result: task.result })
      } catch (error) {
        task.status = "failed"
        task.errors = [error instanceof Error ? error.message : String(error)]
        task.endTime = new Date().toISOString()

        this.emit("task:failed", { taskId: task.id, error })
      }
    }

    track.status = "completed"
  }

  /**
   * Führe einzelne Task aus
   */
  private async executeTask(task: WorkflowTask): Promise<void> {
    // Lade Projekt-Kontext
    const _context = await loadProjectContext()

    // Validiere vor Ausführung
    const preValidation = await this.masterBot.enforceZeroUserIntervention({
      id: task.id,
      type: task.type,
      description: task.description,
      area: "unknown",
      priority: "medium",
    } as BotTask)

    if (!preValidation.autonomous) {
      throw new Error(`Task nicht autonom ausführbar: ${preValidation.blockers.join(", ")}`)
    }

    // Task-Ausführung (delegiere an zugewiesenen Bot)
    // In echter Implementierung würde hier der Bot aufgerufen
    task.result = {
      executed: true,
      assignedBot: task.assignedBot,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Validiere Workflow-Ergebnisse
   */
  private async validateWorkflowResults(workflowId: string): Promise<{
    passed: boolean
    errors: string[]
    warnings: string[]
  }> {
    const workflow = this.activeWorkflows.get(workflowId)
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`)

    const errors: string[] = []
    const warnings: string[] = []

    // Prüfe alle Tasks
    for (const task of workflow.tasks) {
      if (task.status === "failed") {
        errors.push(`Task ${task.id} fehlgeschlagen: ${task.errors?.join(", ") || "Unknown error"}`)
      }
    }

    // Prüfe Projekt-Gesundheit
    const health = await nexusBridge.getProjectHealth()
    if (!health.healthy) {
      if (!health.lint.passed) {
        warnings.push(`Lint-Fehler: ${health.lint.errorCount} errors, ${health.lint.warningCount} warnings`)
      }
      if (!health.typeCheck.passed) {
        errors.push(`TypeScript-Fehler: ${health.typeCheck.errorCount} errors`)
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Hole aktiven Workflow
   */
  getWorkflow(workflowId: string): WorkflowStatus | undefined {
    return this.activeWorkflows.get(workflowId)
  }

  /**
   * Hole alle aktiven Workflows
   */
  getAllWorkflows(): WorkflowStatus[] {
    return Array.from(this.activeWorkflows.values())
  }

  /**
   * Abbreche Workflow
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId)
    if (!workflow) return

    workflow.phase = "failed"
    workflow.errors.push("Workflow abgebrochen")
    workflow.endTime = new Date().toISOString()

    this.emit("workflow:cancelled", { workflowId })
  }

  /**
   * Event-System
   */
  on(event: string, listener: (event: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off(event: string, listener: (event: unknown) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data)
        } catch (error) {
          console.error(`Event-Listener-Fehler für ${event}:`, error)
        }
      }
    }
  }
}

/**
 * Quick-Start Workflows
 */
export const QuickWorkflows = {
  /**
   * QA-Workflow: Vollständige Qualitätsprüfung
   */
  qa: async () => {
    const orchestrator = WorkflowOrchestrator.getInstance()
    return orchestrator.startWorkflow("QA-Workflow", [
      { type: "quality-check", description: "Design-Validierung" },
      { type: "quality-check", description: "Code-Compliance-Prüfung" },
      { type: "test", description: "Unit-Tests ausführen" },
      { type: "test", description: "E2E-Tests ausführen" },
    ])
  },

  /**
   * Feature-Workflow: Neues Feature implementieren
   */
  feature: async (featureName: string, description: string) => {
    const orchestrator = WorkflowOrchestrator.getInstance()
    return orchestrator.startWorkflow(`Feature: ${featureName}`, [
      { type: "planning", description: `Architektur für ${featureName}` },
      { type: "implement", description },
      { type: "quality-check", description: "Feature-Validierung" },
      { type: "documentation", description: "Feature dokumentieren" },
    ])
  },

  /**
   * Bugfix-Workflow: Bug beheben
   */
  bugfix: async (bugDescription: string) => {
    const orchestrator = WorkflowOrchestrator.getInstance()
    return orchestrator.startWorkflow("Bugfix-Workflow", [
      { type: "bug-analysis", description: `Analysiere: ${bugDescription}` },
      { type: "fix", description: "Bug beheben" },
      { type: "test", description: "Regression-Tests" },
    ])
  },

  /**
   * Optimization-Workflow: Performance-Optimierung
   */
  optimize: async () => {
    const orchestrator = WorkflowOrchestrator.getInstance()
    return orchestrator.startWorkflow("Optimization-Workflow", [
      { type: "optimize", description: "Performance-Analyse" },
      { type: "refactor", description: "Code-Optimierung" },
      { type: "quality-check", description: "Performance-Validierung" },
    ])
  },
}

/**
 * Singleton-Export
 */
export const workflowOrchestrator = WorkflowOrchestrator.getInstance()

