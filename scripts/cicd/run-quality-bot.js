/**
 * Quality-Bot Runner für CI/CD
 * =============================
 * Führt Quality-Bot für Code-Prüfung gegen Dokumentation aus
 */

// Dynamischer Import für TypeScript-Module
let QualityBot
try {
  QualityBot = require("../../lib/ai/bots/quality-bot").QualityBot
} catch (error) {
  // Fallback für CommonJS
  const module = require("../../lib/ai/bots/quality-bot")
  QualityBot = module.QualityBot || module.default?.QualityBot
}
const fs = require("fs")
const path = require("path")

/**
 * Führe Quality-Bot aus
 */
async function runQualityBot(filePath, completionDocs = null) {
  const bot = new QualityBot()

  try {
    // Lade Code-Inhalt
    let codeContent = ""
    if (filePath && fs.existsSync(filePath)) {
      codeContent = fs.readFileSync(filePath, "utf-8")
    } else {
      return {
        success: false,
        errors: [`Datei nicht gefunden: ${filePath}`],
      }
    }

    // Prüfe Code gegen Dokumentation
    const result = await bot.verifyAgainstCompletionDocs(codeContent, completionDocs || {}, filePath)

    return {
      success: result.success,
      violations: result.errors || [],
      warnings: result.warnings || [],
    }
  } catch (error) {
    console.error(`Quality-Bot Fehler:`, error)
    return {
      success: false,
      errors: [error.message],
    }
  }
}

/**
 * Prüfe alle Dateien in einem Verzeichnis
 */
async function runQualityBotOnDirectory(rootDir = process.cwd()) {
  const bot = new QualityBot()
  const results = []

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

  const files = findFiles(rootDir, /\.(ts|tsx|js|jsx)$/, ["node_modules", ".next", "scripts"])

  for (const file of files.slice(0, 20)) {
    // Prüfe erste 20 Dateien (Limit für Performance)
    try {
      const codeContent = fs.readFileSync(file, "utf-8")
      const check = await bot.checkCodeAgainstDocumentation(codeContent, {}, file)
      
      if (!check.passed) {
        results.push({
          file,
          violations: check.violations,
        })
      }
    } catch (error) {
      console.error(`Fehler bei ${file}:`, error.message)
    }
  }

  return {
    success: results.length === 0,
    results,
    filesChecked: files.length,
  }
}

// CLI-Interface
if (require.main === module) {
  const filePath = process.argv[2] || null

  if (filePath) {
    runQualityBot(filePath)
      .then((result) => {
        console.log(JSON.stringify(result, null, 2))
        process.exit(result.success ? 0 : 1)
      })
      .catch((error) => {
        console.error("Fehler:", error)
        process.exit(1)
      })
  } else {
    runQualityBotOnDirectory()
      .then((result) => {
        console.log(JSON.stringify(result, null, 2))
        process.exit(result.success ? 0 : 1)
      })
      .catch((error) => {
        console.error("Fehler:", error)
        process.exit(1)
      })
  }
}

module.exports = {
  runQualityBot,
  runQualityBotOnDirectory,
}

