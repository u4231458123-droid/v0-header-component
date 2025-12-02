/**
 * Vollständige System-Validierung
 * ================================
 * Prüft alle Komponenten der CI/CD-Pipeline und AI-Bots
 */

const fs = require("fs")
const path = require("path")

/**
 * Validiere System-Komponenten
 */
async function validateCompleteSystem() {
  const results = {
    success: true,
    errors: [],
    warnings: [],
    components: {},
  }

  console.log("🔍 Starte vollständige System-Validierung...\n")

  // 1. Prüfe Bot-Dateien
  console.log("1. Prüfe Bot-Dateien...")
  const botFiles = [
    "lib/ai/bots/system-bot.ts",
    "lib/ai/bots/quality-bot.ts",
    "lib/ai/bots/prompt-optimization-bot.ts",
  ]

  for (const botFile of botFiles) {
    if (fs.existsSync(botFile)) {
      results.components[botFile] = { exists: true, valid: true }
      console.log(`   ✅ ${botFile}`)
    } else {
      results.components[botFile] = { exists: false, valid: false }
      results.errors.push(`Bot-Datei fehlt: ${botFile}`)
      results.success = false
      console.log(`   ❌ ${botFile} - FEHLT`)
    }
  }

  // 2. Prüfe Prompt-Templates
  console.log("\n2. Prüfe Prompt-Templates...")
  const promptFile = "lib/cicd/prompts.ts"
  if (fs.existsSync(promptFile)) {
    const content = fs.readFileSync(promptFile, "utf-8")
    const hasCodeAnalysis = content.includes("generateCodeAnalysisPrompt")
    const hasBugAnalysis = content.includes("generateBugAnalysisPrompt")
    const hasOptimization = content.includes("generateCodeOptimizationPrompt")
    const hasAutoFix = content.includes("generateAutoFixPrompt")

    results.components[promptFile] = {
      exists: true,
      hasCodeAnalysis,
      hasBugAnalysis,
      hasOptimization,
      hasAutoFix,
    }

    if (!hasOptimization) {
      results.errors.push("generateCodeOptimizationPrompt fehlt")
      results.success = false
    }
    if (!hasAutoFix) {
      results.errors.push("generateAutoFixPrompt fehlt")
      results.success = false
    }

    console.log(`   ✅ ${promptFile}`)
    console.log(`      - Code-Analyse: ${hasCodeAnalysis ? "✅" : "❌"}`)
    console.log(`      - Bug-Analyse: ${hasBugAnalysis ? "✅" : "❌"}`)
    console.log(`      - Optimierung: ${hasOptimization ? "✅" : "❌"}`)
    console.log(`      - Auto-Fix: ${hasAutoFix ? "✅" : "❌"}`)
  } else {
    results.components[promptFile] = { exists: false }
    results.errors.push(`Prompt-Datei fehlt: ${promptFile}`)
    results.success = false
    console.log(`   ❌ ${promptFile} - FEHLT`)
  }

  // 3. Prüfe Error-Logger
  console.log("\n3. Prüfe Error-Logger...")
  const errorLoggerFile = "lib/cicd/error-logger.ts"
  if (fs.existsSync(errorLoggerFile)) {
    results.components[errorLoggerFile] = { exists: true, valid: true }
    console.log(`   ✅ ${errorLoggerFile}`)
  } else {
    results.components[errorLoggerFile] = { exists: false }
    results.errors.push(`Error-Logger fehlt: ${errorLoggerFile}`)
    results.success = false
    console.log(`   ❌ ${errorLoggerFile} - FEHLT`)
  }

  // 4. Prüfe Codebase-Analyzer
  console.log("\n4. Prüfe Codebase-Analyzer...")
  const codebaseAnalyzerFile = "lib/cicd/codebase-analyzer.ts"
  if (fs.existsSync(codebaseAnalyzerFile)) {
    results.components[codebaseAnalyzerFile] = { exists: true, valid: true }
    console.log(`   ✅ ${codebaseAnalyzerFile}`)
  } else {
    results.components[codebaseAnalyzerFile] = { exists: false }
    results.errors.push(`Codebase-Analyzer fehlt: ${codebaseAnalyzerFile}`)
    results.success = false
    console.log(`   ❌ ${codebaseAnalyzerFile} - FEHLT`)
  }

  // 5. Prüfe Hugging Face Client
  console.log("\n5. Prüfe Hugging Face Client...")
  const hfClientFile = "lib/ai/huggingface.ts"
  if (fs.existsSync(hfClientFile)) {
    const content = fs.readFileSync(hfClientFile, "utf-8")
    const hasGenerate = content.includes("async generate")
    const hasRetry = content.includes("maxRetries")
    const hasFallback = content.includes("getNextModel")

    results.components[hfClientFile] = {
      exists: true,
      hasGenerate,
      hasRetry,
      hasFallback,
    }

    console.log(`   ✅ ${hfClientFile}`)
    console.log(`      - generate(): ${hasGenerate ? "✅" : "❌"}`)
    console.log(`      - Retry-Logik: ${hasRetry ? "✅" : "❌"}`)
    console.log(`      - Fallback: ${hasFallback ? "✅" : "❌"}`)
  } else {
    results.components[hfClientFile] = { exists: false }
    results.errors.push(`Hugging Face Client fehlt: ${hfClientFile}`)
    results.success = false
    console.log(`   ❌ ${hfClientFile} - FEHLT`)
  }

  // 6. Prüfe Knowledge-Base
  console.log("\n6. Prüfe Knowledge-Base...")
  const knowledgeBaseFiles = [
    "lib/knowledge-base/structure.ts",
    "lib/knowledge-base/load-with-cicd.ts",
    "lib/knowledge-base/cicd-entries.ts",
  ]

  for (const kbFile of knowledgeBaseFiles) {
    if (fs.existsSync(kbFile)) {
      results.components[kbFile] = { exists: true, valid: true }
      console.log(`   ✅ ${kbFile}`)
    } else {
      results.components[kbFile] = { exists: false }
      results.errors.push(`Knowledge-Base-Datei fehlt: ${kbFile}`)
      results.success = false
      console.log(`   ❌ ${kbFile} - FEHLT`)
    }
  }

  // 7. Prüfe Scripts
  console.log("\n7. Prüfe Scripts...")
  const scriptFiles = [
    "scripts/cicd/run-system-bot.js",
    "scripts/cicd/run-quality-bot.js",
    "scripts/cicd/run-prompt-optimization-bot.js",
    "scripts/cicd/prepare-bots.js",
    "scripts/cicd/ensure-knowledge-loaded.js",
  ]

  for (const scriptFile of scriptFiles) {
    if (fs.existsSync(scriptFile)) {
      results.components[scriptFile] = { exists: true, valid: true }
      console.log(`   ✅ ${scriptFile}`)
    } else {
      results.components[scriptFile] = { exists: false }
      results.warnings.push(`Script fehlt: ${scriptFile}`)
      console.log(`   ⚠️  ${scriptFile} - FEHLT`)
    }
  }

  // 8. Prüfe Workflows
  console.log("\n8. Prüfe Workflows...")
  const workflowFiles = [
    ".github/workflows/master-validation.yml",
    ".github/workflows/auto-fix-bugs.yml",
  ]

  for (const workflowFile of workflowFiles) {
    if (fs.existsSync(workflowFile)) {
      const content = fs.readFileSync(workflowFile, "utf-8")
      const hasBots = content.includes("prepare-bots") || content.includes("cicd:prepare-bots")
      results.components[workflowFile] = { exists: true, hasBots }
      console.log(`   ✅ ${workflowFile} ${hasBots ? "(mit Bots)" : "(ohne Bots)"}`)
    } else {
      results.components[workflowFile] = { exists: false }
      results.warnings.push(`Workflow fehlt: ${workflowFile}`)
      console.log(`   ⚠️  ${workflowFile} - FEHLT`)
    }
  }

  // 9. Zusammenfassung
  console.log("\n" + "=".repeat(60))
  console.log("📊 Validierungs-Ergebnis:")
  console.log("=".repeat(60))
  console.log(`✅ Erfolgreich: ${Object.values(results.components).filter((c) => c.exists && c.valid !== false).length}`)
  console.log(`❌ Fehler: ${results.errors.length}`)
  console.log(`⚠️  Warnungen: ${results.warnings.length}`)
  console.log(`\nGesamt-Status: ${results.success ? "✅ ERFOLGREICH" : "❌ FEHLER GEFUNDEN"}`)

  if (results.errors.length > 0) {
    console.log("\n❌ Fehler:")
    results.errors.forEach((error) => console.log(`   - ${error}`))
  }

  if (results.warnings.length > 0) {
    console.log("\n⚠️  Warnungen:")
    results.warnings.forEach((warning) => console.log(`   - ${warning}`))
  }

  return results
}

// CLI-Interface
if (require.main === module) {
  validateCompleteSystem()
    .then((results) => {
      console.log("\n" + JSON.stringify(results, null, 2))
      process.exit(results.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fehler:", error)
      process.exit(1)
    })
}

module.exports = {
  validateCompleteSystem,
}

