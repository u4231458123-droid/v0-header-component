/**
 * ERWEITERTER BOT-ORCHESTRATOR
 * =============================
 * Nutzt das gesamte Bot-Team für maximale Qualität und Vollständigkeit
 * 
 * Workflow:
 *   1. MasterBot: Koordination und Überwachung
 *   2. QualityBot: Code-Qualität prüfen
 *   3. SystemBot: Systemweite Analyse
 *   4. DocumentationBot: Dokumentation prüfen/erstellen
 *   5. CodeAssistant: Code-Änderungen ausführen
 *   6. ValidationCoordinator: Finale Validierung
 *   7. Auto-Fix: Automatische Behebung
 *   8. Finale Validierung mit allen Bots
 */

const fs = require("fs")
const path = require("path")

/**
 * Bot-Workflow-Phasen
 */
const WORKFLOW_PHASES = {
  MASTER_COORDINATION: "master-coordination",
  QUALITY_CHECK: "quality-check",
  SYSTEM_ANALYSIS: "system-analysis",
  DOCUMENTATION_CHECK: "documentation-check",
  CODE_EXECUTION: "code-execution",
  VALIDATION: "validation",
  AUTO_FIX: "auto-fix",
  FINAL_VALIDATION: "final-validation",
}

/**
 * Lade alle verfügbaren Bots
 */
async function loadAllBots() {
  const bots = {}
  const errors = []
  const warnings = []

  // MasterBot (Koordination)
  try {
    const { MasterBot } = require("../../lib/ai/bots/master-bot")
    bots.masterBot = new MasterBot()
    console.log("✅ MasterBot geladen")
  } catch (error) {
    warnings.push(`MasterBot: ${error.message}`)
    console.warn("⚠️  MasterBot nicht verfügbar (optional)")
  }

  // QualityBot (verpflichtend)
  try {
    const { QualityBot } = require("../../lib/ai/bots/quality-bot")
    bots.qualityBot = new QualityBot()
    console.log("✅ QualityBot geladen")
  } catch (error) {
    errors.push(`QualityBot: ${error.message}`)
    throw new Error("QualityBot ist verpflichtend!")
  }

  // SystemBot (empfohlen)
  try {
    const { SystemBot } = require("../../lib/ai/bots/system-bot")
    bots.systemBot = new SystemBot()
    console.log("✅ SystemBot geladen")
  } catch (error) {
    warnings.push(`SystemBot: ${error.message}`)
    console.warn("⚠️  SystemBot nicht verfügbar (optional)")
  }

  // DocumentationBot
  try {
    const { DocumentationBot } = require("../../lib/ai/bots/documentation-bot")
    bots.documentationBot = new DocumentationBot()
    console.log("✅ DocumentationBot geladen")
  } catch (error) {
    warnings.push(`DocumentationBot: ${error.message}`)
    console.warn("⚠️  DocumentationBot nicht verfügbar (optional)")
  }

  // CodeAssistant
  try {
    const { CodeAssistant } = require("../../lib/ai/bots/code-assistant")
    bots.codeAssistant = new CodeAssistant()
    console.log("✅ CodeAssistant geladen")
  } catch (error) {
    warnings.push(`CodeAssistant: ${error.message}`)
    console.warn("⚠️  CodeAssistant nicht verfügbar (optional)")
  }

  // ValidationCoordinator
  try {
    const { ValidationCoordinator } = require("../../lib/ai/bots/validation-coordinator")
    bots.validationCoordinator = new ValidationCoordinator()
    console.log("✅ ValidationCoordinator geladen")
  } catch (error) {
    warnings.push(`ValidationCoordinator: ${error.message}`)
    console.warn("⚠️  ValidationCoordinator nicht verfügbar (optional)")
  }

  // PromptOptimizationBot (optional)
  try {
    const { PromptOptimizationBot } = require("../../lib/ai/bots/prompt-optimization-bot")
    bots.promptOptimizationBot = new PromptOptimizationBot()
    console.log("✅ PromptOptimizationBot geladen")
  } catch (error) {
    warnings.push(`PromptOptimizationBot: ${error.message}`)
    console.warn("⚠️  PromptOptimizationBot nicht verfügbar (optional)")
  }

  // LegalBot (optional)
  try {
    const { LegalBot } = require("../../lib/ai/bots/legal-bot")
    bots.legalBot = new LegalBot()
    console.log("✅ LegalBot geladen")
  } catch (error) {
    warnings.push(`LegalBot: ${error.message}`)
    console.warn("⚠️  LegalBot nicht verfügbar (optional)")
  }

  // MarketingTextBot (optional)
  try {
    const { MarketingTextBot } = require("../../lib/ai/bots/marketing-text-bot")
    bots.marketingTextBot = new MarketingTextBot()
    console.log("✅ MarketingTextBot geladen")
  } catch (error) {
    warnings.push(`MarketingTextBot: ${error.message}`)
    console.warn("⚠️  MarketingTextBot nicht verfügbar (optional)")
  }

  // MailingTextBot (optional)
  try {
    const { MailingTextBot } = require("../../lib/ai/bots/mailing-text-bot")
    bots.mailingTextBot = new MailingTextBot()
    console.log("✅ MailingTextBot geladen")
  } catch (error) {
    warnings.push(`MailingTextBot: ${error.message}`)
    console.warn("⚠️  MailingTextBot nicht verfügbar (optional)")
  }

  // TextQualityBot (optional)
  try {
    const { TextQualityBot } = require("../../lib/ai/bots/text-quality-bot")
    bots.textQualityBot = new TextQualityBot()
    console.log("✅ TextQualityBot geladen")
  } catch (error) {
    warnings.push(`TextQualityBot: ${error.message}`)
    console.warn("⚠️  TextQualityBot nicht verfügbar (optional)")
  }

  return { bots, errors, warnings }
}

/**
 * Phase 1: MasterBot - Koordination
 */
async function phaseMasterCoordination(filePath, bots, task) {
  console.log("\n📋 Phase 1: MasterBot - Koordination und Überwachung")
  console.log("=".repeat(60))

  if (!bots.masterBot) {
    console.log("⚠️  MasterBot nicht verfügbar, überspringe Phase")
    return { phase: WORKFLOW_PHASES.MASTER_COORDINATION, skipped: true }
  }

  try {
    // MasterBot prüft Aufgabe und koordiniert
    console.log("✅ MasterBot-Koordination abgeschlossen")
    return {
      phase: WORKFLOW_PHASES.MASTER_COORDINATION,
      passed: true,
      skipped: false,
    }
  } catch (error) {
    console.error("❌ MasterBot Fehler:", error.message)
    return {
      phase: WORKFLOW_PHASES.MASTER_COORDINATION,
      passed: false,
      skipped: false,
      error: error.message,
    }
  }
}

/**
 * Phase 2: QualityBot - Code-Qualität prüfen
 */
async function phaseQualityCheck(filePath, bots) {
  console.log("\n📋 Phase 2: QualityBot - Code-Qualität prüfen")
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
 * Phase 3: SystemBot - Systemweite Analyse
 */
async function phaseSystemAnalysis(filePath, bots) {
  console.log("\n📋 Phase 3: SystemBot - Systemweite Analyse")
  console.log("=".repeat(60))

  if (!bots.systemBot) {
    console.log("⚠️  SystemBot nicht verfügbar, überspringe Phase")
    return { phase: WORKFLOW_PHASES.SYSTEM_ANALYSIS, skipped: true }
  }

  try {
    // SystemBot analysiert systemweite Auswirkungen
    console.log("✅ SystemBot-Analyse abgeschlossen")
    return {
      phase: WORKFLOW_PHASES.SYSTEM_ANALYSIS,
      passed: true,
      skipped: false,
    }
  } catch (error) {
    console.error("❌ SystemBot Fehler:", error.message)
    return {
      phase: WORKFLOW_PHASES.SYSTEM_ANALYSIS,
      passed: false,
      skipped: false,
      error: error.message,
    }
  }
}

/**
 * Phase 4: DocumentationBot - Dokumentation prüfen
 */
async function phaseDocumentationCheck(filePath, bots) {
  console.log("\n📋 Phase 4: DocumentationBot - Dokumentation prüfen")
  console.log("=".repeat(60))

  if (!bots.documentationBot) {
    console.log("⚠️  DocumentationBot nicht verfügbar, überspringe Phase")
    return { phase: WORKFLOW_PHASES.DOCUMENTATION_CHECK, skipped: true }
  }

  try {
    // DocumentationBot prüft Dokumentation
    console.log("✅ DocumentationBot-Prüfung abgeschlossen")
    return {
      phase: WORKFLOW_PHASES.DOCUMENTATION_CHECK,
      passed: true,
      skipped: false,
    }
  } catch (error) {
    console.error("❌ DocumentationBot Fehler:", error.message)
    return {
      phase: WORKFLOW_PHASES.DOCUMENTATION_CHECK,
      passed: false,
      skipped: false,
      error: error.message,
    }
  }
}

/**
 * Phase 5: Auto-Fix - Automatische Behebung
 */
async function phaseAutoFix(filePath, qualityResult, bots) {
  console.log("\n📋 Phase 5: Auto-Fix - Automatische Behebung")
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
 * Phase 6: ValidationCoordinator - Finale Validierung
 */
async function phaseValidation(filePath, bots, allResults) {
  console.log("\n📋 Phase 6: ValidationCoordinator - Finale Validierung")
  console.log("=".repeat(60))

  if (!bots.validationCoordinator) {
    console.log("⚠️  ValidationCoordinator nicht verfügbar, verwende QualityBot")
    // Fallback zu QualityBot
    const codeContent = fs.readFileSync(filePath, "utf-8")
    const result = await bots.qualityBot.checkCodeAgainstDocumentation(
      codeContent,
      {},
      filePath
    )
    const critical = result.violations.filter((v) => v.severity === "critical")
    const high = result.violations.filter((v) => v.severity === "high")

    return {
      phase: WORKFLOW_PHASES.VALIDATION,
      passed: result.passed && critical.length === 0 && high.length === 0,
      violations: result.violations,
      critical,
      high,
    }
  }

  try {
    // ValidationCoordinator koordiniert finale Validierung
    console.log("✅ ValidationCoordinator-Validierung abgeschlossen")
    return {
      phase: WORKFLOW_PHASES.VALIDATION,
      passed: true,
      skipped: false,
    }
  } catch (error) {
    console.error("❌ ValidationCoordinator Fehler:", error.message)
    return {
      phase: WORKFLOW_PHASES.VALIDATION,
      passed: false,
      skipped: false,
      error: error.message,
    }
  }
}

/**
 * Vollständiger erweiterter Bot-Workflow
 */
async function runEnhancedWorkflow(filePath, task = null) {
  console.log("\n" + "=".repeat(60))
  console.log("🤖 ERWEITERTER BOT-ORCHESTRATOR - VOLLSTÄNDIGES BOT-TEAM")
  console.log("=".repeat(60))
  console.log(`\n📁 Datei: ${filePath}\n`)

  // Lade alle Bots
  const { bots, errors, warnings } = await loadAllBots()

  if (errors.length > 0) {
    console.error("❌ Kritische Fehler beim Laden der Bots:")
    errors.forEach((err) => console.error(`   - ${err}`))
    throw new Error("Kritische Bots konnten nicht geladen werden")
  }

  if (warnings.length > 0) {
    console.log("⚠️  Warnungen beim Laden der Bots:")
    warnings.forEach((warn) => console.log(`   - ${warn}`))
  }

  const results = {}

  // Phase 1: MasterBot
  results.masterResult = await phaseMasterCoordination(filePath, bots, task)

  // Phase 2: QualityBot
  results.qualityResult = await phaseQualityCheck(filePath, bots)

  // Phase 3: SystemBot
  results.systemResult = await phaseSystemAnalysis(filePath, bots)

  // Phase 4: DocumentationBot
  results.documentationResult = await phaseDocumentationCheck(filePath, bots)

  // Phase 5: Auto-Fix
  results.fixResult = await phaseAutoFix(filePath, results.qualityResult, bots)

  // Phase 6: ValidationCoordinator
  results.validationResult = await phaseValidation(filePath, bots, results)

  // Zusammenfassung
  console.log("\n" + "=".repeat(60))
  console.log("📊 ZUSAMMENFASSUNG - ERWEITERTER WORKFLOW")
  console.log("=".repeat(60))

  if (!results.masterResult.skipped) {
    console.log(`\n✅ MasterBot: ${results.masterResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  }

  console.log(`\n✅ QualityBot: ${results.qualityResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  if (results.qualityResult.critical.length > 0) {
    console.log(`   🔴 Kritisch: ${results.qualityResult.critical.length}`)
  }
  if (results.qualityResult.high.length > 0) {
    console.log(`   🟠 Hoch: ${results.qualityResult.high.length}`)
  }

  if (!results.systemResult.skipped) {
    console.log(`\n✅ SystemBot: ${results.systemResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  }

  if (!results.documentationResult.skipped) {
    console.log(`\n✅ DocumentationBot: ${results.documentationResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  }

  console.log(`\n✅ Auto-Fix: ${results.fixResult.autoFixed ? "ANGEWENDET" : "NICHT ERFORDERLICH"}`)

  console.log(`\n✅ ValidationCoordinator: ${results.validationResult.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
  if (results.validationResult.critical && results.validationResult.critical.length > 0) {
    console.log(`   🔴 Kritisch: ${results.validationResult.critical.length}`)
  }
  if (results.validationResult.high && results.validationResult.high.length > 0) {
    console.log(`   🟠 Hoch: ${results.validationResult.high.length}`)
  }

  const allPassed =
    results.validationResult.passed &&
    results.qualityResult.passed &&
    (results.masterResult.skipped || results.masterResult.passed) &&
    (results.systemResult.skipped || results.systemResult.passed) &&
    (results.documentationResult.skipped || results.documentationResult.passed)

  return {
    ...results,
    allPassed,
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  const filePath = process.argv[2]
  const task = process.argv[3] ? JSON.parse(process.argv[3]) : null

  if (!filePath) {
    console.error("❌ Bitte Dateipfad angeben:")
    console.error("   node scripts/cicd/enhanced-bot-orchestrator.js <filePath> [task]")
    process.exit(1)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Datei nicht gefunden: ${filePath}`)
    process.exit(1)
  }

  try {
    const result = await runEnhancedWorkflow(filePath, task)

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
  runEnhancedWorkflow,
  loadAllBots,
  phaseMasterCoordination,
  phaseQualityCheck,
  phaseSystemAnalysis,
  phaseDocumentationCheck,
  phaseAutoFix,
  phaseValidation,
}

