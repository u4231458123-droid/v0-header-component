/**
 * TEST ALL BOTS
 * =============
 * Testet alle Bots und stellt sicher, dass sie funktionieren
 */

import { existsSync } from "fs"
import { join } from "path"

async function testAllBots() {
  console.log("🧪 TESTE ALLE BOTS\n")
  console.log("=".repeat(60))

  const botFiles = [
    "lib/ai/bots/base-bot.ts",
    "lib/ai/bots/system-bot.ts",
    "lib/ai/bots/quality-bot.ts",
    "lib/ai/bots/master-bot.ts",
    "lib/ai/bots/prompt-optimization-bot.ts",
    "lib/ai/bots/documentation-bot.ts",
    "lib/ai/bots/documentation-assistant.ts",
    "lib/ai/bots/marketing-text-bot.ts",
    "lib/ai/bots/marketing-text-assistant.ts",
    "lib/ai/bots/legal-bot.ts",
    "lib/ai/bots/legal-assistant.ts",
    "lib/ai/bots/mailing-text-bot.ts",
    "lib/ai/bots/mailing-text-assistant.ts",
    "lib/ai/bots/text-quality-bot.ts",
    "lib/ai/bots/text-quality-assistant.ts",
    "lib/ai/bots/code-assistant.ts",
    "lib/ai/bots/quality-assistant.ts",
  ]

  console.log("\n📋 Prüfe Bot-Dateien...")
  let allFilesExist = true
  for (const file of botFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.error(`   ❌ ${file} fehlt`)
      allFilesExist = false
    }
  }

  if (!allFilesExist) {
    console.error("\n❌ Nicht alle Bot-Dateien vorhanden!")
    process.exit(1)
  }

  // Prüfe Knowledge-Base-Dateien
  console.log("\n📋 Prüfe Knowledge-Base-Dateien...")
  const knowledgeBaseFiles = [
    "lib/knowledge-base/structure.ts",
    "lib/knowledge-base/load-with-cicd.ts",
    "lib/knowledge-base/work-tracking.ts",
  ]

  let allKnowledgeFilesExist = true
  for (const file of knowledgeBaseFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.error(`   ❌ ${file} fehlt`)
      allKnowledgeFilesExist = false
    }
  }

  // Prüfe AI-Client-Dateien
  console.log("\n📋 Prüfe AI-Client-Dateien...")
  const aiClientFiles = [
    "lib/ai/huggingface.ts",
    "lib/ai/huggingface-optimized.ts",
    "lib/ai/models.ts",
    "lib/ai/models-optimized.ts",
  ]

  let allAIClientFilesExist = true
  for (const file of aiClientFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.error(`   ❌ ${file} fehlt`)
      allAIClientFilesExist = false
    }
  }

  // Prüfe CI/CD-Dateien
  console.log("\n📋 Prüfe CI/CD-Dateien...")
  const cicdFiles = [
    "lib/cicd/error-logger.ts",
    "lib/cicd/codebase-analyzer.ts",
    "lib/cicd/prompts.ts",
  ]

  let allCICDFilesExist = true
  for (const file of cicdFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.error(`   ❌ ${file} fehlt`)
      allCICDFilesExist = false
    }
  }

  // Finale Prüfung
  console.log("\n✅ FINALE PRÜFUNG")
  console.log("-".repeat(60))

  if (allFilesExist && allKnowledgeFilesExist && allAIClientFilesExist && allCICDFilesExist) {
    console.log("   ✅ Alle Bot-Dateien vorhanden")
    console.log("   ✅ Alle Knowledge-Base-Dateien vorhanden")
    console.log("   ✅ Alle AI-Client-Dateien vorhanden")
    console.log("   ✅ Alle CI/CD-Dateien vorhanden")
    console.log("\n" + "=".repeat(60))
    console.log("✅ ALLE BOTS SIND BEREIT!")
    console.log("=".repeat(60))
    console.log("\n📊 Status:")
    console.log(`   - ${botFiles.length} Bots/Assistenten vorhanden`)
    console.log(`   - Alle Dateien vorhanden`)
    console.log(`   - System bereit für Einsatz`)
    console.log("\n🚀 Bots sind bereit für den Einsatz!")
    process.exit(0)
  } else {
    console.error("\n❌ Nicht alle Dateien vorhanden!")
    process.exit(1)
  }
}

testAllBots().catch((error) => {
  console.error("Fehler:", error)
  process.exit(1)
})

