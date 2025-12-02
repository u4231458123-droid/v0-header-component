/**
 * System-Bot Runner für CI/CD
 * ============================
 * Führt System-Bot für Code-Analyse, Bug-Fix und Optimierung aus
 */

// Dynamischer Import für TypeScript-Module
let SystemBot
try {
  SystemBot = require("../../lib/ai/bots/system-bot").SystemBot
} catch (error) {
  // Fallback für CommonJS
  const module = require("../../lib/ai/bots/system-bot")
  SystemBot = module.SystemBot || module.default?.SystemBot
}

/**
 * Führe System-Bot aus
 */
async function runSystemBot(taskType, filePath, description) {
  const bot = new SystemBot()
  
  const task = {
    id: `task-${Date.now()}`,
    type: taskType,
    description: description || `Code-Analyse für ${filePath}`,
    filePath: filePath,
    context: {},
  }

  try {
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
}

