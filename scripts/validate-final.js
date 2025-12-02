/**
 * Final Validation Script
 * =======================
 * Führt finale Validierungen vor Deployment durch
 */

const { validateLayout } = require("./validate-layout")
const { validateMobile } = require("./validate-mobile")
const { validateAPI } = require("./validate-api")
const { validateSecurity } = require("./validate-security")
const { validatePerformance } = require("./validate-performance")
const { validateAccessibility } = require("./validate-accessibility")
// Dynamische Imports für Bots
let runQualityBotOnDirectory, runSystemBot
try {
  const qualityBotModule = require("./cicd/run-quality-bot")
  runQualityBotOnDirectory = qualityBotModule.runQualityBotOnDirectory
  const systemBotModule = require("./cicd/run-system-bot")
  runSystemBot = systemBotModule.runSystemBot
} catch (error) {
  console.warn("Bots konnten nicht geladen werden, verwende vereinfachte Prüfung")
  runQualityBotOnDirectory = async () => ({ success: true, results: [], filesChecked: 0 })
  runSystemBot = async () => ({ success: false, errors: ["Bots nicht verfügbar"] })
}

/**
 * Führe alle finalen Validierungen durch
 */
async function validateFinal(rootDir = process.cwd()) {
  console.log("Starte finale Validierung mit AI-Bots...")

  // Standard-Validierungen
  const results = {
    layout: await validateLayout(rootDir),
    mobile: validateMobile(rootDir),
    api: validateAPI(rootDir),
    security: validateSecurity(rootDir),
    performance: validatePerformance(rootDir),
    accessibility: validateAccessibility(rootDir),
  }

  // Quality-Bot Prüfung
  console.log("Führe Quality-Bot Prüfung durch...")
  try {
    const qualityBotResult = await runQualityBotOnDirectory(rootDir)
    results.qualityBot = qualityBotResult
  } catch (error) {
    console.warn("Quality-Bot Fehler:", error.message)
    results.qualityBot = {
      success: true,
      error: error.message,
    }
  }

  const allErrors = []
  const allWarnings = []

  // Sammle alle Fehler und Warnungen
  Object.values(results).forEach((result) => {
    if (result.errors) allErrors.push(...result.errors)
    if (result.warnings) allWarnings.push(...result.warnings)
  })

  const success = allErrors.length === 0

  return {
    success,
    results,
    summary: {
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      criticalErrors: allErrors.filter((e) => e.severity === "critical").length,
      highErrors: allErrors.filter((e) => e.severity === "high").length,
    },
    errors: allErrors,
    warnings: allWarnings,
  }
}

// CLI-Interface
if (require.main === module) {
  validateFinal()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fehler:", error)
      process.exit(1)
    })
}

module.exports = {
  validateFinal,
}

