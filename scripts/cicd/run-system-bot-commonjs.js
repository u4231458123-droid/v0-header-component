/**
 * System-Bot Runner für CI/CD (CommonJS-Version)
 * ===============================================
 * Führt System-Bot für Code-Analyse, Bug-Fix und Optimierung aus
 * CommonJS-kompatibel für Node.js Scripts
 */

const path = require("path")
const fs = require("fs")

/**
 * Lade TypeScript-Module dynamisch
 */
async function loadSystemBot() {
  try {
    // Versuche TypeScript-Import (mit ts-node oder ähnlichem)
    const botModule = await import("../../lib/ai/bots/system-bot.js")
    return botModule.SystemBot || botModule.default?.SystemBot
  } catch (error) {
    // Fallback: Verwende require mit möglicher TypeScript-Transpilierung
    try {
      const botModule = require("../../lib/ai/bots/system-bot")
      return botModule.SystemBot || botModule.default?.SystemBot
    } catch (err) {
      console.error("Fehler beim Laden des System-Bots:", err)
      throw err
    }
  }
}

/**
 * Führe System-Bot aus
 */
async function runSystemBot(taskType, filePath, description) {
  try {
    const SystemBot = await loadSystemBot()
    const bot = new SystemBot()
    
    const task = {
      id: `task-${Date.now()}`,
      type: taskType,
      description: description || `Code-Analyse für ${filePath || "unknown"}`,
      filePath: filePath,
      context: {},
    }

    let result
    switch (taskType) {
      case "code-analysis":
        result = await bot.analyzeCode(task)
        break
      case "bug-fix":
        result = await bot.fixBugs(task)
        break
      case "optimization":
        result = await bot.optimizeCode(task)
        break
      default:
        result = await bot.analyzeCode(task)
    }

    return {
      success: result.success,
      analysis: result.analysis,
      changes: result.changes || [],
      errors: result.errors || [],
      warnings: result.warnings || [],
      documentation: result.documentation,
    }
  } catch (error) {
    console.error(`System-Bot Fehler:`, error)
    return {
      success: false,
      errors: [error.message],
    }
  }
}

// CLI-Interface
if (require.main === module) {
  const taskType = process.argv[2] || "code-analysis"
  const filePath = process.argv[3] || null
  const description = process.argv[4] || null

  runSystemBot(taskType, filePath, description)
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
  runSystemBot,
  loadSystemBot,
}

