/**
 * BOT-KOMMUNIKATION
 * =================
 * Kommunikationssystem zwischen Bots
 */

export interface BotQuestion {
  id: string
  timestamp: string
  fromBot: string
  toBot: string
  question: string
  context: any
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "answered" | "escalated"
  answer?: string
  escalatedTo?: string
}

export interface BotAnswer {
  questionId: string
  answer: string
  sources?: string[]
  confidence: "low" | "medium" | "high"
  needsUserClarification: boolean
}

/**
 * Bot-Kommunikations-Manager
 */
export class BotCommunicationManager {
  private questions: BotQuestion[] = []

  /**
   * Stelle Frage an anderen Bot
   */
  async askQuestion(
    fromBot: string,
    toBot: string,
    question: string,
    context: any,
    priority: BotQuestion["priority"] = "medium"
  ): Promise<BotAnswer> {
    const botQuestion: BotQuestion = {
      id: `question-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      fromBot,
      toBot,
      question,
      context,
      priority,
      status: "pending",
    }

    this.questions.push(botQuestion)

    console.log(`❓ Frage gestellt: ${fromBot} → ${toBot}: ${question}`)

    // Simuliere Antwort (sollte durch echte Bot-Kommunikation ersetzt werden)
    return await this.handleQuestion(botQuestion)
  }

  /**
   * Behandle Frage
   */
  private async handleQuestion(question: BotQuestion): Promise<BotAnswer> {
    // Wenn an Documentation-Bot/Assistant: Recherche durchführen
    if (question.toBot === "Documentation-Bot" || question.toBot === "Documentation-Assistant") {
      return await this.handleDocumentationQuestion(question)
    }

    // Wenn an Master-Bot: Weiterleitung an User-Chat
    if (question.toBot === "Master-Bot") {
      return await this.handleMasterBotQuestion(question)
    }

    // Standard-Antwort
    return {
      questionId: question.id,
      answer: "Antwort wird bearbeitet",
      confidence: "medium",
      needsUserClarification: false,
    }
  }

  /**
   * Behandle Frage an Documentation-Bot/Assistant (mit Internet-Recherche)
   */
  private async handleDocumentationQuestion(question: BotQuestion): Promise<BotAnswer> {
    try {
      const { internetResearchService } = await import("./internet-research")

      console.log(`🔍 Documentation-Bot recherchiert: ${question.question}`)

      // Führe echte Internet-Recherche durch
      const researchResult = await internetResearchService.research(question.question, question.context)

      // Formatiere Antwort
      const answer = `
Recherche-Ergebnis für: ${question.question}

## Ergebnisse
${researchResult.results.map((r) => `- **${r.title}**: ${r.snippet} (${r.url})`).join("\n")}

## Best Practices
${researchResult.bestPractices.map((bp) => `- ${bp}`).join("\n")}

## Quellen
${researchResult.sources.map((s) => `- ${s}`).join("\n")}
`.trim()

      question.status = "answered"
      question.answer = answer

      return {
        questionId: question.id,
        answer,
        sources: researchResult.sources,
        confidence: researchResult.results.length > 0 ? "high" : "medium",
        needsUserClarification: false,
      }
    } catch (error: any) {
      console.error("Fehler bei Documentation-Recherche:", error)

      // Bei Fehler: Weiterleitung an Master-Bot
      return await this.handleMasterBotQuestion(question)
    }
  }

  /**
   * Recherchiere Frage (Internet-Zugriff)
   */
  private async researchQuestion(question: string): Promise<string> {
    // Verwende Internet-Research-Service
    const { internetResearchService } = await import("./internet-research")
    const researchResult = await internetResearchService.research(question)

    // Formatiere Antwort
    return `
Recherche-Ergebnis für: ${question}

## Ergebnisse
${researchResult.results.map((r) => `- **${r.title}**: ${r.snippet}`).join("\n")}

## Best Practices
${researchResult.bestPractices.map((bp) => `- ${bp}`).join("\n")}
`.trim()
  }

  /**
   * Behandle Frage an Master-Bot (Weiterleitung an User-Chat)
   */
  private async handleMasterBotQuestion(question: BotQuestion): Promise<BotAnswer> {
    console.log(`📤 Master-Bot leitet Frage an User-Chat weiter: ${question.question}`)

    question.status = "escalated"
    question.escalatedTo = "User-Chat"

    return {
      questionId: question.id,
      answer: "Frage wurde an User-Chat weitergeleitet. Warte auf Antwort.",
      confidence: "low",
      needsUserClarification: true,
    }
  }

  /**
   * Beantworte Frage
   */
  async answerQuestion(questionId: string, answer: string, sources?: string[]): Promise<void> {
    const question = this.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new Error(`Frage ${questionId} nicht gefunden`)
    }

    question.status = "answered"
    question.answer = answer

    console.log(`✅ Frage beantwortet: ${questionId}`)
  }

  /**
   * Lade offene Fragen
   */
  getPendingQuestions(botName?: string): BotQuestion[] {
    if (botName) {
      return this.questions.filter((q) => q.toBot === botName && q.status === "pending")
    }
    return this.questions.filter((q) => q.status === "pending")
  }
}

// Singleton-Instanz
export const botCommunicationManager = new BotCommunicationManager()

// ============================================================================
// AGENT COMMUNICATION PROTOCOL (ACP)
// ============================================================================

/**
 * Agent-Nachrichtentypen für strukturierte Kommunikation
 */
export type AgentMessageType =
  | "task_assignment"      // Aufgabenzuweisung
  | "task_completion"      // Aufgabenabschluss
  | "task_failure"         // Aufgabenfehler
  | "context_request"      // Kontextanfrage
  | "context_response"     // Kontextantwort
  | "validation_request"   // Validierungsanfrage
  | "validation_response"  // Validierungsantwort
  | "escalation"           // Eskalation
  | "status_update"        // Statusaktualisierung
  | "collaboration_start"  // Kollaborationsstart
  | "collaboration_end"    // Kollaborationsende

/**
 * Agent-Nachricht
 */
export interface AgentMessage {
  id: string
  type: AgentMessageType
  timestamp: string
  sender: string
  receiver: string | "broadcast"
  payload: unknown
  correlationId?: string  // Für Request/Response-Paare
  priority: "low" | "medium" | "high" | "critical"
  ttl?: number           // Time-to-live in ms
  requiresAck?: boolean  // Erfordert Bestätigung
}

/**
 * Agent-Event für Event-basierte Kommunikation
 */
export interface AgentEvent {
  type: string
  source: string
  timestamp: string
  data: unknown
}

/**
 * Agent-Spezialisierungsmatrix
 */
export const AGENT_SPECIALIZATION_MATRIX: Record<string, {
  role: string
  capabilities: string[]
  canReceive: AgentMessageType[]
  canSend: AgentMessageType[]
  escalatesTo: string
}> = {
  "master-bot": {
    role: "Orchestrator",
    capabilities: ["task-distribution", "agent-oversight", "decision-making", "escalation-handling"],
    canReceive: ["task_completion", "task_failure", "escalation", "status_update", "validation_response"],
    canSend: ["task_assignment", "context_request", "validation_request", "collaboration_start"],
    escalatesTo: "user",
  },
  "quality-bot": {
    role: "Quality Assurance",
    capabilities: ["code-validation", "design-check", "compliance-check", "documentation-check"],
    canReceive: ["task_assignment", "validation_request", "context_response"],
    canSend: ["task_completion", "task_failure", "validation_response", "escalation"],
    escalatesTo: "master-bot",
  },
  "system-bot": {
    role: "Implementation",
    capabilities: ["code-analysis", "bug-fixing", "optimization", "refactoring", "migration"],
    canReceive: ["task_assignment", "context_response", "validation_response"],
    canSend: ["task_completion", "task_failure", "context_request", "validation_request", "escalation"],
    escalatesTo: "master-bot",
  },
  "documentation-bot": {
    role: "Documentation",
    capabilities: ["documentation-creation", "wiki-update", "changelog", "internet-research"],
    canReceive: ["task_assignment", "context_request"],
    canSend: ["task_completion", "task_failure", "context_response", "escalation"],
    escalatesTo: "master-bot",
  },
  "backend-agent": {
    role: "Backend Development",
    capabilities: ["api", "database", "server-components", "migrations"],
    canReceive: ["task_assignment", "context_response"],
    canSend: ["task_completion", "task_failure", "context_request", "escalation"],
    escalatesTo: "master-bot",
  },
  "frontend-agent": {
    role: "Frontend Development",
    capabilities: ["ui", "ux", "components", "styling"],
    canReceive: ["task_assignment", "context_response"],
    canSend: ["task_completion", "task_failure", "context_request", "escalation"],
    escalatesTo: "master-bot",
  },
  "testing-agent": {
    role: "Testing",
    capabilities: ["unit-tests", "integration-tests", "e2e-tests", "coverage"],
    canReceive: ["task_assignment", "context_response"],
    canSend: ["task_completion", "task_failure", "validation_response", "escalation"],
    escalatesTo: "quality-bot",
  },
  "devops-agent": {
    role: "DevOps",
    capabilities: ["deployment", "ci-cd", "monitoring", "infrastructure"],
    canReceive: ["task_assignment", "context_response"],
    canSend: ["task_completion", "task_failure", "status_update", "escalation"],
    escalatesTo: "master-bot",
  },
}

/**
 * Agent Communication Protocol Manager
 * Verwaltet die strukturierte Kommunikation zwischen Agenten
 */
export class AgentCommunicationProtocol {
  private static instance: AgentCommunicationProtocol
  private messageQueue: AgentMessage[] = []
  private eventListeners: Map<string, Array<(event: AgentEvent) => void>> = new Map()
  private acknowledgements: Map<string, boolean> = new Map()
  private messageHistory: AgentMessage[] = []

  private constructor() {}

  static getInstance(): AgentCommunicationProtocol {
    if (!AgentCommunicationProtocol.instance) {
      AgentCommunicationProtocol.instance = new AgentCommunicationProtocol()
    }
    return AgentCommunicationProtocol.instance
  }

  /**
   * Sende Nachricht an Agent
   */
  async sendMessage(message: Omit<AgentMessage, "id" | "timestamp">): Promise<string> {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    // Validiere Sender/Empfänger
    const senderSpec = AGENT_SPECIALIZATION_MATRIX[message.sender]
    const receiverSpec = message.receiver !== "broadcast"
      ? AGENT_SPECIALIZATION_MATRIX[message.receiver]
      : null

    if (senderSpec && !senderSpec.canSend.includes(message.type)) {
      console.warn(`⚠️ Agent ${message.sender} ist nicht berechtigt, ${message.type} zu senden`)
    }

    if (receiverSpec && !receiverSpec.canReceive.includes(message.type)) {
      console.warn(`⚠️ Agent ${message.receiver} ist nicht berechtigt, ${message.type} zu empfangen`)
    }

    this.messageQueue.push(fullMessage)
    this.messageHistory.push(fullMessage)

    console.log(`📨 Nachricht gesendet: ${message.sender} → ${message.receiver} [${message.type}]`)

    // Emit Event für Broadcast
    if (message.receiver === "broadcast") {
      this.emit({
        type: message.type,
        source: message.sender,
        timestamp: fullMessage.timestamp,
        data: message.payload,
      })
    }

    return fullMessage.id
  }

  /**
   * Empfange Nachrichten für Agent
   */
  receiveMessages(agentId: string): AgentMessage[] {
    const messages = this.messageQueue.filter(
      (m) => m.receiver === agentId || m.receiver === "broadcast"
    )

    // Entferne empfangene Nachrichten aus Queue
    this.messageQueue = this.messageQueue.filter(
      (m) => m.receiver !== agentId && m.receiver !== "broadcast"
    )

    return messages
  }

  /**
   * Bestätige Nachrichtenempfang
   */
  acknowledge(messageId: string): void {
    this.acknowledgements.set(messageId, true)
    console.log(`✓ Nachricht bestätigt: ${messageId}`)
  }

  /**
   * Prüfe ob Nachricht bestätigt wurde
   */
  isAcknowledged(messageId: string): boolean {
    return this.acknowledgements.get(messageId) ?? false
  }

  /**
   * Registriere Event-Listener
   */
  on(eventType: string, callback: (event: AgentEvent) => void): void {
    const listeners = this.eventListeners.get(eventType) || []
    listeners.push(callback)
    this.eventListeners.set(eventType, listeners)
  }

  /**
   * Entferne Event-Listener
   */
  off(eventType: string, callback: (event: AgentEvent) => void): void {
    const listeners = this.eventListeners.get(eventType) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
      this.eventListeners.set(eventType, listeners)
    }
  }

  /**
   * Emit Event
   */
  private emit(event: AgentEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        console.error(`Fehler in Event-Listener für ${event.type}:`, error)
      }
    }
  }

  /**
   * Eskaliere zu übergeordnetem Agent
   */
  async escalate(fromAgent: string, reason: string, context: unknown): Promise<string> {
    const spec = AGENT_SPECIALIZATION_MATRIX[fromAgent]
    if (!spec) {
      throw new Error(`Unbekannter Agent: ${fromAgent}`)
    }

    return await this.sendMessage({
      type: "escalation",
      sender: fromAgent,
      receiver: spec.escalatesTo === "user" ? "master-bot" : spec.escalatesTo,
      payload: { reason, context, originalAgent: fromAgent },
      priority: "high",
      requiresAck: true,
    })
  }

  /**
   * Starte Kollaboration zwischen Agenten
   */
  async startCollaboration(
    initiator: string,
    participants: string[],
    taskId: string,
    description: string
  ): Promise<string> {
    const collaborationId = `collab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    for (const participant of participants) {
      await this.sendMessage({
        type: "collaboration_start",
        sender: initiator,
        receiver: participant,
        payload: { collaborationId, taskId, description, participants },
        priority: "medium",
        correlationId: collaborationId,
      })
    }

    console.log(`🤝 Kollaboration gestartet: ${collaborationId} mit ${participants.join(", ")}`)
    return collaborationId
  }

  /**
   * Beende Kollaboration
   */
  async endCollaboration(collaborationId: string, initiator: string, result: unknown): Promise<void> {
    await this.sendMessage({
      type: "collaboration_end",
      sender: initiator,
      receiver: "broadcast",
      payload: { collaborationId, result },
      priority: "medium",
      correlationId: collaborationId,
    })

    console.log(`✓ Kollaboration beendet: ${collaborationId}`)
  }

  /**
   * Hole Nachrichtenverlauf
   */
  getMessageHistory(filter?: { sender?: string; receiver?: string; type?: AgentMessageType }): AgentMessage[] {
    let history = [...this.messageHistory]

    if (filter?.sender) {
      history = history.filter((m) => m.sender === filter.sender)
    }
    if (filter?.receiver) {
      history = history.filter((m) => m.receiver === filter.receiver)
    }
    if (filter?.type) {
      history = history.filter((m) => m.type === filter.type)
    }

    return history
  }

  /**
   * Lösche alte Nachrichten
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge
    this.messageHistory = this.messageHistory.filter(
      (m) => new Date(m.timestamp).getTime() > cutoff
    )
    console.log(`🧹 Nachrichtenverlauf bereinigt (älter als ${maxAge}ms entfernt)`)
  }
}

// Singleton-Export
export const agentProtocol = AgentCommunicationProtocol.getInstance()

