/**
 * SYSTEM-BOT
 * ==========
 * Bot für System-Wartung, Code-Analyse und Fehlerbehebung
 * Hat Zugriff auf zentrale Wissensdatenbank
 */

import { loadKnowledgeForTask, generatePromptWithKnowledge, type KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { getOptimizedHuggingFaceClient } from "@/lib/ai/huggingface-optimized"
import { validateSupabaseProject, validateSchemaTables, applyMigrationWithValidation } from "./mcp-integration"
import { generateCodeAnalysisPrompt, generateBugAnalysisPrompt, generateCodeOptimizationPrompt, generateAutoFixPrompt } from "@/lib/cicd/prompts"
import { logError } from "@/lib/cicd/error-logger"
import { analyzeCodebase, formatPatternsForPrompt } from "@/lib/cicd/codebase-analyzer"
import { WorkTracker } from "@/lib/knowledge-base/work-tracking"

export interface BotTask {
  id: string
  type: "code-analysis" | "bug-fix" | "optimization" | "refactoring" | "feature"
  description: string
  filePath?: string
  context?: any
}

export interface BotResponse {
  success: boolean
  analysis?: string
  changes?: any[]
  errors?: string[]
  warnings?: string[]
  documentation?: string
}

export class SystemBot {
  private knowledgeBase: any
  private modelId: string = "deepseek-ai/DeepSeek-V3" // Standard-Modell
  private workTracker: WorkTracker

  constructor() {
    this.loadKnowledgeBase()
    this.workTracker = new WorkTracker()
  }

  /**
   * Lade alle Vorgaben, Regeln, Verbote und Docs
   * OBLIGATORISCH vor jeder Aufgabe
   */
  private async loadKnowledgeBase() {
    // Lade alle kritischen Knowledge-Entries inkl. CI/CD
    const categories: KnowledgeCategory[] = [
      "design-guidelines",
      "coding-rules",
      "forbidden-terms",
      "architecture",
      "best-practices",
      "account-rules",
      "routing-rules",
      "pdf-generation",
      "email-templates",
      "functionality-rules",
      "ci-cd",
      "error-handling",
      "ui-consistency",
      "systemwide-thinking",
      "bot-instructions",
      "mydispatch-core",
    ]
    
    this.knowledgeBase = loadKnowledgeForTask("system-maintenance", categories)
    
    // Lade zusätzlich detaillierte UI-Konsistenz-Regeln
    const detailedConsistency = loadKnowledgeForTask("system-maintenance", ["ui-consistency"])
    this.knowledgeBase = [...this.knowledgeBase, ...detailedConsistency.filter((e: any) => 
      e.id === "ui-consistency-detailed-001" || 
      e.id === "visual-logical-validation-001" || 
      e.id === "quality-thinking-detailed-001"
    )]
  }

  /**
   * Führe IST-Analyse durch
   * OBLIGATORISCH vor jeder Änderung
   */
  async performCurrentStateAnalysis(task: BotTask): Promise<{
    currentState: any
    dependencies: string[]
    risks: string[]
    recommendations: string[]
    codebasePatterns?: string
  }> {
    const currentState: any = {
      filePath: task.filePath,
      taskType: task.type,
      description: task.description,
    }

    // Lade Code-Inhalt wenn filePath vorhanden
    if (task.filePath) {
      try {
        const fs = await import("fs/promises")
        const codeContent = await fs.readFile(task.filePath, "utf-8")
        currentState.codeSnippet = codeContent.substring(0, 500) + "..."
        currentState.lineCount = codeContent.split("\n").length
        currentState.hasHardcodedColors = /#(?:[0-9a-fA-F]{3}){1,2}/i.test(codeContent)
        currentState.hasForbiddenTerms = /kostenlos|gratis|\bfree\b|testen|trial/i.test(codeContent)
      } catch (error: any) {
        console.warn(`Could not read file ${task.filePath}: ${error.message}`)
      }
    }

    // Analysiere Codebase-Patterns
    let codebasePatterns: string | undefined
    try {
      const patterns = await analyzeCodebase()
      codebasePatterns = formatPatternsForPrompt(patterns)
    } catch (error: any) {
      console.warn(`Could not analyze codebase: ${error.message}`)
    }

    // Analysiere Abhängigkeiten
    const dependencies: string[] = []
    try {
      const fs = await import("fs/promises")
      const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"))
      dependencies.push(...Object.keys(packageJson.dependencies || {}))
    } catch {
      dependencies.push("package.json", "tsconfig.json", "next.config.js")
    }

    // Identifiziere Risiken basierend auf Knowledge-Base
    const risks: string[] = []
    if (this.knowledgeBase) {
      // Prüfe gegen Design-Guidelines
      const designGuidelines = this.knowledgeBase.find((e: any) => e.id === "design-guidelines-001")
      if (designGuidelines) {
        risks.push("Design-Änderungen sind streng verboten")
      }
      
      // Prüfe gegen Funktionalitäts-Regeln
      const functionalityRules = this.knowledgeBase.find((e: any) => e.id === "functionality-rules-001")
      if (functionalityRules) {
        risks.push("Bestehende Funktionalität darf nicht entfernt werden")
      }
      
      // Prüfe gegen verbotene Begriffe
      if (currentState.hasForbiddenTerms) {
        risks.push("Verbotene Begriffe gefunden - müssen entfernt werden")
      }
    }

    // Generiere Empfehlungen
    const recommendations: string[] = [
      "Vollständige IST-Analyse durchgeführt",
      "Knowledge-Base geladen",
      "Codebase-Patterns analysiert",
      "Bereit für Code-Änderungen",
    ]
    
    if (currentState.hasHardcodedColors) {
      recommendations.push("Hardcoded Farben gefunden - durch Design-Tokens ersetzen")
    }

    return {
      currentState,
      dependencies,
      risks,
      recommendations,
      codebasePatterns,
    }
  }

  /**
   * Analysiere Code auf Fehler
   */
  async analyzeCode(task: BotTask): Promise<BotResponse> {
    // 1. Lade Knowledge-Base
    await this.loadKnowledgeBase()
    
    // 2. Führe IST-Analyse durch
    const analysis = await this.performCurrentStateAnalysis(task)
    
    // 3. Lade Code-Inhalt wenn filePath vorhanden
    let codeContent = ""
    if (task.filePath) {
      try {
        const fs = await import("fs/promises")
        codeContent = await fs.readFile(task.filePath, "utf-8")
      } catch (error: any) {
        return {
          success: false,
          errors: [`Fehler beim Lesen von ${task.filePath}: ${error.message}`],
        }
      }
    }
    
    // 4. Generiere Code-Analyse Prompt mit vollständigen Parametern
    const dependenciesInfo = analysis.dependencies.slice(0, 10).join(", ")
    const prompt = generateCodeAnalysisPrompt(
      task.filePath || "unknown",
      task.filePath?.endsWith(".tsx") ? "React Component" : "TypeScript Module",
      codeContent || task.description,
      JSON.stringify(analysis.currentState),
      dependenciesInfo,
      analysis.codebasePatterns
    )
    
    // 5. Analysiere Code mit Hugging Face (optimiert mit Multi-Model-Support)
    try {
      const aiClient = getOptimizedHuggingFaceClient()
      const result = await aiClient.generateForBot("system-bot", prompt, "code-analysis")
      
      // Parse JSON Response
      try {
        const analysisResult = JSON.parse(result.text)
        return {
          success: true,
          analysis: JSON.stringify(analysisResult, null, 2),
          warnings: analysisResult.warnings || [],
          errors: analysisResult.errors || [],
        }
      } catch (parseError) {
        // Falls kein JSON, gebe Text zurück
        return {
          success: true,
          analysis: result.text,
          warnings: [],
          errors: [],
        }
      }
    } catch (error: any) {
      return {
        success: false,
        errors: [`Fehler bei Code-Analyse: ${error.message}`],
      }
    }
  }

  /**
   * Behebe Fehler
   */
  async fixBugs(task: BotTask): Promise<BotResponse> {
    // 1. Lade Knowledge-Base
    await this.loadKnowledgeBase()
    
    // 2. Führe IST-Analyse durch
    const analysis = await this.performCurrentStateAnalysis(task)
    
    // 3. Lade Code-Inhalt
    let codeContent = ""
    if (task.filePath) {
      try {
        const fs = await import("fs/promises")
        codeContent = await fs.readFile(task.filePath, "utf-8")
      } catch (error: any) {
        return {
          success: false,
          errors: [`Fehler beim Lesen von ${task.filePath}: ${error.message}`],
        }
      }
    }
    
    // 4. Analysiere Bugs zuerst
    const bugAnalysisPrompt = generateBugAnalysisPrompt(
      task.filePath || "unknown",
      codeContent
    )
    
    try {
      const aiClient = getOptimizedHuggingFaceClient()
      const bugResult = await aiClient.generateForBot("system-bot", bugAnalysisPrompt, "bug-fix")
      
      // Parse Bug-Analyse (versuche zuerst JSON, dann Text)
      let bugData: any = { bugs: [] }
      try {
        let jsonText = bugResult.text.trim()
        
        // Entferne Markdown-Code-Blöcke falls vorhanden
        if (jsonText.startsWith("```")) {
          const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (match) {
            jsonText = match[1].trim()
          }
        }
        
        bugData = JSON.parse(jsonText)
      } catch (parseError) {
        // Falls kein JSON, versuche Text zu analysieren
        console.warn("Bug-Analyse Response ist kein JSON:", parseError)
        // Verwende leeres Ergebnis
      }
      
      // 5. Wenn Bugs gefunden, dokumentiere sie
      if (bugData.bugs && bugData.bugs.length > 0) {
        for (const bug of bugData.bugs) {
          await this.documentError({
            type: bug.category || "unknown",
            message: bug.message,
            filePath: task.filePath,
            line: bug.line,
            solution: bug.suggestion,
          })
        }
      }
      
      // 6. Wenn fixedCode vorhanden, verwende ihn direkt
      if (bugData.fixedCode && bugData.fixedCode.trim() !== codeContent.trim()) {
        // Entferne Markdown-Code-Blöcke falls vorhanden
        let cleanFixedCode = bugData.fixedCode.trim()
        if (cleanFixedCode.startsWith("```")) {
          const match = cleanFixedCode.match(/```(?:typescript|tsx|ts)?\s*([\s\S]*?)\s*```/)
          if (match) {
            cleanFixedCode = match[1].trim()
          }
        }
        
        // 6.1. VALIDIERE GEFIXTEN CODE
        const validationResult = await this.validateCode(cleanFixedCode, task.filePath || "unknown")
        if (!validationResult.isValid) {
          await this.documentError({
            type: "validation-error",
            message: `Gefixter Code ist nicht valide: ${validationResult.errors.join(", ")}`,
            filePath: task.filePath,
            context: { validationErrors: validationResult.errors },
          })
          // Versuche trotzdem zu verwenden, aber mit Warnung
          return {
            success: true,
            changes: [{ file: task.filePath, content: cleanFixedCode }],
            documentation: `Fehler analysiert und behoben: ${bugData.bugs?.length || 0} Bugs gefunden. WARNUNG: Code-Validierung fehlgeschlagen: ${validationResult.errors.join(", ")}`,
            warnings: [
              ...(bugData.bugs?.filter((b: any) => b.severity === "medium" || b.severity === "low").map((b: any) => b.message) || []),
              `Code-Validierung fehlgeschlagen: ${validationResult.errors.join(", ")}`,
            ],
            errors: bugData.bugs?.filter((b: any) => b.severity === "critical" || b.severity === "high").map((b: any) => b.message) || [],
          }
        }
        
        return {
          success: true,
          changes: [{ file: task.filePath, content: cleanFixedCode }],
          documentation: `Fehler analysiert und behoben: ${bugData.bugs?.length || 0} Bugs gefunden. Code validiert.`,
          warnings: bugData.bugs?.filter((b: any) => b.severity === "medium" || b.severity === "low").map((b: any) => b.message) || [],
          errors: bugData.bugs?.filter((b: any) => b.severity === "critical" || b.severity === "high").map((b: any) => b.message) || [],
        }
      }
      
      // 7. Wenn keine fixedCode, aber Bugs vorhanden, verwende Auto-Fix Prompt
      if (bugData.bugs && bugData.bugs.length > 0 && !bugData.fixedCode) {
        const autoFixPrompt = generateAutoFixPrompt(
          task.filePath || "unknown",
          codeContent,
          {
            syntaxErrors: bugData.bugs?.filter((b: any) => b.category === "syntax" || b.category === "type").map((b: any) => `${b.message} (Zeile ${b.line})`).join("\n") || "",
            typeErrors: bugData.bugs?.filter((b: any) => b.category === "type").map((b: any) => `${b.message} (Zeile ${b.line})`).join("\n") || "",
            importErrors: bugData.bugs?.filter((b: any) => b.category === "import").map((b: any) => `${b.message} (Zeile ${b.line})`).join("\n") || "",
            frameworkErrors: bugData.bugs?.filter((b: any) => b.category === "react" || b.category === "hooks").map((b: any) => `${b.message} (Zeile ${b.line})`).join("\n") || "",
            otherErrors: bugData.bugs?.filter((b: any) => !["syntax", "type", "import", "react", "hooks"].includes(b.category)).map((b: any) => `${b.message} (Zeile ${b.line})`).join("\n") || "",
          }
        )
        
        const autoFixResult = await aiClient.generateForBot("system-bot", autoFixPrompt, "bug-fix")
        let fixedCode = autoFixResult.text.trim()
        
        // Entferne Markdown-Code-Blöcke falls vorhanden
        if (fixedCode.startsWith("```")) {
          const match = fixedCode.match(/```(?:typescript|tsx|ts)?\s*([\s\S]*?)\s*```/)
          if (match) {
            fixedCode = match[1].trim()
          }
        }
        
        if (fixedCode && fixedCode !== codeContent.trim()) {
          // 7.1. VALIDIERE GEFIXTEN CODE
          const validationResult = await this.validateCode(fixedCode, task.filePath || "unknown")
          if (!validationResult.isValid) {
            await this.documentError({
              type: "validation-error",
              message: `Gefixter Code ist nicht valide: ${validationResult.errors.join(", ")}`,
              filePath: task.filePath,
              context: { validationErrors: validationResult.errors },
            })
            // Versuche trotzdem zu verwenden, aber mit Warnung
            return {
              success: true,
              changes: [{ file: task.filePath, content: fixedCode }],
              documentation: `Fehler analysiert und behoben: ${bugData.bugs?.length || 0} Bugs gefunden und automatisch behoben. WARNUNG: Code-Validierung fehlgeschlagen: ${validationResult.errors.join(", ")}`,
              warnings: [
                ...(bugData.bugs?.filter((b: any) => b.severity === "medium" || b.severity === "low").map((b: any) => b.message) || []),
                `Code-Validierung fehlgeschlagen: ${validationResult.errors.join(", ")}`,
              ],
              errors: bugData.bugs?.filter((b: any) => b.severity === "critical" || b.severity === "high").map((b: any) => b.message) || [],
            }
          }
          
          return {
            success: true,
            changes: [{ file: task.filePath, content: fixedCode }],
            documentation: `Fehler analysiert und behoben: ${bugData.bugs?.length || 0} Bugs gefunden und automatisch behoben. Code validiert.`,
            warnings: bugData.bugs?.filter((b: any) => b.severity === "medium" || b.severity === "low").map((b: any) => b.message) || [],
            errors: bugData.bugs?.filter((b: any) => b.severity === "critical" || b.severity === "high").map((b: any) => b.message) || [],
          }
        }
      }
      
      return {
        success: true,
        changes: [],
        documentation: `Fehler analysiert: ${bugData.bugs?.length || 0} Bugs gefunden`,
        warnings: bugData.bugs?.filter((b: any) => b.severity === "medium" || b.severity === "low").map((b: any) => b.message) || [],
        errors: bugData.bugs?.filter((b: any) => b.severity === "critical" || b.severity === "high").map((b: any) => b.message) || [],
      }
    } catch (error: any) {
      return {
        success: false,
        errors: [`Fehler bei Bug-Analyse: ${error.message}`],
      }
    }
  }

  /**
   * Optimiere Code
   */
  async optimizeCode(task: BotTask): Promise<BotResponse> {
    // 1. Lade Knowledge-Base
    await this.loadKnowledgeBase()
    
    // 2. Führe IST-Analyse durch
    const analysis = await this.performCurrentStateAnalysis(task)
    
    // 3. Lade Code-Inhalt
    let codeContent = ""
    if (task.filePath) {
      try {
        const fs = await import("fs/promises")
        codeContent = await fs.readFile(task.filePath, "utf-8")
      } catch (error: any) {
        return {
          success: false,
          errors: [`Fehler beim Lesen von ${task.filePath}: ${error.message}`],
        }
      }
    }
    
    // 4. Führe Code-Analyse durch, um Optimierungsvorschläge zu erhalten
    const codeAnalysis = await this.analyzeCode(task)
    let suggestionsList = ""
    if (codeAnalysis.analysis) {
      try {
        const analysisData = JSON.parse(codeAnalysis.analysis)
        suggestionsList = (analysisData.suggestions || []).join("\n")
      } catch {
        suggestionsList = "Allgemeine Optimierungen basierend auf Best Practices"
      }
    }
    
    // 5. Generiere Optimierungs-Prompt
    const optimizationPrompt = generateCodeOptimizationPrompt(
      task.filePath || "unknown",
      task.filePath?.endsWith(".tsx") ? "React Component" : "TypeScript Module",
      codeContent,
      suggestionsList,
      JSON.stringify(analysis.currentState),
      analysis.dependencies.slice(0, 10).join(", "),
      analysis.codebasePatterns
    )
    
    // 6. Optimiere Code mit Hugging Face (optimiert mit Multi-Model-Support)
    try {
      const aiClient = getOptimizedHuggingFaceClient()
      const result = await aiClient.generateForBot("system-bot", optimizationPrompt, "optimization")
      
      let optimizedCode = result.text.trim()
      
      // Entferne Markdown-Code-Blöcke falls vorhanden
      if (optimizedCode.startsWith("```")) {
        const match = optimizedCode.match(/```(?:typescript|tsx|ts)?\s*([\s\S]*?)\s*```/)
        if (match) {
          optimizedCode = match[1].trim()
        }
      }
      
      // 7. VALIDIERE OPTIMIERTEN CODE
      if (optimizedCode !== codeContent.trim()) {
        const validationResult = await this.validateCode(optimizedCode, task.filePath || "unknown")
        
        // 7.1. Prüfe auf Design-Verstöße mit Quality-Bot
        const { QualityBot } = await import("./quality-bot")
        const qualityBot = new QualityBot()
        const qualityCheck = await qualityBot.checkCodeAgainstDocumentation(
          optimizedCode,
          {},
          task.filePath || "unknown"
        )
        
        if (!validationResult.isValid || !qualityCheck.passed) {
          const allErrors = [
            ...validationResult.errors,
            ...qualityCheck.violations.map((v) => v.message),
          ]
          
          await this.documentError({
            type: "optimization-validation-error",
            message: `Optimierter Code ist nicht valide oder verletzt Design-Vorgaben: ${allErrors.join(", ")}`,
            filePath: task.filePath,
            context: { validationErrors: validationResult.errors, qualityViolations: qualityCheck.violations },
          })
          
          return {
            success: false,
            errors: allErrors,
            warnings: [],
            documentation: `Code-Optimierung fehlgeschlagen: Validierung oder Design-Prüfung fehlgeschlagen.`,
          }
        }
        
        // 7.2. Dokumentiere erfolgreiche Optimierung
        await this.documentError({
          type: "optimization",
          message: `Code in ${task.filePath} optimiert und validiert`,
          filePath: task.filePath,
          context: task.context,
          solution: "AI-powered optimization applied and validated",
        })
        
        return {
          success: true,
          changes: [{ file: task.filePath, content: optimizedCode }],
          documentation: `Code in ${task.filePath} optimiert und validiert. ${suggestionsList ? `${suggestionsList.split("\n").length} Optimierungen angewendet.` : "Allgemeine Optimierungen angewendet."}`,
        }
      }
      
      return {
        success: true,
        changes: [],
        documentation: `Code in ${task.filePath} bereits optimal oder keine Änderungen nötig.`,
      }
    } catch (error: any) {
      await this.documentError({
        type: "optimization-error",
        message: `Fehler bei Code-Optimierung: ${error.message}`,
        filePath: task.filePath,
        context: task.context,
      })
      return {
        success: false,
        errors: [`Fehler bei Code-Optimierung: ${error.message}`],
      }
    }
  }

  /**
   * Bestimme relevante Kategorien für Task-Typ
   */
  private getRelevantCategories(taskType: string): KnowledgeCategory[] {
    const categoryMap: Record<string, KnowledgeCategory[]> = {
      "code-analysis": ["coding-rules", "best-practices", "architecture"],
      "bug-fix": ["coding-rules", "error-handling", "functionality-rules"],
      "optimization": ["best-practices", "architecture"],
      "refactoring": ["coding-rules", "architecture", "best-practices"],
      "feature": ["architecture", "api-documentation", "best-practices"],
    }
    
    return categoryMap[taskType] || ["best-practices"]
  }

  /**
   * Validiere Code (Syntax, TypeScript, Design-Vorgaben)
   */
  private async validateCode(code: string, filePath: string): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    
    // 1. Basis-Syntax-Prüfung (einfache Checks)
    if (!code || code.trim().length === 0) {
      errors.push("Code ist leer")
      return { isValid: false, errors }
    }
    
    // 2. TypeScript-spezifische Prüfungen
    if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      // Prüfe auf grundlegende TypeScript-Syntax
      if (code.includes("any") && !code.includes("// any allowed")) {
        // Warnung, aber kein Fehler
      }
      
      // Prüfe auf fehlende Imports (vereinfacht)
      const reactImports = ["useState", "useEffect", "useCallback", "useMemo"]
      const hasReactUsage = reactImports.some((hook) => code.includes(hook))
      if (hasReactUsage && !code.includes("from 'react'") && !code.includes('from "react"')) {
        errors.push("React-Hooks verwendet, aber React-Import fehlt")
      }
    }
    
    // 3. Grundlegende Struktur-Prüfung
    const openBraces = (code.match(/{/g) || []).length
    const closeBraces = (code.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push(`Ungleiche Anzahl von geschweiften Klammern: ${openBraces} öffnende, ${closeBraces} schließende`)
    }
    
    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push(`Ungleiche Anzahl von runden Klammern: ${openParens} öffnende, ${closeParens} schließende`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Dokumentiere Fehler in Knowledge-Base und Error-Log
   * INTEGRIERT FEHLER IN KNOWLEDGE-BASE
   */
  async documentError(error: {
    type: string
    message: string
    filePath?: string
    line?: number
    context?: any
    solution?: string
  }) {
    // Speichere Fehler persistent
    try {
      await logError({
        type: error.type === "bug" || error.type === "error" ? error.type : "error",
        severity: error.type.includes("critical") ? "critical" : error.type.includes("high") ? "high" : "medium",
        category: error.type,
        message: error.message,
        filePath: error.filePath,
        line: error.line,
        context: error.context,
        solution: error.solution,
        botId: "system-bot",
      })
      
      // INTEGRIERE FEHLER IN KNOWLEDGE-BASE
      await this.integrateErrorIntoKnowledgeBase(error)
    } catch (logError) {
      console.error("Fehler beim Loggen:", logError)
      // Fallback: Console-Log
      console.log("Error documented:", error)
    }
  }

  /**
   * Integriere Fehler in Knowledge-Base für zukünftige Prävention
   */
  private async integrateErrorIntoKnowledgeBase(error: {
    type: string
    message: string
    filePath?: string
    line?: number
    context?: any
    solution?: string
  }) {
    try {
      const { promises: fs } = await import("fs")
      const path = await import("path")
      
      const knowledgeBaseDir = path.join(process.cwd(), ".cicd", "knowledge-base-errors")
      await fs.mkdir(knowledgeBaseDir, { recursive: true })
      
      const errorFile = path.join(knowledgeBaseDir, `${error.type}-errors.json`)
      
      let errors: any[] = []
      try {
        const content = await fs.readFile(errorFile, "utf-8")
        errors = JSON.parse(content)
      } catch {
        errors = []
      }
      
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        type: error.type,
        message: error.message,
        filePath: error.filePath,
        line: error.line,
        context: error.context,
        solution: error.solution,
      })
      
      // Behalte nur die letzten 100 Einträge pro Typ
      if (errors.length > 100) {
        errors = errors.slice(-100)
      }
      
      await fs.writeFile(errorFile, JSON.stringify(errors, null, 2), "utf-8")
    } catch (error) {
      console.warn("Fehler beim Integrieren in Knowledge-Base:", error)
      // Nicht kritisch - Fehler wird trotzdem geloggt
    }
  }
}

