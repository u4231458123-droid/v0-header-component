/**
 * Zentrale Error-Logging-Funktionalität
 * =====================================
 * Speichert alle Fehler persistent für Analyse und Prävention
 */

import { promises as fs } from "fs"
import path from "path"

export interface ErrorLogEntry {
  id: string
  timestamp: string
  type: "error" | "violation" | "bug" | "warning" | "change-request" | "task-assignment" | "optimization" | "recovery" | "health-check" | "autonomous-loop" | "gap-analysis" | "git-protocol" | "terminal-error" | "vorgabe-correction-request" | "type" | "other" | "design" | "logic" | "security" | "performance" | "runtime" | "syntax" | "build-error" | "runtime-error" | "test-failure" | "systemwide-change-created"
  severity: "critical" | "high" | "medium" | "low"
  category: string
  message: string
  filePath?: string
  line?: number
  context?: any
  solution?: string
  botId?: string
  taskId?: string
}

const ERROR_LOG_DIR = path.join(process.cwd(), ".cicd")
const ERROR_LOG_FILE = path.join(ERROR_LOG_DIR, "error-log.json")

/**
 * Lade Error-Log
 */
async function loadErrorLog(): Promise<ErrorLogEntry[]> {
  try {
    await fs.mkdir(ERROR_LOG_DIR, { recursive: true })
    const content = await fs.readFile(ERROR_LOG_FILE, "utf-8")
    return JSON.parse(content)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return []
    }
    console.error("Fehler beim Laden des Error-Logs:", error)
    return []
  }
}

/**
 * Speichere Error-Log
 */
async function saveErrorLog(entries: ErrorLogEntry[]): Promise<void> {
  try {
    await fs.mkdir(ERROR_LOG_DIR, { recursive: true })
    await fs.writeFile(ERROR_LOG_FILE, JSON.stringify(entries, null, 2), "utf-8")
  } catch (error) {
    console.error("Fehler beim Speichern des Error-Logs:", error)
  }
}

/**
 * Logge einen Fehler
 */
export async function logError(entry: Omit<ErrorLogEntry, "id" | "timestamp">): Promise<void> {
  const entries = await loadErrorLog()
  
  const newEntry: ErrorLogEntry = {
    ...entry,
    id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString(),
  }
  
  entries.push(newEntry)
  
  // Behalte nur die letzten 1000 Einträge
  if (entries.length > 1000) {
    entries.splice(0, entries.length - 1000)
  }
  
  await saveErrorLog(entries)
  console.log(`[Error-Logger] Fehler geloggt: ${entry.type} - ${entry.message}`)
}

/**
 * Hole Fehler nach Kriterien
 */
export async function getErrors(filters?: {
  type?: ErrorLogEntry["type"]
  severity?: ErrorLogEntry["severity"]
  category?: string
  filePath?: string
  since?: Date
}): Promise<ErrorLogEntry[]> {
  const entries = await loadErrorLog()
  
  return entries.filter((entry) => {
    if (filters?.type && entry.type !== filters.type) return false
    if (filters?.severity && entry.severity !== filters.severity) return false
    if (filters?.category && entry.category !== filters.category) return false
    if (filters?.filePath && entry.filePath !== filters.filePath) return false
    if (filters?.since) {
      const entryDate = new Date(entry.timestamp)
      if (entryDate < filters.since) return false
    }
    return true
  })
}

/**
 * Analysiere Fehler-Patterns
 */
export async function analyzeErrorPatterns(): Promise<{
  mostCommonTypes: Array<{ type: string; count: number }>
  mostCommonCategories: Array<{ category: string; count: number }>
  mostCommonFiles: Array<{ filePath: string; count: number }>
  criticalErrors: number
  recentErrors: number
}> {
  const entries = await loadErrorLog()
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const typeCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  const fileCounts: Record<string, number> = {}
  let criticalCount = 0
  let recentCount = 0
  
  for (const entry of entries) {
    typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1
    if (entry.filePath) {
      fileCounts[entry.filePath] = (fileCounts[entry.filePath] || 0) + 1
    }
    if (entry.severity === "critical") criticalCount++
    if (new Date(entry.timestamp) > last24Hours) recentCount++
  }
  
  return {
    mostCommonTypes: Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    mostCommonCategories: Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    mostCommonFiles: Object.entries(fileCounts)
      .map(([filePath, count]) => ({ filePath, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    criticalErrors: criticalCount,
    recentErrors: recentCount,
  }
}

