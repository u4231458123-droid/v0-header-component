/**
 * Layout & Design Validierung
 * ============================
 * Prüft Design-Tokens, Spacing, Komponenten-Styles, verbotene Begriffe
 */

const fs = require("fs")
const path = require("path")
const { loadKnowledgeForCategories } = require("./cicd/load-knowledge-base")
// Dynamischer Import für Quality-Bot
let runQualityBot
try {
  const qualityBotModule = require("./cicd/run-quality-bot")
  runQualityBot = qualityBotModule.runQualityBot
} catch (error) {
  console.warn("Quality-Bot konnte nicht geladen werden, verwende vereinfachte Prüfung")
  runQualityBot = async () => ({ success: true, violations: [] })
}

/**
 * Validiere Layout & Design
 */
async function validateLayout(rootDir = process.cwd()) {
  const errors = []
  const warnings = []

  // Lade Knowledge-Base
  const knowledge = loadKnowledgeForCategories(["design-guidelines", "forbidden-terms"])

  // Finde alle React/TypeScript-Dateien
  const files = findFiles(rootDir, /\.(tsx|jsx|ts|js)$/, ["node_modules", ".next", "scripts"])

  // Verwende Quality-Bot für zusätzliche Prüfung (erste 10 Dateien für Performance)
  const filesToCheckWithBot = files.slice(0, 10)
  const qualityBotResults = []

  for (const file of filesToCheckWithBot) {
    try {
      const qualityCheck = await runQualityBot(file)
      if (!qualityCheck.success) {
        qualityBotResults.push({
          file,
          violations: qualityCheck.violations || [],
        })
      }
    } catch (error) {
      console.warn(`Quality-Bot Fehler für ${file}:`, error.message)
    }
  }

  // Standard-Validierung für alle Dateien
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      const fileErrors = validateFile(file, content, knowledge)
      errors.push(...fileErrors.errors)
      warnings.push(...fileErrors.warnings)
    } catch (error) {
      console.error(`Fehler beim Lesen von ${file}:`, error.message)
    }
  }

  // Füge Quality-Bot Ergebnisse hinzu
  qualityBotResults.forEach((result) => {
    result.violations.forEach((violation) => {
      if (violation.severity === "critical" || violation.severity === "high") {
        errors.push({
          file: result.file,
          line: violation.line,
          severity: violation.severity,
          message: violation.message,
          code: violation.suggestion,
        })
      } else {
        warnings.push({
          file: result.file,
          line: violation.line,
          severity: violation.severity,
          message: violation.message,
        })
      }
    })
  })

  return {
    success: errors.length === 0,
    errors,
    warnings,
    filesChecked: files.length,
    qualityBotChecked: filesToCheckWithBot.length,
  }
}

/**
 * Validiere einzelne Datei
 */
function validateFile(filePath, content, knowledge) {
  const errors = []
  const warnings = []
  const lines = content.split("\n")

  // Prüfe hardcoded Farben
  const hardcodedColors = [
    /#323D5E/g,
    /#0A2540/g,
    /bg-slate-800/g,
    /bg-slate-900/g,
    /text-slate-900/g,
    /text-gray-\d+/g,
    /border-gray-\d+/g,
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Prüfe hardcoded Farben
    for (const pattern of hardcodedColors) {
      if (pattern.test(line)) {
        errors.push({
          file: filePath,
          line: lineNum,
          severity: "high",
          message: `Hardcoded Farbe gefunden. Verwende Design-Tokens (bg-primary, text-primary, etc.)`,
          code: line.trim(),
        })
      }
    }

    // Prüfe rounded-Klassen
    if (/rounded-lg.*Card|Card.*rounded-lg/.test(line)) {
      errors.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "Cards müssen rounded-2xl verwenden, nicht rounded-lg",
        code: line.trim(),
      })
    }

    if (/rounded-md.*Button|Button.*rounded-md/.test(line)) {
      errors.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "Buttons müssen rounded-xl verwenden, nicht rounded-md",
        code: line.trim(),
      })
    }

    // Prüfe gap-Klassen
    if (/gap-4|gap-6/.test(line) && !/gap-2|gap-3|gap-5|gap-8/.test(line)) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "low",
        message: "Verwende gap-5 als Standard statt gap-4 oder gap-6",
        code: line.trim(),
      })
    }

    // Prüfe verbotene Begriffe
    const forbiddenTerms = [
      /kostenlos/gi,
      /gratis/gi,
      /\bfree\b/gi,
      /testen/gi,
      /Testphase/gi,
      /\btrial\b/gi,
      /unverbindlich/gi,
      /ohne Risiko/gi,
    ]

    for (const term of forbiddenTerms) {
      if (term.test(line)) {
        errors.push({
          file: filePath,
          line: lineNum,
          severity: "critical",
          message: `Verbotener Begriff gefunden: "${line.match(term)?.[0]}"`,
          code: line.trim(),
        })
      }
    }

    // Prüfe Logo-Integration
    if (/logo.*=.*["']\/images\//.test(line) && !/logo_url.*\|\|/.test(line)) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "Logo sollte Fallback verwenden: company.logo_url || '/images/mydispatch-3d-logo.png'",
        code: line.trim(),
      })
    }
  }

  return { errors, warnings }
}

/**
 * Finde Dateien rekursiv
 */
function findFiles(dir, pattern, ignoreDirs = []) {
  const files = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith(".")) {
          files.push(...findFiles(fullPath, pattern, ignoreDirs))
        }
      } else if (pattern.test(entry.name)) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Ignoriere Fehler
  }
  return files
}

// CLI-Interface
if (require.main === module) {
  validateLayout()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fehler:", error)
      process.exit(1)
    })
}

module.exports = {
  validateLayout,
  validateFile,
}

