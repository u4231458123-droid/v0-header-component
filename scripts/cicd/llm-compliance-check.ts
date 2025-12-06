/**
 * LLM Compliance Checker
 * ======================
 * Prüft Code-Änderungen gegen project_specs.md mittels LLM.
 * Wird vom Enforcer GitHub Action aufgerufen.
 */

import { promises as fs } from "fs"
import path from "path"

interface ComplianceResult {
  compliant: boolean
  violations: Violation[]
  summary: string
  executionTime: number
}

interface Violation {
  rule: string
  file: string
  line?: number
  message: string
  severity: "error" | "warning" | "info"
  suggestion?: string
}

interface ProjectSpecs {
  rules: string[]
  forbiddenTerms: string[]
  requiredPatterns: Record<string, string>
}

/**
 * Lade project_specs.md und parse Regeln
 */
async function loadProjectSpecs(): Promise<ProjectSpecs> {
  try {
    const specsPath = path.join(process.cwd(), "project_specs.md")
    const content = await fs.readFile(specsPath, "utf-8")
    
    // Extrahiere Regeln aus Markdown
    const rules: string[] = []
    const forbiddenTerms: string[] = []
    const requiredPatterns: Record<string, string> = {}
    
    // Suche nach Regel-Abschnitten
    const ruleMatches = content.match(/^[-*]\s+(.+)$/gm)
    if (ruleMatches) {
      for (const match of ruleMatches) {
        const rule = match.replace(/^[-*]\s+/, "").trim()
        if (rule.length > 10) {
          rules.push(rule)
        }
      }
    }
    
    // Suche nach verbotenen Begriffen
    const forbiddenMatch = content.match(/verboten[^:]*:([^#]+)/i)
    if (forbiddenMatch) {
      const terms = forbiddenMatch[1].match(/`([^`]+)`/g)
      if (terms) {
        forbiddenTerms.push(...terms.map(t => t.replace(/`/g, "")))
      }
    }
    
    // Standard verbotene Begriffe
    forbiddenTerms.push(
      "kostenlos",
      "gratis",
      "umsonst",
      "free trial",
      "testen Sie",
      "probieren Sie"
    )
    
    return { rules, forbiddenTerms, requiredPatterns }
  } catch {
    console.warn("⚠️ project_specs.md nicht gefunden")
    return {
      rules: [],
      forbiddenTerms: ["kostenlos", "gratis", "umsonst"],
      requiredPatterns: {},
    }
  }
}

/**
 * Prüfe einzelne Datei auf Compliance
 */
async function checkFileCompliance(
  filePath: string,
  content: string,
  specs: ProjectSpecs
): Promise<Violation[]> {
  const violations: Violation[] = []
  const lines = content.split("\n")
  
  // 1. Prüfe verbotene Begriffe
  for (const term of specs.forbiddenTerms) {
    const regex = new RegExp(term, "gi")
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        violations.push({
          rule: "forbidden-term",
          file: filePath,
          line: i + 1,
          message: `Verbotener Begriff gefunden: "${term}"`,
          severity: "error",
          suggestion: `Entferne oder ersetze "${term}" durch einen erlaubten Begriff`,
        })
      }
    }
  }
  
  // 2. Prüfe UI-Sprache (deutsche Strings in JSX)
  if (filePath.endsWith(".tsx")) {
    // Prüfe ob englische UI-Texte vorhanden sind
    const englishPatterns = [
      />\s*Click here\s*</i,
      />\s*Submit\s*</i,
      />\s*Cancel\s*</i,
      />\s*Delete\s*</i,
      />\s*Loading\.\.\.\s*</i,
    ]
    
    for (const pattern of englishPatterns) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          violations.push({
            rule: "ui-language",
            file: filePath,
            line: i + 1,
            message: "Englischer UI-Text gefunden (UI soll deutsch sein)",
            severity: "warning",
            suggestion: "Übersetze den Text ins Deutsche",
          })
        }
      }
    }
  }
  
  // 3. Prüfe Code-Kommentare (sollten englisch sein)
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    const germanCommentPatterns = [
      /\/\/\s*(und|oder|wenn|dann|falls|sonst|diese|dieser|dieses)/i,
      /\/\*\*?\s*(und|oder|wenn|dann|falls|sonst|diese|dieser|dieses)/i,
    ]
    
    for (const pattern of germanCommentPatterns) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          violations.push({
            rule: "code-language",
            file: filePath,
            line: i + 1,
            message: "Deutscher Kommentar gefunden (Code-Kommentare sollen englisch sein)",
            severity: "info",
            suggestion: "Übersetze den Kommentar ins Englische",
          })
        }
      }
    }
  }
  
  // 4. Prüfe auf console.log in Produktion
  if (!filePath.includes(".test.") && !filePath.includes(".spec.")) {
    for (let i = 0; i < lines.length; i++) {
      if (/console\.(log|debug|info)\(/.test(lines[i]) && !/\/\/.*console/.test(lines[i])) {
        violations.push({
          rule: "no-console",
          file: filePath,
          line: i + 1,
          message: "console.log gefunden (sollte in Produktion entfernt werden)",
          severity: "warning",
          suggestion: "Entferne console.log oder ersetze durch strukturiertes Logging",
        })
      }
    }
  }
  
  // 5. Prüfe auf 'any' Type ohne Kommentar
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    for (let i = 0; i < lines.length; i++) {
      if (/:\s*any\b/.test(lines[i]) && !/\/\/.*any/.test(lines[i]) && !/\/\*.*any/.test(lines[i])) {
        violations.push({
          rule: "no-any",
          file: filePath,
          line: i + 1,
          message: "'any' Type ohne Kommentar gefunden",
          severity: "warning",
          suggestion: "Ersetze 'any' durch spezifischen Typ oder füge Begründung hinzu",
        })
      }
    }
  }
  
  return violations
}

/**
 * Haupt-Funktion: Prüfe alle geänderten Dateien
 */
export async function runComplianceCheck(changedFiles?: string[]): Promise<ComplianceResult> {
  const startTime = Date.now()
  const violations: Violation[] = []
  
  try {
    // Lade Projekt-Spezifikationen
    const specs = await loadProjectSpecs()
    
    // Wenn keine Dateien angegeben, prüfe Git-Diff
    let filesToCheck = changedFiles
    if (!filesToCheck || filesToCheck.length === 0) {
      const { execSync } = await import("child_process")
      try {
        const diff = execSync("git diff --name-only HEAD~1", { encoding: "utf-8" })
        filesToCheck = diff.split("\n").filter(f => f && (f.endsWith(".ts") || f.endsWith(".tsx")))
      } catch {
        console.warn("⚠️ Konnte Git-Diff nicht lesen")
        filesToCheck = []
      }
    }
    
    console.log(`🔍 Prüfe ${filesToCheck.length} Dateien auf Compliance...`)
    
    // Prüfe jede Datei
    for (const file of filesToCheck) {
      try {
        const content = await fs.readFile(file, "utf-8")
        const fileViolations = await checkFileCompliance(file, content, specs)
        violations.push(...fileViolations)
      } catch {
        console.warn(`⚠️ Konnte Datei nicht lesen: ${file}`)
      }
    }
    
    // Sortiere nach Severity
    const severityOrder = { error: 0, warning: 1, info: 2 }
    violations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    
    const errorCount = violations.filter(v => v.severity === "error").length
    const warningCount = violations.filter(v => v.severity === "warning").length
    
    return {
      compliant: errorCount === 0,
      violations,
      summary: `${violations.length} Probleme gefunden (${errorCount} Fehler, ${warningCount} Warnungen)`,
      executionTime: Date.now() - startTime,
    }
    
  } catch (error: any) {
    return {
      compliant: false,
      violations: [{
        rule: "system-error",
        file: "compliance-check",
        message: `Systemfehler: ${error.message}`,
        severity: "error",
      }],
      summary: `Fehler bei Compliance-Check: ${error.message}`,
      executionTime: Date.now() - startTime,
    }
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  console.log("🔒 LLM Compliance Checker")
  console.log("========================\n")
  
  const result = await runComplianceCheck()
  
  console.log(`\n📊 Ergebnis: ${result.summary}`)
  console.log(`⏱️  Dauer: ${result.executionTime}ms\n`)
  
  if (result.violations.length > 0) {
    console.log("📋 Gefundene Probleme:\n")
    
    for (const violation of result.violations) {
      const icon = { error: "❌", warning: "⚠️", info: "ℹ️" }[violation.severity]
      console.log(`${icon} [${violation.rule}] ${violation.file}${violation.line ? `:${violation.line}` : ""}`)
      console.log(`   ${violation.message}`)
      if (violation.suggestion) {
        console.log(`   💡 ${violation.suggestion}`)
      }
      console.log("")
    }
  }
  
  // Exit Code basierend auf Compliance
  process.exit(result.compliant ? 0 : 1)
}

// Wenn direkt ausgeführt
const isMainModule = require.main === module ||
  process.argv[1]?.includes("llm-compliance-check")

if (isMainModule) {
  main().catch(error => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}

export { loadProjectSpecs, checkFileCompliance }

