/**
 * AGENT DIRECTIVES
 * ================
 * Zentrale, unumgehbare Workflow-Anweisungen für alle AI-Bots
 * Diese Richtlinien müssen von allen Bots befolgt werden und können nicht umgangen werden.
 */

import path from "path"
import { promises as fs } from "fs"
import {
  getDocumentation,
  searchDocumentation,
  addDocumentation,
  updateDocumentation,
  loadDocumentationForBot,
} from "@/lib/knowledge-base/documentation-api"
import type { DocumentationCategory } from "@/lib/knowledge-base/documentation-templates"

/**
 * PRIORISIERTE INFORMATIONSQUELLEN
 * Reihenfolge ist bindend - muss in dieser Reihenfolge konsultiert werden
 */
export const INFORMATION_SOURCES = {
  PRIORITY_ORDER: [
    "codebase", // 1. Aktuelle Codebase - Gesamtzustand des Projekts
    "planung", // 2. AAAPlanung/planung.txt - Projektkontext, Roadmap, Vorgaben
    "documentation-api", // 3. Dokumentations-API - Zentrale Wissensbasis
  ] as const,
  
  CODEBASE: {
    description: "Gesamtzustand des Projekts",
    loadMethod: "codebase_search",
  },
  
  PLANUNG: {
    path: path.join(process.cwd(), "AAAPlanung", "planung.txt"),
    description: "Projektkontext, Roadmap und Vorgaben",
    loadMethod: "read_file",
  },
  
  DOCUMENTATION_API: {
    functions: {
      getDocumentation: "Kategorie-basierte Abfrage",
      searchDocumentation: "Inhaltsbezogene Suche",
      addDocumentation: "Hinzufügen neuer Einträge",
      updateDocumentation: "Aktualisieren bestehender Einträge",
    },
    description: "Zentrale Wissensbasis",
  },
} as const

/**
 * IST-ANALYSE ANFORDERUNGEN
 * Pflicht-Schritte vor jeder neuen Aufgabe
 */
export const IST_ANALYSIS_REQUIREMENTS = {
  MANDATORY_STEPS: [
    {
      step: "bestandspruefung",
      description: "Offene/unvollständige Arbeiten aus vorherigen Iterationen identifizieren",
      method: "checkIncompleteWork",
    },
    {
      step: "fehlerdokumentation",
      description: "Alle gefundenen Bugs, Inkonsistenzen und Terminal-Fehler erfassen",
      method: "documentAllErrors",
    },
    {
      step: "abhaengigkeitsanalyse",
      description: "Wechselwirkungen zwischen Tasks klar definieren",
      method: "analyzeDependencies",
    },
    {
      step: "konsolidierung",
      description: "Zu behebende und neue Aufgaben in einem Gesamtplan zusammenführen",
      method: "consolidateTasks",
    },
    {
      step: "verifikation",
      description: "Erfolgreiches Pushen aller vorherigen Commits sicherstellen",
      method: "verifyGitStatus",
    },
  ] as const,
  
  VALIDATION: {
    allStepsCompleted: true,
    errorsDocumented: true,
    dependenciesMapped: true,
    tasksConsolidated: true,
    gitStatusClean: true,
  },
} as const

/**
 * QUALITÄTSSICHERUNGS-PIPELINE
 * Mehrstufiger Prozess: HuggingFace -> GitHub Copilot -> Iteration
 */
export const QUALITY_ASSURANCE_PIPELINE = {
  STAGES: [
    {
      stage: 1,
      name: "implementation",
      tool: "huggingface",
      description: "Nutzung von Hugging Face AI-Modellen für erste Entwürfe",
      model: "facebook/bart-large-cnn", // Für Summaries
      alternativeModel: "mistralai/Mistral-7B-Instruct-v0.3", // Für strukturierte Dokumentation
    },
    {
      stage: 2,
      name: "review",
      tool: "github-copilot",
      description: "GitHub Copilot für Code-Review, Fehlerbehebung und Optimierung",
      checks: ["code-quality", "error-detection", "optimization-suggestions"],
    },
    {
      stage: 3,
      name: "iteration",
      tool: "github-copilot",
      description: "Wiederholte Verbesserung durch Copilot bis Production-Ready-Status",
      maxIterations: 5,
      exitCondition: "copilotResult.passed === true",
    },
    {
      stage: 4,
      name: "validation",
      tool: "test-suites",
      description: "Prüfung aller Änderungen gegen bestehende Test-Suites",
      required: true,
    },
    {
      stage: 5,
      name: "documentation",
      tool: "documentation-api",
      description: "Lückenlose Erfassung aller Änderungen über die Dokumentations-API",
      method: "addDocumentation",
    },
  ] as const,
  
  EXIT_CRITERIA: {
    allStagesPassed: true,
    productionReady: true,
    testsPassing: true,
    documentationComplete: true,
  },
} as const

/**
 * AGENT-SPEZIALISIERUNGEN
 * Rollenbasierte Aufgabenzuteilung
 */
export const AGENT_SPECIALIZATIONS = {
  ROLES: {
    "backend-agent": {
      name: "Backend-Agent",
      responsibilities: ["api", "database", "server-components", "migrations"],
      specialization: "Backend-Entwicklung, API-Entwicklung, Datenbanklogik, Server-Komponenten",
      tools: ["supabase-mcp", "huggingface", "github-copilot"],
    },
    "frontend-agent": {
      name: "Frontend-Agent",
      responsibilities: ["ui", "ux", "components", "styling"],
      specialization: "UI/UX-Implementierung, Komponenten, Styling",
      tools: ["react", "nextjs", "tailwind", "huggingface", "github-copilot"],
    },
    "testing-agent": {
      name: "Testing-Agent",
      responsibilities: ["unit", "integration", "e2e", "coverage"],
      specialization: "Unit-, Integration- und E2E-Tests",
      tools: ["jest", "playwright", "testing-library", "github-copilot"],
    },
    "documentation-agent": {
      name: "Documentation-Agent",
      responsibilities: ["docs", "api-docs", "changelogs", "wiki"],
      specialization: "Code-Dokumentation, API-Beschreibungen, Benutzerhandbücher",
      tools: ["documentation-api", "huggingface", "markdown"],
    },
    "devops-agent": {
      name: "DevOps-Agent",
      responsibilities: ["deployment", "ci-cd", "monitoring", "infrastructure"],
      specialization: "Deployment, CI/CD-Pipelines, Monitoring",
      tools: ["github-actions", "vercel", "supabase", "github-copilot"],
    },
  } as const,
  
  DELEGATION_RULES: {
    autoAssign: true,
    validateSpecialization: true,
    fallbackToMasterBot: true,
  },
} as const

/**
 * GIT-PROTOKOLL
 * Obligatorisches Commit/Push-Schema nach jeder Aufgabe
 */
export const GIT_PROTOCOL = {
  MANDATORY: true,
  STEPS: [
    {
      step: "add",
      command: "git add .",
      description: "Alle Änderungen zum Staging hinzufügen",
    },
    {
      step: "commit",
      command: "git commit -m",
      format: "[Agent-Rolle][Task-ID] Präzise Beschreibung",
      description: "Commit mit strukturierter Nachricht",
      example: "[Backend-Agent][API-001] User-Authentifizierung implementiert",
    },
    {
      step: "push",
      command: "git push origin main",
      description: "Push zu Remote-Repository",
    },
  ] as const,
  
  VALIDATION: {
    noUncommittedChanges: true,
    commitMessageFormat: /^\[.+\]\[.+\].+$/,
    pushSuccessful: true,
  },
} as const

/**
 * FEHLERBEHANDLUNG & PRÄVENTION
 * Sofort-Stop, Analyse, Behebung, Dokumentation
 */
export const ERROR_HANDLING_RULES = {
  TERMINAL_ERRORS: {
    action: "immediate_stop",
    steps: [
      "Sofortige Dokumentation",
      "Root-Cause-Analyse",
      "Behebung",
      "Dokumentation in error-logger",
    ],
    blocking: true,
  },
  
  BUILD_ERRORS: {
    action: "block_all_tasks",
    description: "Deployment-Blocker, alle Tasks stoppen",
    resolution: "Muss vor weiteren Tasks behoben werden",
  },
  
  RUNTIME_ERRORS: {
    action: "track_and_prioritize",
    tracking: "sentry/logging",
    priority: "high",
    resolution: "Priorisierte Behebung",
  },
  
  TEST_FAILURES: {
    action: "deployment_blocker",
    description: "Müssen vor Commit behoben werden",
    blocking: true,
  },
  
  ROOT_CAUSE_ANALYSIS: {
    required: true,
    documentPatterns: true,
    preventRecurrence: true,
  },
} as const

/**
 * AUFGABENPLANUNG & -STRUKTURIERUNG
 */
export const TASK_PLANNING_RULES = {
  ATOMIC_TASKS: {
    maxDuration: "2 hours",
    description: "Zerlegung in maximal 2-stündige Arbeitseinheiten",
  },
  
  DEFINITIONS: {
    acceptanceCriteria: "required",
    definitionOfDone: "required",
    explicit: true,
  },
  
  DEPENDENCIES: {
    explicitDefinition: true,
    format: "Task X vor Y",
    validation: true,
  },
  
  ESTIMATES: {
    includeTesting: true,
    includeBugfixing: true,
    realistic: true,
  },
  
  PRIORITIZATION: {
    scale: [
      "critical", // Kritische Bugs
      "high", // Blockierende Features
      "medium", // Verbesserungen
      "low", // Nice-to-have-Funktionalitäten
    ] as const,
  },
  
  AUTONOMY: {
    allTasksMustBeAutonomous: true,
    noUserIntervention: true,
  },
} as const

/**
 * PARALLELARBEIT & TRACK-MANAGEMENT
 */
export const PARALLEL_TRACKS = {
  TRACKS: [
    {
      id: "track-1",
      name: "Qualitätssicherung & Bugfixing",
      workflow: "HF-Implementierung → Copilot-Review",
      priority: "high",
    },
    {
      id: "track-2",
      name: "Feature-Completion",
      description: "Finale App-Fertigstellung",
      priority: "high",
    },
    {
      id: "track-3",
      name: "Kontinuierliche Workflow-Optimierung",
      priority: "medium",
    },
  ] as const,
  
  OPERATION: {
    parallel: true,
    syncPoints: "after-sprints",
    conflictResolution: "immediate-escalation",
  },
} as const

/**
 * VOLLSTÄNDIGKEITS- & LÜCKENANALYSE
 * Kontinuierliche Identifikation und Schließung von Lücken
 */
export const COMPLETENESS_CHECKS = {
  AREAS: [
    {
      area: "funktionalitaet",
      description: "Fehlende Features laut Planung",
      checkMethod: "compareWithPlan",
    },
    {
      area: "testabdeckung",
      description: "Ungetesteter Code (Unit/Integration/E2E)",
      checkMethod: "coverageAnalysis",
    },
    {
      area: "dokumentation",
      description: "Undokumentierte APIs/Komponenten (via documentation-api.ts)",
      checkMethod: "documentationGapAnalysis",
    },
    {
      area: "fehlerbehandlung",
      description: "Unbehandelte Edge Cases, fehlende Try-Catch-Blöcke",
      checkMethod: "errorHandlingAnalysis",
    },
    {
      area: "code-qualitaet",
      description: "ESLint-/TypeScript-Fehler, Security-Issues",
      checkMethod: "staticAnalysis",
    },
    {
      area: "performance",
      description: "Unoptimierte Queries, Memory-Leaks, Bottlenecks",
      checkMethod: "performanceAnalysis",
    },
    {
      area: "accessibility",
      description: "WCAG-Compliance, Screen-Reader-Support",
      checkMethod: "a11yAnalysis",
    },
    {
      area: "sonstige",
      description: "Alle weiteren auffälligen Unvollständigkeiten",
      checkMethod: "generalGapAnalysis",
    },
  ] as const,
  
  FREQUENCY: "continuous",
  PROACTIVE: true,
} as const

/**
 * SYSTEMOPTIMIERUNG
 */
export const SYSTEM_OPTIMIZATION = {
  DOCUMENTATION_SYSTEM: {
    check: "Vollständige Funktionsprüfung des automatischen Dokumentationssystems",
    action: "Bei Bedarf sofortige, funktionierende Optimierung",
  },
  
  DATA_LOADING: {
    requirement: "Jeder AI-Assistent lädt bei jedem Start zwangsweise benötigte Daten",
    validation: "Sicherstellung der Datenladung",
  },
  
  BOT_VERIFICATION: {
    requirement: "Verifikation, dass alle Bots nach AI-Team-Vorgaben aktiv und zuverlässig arbeiten",
    frequency: "continuous",
  },
} as const

/**
 * HELPER-FUNKTIONEN
 */

/**
 * Lade Informationen aus priorisierten Quellen
 */
export async function loadInformationSources(
  categories?: DocumentationCategory[]
): Promise<{
  codebase: any
  planung: string
  documentation: any[]
}> {
  const results = {
    codebase: null,
    planung: "",
    documentation: [] as any[],
  }

  try {
    // 1. Lade Planung
    if (await fs.access(INFORMATION_SOURCES.PLANUNG.path).then(() => true).catch(() => false)) {
      results.planung = await fs.readFile(INFORMATION_SOURCES.PLANUNG.path, "utf-8")
    }

    // 2. Lade Dokumentation
    if (categories && categories.length > 0) {
      results.documentation = await loadDocumentationForBot(categories)
    } else {
      results.documentation = await loadDocumentationForBot([
        "change-log",
        "error-documentation",
        "feature-documentation",
        "architecture-decision",
      ])
    }
  } catch (error) {
    console.error("Fehler beim Laden der Informationsquellen:", error)
  }

  return results
}

/**
 * Validiere ob alle IST-Analyse-Schritte durchgeführt wurden
 */
export function validateISTAnalysis(steps: Record<string, boolean>): {
  valid: boolean
  missing: string[]
} {
  const required = IST_ANALYSIS_REQUIREMENTS.MANDATORY_STEPS.map((s) => s.step)
  const missing = required.filter((step) => !steps[step])

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Bestimme Agent-Rolle basierend auf Task-Typ
 */
export function determineAgentRole(taskType: string): string {
  const taskLower = taskType.toLowerCase()

  if (taskLower.includes("api") || taskLower.includes("database") || taskLower.includes("server")) {
    return "backend-agent"
  }
  if (taskLower.includes("ui") || taskLower.includes("component") || taskLower.includes("styling")) {
    return "frontend-agent"
  }
  if (taskLower.includes("test") || taskLower.includes("coverage")) {
    return "testing-agent"
  }
  if (taskLower.includes("doc") || taskLower.includes("wiki") || taskLower.includes("changelog")) {
    return "documentation-agent"
  }
  if (taskLower.includes("deploy") || taskLower.includes("ci-cd") || taskLower.includes("infrastructure")) {
    return "devops-agent"
  }

  return "system-bot" // Fallback
}

/**
 * Validiere Git-Commit-Message-Format
 */
export function validateCommitMessage(message: string): boolean {
  return GIT_PROTOCOL.VALIDATION.commitMessageFormat.test(message)
}

/**
 * Erstelle Git-Commit-Message nach Protokoll
 */
export function createCommitMessage(agentRole: string, taskId: string, description: string): string {
  return `[${agentRole}][${taskId}] ${description}`
}

