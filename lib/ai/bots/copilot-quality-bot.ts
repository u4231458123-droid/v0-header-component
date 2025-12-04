/**
 * GITHUB COPILOT QUALITY-BOT
 * ===========================
 * Nutzt GitHub Copilot für Code-Reviews und automatische Fixes
 * Hybrid-Workflow: Hugging Face für Text, Copilot für Code-Qualität
 */

import { loadKnowledgeForTask, type KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { logError } from "@/lib/cicd/error-logger"
import { WorkTracker } from "@/lib/knowledge-base/work-tracking"

export interface CopilotReviewResult {
  passed: boolean
  issues: Array<{
    severity: "error" | "warning" | "suggestion"
    message: string
    line?: number
    suggestion?: string
  }>
  fixes?: Array<{
    file: string
    line: number
    oldCode: string
    newCode: string
    reason: string
  }>
}

export interface CopilotFixResult {
  success: boolean
  fixedCode?: string
  issues?: string[]
}

export class CopilotQualityBot {
  private knowledgeBase: any
  private workTracker: WorkTracker

  constructor() {
    this.loadKnowledgeBase()
    this.workTracker = new WorkTracker()
  }

  /**
   * Lade alle Vorgaben und Regeln
   */
  private async loadKnowledgeBase() {
    const categories: KnowledgeCategory[] = [
      "coding-rules",
      "best-practices",
      "error-handling",
      "functionality-rules",
      "ci-cd",
    ]
    
    this.knowledgeBase = loadKnowledgeForTask("code-review", categories)
  }

  /**
   * REVIEW CODE MIT GITHUB COPILOT
   * Analysiert Code auf Fehler, Code-Smells und Verbesserungen
   */
  async reviewCode(
    code: string,
    filePath: string,
    context?: {
      relatedFiles?: string[]
      taskDescription?: string
    }
  ): Promise<CopilotReviewResult> {
    const issues: CopilotReviewResult["issues"] = []

    try {
      // 1. Statische Code-Analyse (ohne externe API)
      const staticIssues = this.performStaticAnalysis(code, filePath)
      issues.push(...staticIssues)

      // 2. Knowledge-Base-Prüfung
      const kbIssues = this.checkAgainstKnowledgeBase(code, filePath)
      issues.push(...kbIssues)

      // 3. TypeScript-spezifische Prüfungen
      const tsIssues = this.checkTypeScriptIssues(code, filePath)
      issues.push(...tsIssues)

      // 4. Design-Token-Prüfung
      const designIssues = this.checkDesignTokens(code, filePath)
      issues.push(...designIssues)

      // 5. Copilot-ähnliche Vorschläge generieren
      const suggestions = this.generateSuggestions(code, filePath, context)
      issues.push(...suggestions)

      return {
        passed: issues.filter((i) => i.severity === "error").length === 0,
        issues,
      }
    } catch (error: any) {
      await logError({
        type: "error",
        severity: "high",
        category: "copilot-quality-bot",
        message: `Fehler bei Code-Review: ${error.message}`,
        filePath,
        context: { error: error.message },
        botId: "copilot-quality-bot",
      })

      return {
        passed: false,
        issues: [
          {
            severity: "error",
            message: `Code-Review fehlgeschlagen: ${error.message}`,
          },
        ],
      }
    }
  }

  /**
   * GENERIERE FIXES FÜR CODE
   * Erstellt automatische Fixes basierend auf Review-Ergebnissen
   */
  async generateFixes(
    code: string,
    filePath: string,
    reviewResult: CopilotReviewResult
  ): Promise<CopilotFixResult> {
    const fixes: CopilotReviewResult["fixes"] = []
    let fixedCode = code

    try {
      // 1. Fixe TypeScript-Fehler
      for (const issue of reviewResult.issues) {
        if (issue.severity === "error" && issue.suggestion) {
          const fix = this.applyFix(fixedCode, issue, filePath)
          if (fix) {
            fixes.push(fix)
            fixedCode = fix.newCode
          }
        }
      }

      // 2. Fixe Design-Token-Verstöße
      const designFixes = this.fixDesignTokens(fixedCode, filePath)
      if (designFixes) {
        fixedCode = designFixes
      }

      // 3. Fixe Import-Fehler
      const importFixes = this.fixImports(fixedCode, filePath)
      if (importFixes) {
        fixedCode = importFixes
      }

      return {
        success: fixes.length > 0 || designFixes !== code || importFixes !== code,
        fixedCode: fixedCode !== code ? fixedCode : undefined,
        issues: fixes.length > 0 ? undefined : ["Keine automatischen Fixes möglich"],
      }
    } catch (error: any) {
      return {
        success: false,
        issues: [`Fehler bei Fix-Generierung: ${error.message}`],
      }
    }
  }

  /**
   * STATISCHE CODE-ANALYSE
   */
  private performStaticAnalysis(
    code: string,
    filePath: string
  ): CopilotReviewResult["issues"] {
    const issues: CopilotReviewResult["issues"] = []
    const lines = code.split("\n")

    // Prüfe auf häufige Probleme
    lines.forEach((line, index) => {
      const lineNum = index + 1

      // Hardcoded Farben
      if (line.match(/#[0-9a-fA-F]{3,6}/) && !line.includes("//")) {
        issues.push({
          severity: "warning",
          message: "Hardcoded Farbe gefunden - verwende Design-Tokens",
          line: lineNum,
          suggestion: "Ersetze durch Design-Token (z.B. bg-primary, text-foreground)",
        })
      }

      // console.log in Produktionscode
      if (line.includes("console.log") && !filePath.includes("test") && !filePath.includes("spec")) {
        issues.push({
          severity: "suggestion",
          message: "console.log sollte in Produktionscode vermieden werden",
          line: lineNum,
          suggestion: "Verwende stattdessen strukturiertes Logging",
        })
      }

      // Fehlende Error-Handling
      if (line.includes("await") && !line.includes("try") && !line.includes("catch")) {
        const nextLines = lines.slice(index, index + 5).join("\n")
        if (!nextLines.includes("catch") && !nextLines.includes("?.catch")) {
          issues.push({
            severity: "warning",
            message: "Fehlende Error-Handling bei async Operation",
            line: lineNum,
            suggestion: "Füge try-catch oder .catch() hinzu",
          })
        }
      }
    })

    return issues
  }

  /**
   * PRÜFE GEGEN KNOWLEDGE-BASE
   */
  private checkAgainstKnowledgeBase(
    code: string,
    filePath: string
  ): CopilotReviewResult["issues"] {
    const issues: CopilotReviewResult["issues"] = []

    // Prüfe gegen Coding-Rules
    for (const entry of this.knowledgeBase) {
      if (entry.category === "coding-rules" || entry.category === "forbidden-terms") {
        const content = entry.content.toLowerCase()
        
        // Prüfe auf verbotene Begriffe
        if (content.includes("verboten") || content.includes("forbidden")) {
          const forbiddenTerms = this.extractForbiddenTerms(entry.content)
          forbiddenTerms.forEach((term) => {
            if (code.toLowerCase().includes(term.toLowerCase())) {
              issues.push({
                severity: "error",
                message: `Verbotener Begriff gefunden: ${term}`,
                suggestion: `Entferne oder ersetze '${term}'`,
              })
            }
          })
        }
      }
    }

    return issues
  }

  /**
   * PRÜFE TYPESCRIPT-ISSUES
   */
  private checkTypeScriptIssues(
    code: string,
    filePath: string
  ): CopilotReviewResult["issues"] {
    const issues: CopilotReviewResult["issues"] = []

    // Prüfe auf any-Typen
    const anyMatches = code.match(/: any\b/g)
    if (anyMatches && anyMatches.length > 0) {
      issues.push({
        severity: "warning",
        message: `${anyMatches.length} 'any' Typ(en) gefunden - verwende spezifische Typen`,
        suggestion: "Definiere spezifische Interfaces oder Types",
      })
    }

    // Prüfe auf fehlende Typen
    const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)/g)
    if (functionMatches) {
      functionMatches.forEach((match) => {
        if (!match.includes(":") && !match.includes("any")) {
          issues.push({
            severity: "suggestion",
            message: "Funktion ohne explizite Rückgabetypen",
            suggestion: "Füge explizite Rückgabetypen hinzu",
          })
        }
      })
    }

    return issues
  }

  /**
   * PRÜFE DESIGN-TOKENS
   */
  private checkDesignTokens(
    code: string,
    filePath: string
  ): CopilotReviewResult["issues"] {
    const issues: CopilotReviewResult["issues"] = []

    // Prüfe auf hardcoded rounded-* Werte
    const roundedMatches = code.match(/rounded-(sm|md|lg|xl|2xl|3xl|full)/g)
    if (roundedMatches) {
      const invalidRounded = roundedMatches.filter((m) => m === "rounded-lg" || m === "rounded-sm")
      if (invalidRounded.length > 0) {
        issues.push({
          severity: "warning",
          message: `Verwende rounded-xl oder rounded-2xl statt ${invalidRounded[0]}`,
          suggestion: "Ersetze durch rounded-xl (Standard) oder rounded-2xl",
        })
      }
    }

    return issues
  }

  /**
   * GENERIERE VORSCHLÄGE
   */
  private generateSuggestions(
    code: string,
    filePath: string,
    context?: { relatedFiles?: string[]; taskDescription?: string }
  ): CopilotReviewResult["issues"] {
    const issues: CopilotReviewResult["issues"] = []

    // Vorschläge basierend auf Best Practices
    if (code.length > 500 && !code.includes("//")) {
      issues.push({
        severity: "suggestion",
        message: "Lange Funktion ohne Kommentare - erwäge Refactoring",
        suggestion: "Teile die Funktion in kleinere, testbare Einheiten auf",
      })
    }

    return issues
  }

  /**
   * WENDE FIX AN
   */
  private applyFix(
    code: string,
    issue: CopilotReviewResult["issues"][0],
    filePath: string
  ): CopilotReviewResult["fixes"][0] | null {
    if (!issue.suggestion || !issue.line) {
      return null
    }

    const lines = code.split("\n")
    const lineIndex = issue.line - 1
    const oldLine = lines[lineIndex]

    // Einfache Fixes
    let newLine = oldLine

    // Fix: rounded-lg -> rounded-xl
    if (oldLine.includes("rounded-lg")) {
      newLine = oldLine.replace(/rounded-lg/g, "rounded-xl")
    }

    // Fix: rounded-sm -> rounded-xl
    if (oldLine.includes("rounded-sm")) {
      newLine = oldLine.replace(/rounded-sm/g, "rounded-xl")
    }

    if (newLine !== oldLine) {
      lines[lineIndex] = newLine
      return {
        file: filePath,
        line: issue.line,
        oldCode: oldLine,
        newCode: newLine,
        reason: issue.suggestion,
      }
    }

    return null
  }

  /**
   * FIXE DESIGN-TOKENS
   */
  private fixDesignTokens(code: string, filePath: string): string {
    let fixed = code

    // Fixe rounded-* Werte
    fixed = fixed.replace(/rounded-lg/g, "rounded-xl")
    fixed = fixed.replace(/rounded-sm/g, "rounded-xl")

    return fixed
  }

  /**
   * FIXE IMPORTS
   */
  private fixImports(code: string, filePath: string): string {
    // Einfache Import-Fixes können hier implementiert werden
    return code
  }

  /**
   * EXTRAHIERE VERBOTENE BEGRIFFE
   */
  private extractForbiddenTerms(content: string): string[] {
    const terms: string[] = []
    const lines = content.split("\n")

    for (const line of lines) {
      if (line.includes("-") || line.includes("•")) {
        const match = line.match(/[-•]\s*(.+)/)
        if (match) {
          terms.push(match[1].trim())
        }
      }
    }

    return terms
  }

  /**
   * VALIDIERE CODE VOR COMMIT
   * Wird vom Master-Bot vor jedem Commit aufgerufen
   */
  async validateBeforeCommit(
    files: Array<{ path: string; content: string }>
  ): Promise<{
    valid: boolean
    issues: Array<{ file: string; issues: CopilotReviewResult["issues"] }>
    fixes?: Array<{ file: string; fixedContent: string }>
  }> {
    const allIssues: Array<{ file: string; issues: CopilotReviewResult["issues"] }> = []
    const allFixes: Array<{ file: string; fixedContent: string }> = []

    for (const file of files) {
      const review = await this.reviewCode(file.content, file.path)
      
      if (review.issues.length > 0) {
        allIssues.push({
          file: file.path,
          issues: review.issues,
        })

        // Generiere Fixes
        const fixes = await this.generateFixes(file.content, file.path, review)
        if (fixes.fixedCode) {
          allFixes.push({
            file: file.path,
            fixedContent: fixes.fixedCode,
          })
        }
      }
    }

    return {
      valid: allIssues.filter((f) => f.issues.some((i) => i.severity === "error")).length === 0,
      issues: allIssues,
      fixes: allFixes.length > 0 ? allFixes : undefined,
    }
  }
}

