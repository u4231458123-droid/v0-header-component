/**
 * AI-powered Bug Analysis
 * ========================
 * Analysiert Code auf Bugs mit Hugging Face KI-Modellen und System-Bot
 */

const fs = require("fs")
const path = require("path")
const { loadKnowledgeForCategories } = require("./cicd/load-knowledge-base")
// Dynamischer Import für System-Bot
let runSystemBot
try {
  const systemBotModule = require("./cicd/run-system-bot")
  runSystemBot = systemBotModule.runSystemBot
} catch (error) {
  // Fallback: Versuche CommonJS-Version
  try {
    const systemBotModule = require("./cicd/run-system-bot-commonjs")
    runSystemBot = systemBotModule.runSystemBot
  } catch (err) {
    console.warn("System-Bot konnte nicht geladen werden, verwende vereinfachte Analyse")
    runSystemBot = async () => ({ success: false, errors: ["System-Bot nicht verfügbar"] })
  }
}

/**
 * Analysiere Code auf Bugs
 */
async function analyzeBugs(filePath, codeContent) {
  // Lade Knowledge-Base
  const knowledge = loadKnowledgeForCategories(["error-handling", "coding-rules"])

  // Verwende System-Bot für Bug-Analyse
  try {
    const result = await runSystemBot("bug-fix", filePath, `Bug-Analyse für ${filePath}`)
    
    if (result.success && result.analysis) {
      try {
        const analysisData = JSON.parse(result.analysis)
        return {
          bugs: analysisData.bugs || [],
          fixedCode: analysisData.fixedCode || codeContent,
          errors: result.errors || [],
          warnings: result.warnings || [],
        }
      } catch {
        // Falls kein JSON, gebe Text zurück
        return {
          bugs: [],
          fixedCode: codeContent,
          analysis: result.analysis,
          errors: result.errors || [],
          warnings: result.warnings || [],
        }
      }
    }

    return {
      bugs: [],
      fixedCode: codeContent,
      errors: result.errors || [],
      warnings: result.warnings || [],
    }
  } catch (error) {
    console.error(`Fehler bei Bug-Analyse:`, error)
    return {
      bugs: [],
      fixedCode: codeContent,
      errors: [error.message],
    }
  }
}

/**
 * Generiere Bug-Analyse Prompt
 */
function generateBugAnalysisPrompt(filePath, codeContent, knowledge) {
  let prompt = `# Bug-Analyse\n\n`
  prompt += `Datei: ${filePath}\n\n`
  prompt += `## Knowledge-Base Regeln:\n`
  knowledge.forEach((rule) => {
    prompt += `- ${rule.title}: ${rule.content.substring(0, 200)}\n`
  })
  prompt += `\n## Code:\n\`\`\`typescript\n${codeContent}\n\`\`\`\n`
  prompt += `\n## Aufgabe:\nAnalysiere Code auf Bugs (Race Conditions, Closures, Types, Hooks, Performance, Security, Accessibility, Design-Vorgaben).\n`
  return prompt
}

/**
 * Analysiere alle Dateien auf Bugs
 */
async function analyzeAllFilesForBugs(rootDir = process.cwd()) {
  const files = findFiles(rootDir, /\.(ts|tsx)$/, ["node_modules", ".next", "scripts"])
  const results = []

  for (const file of files.slice(0, 10)) {
    // Analysiere erste 10 Dateien (Limit für Demo)
    try {
      const content = fs.readFileSync(file, "utf-8")
      const analysis = await analyzeBugs(file, content)
      results.push({
        file,
        ...analysis,
      })
    } catch (error) {
      console.error(`Fehler bei ${file}:`, error.message)
    }
  }

  return results
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
  analyzeAllFilesForBugs()
    .then((results) => {
      console.log(JSON.stringify(results, null, 2))
      process.exit(0)
    })
    .catch((error) => {
      console.error("Fehler:", error)
      process.exit(1)
    })
}

module.exports = {
  analyzeBugs,
  analyzeAllFilesForBugs,
}

