/**
 * GIT-PROTOKOLL
 * =============
 * Automatisches Git-Protokoll für alle AI-Bots
 * Obligatorisches Commit/Push-Schema nach jeder Aufgabe
 */

import { spawn } from "child_process"
import { promisify } from "util"
import { createCommitMessage, validateCommitMessage, GIT_PROTOCOL } from "./agent-directives"

export interface GitProtocolResult {
  success: boolean
  errors?: string[]
  warnings?: string[]
  commitHash?: string
}

export interface GitProtocolOptions {
  agentRole: string
  taskId: string
  description: string
  files?: string[]
  skipValidation?: boolean
}

/**
 * Git-Protocol-Klasse
 * Führt automatisch git add, commit und push aus
 */
export class GitProtocol {
  private cwd: string

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
  }

  /**
   * Führe Git-Befehl sicher aus (mit Argument-Array, nicht String)
   * Verhindert Command-Injection
   */
  private async execGit(
    args: string[],
    options: { cwd?: string; input?: string } = {}
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      const gitProcess = spawn("git", args, {
        stdio: options.input ? ["pipe", "pipe", "pipe"] : ["ignore", "pipe", "pipe"],
        cwd: options.cwd || this.cwd,
        shell: false, // Wichtig: Kein Shell, verhindert Injection
      })

      let stdout = ""
      let stderr = ""

      if (gitProcess.stdout) {
        gitProcess.stdout.on("data", (data) => {
          stdout += data.toString()
        })
      }

      if (gitProcess.stderr) {
        gitProcess.stderr.on("data", (data) => {
          stderr += data.toString()
        })
      }

      if (options.input && gitProcess.stdin) {
        gitProcess.stdin.write(options.input)
        gitProcess.stdin.end()
      }

      gitProcess.on("error", (error) => {
        resolve({ success: false, error: error.message })
      })

      gitProcess.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout.trim() })
        } else {
          resolve({ success: false, error: stderr || `Exit code: ${code}` })
        }
      })
    })
  }

  /**
   * Prüfe ob wir in einem Git-Repository sind
   */
  async isGitRepository(): Promise<boolean> {
    const result = await this.execGit(["rev-parse", "--git-dir"])
    return result.success
  }

  /**
   * Prüfe Git-Status
   */
  async getStatus(): Promise<{ hasChanges: boolean; status: string }> {
    const result = await this.execGit(["status", "--porcelain"])
    const hasChanges = result.success && result.output ? result.output.length > 0 : false
    return {
      hasChanges,
      status: result.output || "",
    }
  }

  /**
   * Validiere Inputs gegen Command-Injection
   */
  private validateInputs(options: GitProtocolOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const dangerousChars = [";", "|", "&", "`", "$", "(", ")", "<", ">", "\n", "\r"]

    const hasDangerousChars = (str: string) => dangerousChars.some((char) => str.includes(char))

    // Validiere Commit-Message-Komponenten
    if (hasDangerousChars(options.agentRole)) {
      errors.push("agentRole enthält ungültige Zeichen")
    }
    if (hasDangerousChars(options.taskId)) {
      errors.push("taskId enthält ungültige Zeichen")
    }
    if (hasDangerousChars(options.description)) {
      errors.push("description enthält ungültige Zeichen")
    }

    // Validiere Dateipfade (falls angegeben)
    if (options.files) {
      for (const file of options.files) {
        if (
          file.includes("..") ||
          file.startsWith("/") ||
          (process.platform === "win32" && file.includes(":")) ||
          hasDangerousChars(file)
        ) {
          errors.push(`Ungültiger Dateipfad: ${file}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Führe git add aus
   */
  async gitAdd(files?: string[]): Promise<{ success: boolean; error?: string }> {
    if (files && files.length > 0) {
      // Validiere Dateipfade
      const dangerousChars = [";", "|", "&", "`", "$", "(", ")", "<", ">", "\n", "\r"]
      const hasDangerousChars = (str: string) => dangerousChars.some((char) => str.includes(str))

      for (const file of files) {
        if (
          file.includes("..") ||
          file.startsWith("/") ||
          (process.platform === "win32" && file.includes(":")) ||
          hasDangerousChars(file)
        ) {
          return { success: false, error: `Ungültiger Dateipfad: ${file}` }
        }
      }

      // Füge spezifische Dateien hinzu
      const result = await this.execGit(["add", ...files])
      return { success: result.success, error: result.error }
    } else {
      // Füge alle Änderungen hinzu
      const result = await this.execGit(["add", "."])
      return { success: result.success, error: result.error }
    }
  }

  /**
   * Führe git commit aus
   */
  async gitCommit(message: string): Promise<{ success: boolean; commitHash?: string; error?: string }> {
    // Validiere Commit-Message-Format
    if (!validateCommitMessage(message)) {
      return {
        success: false,
        error: `Ungültiges Commit-Message-Format. Erwartet: [Agent-Rolle][Task-ID] Beschreibung`,
      }
    }

    // Validiere gegen Command-Injection
    const dangerousChars = [";", "|", "&", "`", "$", "(", ")", "<", ">", "\n", "\r"]
    if (dangerousChars.some((char) => message.includes(char))) {
      return { success: false, error: "Commit-Message enthält ungültige Zeichen" }
    }

    const result = await this.execGit(["commit", "-m", message])

    if (result.success) {
      // Hole Commit-Hash
      const hashResult = await this.execGit(["rev-parse", "HEAD"])
      return {
        success: true,
        commitHash: hashResult.output,
      }
    }

    return { success: false, error: result.error }
  }

  /**
   * Führe git push aus
   */
  async gitPush(branch: string = "main"): Promise<{ success: boolean; error?: string }> {
    // Validiere Branch-Name
    const dangerousChars = [";", "|", "&", "`", "$", "(", ")", "<", ">", "\n", "\r"]
    if (dangerousChars.some((char) => branch.includes(char))) {
      return { success: false, error: "Branch-Name enthält ungültige Zeichen" }
    }

    const result = await this.execGit(["push", "origin", branch])
    return { success: result.success, error: result.error }
  }

  /**
   * Führe vollständiges Git-Protokoll aus
   * git add -> git commit -> git push
   */
  async executeAfterTask(options: GitProtocolOptions): Promise<GitProtocolResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // 1. Prüfe ob Git-Repository
    if (!(await this.isGitRepository())) {
      return {
        success: false,
        errors: ["Nicht in Git-Repository"],
      }
    }

    // 2. Validiere Inputs (wenn nicht übersprungen)
    if (!options.skipValidation) {
      const validation = this.validateInputs(options)
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        }
      }
    }

    // 3. Prüfe ob es Änderungen gibt
    const status = await this.getStatus()
    if (!status.hasChanges) {
      warnings.push("Keine Änderungen zum Committen")
      return {
        success: true,
        warnings,
      }
    }

    // 4. Erstelle Commit-Message
    const commitMessage = createCommitMessage(options.agentRole, options.taskId, options.description)

    // 5. Führe git add aus
    const addResult = await this.gitAdd(options.files)
    if (!addResult.success) {
      errors.push(`git add fehlgeschlagen: ${addResult.error}`)
      return {
        success: false,
        errors,
      }
    }

    // 6. Führe git commit aus
    const commitResult = await this.gitCommit(commitMessage)
    if (!commitResult.success) {
      errors.push(`git commit fehlgeschlagen: ${commitResult.error}`)
      return {
        success: false,
        errors,
      }
    }

    // 7. Führe git push aus
    const pushResult = await this.gitPush()
    if (!pushResult.success) {
      errors.push(`git push fehlgeschlagen: ${pushResult.error}`)
      return {
        success: false,
        errors,
        commitHash: commitResult.commitHash,
      }
    }

    return {
      success: true,
      commitHash: commitResult.commitHash,
    }
  }

  /**
   * Prüfe ob Git-Status sauber ist (keine uncommitted changes)
   */
  async isClean(): Promise<boolean> {
    const status = await this.getStatus()
    return !status.hasChanges
  }

  /**
   * Hole aktuellen Branch
   */
  async getCurrentBranch(): Promise<string | null> {
    const result = await this.execGit(["rev-parse", "--abbrev-ref", "HEAD"])
    return result.success && result.output ? result.output : null
  }

  /**
   * Hole letzten Commit-Hash
   */
  async getLastCommitHash(): Promise<string | null> {
    const result = await this.execGit(["rev-parse", "HEAD"])
    return result.success && result.output ? result.output : null
  }
}

/**
 * Singleton-Instanz für einfachen Zugriff
 */
let gitProtocolInstance: GitProtocol | null = null

export function getGitProtocol(cwd?: string): GitProtocol {
  if (!gitProtocolInstance) {
    gitProtocolInstance = new GitProtocol(cwd)
  }
  return gitProtocolInstance
}

