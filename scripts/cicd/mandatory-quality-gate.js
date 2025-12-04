/**
 * MANDATORY QUALITY GATE - NICHT UMG-EHBAR
 * ==========================================
 * Verpflichtende Code-Qualitätsprüfung vor jedem Commit/Push
 * Verwendet QualityBot + alle verfügbaren Bots
 * Blockiert Commits bei kritischen Fehlern
 * 
 * Verwendung:
 *   - Pre-Commit Hook: node scripts/cicd/mandatory-quality-gate.js --pre-commit
 *   - Pre-Push Hook: node scripts/cicd/mandatory-quality-gate.js --pre-push
 *   - Manuell: node scripts/cicd/mandatory-quality-gate.js <filePath>
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Konfiguration
const CONFIG = {
  // Kritische Fehler blockieren Commit
  BLOCK_ON_CRITICAL: true,
  BLOCK_ON_HIGH: true,
  // Auto-Fix aktivieren
  AUTO_FIX_ENABLED: true,
  // Alle Bots verwenden
  USE_ALL_BOTS: true,
  // Timeout für Bot-Prüfungen (Sekunden)
  BOT_TIMEOUT: 30,
}

/**
 * Lade alle verfügbaren Bots
 */
async function loadAllBots() {
  const bots = {}
  
  try {
    // QualityBot (immer verfügbar)
    const QualityBot = require("../../lib/ai/bots/quality-bot").QualityBot
    bots.qualityBot = new QualityBot()
  } catch (error) {
    console.error("❌ Fehler beim Laden des QualityBot:", error.message)
    throw new Error("QualityBot ist verpflichtend und muss verfügbar sein!")
  }

  try {
    // SystemBot (VERPFLICHTEND - Teil des AI-Teams)
    const SystemBot = require("../../lib/ai/bots/system-bot").SystemBot
    bots.systemBot = new SystemBot()
  } catch (error) {
    console.error("❌ Fehler beim Laden des SystemBot:", error.message)
    throw new Error("SystemBot ist verpflichtend und muss verfügbar sein!")
  }

  try {
    // PromptOptimizationBot (VERPFLICHTEND - Teil des AI-Teams)
    const PromptOptimizationBot = require("../../lib/ai/bots/prompt-optimization-bot").PromptOptimizationBot
    bots.promptOptimizationBot = new PromptOptimizationBot()
  } catch (error) {
    console.error("❌ Fehler beim Laden des PromptOptimizationBot:", error.message)
    throw new Error("PromptOptimizationBot ist verpflichtend und muss verfügbar sein!")
  }

  // Lade alle weiteren verfügbaren Bots (verpflichtend)
  try {
    const { MasterBot } = require("../../lib/ai/bots/master-bot")
    bots.masterBot = new MasterBot()
  } catch (error) {
    console.error("❌ Fehler beim Laden des MasterBot:", error.message)
    throw new Error("MasterBot ist verpflichtend und muss verfügbar sein!")
  }

  try {
    const { DocumentationBot } = require("../../lib/ai/bots/documentation-bot")
    bots.documentationBot = new DocumentationBot()
  } catch (error) {
    console.error("❌ Fehler beim Laden des DocumentationBot:", error.message)
    throw new Error("DocumentationBot ist verpflichtend und muss verfügbar sein!")
  }

  try {
    const { CodeAssistant } = require("../../lib/ai/bots/code-assistant")
    bots.codeAssistant = new CodeAssistant()
  } catch (error) {
    console.error("❌ Fehler beim Laden des CodeAssistant:", error.message)
    throw new Error("CodeAssistant ist verpflichtend und muss verfügbar sein!")
  }

  return bots
}

/**
 * Prüfe Datei mit allen verfügbaren Bots
 */
async function checkFileWithAllBots(filePath, bots) {
  const results = {
    filePath,
    qualityBot: null,
    systemBot: null,
    promptOptimizationBot: null,
    allPassed: true,
    criticalViolations: [],
    highViolations: [],
    mediumViolations: [],
    lowViolations: [],
    autoFixed: false,
  }

  // Lade Code
  let codeContent
  try {
    codeContent = fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    console.error(`❌ Fehler beim Lesen von ${filePath}:`, error.message)
    return { ...results, allPassed: false, errors: [error.message] }
  }

  // 1. QualityBot (verpflichtend)
  try {
    console.log(`🔍 [QualityBot] Prüfe: ${filePath}`)
    const qualityResult = await bots.qualityBot.checkCodeAgainstDocumentation(
      codeContent,
      {},
      filePath
    )
    results.qualityBot = qualityResult

    if (!qualityResult.passed) {
      results.allPassed = false
      qualityResult.violations.forEach((v) => {
        if (v.severity === "critical") results.criticalViolations.push(v)
        else if (v.severity === "high") results.highViolations.push(v)
        else if (v.severity === "medium") results.mediumViolations.push(v)
        else results.lowViolations.push(v)
      })
    }
  } catch (error) {
    console.error(`❌ [QualityBot] Fehler:`, error.message)
    results.allPassed = false
    results.errors = results.errors || []
    results.errors.push(`QualityBot: ${error.message}`)
  }

  // 2. SystemBot (VERPFLICHTEND)
  if (bots.systemBot) {
    try {
      console.log(`🔍 [SystemBot] Prüfe: ${filePath}`)
      // SystemBot-Analyse durchführen
      const systemAnalysis = await bots.systemBot.analyzeCode(codeContent, filePath)
      if (systemAnalysis && systemAnalysis.issues && systemAnalysis.issues.length > 0) {
        results.allPassed = false
        systemAnalysis.issues.forEach((issue) => {
          if (issue.severity === "critical") results.criticalViolations.push(issue)
          else if (issue.severity === "high") results.highViolations.push(issue)
        })
      }
    } catch (error) {
      console.error(`❌ [SystemBot] Fehler:`, error.message)
      results.allPassed = false
      results.errors = results.errors || []
      results.errors.push(`SystemBot: ${error.message}`)
    }
  } else {
    console.error("❌ SystemBot fehlt - VERPFLICHTEND!")
    results.allPassed = false
    results.errors = results.errors || []
    results.errors.push("SystemBot fehlt - verpflichtend für AI-Team-Arbeit")
  }

  // 3. Auto-Fix versuchen
  if (CONFIG.AUTO_FIX_ENABLED && results.qualityBot && !results.qualityBot.passed) {
    try {
      const AutoQualityChecker = require("../../lib/ai/bots/auto-quality-checker-wrapper").AutoQualityChecker
      const checker = new AutoQualityChecker()
      const fixResult = await checker.checkAndFix(filePath, codeContent)

      if (fixResult.autoFixed && fixResult.fixedCode) {
        fs.writeFileSync(filePath, fixResult.fixedCode, "utf-8")
        results.autoFixed = true
        console.log(`✅ [Auto-Fix] Behoben: ${filePath}`)
        
        // Erneute Prüfung nach Auto-Fix
        const reCheckResult = await bots.qualityBot.checkCodeAgainstDocumentation(
          fixResult.fixedCode,
          {},
          filePath
        )
        if (reCheckResult.passed) {
          results.allPassed = true
          results.criticalViolations = []
          results.highViolations = []
        }
      }
    } catch (error) {
      console.warn(`⚠️  [Auto-Fix] Fehler (optional):`, error.message)
    }
  }

  return results
}

/**
 * Prüfe alle geänderten Dateien (Git)
 */
async function checkGitChanges(mode = "pre-commit") {
  let files = []

  try {
    if (mode === "pre-commit") {
      // Staged files
      const output = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf-8" })
      files = output.split("\n").filter((f) => f.trim() && (f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")))
    } else if (mode === "pre-push") {
      // Files changed between local and remote
      const output = execSync("git diff origin/$(git rev-parse --abbrev-ref HEAD)..HEAD --name-only --diff-filter=ACM", { encoding: "utf-8" })
      files = output.split("\n").filter((f) => f.trim() && (f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx")))
    }
  } catch (error) {
    // Keine Änderungen oder Fehler beim Git-Command
    console.log("ℹ️  Keine geänderten Dateien gefunden")
    return { allPassed: true, files: [] }
  }

  if (files.length === 0) {
    console.log("✅ Keine Code-Dateien geändert")
    return { allPassed: true, files: [] }
  }

  console.log(`\n🔍 Prüfe ${files.length} geänderte Datei(en) mit QualityBot...\n`)

  const bots = await loadAllBots()
  const results = []

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`⚠️  Datei nicht gefunden: ${file}`)
      continue
    }

    const result = await checkFileWithAllBots(file, bots)
    results.push(result)

    // Zeige Zusammenfassung
    if (!result.allPassed) {
      console.log(`\n❌ ${file}:`)
      if (result.criticalViolations.length > 0) {
        console.log(`   🔴 Kritisch: ${result.criticalViolations.length}`)
      }
      if (result.highViolations.length > 0) {
        console.log(`   🟠 Hoch: ${result.highViolations.length}`)
      }
      if (result.mediumViolations.length > 0) {
        console.log(`   🟡 Mittel: ${result.mediumViolations.length}`)
      }
      if (result.lowViolations.length > 0) {
        console.log(`   🟢 Niedrig: ${result.lowViolations.length}`)
      }
    } else {
      console.log(`✅ ${file}`)
    }
  }

  // Gesamt-Ergebnis
  const allPassed = results.every((r) => r.allPassed)
  const totalCritical = results.reduce((sum, r) => sum + r.criticalViolations.length, 0)
  const totalHigh = results.reduce((sum, r) => sum + r.highViolations.length, 0)

  return {
    allPassed,
    files: results,
    totalCritical,
    totalHigh,
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  const args = process.argv.slice(2)
  const mode = args.find((a) => a.startsWith("--"))?.replace("--", "") || "manual"
  const filePath = args.find((a) => !a.startsWith("--"))

  console.log("\n" + "=".repeat(60))
  console.log("🚨 MANDATORY QUALITY GATE - NICHT UMG-EHBAR")
  console.log("=".repeat(60) + "\n")

  let result

  if (filePath) {
    // Einzelne Datei prüfen
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Datei nicht gefunden: ${filePath}`)
      process.exit(1)
    }

    const bots = await loadAllBots()
    result = await checkFileWithAllBots(filePath, bots)
  } else {
    // Git-Änderungen prüfen
    result = await checkGitChanges(mode)
  }

  // Ergebnis auswerten
  console.log("\n" + "=".repeat(60))
  if (result.allPassed) {
    console.log("✅ QUALITY GATE BESTANDEN")
    console.log("=".repeat(60) + "\n")
    process.exit(0)
  } else {
    console.log("❌ QUALITY GATE FEHLGESCHLAGEN")
    console.log("=".repeat(60))
    
    if (result.totalCritical > 0) {
      console.log(`\n🔴 ${result.totalCritical} kritische Violation(s) gefunden`)
    }
    if (result.totalHigh > 0) {
      console.log(`🟠 ${result.totalHigh} hoch-severe Violation(s) gefunden`)
    }

    console.log("\n📋 Detaillierte Violations:")
    if (filePath && result.criticalViolations) {
      result.criticalViolations.forEach((v, i) => {
        console.log(`\n   ${i + 1}. [KRITISCH] ${v.type}`)
        if (v.line) console.log(`      Zeile ${v.line}: ${v.message}`)
        console.log(`      💡 ${v.suggestion}`)
      })
    }

    // Blockiere Commit/Push bei kritischen Fehlern
    if (CONFIG.BLOCK_ON_CRITICAL && result.totalCritical > 0) {
      console.log("\n🚫 COMMIT/PUSH BLOCKIERT: Kritische Fehler müssen behoben werden!")
      console.log("💡 Tipp: Nutze 'npm run quality:check <filePath>' für Auto-Fix\n")
      process.exit(1)
    }

    if (CONFIG.BLOCK_ON_HIGH && result.totalHigh > 0) {
      console.log("\n🚫 COMMIT/PUSH BLOCKIERT: Hoch-severe Fehler müssen behoben werden!")
      console.log("💡 Tipp: Nutze 'npm run quality:check <filePath>' für Auto-Fix\n")
      process.exit(1)
    }

    // Warnung, aber erlaube Commit
    console.log("\n⚠️  Violations gefunden, aber nicht blockierend")
    process.exit(0)
  }
}

// CLI-Interface
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error)
    process.exit(1)
  })
}

module.exports = {
  checkFileWithAllBots,
  checkGitChanges,
  loadAllBots,
}

