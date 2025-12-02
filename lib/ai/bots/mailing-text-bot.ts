/**
 * MAILING-TEXT-BOT
 * ================
 * Verwaltet Mailing-Texte, stellt sicher, dass alle Vorgaben eingehalten werden
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { findErrorsByBot, findWorksByBot } from "@/lib/cicd/work-documentation"

export class MailingTextBot extends BaseBot {
  constructor() {
    super("Mailing-Text-Bot", "mailing-texts")
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
      const reflectionDuring = await this.reflectDuring(task, "Mailing-Text wird verwaltet...")
      
      result = await this.performMailingTextTask(task)
      
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
   * Führe Mailing-Text-Aufgabe aus
   */
  private async performMailingTextTask(task: BotTask): Promise<string> {
    // Implementierung je nach Task-Typ
    return "Mailing-Text verwaltet"
  }

  /**
   * Prüfe Mailing-Text
   */
  async reviewMailingText(workId: string): Promise<{ passed: boolean; issues: string[] }> {
    const works = await findWorksByBot("Mailing-Text-Assistant")
    const work = works.find((w) => w.id === workId)
    
    if (!work) {
      return { passed: false, issues: ["Mailing-Text nicht gefunden"] }
    }
    
    const issues: string[] = []
    
    // Prüfe Vollständigkeit
    if (!work.result || work.result.trim() === "") {
      issues.push("Mailing-Text ist leer")
    }
    
    // Prüfe Branding
    const brandingIssues = this.checkBranding(work.result)
    issues.push(...brandingIssues)
    
    // Prüfe Professionalität
    const professionalismIssues = this.checkProfessionalism(work.result)
    issues.push(...professionalismIssues)
    
    // Prüfe MyDispatch-Konzept
    const conceptIssues = this.checkMyDispatchConcept(work.result)
    issues.push(...conceptIssues)
    
    const passed = issues.length === 0
    
    if (passed) {
      await this.signWork(workId)
    }
    
    return { passed, issues }
  }

  /**
   * Finde Fehler und erstelle Nachjustierungsauftrag
   */
  async findErrorsAndCreateAdjustmentRequest(botName: string): Promise<void> {
    const { adjustmentRequestSystem } = await import("./adjustment-request-system")
    
    try {
      const request = await adjustmentRequestSystem.createAdjustmentRequest(botName)
      console.log(`🔧 Nachjustierungsauftrag erstellt: ${request.id} für ${botName}`)
      await adjustmentRequestSystem.executeAdjustment(request.id)
    } catch (error: any) {
      if (error.message.includes("Keine Fehler gefunden")) {
        console.log(`✅ Keine Fehler für ${botName}, keine Nachjustierung nötig`)
      } else {
        console.error(`❌ Fehler beim Erstellen des Nachjustierungsauftrags: ${error.message}`)
      }
    }
  }

  /**
   * Prüfe Branding
   */
  private checkBranding(text: string): string[] {
    const issues: string[] = []
    
    // Prüfe ob MyDispatch-Branding vorhanden
    if (!text.includes("MyDispatch") && !text.includes("my-dispatch")) {
      issues.push("MyDispatch-Branding fehlt")
    }
    
    return issues
  }

  /**
   * Prüfe Professionalität
   */
  private checkProfessionalism(text: string): string[] {
    const issues: string[] = []
    
    // Prüfe auf unprofessionelle Begriffe
    const unprofessionalTerms = ["hey", "hi", "moin", "servus"]
    const lowerText = text.toLowerCase()
    
    for (const term of unprofessionalTerms) {
      if (lowerText.includes(term)) {
        issues.push(`Unprofessioneller Begriff gefunden: ${term}`)
      }
    }
    
    return issues
  }

  /**
   * Prüfe MyDispatch-Konzept
   */
  private checkMyDispatchConcept(text: string): string[] {
    const issues: string[] = []
    
    // Prüfe ob MyDispatch-Kernwerte erwähnt werden
    const coreValues = ["Einfachheit", "Qualität", "Nutzen", "professionell"]
    const lowerText = text.toLowerCase()
    
    let foundValues = 0
    for (const value of coreValues) {
      if (lowerText.includes(value.toLowerCase())) {
        foundValues++
      }
    }
    
    if (foundValues === 0) {
      issues.push("MyDispatch-Kernwerte werden nicht erwähnt")
    }
    
    return issues
  }
}

