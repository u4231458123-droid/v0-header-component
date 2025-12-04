/**
 * ERROR-LEARNING-SYSTEM
 * =====================
 * Speichert alle erkannten Fehler-Patterns
 * Lernt aus vergangenen Fehlern
 * Verhindert Wiederholung bekannter Fehler
 * Automatische Korrekturvorschlaege
 */

import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/cicd/error-logger"

export interface ErrorPattern {
  id: string
  type: "typescript" | "linter" | "design" | "logic" | "performance" | "security" | "other"
  severity: "critical" | "high" | "medium" | "low"
  pattern: string // Regex oder Code-Pattern
  message: string
  filePath?: string
  lineNumber?: number
  context?: string
  fix?: string // Automatischer Fix-Vorschlag
  occurrences: number
  firstSeen: Date
  lastSeen: Date
  fixed: boolean
  fixDate?: Date
}

export interface ErrorLearning {
  learnError(error: ErrorPattern): Promise<void>
  findSimilarErrors(error: Partial<ErrorPattern>): Promise<ErrorPattern[]>
  getFixSuggestion(error: ErrorPattern): Promise<string | null>
  markAsFixed(errorId: string): Promise<void>
  getAllErrors(): Promise<ErrorPattern[]>
  getUnfixedErrors(): Promise<ErrorPattern[]>
}

class ErrorLearningSystem implements ErrorLearning {
  private errorPatterns: Map<string, ErrorPattern> = new Map()
  private supabase: any = null

  constructor() {
    this.initializeSupabase()
  }

  private async initializeSupabase() {
    try {
      this.supabase = await createClient()
    } catch (error) {
      console.warn("[ErrorLearning] Supabase nicht verfügbar, verwende In-Memory-Speicher")
    }
  }

  /**
   * Lerne aus einem neuen Fehler
   */
  async learnError(error: ErrorPattern): Promise<void> {
    try {
      // Prüfe ob ähnlicher Fehler bereits existiert
      const existing = await this.findSimilarErrors(error)

      if (existing.length > 0) {
        // Erhöhe Occurrences
        const similar = existing[0]
        similar.occurrences += 1
        similar.lastSeen = new Date()
        this.errorPatterns.set(similar.id, similar)

        // Speichere in Supabase (falls verfügbar)
        if (this.supabase) {
          await this.supabase
            .from("error_patterns")
            .update({
              occurrences: similar.occurrences,
              last_seen: new Date().toISOString(),
            })
            .eq("id", similar.id)
        }

        // Logge Fehler
        await logError({
          message: `Wiederholter Fehler: ${error.message}`,
          context: error.context || "",
          filePath: error.filePath || "",
          lineNumber: error.lineNumber,
          severity: error.severity,
        })
      } else {
        // Neuer Fehler
        error.firstSeen = new Date()
        error.lastSeen = new Date()
        error.occurrences = 1
        error.fixed = false
        this.errorPatterns.set(error.id, error)

        // Speichere in Supabase (falls verfügbar)
        if (this.supabase) {
          await this.supabase.from("error_patterns").insert({
            id: error.id,
            type: error.type,
            severity: error.severity,
            pattern: error.pattern,
            message: error.message,
            file_path: error.filePath,
            line_number: error.lineNumber,
            context: error.context,
            fix: error.fix,
            occurrences: error.occurrences,
            first_seen: error.firstSeen.toISOString(),
            last_seen: error.lastSeen.toISOString(),
            fixed: error.fixed,
          })
        }

        // Logge Fehler
        await logError({
          message: `Neuer Fehler erkannt: ${error.message}`,
          context: error.context || "",
          filePath: error.filePath || "",
          lineNumber: error.lineNumber,
          severity: error.severity,
        })
      }
    } catch (error: any) {
      console.error("[ErrorLearning] Fehler beim Lernen:", error)
    }
  }

  /**
   * Finde ähnliche Fehler
   */
  async findSimilarErrors(error: Partial<ErrorPattern>): Promise<ErrorPattern[]> {
    const similar: ErrorPattern[] = []

    for (const [id, pattern] of this.errorPatterns.entries()) {
      // Prüfe Typ und Severity
      if (error.type && pattern.type !== error.type) continue
      if (error.severity && pattern.severity !== error.severity) continue

      // Prüfe Pattern-Ähnlichkeit
      if (error.pattern && pattern.pattern) {
        // Einfache String-Ähnlichkeit
        const similarity = this.calculateSimilarity(error.pattern, pattern.pattern)
        if (similarity > 0.7) {
          similar.push(pattern)
        }
      }

      // Prüfe Message-Ähnlichkeit
      if (error.message && pattern.message) {
        const similarity = this.calculateSimilarity(error.message, pattern.message)
        if (similarity > 0.8) {
          similar.push(pattern)
        }
      }

      // Prüfe FilePath
      if (error.filePath && pattern.filePath && error.filePath === pattern.filePath) {
        similar.push(pattern)
      }
    }

    // Lade aus Supabase (falls verfügbar)
    if (this.supabase && similar.length === 0) {
      try {
        let query = this.supabase.from("error_patterns").select("*").eq("fixed", false)

        if (error.type) query = query.eq("type", error.type)
        if (error.severity) query = query.eq("severity", error.severity)
        if (error.filePath) query = query.eq("file_path", error.filePath)

        const { data } = await query.limit(10)

        if (data) {
          for (const row of data) {
            similar.push({
              id: row.id,
              type: row.type,
              severity: row.severity,
              pattern: row.pattern,
              message: row.message,
              filePath: row.file_path,
              lineNumber: row.line_number,
              context: row.context,
              fix: row.fix,
              occurrences: row.occurrences,
              firstSeen: new Date(row.first_seen),
              lastSeen: new Date(row.last_seen),
              fixed: row.fixed,
              fixDate: row.fix_date ? new Date(row.fix_date) : undefined,
            })
          }
        }
      } catch (error: any) {
        console.warn("[ErrorLearning] Fehler beim Laden aus Supabase:", error)
      }
    }

    return similar.sort((a, b) => b.occurrences - a.occurrences)
  }

  /**
   * Berechne Ähnlichkeit zwischen zwei Strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Levenshtein-Distanz
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Hole Fix-Vorschlag für einen Fehler
   */
  async getFixSuggestion(error: ErrorPattern): Promise<string | null> {
    // Prüfe ob Fix bereits vorhanden
    if (error.fix) {
      return error.fix
    }

    // Finde ähnliche Fehler mit Fix
    const similar = await this.findSimilarErrors(error)
    for (const similarError of similar) {
      if (similarError.fix && similarError.fixed) {
        return similarError.fix
      }
    }

    // Generiere automatischen Fix basierend auf Typ
    return this.generateAutomaticFix(error)
  }

  /**
   * Generiere automatischen Fix
   */
  private generateAutomaticFix(error: ErrorPattern): string | null {
    switch (error.type) {
      case "typescript":
        if (error.message.includes("implicitly has an 'any' type")) {
          // Extrahiere Parameter-Name
          const match = error.message.match(/Parameter '(\w+)'/)
          if (match) {
            const paramName = match[1]
            return `Füge expliziten Typ hinzu: ${paramName}: type`
          }
        }
        break

      case "linter":
        if (error.message.includes("unused")) {
          return "Entferne ungenutzte Variable oder verwende sie"
        }
        break

      case "design":
        if (error.message.includes("hardcoded color")) {
          return "Ersetze hardcoded Farbe durch Design-Token"
        }
        break
    }

    return null
  }

  /**
   * Markiere Fehler als behoben
   */
  async markAsFixed(errorId: string): Promise<void> {
    const error = this.errorPatterns.get(errorId)
    if (error) {
      error.fixed = true
      error.fixDate = new Date()
      this.errorPatterns.set(errorId, error)

      // Speichere in Supabase
      if (this.supabase) {
        await this.supabase
          .from("error_patterns")
          .update({
            fixed: true,
            fix_date: new Date().toISOString(),
          })
          .eq("id", errorId)
      }
    }
  }

  /**
   * Hole alle Fehler
   */
  async getAllErrors(): Promise<ErrorPattern[]> {
    const errors: ErrorPattern[] = []

    // Lade aus Memory
    for (const error of this.errorPatterns.values()) {
      errors.push(error)
    }

    // Lade aus Supabase (falls verfügbar)
    if (this.supabase) {
      try {
        const { data } = await this.supabase.from("error_patterns").select("*").order("last_seen", { ascending: false })

        if (data) {
          for (const row of data) {
            const error: ErrorPattern = {
              id: row.id,
              type: row.type,
              severity: row.severity,
              pattern: row.pattern,
              message: row.message,
              filePath: row.file_path,
              lineNumber: row.line_number,
              context: row.context,
              fix: row.fix,
              occurrences: row.occurrences,
              firstSeen: new Date(row.first_seen),
              lastSeen: new Date(row.last_seen),
              fixed: row.fixed,
              fixDate: row.fix_date ? new Date(row.fix_date) : undefined,
            }

            // Aktualisiere Memory
            this.errorPatterns.set(error.id, error)
            errors.push(error)
          }
        }
      } catch (error: any) {
        console.warn("[ErrorLearning] Fehler beim Laden aus Supabase:", error)
      }
    }

    return errors
  }

  /**
   * Hole alle nicht behobenen Fehler
   */
  async getUnfixedErrors(): Promise<ErrorPattern[]> {
    const allErrors = await this.getAllErrors()
    return allErrors.filter((error) => !error.fixed)
  }
}

// Singleton-Instanz
let errorLearningInstance: ErrorLearningSystem | null = null

export function getErrorLearningSystem(): ErrorLearningSystem {
  if (!errorLearningInstance) {
    errorLearningInstance = new ErrorLearningSystem()
  }
  return errorLearningInstance
}

// Export für einfache Verwendung
export const errorLearning = getErrorLearningSystem()

