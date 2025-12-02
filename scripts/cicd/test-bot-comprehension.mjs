/**
 * BOT-VERSTÄNDNIS-TEST
 * ====================
 * Prüft jeden Bot vollumfänglich durch Fragen, Erreichbarkeit, Antworten, Verhalten, Verständnis, Qualität
 */

import { SystemBot } from "../../lib/ai/bots/system-bot.js"
import { QualityBot } from "../../lib/ai/bots/quality-bot.js"
import { MasterBot } from "../../lib/ai/bots/master-bot.js"
import { loadKnowledgeForTaskWithCICD } from "../../lib/knowledge-base/load-with-cicd.js"

async function testBotComprehension() {
  console.log("🧪 BOT-VERSTÄNDNIS-TEST GESTARTET\n")

  const results = {
    systemBot: { passed: true, errors: [], warnings: [] },
    qualityBot: { passed: true, errors: [], warnings: [] },
    masterBot: { passed: true, errors: [], warnings: [] },
    overall: { passed: true, errors: [], warnings: [] },
  }

  // TEST 1: SYSTEM-BOT
  console.log("1. TESTE SYSTEM-BOT...")
  try {
    const systemBot = new SystemBot()

    // Test 1.1: Knowledge-Base laden
    console.log("  1.1. Prüfe Knowledge-Base-Laden...")
    const knowledge = loadKnowledgeForTaskWithCICD("code-analysis", [
      "systemwide-thinking",
      "bot-instructions",
    ])
    if (knowledge.length === 0) {
      results.systemBot.errors.push("System-Bot: Knowledge-Base nicht geladen")
      results.systemBot.passed = false
    } else {
      console.log("    ✅ Knowledge-Base geladen:", knowledge.length, "Einträge")
    }

    // Test 1.2: Systemweites Denken verstehen
    console.log("  1.2. Prüfe Systemweites Denken...")
    const systemwideThinking = knowledge.find((e) => e.id === "systemwide-thinking-001")
    if (!systemwideThinking) {
      results.systemBot.errors.push("System-Bot: Systemweites Denken nicht verstanden")
      results.systemBot.passed = false
    } else {
      console.log("    ✅ Systemweites Denken verstanden")
    }

    // Test 1.3: Arbeitsanweisungen verstehen
    console.log("  1.3. Prüfe Arbeitsanweisungen...")
    const instructions = knowledge.find((e) => e.id === "system-bot-instructions-001")
    if (!instructions) {
      results.systemBot.errors.push("System-Bot: Arbeitsanweisungen nicht verstanden")
      results.systemBot.passed = false
    } else {
      console.log("    ✅ Arbeitsanweisungen verstanden")
    }

    // Test 1.4: IST-Analyse durchführen
    console.log("  1.4. Prüfe IST-Analyse...")
    try {
      const analysis = await systemBot.performCurrentStateAnalysis("test-file.tsx")
      if (!analysis || !analysis.dependencies) {
        results.systemBot.warnings.push("System-Bot: IST-Analyse möglicherweise unvollständig")
      } else {
        console.log("    ✅ IST-Analyse funktioniert")
      }
    } catch (error) {
      results.systemBot.errors.push(`System-Bot: IST-Analyse fehlgeschlagen: ${error.message}`)
      results.systemBot.passed = false
    }
  } catch (error) {
    results.systemBot.errors.push(`System-Bot: Initialisierung fehlgeschlagen: ${error.message}`)
    results.systemBot.passed = false
  }

  // TEST 2: QUALITY-BOT
  console.log("\n2. TESTE QUALITY-BOT...")
  try {
    const qualityBot = new QualityBot()

    // Test 2.1: Knowledge-Base laden
    console.log("  2.1. Prüfe Knowledge-Base-Laden...")
    const knowledge = loadKnowledgeForTaskWithCICD("quality-check", [
      "systemwide-thinking",
      "bot-instructions",
    ])
    if (knowledge.length === 0) {
      results.qualityBot.errors.push("Quality-Bot: Knowledge-Base nicht geladen")
      results.qualityBot.passed = false
    } else {
      console.log("    ✅ Knowledge-Base geladen:", knowledge.length, "Einträge")
    }

    // Test 2.2: Systemweites Denken verstehen
    console.log("  2.2. Prüfe Systemweites Denken...")
    const systemwideThinking = knowledge.find((e) => e.id === "systemwide-thinking-001")
    if (!systemwideThinking) {
      results.qualityBot.errors.push("Quality-Bot: Systemweites Denken nicht verstanden")
      results.qualityBot.passed = false
    } else {
      console.log("    ✅ Systemweites Denken verstanden")
    }

    // Test 2.3: Arbeitsanweisungen verstehen
    console.log("  2.3. Prüfe Arbeitsanweisungen...")
    const instructions = knowledge.find((e) => e.id === "quality-bot-instructions-001")
    if (!instructions) {
      results.qualityBot.errors.push("Quality-Bot: Arbeitsanweisungen nicht verstanden")
      results.qualityBot.passed = false
    } else {
      console.log("    ✅ Arbeitsanweisungen verstanden")
    }

    // Test 2.4: Code-Validierung
    console.log("  2.4. Prüfe Code-Validierung...")
    try {
      const testCode = `export function Test() { return <div>Test</div> }`
      const validation = await qualityBot.checkCodeAgainstDocumentation(testCode, {}, "test.tsx")
      if (!validation || typeof validation.passed !== "boolean") {
        results.qualityBot.warnings.push("Quality-Bot: Code-Validierung möglicherweise unvollständig")
      } else {
        console.log("    ✅ Code-Validierung funktioniert")
      }
    } catch (error) {
      results.qualityBot.errors.push(`Quality-Bot: Code-Validierung fehlgeschlagen: ${error.message}`)
      results.qualityBot.passed = false
    }
  } catch (error) {
    results.qualityBot.errors.push(`Quality-Bot: Initialisierung fehlgeschlagen: ${error.message}`)
    results.qualityBot.passed = false
  }

  // TEST 3: MASTER-BOT
  console.log("\n3. TESTE MASTER-BOT...")
  try {
    const masterBot = new MasterBot()

    // Test 3.1: Knowledge-Base laden
    console.log("  3.1. Prüfe Knowledge-Base-Laden...")
    const knowledge = loadKnowledgeForTaskWithCICD("master-review", [
      "systemwide-thinking",
      "bot-instructions",
    ])
    if (knowledge.length === 0) {
      results.masterBot.errors.push("Master-Bot: Knowledge-Base nicht geladen")
      results.masterBot.passed = false
    } else {
      console.log("    ✅ Knowledge-Base geladen:", knowledge.length, "Einträge")
    }

    // Test 3.2: Systemweites Denken verstehen
    console.log("  3.2. Prüfe Systemweites Denken...")
    const systemwideThinking = knowledge.find((e) => e.id === "systemwide-thinking-001")
    if (!systemwideThinking) {
      results.masterBot.errors.push("Master-Bot: Systemweites Denken nicht verstanden")
      results.masterBot.passed = false
    } else {
      console.log("    ✅ Systemweites Denken verstanden")
    }

    // Test 3.3: Arbeitsanweisungen verstehen
    console.log("  3.3. Prüfe Arbeitsanweisungen...")
    const instructions = knowledge.find((e) => e.id === "master-bot-instructions-001")
    if (!instructions) {
      results.masterBot.errors.push("Master-Bot: Arbeitsanweisungen nicht verstanden")
      results.masterBot.passed = false
    } else {
      console.log("    ✅ Arbeitsanweisungen verstanden")
    }

    // Test 3.4: Chat-Interface
    console.log("  3.4. Prüfe Chat-Interface...")
    try {
      const response = await masterBot.chat("Hallo")
      if (!response || typeof response !== "string") {
        results.masterBot.warnings.push("Master-Bot: Chat-Interface möglicherweise unvollständig")
      } else {
        console.log("    ✅ Chat-Interface funktioniert")
      }
    } catch (error) {
      results.masterBot.errors.push(`Master-Bot: Chat-Interface fehlgeschlagen: ${error.message}`)
      results.masterBot.passed = false
    }

    // Test 3.5: Pending Requests
    console.log("  3.5. Prüfe Pending Requests...")
    try {
      const pending = await masterBot.getPendingRequests()
      if (!Array.isArray(pending)) {
        results.masterBot.warnings.push("Master-Bot: Pending Requests möglicherweise unvollständig")
      } else {
        console.log("    ✅ Pending Requests funktioniert:", pending.length, "Requests")
      }
    } catch (error) {
      results.masterBot.errors.push(`Master-Bot: Pending Requests fehlgeschlagen: ${error.message}`)
      results.masterBot.passed = false
    }
  } catch (error) {
    results.masterBot.errors.push(`Master-Bot: Initialisierung fehlgeschlagen: ${error.message}`)
    results.masterBot.passed = false
  }

  // ZUSAMMENFASSUNG
  console.log("\n" + "=".repeat(60))
  console.log("TEST-ERGEBNISSE")
  console.log("=".repeat(60))

  if (!results.systemBot.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.systemBot.errors)
  }
  if (!results.qualityBot.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.qualityBot.errors)
  }
  if (!results.masterBot.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.masterBot.errors)
  }

  results.overall.warnings.push(...results.systemBot.warnings)
  results.overall.warnings.push(...results.qualityBot.warnings)
  results.overall.warnings.push(...results.masterBot.warnings)

  console.log(JSON.stringify(results, null, 2))
  console.log("=".repeat(60))

  if (results.overall.passed) {
    console.log("\n✅ ALLE BOTS ERFOLGREICH GETESTET")
    process.exit(0)
  } else {
    console.log("\n❌ TEST FEHLGESCHLAGEN")
    console.log("Fehler:", results.overall.errors)
    if (results.overall.warnings.length > 0) {
      console.log("Warnungen:", results.overall.warnings)
    }
    process.exit(1)
  }
}

testBotComprehension().catch((error) => {
  console.error("Kritischer Fehler bei Bot-Test:", error)
  process.exit(1)
})

