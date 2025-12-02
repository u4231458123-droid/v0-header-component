/**
 * BOT-MONITORING SCRIPT
 * =====================
 * Überwacht alle Bots und führt Health-Checks durch
 */

import { botMonitor } from "../../lib/cicd/bot-monitor.js"

async function monitorBots() {
  console.log("🔍 BOT-MONITORING\n")
  console.log("=".repeat(60))

  try {
    // Führe Health-Checks für alle Bots durch
    console.log("\n📊 Führe Health-Checks durch...")
    const healthChecks = await botMonitor.performAllHealthChecks()

    // Zeige Ergebnisse
    console.log("\n📋 Health-Check Ergebnisse:")
    console.log("-".repeat(60))

    let healthyCount = 0
    let unhealthyCount = 0

    for (const check of healthChecks) {
      const status = check.healthy ? "✅" : "❌"
      console.log(`${status} ${check.botId}:`)
      console.log(`   Status: ${check.healthy ? "Gesund" : "Probleme"}`)
      console.log(`   Response-Time: ${check.performance.responseTime}ms`)
      console.log(`   Success-Rate: ${(check.performance.successRate * 100).toFixed(1)}%`)
      console.log(`   Error-Rate: ${(check.performance.errorRate * 100).toFixed(1)}%`)
      
      if (check.issues.length > 0) {
        console.log(`   Probleme:`)
        check.issues.forEach((issue) => {
          console.log(`     - ${issue}`)
        })
      }

      if (check.healthy) {
        healthyCount++
      } else {
        unhealthyCount++
      }
      console.log()
    }

    console.log("=".repeat(60))
    console.log(`✅ Gesunde Bots: ${healthyCount}`)
    console.log(`❌ Bots mit Problemen: ${unhealthyCount}`)
    console.log(`📊 Gesamt: ${healthChecks.length}`)
    console.log("=".repeat(60))

    // Exit-Code basierend auf Ergebnissen
    if (unhealthyCount > 0) {
      console.log("\n⚠️ Einige Bots haben Probleme - bitte prüfen!")
      process.exit(1)
    } else {
      console.log("\n✅ Alle Bots sind gesund!")
      process.exit(0)
    }
  } catch (error) {
    console.error("Fehler beim Monitoring:", error)
    process.exit(1)
  }
}

monitorBots()
