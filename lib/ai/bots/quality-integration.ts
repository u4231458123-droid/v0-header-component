/**
 * QUALITY-BOT INTEGRATION
 * ========================
 * Automatische Integration des QualityBots in alle Code-Änderungen
 * Wird automatisch bei jedem File-Edit aufgerufen
 * Erweitert um HuggingFace + Copilot Pipeline
 */

import { autoCheckCode, autoCheckAndSave, type AutoFixResult } from "./auto-quality-checker"
import { QUALITY_ASSURANCE_PIPELINE } from "./agent-directives"
import { getOptimizedHuggingFaceClient } from "@/lib/ai/huggingface-optimized"
import { perfLogger } from "@/lib/utils/performance"

export interface QualityResult {
  passed: boolean
  issues: Array<{
    severity: "error" | "warning" | "suggestion"
    message: string
    line?: number
    suggestion?: string
  }>
  fixedCode?: string
  iterations: number
  hfAnalysis?: string
  copilotReview?: any
}

/**
 * Wrapper für Code-Änderungen mit automatischer Quality-Prüfung
 */
export async function withQualityCheck<T>(
  filePath: string,
  operation: () => Promise<T> | T,
  options?: {
    autoFix?: boolean
    autoSave?: boolean
  }
): Promise<{
  result: T
  qualityCheck: AutoFixResult
}> {
  // Führe Operation aus
  const result = await operation()

  // Prüfe Code automatisch
  const qualityCheck = await autoCheckCode(filePath)

  // Auto-Fix und Save, falls aktiviert
  if (options?.autoFix && options?.autoSave && qualityCheck.fixedCode) {
    const { promises: fs } = await import("fs")
    await fs.writeFile(filePath, qualityCheck.fixedCode, "utf-8")
    console.log(`✅ Auto-Fix angewendet: ${filePath}`)
  }

  // Gib Rückmeldung bei manuellen Eingriffen
  if (qualityCheck.manualActionRequired) {
    console.warn(`⚠️  Manuelle Eingriffe erforderlich: ${filePath}`)
    qualityCheck.violations.forEach((v) => {
      if (v.severity === "critical" || v.severity === "high") {
        console.warn(`  - ${v.severity.toUpperCase()}: ${v.message} (Zeile ${v.line})`)
        console.warn(`    Vorschlag: ${v.suggestion}`)
      }
    })
  }

  return {
    result,
    qualityCheck,
  }
}

/**
 * Prüfe Code nach Änderung (ohne Operation)
 */
export async function checkCodeQuality(filePath: string): Promise<AutoFixResult> {
  return await autoCheckCode(filePath)
}

/**
 * Prüfe und behebe Code automatisch
 */
export async function checkAndFixCode(filePath: string, code?: string): Promise<AutoFixResult> {
  const { autoCheckAndSave } = await import("./auto-quality-checker")
  
  if (code) {
    const result = await autoCheckAndSave(filePath, code)
    return {
      success: result.success,
      filePath,
      violations: result.violations,
      autoFixed: result.saved,
      manualActionRequired: result.manualActionRequired,
    }
  }
  
  return await autoCheckCode(filePath)
}

