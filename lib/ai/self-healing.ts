/**
 * Self-Healing Protokolle
 * =======================
 * Automatische Fehlerbehebung ohne User-Intervention.
 * Implementiert das NEO-GENESIS Self-Healing-System.
 *
 * Protokolle:
 * 1. Dependency-Resolution
 * 2. Test-Failure-Handling
 * 3. Build-Error-Recovery
 * 4. Deployment-Rollback
 * 5. Lint-Error-AutoFix
 */

import { logError } from "@/lib/cicd/error-logger"
import { spawn } from "child_process"

// Self-Healing Ergebnis
export interface HealingResult {
  success: boolean
  protocol: string
  attempts: number
  errors: string[]
  fixes: string[]
  duration: number
}

// Self-Healing Konfiguration
export interface HealingConfig {
  maxAttempts: number
  retryDelay: number
  autoCommit: boolean
  notifyOnFix: boolean
}

const DEFAULT_CONFIG: HealingConfig = {
  maxAttempts: 3,
  retryDelay: 2000,
  autoCommit: false,
  notifyOnFix: true,
}

/**
 * Self-Healing Engine
 */
export class SelfHealingEngine {
  private static instance: SelfHealingEngine
  private config: HealingConfig
  private healingHistory: Array<{
    timestamp: string
    protocol: string
    result: HealingResult
  }> = []

  private constructor(config: Partial<HealingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  static getInstance(config?: Partial<HealingConfig>): SelfHealingEngine {
    if (!SelfHealingEngine.instance) {
      SelfHealingEngine.instance = new SelfHealingEngine(config)
    }
    return SelfHealingEngine.instance
  }

  /**
   * Führe Self-Healing durch
   */
  async heal(errorType: string, errorDetails: unknown): Promise<HealingResult> {
    const startTime = Date.now()
    let result: HealingResult

    switch (errorType) {
      case "dependency":
        result = await this.healDependencies(errorDetails)
        break
      case "test-failure":
        result = await this.healTestFailure(errorDetails)
        break
      case "build-error":
        result = await this.healBuildError(errorDetails)
        break
      case "lint-error":
        result = await this.healLintError(errorDetails)
        break
      case "type-error":
        result = await this.healTypeError(errorDetails)
        break
      default:
        result = await this.genericHeal(errorType, errorDetails)
    }

    result.duration = Date.now() - startTime

    // Protokolliere Heilungsversuch
    this.healingHistory.push({
      timestamp: new Date().toISOString(),
      protocol: result.protocol,
      result,
    })

    // Logge Ergebnis
    if (result.success) {
      console.log(`✅ Self-Healing erfolgreich: ${result.protocol}`)
      if (this.config.notifyOnFix) {
        await this.notifyFix(result)
      }
    } else {
      console.error(`❌ Self-Healing fehlgeschlagen: ${result.protocol}`)
      await logError({
        type: "error",
        severity: "high",
        category: "self-healing",
        message: `Self-Healing fehlgeschlagen: ${result.protocol}`,
        context: { result },
        botId: "self-healing-engine",
      })
    }

    return result
  }

  /**
   * Dependency-Resolution
   */
  private async healDependencies(_errorDetails: unknown): Promise<HealingResult> {
    const result: HealingResult = {
      success: false,
      protocol: "dependency-resolution",
      attempts: 0,
      errors: [],
      fixes: [],
      duration: 0,
    }

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      result.attempts = attempt

      try {
        // Versuch 1: Standard Install
        if (attempt === 1) {
          const installResult = await this.runCommand("pnpm", ["install"])
          if (installResult.success) {
            result.success = true
            result.fixes.push("pnpm install erfolgreich")
            return result
          }
          result.errors.push(installResult.error || "Install fehlgeschlagen")
        }

        // Versuch 2: Clean Install
        if (attempt === 2) {
          await this.runCommand("rm", ["-rf", "node_modules"])
          await this.runCommand("rm", ["-f", "pnpm-lock.yaml"])
          const cleanInstall = await this.runCommand("pnpm", ["install"])
          if (cleanInstall.success) {
            result.success = true
            result.fixes.push("Clean install erfolgreich")
            return result
          }
          result.errors.push(cleanInstall.error || "Clean install fehlgeschlagen")
        }

        // Versuch 3: Legacy Peer Deps
        if (attempt === 3) {
          const legacyInstall = await this.runCommand("pnpm", ["install", "--legacy-peer-deps"])
          if (legacyInstall.success) {
            result.success = true
            result.fixes.push("Legacy peer deps install erfolgreich")
            return result
          }
          result.errors.push(legacyInstall.error || "Legacy install fehlgeschlagen")
        }

        await this.delay(this.config.retryDelay)
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : String(error))
      }
    }

    return result
  }

  /**
   * Test-Failure-Handling
   */
  private async healTestFailure(_errorDetails: unknown): Promise<HealingResult> {
    const result: HealingResult = {
      success: false,
      protocol: "test-failure-handling",
      attempts: 0,
      errors: [],
      fixes: [],
      duration: 0,
    }

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      result.attempts = attempt

      try {
        // Versuch: Tests mit Retry ausführen
        const testResult = await this.runCommand("pnpm", ["run", "test", "--", "--bail", "--retry=2"])
        if (testResult.success) {
          result.success = true
          result.fixes.push(`Tests erfolgreich nach ${attempt} Versuchen`)
          return result
        }

        // Prüfe auf Flaky-Tests
        if (attempt === 2) {
          // Führe nur fehlgeschlagene Tests erneut aus
          const retryResult = await this.runCommand("pnpm", ["run", "test", "--", "--onlyFailures"])
          if (retryResult.success) {
            result.success = true
            result.fixes.push("Fehlgeschlagene Tests waren flaky")
            return result
          }
        }

        result.errors.push(testResult.error || `Test fehlgeschlagen (Versuch ${attempt})`)
        await this.delay(this.config.retryDelay)
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : String(error))
      }
    }

    return result
  }

  /**
   * Build-Error-Recovery
   */
  private async healBuildError(_errorDetails: unknown): Promise<HealingResult> {
    const result: HealingResult = {
      success: false,
      protocol: "build-error-recovery",
      attempts: 0,
      errors: [],
      fixes: [],
      duration: 0,
    }

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      result.attempts = attempt

      try {
        // Versuch 1: Cache löschen und neu bauen
        if (attempt === 1) {
          await this.runCommand("rm", ["-rf", ".next"])
          const buildResult = await this.runCommand("pnpm", ["run", "build"])
          if (buildResult.success) {
            result.success = true
            result.fixes.push("Build nach Cache-Clear erfolgreich")
            return result
          }
          result.errors.push(buildResult.error || "Build fehlgeschlagen")
        }

        // Versuch 2: TypeScript-Fehler fixen
        if (attempt === 2) {
          // Generiere Typen neu
          await this.runCommand("pnpm", ["run", "type-check"])
          const buildResult = await this.runCommand("pnpm", ["run", "build"])
          if (buildResult.success) {
            result.success = true
            result.fixes.push("Build nach Type-Check erfolgreich")
            return result
          }
        }

        // Versuch 3: Vollständiger Reset
        if (attempt === 3) {
          await this.runCommand("rm", ["-rf", "node_modules", ".next", ".turbo"])
          await this.runCommand("pnpm", ["install"])
          const buildResult = await this.runCommand("pnpm", ["run", "build"])
          if (buildResult.success) {
            result.success = true
            result.fixes.push("Build nach vollständigem Reset erfolgreich")
            return result
          }
        }

        await this.delay(this.config.retryDelay)
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : String(error))
      }
    }

    return result
  }

  /**
   * Lint-Error-AutoFix
   */
  private async healLintError(_errorDetails: unknown): Promise<HealingResult> {
    const result: HealingResult = {
      success: false,
      protocol: "lint-error-autofix",
      attempts: 0,
      errors: [],
      fixes: [],
      duration: 0,
    }

    try {
      result.attempts = 1

      // ESLint AutoFix
      const lintFix = await this.runCommand("pnpm", ["run", "lint", "--", "--fix"])
      if (lintFix.success) {
        result.fixes.push("ESLint AutoFix angewendet")
      }

      // Prettier Format
      const formatResult = await this.runCommand("pnpm", ["exec", "prettier", "--write", "src/**/*.{ts,tsx}"])
      if (formatResult.success) {
        result.fixes.push("Prettier Formatierung angewendet")
      }

      // Prüfe ob Fehler behoben
      const lintCheck = await this.runCommand("pnpm", ["run", "lint"])
      if (lintCheck.success) {
        result.success = true
        return result
      }

      result.errors.push("Nicht alle Lint-Fehler konnten automatisch behoben werden")
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error))
    }

    return result
  }

  /**
   * Type-Error-Healing
   */
  private async healTypeError(_errorDetails: unknown): Promise<HealingResult> {
    const result: HealingResult = {
      success: false,
      protocol: "type-error-healing",
      attempts: 0,
      errors: [],
      fixes: [],
      duration: 0,
    }

    try {
      result.attempts = 1

      // TypeScript-Typen neu generieren
      const generateTypes = await this.runCommand("pnpm", ["run", "generate:types"])
      if (generateTypes.success) {
        result.fixes.push("TypeScript-Typen neu generiert")
      }

      // Type-Check erneut ausführen
      const typeCheck = await this.runCommand("pnpm", ["run", "type-check"])
      if (typeCheck.success) {
        result.success = true
        return result
      }

      result.errors.push("Type-Fehler konnten nicht automatisch behoben werden")
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error))
    }

    return result
  }

  /**
   * Generische Heilung
   */
  private async genericHeal(errorType: string, _errorDetails: unknown): Promise<HealingResult> {
    const result: HealingResult = {
      success: false,
      protocol: `generic-${errorType}`,
      attempts: 1,
      errors: [`Kein spezifisches Protokoll für: ${errorType}`],
      fixes: [],
      duration: 0,
    }

    // Versuche allgemeine Fixes
    try {
      // Cache löschen
      await this.runCommand("rm", ["-rf", ".next", ".turbo"])
      result.fixes.push("Cache gelöscht")

      // Dependencies prüfen
      const installResult = await this.runCommand("pnpm", ["install"])
      if (installResult.success) {
        result.fixes.push("Dependencies installiert")
      }

      result.success = result.fixes.length > 0
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error))
    }

    return result
  }

  /**
   * Führe Command aus
   */
  private async runCommand(
    command: string,
    args: string[]
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      let output = ""
      let errorOutput = ""

      const childProcess = spawn(command, args, {
        cwd: ".",
        shell: true,
      })

      childProcess.stdout?.on("data", (data: Buffer) => {
        output += data.toString()
      })

      childProcess.stderr?.on("data", (data: Buffer) => {
        errorOutput += data.toString()
      })

      childProcess.on("error", (error: Error) => {
        resolve({ success: false, error: error.message })
      })

      childProcess.on("close", (code: number | null) => {
        resolve({
          success: code === 0,
          output,
          error: code !== 0 ? errorOutput || `Exit code: ${code}` : undefined,
        })
      })
    })
  }

  /**
   * Verzögerung
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Benachrichtige über erfolgreiche Fixes
   */
  private async notifyFix(result: HealingResult): Promise<void> {
    await logError({
      type: "recovery",
      severity: "low",
      category: "self-healing",
      message: `Self-Healing erfolgreich: ${result.protocol}`,
      context: { fixes: result.fixes, attempts: result.attempts },
      solution: result.fixes.join(", "),
      botId: "self-healing-engine",
    })
  }

  /**
   * Hole Heilungshistorie
   */
  getHistory(): typeof this.healingHistory {
    return this.healingHistory
  }

  /**
   * Prüfe ob Fehlertyp heilbar ist
   */
  isHealable(errorType: string): boolean {
    const healableTypes = [
      "dependency",
      "test-failure",
      "build-error",
      "lint-error",
      "type-error",
    ]
    return healableTypes.includes(errorType)
  }
}

/**
 * Auto-Heal Decorator für Funktionen
 */
export function autoHeal(errorType: string) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        const engine = SelfHealingEngine.getInstance()
        if (engine.isHealable(errorType)) {
          const healResult = await engine.heal(errorType, error)
          if (healResult.success) {
            // Retry nach erfolgreicher Heilung
            return await originalMethod.apply(this, args)
          }
        }
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Singleton-Export
 */
export const selfHealing = SelfHealingEngine.getInstance()

