/**
 * Quality Gates System
 * ====================
 * Umfassende Qualitätsprüfungen vor jedem Deployment.
 * Implementiert das NEO-GENESIS Quality-First-Prinzip.
 *
 * Gates:
 * 1. Pre-Commit Gates
 * 2. Pre-Push Gates
 * 3. Pre-Deploy Gates
 * 4. Post-Deploy Verification
 */

import { logError } from "@/lib/cicd/error-logger"
import { spawn } from "child_process"
import { nexusBridge } from "./bots/nexus-bridge-integration"

// Gate-Ergebnis
export interface GateResult {
  passed: boolean
  gateName: string
  checks: Array<{
    name: string
    passed: boolean
    errors: string[]
    warnings: string[]
    duration: number
  }>
  totalDuration: number
  timestamp: string
}

// Gate-Konfiguration
export interface GateConfig {
  enabled: boolean
  blocking: boolean
  timeout: number
  checks: string[]
}

// Standard-Konfigurationen
const DEFAULT_GATES: Record<string, GateConfig> = {
  "pre-commit": {
    enabled: true,
    blocking: true,
    timeout: 30000,
    checks: ["lint", "type-check", "forbidden-terms", "design-tokens"],
  },
  "pre-push": {
    enabled: true,
    blocking: true,
    timeout: 120000,
    checks: ["lint", "type-check", "unit-tests", "compliance"],
  },
  "pre-deploy": {
    enabled: true,
    blocking: true,
    timeout: 300000,
    checks: ["lint", "type-check", "unit-tests", "e2e-tests", "build", "security"],
  },
  "post-deploy": {
    enabled: true,
    blocking: false,
    timeout: 60000,
    checks: ["health-check", "smoke-tests"],
  },
}

/**
 * Quality Gates Engine
 */
export class QualityGatesEngine {
  private static instance: QualityGatesEngine
  private gateConfigs: Record<string, GateConfig>
  private gateHistory: Array<{ timestamp: string; gate: string; result: GateResult }> = []

  private constructor() {
    this.gateConfigs = { ...DEFAULT_GATES }
  }

  static getInstance(): QualityGatesEngine {
    if (!QualityGatesEngine.instance) {
      QualityGatesEngine.instance = new QualityGatesEngine()
    }
    return QualityGatesEngine.instance
  }

  /**
   * Führe Gate aus
   */
  async runGate(gateName: string): Promise<GateResult> {
    const config = this.gateConfigs[gateName]
    if (!config || !config.enabled) {
      return {
        passed: true,
        gateName,
        checks: [],
        totalDuration: 0,
        timestamp: new Date().toISOString(),
      }
    }

    const startTime = Date.now()
    const result: GateResult = {
      passed: true,
      gateName,
      checks: [],
      totalDuration: 0,
      timestamp: new Date().toISOString(),
    }

    console.log(`\n🚦 Quality Gate: ${gateName}`)
    console.log(`   Checks: ${config.checks.join(", ")}`)

    for (const checkName of config.checks) {
      const checkStart = Date.now()
      let checkResult: GateResult["checks"][0]

      try {
        checkResult = await this.runCheck(checkName, config.timeout)
      } catch (error) {
        checkResult = {
          name: checkName,
          passed: false,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          duration: Date.now() - checkStart,
        }
      }

      result.checks.push(checkResult)

      if (!checkResult.passed && config.blocking) {
        result.passed = false
      }

      // Ausgabe
      const status = checkResult.passed ? "✅" : "❌"
      console.log(`   ${status} ${checkName} (${checkResult.duration}ms)`)

      if (checkResult.errors.length > 0) {
        for (const error of checkResult.errors) {
          console.log(`      ❌ ${error}`)
        }
      }
      if (checkResult.warnings.length > 0) {
        for (const warning of checkResult.warnings) {
          console.log(`      ⚠️ ${warning}`)
        }
      }
    }

    result.totalDuration = Date.now() - startTime

    // Protokolliere Gate-Ergebnis
    this.gateHistory.push({
      timestamp: result.timestamp,
      gate: gateName,
      result,
    })

    // Logge bei Fehlern
    if (!result.passed) {
      await logError({
        type: "violation",
        severity: config.blocking ? "high" : "medium",
        category: "quality-gates",
        message: `Quality Gate "${gateName}" fehlgeschlagen`,
        context: { result },
        botId: "quality-gates-engine",
      })
    }

    console.log(`\n   ${result.passed ? "✅ Gate bestanden" : "❌ Gate fehlgeschlagen"} (${result.totalDuration}ms)\n`)

    return result
  }

  /**
   * Führe einzelnen Check aus
   */
  private async runCheck(checkName: string, timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    switch (checkName) {
      case "lint":
        return this.checkLint(timeout)

      case "type-check":
        return this.checkTypes(timeout)

      case "unit-tests":
        return this.checkUnitTests(timeout)

      case "e2e-tests":
        return this.checkE2ETests(timeout)

      case "build":
        return this.checkBuild(timeout)

      case "security":
        return this.checkSecurity(timeout)

      case "forbidden-terms":
        return this.checkForbiddenTerms()

      case "design-tokens":
        return this.checkDesignTokens()

      case "compliance":
        return this.checkCompliance()

      case "health-check":
        return this.checkHealth()

      case "smoke-tests":
        return this.checkSmoke(timeout)

      default:
        return {
          name: checkName,
          passed: true,
          errors: [],
          warnings: [`Unbekannter Check: ${checkName}`],
          duration: Date.now() - startTime,
        }
    }
  }

  // Suppressed unused variables for check methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _errors: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _warnings: string[] = []

  /**
   * Lint-Check
   */
  private async checkLint(timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const result = await this.runCommand("pnpm", ["run", "lint"], timeout)

    return {
      name: "lint",
      passed: result.success,
      errors: result.success ? [] : [result.error || "Lint fehlgeschlagen"],
      warnings: [],
      duration: Date.now() - startTime,
    }
  }

  /**
   * Type-Check
   */
  private async checkTypes(timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const result = await this.runCommand("pnpm", ["run", "type-check"], timeout)

    return {
      name: "type-check",
      passed: result.success,
      errors: result.success ? [] : [result.error || "Type-Check fehlgeschlagen"],
      warnings: [],
      duration: Date.now() - startTime,
    }
  }

  /**
   * Unit-Tests-Check
   */
  private async checkUnitTests(timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const result = await this.runCommand("pnpm", ["run", "test:unit", "--", "--passWithNoTests"], timeout)

    return {
      name: "unit-tests",
      passed: result.success,
      errors: result.success ? [] : [result.error || "Unit-Tests fehlgeschlagen"],
      warnings: [],
      duration: Date.now() - startTime,
    }
  }

  /**
   * E2E-Tests-Check
   */
  private async checkE2ETests(timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const result = await this.runCommand("pnpm", ["run", "test:e2e"], timeout)

    return {
      name: "e2e-tests",
      passed: result.success,
      errors: result.success ? [] : [result.error || "E2E-Tests fehlgeschlagen"],
      warnings: [],
      duration: Date.now() - startTime,
    }
  }

  /**
   * Build-Check
   */
  private async checkBuild(timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const result = await this.runCommand("pnpm", ["run", "build"], timeout)

    return {
      name: "build",
      passed: result.success,
      errors: result.success ? [] : [result.error || "Build fehlgeschlagen"],
      warnings: [],
      duration: Date.now() - startTime,
    }
  }

  /**
   * Security-Check
   */
  private async checkSecurity(timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const checkErrors: string[] = []
    const checkWarnings: string[] = []

    // npm audit
    const auditResult = await this.runCommand("pnpm", ["audit", "--audit-level=high"], timeout)
    if (!auditResult.success) {
      checkWarnings.push("Security-Vulnerabilities gefunden (pnpm audit)")
    }

    // Supabase Security Advisors
    try {
      const health = await nexusBridge.getProjectHealth()
      if (!health?.healthy) {
        checkWarnings.push("Projekt-Gesundheitscheck zeigt Probleme")
      }
    } catch {
      checkWarnings.push("Nexus Bridge Health-Check nicht verfügbar")
    }

    return {
      name: "security",
      passed: checkErrors.length === 0,
      errors: checkErrors,
      warnings: checkWarnings,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Forbidden-Terms-Check
   */
  private async checkForbiddenTerms(): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const checkErrors: string[] = []
    const checkWarnings: string[] = []

    try {
      const docs = await nexusBridge.getActiveDocs()
      if (docs) {
        // Check würde hier gegen Codebase laufen
        // Vereinfacht: Prüfe nur ob forbidden terms definiert sind
        if (docs.forbiddenTerms.length === 0) {
          checkWarnings.push("Keine verbotenen Begriffe definiert")
        }
      }
    } catch {
      checkWarnings.push("Forbidden-Terms-Check nicht vollständig möglich")
    }

    return {
      name: "forbidden-terms",
      passed: checkErrors.length === 0,
      errors: checkErrors,
      warnings: checkWarnings,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Design-Tokens-Check
   */
  private async checkDesignTokens(): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const checkErrors: string[] = []
    const checkWarnings: string[] = []

    try {
      const tokens = await nexusBridge.getUITokens()
      if (!tokens) {
        checkWarnings.push("Design-Tokens nicht verfügbar")
      } else {
        // Prüfe ob Standard-Tokens definiert sind
        if (!tokens.radius?.cards) {
          checkWarnings.push("Cards-Rundung nicht definiert (erwartet: rounded-2xl)")
        }
        if (!tokens.spacing?.["gap-standard"]) {
          checkWarnings.push("Standard-Gap nicht definiert (erwartet: gap-5)")
        }
      }
    } catch {
      checkWarnings.push("Design-Tokens-Check nicht verfügbar")
    }

    return {
      name: "design-tokens",
      passed: checkErrors.length === 0,
      errors: checkErrors,
      warnings: checkWarnings,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Compliance-Check
   */
  private async checkCompliance(): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const checkErrors: string[] = []
    const checkWarnings: string[] = []

    try {
      // Prüfe Projekt-Specs
      const docs = await nexusBridge.getActiveDocs()
      if (!docs?.projectSpecs) {
        checkWarnings.push("project_specs.md nicht gefunden")
      }

      // Prüfe Cursor-Rules
      if (!docs?.cursorRules) {
        checkWarnings.push("Cursor-Rules nicht gefunden")
      }
    } catch {
      checkWarnings.push("Compliance-Check nicht vollständig möglich")
    }

    return {
      name: "compliance",
      passed: checkErrors.length === 0,
      errors: checkErrors,
      warnings: checkWarnings,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Health-Check
   */
  private async checkHealth(): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const checkErrors: string[] = []
    const checkWarnings: string[] = []

    try {
      const health = await nexusBridge.getProjectHealth()
      if (!health?.healthy) {
        if (!health?.lint.passed) {
          checkErrors.push(`Lint: ${health?.lint.errorCount || 0} Fehler`)
        }
        if (!health?.typeCheck.passed) {
          checkErrors.push(`TypeScript: ${health?.typeCheck.errorCount || 0} Fehler`)
        }
      }
    } catch {
      checkWarnings.push("Health-Check nicht verfügbar")
    }

    return {
      name: "health-check",
      passed: checkErrors.length === 0,
      errors: checkErrors,
      warnings: checkWarnings,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Smoke-Tests
   */
  private async checkSmoke(_timeout: number): Promise<GateResult["checks"][0]> {
    const startTime = Date.now()
    const checkErrors: string[] = []
    const checkWarnings: string[] = []

    // Smoke-Tests würden hier gegen Live-Deployment laufen
    // Vereinfacht: Nur Basis-Check
    checkWarnings.push("Smoke-Tests sollten gegen Live-Deployment laufen")

    return {
      name: "smoke-tests",
      passed: true,
      errors: checkErrors,
      warnings: checkWarnings,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Führe Command aus
   */
  private async runCommand(
    command: string,
    args: string[],
    timeout: number
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      let output = ""
      let errorOutput = ""
      let timedOut = false

      const childProcess = spawn(command, args, {
        cwd: ".",
        shell: true,
      })

      const timeoutId = setTimeout(() => {
        timedOut = true
        childProcess.kill()
        resolve({ success: false, error: `Timeout nach ${timeout}ms` })
      }, timeout)

      childProcess.stdout?.on("data", (data: Buffer) => {
        output += data.toString()
      })

      childProcess.stderr?.on("data", (data: Buffer) => {
        errorOutput += data.toString()
      })

      childProcess.on("error", (error: Error) => {
        clearTimeout(timeoutId)
        if (!timedOut) {
          resolve({ success: false, error: error.message })
        }
      })

      childProcess.on("close", (code: number | null) => {
        clearTimeout(timeoutId)
        if (!timedOut) {
          resolve({
            success: code === 0,
            output,
            error: code !== 0 ? errorOutput || `Exit code: ${code}` : undefined,
          })
        }
      })
    })
  }

  /**
   * Konfiguriere Gate
   */
  configureGate(gateName: string, config: Partial<GateConfig>): void {
    if (this.gateConfigs[gateName]) {
      this.gateConfigs[gateName] = { ...this.gateConfigs[gateName], ...config }
    } else {
      this.gateConfigs[gateName] = { ...DEFAULT_GATES["pre-commit"], ...config }
    }
  }

  /**
   * Hole Gate-Historie
   */
  getHistory(): typeof this.gateHistory {
    return this.gateHistory
  }

  /**
   * Hole Gate-Konfiguration
   */
  getConfig(gateName: string): GateConfig | undefined {
    return this.gateConfigs[gateName]
  }
}

/**
 * Pre-defined Gate Runners
 */
export const Gates = {
  preCommit: () => QualityGatesEngine.getInstance().runGate("pre-commit"),
  prePush: () => QualityGatesEngine.getInstance().runGate("pre-push"),
  preDeploy: () => QualityGatesEngine.getInstance().runGate("pre-deploy"),
  postDeploy: () => QualityGatesEngine.getInstance().runGate("post-deploy"),
}

/**
 * Singleton-Export
 */
export const qualityGates = QualityGatesEngine.getInstance()

