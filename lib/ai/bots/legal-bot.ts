/**
 * LEGAL-BOT
 * =========
 * Verwaltet Rechtsbereiche, stellt sicher, dass alle rechtlichen Vorgaben eingehalten werden
 */

import { BaseBot, type BotTask, type BotResponse } from "./base-bot"
import { findErrorsByBot, findWorksByBot } from "@/lib/cicd/work-documentation"

export class LegalBot extends BaseBot {
  constructor() {
    super("Legal-Bot", "legal")
  }

  async execute(task: BotTask): Promise<BotResponse> {
    const reflectionBefore = await this.reflectBefore(task)
    await this.loadKnowledgeBase([
      "bot-instructions",
      "agent-responsibility",
      "legal",
      "compliance",
    ])
    
    let result = ""
    let errors: Array<{ type: string; severity: "critical" | "high" | "medium" | "low"; message: string; solution?: string }> = []
    let technicalLimitations: string[] = []
    
    try {
      const reflectionDuring = await this.reflectDuring(task, "Rechtstext wird erstellt...")
      result = await this.planLegalText(task)
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

  private async planLegalText(task: BotTask): Promise<string> {
    return "Rechtstext-Plan erstellt"
  }

  async reviewLegalText(workId: string): Promise<{ passed: boolean; issues: string[] }> {
    const works = await findWorksByBot("Legal-Assistant")
    const work = works.find((w) => w.id === workId)
    
    if (!work) {
      return { passed: false, issues: ["Rechtstext nicht gefunden"] }
    }
    
    const issues: string[] = []
    
    if (!work.result || work.result.trim() === "") {
      issues.push("Rechtstext ist leer")
    }
    
    if (work.errors && work.errors.length > 0) {
      issues.push(`Rechtstext hat ${work.errors.length} Fehler`)
    }
    
    const passed = issues.length === 0
    await this.validateWork(workId, passed, issues)
    
    if (passed) {
      await this.signWork(workId)
    }
    
    return { passed, issues }
  }
}

