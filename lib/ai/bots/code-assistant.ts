/**
 * CODE-ASSISTANT
 * ==============
 * Führt Code-Änderungen aus, nimmt Berichte entgegen, koordiniert Prüfungen
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { getBotArchitectureForArea } from "./bot-architecture"
import { botCommunicationManager, type BotAnswer } from "./bot-communication"

export class CodeAssistant extends BaseBot {
  constructor() {
    super("Code-Assistant", "code-development")
  }

  async execute(task: BotTask): Promise<BotResponse> {
    const reflectionBefore = await this.reflectBefore(task)
    await this.loadKnowledgeBase([
      "bot-instructions",
      "agent-responsibility",
      "coding-rules",
      "design-guidelines",
      "best-practices",
      "systemwide-thinking",
    ])
    
    let result = ""
    let errors: Array<{ type: string; severity: "critical" | "high" | "medium" | "low"; message: string; solution?: string }> = []
    let technicalLimitations: string[] = []
    
    try {
      const reflectionDuring = await this.reflectDuring(task, "Code-Änderung wird ausgeführt...")
      
      result = await this.performCodeChange(task)
      
      const reflectionAfter = await this.reflectAfter(task, result, errors.map((e) => e.message), technicalLimitations)
      
      const documentation = await this.documentWork(
        task,
        result,
        reflectionBefore,
        reflectionDuring,
        reflectionAfter,
        errors.length > 0 ? errors : undefined,
        technicalLimitations.length > 0 ? technicalLimitations : undefined
      )
      
      // Gebe Prüfungsauftrag weiter
      await this.forwardValidationRequest(documentation.id)
      
      return {
        success: errors.length === 0,
        result,
        errors: errors.map((e) => e.message),
        documentation,
      }
    } catch (error: any) {
      errors.push({
        type: "execution-error",
        severity: "critical",
        message: `Fehler: ${error.message}`,
      })
      
      const reflectionAfter = await this.reflectAfter(task, "Fehler", errors.map((e) => e.message), technicalLimitations)
      const documentation = await this.documentWork(
        task,
        "Fehler",
        reflectionBefore,
        await this.reflectDuring(task, "Fehler aufgetreten"),
        reflectionAfter,
        errors,
        technicalLimitations
      )
      
      return {
        success: false,
        result: "Fehler",
        errors: errors.map((e) => e.message),
        documentation,
      }
    }
  }

  /**
   * Führe Code-Änderung aus
   */
  private async performCodeChange(task: BotTask): Promise<string> {
    // Implementierung je nach Task-Typ
    // - Code-Änderungen ausführen
    // - Code-Analyse durchführen
    // - Tests ausführen
    
    return "Code-Änderung ausgeführt"
  }

  /**
   * Weiterleitung Prüfungsauftrag
   */
  private async forwardValidationRequest(workId: string): Promise<void> {
    const { validationCoordinator } = await import("./validation-coordinator")
    
    // Erstelle Prüfungsauftrag über Validation-Coordinator
    await validationCoordinator.createValidationRequest(workId, this.area)
    console.log(`📋 Prüfungsauftrag erstellt: ${workId}`)
  }

  /**
   * Sammle Prüfungsergebnisse
   */
  async collectValidationResults(workId: string): Promise<any> {
    const { validationCoordinator } = await import("./validation-coordinator")
    
    // Sammle Ergebnisse über Validation-Coordinator
    const results = await validationCoordinator.collectValidationResults(workId)
    console.log(`📊 Prüfungsergebnisse gesammelt für ${workId}`)
    return results
  }

  /**
   * Erstelle Auswertung
   */
  async createEvaluation(workId: string, botReport: any, validationResults: any): Promise<string> {
    // Erstelle vollständige Auswertung: Bot-Angaben vs. reale Prüfungsdaten
    const evaluation = `
# Auswertung: ${workId}

## Bot-Angaben
${JSON.stringify(botReport, null, 2)}

## Prüfungsergebnisse
${JSON.stringify(validationResults, null, 2)}

## Vergleich
- Übereinstimmungen: ...
- Abweichungen: ...
- Empfehlungen: ...
`
    return evaluation
  }
}

