/**
 * FEHLERERKENNUNGSSYSTEM (WATCHDOG)
 * ==================================
 * Erkennt Fehler sofort und zuverlässig
 * Bots können direkt prüfen und beheben
 */

import { promises as fs } from "fs"
import path from "path"
import { logError, getErrors, analyzeErrorPatterns } from "./error-logger"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export interface DetectedError {
  id: string
  timestamp: string
  type: "syntax" | "type" | "runtime" | "design" | "logic" | "performance" | "security" | "other"
  severity: "critical" | "high" | "medium" | "low"
  filePath?: string
  line?: number
  message: string
  code?: string
  context?: any
  autoFixable: boolean
  suggestedFix?: string
}

export interface ErrorDetectionResult {
  errors: DetectedError[]
  summary: {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    autoFixable: number
  }
}

export class ErrorDetector {
  private watchPaths: string[]
  private detectionInterval: number = 30000 // 30 Sekunden
  private isWatching: boolean = false

  constructor(watchPaths: string[] = []) {
    this.watchPaths = watchPaths.length > 0 ? watchPaths : ["app", "lib", "components"]
  }

  /**
   * Starte kontinuierliche Fehlererkennung
   */
  async startWatching(): Promise<void> {
    if (this.isWatching) {
      console.warn("Error Detector läuft bereits")
      return
    }

    this.isWatching = true
    console.log("🔍 Error Detector gestartet...")

    // Sofortige erste Prüfung
    await this.detectErrors()

    // Kontinuierliche Prüfung
    setInterval(async () => {
      if (this.isWatching) {
        await this.detectErrors()
      }
    }, this.detectionInterval)
  }

  /**
   * Stoppe Fehlererkennung
   */
  stopWatching(): void {
    this.isWatching = false
    console.log("🔍 Error Detector gestoppt")
  }

  /**
   * Erkenne alle Fehler
   */
  async detectErrors(): Promise<ErrorDetectionResult> {
    const errors: DetectedError[] = []

    // 1. TypeScript-Fehler
    const tsErrors = await this.detectTypeScriptErrors()
    errors.push(...tsErrors)

    // 2. ESLint-Fehler
    const lintErrors = await this.detectLintErrors()
    errors.push(...lintErrors)

    // 3. Design-Vorgaben-Verstöße
    const designErrors = await this.detectDesignViolations()
    errors.push(...designErrors)

    // 4. Logik-Fehler (vereinfacht)
    const logicErrors = await this.detectLogicErrors()
    errors.push(...logicErrors)

    // 5. Performance-Probleme
    const perfErrors = await this.detectPerformanceIssues()
    errors.push(...perfErrors)

    // 6. Security-Issues
    const securityErrors = await this.detectSecurityIssues()
    errors.push(...securityErrors)

    // 7. Dokumentiere alle gefundenen Fehler
    for (const error of errors) {
      await logError({
        type: error.type,
        severity: error.severity,
        category: "error-detector",
        message: error.message,
        filePath: error.filePath,
        line: error.line,
        context: error.context,
        solution: error.suggestedFix,
        botId: "error-detector",
      })
    }

    // 8. Erstelle Zusammenfassung
    const summary = this.createSummary(errors)

    return {
      errors,
      summary,
    }
  }

  /**
   * Erkenne TypeScript-Fehler
   */
  private async detectTypeScriptErrors(): Promise<DetectedError[]> {
    const errors: DetectedError[] = []

    try {
      const { stdout, stderr } = await execAsync("pnpm exec tsc --noEmit --pretty false", {
        cwd: process.cwd(),
        timeout: 30000,
      })

      if (stderr) {
        const lines = stderr.split("\n")
        for (const line of lines) {
          // Parse TypeScript-Fehler
          const match = line.match(/(.+?)\((\d+),(\d+)\):\s*(error|warning)\s*(TS\d+):\s*(.+)/)
          if (match) {
            const [, filePath, lineNum, , , errorCode, message] = match
            errors.push({
              id: `ts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date().toISOString(),
              type: "type",
              severity: errorCode.includes("TS23") || errorCode.includes("TS25") ? "critical" : "high",
              filePath: filePath.trim(),
              line: parseInt(lineNum),
              message: `${errorCode}: ${message}`,
              autoFixable: this.isTypeScriptErrorAutoFixable(errorCode),
              suggestedFix: this.suggestTypeScriptFix(errorCode, message),
            })
          }
        }
      }
    } catch (error: any) {
      // TypeScript-Fehler werden in stderr ausgegeben
      if (error.stderr) {
        const lines = error.stderr.split("\n")
        for (const line of lines) {
          const match = line.match(/(.+?)\((\d+),(\d+)\):\s*(error|warning)\s*(TS\d+):\s*(.+)/)
          if (match) {
            const [, filePath, lineNum, , , errorCode, message] = match
            errors.push({
              id: `ts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date().toISOString(),
              type: "type",
              severity: errorCode.includes("TS23") || errorCode.includes("TS25") ? "critical" : "high",
              filePath: filePath.trim(),
              line: parseInt(lineNum),
              message: `${errorCode}: ${message}`,
              autoFixable: this.isTypeScriptErrorAutoFixable(errorCode),
              suggestedFix: this.suggestTypeScriptFix(errorCode, message),
            })
          }
        }
      }
    }

    return errors
  }

  /**
   * Erkenne ESLint-Fehler
   */
  private async detectLintErrors(): Promise<DetectedError[]> {
    const errors: DetectedError[] = []

    try {
      const { stdout, stderr } = await execAsync("pnpm exec eslint . --format json", {
        cwd: process.cwd(),
        timeout: 30000,
      })

      const output = stdout || stderr
      if (output) {
        try {
          const lintResults = JSON.parse(output)
          for (const file of lintResults) {
            for (const message of file.messages) {
              errors.push({
                id: `lint-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                timestamp: new Date().toISOString(),
                type: "syntax",
                severity: message.severity === 2 ? "high" : message.severity === 1 ? "medium" : "low",
                filePath: file.filePath,
                line: message.line,
                message: `${message.ruleId || "unknown"}: ${message.message}`,
                autoFixable: message.fixable || false,
                suggestedFix: message.fix ? "ESLint Auto-Fix verfügbar" : undefined,
              })
            }
          }
        } catch {
          // Ignoriere Parse-Fehler
        }
      }
    } catch (error: any) {
      // Ignoriere ESLint-Fehler (können auch bei erfolgreicher Prüfung auftreten)
    }

    return errors
  }

  /**
   * Erkenne Design-Vorgaben-Verstöße
   */
  private async detectDesignViolations(): Promise<DetectedError[]> {
    const errors: DetectedError[] = []

    // Durchsuche alle relevanten Dateien
    const files = await this.findRelevantFiles()
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, "utf-8")
        const lines = content.split("\n")

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]

          // Hardcoded Farben
          if (/#323D5E|#0A2540|#([0-9a-fA-F]{3}){1,2}/i.test(line) && !line.includes("//") && !line.includes("/*")) {
            errors.push({
              id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date().toISOString(),
              type: "design",
              severity: "high",
              filePath,
              line: i + 1,
              message: "Hardcoded Farbe gefunden. Verwende Design-Tokens.",
              code: line.trim(),
              autoFixable: true,
              suggestedFix: "Ersetze durch bg-primary, text-primary, etc.",
            })
          }

          // Falsche rounded-Klassen
          if (/rounded-lg.*Card|Card.*rounded-lg/.test(line)) {
            errors.push({
              id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date().toISOString(),
              type: "design",
              severity: "medium",
              filePath,
              line: i + 1,
              message: "Cards müssen rounded-2xl verwenden",
              code: line.trim(),
              autoFixable: true,
              suggestedFix: "Ersetze rounded-lg durch rounded-2xl",
            })
          }

          // Falsche gap-Werte
          if (/gap-4|gap-6/.test(line) && !line.includes("//") && !line.includes("/*")) {
            errors.push({
              id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date().toISOString(),
              type: "design",
              severity: "medium",
              filePath,
              line: i + 1,
              message: "Standard-Gap ist gap-5",
              code: line.trim(),
              autoFixable: true,
              suggestedFix: "Ersetze gap-4 oder gap-6 durch gap-5",
            })
          }
        }
      } catch {
        // Ignoriere Datei-Fehler
      }
    }

    return errors
  }

  /**
   * Erkenne Logik-Fehler (vereinfacht)
   */
  private async detectLogicErrors(): Promise<DetectedError[]> {
    const errors: DetectedError[] = []

    // Analysiere Error-Log für wiederkehrende Muster
    const errorPatterns = await analyzeErrorPatterns()
    if (errorPatterns.recentErrors > 10) {
      errors.push({
        id: `logic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: "logic",
        severity: "high",
        message: `Viele aktuelle Fehler erkannt: ${errorPatterns.recentErrors} Fehler in den letzten 24 Stunden`,
        autoFixable: false,
        context: { errorPatterns },
      })
    }

    return errors
  }

  /**
   * Erkenne Performance-Probleme
   */
  private async detectPerformanceIssues(): Promise<DetectedError[]> {
    const errors: DetectedError[] = []

    // Vereinfachte Performance-Prüfung
    // TODO: Erweitern mit Bundle-Analyse, etc.

    return errors
  }

  /**
   * Erkenne Security-Issues
   */
  private async detectSecurityIssues(): Promise<DetectedError[]> {
    const errors: DetectedError[] = []

    const files = await this.findRelevantFiles()
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, "utf-8")

        // Hardcoded Secrets
        if (/password\s*=\s*["'][^"']+["']|api[_-]?key\s*=\s*["'][^"']+["']|secret\s*=\s*["'][^"']+["']/i.test(content)) {
          errors.push({
            id: `security-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: "security",
            severity: "critical",
            filePath,
            message: "Potentielles hardcoded Secret gefunden",
            autoFixable: false,
            suggestedFix: "Verwende Environment-Variablen",
          })
        }
      } catch {
        // Ignoriere Datei-Fehler
      }
    }

    return errors
  }

  /**
   * Finde relevante Dateien
   */
  private async findRelevantFiles(): Promise<string[]> {
    const files: string[] = []

    for (const watchPath of this.watchPaths) {
      try {
        const fullPath = path.join(process.cwd(), watchPath)
        const entries = await fs.readdir(fullPath, { recursive: true, withFileTypes: true })
        for (const entry of entries) {
          if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            files.push(path.join(fullPath, entry.name))
          }
        }
      } catch {
        // Ignoriere Verzeichnis-Fehler
      }
    }

    return files
  }

  /**
   * Prüfe ob TypeScript-Fehler automatisch behebbar
   */
  private isTypeScriptErrorAutoFixable(errorCode: string): boolean {
    const autoFixableCodes = ["TS2307", "TS2339", "TS2345", "TS2554"]
    return autoFixableCodes.some((code) => errorCode.includes(code))
  }

  /**
   * Vorschlage TypeScript-Fix
   */
  private suggestTypeScriptFix(errorCode: string, message: string): string {
    if (errorCode.includes("TS2307")) {
      return "Fehlender Import - füge Import-Statement hinzu"
    } else if (errorCode.includes("TS2339")) {
      return "Eigenschaft existiert nicht - prüfe Typ-Definition"
    } else if (errorCode.includes("TS2345")) {
      return "Typ-Mismatch - korrigiere Typen"
    }
    return "Prüfe TypeScript-Dokumentation für diesen Fehler"
  }

  /**
   * Erstelle Zusammenfassung
   */
  private createSummary(errors: DetectedError[]): ErrorDetectionResult["summary"] {
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    let autoFixable = 0

    for (const error of errors) {
      byType[error.type] = (byType[error.type] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
      if (error.autoFixable) autoFixable++
    }

    return {
      total: errors.length,
      byType,
      bySeverity,
      autoFixable,
    }
  }
}

