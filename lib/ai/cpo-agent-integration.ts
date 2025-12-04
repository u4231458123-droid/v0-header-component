/**
 * CPO AI Agent Integration
 * ========================
 * Direkte Integration des CPO AI Agents in den Code
 * 
 * Dieser Agent überwacht und optimiert automatisch:
 * - Design-Token-Konsistenz
 * - Code-Qualität
 * - Performance
 * - DSGVO-Compliance
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

export interface CPOAgentConfig {
  enabled: boolean
  autoFix: boolean
  validateDesignTokens: boolean
  validateCodeQuality: boolean
  validateDSGVO: boolean
}

export class CPOAgent {
  private config: CPOAgentConfig

  constructor(config: Partial<CPOAgentConfig> = {}) {
    this.config = {
      enabled: true,
      autoFix: true,
      validateDesignTokens: true,
      validateCodeQuality: true,
      validateDSGVO: true,
      ...config,
    }
  }

  /**
   * Validiert Design-Token-Konsistenz
   */
  async validateDesignTokens(filePath: string): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!existsSync(filePath)) {
      return { valid: false, errors: [`Datei nicht gefunden: ${filePath}`], warnings: [] }
    }

    const content = readFileSync(filePath, "utf-8")

    // Prüfe auf verbotene hardcoded Farben
    const forbiddenColors = [
      /bg-white\b/g,
      /text-white\b/g,
      /bg-slate-\d+/g,
      /text-slate-\d+/g,
      /bg-emerald-\d+/g,
      /text-emerald-\d+/g,
    ]

    forbiddenColors.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        errors.push(`Verbotene hardcodierte Farbe gefunden: ${matches[0]}`)
      }
    })

    // Prüfe auf Design-Token-Verwendung
    const hasDesignTokens = /bg-primary|text-primary|bg-card|text-foreground/.test(content)
    if (!hasDesignTokens && /className=/.test(content)) {
      warnings.push("Keine Design-Tokens verwendet - sollte bg-primary, text-primary, etc. verwenden")
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validiert Code-Qualität
   */
  async validateCodeQuality(filePath: string): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!existsSync(filePath)) {
      return { valid: false, errors: [`Datei nicht gefunden: ${filePath}`], warnings: [] }
    }

    const content = readFileSync(filePath, "utf-8")

    // Prüfe auf any-Types
    if (/:\s*any\b/.test(content)) {
      errors.push("any-Type gefunden - sollte durch spezifische Typen ersetzt werden")
    }

    // Prüfe auf console.log (außer warn/error)
    const consoleLogMatches = content.match(/console\.(log|debug|info)\(/g)
    if (consoleLogMatches) {
      warnings.push(`console.${consoleLogMatches[0].split(".")[1]} gefunden - sollte entfernt werden`)
    }

    // Prüfe auf "Du" statt "Sie"
    if (/\bDu\b|\bdu\b/.test(content) && /string|text|content/.test(content)) {
      warnings.push('"Du" gefunden - sollte "Sie" verwenden (formales Deutsch)')
    }

    // Prüfe auf verbotene Begriffe
    const forbiddenTerms = ["kostenlos", "gratis", "free", "testen", "trial", "billig", "günstig"]
    forbiddenTerms.forEach((term) => {
      if (new RegExp(`\\b${term}\\b`, "i").test(content)) {
        errors.push(`Verbotener Begriff gefunden: "${term}"`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validiert DSGVO-Compliance
   */
  async validateDSGVO(filePath: string): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!existsSync(filePath)) {
      return { valid: false, errors: [`Datei nicht gefunden: ${filePath}`], warnings: [] }
    }

    const content = readFileSync(filePath, "utf-8")

    // Prüfe auf master_admin Referenzen
    if (/master_admin|masterAdmin|masterAdmin/.test(content)) {
      errors.push("master_admin Referenz gefunden - DSGVO-Verletzung!")
    }

    // Prüfe auf company_id Filterung
    if (filePath.includes(".sql") && /SELECT.*FROM/.test(content)) {
      if (!/company_id|WHERE.*company_id/.test(content)) {
        warnings.push("SQL-Query ohne company_id Filterung - mögliche DSGVO-Verletzung")
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Führt automatische Fixes durch
   */
  async autoFix(filePath: string): Promise<{
    fixed: boolean
    changes: string[]
  }> {
    if (!this.config.autoFix) {
      return { fixed: false, changes: [] }
    }

    const changes: string[] = []

    if (!existsSync(filePath)) {
      return { fixed: false, changes: [] }
    }

    let content = readFileSync(filePath, "utf-8")
    let modified = false

    // Fix: bg-white → bg-card
    if (/bg-white\b/.test(content)) {
      content = content.replace(/bg-white\b/g, "bg-card")
      changes.push("bg-white → bg-card")
      modified = true
    }

    // Fix: text-white → text-primary-foreground (wenn auf primary Hintergrund)
    if (/bg-primary.*text-white/.test(content)) {
      content = content.replace(/bg-primary.*text-white/g, "bg-primary text-primary-foreground")
      changes.push("text-white → text-primary-foreground (bei bg-primary)")
      modified = true
    }

    // Fix: "Du" → "Sie" (in Strings)
    if (/"Du\b|'Du\b|`Du\b/.test(content)) {
      content = content.replace(/"Du\b/g, '"Sie')
      content = content.replace(/'Du\b/g, "'Sie")
      content = content.replace(/`Du\b/g, "`Sie")
      changes.push('"Du" → "Sie"')
      modified = true
    }

    if (modified) {
      writeFileSync(filePath, content, "utf-8")
    }

    return {
      fixed: modified,
      changes,
    }
  }

  /**
   * Vollständige Validierung einer Datei
   */
  async validateFile(filePath: string): Promise<{
    valid: boolean
    designTokens: ReturnType<typeof this.validateDesignTokens> extends Promise<infer T> ? T : never
    codeQuality: ReturnType<typeof this.validateCodeQuality> extends Promise<infer T> ? T : never
    dsgvo: ReturnType<typeof this.validateDSGVO> extends Promise<infer T> ? T : never
    autoFix: ReturnType<typeof this.autoFix> extends Promise<infer T> ? T : never
  }> {
    const results = {
      designTokens: await this.validateDesignTokens(filePath),
      codeQuality: await this.validateCodeQuality(filePath),
      dsgvo: await this.validateDSGVO(filePath),
      autoFix: await this.autoFix(filePath),
    }

    return {
      valid:
        results.designTokens.valid &&
        results.codeQuality.valid &&
        results.dsgvo.valid,
      ...results,
    }
  }
}

/**
 * Globaler CPO Agent Instance
 */
export const cpoAgent = new CPOAgent({
  enabled: true,
  autoFix: process.env.NODE_ENV === "development",
  validateDesignTokens: true,
  validateCodeQuality: true,
  validateDSGVO: true,
})

/**
 * CPO Agent Hook für React Components
 */
export function useCPOAgent() {
  return {
    validate: (filePath: string) => cpoAgent.validateFile(filePath),
    agent: cpoAgent,
  }
}
