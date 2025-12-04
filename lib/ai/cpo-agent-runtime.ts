/**
 * CPO Agent Runtime Integration
 * =============================
 * Direkte Integration des CPO Agents in den Code für automatische Validierung
 * 
 * Diese Datei wird automatisch in Development-Mode geladen und validiert
 * alle Dateien beim Hot Reload.
 */

import { cpoAgent } from "./cpo-agent-integration"

/**
 * Runtime-Validierung für Development-Mode
 * Wird automatisch beim Hot Reload ausgeführt
 */
export async function validateCurrentFile(filePath: string): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  try {
    const result = await cpoAgent.validateFile(filePath)

    if (!result.valid) {
      console.group(`🔍 CPO Agent: Validierung für ${filePath}`)
      
      if (result.designTokens.errors.length > 0) {
        console.warn("⚠️ Design-Verstöße:", result.designTokens.errors)
      }
      
      if (result.codeQuality.errors.length > 0) {
        console.error("❌ Code-Qualität-Verstöße:", result.codeQuality.errors)
      }
      
      if (result.dsgvo.errors.length > 0) {
        console.error("🚨 DSGVO-Verstöße:", result.dsgvo.errors)
      }

      // Auto-Fix wenn aktiviert
      if (result.autoFix.fixed) {
        console.log("✅ Auto-Fix angewendet:", result.autoFix.changes)
      }

      console.groupEnd()
    }
  } catch (error) {
    console.error("[CPO Agent] Validierungsfehler:", error)
  }
}

/**
 * Hook für React Components
 * Validiert die aktuelle Komponente beim Mount
 */
export function useCPOValidation(componentName: string) {
  if (typeof window === "undefined") {
    return
  }

  if (process.env.NODE_ENV === "development") {
    // Validiere beim Mount
    const filePath = window.location.pathname
    validateCurrentFile(filePath).catch(console.error)
  }
}

/**
 * Automatische Validierung für alle geänderten Dateien
 * Wird von Pre-Commit Hook aufgerufen
 */
export async function validateChangedFiles(filePaths: string[]): Promise<{
  valid: boolean
  errors: string[]
  fixed: number
}> {
  const errors: string[] = []
  let fixed = 0

  for (const filePath of filePaths) {
    try {
      const result = await cpoAgent.validateFile(filePath)

      if (!result.valid) {
        errors.push(`${filePath}: ${result.designTokens.errors.length + result.codeQuality.errors.length + result.dsgvo.errors.length} Verstöße`)
      }

      if (result.autoFix.fixed) {
        fixed++
      }
    } catch (error) {
      errors.push(`${filePath}: Validierungsfehler - ${error}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    fixed,
  }
}

/**
 * Export für direkte Verwendung in Code
 */
export { cpoAgent } from "./cpo-agent-integration"
