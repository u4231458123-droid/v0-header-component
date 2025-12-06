/**
 * Genesis Prompt Architect
 * ========================
 * Transformiert vage User-Eingaben in perfekte, ausführbare Prompts.
 * Implementiert das C.R.E.D.O. Framework mit Live-Kontext-Integration.
 *
 * Workflow:
 * 1. User-Eingabe analysieren
 * 2. Live-Kontext laden (Nexus Bridge)
 * 3. Optimierten Prompt generieren (C.R.E.D.O.)
 * 4. Prompt validieren
 * 5. Autonom ausführen
 */

import { loadProjectContext, type ActiveDocs, type AppRoutes, type DBSchema, type UITokens } from "./bots/nexus-bridge-integration"
import { monitoring } from "./monitoring"
import { QuickWorkflows } from "./workflow-orchestrator"

// Task-Typen die erkannt werden können
export type TaskType =
  | "feature"
  | "bugfix"
  | "qa"
  | "refactor"
  | "migration"
  | "documentation"
  | "optimization"
  | "unknown"

// Analyse-Ergebnis
export interface InputAnalysis {
  originalInput: string
  taskType: TaskType
  keywords: string[]
  complexity: "simple" | "medium" | "complex"
  affectedAreas: Array<"frontend" | "backend" | "database" | "tests" | "docs">
  detectedEntities: string[]
  confidence: number
}

// Live-Kontext
export interface LiveContext {
  uiTokens: UITokens | null
  dbSchema: DBSchema | null
  appRoutes: AppRoutes | null
  activeDocs: ActiveDocs | null
  timestamp: string
}

// Optimierter Prompt
export interface OptimizedPrompt {
  original: string
  optimized: string
  framework: "C.R.E.D.O."
  sections: {
    context: string
    role: string
    execution: string
    definitionOfDone: string
    output: string
  }
  metadata: {
    taskType: TaskType
    complexity: string
    estimatedDuration: string
    affectedFiles: string[]
  }
}

// Validierungs-Ergebnis
export interface ValidationResult {
  valid: boolean
  score: number
  issues: string[]
  suggestions: string[]
}

// Ausführungs-Ergebnis
export interface ExecutionResult {
  success: boolean
  prompt: OptimizedPrompt
  workflowId?: string
  errors: string[]
  duration: number
}

/**
 * Genesis Prompt Architect
 */
export class GenesisPromptArchitect {
  private static instance: GenesisPromptArchitect
  private liveContext: LiveContext | null = null
  private taskKeywords: Record<TaskType, string[]>

  private constructor() {
    this.taskKeywords = {
      feature: ["implement", "add", "create", "build", "new", "feature", "erstelle", "baue", "neu", "hinzufügen"],
      bugfix: ["fix", "bug", "error", "issue", "problem", "broken", "fehler", "kaputt", "repariere", "behebe"],
      qa: ["test", "quality", "check", "validate", "qa", "prüfe", "teste", "validiere", "qualität"],
      refactor: ["refactor", "clean", "improve", "optimize", "simplify", "verbessere", "aufräumen", "vereinfachen"],
      migration: ["migrate", "database", "schema", "table", "column", "migration", "datenbank", "tabelle"],
      documentation: ["document", "docs", "readme", "comment", "dokumentiere", "beschreibe", "erkläre"],
      optimization: ["optimize", "performance", "speed", "fast", "schneller", "optimiere", "performance"],
      unknown: []
    }
  }

  static getInstance(): GenesisPromptArchitect {
    if (!GenesisPromptArchitect.instance) {
      GenesisPromptArchitect.instance = new GenesisPromptArchitect()
    }
    return GenesisPromptArchitect.instance
  }

  /**
   * Hauptmethode: Transformiere User-Input in ausführbaren Prompt
   */
  async transformAndExecute(userInput: string): Promise<ExecutionResult> {
    const startTime = Date.now()

    try {
      // 1. Analysiere User-Input
      const analysis = this.analyzeUserInput(userInput)
      console.log(`📊 Analyse: ${analysis.taskType} (${(analysis.confidence * 100).toFixed(0)}% Konfidenz)`)

      // 2. Lade Live-Kontext
      this.liveContext = await this.fetchLiveContext()
      console.log(`📥 Live-Kontext geladen: ${this.liveContext.timestamp}`)

      // 3. Generiere optimierten Prompt
      const optimizedPrompt = this.generateOptimizedPrompt(analysis, this.liveContext)
      console.log(`✨ Optimierter Prompt generiert (${optimizedPrompt.metadata.taskType})`)

      // 4. Validiere Prompt
      const validation = this.validatePromptQuality(optimizedPrompt)
      if (!validation.valid) {
        console.warn(`⚠️ Prompt-Validierung: ${validation.issues.join(", ")}`)
        // Automatisch verbessern
        const improved = this.autoImprovePrompt(optimizedPrompt, validation)
        Object.assign(optimizedPrompt, improved)
      }

      // 5. Führe autonom aus
      const workflowResult = await this.executePromptAutonomously(optimizedPrompt)

      // Monitoring
      monitoring.recordBotActivity("prompt-architect", "completed", Date.now() - startTime)

      return {
        success: workflowResult.success,
        prompt: optimizedPrompt,
        workflowId: workflowResult.workflowId,
        errors: workflowResult.errors,
        duration: Date.now() - startTime
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      monitoring.recordBotActivity("prompt-architect", "failed", Date.now() - startTime, errorMessage)
      monitoring.createAlert("error", "prompt-architect", `Prompt-Transformation fehlgeschlagen: ${errorMessage}`)

      return {
        success: false,
        prompt: {
          original: userInput,
          optimized: "",
          framework: "C.R.E.D.O.",
          sections: { context: "", role: "", execution: "", definitionOfDone: "", output: "" },
          metadata: { taskType: "unknown", complexity: "unknown", estimatedDuration: "unknown", affectedFiles: [] }
        },
        errors: [errorMessage],
        duration: Date.now() - startTime
      }
    }
  }

  /**
   * Analysiere User-Input
   */
  analyzeUserInput(input: string): InputAnalysis {
    const inputLower = input.toLowerCase()
    const words = inputLower.split(/\s+/)

    // Task-Typ erkennen
    let taskType: TaskType = "unknown"
    let maxMatches = 0

    for (const [type, keywords] of Object.entries(this.taskKeywords)) {
      const matches = keywords.filter(kw => inputLower.includes(kw)).length
      if (matches > maxMatches) {
        maxMatches = matches
        taskType = type as TaskType
      }
    }

    // Keywords extrahieren
    const allKeywords = Object.values(this.taskKeywords).flat()
    const keywords = words.filter(word => allKeywords.includes(word))

    // Komplexität schätzen
    let complexity: InputAnalysis["complexity"] = "simple"
    if (words.length > 20 || input.includes("und") || input.includes("sowie")) {
      complexity = "medium"
    }
    if (words.length > 50 || input.split(".").length > 3) {
      complexity = "complex"
    }

    // Betroffene Bereiche erkennen
    const affectedAreas: InputAnalysis["affectedAreas"] = []
    if (/ui|component|button|dialog|page|frontend/i.test(input)) affectedAreas.push("frontend")
    if (/api|server|backend|database|supabase/i.test(input)) affectedAreas.push("backend")
    if (/table|column|migration|schema|sql/i.test(input)) affectedAreas.push("database")
    if (/test|e2e|unit|coverage/i.test(input)) affectedAreas.push("tests")
    if (/doc|readme|comment|swimm/i.test(input)) affectedAreas.push("docs")

    // Entitäten erkennen (PascalCase, camelCase)
    const entityPattern = /[A-Z][a-z]+(?:[A-Z][a-z]+)*/g
    const detectedEntities = input.match(entityPattern) || []

    // Konfidenz berechnen
    const confidence = Math.min(1, maxMatches / 3 + (affectedAreas.length > 0 ? 0.3 : 0))

    return {
      originalInput: input,
      taskType,
      keywords,
      complexity,
      affectedAreas: affectedAreas.length > 0 ? affectedAreas : ["frontend"], // Default
      detectedEntities: [...new Set(detectedEntities)],
      confidence
    }
  }

  /**
   * Lade Live-Kontext von Nexus Bridge
   */
  async fetchLiveContext(): Promise<LiveContext> {
    const context = await loadProjectContext()
    return {
      ...context,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generiere optimierten Prompt nach C.R.E.D.O. Framework
   */
  generateOptimizedPrompt(analysis: InputAnalysis, context: LiveContext): OptimizedPrompt {
    // Context-Sektion
    const contextSection = this.generateContextSection(analysis, context)

    // Role-Sektion
    const roleSection = this.generateRoleSection(analysis)

    // Execution-Sektion
    const executionSection = this.generateExecutionSection(analysis)

    // Definition of Done-Sektion
    const definitionOfDone = this.generateDefinitionOfDone(analysis)

    // Output-Sektion
    const outputSection = this.generateOutputSection(analysis)

    // Kompletten Prompt zusammenbauen
    const optimizedPrompt = `# TASK: ${this.getTaskTitle(analysis)}

## C - Context
${contextSection}

## R - Role
${roleSection}

## E - Execution
${executionSection}

## D - Definition of Done
${definitionOfDone}

## O - Output
${outputSection}

---

**Original User Request:** ${analysis.originalInput}

**EXECUTE.**`

    return {
      original: analysis.originalInput,
      optimized: optimizedPrompt,
      framework: "C.R.E.D.O.",
      sections: {
        context: contextSection,
        role: roleSection,
        execution: executionSection,
        definitionOfDone,
        output: outputSection
      },
      metadata: {
        taskType: analysis.taskType,
        complexity: analysis.complexity,
        estimatedDuration: this.estimateDuration(analysis),
        affectedFiles: this.predictAffectedFiles(analysis, context)
      }
    }
  }

  /**
   * Generiere Context-Sektion
   */
  private generateContextSection(analysis: InputAnalysis, context: LiveContext): string {
    const mcpResources = [
      "project://ui/tokens",
      "project://db/schema",
      "project://app/routes",
      "project://docs/active"
    ]

    const relevantDocs = ["@project_specs.md"]
    if (analysis.affectedAreas.includes("database")) {
      relevantDocs.push("@types/supabase.ts")
    }

    let section = `**Relevante Dokumentation:**
${relevantDocs.map(d => `- ${d}`).join("\n")}

**MCP Live-Kontext (automatisch geladen):**
${mcpResources.map(r => `- \`${r}\``).join("\n")}

**Erkannte Entitäten:** ${analysis.detectedEntities.join(", ") || "Keine spezifischen"}

**Betroffene Bereiche:** ${analysis.affectedAreas.join(", ")}`

    if (context.dbSchema && analysis.affectedAreas.includes("database")) {
      section += `\n\n**DB-Schema verfügbar:** ${context.dbSchema.tables.length} Tabellen`
    }

    if (context.appRoutes && analysis.affectedAreas.includes("frontend")) {
      section += `\n\n**App-Routen verfügbar:** ${context.appRoutes.pages.length} Seiten, ${context.appRoutes.apiRoutes.length} API-Routen`
    }

    return section
  }

  /**
   * Generiere Role-Sektion
   */
  private generateRoleSection(analysis: InputAnalysis): string {
    const roleMap: Record<TaskType, string> = {
      feature: "Full-Stack Developer",
      bugfix: "QA-Engineer und Bug-Fixer",
      qa: "QA-Lead und Code-Reviewer",
      refactor: "Senior Software Architect",
      migration: "Database Administrator",
      documentation: "Technical Writer",
      optimization: "Performance Engineer",
      unknown: "Full-Stack Developer"
    }

    const role = roleMap[analysis.taskType]

    return `Agiere als **${role}** im NEO-GENESIS Hyper-Stack.

**Deine Prinzipien:**
- TypeScript strict mode einhalten
- Design-Tokens verwenden (keine hardcoded Farben)
- UI-Texte auf Deutsch (Sie-Form, DIN 5008)
- Keine verbotenen Begriffe (kostenlos, gratis, testen, etc.)
- Quality Gates müssen bestehen vor Commit`
  }

  /**
   * Generiere Execution-Sektion
   */
  private generateExecutionSection(analysis: InputAnalysis): string {
    const baseSteps = [
      "1. **Context Fetch (Nexus Bridge):**\n   - Lade `loadProjectContext()`\n   - Prüfe bestehende Patterns",
      "2. **Implementierung:**\n   - [Basierend auf Task-Typ]",
      "3. **Self-Correction:**\n   - `pnpm run lint`\n   - `pnpm run type-check`\n   - `pnpm run validate:design`",
      "4. **Quality Gates:**\n   - `Gates.preCommit()` muss bestehen",
      "5. **Documentation:**\n   - Swimm-Doc aktualisieren falls nötig"
    ]

    // Task-spezifische Schritte
    const taskSpecificSteps: Record<TaskType, string> = {
      feature: "   - Erstelle Komponenten/Routes nach Bedarf\n   - Nutze Server Components als Default\n   - Client Components nur wenn interaktiv",
      bugfix: "   - Schreibe reproduzierenden Testfall (Red)\n   - Implementiere minimalen Fix (Green)\n   - Refactor wenn nötig",
      qa: "   - Führe alle Quality-Checks durch\n   - Erstelle Report mit Findings\n   - Priorisiere Issues",
      refactor: "   - Kleine, verifizierbare Schritte\n   - Nach jedem Schritt: Tests müssen bestehen\n   - Behavior Preservation",
      migration: "   - Migration-SQL erstellen\n   - RLS-Policies hinzufügen\n   - TypeScript-Typen aktualisieren",
      documentation: "   - Swimm-Doc erstellen/aktualisieren\n   - JSDoc für öffentliche APIs\n   - README falls nötig",
      optimization: "   - Performance-Baseline messen\n   - Optimierung implementieren\n   - Verbesserung verifizieren",
      unknown: "   - Aufgabe analysieren\n   - Passenden Ansatz wählen"
    }

    baseSteps[1] = `2. **Implementierung:**\n${taskSpecificSteps[analysis.taskType]}`

    return baseSteps.join("\n\n")
  }

  /**
   * Generiere Definition of Done
   */
  private generateDefinitionOfDone(analysis: InputAnalysis): string {
    const baseCriteria = [
      "[ ] TypeScript kompiliert ohne Fehler (strict mode)",
      "[ ] ESLint zeigt keine Errors",
      "[ ] Design-Token-Konsistenz geprüft",
      "[ ] Keine verbotenen Begriffe",
      "[ ] Pre-Commit Gate bestanden"
    ]

    // Task-spezifische Kriterien
    if (analysis.taskType === "feature") {
      baseCriteria.push("[ ] Feature funktioniert wie spezifiziert")
      baseCriteria.push("[ ] Unit-Tests geschrieben")
      baseCriteria.push("[ ] Loading States implementiert")
    }

    if (analysis.taskType === "bugfix") {
      baseCriteria.push("[ ] Testfall existiert und besteht")
      baseCriteria.push("[ ] Keine Regression")
      baseCriteria.push("[ ] Root-Cause dokumentiert")
    }

    if (analysis.taskType === "qa") {
      baseCriteria.push("[ ] Alle Checks durchgeführt")
      baseCriteria.push("[ ] Report erstellt")
      baseCriteria.push("[ ] Keine Critical/High Issues offen")
    }

    if (analysis.taskType === "migration") {
      baseCriteria.push("[ ] RLS-Policies konfiguriert")
      baseCriteria.push("[ ] TypeScript-Typen aktualisiert")
      baseCriteria.push("[ ] Rollback-Script vorhanden")
    }

    return baseCriteria.map(c => `- ${c}`).join("\n")
  }

  /**
   * Generiere Output-Sektion
   */
  private generateOutputSection(analysis: InputAnalysis): string {
    const commitTypes: Record<TaskType, string> = {
      feature: "feat",
      bugfix: "fix",
      qa: "test",
      refactor: "refactor",
      migration: "feat(db)",
      documentation: "docs",
      optimization: "perf",
      unknown: "chore"
    }

    return `**Erwartete Ausgabe:**

1. Alle geänderten/neuen Dateien
2. Test-Ergebnisse (falls relevant)
3. Commit-Message: \`${commitTypes[analysis.taskType]}([scope]): [beschreibung]\``
  }

  /**
   * Task-Titel generieren
   */
  private getTaskTitle(analysis: InputAnalysis): string {
    const titleMap: Record<TaskType, string> = {
      feature: "Feature Implementierung",
      bugfix: "Bug-Behebung",
      qa: "QA-Workflow",
      refactor: "Code-Refactoring",
      migration: "Datenbank-Migration",
      documentation: "Dokumentation",
      optimization: "Performance-Optimierung",
      unknown: "Aufgabe"
    }

    const entities = analysis.detectedEntities.slice(0, 2).join(", ")
    const base = titleMap[analysis.taskType]

    return entities ? `${base}: ${entities}` : base
  }

  /**
   * Dauer schätzen
   */
  private estimateDuration(analysis: InputAnalysis): string {
    const baseTime: Record<InputAnalysis["complexity"], number> = {
      simple: 15,
      medium: 45,
      complex: 120
    }

    const multipliers: Record<TaskType, number> = {
      feature: 1.5,
      bugfix: 1.0,
      qa: 1.2,
      refactor: 1.3,
      migration: 2.0,
      documentation: 0.8,
      optimization: 1.4,
      unknown: 1.0
    }

    const minutes = Math.round(baseTime[analysis.complexity] * multipliers[analysis.taskType])

    if (minutes < 60) return `~${minutes} Minuten`
    return `~${Math.round(minutes / 60)} Stunde(n)`
  }

  /**
   * Betroffene Dateien vorhersagen
   */
  private predictAffectedFiles(analysis: InputAnalysis, _context: LiveContext): string[] {
    const files: string[] = []

    // Basierend auf Entitäten
    for (const entity of analysis.detectedEntities) {
      const kebabCase = entity.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1)
      if (analysis.affectedAreas.includes("frontend")) {
        files.push(`components/**/${entity}.tsx`)
        files.push(`app/**/${kebabCase}/page.tsx`)
      }
    }

    // Basierend auf Bereichen
    if (analysis.affectedAreas.includes("database")) {
      files.push("types/supabase.ts")
      files.push("scripts/*.sql")
    }

    if (analysis.affectedAreas.includes("tests")) {
      files.push("**/*.test.ts")
      files.push("e2e/**/*.spec.ts")
    }

    return [...new Set(files)].slice(0, 5)
  }

  /**
   * Validiere Prompt-Qualität
   */
  validatePromptQuality(prompt: OptimizedPrompt): ValidationResult {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 100

    // Context prüfen
    if (prompt.sections.context.length < 100) {
      issues.push("Context-Sektion zu kurz")
      suggestions.push("Mehr Kontext-Informationen hinzufügen")
      score -= 15
    }

    // Execution prüfen
    if (!prompt.sections.execution.includes("Self-Correction")) {
      issues.push("Self-Correction fehlt in Execution")
      suggestions.push("Self-Correction-Schritte hinzufügen")
      score -= 20
    }

    // Definition of Done prüfen
    const checkboxCount = (prompt.sections.definitionOfDone.match(/\[ \]/g) || []).length
    if (checkboxCount < 3) {
      issues.push("Zu wenige Definition-of-Done Kriterien")
      suggestions.push("Mindestens 5 Kriterien definieren")
      score -= 15
    }

    // Task-Typ prüfen
    if (prompt.metadata.taskType === "unknown") {
      issues.push("Task-Typ nicht erkannt")
      suggestions.push("Explizitere Beschreibung verwenden")
      score -= 25
    }

    return {
      valid: score >= 60,
      score,
      issues,
      suggestions
    }
  }

  /**
   * Automatisch Prompt verbessern
   */
  private autoImprovePrompt(prompt: OptimizedPrompt, validation: ValidationResult): Partial<OptimizedPrompt> {
    let improved = { ...prompt }

    // Context erweitern wenn zu kurz
    if (validation.issues.includes("Context-Sektion zu kurz")) {
      improved.sections.context += `\n\n**Zusätzlicher Kontext:**
- Prüfe bestehende Implementierungen für ähnliche Funktionalität
- Konsultiere project_specs.md für Architektur-Vorgaben
- Verwende Design-Tokens aus config/design-tokens.ts`
    }

    // Self-Correction hinzufügen
    if (validation.issues.includes("Self-Correction fehlt in Execution")) {
      improved.sections.execution += `\n\n**Self-Correction:**
- \`pnpm run lint\` - ESLint prüfen
- \`pnpm run type-check\` - TypeScript prüfen
- \`pnpm run validate:design\` - Design-Tokens prüfen
- Bei Fehlern: Self-Healing aktivieren`
    }

    // DoD erweitern
    if (validation.issues.includes("Zu wenige Definition-of-Done Kriterien")) {
      improved.sections.definitionOfDone += `
- [ ] Dokumentation aktualisiert
- [ ] Keine Regression
- [ ] Code-Review-ready`
    }

    // Optimierten Prompt neu zusammenbauen
    improved.optimized = `# TASK: ${this.getTaskTitle({ originalInput: prompt.original, taskType: prompt.metadata.taskType as TaskType, keywords: [], complexity: prompt.metadata.complexity as InputAnalysis["complexity"], affectedAreas: [], detectedEntities: [], confidence: 0 })}

## C - Context
${improved.sections.context}

## R - Role
${improved.sections.role}

## E - Execution
${improved.sections.execution}

## D - Definition of Done
${improved.sections.definitionOfDone}

## O - Output
${improved.sections.output}

---

**Original User Request:** ${prompt.original}

**EXECUTE.**`

    return improved
  }

  /**
   * Führe Prompt autonom aus
   */
  async executePromptAutonomously(prompt: OptimizedPrompt): Promise<{
    success: boolean
    workflowId?: string
    errors: string[]
  }> {
    try {
      // Wähle passenden QuickWorkflow basierend auf Task-Typ
      let workflow

      switch (prompt.metadata.taskType) {
        case "qa":
          workflow = await QuickWorkflows.qa()
          break
        case "bugfix":
          workflow = await QuickWorkflows.bugfix(prompt.original)
          break
        case "optimization":
          workflow = await QuickWorkflows.optimize()
          break
        case "feature":
        default:
          workflow = await QuickWorkflows.feature(
            prompt.metadata.affectedFiles[0] || "Feature",
            prompt.original
          )
          break
      }

      return {
        success: workflow.phase === "completed",
        workflowId: workflow.id,
        errors: workflow.errors
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }

  /**
   * Hole aktuellen Live-Kontext (cached)
   */
  getLiveContext(): LiveContext | null {
    return this.liveContext
  }
}

/**
 * Singleton-Export
 */
export const promptArchitect = GenesisPromptArchitect.getInstance()

/**
 * Convenience-Funktion für direkten Aufruf
 */
export async function executeFromUserInput(userInput: string): Promise<ExecutionResult> {
  return promptArchitect.transformAndExecute(userInput)
}

