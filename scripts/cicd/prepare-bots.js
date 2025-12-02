/**
 * Bot-Vorbereitung für CI/CD
 * ==========================
 * Stellt sicher, dass alle Bots und Knowledge-Base bereit sind
 */

const { ensureKnowledgeLoaded } = require("./ensure-knowledge-loaded")

/**
 * Bereite alle Bots vor
 */
async function prepareBots() {
  console.log("🤖 Bereite AI-Bots vor...")

  // 1. Lade Knowledge-Base
  console.log("📚 Lade Knowledge-Base...")
  const knowledgeResult = ensureKnowledgeLoaded()
  
  if (!knowledgeResult.success) {
    console.error("❌ Knowledge-Base konnte nicht geladen werden")
    return {
      success: false,
      error: "Knowledge-Base Fehler",
    }
  }

  console.log(`✅ Knowledge-Base geladen: ${knowledgeResult.entries} Einträge`)

  // 2. Prüfe ob Hugging Face API-Key vorhanden
  const hasApiKey = !!process.env.HUGGINGFACE_API_KEY
  if (!hasApiKey) {
    console.warn("⚠️  HUGGINGFACE_API_KEY nicht gesetzt. AI-Features werden eingeschränkt funktionieren.")
  } else {
    console.log("✅ Hugging Face API-Key vorhanden")
  }

  // 3. Prüfe ob alle Bot-Module verfügbar sind
  const botModules = [
    { name: "System-Bot", path: "../../lib/ai/bots/system-bot" },
    { name: "Quality-Bot", path: "../../lib/ai/bots/quality-bot" },
    { name: "Prompt-Optimization-Bot", path: "../../lib/ai/bots/prompt-optimization-bot" },
  ]

  const availableBots = []
  for (const bot of botModules) {
    try {
      require(bot.path)
      availableBots.push(bot.name)
      console.log(`✅ ${bot.name} verfügbar`)
    } catch (error) {
      console.warn(`⚠️  ${bot.name} nicht verfügbar:`, error.message)
    }
  }

  return {
    success: true,
    knowledgeBase: knowledgeResult,
    hasApiKey,
    availableBots,
    message: "Bots vorbereitet",
  }
}

// CLI-Interface
if (require.main === module) {
  prepareBots()
    .then((result) => {
      console.log("\n📊 Bot-Vorbereitung abgeschlossen:")
      console.log(JSON.stringify(result, null, 2))
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fehler:", error)
      process.exit(1)
    })
}

module.exports = {
  prepareBots,
}

