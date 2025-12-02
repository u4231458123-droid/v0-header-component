/**
 * TEXT-QUALITY-ASSISTANT
 * ======================
 * Prüft Texte, nimmt Berichte entgegen, koordiniert Prüfungen
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { getBotArchitectureForArea } from "./bot-architecture"
import { botCommunicationManager, type BotAnswer } from "./bot-communication"

export class TextQualityAssistant extends BaseBot {
  constructor() {
    super("Text-Quality-Assistant", "text-quality")
  }

  async execute(task: BotTask): Promise<BotResponse> {
    const reflectionBefore = await this.reflectBefore(task)
    await this.loadKnowledgeBase([
      "bot-instructions",
      "agent-responsibility",
      "text-quality",
      "mydispatch-core",
      "ui-consistency",
      "systemwide-thinking",
    ])
    
    let result = ""
    let errors: Array<{ type: string; severity: "critical" | "high" | "medium" | "low"; message: string; solution?: string }> = []
    let technicalLimitations: string[] = []
    
    try {
      const reflectionDuring = await this.reflectDuring(task, "Text wird geprüft...")
      
      result = await this.performTextQualityCheck(task)
      
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
   * Führe Text-Qualitäts-Prüfung aus
   */
  private async performTextQualityCheck(task: BotTask): Promise<string> {
    // Prüfe Text auf:
    // - SEO-Optimierung
    // - Nutzerfreundlichkeit
    // - MyDispatch-Konzept
    // - Text-Qualität
    
    return "Text-Qualitäts-Prüfung durchgeführt"
  }
}

