/**
 * AUTOMATISCHER QUALITY-CHECKER
 * =============================
 * Prüft Code automatisch nach jeder Änderung
 * Behebt Fehler automatisch, wenn möglich
 * Gibt Rückmeldung bei manuellen Eingriffen
 */

import { QualityBot } from "./quality-bot"
import { promises as fs } from "fs"
import path from "path"

export interface AutoFixResult {
  success: boolean
  filePath: string
  violations: Array<{
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    line?: number
    suggestion: string
    autoFixed?: boolean
  }>
  autoFixed: boolean
  manualActionRequired: boolean
  fixedCode?: string
  errors?: string[]
}

export class AutoQualityChecker {
  private qualityBot: QualityBot

  constructor() {
    this.qualityBot = new QualityBot()
  }

  /**
   * Prüfe Code automatisch und behebe Fehler, wenn möglich
   */
  async checkAndFix(filePath: string, code?: string): Promise<AutoFixResult> {
    try {
      // Lade Code, falls nicht übergeben
      let codeContent = code
      if (!codeContent) {
        codeContent = await fs.readFile(filePath, "utf-8")
      }

      // Prüfe Code gegen Dokumentation
      const checkResult = await this.qualityBot.checkCodeAgainstDocumentation(
        codeContent,
        {},
        filePath
      )

      // Versuche automatische Behebungen
      const fixResult = await this.autoFixViolations(
        filePath,
        codeContent,
        checkResult.violations
      )

      // Dokumentiere Violations
      for (const violation of checkResult.violations) {
        await this.qualityBot.documentViolation({
          type: violation.type,
          filePath,
          line: violation.line,
          message: violation.message,
          solution: violation.suggestion,
          severity: violation.severity,
        })
      }

      return {
        success: fixResult.violations.length === 0,
        filePath,
        violations: fixResult.violations,
        autoFixed: fixResult.autoFixed,
        manualActionRequired: fixResult.manualActionRequired,
        fixedCode: fixResult.fixedCode,
      }
    } catch (error) {
      return {
        success: false,
        filePath,
        violations: [],
        autoFixed: false,
        manualActionRequired: true,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      }
    }
  }

  /**
   * Automatische Behebung von Violations
   */
  private async autoFixViolations(
    filePath: string,
    code: string,
    violations: Array<{
      type: string
      severity: "critical" | "high" | "medium" | "low"
      message: string
      line?: number
      suggestion: string
    }>
  ): Promise<{
    fixedCode: string
    violations: Array<{
      type: string
      severity: "critical" | "high" | "medium" | "low"
      message: string
      line?: number
      suggestion: string
      autoFixed?: boolean
    }>
    autoFixed: boolean
    manualActionRequired: boolean
  }> {
    let fixedCode = code
    const lines = fixedCode.split("\n")
    const remainingViolations: Array<{
      type: string
      severity: "critical" | "high" | "medium" | "low"
      message: string
      line?: number
      suggestion: string
      autoFixed?: boolean
    }> = []
    let autoFixed = false
    let manualActionRequired = false

    for (const violation of violations) {
      const canAutoFix = this.canAutoFix(violation)
      
      if (canAutoFix && violation.line) {
        // Versuche automatische Behebung
        const fixResult = this.applyAutoFix(lines, violation)
        if (fixResult.fixed) {
          fixedCode = fixResult.lines.join("\n")
          autoFixed = true
          // Violation wurde behoben, nicht zu remainingViolations hinzufügen
        } else {
          remainingViolations.push({ ...violation, autoFixed: false })
          if (violation.severity === "critical" || violation.severity === "high") {
            manualActionRequired = true
          }
        }
      } else {
        remainingViolations.push({ ...violation, autoFixed: false })
        if (violation.severity === "critical" || violation.severity === "high") {
          manualActionRequired = true
        }
      }
    }

    return {
      fixedCode,
      violations: remainingViolations,
      autoFixed,
      manualActionRequired,
    }
  }

  /**
   * Prüfe ob Violation automatisch behoben werden kann
   */
  private canAutoFix(violation: {
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    suggestion: string
  }): boolean {
    // Automatisch behebbare Violation-Typen
    const autoFixableTypes = [
      "design", // Hardcoded Farben, rounded-Klassen, gap-Werte
      "ui-consistency", // UI-Library-Imports
    ]

    return autoFixableTypes.includes(violation.type) && violation.severity !== "critical"
  }

  /**
   * Wende automatische Behebung an
   */
  private applyAutoFix(
    lines: string[],
    violation: {
      type: string
      message: string
      line?: number
      suggestion: string
    }
  ): { fixed: boolean; lines: string[] } {
    if (!violation.line || violation.line < 1 || violation.line > lines.length) {
      return { fixed: false, lines }
    }

    const lineIndex = violation.line - 1
    let line = lines[lineIndex]
    let fixed = false

    // Design-Violations: Hardcoded Farben
    if (violation.type === "design" && violation.message.includes("Hardcoded Farbe")) {
      // Ersetze hardcoded Farben durch Design-Tokens (vereinfacht)
      line = line.replace(/#323D5E|#0A2540/g, "bg-primary")
      if (line !== lines[lineIndex]) {
        fixed = true
      }
    }

    // Design-Violations: rounded-lg für Cards
    if (violation.type === "design" && violation.message.includes("rounded-lg.*Card")) {
      line = line.replace(/rounded-lg(?=.*Card)/g, "rounded-2xl")
      if (line !== lines[lineIndex]) {
        fixed = true
      }
    }

    // Design-Violations: rounded-md für Buttons
    if (violation.type === "design" && violation.message.includes("rounded-md.*Button")) {
      line = line.replace(/rounded-md(?=.*Button)/g, "rounded-xl")
      if (line !== lines[lineIndex]) {
        fixed = true
      }
    }

    // Design-Violations: gap-4 oder gap-6
    if (violation.type === "design" && violation.message.includes("gap-4 oder gap-6")) {
      line = line.replace(/gap-[46]/g, "gap-5")
      if (line !== lines[lineIndex]) {
        fixed = true
      }
    }

    if (fixed) {
      const newLines = [...lines]
      newLines[lineIndex] = line
      return { fixed: true, lines: newLines }
    }

    return { fixed: false, lines }
  }

  /**
   * Prüfe mehrere Dateien automatisch
   */
  async checkMultipleFiles(filePaths: string[]): Promise<AutoFixResult[]> {
    const results: AutoFixResult[] = []

    for (const filePath of filePaths) {
      try {
        const result = await this.checkAndFix(filePath)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          filePath,
          violations: [],
          autoFixed: false,
          manualActionRequired: true,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        })
      }
    }

    return results
  }
}

/**
 * Helper-Funktion: Prüfe Code automatisch nach Änderung
 */
export async function autoCheckCode(filePath: string, code?: string): Promise<AutoFixResult> {
  const checker = new AutoQualityChecker()
  return await checker.checkAndFix(filePath, code)
}

/**
 * Helper-Funktion: Prüfe und speichere Code automatisch (wenn auto-fix möglich)
 */
export async function autoCheckAndSave(filePath: string, code: string): Promise<{
  success: boolean
  saved: boolean
  violations: AutoFixResult["violations"]
  manualActionRequired: boolean
}> {
  const checker = new AutoQualityChecker()
  const result = await checker.checkAndFix(filePath, code)

  // Speichere nur wenn auto-fixed und keine kritischen Violations
  const canSave = result.autoFixed && !result.manualActionRequired && result.fixedCode

  if (canSave) {
    await fs.writeFile(filePath, result.fixedCode!, "utf-8")
    return {
      success: result.success,
      saved: true,
      violations: result.violations,
      manualActionRequired: false,
    }
  }

  return {
    success: result.success,
    saved: false,
    violations: result.violations,
    manualActionRequired: result.manualActionRequired,
  }
}

