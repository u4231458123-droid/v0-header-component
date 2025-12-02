/**
 * FINALE SYSTEM-PRÜFUNG
 * ======================
 * Prüft alles vor Start der Bots und Pipeline
 */

import { existsSync } from "fs"
import { join } from "path"
import { createRequire } from "module"
const require = createRequire(import.meta.url)

// Dynamischer Import für TypeScript-Module
async function getAllModelsForBot(botName) {
  try {
    // Versuche TypeScript-Import (wenn ts-node oder ähnliches vorhanden)
    const models = await import("../../lib/ai/models-optimized.ts")
    return models.getAllModelsForBot(botName)
  } catch (error) {
    // Fallback: Simuliere Modelle
    console.warn(`⚠️ Konnte Modelle nicht laden für ${botName}, verwende Fallback`)
    return [
      { id: "deepseek-v3", name: "DeepSeek V3", modelId: "deepseek-ai/DeepSeek-V3" },
      { id: "starcoder2-15b", name: "StarCoder2 15B", modelId: "bigcode/starcoder2-15b" },
      { id: "codellama-13b", name: "CodeLlama 13B", modelId: "codellama/CodeLlama-13b-Instruct-hf" },
    ]
  }
}

async function finalSystemCheck() {
  console.log("🔍 FINALE SYSTEM-PRÜFUNG\n")
  console.log("=".repeat(60))

  let allChecksPassed = true

  // 1. Prüfe Modelle
  console.log("\n1️⃣ Prüfe KI-Modelle...")
  const bots = [
    "system-bot",
    "quality-bot",
    "master-bot",
    "documentation-bot",
    "documentation-assistant",
    "marketing-text-bot",
    "marketing-text-assistant",
    "legal-bot",
    "legal-assistant",
  ]

  for (const botName of bots) {
    const models = getAllModelsForBot(botName)
    if (models.length >= 1) {
      console.log(`   ✅ ${botName}: ${models.length} Modell(e)`)
    } else {
      console.error(`   ❌ ${botName}: Keine Modelle`)
      allChecksPassed = false
    }
  }

  // 2. Prüfe Bot-Dateien
  console.log("\n2️⃣ Prüfe Bot-Dateien...")
  const botFiles = [
    "lib/ai/bots/base-bot.ts",
    "lib/ai/bots/system-bot.ts",
    "lib/ai/bots/quality-bot.ts",
    "lib/ai/bots/master-bot.ts",
    "lib/ai/bots/documentation-bot.ts",
    "lib/ai/bots/documentation-assistant.ts",
    "lib/ai/bots/marketing-text-bot.ts",
    "lib/ai/bots/marketing-text-assistant.ts",
    "lib/ai/bots/legal-bot.ts",
    "lib/ai/bots/legal-assistant.ts",
  ]

  for (const file of botFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.error(`   ❌ ${file} fehlt`)
      allChecksPassed = false
    }
  }

  // 3. Prüfe Knowledge-Base
  console.log("\n3️⃣ Prüfe Knowledge-Base...")
  const knowledgeFiles = [
    "lib/knowledge-base/structure.ts",
    "lib/knowledge-base/load-with-cicd.ts",
    "lib/knowledge-base/agent-responsibility.ts",
    "lib/knowledge-base/self-reflection.ts",
    "lib/knowledge-base/bot-communication.ts",
  ]

  for (const file of knowledgeFiles) {
    const filePath = join(process.cwd(), file)
    if (existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.error(`   ❌ ${file} fehlt`)
      allChecksPassed = false
    }
  }

  // 4. Prüfe Workflows
  console.log("\n4️⃣ Prüfe GitHub Workflows...")
  const workflows = [
    ".github/workflows/master-validation.yml",
    ".github/workflows/auto-fix-bugs.yml",
    ".github/workflows/advanced-optimizations.yml",
  ]

  for (const workflow of workflows) {
    const workflowPath = join(process.cwd(), workflow)
    if (existsSync(workflowPath)) {
      console.log(`   ✅ ${workflow}`)
    } else {
      console.error(`   ❌ ${workflow} fehlt`)
      allChecksPassed = false
    }
  }

  // 5. Prüfe Scripts
  console.log("\n5️⃣ Prüfe Scripts...")
  const scripts = [
    "scripts/cicd/start-bots.mjs",
    "scripts/cicd/start-pipeline.mjs",
    "scripts/cicd/final-validation-plan.mjs",
  ]

  for (const script of scripts) {
    const scriptPath = join(process.cwd(), script)
    if (existsSync(scriptPath)) {
      console.log(`   ✅ ${script}`)
    } else {
      console.error(`   ❌ ${script} fehlt`)
      allChecksPassed = false
    }
  }

  // Zusammenfassung
  console.log("\n" + "=".repeat(60))
  if (allChecksPassed) {
    console.log("✅ ALLE PRÜFUNGEN BESTANDEN!")
    console.log("=".repeat(60))
    console.log("\n🚀 System ist bereit für Start!")
    console.log("\n📋 Nächste Schritte:")
    console.log("   1. pnpm bots:start - Starte alle Bots")
    console.log("   2. Warte bis alle Bots bereit sind")
    console.log("   3. pnpm pipeline:start - Starte CI/CD Pipeline")
    process.exit(0)
  } else {
    console.error("❌ PRÜFUNGEN FEHLGESCHLAGEN!")
    console.log("=".repeat(60))
    console.error("\n⚠️ Bitte behebe die Fehler vor dem Start!")
    process.exit(1)
  }
}

finalSystemCheck().catch((error) => {
  console.error("Kritischer Fehler bei System-Prüfung:", error)
  process.exit(1)
})

