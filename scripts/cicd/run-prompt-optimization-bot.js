/**
 * Prompt-Optimization-Bot Runner für CI/CD
 * =========================================
 * Optimiert Prompts für alle Bots basierend auf Knowledge-Base
 */

// Dynamischer Import für TypeScript-Module
let PromptOptimizationBot
try {
  PromptOptimizationBot = require("../../lib/ai/bots/prompt-optimization-bot").PromptOptimizationBot
} catch (error) {
  // Fallback für CommonJS
  const module = require("../../lib/ai/bots/prompt-optimization-bot")
  PromptOptimizationBot = module.PromptOptimizationBot || module.default?.PromptOptimizationBot
}

/**
 * Optimiere Prompts für alle Bots
 */
async function optimizePrompts() {
  const bot = new PromptOptimizationBot()

  try {
    // Lade Support-Bot Wissen
    await bot.loadSupportBotKnowledge()

    // Lade Prüfungsergebnisse
    await bot.loadTestResults()

    // Optimiere Prompts für verschiedene Task-Typen
    const taskTypes = ["code-analysis", "bug-fix", "optimization", "refactoring", "feature"]
    const optimizations = []

    for (const taskType of taskTypes) {
      const originalPrompt = `Analysiere Code für ${taskType}`
      const optimization = await bot.optimizePrompt("system-bot", taskType, originalPrompt)
      optimizations.push(optimization)
    }

    // FÜHRE KONTINUIERLICHE OPTIMIERUNG DURCH
    console.log("Führe kontinuierliche Optimierung durch...")
    const continuousResult = await bot.continuousOptimization()
    console.log("Kontinuierliche Optimierung abgeschlossen:", continuousResult)

    return {
      success: true,
      optimizations,
      continuousOptimization: continuousResult,
      message: `${optimizations.length} Prompts optimiert, kontinuierliche Optimierung durchgeführt`,
    }
  } catch (error) {
    console.error(`Prompt-Optimization-Bot Fehler:`, error)
    return {
      success: false,
      errors: [error.message],
    }
  }
}

// CLI-Interface
if (require.main === module) {
  optimizePrompts()
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
  optimizePrompts,
}

