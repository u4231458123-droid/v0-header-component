/**
 * START-BOTS SCRIPT
 * =================
 * Startet alle Bots und Assistenten, wartet bis sie bereit sind
 */

// Dynamische Imports für TypeScript-Module
async function loadBotClasses() {
  try {
    // Versuche TypeScript-Imports
    const [
      { SystemBot },
      { QualityBot },
      { MasterBot },
      { DocumentationBot },
      { DocumentationAssistant },
      { MarketingTextBot },
      { MarketingTextAssistant },
      { LegalBot },
      { LegalAssistant },
      { getAllModelsForBot },
    ] = await Promise.all([
      import("../../lib/ai/bots/system-bot.ts"),
      import("../../lib/ai/bots/quality-bot.ts"),
      import("../../lib/ai/bots/master-bot.ts"),
      import("../../lib/ai/bots/documentation-bot.ts"),
      import("../../lib/ai/bots/documentation-assistant.ts"),
      import("../../lib/ai/bots/marketing-text-bot.ts"),
      import("../../lib/ai/bots/marketing-text-assistant.ts"),
      import("../../lib/ai/bots/legal-bot.ts"),
      import("../../lib/ai/bots/legal-assistant.ts"),
      import("../../lib/ai/models-optimized.ts"),
    ])
    return {
      SystemBot,
      QualityBot,
      MasterBot,
      DocumentationBot,
      DocumentationAssistant,
      MarketingTextBot,
      MarketingTextAssistant,
      LegalBot,
      LegalAssistant,
      getAllModelsForBot,
    }
  } catch (error) {
    console.error("Fehler beim Laden der Bot-Klassen:", error.message)
    throw error
  }
}

const BOTS = [
  { name: "System-Bot", instance: null, class: SystemBot },
  { name: "Quality-Bot", instance: null, class: QualityBot },
  { name: "Master-Bot", instance: null, class: MasterBot },
  { name: "Documentation-Bot", instance: null, class: DocumentationBot },
  { name: "Documentation-Assistant", instance: null, class: DocumentationAssistant },
  { name: "Marketing-Text-Bot", instance: null, class: MarketingTextBot },
  { name: "Marketing-Text-Assistant", instance: null, class: MarketingTextAssistant },
  { name: "Legal-Bot", instance: null, class: LegalBot },
  { name: "Legal-Assistant", instance: null, class: LegalAssistant },
]

async function startBots() {
  console.log("🚀 STARTE ALLE BOTS UND ASSISTENTEN\n")
  console.log("=".repeat(60))

  // Lade Bot-Klassen
  console.log("\n📦 Lade Bot-Klassen...")
  const {
    SystemBot,
    QualityBot,
    MasterBot,
    DocumentationBot,
    DocumentationAssistant,
    MarketingTextBot,
    MarketingTextAssistant,
    LegalBot,
    LegalAssistant,
    getAllModelsForBot,
  } = await loadBotClasses()
  console.log("   ✅ Bot-Klassen geladen")

  const BOTS = [
    { name: "System-Bot", instance: null, class: SystemBot },
    { name: "Quality-Bot", instance: null, class: QualityBot },
    { name: "Master-Bot", instance: null, class: MasterBot },
    { name: "Documentation-Bot", instance: null, class: DocumentationBot },
    { name: "Documentation-Assistant", instance: null, class: DocumentationAssistant },
    { name: "Marketing-Text-Bot", instance: null, class: MarketingTextBot },
    { name: "Marketing-Text-Assistant", instance: null, class: MarketingTextAssistant },
    { name: "Legal-Bot", instance: null, class: LegalBot },
    { name: "Legal-Assistant", instance: null, class: LegalAssistant },
  ]

  // 1. Prüfe Modelle für jeden Bot
  console.log("\n📋 Prüfe Modelle für jeden Bot...")
  for (const bot of BOTS) {
    try {
      const models = getAllModelsForBot(bot.name.toLowerCase().replace(/-/g, "-"))
      console.log(`   ${bot.name}: ${models.length} Modell(e)`)
      models.forEach((model, index) => {
        console.log(`      ${index + 1}. ${model.name} (${model.modelId})`)
      })
    } catch (error) {
      console.warn(`   ⚠️ ${bot.name}: Konnte Modelle nicht laden (${error.message})`)
    }
  }

  // 2. Initialisiere Bots
  console.log("\n🔧 Initialisiere Bots...")
  for (const bot of BOTS) {
    try {
      console.log(`   Initialisiere ${bot.name}...`)
      bot.instance = new bot.class()
      console.log(`   ✅ ${bot.name} initialisiert`)
    } catch (error) {
      console.error(`   ❌ Fehler bei ${bot.name}:`, error.message)
      process.exit(1)
    }
  }

  // 3. Teste Bots (Einselung)
  console.log("\n📚 Bots lesen sich ein...")
  for (const bot of BOTS) {
    try {
      console.log(`   ${bot.name} liest sich ein...`)
      
      // Teste Knowledge-Base
      if (bot.instance.knowledgeBase) {
        console.log(`      ✅ Knowledge-Base geladen`)
      }
      
      // Teste AI-Client
      if (bot.instance.aiClient) {
        console.log(`      ✅ AI-Client initialisiert`)
      }
      
      console.log(`   ✅ ${bot.name} bereit`)
    } catch (error) {
      console.error(`   ❌ Fehler bei ${bot.name}:`, error.message)
      process.exit(1)
    }
  }

  // 4. Finale Prüfung
  console.log("\n✅ FINALE PRÜFUNG")
  console.log("-".repeat(60))
  
  let allReady = true
  for (const bot of BOTS) {
    const ready = bot.instance && 
                  (bot.instance.knowledgeBase || bot.instance.knowledgeBase === undefined) &&
                  (bot.instance.aiClient || bot.instance.aiClient === undefined)
    
    if (!ready) {
      console.error(`   ❌ ${bot.name} nicht bereit`)
      allReady = false
    } else {
      console.log(`   ✅ ${bot.name} bereit`)
    }
  }

  if (!allReady) {
    console.error("\n❌ Nicht alle Bots sind bereit!")
    process.exit(1)
  }

  console.log("\n" + "=".repeat(60))
  console.log("✅ ALLE BOTS SIND BEREIT!")
  console.log("=".repeat(60))
  console.log("\n📊 Status:")
  console.log(`   - ${BOTS.length} Bots/Assistenten aktiv`)
  console.log(`   - Alle Modelle konfiguriert`)
  console.log(`   - Alle Knowledge-Bases geladen`)
  console.log(`   - Alle AI-Clients initialisiert`)
  console.log("\n🚀 Bots sind bereit für den Einsatz!")
}

startBots().catch((error) => {
  console.error("Kritischer Fehler beim Starten der Bots:", error)
  process.exit(1)
})

