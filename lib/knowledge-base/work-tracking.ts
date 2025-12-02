/**
 * WORK-TRACKING SYSTEM
 * ===================
 * Dokumentiert jede ausgeführte Arbeit, jeden Fehler und jede Lösung
 * Status-Tracking: "In Bearbeitung" → "Abgeschlossen" oder anderer Status
 */

import { promises as fs } from "fs"
import path from "path"
import type { KnowledgeEntry } from "./structure"

export interface WorkEntry {
  id: string
  timestamp: string
  type: "work" | "error" | "fix" | "optimization" | "feature" | "other"
  title: string
  description: string
  status: "in-progress" | "completed" | "failed" | "cancelled" | "on-hold"
  statusReason?: string
  botId?: string
  filePath?: string
  changes?: string[]
  errors?: Array<{
    message: string
    solution: string
    timestamp: string
  }>
  solutions?: Array<{
    description: string
    implementation: string
    timestamp: string
  }>
  knowledgeEntries?: string[] // IDs von Knowledge-Entries, die erstellt/aktualisiert wurden
  relatedWork?: string[] // IDs von verwandten Work-Entries
  impact?: {
    affectedFiles: string[]
    affectedBots: string[]
    systemwide: boolean
  }
  qualityCheck?: {
    passed: boolean
    violations: string[]
    timestamp: string
  }
}

export class WorkTracker {
  private workLogPath: string
  private knowledgeBasePath: string

  constructor() {
    this.workLogPath = path.join(process.cwd(), ".cicd", "work-log.json")
    this.knowledgeBasePath = path.join(process.cwd(), ".cicd", "knowledge-updates.json")
  }

  /**
   * Erstelle neuen Work-Entry (Status: "in-progress")
   */
  async startWork(work: Omit<WorkEntry, "id" | "timestamp" | "status">): Promise<WorkEntry> {
    const workEntry: WorkEntry = {
      ...work,
      id: `work-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: "in-progress",
    }

    await this.saveWorkEntry(workEntry)
    await this.updateKnowledgeBase("work-started", workEntry)
    
    console.log(`📝 Work gestartet: ${workEntry.title} (${workEntry.id})`)
    return workEntry
  }

  /**
   * Aktualisiere Work-Entry Status
   */
  async updateWorkStatus(
    workId: string,
    status: WorkEntry["status"],
    reason?: string,
    changes?: string[],
    errors?: WorkEntry["errors"],
    solutions?: WorkEntry["solutions"]
  ): Promise<WorkEntry | null> {
    const workEntry = await this.loadWorkEntry(workId)
    if (!workEntry) {
      console.error(`Work-Entry ${workId} nicht gefunden`)
      return null
    }

    workEntry.status = status
    workEntry.statusReason = reason
    if (changes) workEntry.changes = [...(workEntry.changes || []), ...changes]
    if (errors) workEntry.errors = [...(workEntry.errors || []), ...errors]
    if (solutions) workEntry.solutions = [...(workEntry.solutions || []), ...solutions]

    await this.saveWorkEntry(workEntry)
    await this.updateKnowledgeBase("work-updated", workEntry)
    
    console.log(`📝 Work-Status aktualisiert: ${workEntry.title} → ${status}`)
    return workEntry
  }

  /**
   * Dokumentiere Fehler und Lösung
   */
  async logErrorAndSolution(
    workId: string,
    error: { message: string; solution: string }
  ): Promise<void> {
    const workEntry = await this.loadWorkEntry(workId)
    if (!workEntry) {
      console.error(`Work-Entry ${workId} nicht gefunden`)
      return
    }

    if (!workEntry.errors) workEntry.errors = []
    if (!workEntry.solutions) workEntry.solutions = []

    workEntry.errors.push({
      message: error.message,
      solution: error.solution,
      timestamp: new Date().toISOString(),
    })

    workEntry.solutions.push({
      description: error.solution,
      implementation: error.solution,
      timestamp: new Date().toISOString(),
    })

    await this.saveWorkEntry(workEntry)
    await this.updateKnowledgeBase("error-solution-logged", workEntry)
    
    console.log(`📝 Fehler und Lösung dokumentiert für: ${workEntry.title}`)
  }

  /**
   * Markiere Work als abgeschlossen
   */
  async completeWork(
    workId: string,
    qualityCheck?: { passed: boolean; violations: string[] }
  ): Promise<WorkEntry | null> {
    return await this.updateWorkStatus(
      workId,
      "completed",
      "Work erfolgreich abgeschlossen",
      undefined,
      undefined,
      undefined
    )
  }

  /**
   * Lade Work-Entry
   */
  private async loadWorkEntry(workId: string): Promise<WorkEntry | null> {
    const allWork = await this.loadAllWork()
    return allWork.find((w) => w.id === workId) || null
  }

  /**
   * Lade alle Work-Entries
   */
  async loadAllWork(): Promise<WorkEntry[]> {
    try {
      await fs.mkdir(path.dirname(this.workLogPath), { recursive: true })
      const content = await fs.readFile(this.workLogPath, "utf-8")
      return JSON.parse(content)
    } catch (error: any) {
      if (error.code === "ENOENT") return []
      console.error("Fehler beim Laden des Work-Logs:", error)
      return []
    }
  }

  /**
   * Speichere Work-Entry
   */
  private async saveWorkEntry(work: WorkEntry): Promise<void> {
    const allWork = await this.loadAllWork()
    const index = allWork.findIndex((w) => w.id === work.id)
    if (index > -1) {
      allWork[index] = work
    } else {
      allWork.push(work)
    }
    await fs.writeFile(this.workLogPath, JSON.stringify(allWork, null, 2), "utf-8")
  }

  /**
   * Aktualisiere Knowledge-Base mit Work-Informationen
   */
  private async updateKnowledgeBase(action: string, work: WorkEntry): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.knowledgeBasePath), { recursive: true })
      let updates: any[] = []
      try {
        const content = await fs.readFile(this.knowledgeBasePath, "utf-8")
        updates = JSON.parse(content)
      } catch {
        updates = []
      }

      updates.push({
        timestamp: new Date().toISOString(),
        action,
        workId: work.id,
        workTitle: work.title,
        workType: work.type,
        status: work.status,
      })

      await fs.writeFile(this.knowledgeBasePath, JSON.stringify(updates, null, 2), "utf-8")
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Knowledge-Base:", error)
    }
  }

  /**
   * Erstelle Knowledge-Entry aus abgeschlossener Arbeit
   */
  async createKnowledgeEntryFromWork(workId: string): Promise<KnowledgeEntry | null> {
    const work = await this.loadWorkEntry(workId)
    if (!work || work.status !== "completed") {
      return null
    }

    const knowledgeEntry: KnowledgeEntry = {
      id: `work-knowledge-${work.id}`,
      category: "best-practices",
      title: `Work: ${work.title}`,
      content: `
# ${work.title}

## Beschreibung
${work.description}

## Status
${work.status}${work.statusReason ? ` - ${work.statusReason}` : ""}

## Durchgeführte Änderungen
${work.changes?.map((c) => `- ${c}`).join("\n") || "Keine Änderungen dokumentiert"}

## Fehler und Lösungen
${work.errors?.map((e) => `
### Fehler
${e.message}

### Lösung
${e.solution}
`).join("\n") || "Keine Fehler dokumentiert"}

## Lösungen
${work.solutions?.map((s) => `- ${s.description}`).join("\n") || "Keine Lösungen dokumentiert"}

## Impact
- Betroffene Dateien: ${work.impact?.affectedFiles.join(", ") || "Keine"}
- Betroffene Bots: ${work.impact?.affectedBots.join(", ") || "Keine"}
- Systemweite Auswirkungen: ${work.impact?.systemwide ? "Ja" : "Nein"}

## Quality-Check
${work.qualityCheck?.passed ? "✅ Bestanden" : "❌ Nicht bestanden"}
${work.qualityCheck?.violations.length ? `\nVerstöße: ${work.qualityCheck.violations.join(", ")}` : ""}
`,
      tags: ["work-tracking", work.type, work.status],
      relatedEntries: work.knowledgeEntries || [],
      version: "1.0.0",
      lastUpdated: work.timestamp,
      priority: work.impact?.systemwide ? "high" : "medium",
    }

    return knowledgeEntry
  }

  /**
   * Lade aktuelle Arbeiten für Bot
   */
  async getCurrentWorkForBot(botId: string): Promise<WorkEntry[]> {
    const allWork = await this.loadAllWork()
    return allWork.filter(
      (w) => w.botId === botId && (w.status === "in-progress" || w.status === "on-hold")
    )
  }

  /**
   * Lade alle Fehler und Lösungen
   */
  async getAllErrorsAndSolutions(): Promise<Array<{ work: WorkEntry; error: WorkEntry["errors"][0]; solution: WorkEntry["solutions"][0] }>> {
    const allWork = await this.loadAllWork()
    const result: Array<{ work: WorkEntry; error: WorkEntry["errors"][0]; solution: WorkEntry["solutions"][0] }> = []

    for (const work of allWork) {
      if (work.errors && work.solutions) {
        for (let i = 0; i < Math.min(work.errors.length, work.solutions.length); i++) {
          result.push({
            work,
            error: work.errors[i],
            solution: work.solutions[i],
          })
        }
      }
    }

    return result
  }
}

