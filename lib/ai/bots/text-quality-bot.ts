/**
 * TEXT-QUALITY-BOT
 * ================
 * Verwaltet Text-Qualität, stellt sicher, dass alle Text-Vorgaben eingehalten werden
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { findErrorsByBot, findWorksByBot } from "@/lib/cicd/work-documentation"

export class TextQualityBot extends BaseBot {
  constructor() {
    super("Text-Quality-Bot", "text-quality")
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
      const reflectionDuring = await this.reflectDuring(task, "Text-Qualität wird verwaltet...")
      
      result = await this.performTextQualityTask(task)
      
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
   * Führe Text-Qualitäts-Aufgabe aus
   */
  private async performTextQualityTask(task: BotTask): Promise<string> {
    // Implementierung je nach Task-Typ
    return "Text-Qualität verwaltet"
  }

  /**
   * Prüfe Text-Qualität
   */
  async reviewTextQuality(workId: string): Promise<{ passed: boolean; issues: string[] }> {
    const works = await findWorksByBot("Text-Quality-Assistant")
    const work = works.find((w) => w.id === workId)
    
    if (!work) {
      return { passed: false, issues: ["Text-Qualitäts-Prüfung nicht gefunden"] }
    }
    
    const issues: string[] = []
    
    // Prüfe Vollständigkeit
    if (!work.result || work.result.trim() === "") {
      issues.push("Text-Qualitäts-Prüfung ist leer")
    }
    
    // Prüfe SEO
    const seoIssues = this.checkSEO(work.result)
    issues.push(...seoIssues)
    
    // Prüfe Nutzerfreundlichkeit
    const usabilityIssues = this.checkUsability(work.result)
    issues.push(...usabilityIssues)
    
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
   * Prüfe SEO
   */
  private checkSEO(text: string): string[] {
    const issues: string[] = []
    
    // Prüfe auf SEO-Keywords
    const seoKeywords = ["MyDispatch", "Taxi", "Fahrzeug", "Buchung", "Auftrag"]
    const lowerText = text.toLowerCase()
    
    let foundKeywords = 0
    for (const keyword of seoKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords++
      }
    }
    
    if (foundKeywords < 2) {
      issues.push("Zu wenige SEO-Keywords gefunden")
    }
    
    return issues
  }

  /**
   * Prüfe Nutzerfreundlichkeit
   */
  private checkUsability(text: string): string[] {
    const issues: string[] = []
    
    // Prüfe auf klare Struktur
    if (text.length > 500 && !text.includes("\n\n")) {
      issues.push("Text ist zu lang ohne Absätze - schwer lesbar")
    }
    
    // Prüfe auf zu lange Sätze
    const sentences = text.split(/[.!?]+/)
    const longSentences = sentences.filter((s) => s.split(" ").length > 25)
    if (longSentences.length > 0) {
      issues.push(`${longSentences.length} zu lange Sätze gefunden`)
    }
    
    return issues
  }

  /**
   * Prüfe MyDispatch-Konzept
   */
  private checkMyDispatchConcept(text: string): string[] {
    const issues: string[] = []
    
    // Prüfe ob MyDispatch-Kernwerte erwähnt werden
    const coreValues = ["einfach", "qualität", "nutzen", "professionell"]
    const lowerText = text.toLowerCase()
    
    let foundValues = 0
    for (const value of coreValues) {
      if (lowerText.includes(value)) {
        foundValues++
      }
    }
    
    if (foundValues === 0) {
      issues.push("MyDispatch-Kernwerte werden nicht erwähnt")
    }
    
    return issues
  }
}

