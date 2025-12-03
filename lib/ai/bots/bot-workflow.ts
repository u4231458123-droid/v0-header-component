/**
 * INTELLIGENTE ARBEITSVORGABEN FÜR ALLE BOTS
 * ==========================================
 * Vollständige Prüfungspläne für jeden Bot und Bereich
 * Alle Vorgaben stets kennen und zu 100% beachten
 * Intelligente Behandlung von fehlerhaften Vorgaben
 * SYSTEMWEITE ÄNDERUNGEN - NIEMALS NUR EIN BEREICH
 */

import { type KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { loadKnowledgeForTaskWithCICD } from "@/lib/knowledge-base/load-with-cicd"
import { MasterBot, type ChangeRequest } from "./master-bot"
import { logError } from "@/lib/cicd/error-logger"

export interface WorkflowStep {
  id: string
  name: string
  description: string
  required: boolean
  order: number
  validator?: (context: any) => Promise<{ valid: boolean; errors: string[] }>
}

export interface BotWorkflow {
  botId: string
  version: string
  steps: WorkflowStep[]
  knowledgeCategories: KnowledgeCategory[]
  mandatoryChecks: string[]
}

export class BotWorkflowManager {
  private masterBot: MasterBot
  private workflows: Map<string, BotWorkflow> = new Map()

  constructor() {
    this.masterBot = new MasterBot()
    this.initializeWorkflows()
  }

  /**
   * Initialisiere Arbeitsvorgaben für alle Bots
   */
  private initializeWorkflows() {
    // System-Bot Workflow
    this.workflows.set("system-bot", {
      botId: "system-bot",
      version: "1.0.0",
      knowledgeCategories: [
        "design-guidelines",
        "coding-rules",
        "forbidden-terms",
        "architecture",
        "best-practices",
        "functionality-rules",
        "ci-cd",
        "error-handling",
      ],
      mandatoryChecks: [
        "knowledge-base-loaded",
        "ist-analyse-completed",
        "code-validation-passed",
        "design-guidelines-checked",
        "functionality-preserved",
        "systemwide-impact-analyzed",
      ],
      steps: [
        {
          id: "load-knowledge",
          name: "Knowledge-Base laden",
          description: "Lade alle Vorgaben, Regeln, Verbote und Dokumentationen",
          required: true,
          order: 1,
          validator: async (context) => {
            const knowledge = loadKnowledgeForTask("system-maintenance", context.knowledgeCategories || [])
            return {
              valid: knowledge.length > 0,
              errors: knowledge.length === 0 ? ["Knowledge-Base konnte nicht geladen werden"] : [],
            }
          },
        },
        {
          id: "ist-analyse",
          name: "IST-Analyse durchführen",
          description: "Führe vollständige IST-Analyse des aktuellen Zustands durch",
          required: true,
          order: 2,
          validator: async (context) => {
            return {
              valid: !!context.currentState,
              errors: !context.currentState ? ["IST-Analyse nicht durchgeführt"] : [],
            }
          },
        },
        {
          id: "analyze-systemwide-impact",
          name: "Systemweite Auswirkungen analysieren",
          description: "Analysiere systemweite Auswirkungen der Änderung",
          required: true,
          order: 3,
          validator: async (context) => {
            return {
              valid: !!context.systemwideImpact,
              errors: !context.systemwideImpact ? ["Systemweite Auswirkungsanalyse nicht durchgeführt"] : [],
            }
          },
        },
        {
          id: "code-analysis",
          name: "Code-Analyse",
          description: "Analysiere Code systematisch auf Fehler, Warnungen und Optimierungen",
          required: true,
          order: 4,
        },
        {
          id: "validate-code",
          name: "Code-Validierung",
          description: "Validiere Code nach Änderungen (Syntax, Types, Design)",
          required: true,
          order: 5,
        },
        {
          id: "check-dependencies",
          name: "Abhängigkeiten prüfen",
          description: "Prüfe alle Abhängigkeiten (Docs, Onboarding, Browser-Führung)",
          required: true,
          order: 6,
        },
        {
          id: "document-changes",
          name: "Änderungen dokumentieren",
          description: "Dokumentiere alle Änderungen vollständig und systemweit",
          required: true,
          order: 7,
        },
      ],
    })

    // Quality-Bot Workflow
    this.workflows.set("quality-bot", {
      botId: "quality-bot",
      version: "1.0.0",
      knowledgeCategories: [
        "design-guidelines",
        "coding-rules",
        "forbidden-terms",
        "functionality-rules",
        "best-practices",
        "ci-cd",
        "error-handling",
        "account-rules",
        "routing-rules",
        "pdf-generation",
        "email-templates",
      ],
      mandatoryChecks: [
        "knowledge-base-loaded",
        "all-rules-checked",
        "violations-documented",
        "systemwide-consistency-checked",
      ],
      steps: [
        {
          id: "load-knowledge",
          name: "Knowledge-Base laden",
          description: "Lade alle Vorgaben und Regeln",
          required: true,
          order: 1,
        },
        {
          id: "check-design",
          name: "Design-Vorgaben prüfen",
          description: "Prüfe Code gegen alle Design-Vorgaben",
          required: true,
          order: 2,
        },
        {
          id: "check-functionality",
          name: "Funktionalität prüfen",
          description: "Prüfe dass keine Funktionalität entfernt wurde",
          required: true,
          order: 3,
        },
        {
          id: "check-routing",
          name: "Routing-Regeln prüfen",
          description: "Prüfe Account-Routing-Regeln",
          required: true,
          order: 4,
        },
        {
          id: "check-systemwide-consistency",
          name: "Systemweite Konsistenz prüfen",
          description: "Prüfe Konsistenz über alle Bereiche hinweg",
          required: true,
          order: 5,
        },
        {
          id: "document-violations",
          name: "Verstöße dokumentieren",
          description: "Dokumentiere alle gefundenen Verstöße",
          required: true,
          order: 6,
        },
      ],
    })

    // Prompt-Optimization-Bot Workflow
    this.workflows.set("prompt-optimization-bot", {
      botId: "prompt-optimization-bot",
      version: "1.0.0",
      knowledgeCategories: [
        "design-guidelines",
        "coding-rules",
        "forbidden-terms",
        "best-practices",
        "error-handling",
        "ci-cd",
      ],
      mandatoryChecks: [
        "knowledge-base-loaded",
        "support-knowledge-loaded",
        "test-results-loaded",
        "prompt-optimized",
        "performance-tracked",
        "systemwide-impact-analyzed",
      ],
      steps: [
        {
          id: "load-knowledge",
          name: "Knowledge-Base laden",
          description: "Lade alle relevanten Daten",
          required: true,
          order: 1,
        },
        {
          id: "load-support-knowledge",
          name: "Support-Bot Wissen laden",
          description: "Lade Support-Bot Wissen",
          required: true,
          order: 2,
        },
        {
          id: "load-test-results",
          name: "Prüfungsergebnisse laden",
          description: "Lade Prüfungsergebnisse und Fehler-Patterns",
          required: true,
          order: 3,
        },
        {
          id: "analyze-systemwide-impact",
          name: "Systemweite Auswirkungen analysieren",
          description: "Analysiere systemweite Auswirkungen der Prompt-Änderung",
          required: true,
          order: 4,
        },
        {
          id: "optimize-prompt",
          name: "Prompt optimieren",
          description: "Optimiere Prompt basierend auf allen Daten",
          required: true,
          order: 5,
        },
        {
          id: "track-performance",
          name: "Performance tracken",
          description: "Tracke Performance des optimierten Prompts",
          required: true,
          order: 6,
        },
      ],
    })
  }

  /**
   * Führe Workflow für Bot aus
   */
  async executeWorkflow(botId: string, context: any): Promise<{
    success: boolean
    completedSteps: string[]
    failedSteps: string[]
    errors: string[]
    warnings: string[]
  }> {
    const workflow = this.workflows.get(botId)
    if (!workflow) {
      throw new Error(`Workflow für Bot ${botId} nicht gefunden`)
    }

    // 1. Lade Knowledge-Base
    const { loadKnowledgeForTask } = await import("@/lib/knowledge-base/structure")
    const knowledge = loadKnowledgeForTask(botId, workflow.knowledgeCategories)
    context.knowledgeBase = knowledge

    const completedSteps: string[] = []
    const failedSteps: string[] = []
    const errors: string[] = []
    const warnings: string[] = []

    // 2. Führe alle Schritte aus
    for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
      try {
        // Prüfe ob Schritt erforderlich ist
        if (step.required) {
          // Führe Validator aus falls vorhanden
          if (step.validator) {
            const validation = await step.validator(context)
            if (!validation.valid) {
              failedSteps.push(step.id)
              errors.push(...validation.errors.map((e) => `${step.name}: ${e}`))
              if (step.required) {
                // Stoppe bei erforderlichem Fehler
                break
              }
              continue
            }
          }

          completedSteps.push(step.id)
        }
      } catch (error: any) {
        failedSteps.push(step.id)
        errors.push(`${step.name}: ${error.message}`)
        if (step.required) {
          break
        }
      }
    }

    // 3. Prüfe obligatorische Checks
    const missingChecks = workflow.mandatoryChecks.filter((check) => !completedSteps.includes(check))
    if (missingChecks.length > 0) {
      warnings.push(`Fehlende obligatorische Checks: ${missingChecks.join(", ")}`)
    }

    return {
      success: failedSteps.length === 0 && missingChecks.length === 0,
      completedSteps,
      failedSteps,
      errors,
      warnings,
    }
  }

  /**
   * Prüfe Vorgabe auf Fehler und beantrage Korrektur
   */
  async checkVorgabeAndRequestCorrection(
    botId: string,
    vorgabe: string,
    vorgabeId: string,
    issue: string,
    evidence: string[]
  ): Promise<ChangeRequest | null> {
    // 1. Prüfe Vorgabe gegen Best Practices
    const bestPractices = loadKnowledgeForTaskWithCICD("best-practices", ["best-practices"])
    const violations: string[] = []

    for (const practice of bestPractices) {
      // Vereinfachte Prüfung
      if (vorgabe.includes("hardcoded") && practice.content.includes("Design-Tokens")) {
        violations.push("Hardcoded Werte sollten durch Design-Tokens ersetzt werden")
      }
    }

    // 2. Wenn Verstöße gefunden, erstelle Antrag
    if (violations.length > 0 || issue) {
      const justification = `
## Problem
${issue || "Vorgabe verstößt gegen Best Practices"}

## Gefundene Verstöße
${violations.map((v) => `- ${v}`).join("\n")}

## Evidenz
${evidence.map((e) => `- ${e}`).join("\n")}

## Vorgeschlagene Lösung
Basierend auf Best Practices und bestehenden Vorgaben sollte die Vorgabe wie folgt korrigiert werden:
[Automatisch generiert basierend auf Best Practices]
`.trim()

      const request = await this.masterBot.createChangeRequest({
        requesterBot: botId,
        type: "vorgabe-correction",
        title: `Vorgabe-Korrektur: ${vorgabeId}`,
        description: `Korrektur der Vorgabe ${vorgabeId} aufgrund von Best-Practice-Verstößen`,
        currentVorgabe: vorgabe,
        proposedChange: this.generateCorrectedVorgabe(vorgabe, violations),
        justification,
        evidence,
        priority: violations.some((v) => v.includes("critical")) ? "critical" : "high",
      })

      await logError({
        type: "vorgabe-correction-request",
        severity: "medium",
        category: "bot-workflow",
        message: `Vorgabe-Korrektur beantragt: ${vorgabeId}`,
        context: {
          botId,
          vorgabeId,
          violations,
        },
        solution: "Wird vom Master-Bot geprüft",
        botId,
      })

      return request
    }

    return null
  }

  /**
   * Generiere korrigierte Vorgabe
   */
  private generateCorrectedVorgabe(original: string, violations: string[]): string {
    let corrected = original

    // Korrigiere basierend auf Verstößen
    if (violations.some((v) => v.includes("Design-Tokens"))) {
      corrected = corrected.replace(/#([0-9a-fA-F]{3}){1,2}/g, "[Design-Token]")
    }

    return corrected
  }

  /**
   * Erhalte Workflow für Bot
   */
  getWorkflow(botId: string): BotWorkflow | undefined {
    return this.workflows.get(botId)
  }

  /**
   * Erhalte alle Workflows
   */
  getAllWorkflows(): BotWorkflow[] {
    return Array.from(this.workflows.values())
  }
}
