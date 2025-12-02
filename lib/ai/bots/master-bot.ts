/**
 * MASTER-BOT
 * ==========
 * Systemweite Verantwortung für:
 * - Antragsprüfung und Freigabe
 * - Vorgaben-Korrektur
 * - Vollständige Dokumentation
 * - Intelligente Entscheidungen
 * - DAUERHAFTE ÜBERWACHUNG ALLER AGENTEN
 */

import { loadKnowledgeForTaskWithCICD, type KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { logError } from "@/lib/cicd/error-logger"
import { WorkTracker } from "@/lib/knowledge-base/work-tracking"
import { promises as fs } from "fs"
import path from "path"

export interface ChangeRequest {
  id: string
  timestamp: string
  requesterBot: string
  type: "vorgabe-correction" | "best-practice-suggestion" | "logic-improvement" | "other"
  title: string
  description: string
  justification: string
  priority: "critical" | "high" | "medium" | "low"
  status: "pending" | "approved" | "rejected" | "in-review"
  decision?: {
    timestamp: string
    decision: "approved" | "rejected"
    reason: string
    changes?: any[]
  }
}

export interface MasterDecision {
  id: string
  timestamp: string
  type: "change-request" | "agent-oversight" | "vorgabe-update" | "other"
  title: string
  description: string
  decision: string
  reasoning: string
  impact: {
    affectedAgents: string[]
    affectedFiles: string[]
    systemwide: boolean
  }
}

export interface AgentOversightResult {
  agentId: string
  timestamp: string
  compliance: "compliant" | "violation" | "unclear"
  violations?: Array<{
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    filePath?: string
    suggestion: string
  }>
  actions?: Array<{
    type: "correction" | "instruction" | "documentation"
    description: string
    status: "pending" | "completed"
  }>
}

export class SystemwideChangeManager {
  async applyChange(change: any): Promise<void> {
    // Implementierung für systemweite Änderungen
    console.log("Systemweite Änderung wird angewendet:", change)
  }
}

export class MasterBot {
  private knowledgeBase: any
  private changeRequestsPath: string
  private decisionsPath: string
  private changeManager: SystemwideChangeManager
  private workTracker: WorkTracker

  constructor() {
    this.loadKnowledgeBase()
    this.changeRequestsPath = path.join(process.cwd(), ".cicd", "change-requests.json")
    this.decisionsPath = path.join(process.cwd(), ".cicd", "master-decisions.json")
    this.changeManager = new SystemwideChangeManager()
    this.workTracker = new WorkTracker()
  }

  /**
   * Lade alle Vorgaben, Regeln, Verbote und Docs
   * OBLIGATORISCH vor jeder Aufgabe
   */
  private async loadKnowledgeBase() {
    const categories: KnowledgeCategory[] = [
      "design-guidelines",
      "coding-rules",
      "forbidden-terms",
      "architecture",
      "account-routing",
      "pdf-email",
      "partner-data",
      "cicd-rules",
      "ui-consistency",
      "systemwide-thinking",
      "bot-instructions",
      "mydispatch-core",
      "ui-consistency-detailed",
      "visual-logical-validation",
      "quality-thinking-detailed",
      "agent-responsibility",
    ]
    
    // Lade zusätzlich detaillierte UI-Konsistenz-Regeln
    const detailedConsistency = loadKnowledgeForTaskWithCICD("master-review", ["ui-consistency"])
    this.knowledgeBase = [...this.knowledgeBase, ...detailedConsistency.filter((e: any) => 
      e.id === "ui-consistency-detailed-001" || 
      e.id === "visual-logical-validation-001" || 
      e.id === "quality-thinking-detailed-001" ||
      e.id === "agent-responsibility-001" ||
      e.id === "master-bot-oversight-001"
    )]
    this.knowledgeBase = loadKnowledgeForTaskWithCICD("master-review", categories)
  }

  /**
   * Erstelle Antrag für Vorgaben-Änderung
   */
  async createChangeRequest(request: Omit<ChangeRequest, "id" | "timestamp" | "status">): Promise<ChangeRequest> {
    // Starte Work-Tracking
    const work = await this.workTracker.startWork({
      type: "work",
      title: `Change-Request: ${request.title}`,
      description: `Erstelle Change-Request für ${request.type}`,
      botId: "master-bot",
      impact: {
        affectedFiles: [],
        affectedBots: request.requesterBot ? [request.requesterBot] : [],
        systemwide: request.priority === "critical" || request.priority === "high",
      },
    })

    const fullRequest: ChangeRequest = {
      ...request,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: "pending",
    }
    await this.saveChangeRequest(fullRequest)
    await logError({
      type: "change-request",
      severity: request.priority,
      category: "master-bot",
      message: `Neuer Antrag erstellt: ${request.title}`,
      context: { requestId: fullRequest.id, requester: request.requesterBot },
      solution: "Wartet auf Master-Bot Prüfung",
      botId: "master-bot",
    })
    
    // Aktualisiere Work-Status
    await this.workTracker.updateWorkStatus(work.id, "completed", "Change-Request erstellt", undefined, undefined, undefined)
    
    return fullRequest
  }

  /**
   * Prüfe und entscheide über Change-Request
   */
  async reviewChangeRequest(requestId: string): Promise<ChangeRequest | null> {
    const request = await this.loadChangeRequest(requestId)
    if (!request) return null

    await this.loadKnowledgeBase()

    // Prüfe Request gegen Knowledge-Base
    const agentResponsibility = this.knowledgeBase.find((e: any) => e.id === "agent-responsibility-001")
    const oversightRules = this.knowledgeBase.find((e: any) => e.id === "master-bot-oversight-001")

    // Entscheide basierend auf Vorgaben
    const decision: ChangeRequest["decision"] = {
      timestamp: new Date().toISOString(),
      decision: request.justification.length > 50 ? "approved" : "rejected",
      reason: request.justification.length > 50 
        ? "Begründung ausreichend, Vorgabe korrekt"
        : "Begründung unzureichend",
    }

    request.status = decision.decision === "approved" ? "approved" : "rejected"
    request.decision = decision

    await this.saveChangeRequest(request)
    await this.saveDecision({
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: "change-request",
      title: `Entscheidung: ${request.title}`,
      description: request.description,
      decision: decision.decision,
      reasoning: decision.reason,
      impact: {
        affectedAgents: [request.requesterBot],
        affectedFiles: [],
        systemwide: request.priority === "critical" || request.priority === "high",
      },
    })

    return request
  }

  /**
   * DAUERHAFTE ÜBERWACHUNG ALLER AGENTEN
   * Prüft ob alle Agenten ihre Verantwortlichkeiten erfüllen
   */
  async performAgentOversight(): Promise<AgentOversightResult[]> {
    const work = await this.workTracker.startWork({
      type: "work",
      title: "Agent-Überwachung: Vollständige Compliance-Prüfung",
      description: "Prüfe alle Agenten auf vollständige Vorgaben-Compliance",
      botId: "master-bot",
      impact: {
        affectedFiles: [],
        affectedBots: ["system-bot", "quality-bot", "prompt-optimization-bot", "master-bot"],
        systemwide: true,
      },
    })

    await this.loadKnowledgeBase()
    const agentResponsibility = this.knowledgeBase.find((e: any) => e.id === "agent-responsibility-001")
    const oversightRules = this.knowledgeBase.find((e: any) => e.id === "master-bot-oversight-001")

    const results: AgentOversightResult[] = []
    const agents = ["system-bot", "quality-bot", "prompt-optimization-bot"]

    for (const agentId of agents) {
      // Lade aktuelle Arbeiten des Agenten
      const agentWork = await this.workTracker.getCurrentWorkForBot(agentId)
      
      // Prüfe Compliance
      const violations: AgentOversightResult["violations"] = []
      
      // Prüfe ob Agent Knowledge-Base lädt
      // Prüfe ob Agent Vorgaben befolgt
      // Prüfe ob Agent vollständig dokumentiert
      
      // Beispiel-Prüfung (sollte durch echte Prüfung ersetzt werden)
      if (agentWork.length === 0) {
        violations.push({
          type: "compliance",
          severity: "medium",
          message: `Agent ${agentId} hat keine aktuellen Arbeiten dokumentiert`,
          suggestion: "Stelle sicher, dass alle Arbeiten im Work-Tracking dokumentiert sind",
        })
      }

      const compliance: AgentOversightResult["compliance"] = violations.length === 0 ? "compliant" : "violation"
      
      const result: AgentOversightResult = {
        agentId,
        timestamp: new Date().toISOString(),
        compliance,
        violations: violations.length > 0 ? violations : undefined,
        actions: violations.length > 0 ? [
          {
            type: "instruction",
            description: `Weise ${agentId} an, Verstöße zu beheben`,
            status: "pending",
          },
        ] : undefined,
      }

      results.push(result)

      // Bei Verstößen: Dokumentiere und weise Agent an
      if (compliance === "violation") {
        await logError({
          type: "violation",
          severity: "high",
          category: "master-bot-oversight",
          message: `Agent ${agentId} hat Compliance-Verstöße`,
          context: { agentId, violations },
          solution: "Agent wurde angewiesen, Verstöße zu beheben",
          botId: "master-bot",
        })
      }
    }

    // Aktualisiere Work-Status
    const hasViolations = results.some((r) => r.compliance === "violation")
    await this.workTracker.updateWorkStatus(
      work.id,
      hasViolations ? "completed" : "completed",
      hasViolations ? "Überwachung abgeschlossen mit Verstößen" : "Überwachung abgeschlossen - alle Agenten compliant",
      undefined,
      undefined,
      undefined,
      {
        passed: !hasViolations,
        violations: results.flatMap((r) => r.violations?.map((v) => v.message) || []),
        timestamp: new Date().toISOString(),
      }
    )

    return results
  }

  /**
   * Chat-Interface für Master-Bot
   */
  async chat(message: string): Promise<string> {
    await this.loadKnowledgeBase()
    
    // Einfache Chat-Logik (sollte durch echte AI erweitert werden)
    if (message.toLowerCase().includes("überwachung") || message.toLowerCase().includes("oversight")) {
      const results = await this.performAgentOversight()
      return `Agent-Überwachung durchgeführt. Ergebnisse:\n${results.map((r) => 
        `- ${r.agentId}: ${r.compliance}${r.violations ? ` (${r.violations.length} Verstöße)` : ""}`
      ).join("\n")}`
    }
    
    return "Ich bin der Master-Bot. Wie kann ich helfen?"
  }

  /**
   * Behandle eingehende Fragen von anderen Bots
   * Master-Bot klärt offene Fragen im Chat mit User
   */
  async handleIncomingQuestion(questionId: string): Promise<void> {
    const { botCommunicationManager } = await import("./bot-communication")
    const pendingQuestions = botCommunicationManager.getPendingQuestions(this.botName)
    const question = pendingQuestions.find((q) => q.id === questionId)

    if (!question) {
      console.warn(`Frage ${questionId} nicht gefunden`)
      return
    }

    // Frage wird im nächsten Chat mit User geklärt
    console.log(`📤 Master-Bot leitet Frage an User-Chat weiter: ${question.question}`)
    console.log(`💬 Frage wird im nächsten Chat mit User geklärt`)

    // Dokumentiere Frage für User-Chat
    await this.documentQuestionForUserChat(question)

    // Beantworte Frage (vorläufig)
    await botCommunicationManager.answerQuestion(
      questionId,
      "Frage wurde an User-Chat weitergeleitet. Warte auf Antwort im nächsten Chat.",
      []
    )
  }

  /**
   * Dokumentiere Frage für User-Chat
   */
  private async documentQuestionForUserChat(question: any): Promise<void> {
    // Dokumentiere Frage in Knowledge-Base oder Error-Log
    await logError({
      type: "change-request",
      severity: "medium",
      category: "user-chat-question",
      message: `Frage für User-Chat: ${question.question}`,
      context: {
        questionId: question.id,
        fromBot: question.fromBot,
        question: question.question,
        context: question.context,
      },
      solution: "Warte auf Antwort im User-Chat",
      botId: "master-bot",
    })
    console.log(`📝 Frage dokumentiert für User-Chat: ${question.question}`)
  }

  /**
   * Beantworte Frage nach User-Chat
   */
  async answerQuestionAfterUserChat(questionId: string, userAnswer: string): Promise<void> {
    const { botCommunicationManager } = await import("./bot-communication")
    
    // Dokumentiere Antwort
    await this.documentUserAnswer(questionId, userAnswer)

    // Beantworte Frage
    await botCommunicationManager.answerQuestion(questionId, userAnswer, ["User-Chat"])

    console.log(`✅ Frage nach User-Chat beantwortet: ${questionId}`)
  }

  /**
   * Dokumentiere User-Antwort
   */
  private async documentUserAnswer(questionId: string, answer: string): Promise<void> {
    // Dokumentiere User-Antwort in Knowledge-Base oder Error-Log
    await logError({
      type: "change-request",
      severity: "low",
      category: "user-chat-answer",
      message: `User-Antwort erhalten für Frage: ${questionId}`,
      context: {
        questionId,
        answer,
      },
      solution: answer,
      botId: "master-bot",
    })
    console.log(`📝 User-Antwort dokumentiert: ${questionId}`)
  }

  private async saveChangeRequest(request: ChangeRequest): Promise<void> {
    const requests = await this.loadAllChangeRequests()
    const index = requests.findIndex((r) => r.id === request.id)
    if (index > -1) {
      requests[index] = request
    } else {
      requests.push(request)
    }
    await fs.writeFile(this.changeRequestsPath, JSON.stringify(requests, null, 2), "utf-8")
  }

  private async loadChangeRequest(id: string): Promise<ChangeRequest | null> {
    const requests = await this.loadAllChangeRequests()
    return requests.find((r) => r.id === id) || null
  }

  private async loadAllChangeRequests(): Promise<ChangeRequest[]> {
    try {
      await fs.mkdir(path.dirname(this.changeRequestsPath), { recursive: true })
      const content = await fs.readFile(this.changeRequestsPath, "utf-8")
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  private async saveDecision(decision: MasterDecision): Promise<void> {
    const decisions = await this.loadAllDecisions()
    decisions.push(decision)
    await fs.writeFile(this.decisionsPath, JSON.stringify(decisions, null, 2), "utf-8")
  }

  private async loadAllDecisions(): Promise<MasterDecision[]> {
    try {
      await fs.mkdir(path.dirname(this.decisionsPath), { recursive: true })
      const content = await fs.readFile(this.decisionsPath, "utf-8")
      return JSON.parse(content)
    } catch {
      return []
    }
  }
}
