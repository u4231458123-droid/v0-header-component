/**
 * Bot-Integration für CI/CD
 * =========================
 * Integriert alle Bots in die CI/CD-Pipeline
 */

// Dynamische Imports für TypeScript-Module
let SystemBot, QualityBot, PromptOptimizationBot, loadFullKnowledgeBase

try {
  const systemBotModule = require("../../lib/ai/bots/system-bot")
  SystemBot = systemBotModule.SystemBot || systemBotModule.default?.SystemBot
  
  const qualityBotModule = require("../../lib/ai/bots/quality-bot")
  QualityBot = qualityBotModule.QualityBot || qualityBotModule.default?.QualityBot
  
  const promptBotModule = require("../../lib/ai/bots/prompt-optimization-bot")
  PromptOptimizationBot = promptBotModule.PromptOptimizationBot || promptBotModule.default?.PromptOptimizationBot
  
  const knowledgeModule = require("../../lib/knowledge-base/load-with-cicd")
  loadFullKnowledgeBase = knowledgeModule.loadFullKnowledgeBase || knowledgeModule.default?.loadFullKnowledgeBase
} catch (error) {
  console.error("Fehler beim Laden der Module:", error)
  throw error
}

/**
 * Initialisiere alle Bots mit Knowledge-Base
 */
async function initializeBots() {
  console.log("Initialisiere AI-Bots mit Knowledge-Base...")

  // Lade vollständige Knowledge-Base
  const knowledgeBase = loadFullKnowledgeBase()
  console.log(`Knowledge-Base geladen: ${knowledgeBase.entries.length} Einträge`)

  // Initialisiere Bots
  const systemBot = new SystemBot()
  const qualityBot = new QualityBot()
  const promptOptimizationBot = new PromptOptimizationBot()

  console.log("✅ System-Bot initialisiert")
  console.log("✅ Quality-Bot initialisiert")
  console.log("✅ Prompt-Optimization-Bot initialisiert")

  return {
    systemBot,
    qualityBot,
    promptOptimizationBot,
    knowledgeBase,
  }
}

/**
 * Führe vollständige Bot-Analyse durch
 */
async function runFullBotAnalysis(rootDir = process.cwd()) {
  const bots = await initializeBots()
  const results = {
    systemBot: [],
    qualityBot: [],
    promptOptimization: null,
  }

  // System-Bot: Code-Analyse für wichtige Dateien
  console.log("\n📊 System-Bot: Code-Analyse...")
  const importantFiles = [
    "app/dashboard/page.tsx",
    "lib/subscription.ts",
    "components/layout/AppSidebar.tsx",
  ]

  for (const file of importantFiles) {
    try {
      const result = await bots.systemBot.analyzeCode({
        id: `analysis-${file}`,
        type: "code-analysis",
        description: `Code-Analyse für ${file}`,
        filePath: file,
      })
      results.systemBot.push({
        file,
        success: result.success,
        errors: result.errors || [],
        warnings: result.warnings || [],
      })
    } catch (error) {
      console.warn(`Fehler bei System-Bot Analyse für ${file}:`, error.message)
    }
  }

  // Quality-Bot: Prüfung gegen Dokumentation
  console.log("\n🔍 Quality-Bot: Code-Prüfung...")
  try {
    const qualityResult = await bots.qualityBot.verifyAgainstCompletionDocs(
      "// Sample code",
      {},
      "sample.tsx"
    )
    results.qualityBot.push(qualityResult)
  } catch (error) {
    console.warn("Fehler bei Quality-Bot Prüfung:", error.message)
  }

  // Prompt-Optimization-Bot: Optimiere Prompts
  console.log("\n⚡ Prompt-Optimization-Bot: Prompt-Optimierung...")
  try {
    const optimization = await bots.promptOptimizationBot.optimizePrompt(
      "system-bot",
      "code-analysis",
      "Analysiere Code"
    )
    results.promptOptimization = optimization
  } catch (error) {
    console.warn("Fehler bei Prompt-Optimierung:", error.message)
  }

  return results
}

// CLI-Interface
if (require.main === module) {
  runFullBotAnalysis()
    .then((results) => {
      console.log("\n✅ Bot-Analyse abgeschlossen")
      console.log(JSON.stringify(results, null, 2))
      process.exit(0)
    })
    .catch((error) => {
      console.error("Fehler:", error)
      process.exit(1)
    })
}

module.exports = {
  initializeBots,
  runFullBotAnalysis,
}

