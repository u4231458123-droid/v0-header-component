/**
 * PRE-SAVE-VALIDATOR
 * ==================
 * Wird vor jedem Save ausgefuehrt
 * Prueft TypeScript-Typen automatisch
 * Erkennt abgeschnittene Codes
 * Meldet Vorgabenverstoesse sofort
 */

import { execSync } from "child_process"
import { readFileSync } from "fs"
import { QualityBot } from "@/lib/ai/bots/quality-bot"
import { getErrorLearningSystem } from "@/lib/ai/error-learning"

const qualityBot = new QualityBot()
const errorLearning = getErrorLearningSystem()

interface ValidationResult {
  passed: boolean
  errors: Array<{
    type: "typescript" | "linter" | "design" | "logic" | "other"
    severity: "critical" | "high" | "medium" | "low"
    message: string
    filePath: string
    lineNumber?: number
    suggestion: string
  }>
  warnings: string[]
}

/**
 * Validiere eine Datei vor dem Speichern
 */
export async function validateBeforeSave(filePath: string): Promise<ValidationResult> {
  const errors: ValidationResult["errors"] = []
  const warnings: string[] = []

  try {
    // 1. Pruefe ob Datei existiert
    const content = readFileSync(filePath, "utf-8")

    // 2. Pruefe auf abgeschnittene Codes
    if (content.includes("...") && content.split("...").length > 3) {
      warnings.push("Moeglicherweise abgeschnittener Code erkannt (mehrere '...')")
    }

    // 3. Pruefe TypeScript-Syntax
    try {
      execSync(`pnpm exec tsc --noEmit --pretty false "${filePath}" 2>&1`, {
        encoding: "utf-8",
        cwd: process.cwd(),
      })
    } catch (tsError: any) {
      const output = tsError.stdout || tsError.stderr || ""
      const errorLines = output.split("\n").filter((line: string) => line.includes("error TS"))

      for (const errorLine of errorLines) {
        const match = errorLine.match(/(.+?)\((\d+),(\d+)\): error TS(\d+): (.+)/)
        if (match) {
          const [, , line, , , message] = match
          errors.push({
            type: "typescript",
            severity: message.includes("implicitly has an 'any' type") ? "high" : "medium",
            message: message,
            filePath: filePath,
            lineNumber: parseInt(line),
            suggestion: "Fuege explizite Typen hinzu",
          })

          // Lerne aus Fehler
          await errorLearning.learnError({
            id: `${filePath}-${line}-${Date.now()}`,
            type: "typescript",
            severity: message.includes("implicitly has an 'any' type") ? "high" : "medium",
            pattern: message,
            message: message,
            filePath: filePath,
            lineNumber: parseInt(line),
            context: content.substring(Math.max(0, parseInt(line) - 10), parseInt(line) + 10),
            fix: "Fuege explizite Typen hinzu",
            occurrences: 1,
            firstSeen: new Date(),
            lastSeen: new Date(),
            fixed: false,
          })
        }
      }
    }

    // 4. Pruefe mit QualityBot
    const qualityResult = await qualityBot.checkCodeAgainstDocumentation(content, {}, filePath)
    for (const violation of qualityResult.violations) {
      errors.push({
        type: violation.type === "design" ? "design" : violation.type === "functionality" ? "logic" : "other",
        severity: violation.severity,
        message: violation.message,
        filePath: filePath,
        lineNumber: violation.line,
        suggestion: violation.suggestion,
      })
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error: any) {
    return {
      passed: false,
      errors: [
        {
          type: "other",
          severity: "critical",
          message: `Fehler beim Validieren: ${error.message}`,
          filePath: filePath,
          suggestion: "Bitte manuell prüfen",
        },
      ],
      warnings,
    }
  }
}

/**
 * Hauptfunktion: Validiere Datei
 */
if (require.main === module) {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error("❌ Bitte Dateipfad angeben: tsx scripts/cicd/pre-save-validator.ts <file-path>")
    process.exit(1)
  }

  validateBeforeSave(filePath)
    .then((result) => {
      if (result.passed) {
        console.log(`✅ ${filePath} - Validierung bestanden`)
        process.exit(0)
      } else {
        console.error(`❌ ${filePath} - ${result.errors.length} Fehler gefunden:`)
        for (const error of result.errors) {
          const icon = error.severity === "critical" ? "🔴" : error.severity === "high" ? "🟠" : error.severity === "medium" ? "🟡" : "🟢"
          console.error(`  ${icon} [${error.severity.toUpperCase()}] ${error.message}`)
          if (error.lineNumber) {
            console.error(`     Zeile: ${error.lineNumber}`)
          }
          if (error.suggestion) {
            console.error(`     Vorschlag: ${error.suggestion}`)
          }
        }
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("❌ Fehler beim Validieren:", error)
      process.exit(1)
    })
}

export { validateBeforeSave }

