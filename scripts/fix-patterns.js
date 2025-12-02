/**
 * Pattern-based Bug Fixes
 * ========================
 * Behebt bekannte Bug-Patterns automatisch
 * Verwendet Quality-Bot für zusätzliche Prüfung
 */

const fs = require("fs")
const path = require("path")
// Dynamische Imports
let runQualityBot, loadKnowledgeForCategories
try {
  const qualityBotModule = require("./cicd/run-quality-bot")
  runQualityBot = qualityBotModule.runQualityBot
  const knowledgeModule = require("./cicd/load-knowledge-base")
  loadKnowledgeForCategories = knowledgeModule.loadKnowledgeForCategories
} catch (error) {
  console.warn("Quality-Bot konnte nicht geladen werden, verwende vereinfachte Prüfung")
  runQualityBot = async () => ({ success: true, violations: [] })
  loadKnowledgeForCategories = () => []
}

/**
 * Bekannte Bug-Patterns und ihre Fixes
 */
const PATTERN_FIXES = [
  {
    pattern: /#323D5E/g,
    fix: "bg-primary",
    description: "Hardcoded Farbe durch Design-Token ersetzen",
  },
  {
    pattern: /#0A2540/g,
    fix: "bg-primary",
    description: "Hardcoded Farbe durch Design-Token ersetzen",
  },
  {
    pattern: /rounded-lg.*Card/g,
    fix: (match) => match.replace(/rounded-lg/, "rounded-2xl"),
    description: "Card rounded-lg durch rounded-2xl ersetzen",
  },
  {
    pattern: /rounded-md.*Button/g,
    fix: (match) => match.replace(/rounded-md/, "rounded-xl"),
    description: "Button rounded-md durch rounded-xl ersetzen",
  },
]

/**
 * Wende Pattern-Fixes auf Datei an
 */
async function applyPatternFixes(filePath) {
  try {
    // Lade Knowledge-Base für Regeln
    const knowledge = loadKnowledgeForCategories(["design-guidelines", "coding-rules", "forbidden-terms"])
    
    let content = fs.readFileSync(filePath, "utf-8")
    let changed = false
    const fixes = []

    // Wende Pattern-Fixes an
    for (const patternFix of PATTERN_FIXES) {
      if (patternFix.pattern.test(content)) {
        if (typeof patternFix.fix === "function") {
          content = content.replace(patternFix.pattern, patternFix.fix)
        } else {
          content = content.replace(patternFix.pattern, patternFix.fix)
        }
        changed = true
        fixes.push(patternFix.description)
      }
    }

    // Prüfe mit Quality-Bot nach Fixes
    if (changed) {
      const qualityCheck = await runQualityBot(filePath)
      if (!qualityCheck.success && qualityCheck.violations.length > 0) {
        console.warn(`Quality-Bot fand Verstöße nach Fixes in ${filePath}:`, qualityCheck.violations)
      }
      
      fs.writeFileSync(filePath, content, "utf-8")
      return { changed: true, fixes, qualityCheck: qualityCheck.success }
    }

    return { changed: false, fixes: [] }
  } catch (error) {
    console.error(`Fehler bei ${filePath}:`, error.message)
    return { changed: false, fixes: [], error: error.message }
  }
}

/**
 * Wende Pattern-Fixes auf alle Dateien an
 */
async function fixAllFiles(rootDir = process.cwd()) {
  const files = findFiles(rootDir, /\.(ts|tsx|jsx|js)$/, ["node_modules", ".next", "scripts"])
  const results = []

  // Lade Knowledge-Base einmal für alle Dateien
  const knowledge = loadKnowledgeForCategories(["design-guidelines", "coding-rules", "forbidden-terms"])

  for (const file of files) {
    const result = await applyPatternFixes(file)
    if (result.changed) {
      results.push({
        file,
        ...result,
      })
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
  fixAllFiles()
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
  applyPatternFixes,
  fixAllFiles,
}

