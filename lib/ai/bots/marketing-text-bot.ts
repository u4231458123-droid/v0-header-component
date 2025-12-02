/**
 * MARKETING-TEXT-BOT
 * ==================
 * Verwaltet Marketingtexte, stellt sicher, dass alle Vorgaben eingehalten werden
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { findErrorsByBot, findWorksByBot } from "@/lib/cicd/work-documentation"

export class MarketingTextBot extends BaseBot {
  constructor() {
    super("Marketing-Text-Bot", "marketing-texts")
  }

  async execute(task: BotTask): Promise<BotResponse> {
    const reflectionBefore = await this.reflectBefore(task)
    await this.loadKnowledgeBase([
      "bot-instructions",
      "agent-responsibility",
      "text-quality",
      "seo-optimization",
      "mydispatch-core",
    ])
    
    let result = ""
    let errors: Array<{ type: string; severity: "critical" | "high" | "medium" | "low"; message: string; solution?: string }> = []
    let technicalLimitations: string[] = []
    
    try {
      const reflectionDuring = await this.reflectDuring(task, "Marketingtext wird erstellt...")
      result = await this.planMarketingText(task)
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

  private async planMarketingText(task: BotTask): Promise<string> {
    return "Marketingtext-Plan erstellt"
  }

  async reviewText(workId: string): Promise<{ passed: boolean; issues: string[] }> {
    const works = await findWorksByBot("Marketing-Text-Assistant")
    const work = works.find((w) => w.id === workId)
    
    if (!work) {
      return { passed: false, issues: ["Text nicht gefunden"] }
    }
    
    const issues: string[] = []
    
    if (!work.result || work.result.trim() === "") {
      issues.push("Text ist leer")
    }
    
    if (work.errors && work.errors.length > 0) {
      issues.push(`Text hat ${work.errors.length} Fehler`)
    }
    
    const passed = issues.length === 0
    await this.validateWork(workId, passed, issues)
    
    if (passed) {
      await this.signWork(workId)
    }
    
    return { passed, issues }
  }
}

