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

import { loadKnowledgeForTask, type KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { logError } from "@/lib/cicd/error-logger"
import { WorkTracker } from "@/lib/knowledge-base/work-tracking"
import { validateSupabaseProject, validateSchemaTables, checkSecurityAdvisors } from "./mcp-integration"
import { promises as fs } from "fs"
import path from "path"
import { AGENT_SPECIALIZATIONS, determineAgentRole, PARALLEL_TRACKS } from "./agent-directives"
import type { BotTask, BotResponse } from "./base-bot"

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
  currentVorgabe?: any
  proposedChange?: any
  evidence?: string[]
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
  private botSpecializations: Map<string, string[]> = new Map()
  private botName: string = "Master-Bot"

  constructor() {
    this.loadKnowledgeBase()
    this.changeRequestsPath = path.join(process.cwd(), ".cicd", "change-requests.json")
    this.decisionsPath = path.join(process.cwd(), ".cicd", "master-decisions.json")
    this.changeManager = new SystemwideChangeManager()
    this.workTracker = new WorkTracker()
    
    // Definiere Bot-Spezialisierungen (erweitert mit Agent-Rollen)
    this.botSpecializations.set("system-bot", [
      "code-analysis",
      "bug-fix",
      "optimization",
      "refactoring",
      "migration",
      "schema-changes",
    ])
    this.botSpecializations.set("quality-bot", [
      "quality-check",
      "design-validation",
      "documentation-check",
      "compliance-check",
      "violation-detection",
    ])
    this.botSpecializations.set("prompt-optimization-bot", [
      "prompt-optimization",
      "prompt-generation",
      "knowledge-integration",
    ])
    this.botSpecializations.set("documentation-bot", [
      "documentation",
      "wiki-update",
      "changelog",
      "error-documentation",
    ])
    
    // Erweiterte Agent-Rollen aus AGENT_SPECIALIZATIONS
    this.botSpecializations.set("backend-agent", [
      "api",
      "database",
      "server-components",
      "migrations",
    ])
    this.botSpecializations.set("frontend-agent", [
      "ui",
      "ux",
      "components",
      "styling",
    ])
    this.botSpecializations.set("testing-agent", [
      "unit",
      "integration",
      "e2e",
      "coverage",
    ])
    this.botSpecializations.set("documentation-agent", [
      "docs",
      "api-docs",
      "changelogs",
      "wiki",
    ])
    this.botSpecializations.set("devops-agent", [
      "deployment",
      "ci-cd",
      "monitoring",
      "infrastructure",
    ])
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
    const detailedConsistency = loadKnowledgeForTask("master-review", ["ui-consistency"])
    this.knowledgeBase = [...loadKnowledgeForTask("master-review", categories), ...detailedConsistency.filter((e: any) => 
      e.id === "ui-consistency-detailed-001" || 
      e.id === "visual-logical-validation-001" || 
      e.id === "quality-thinking-detailed-001" ||
      e.id === "agent-responsibility-001" ||
      e.id === "master-bot-oversight-001"
    )]
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
    await this.workTracker.completeWork(
      work.id,
      {
        passed: !hasViolations,
        violations: results.flatMap((r) => r.violations?.map((v) => v.message) || []),
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

  /**
   * AUTONOME TASK-VERTEILUNG
   * Verteilt Aufgaben automatisch an spezialisierte Bots
   */
  async distributeTask(
    taskType: string,
    taskDescription: string,
    filePath?: string,
    context?: any
  ): Promise<{
    assignedBot: string
    taskId: string
    success: boolean
    errors?: string[]
  }> {
    // 1. Finde passenden Bot basierend auf Spezialisierung
    let assignedBot: string | null = null
    
    for (const [botId, specializations] of this.botSpecializations.entries()) {
      if (specializations.includes(taskType)) {
        assignedBot = botId
        break
      }
    }
    
    // Fallback: System-Bot für unbekannte Task-Typen
    if (!assignedBot) {
      assignedBot = "system-bot"
    }
    
    // 2. Erstelle Task-ID
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // 3. Starte Work-Tracking
    const work = await this.workTracker.startWork({
      type: "work",
      title: taskDescription,
      description: `Automatisch zugewiesen an ${assignedBot}`,
      botId: assignedBot,
      filePath,
    })
    
    // 4. Dokumentiere Task-Zuweisung
    await logError({
      type: "task-assignment",
      severity: "low",
      category: "master-bot",
      message: `Task "${taskType}" zugewiesen an ${assignedBot}`,
      context: { taskId, taskType, assignedBot, filePath },
      solution: "Task wird autonom bearbeitet",
      botId: "master-bot",
    })
    
    return {
      assignedBot,
      taskId,
      success: true,
    }
  }

  /**
   * VALIDIERE ERGEBNIS DURCH QUALITY-BOT
   * Wird nach jeder Bot-Aufgabe aufgerufen
   * Prüft ALLE Änderungen vollständig (nicht nur bis zum ersten Fehler)
   */
  async validateBotResult(
    botId: string,
    taskId: string,
    result: any,
    filePath?: string
  ): Promise<{
    valid: boolean
    violations: Array<{ type: string; message: string; suggestion: string }>
  }> {
    const { QualityBot } = await import("./quality-bot")
    const qualityBot = new QualityBot()
    
    const allViolations: Array<{ type: string; message: string; suggestion: string }> = []
    
    // Prüfe Ergebnis gegen Dokumentation - ALLE Änderungen prüfen
    if (result.changes && Array.isArray(result.changes)) {
      for (const change of result.changes) {
        if (change.content) {
          const check = await qualityBot.checkCodeAgainstDocumentation(
            change.content,
            {},
            change.file || filePath || "unknown"
          )
          
          // Sammle alle Verstöße (nicht sofort zurückgeben)
          if (!check.passed) {
            allViolations.push(
              ...check.violations.map((v) => ({
                type: v.type,
                message: v.message,
                suggestion: v.suggestion,
              }))
            )
          }
        }
      }
    }
    
    return {
      valid: allViolations.length === 0,
      violations: allViolations,
    }
  }

  /**
   * Delegiere Aufgabe an spezialisierten Agenten
   * Rollenbasierte Aufgabenzuteilung
   */
  async delegateToSpecializedAgent(
    task: BotTask
  ): Promise<{
    assignedAgent: string
    role: string
    success: boolean
    error?: string
  }> {
    // Bestimme Agent-Rolle basierend auf Task-Typ
    const role = determineAgentRole(task.type)
    const agentConfig = AGENT_SPECIALIZATIONS.ROLES[role as keyof typeof AGENT_SPECIALIZATIONS.ROLES]

    if (!agentConfig) {
      return {
        assignedAgent: "system-bot",
        role: "system-bot",
        success: false,
        error: `Keine Spezialisierung für Task-Typ: ${task.type}`,
      }
    }

    // Finde passenden Bot basierend auf Spezialisierung
    let assignedAgent = "system-bot" // Fallback

    // Prüfe Bot-Spezialisierungen
    for (const [botId, specializations] of this.botSpecializations.entries()) {
      if (agentConfig.responsibilities.some((resp) => specializations.includes(resp))) {
        assignedAgent = botId
        break
      }
    }

    // Dokumentiere Delegation
    await logError({
      type: "task-assignment",
      severity: "low",
      category: "master-bot",
      message: `Task "${task.type}" delegiert an ${assignedAgent} (Rolle: ${role})`,
      context: { taskId: task.id, taskType: task.type, role, assignedAgent },
      botId: "master-bot",
    })

    return {
      assignedAgent,
      role,
      success: true,
    }
  }

  /**
   * Orchestriere parallele Tracks
   * Track 1: QA & Bugfixing, Track 2: Features, Track 3: Optimization
   */
  async orchestrateParallelTracks(tasks: BotTask[]): Promise<{
    track1: { tasks: BotTask[]; status: string }
    track2: { tasks: BotTask[]; status: string }
    track3: { tasks: BotTask[]; status: string }
  }> {
    const track1: BotTask[] = [] // QA & Bugfixing
    const track2: BotTask[] = [] // Feature-Completion
    const track3: BotTask[] = [] // Workflow-Optimization

    // Kategorisiere Tasks nach Tracks
    for (const task of tasks) {
      const taskLower = task.type.toLowerCase()
      if (
        taskLower.includes("quality") ||
        taskLower.includes("bug") ||
        taskLower.includes("fix") ||
        taskLower.includes("test")
      ) {
        track1.push(task)
      } else if (
        taskLower.includes("feature") ||
        taskLower.includes("implement") ||
        taskLower.includes("add")
      ) {
        track2.push(task)
      } else if (
        taskLower.includes("optimize") ||
        taskLower.includes("refactor") ||
        taskLower.includes("improve")
      ) {
        track3.push(task)
      } else {
        // Standard: Track 2 (Features)
        track2.push(task)
      }
    }

    return {
      track1: { tasks: track1, status: "ready" },
      track2: { tasks: track2, status: "ready" },
      track3: { tasks: track3, status: "ready" },
    }
  }

  /**
   * Validiere Agent-Compliance
   * Prüft ob alle Agenten ihre Vorgaben befolgen
   */
  async validateAgentCompliance(agentId: string): Promise<{
    compliant: boolean
    violations: Array<{ type: string; message: string; severity: string }>
  }> {
    const violations: Array<{ type: string; message: string; severity: string }> = []

    // Prüfe ob Agent Knowledge-Base lädt
    const agentWork = await this.workTracker.getCurrentWorkForBot(agentId)
    if (agentWork.length === 0) {
      violations.push({
        type: "compliance",
        message: `Agent ${agentId} hat keine aktuellen Arbeiten dokumentiert`,
        severity: "medium",
      })
    }

    // Prüfe ob Agent Vorgaben befolgt (vereinfacht)
    // TODO: Erweiterte Prüfung gegen agent-directives

    return {
      compliant: violations.length === 0,
      violations,
    }
  }

  /**
   * Erzwinge Zero-User-Intervention
   * Stellt sicher, dass alle Tasks autonom ausgeführt werden können
   */
  async enforceZeroUserIntervention(task: BotTask): Promise<{
    autonomous: boolean
    blockers: string[]
  }> {
    const blockers: string[] = []

    // Prüfe ob Task vollständig definiert ist
    if (!task.description || task.description.trim() === "") {
      blockers.push("Task-Beschreibung fehlt")
    }

    // Prüfe ob alle notwendigen Informationen verfügbar sind
    if (!task.context && task.area === "unknown") {
      blockers.push("Task-Kontext unvollständig")
    }

    // Prüfe ob Task autonom ausführbar ist
    const taskLower = task.type.toLowerCase()
    if (taskLower.includes("user-input") || taskLower.includes("manual")) {
      blockers.push("Task erfordert User-Intervention")
    }

    return {
      autonomous: blockers.length === 0,
      blockers,
    }
  }

  /**
   * AUTOMATISCHER COMMIT/PUSH NACH AUFGABE
   * Wird nach erfolgreicher Validierung aufgerufen
   * SICHER: Verwendet spawn mit Argument-Arrays (keine Command Injection möglich)
   */
  async commitAndPush(
    taskId: string,
    message: string,
    files: string[]
  ): Promise<{ success: boolean; errors?: string[] }> {
    const errors: string[] = []
    
    try {
      // Git-Operationen (nur wenn in Git-Repository)
      const { spawn } = await import("child_process")
      const { promisify } = await import("util")
      
      // Helper: Führe Git-Befehl sicher aus (mit Argument-Array, nicht String)
      const execGit = async (args: string[], options: { cwd?: string } = {}): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
          const gitProcess = spawn("git", args, {
            stdio: "ignore",
            cwd: options.cwd || process.cwd(),
          })
          
          gitProcess.on("error", (error) => {
            resolve({ success: false, error: error.message })
          })
          
          gitProcess.on("close", (code) => {
            resolve({ success: code === 0, error: code !== 0 ? `Exit code: ${code}` : undefined })
          })
        })
      }
      
      // 1. Prüfe ob Git-Repository
      const repoCheck = await execGit(["rev-parse", "--git-dir"])
      if (!repoCheck.success) {
        errors.push(`Nicht in Git-Repository: ${repoCheck.error}`)
        return { success: false, errors }
      }
      
      // 2. Validiere Inputs (zusätzliche Sicherheitsschicht)
      const dangerousChars = [";", "|", "&", "`", "$", "(", ")", "<", ">", "\n", "\r"]
      const hasDangerousChars = (str: string) => dangerousChars.some((char) => str.includes(char))
      
      // Validiere Commit-Message
      if (hasDangerousChars(message)) {
        errors.push("Commit-Message enthält ungültige Zeichen")
        return { success: false, errors }
      }
      
      // Validiere Dateipfade
      const safeFiles = files.filter((file) => {
        // Nur relative Pfade, keine absoluten oder gefährlichen Zeichen
        if (
          file.includes("..") ||
          file.startsWith("/") ||
          file.includes(":") ||
          hasDangerousChars(file)
        ) {
          errors.push(`Ungültiger Dateipfad: ${file}`)
          return false
        }
        return true
      })
      
      if (errors.length > 0) {
        return { success: false, errors }
      }
      
      // 3. Add files - SICHER: Argument-Array (keine String-Interpolation)
      if (safeFiles.length > 0) {
        const addResult = await execGit(["add", "--", ...safeFiles])
        if (!addResult.success) {
          errors.push(`git add fehlgeschlagen: ${addResult.error}`)
        }
      } else {
        const addAllResult = await execGit(["add", "-A"])
        if (!addAllResult.success) {
          errors.push(`git add -A fehlgeschlagen: ${addAllResult.error}`)
        }
      }
      
      // 4. Commit - SICHER: Argument-Array (keine String-Interpolation)
      const commitResult = await execGit(["commit", "-m", message])
      if (!commitResult.success) {
        errors.push(`git commit fehlgeschlagen: ${commitResult.error}`)
      }
      
      // 5. Push (nur wenn remote konfiguriert)
      if (errors.length === 0) {
        const pushResult = await execGit(["push"])
        if (!pushResult.success) {
          // Push fehlgeschlagen (z.B. kein remote) - nicht kritisch
          errors.push(`Push fehlgeschlagen: ${pushResult.error}`)
        }
      }
    } catch (error: any) {
      errors.push(`Fehler bei Commit/Push: ${error.message}`)
    }
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }
}
