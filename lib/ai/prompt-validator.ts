/**
 * Prompt Validator
 * ================
 * Validiert und verbessert User-Prompts automatisch.
 * Implementiert das Input Security Protocol.
 * 
 * Funktionen:
 * - isPromptSufficient() - Prüft ob Prompt ausreichend ist
 * - suggestImprovements() - Schlägt Verbesserungen vor
 * - autoOptimize() - Optimiert Prompt automatisch
 */

import { monitoring } from "./monitoring"

// Validierungsergebnis
export interface PromptValidation {
  sufficient: boolean
  score: number
  issues: PromptIssue[]
  suggestions: string[]
  autoOptimized?: string
}

// Prompt-Problem
export interface PromptIssue {
  type: "length" | "clarity" | "context" | "specificity" | "actionability"
  severity: "error" | "warning" | "info"
  message: string
}

// Validierungsregeln
export interface ValidationRule {
  id: string
  name: string
  check: (input: string) => boolean
  severity: PromptIssue["severity"]
  message: string
  suggestion: string
}

/**
 * Prompt Validator Engine
 */
export class PromptValidatorEngine {
  private static instance: PromptValidatorEngine
  private rules: ValidationRule[]
  private minWordCount = 5
  private optimalWordCount = 15

  private constructor() {
    this.rules = this.initializeRules()
  }

  static getInstance(): PromptValidatorEngine {
    if (!PromptValidatorEngine.instance) {
      PromptValidatorEngine.instance = new PromptValidatorEngine()
    }
    return PromptValidatorEngine.instance
  }

  /**
   * Initialisiere Validierungsregeln
   */
  private initializeRules(): ValidationRule[] {
    return [
      // Länge-Regeln
      {
        id: "min-length",
        name: "Minimale Länge",
        check: (input) => input.split(/\s+/).length >= this.minWordCount,
        severity: "error",
        message: "Prompt zu kurz (weniger als 5 Wörter)",
        suggestion: "Beschreibe genauer, was du erreichen möchtest"
      },
      {
        id: "optimal-length",
        name: "Optimale Länge",
        check: (input) => input.split(/\s+/).length >= this.optimalWordCount,
        severity: "info",
        message: "Prompt könnte detaillierter sein",
        suggestion: "Füge mehr Kontext hinzu für bessere Ergebnisse"
      },

      // Klarheits-Regeln
      {
        id: "has-action-verb",
        name: "Aktionsverb vorhanden",
        check: (input) => {
          const actionVerbs = [
            "erstelle", "baue", "implementiere", "füge", "hinzu", "ändere", "fixe",
            "repariere", "verbessere", "optimiere", "refactor", "teste", "prüfe",
            "dokumentiere", "lösche", "entferne", "update", "aktualisiere",
            "create", "build", "implement", "add", "change", "fix", "improve",
            "optimize", "test", "check", "document", "delete", "remove", "update"
          ]
          const inputLower = input.toLowerCase()
          return actionVerbs.some(verb => inputLower.includes(verb))
        },
        severity: "warning",
        message: "Kein klares Aktionsverb erkannt",
        suggestion: "Beginne mit einem Verb wie 'Erstelle', 'Implementiere', 'Fixe'"
      },

      // Kontext-Regeln
      {
        id: "has-target",
        name: "Ziel definiert",
        check: (input) => {
          // Prüfe auf Substantive/Ziele
          const hasTarget = /\b(button|dialog|page|component|api|endpoint|function|table|feature|bug|error|test)\b/i.test(input) ||
                           /\b(seite|komponente|funktion|tabelle|fehler|problem)\b/i.test(input)
          return hasTarget
        },
        severity: "warning",
        message: "Kein klares Ziel/Objekt erkannt",
        suggestion: "Spezifiziere, was genau geändert werden soll (z.B. 'Button', 'Dialog', 'API')"
      },

      // Spezifitäts-Regeln
      {
        id: "not-too-vague",
        name: "Nicht zu vage",
        check: (input) => {
          const vagueTerms = [
            "mach das", "mach es", "irgendwie", "besser", "schöner", "hübsch",
            "gut", "schneller", "fix das", "ändere es", "do it", "make it",
            "something", "somehow", "better", "nicer", "prettier"
          ]
          const inputLower = input.toLowerCase()
          return !vagueTerms.some(term => inputLower.includes(term))
        },
        severity: "warning",
        message: "Prompt enthält vage Begriffe",
        suggestion: "Ersetze vage Begriffe durch konkrete Beschreibungen"
      },

      // Aktionierbarkeit
      {
        id: "is-actionable",
        name: "Umsetzbar",
        check: (input) => {
          // Ein Prompt ist umsetzbar wenn er eine Aktion UND ein Ziel hat
          const hasAction = /\b(erstelle|baue|implementiere|füge|ändere|fixe|teste|create|build|implement|add|change|fix|test)\b/i.test(input)
          const hasObject = input.split(/\s+/).length >= 3
          return hasAction && hasObject
        },
        severity: "error",
        message: "Prompt ist nicht klar umsetzbar",
        suggestion: "Formuliere eine konkrete Aufgabe: '[Aktion] [Was] [Wo/Wie]'"
      }
    ]
  }

  /**
   * Prüfe ob Prompt ausreichend ist
   */
  isPromptSufficient(input: string): boolean {
    const validation = this.validate(input)
    return validation.sufficient
  }

  /**
   * Vollständige Validierung
   */
  validate(input: string): PromptValidation {
    const issues: PromptIssue[] = []
    const suggestions: string[] = []
    let score = 100

    // Trimme Input
    const trimmedInput = input.trim()

    // Prüfe alle Regeln
    for (const rule of this.rules) {
      if (!rule.check(trimmedInput)) {
        issues.push({
          type: this.getIssueType(rule.id),
          severity: rule.severity,
          message: rule.message
        })
        suggestions.push(rule.suggestion)

        // Score reduzieren
        switch (rule.severity) {
          case "error":
            score -= 30
            break
          case "warning":
            score -= 15
            break
          case "info":
            score -= 5
            break
        }
      }
    }

    // Score normalisieren
    score = Math.max(0, score)

    const validation: PromptValidation = {
      sufficient: score >= 50 && !issues.some(i => i.severity === "error"),
      score,
      issues,
      suggestions: [...new Set(suggestions)]
    }

    // Auto-Optimierung wenn nicht ausreichend
    if (!validation.sufficient) {
      validation.autoOptimized = this.autoOptimize(trimmedInput, validation)
    }

    return validation
  }

  /**
   * Issue-Typ aus Regel-ID ableiten
   */
  private getIssueType(ruleId: string): PromptIssue["type"] {
    if (ruleId.includes("length")) return "length"
    if (ruleId.includes("clarity") || ruleId.includes("verb")) return "clarity"
    if (ruleId.includes("context") || ruleId.includes("target")) return "context"
    if (ruleId.includes("vague")) return "specificity"
    return "actionability"
  }

  /**
   * Schlage Verbesserungen vor
   */
  suggestImprovements(input: string): string[] {
    const validation = this.validate(input)
    return validation.suggestions
  }

  /**
   * Optimiere Prompt automatisch
   */
  autoOptimize(input: string, validation?: PromptValidation): string {
    const val = validation || this.validate(input)
    let optimized = input.trim()

    // Zu kurz? Füge Kontext-Anfrage hinzu
    if (val.issues.some(i => i.type === "length" && i.severity === "error")) {
      optimized = `${optimized}

**Hinweis:** Bitte spezifiziere:
- Was genau soll geändert/erstellt werden?
- In welcher Datei/Komponente?
- Welches Verhalten wird erwartet?`
    }

    // Kein Aktionsverb? Füge Präfix hinzu
    if (val.issues.some(i => i.message.includes("Aktionsverb"))) {
      // Versuche Aktion aus Kontext zu erraten
      const inputLower = input.toLowerCase()
      if (inputLower.includes("bug") || inputLower.includes("fehler") || inputLower.includes("error")) {
        optimized = `Fixe: ${optimized}`
      } else if (inputLower.includes("test")) {
        optimized = `Teste: ${optimized}`
      } else {
        optimized = `Implementiere: ${optimized}`
      }
    }

    // Vage Begriffe? Füge Struktur hinzu
    if (val.issues.some(i => i.type === "specificity")) {
      optimized = `${optimized}

**Spezifikation benötigt:**
- Beschreibe das gewünschte Ergebnis konkret
- Nenne betroffene Dateien/Komponenten
- Definiere Akzeptanzkriterien`
    }

    return optimized
  }

  /**
   * Generiere Verbesserungsvorschlag als Dialog
   */
  generateImprovementDialog(input: string): string {
    const validation = this.validate(input)

    if (validation.sufficient) {
      return ""
    }

    let dialog = `⚠️ **Prompt zu vage.**\n\n`
    dialog += `**Erkannte Probleme:**\n`

    for (const issue of validation.issues) {
      const icon = issue.severity === "error" ? "❌" : issue.severity === "warning" ? "⚠️" : "ℹ️"
      dialog += `${icon} ${issue.message}\n`
    }

    dialog += `\n**Vorgeschlagener verbesserter Prompt:**\n\n`
    dialog += "```\n"
    dialog += validation.autoOptimized || this.autoOptimize(input, validation)
    dialog += "\n```\n\n"
    dialog += "**Soll ich mit dem verbesserten Prompt fortfahren?**"

    return dialog
  }

  /**
   * Quick-Check: Ist der Prompt gut genug für autonome Ausführung?
   */
  canExecuteAutonomously(input: string): {
    canExecute: boolean
    reason?: string
    improvedPrompt?: string
  } {
    const validation = this.validate(input)

    if (validation.score >= 70) {
      return { canExecute: true }
    }

    if (validation.score >= 50 && validation.autoOptimized) {
      return {
        canExecute: true,
        reason: "Prompt wurde automatisch optimiert",
        improvedPrompt: validation.autoOptimized
      }
    }

    return {
      canExecute: false,
      reason: `Prompt-Score zu niedrig (${validation.score}/100). ${validation.issues[0]?.message}`,
      improvedPrompt: validation.autoOptimized
    }
  }
}

/**
 * Input Security Protocol
 * Prüft Prompts bevor sie ausgeführt werden
 */
export class InputSecurityProtocol {
  private validator: PromptValidatorEngine
  private autoOptimizeEnabled: boolean

  constructor(autoOptimize = true) {
    this.validator = PromptValidatorEngine.getInstance()
    this.autoOptimizeEnabled = autoOptimize
  }

  /**
   * Prüfe Input und entscheide ob ausgeführt werden kann
   */
  async checkInput(input: string): Promise<{
    proceed: boolean
    originalInput: string
    finalInput: string
    wasOptimized: boolean
    dialog?: string
  }> {
    const validation = this.validator.validate(input)

    // Guter Prompt - direkt ausführen
    if (validation.sufficient && validation.score >= 70) {
      return {
        proceed: true,
        originalInput: input,
        finalInput: input,
        wasOptimized: false
      }
    }

    // Mittelmäßiger Prompt - automatisch optimieren wenn aktiviert
    if (this.autoOptimizeEnabled && validation.autoOptimized && validation.score >= 40) {
      monitoring.createAlert("info", "input-security", `Prompt automatisch optimiert (Score: ${validation.score})`)

      return {
        proceed: true,
        originalInput: input,
        finalInput: validation.autoOptimized,
        wasOptimized: true
      }
    }

    // Schlechter Prompt - Dialog anzeigen
    const dialog = this.validator.generateImprovementDialog(input)

    monitoring.createAlert("warning", "input-security", `Prompt zu vage (Score: ${validation.score})`)

    return {
      proceed: false,
      originalInput: input,
      finalInput: validation.autoOptimized || input,
      wasOptimized: false,
      dialog
    }
  }

  /**
   * Aktiviere/Deaktiviere automatische Optimierung
   */
  setAutoOptimize(enabled: boolean): void {
    this.autoOptimizeEnabled = enabled
  }
}

/**
 * Singleton-Exports
 */
export const promptValidator = PromptValidatorEngine.getInstance()
export const inputSecurity = new InputSecurityProtocol(true)

/**
 * Convenience-Funktionen
 */
export function isPromptSufficient(input: string): boolean {
  return promptValidator.isPromptSufficient(input)
}

export function validatePrompt(input: string): PromptValidation {
  return promptValidator.validate(input)
}

export function optimizePrompt(input: string): string {
  return promptValidator.autoOptimize(input)
}

