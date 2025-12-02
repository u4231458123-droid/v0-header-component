/**
 * TEST TAVILY INTEGRATION
 * =======================
 * Testet die Tavily-Integration
 */

import { internetResearchService } from "../lib/ai/bots/internet-research.js"

async function testTavilyIntegration() {
  console.log("🧪 Teste Tavily-Integration...\n")

  try {
    // Test 1: Einfache Recherche
    console.log("📋 Test 1: Einfache Recherche")
    const result1 = await internetResearchService.research("React Best Practices")
    console.log(`✅ Ergebnisse: ${result1.results.length}`)
    console.log(`✅ Best Practices: ${result1.bestPractices.length}`)
    console.log(`✅ Quellen: ${result1.sources.join(", ")}`)
    console.log("")

    // Test 2: Technische Dokumentation
    console.log("📋 Test 2: Technische Dokumentation")
    const result2 = await internetResearchService.researchTechnicalDocs("TypeScript", "Type Safety")
    console.log(`✅ Ergebnisse: ${result2.results.length}`)
    console.log(`✅ Best Practices: ${result2.bestPractices.length}`)
    console.log("")

    // Test 3: Best Practices
    console.log("📋 Test 3: Best Practices")
    const bestPractices = await internetResearchService.researchBestPractices("Next.js")
    console.log(`✅ Best Practices gefunden: ${bestPractices.length}`)
    bestPractices.slice(0, 3).forEach((bp, i) => {
      console.log(`   ${i + 1}. ${bp.substring(0, 80)}...`)
    })
    console.log("")

    console.log("✅ Alle Tests erfolgreich!")
  } catch (error) {
    console.error("❌ Test fehlgeschlagen:", error.message)
    process.exit(1)
  }
}

testTavilyIntegration()

