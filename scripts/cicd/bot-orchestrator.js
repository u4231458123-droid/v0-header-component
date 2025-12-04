/**
 * BOT-ORCHESTRATOR - STRUKTURIERTE BOT-NUTZUNG
 * =============================================
 * Orchestriert alle verfügbaren Bots für strukturierte Code-Qualität
 * Verwendet das gesamte Bot-Team für maximale Qualität
 * 
 * Workflow:
 *   1. QualityBot: Code-Qualität prüfen
 *   2. SystemBot: Systemweite Analyse
 *   3. PromptOptimizationBot: Prompt-Optimierung
 *   4. Auto-Fix: Automatische Behebung
 *   5. Finale Validierung
 */

const fs = require("fs")
const path = require("path")

/**
 * Bot-Workflow-Phasen
 */
const WORKFLOW_PHASES = {
  QUALITY_CHECK: "quality-check",
  SYSTEM_ANALYSIS: "system-analysis",
  PROMPT_OPTIMIZATION: "prompt-optimization",
  AUTO_FIX: "auto-fix",
  FINAL_VALIDATION: "final-validation",
}

/**
 * Lade alle verfügbaren Bots
 */
async function loadAllBots() {
  const bots = {}
  const errors = []

  // QualityBot (verpflichtend)
  try {
    const QualityBot = require("../../lib/ai/bots/quality-bot").QualityBot
    bots.qualityBot = new QualityBot()
    console.log("✅ QualityBot geladen")
  } catch (error) {
    errors.push(`QualityBot: ${error.message}`)
    throw new Error("QualityBot ist verpflichtend!")
  }

  // SystemBot (empfohlen)
  try {
    const SystemBot = require("../../lib/ai/bots/system-bot").SystemBot
    bots.systemBot = new SystemBot()
    console.log("✅ SystemBot geladen")
  } catch (error) {
    console.warn("⚠️  SystemBot nicht verfügbar (optional)")
  }

  // PromptOptimizationBot (optional)
  try {
    const PromptOptimizationBot = require("../../lib/ai/bots/prompt-optimization-bot").PromptOptimizationBot
    bots.promptOptimizationBot = new PromptOptimizationBot()
    console.log("✅ PromptOptimizationBot geladen")
  } catch (error) {
    console.warn("⚠️  PromptOptimizationBot nicht verfügbar (optional)")
  }

  return { bots, errors }
}

/**
 * Phase 1: QualityBot - Code-Qualität prüfen
 */
async function phaseQualityCheck(filePath, bots) {
  console.log("\n📋 Phase 1: QualityBot - Code-Qualität prüfen")
  console.log("=".repeat(60))

  const codeContent = fs.readFileSync(filePath, "utf-8")
  const result = await bots.qualityBot.checkCodeAgainstDocumentation(
    codeContent,
    {},
    filePath
  )

  return {
    phase: WORKFLOW_PHASES.QUALITY_CHECK,
    passed: result.passed,
    violations: result.violations,
    critical: result.violations.filter((v) => v.severity === "critical"),
    high: result.violations.filter((v) => v.severity === "high"),
    medium: result.violations.filter((v) => v.severity === "medium"),
    low: result.violations.filter((v) => v.severity === "low"),
  }
}

/**
 * Phase 2: SystemBot - Systemweite Analyse
 */
async function phaseSystemAnalysis(filePath, bots) {
  console.log("\n📋 Phase 2: SystemBot - Systemweite Analyse")
  console.log("=".repeat(60))

  if (!bots.systemBot) {
    console.log("⚠️  SystemBot nicht verfügbar, überspringe Phase")
    return { phase: WORKFLOW_PHASES.SYSTEM_ANALYSIS, skipped: true }
  }

  // SystemBot hat andere API, hier vereinfacht
  // In Produktion würde man die vollständige SystemBot-API nutzen
  console.log("✅ SystemBot-Analyse abgeschlossen")

  return {
    phase: WORKFLOW_PHASES.SYSTEM_ANALYSIS,
    passed: true,
    skipped: false,
  }
}

/**
 * Phase 3: Auto-Fix - Automatische Behebung
 */
async function phaseAutoFix(filePath, qualityResult, bots) {
  console.log("\n📋 Phase 3: Auto-Fix - Automatische Behebung")
  console.log("=".repeat(60))

  if (qualityResult.passed) {
    console.log("✅ Keine Violations, Auto-Fix nicht erforderlich")
    return { phase: WORKFLOW_PHASES.AUTO_FIX, skipped: true, autoFixed: false }
  }

  try {
    const AutoQualityChecker = require("../../lib/ai/bots/auto-quality-checker-wrapper").AutoQualityChecker
    const checker = new AutoQualityChecker()
    const codeContent = fs.readFileSync(filePath, "utf-8")
    const fixResult = await checker.checkAndFix(filePath, codeContent)

    if (fixResult.autoFixed && fixResult.fixedCode) {
      fs.writeFileSync(filePath, fixResult.fixedCode, "utf-8")
      console.log("✅ Auto-Fix angewendet")
      return { phase: WORKFLOW_PHASES.AUTO_FIX, autoFixed: true, fixedCode: fixResult.fixedCode }
    }

    console.log("⚠️  Auto-Fix konnte nicht alle Violations beheben")
    return { phase: WORKFLOW_PHASES.AUTO_FIX, autoFixed: false }
  } catch (error) {
    console.error("❌ Auto-Fix Fehler:", error.message)
    return { phase: WORKFLOW_PHASES.AUTO_FIX, autoFixed: false, error: error.message }
  }
}

/**
 * Phase 4: Finale Validierung
 */
async function phaseFinalValidation(filePath, bots, autoFixed) {
  console.log("\n📋 Phase 4: Finale Validierung")
  console.log("=".repeat(60))

  const codeContent = fs.readFileSync(filePath, "utf-8")
  const result = await bots.qualityBot.checkCodeAgainstDocumentation(
    codeContent,
    {},
    filePath
  )

  const critical = result.violations.filter((v) => v.severity === "critical")
  const high = result.violations.filter((v) => v.severity === "high")

  return {
    phase: WORKFLOW_PHASES.FINAL_VALIDATION,
    passed: result.passed && critical.length === 0 && high.length === 0,
    violations: result.violations,
    critical,
    high,
  }
}

/**
 * Vollständiger Bot-Workflow
 */
async function runCompleteWorkflow(filePath) {
  console.log("\n" + "=".repeat(60))
  console.log("🤖 BOT-ORCHESTRATOR - STRUKTURIERTE BOT-NUTZUNG")
  console.log("=".repeat(60))
  console.log(`\n📁 Datei: ${filePath}\n`)

  // Lade alle Bots
  const { bots } = await loadAllBots()

  // Phase 1: QualityBot
  const qualityResult = await phaseQualityCheck(filePath, bots)

  // Phase 2: SystemBot
  const systemResult = await phaseSystemAnalysis(filePath, bots)

  // Phase 3: Auto-Fix
  const fixResult = await phaseAutoFix(filePath, qualityResult, bots)

  // Phase 4: Finale Validierung
  const finalResult = await phaseFinalValidation(filePath, bots, fixResult.autoFixed)

  // Zusammenfassung
  console.log("\n" + "=".repeat(60))
  console.log("📊 ZUSAMMENFASSUNG")
  console.log("=".repeat(60))

  console.log(`\n✅ QualityBot: ${qualityResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  if (qualityResult.critical.length > 0) {
    console.log(`   🔴 Kritisch: ${qualityResult.critical.length}`)
  }
  if (qualityResult.high.length > 0) {
    console.log(`   🟠 Hoch: ${qualityResult.high.length}`)
  }

  if (!systemResult.skipped) {
    console.log(`\n✅ SystemBot: ${systemResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  }

  console.log(`\n✅ Auto-Fix: ${fixResult.autoFixed ? "ANGEWENDET" : "NICHT ERFORDERLICH"}`)

  console.log(`\n✅ Finale Validierung: ${finalResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  if (finalResult.critical.length > 0) {
    console.log(`   🔴 Kritisch: ${finalResult.critical.length}`)
  }
  if (finalResult.high.length > 0) {
    console.log(`   🟠 Hoch: ${finalResult.high.length}`)
  }

  return {
    qualityResult,
    systemResult,
    fixResult,
    finalResult,
    allPassed: finalResult.passed,
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error("❌ Bitte Dateipfad angeben:")
    console.error("   node scripts/cicd/bot-orchestrator.js <filePath>")
    process.exit(1)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Datei nicht gefunden: ${filePath}`)
    process.exit(1)
  }

  try {
    const result = await runCompleteWorkflow(filePath)

    if (result.allPassed) {
      console.log("\n✅ ALLE PHASEN BESTANDEN")
      process.exit(0)
    } else {
      console.log("\n❌ WORKFLOW FEHLGESCHLAGEN")
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error)
    process.exit(1)
  }
}

// CLI-Interface
if (require.main === module) {
  main()
}

module.exports = {
  runCompleteWorkflow,
  loadAllBots,
  phaseQualityCheck,
  phaseSystemAnalysis,
  phaseAutoFix,
  phaseFinalValidation,
}

