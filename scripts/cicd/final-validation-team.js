/**
 * FINALE VALIDIERUNG DURCH GESAMTES AI-TEAM
 * ==========================================
 * Alle Bots validieren MyDispatch für Livebetrieb
 * Vollständige Abnahme und Bestätigung
 */

const fs = require("fs")
const path = require("path")

/**
 * Lade alle verfügbaren Bots
 */
async function loadAllBots() {
  const bots = {}
  const errors = []
  const warnings = []

  const botModules = [
    { name: "MasterBot", path: "../../lib/ai/bots/master-bot", required: true },
    { name: "QualityBot", path: "../../lib/ai/bots/quality-bot", required: true },
    { name: "SystemBot", path: "../../lib/ai/bots/system-bot", required: true },
    { name: "DocumentationBot", path: "../../lib/ai/bots/documentation-bot", required: false },
    { name: "CodeAssistant", path: "../../lib/ai/bots/code-assistant", required: false },
    { name: "ValidationCoordinator", path: "../../lib/ai/bots/validation-coordinator", required: true },
    { name: "AutoQualityChecker", path: "../../lib/ai/bots/auto-quality-checker-wrapper", required: false },
    { name: "PromptOptimizationBot", path: "../../lib/ai/bots/prompt-optimization-bot", required: false },
    { name: "LegalBot", path: "../../lib/ai/bots/legal-bot", required: false },
    { name: "MarketingTextBot", path: "../../lib/ai/bots/marketing-text-bot", required: false },
    { name: "MailingTextBot", path: "../../lib/ai/bots/mailing-text-bot", required: false },
    { name: "TextQualityBot", path: "../../lib/ai/bots/text-quality-bot", required: false },
  ]

  for (const moduleInfo of botModules) {
    try {
      const BotClass = require(moduleInfo.path)[moduleInfo.name]
      if (BotClass) {
        bots[moduleInfo.name.toLowerCase()] = new BotClass()
        console.log(`✅ ${moduleInfo.name} geladen`)
      }
    } catch (error) {
      if (moduleInfo.required) {
        errors.push(`${moduleInfo.name}: ${error.message}`)
        console.error(`❌ ${moduleInfo.name} ist verpflichtend und konnte nicht geladen werden`)
      } else {
        warnings.push(`${moduleInfo.name}: ${error.message}`)
        console.warn(`⚠️  ${moduleInfo.name} nicht verfügbar (optional)`)
      }
    }
  }

  return { bots, errors, warnings }
}

/**
 * Finale Validierung durch alle Bots
 */
async function finalValidation() {
  console.log("\n" + "=".repeat(70))
  console.log("🎯 FINALE VALIDIERUNG - GESAMTES AI-TEAM")
  console.log("=".repeat(70))

  const { bots, errors, warnings } = await loadAllBots()

  if (errors.length > 0) {
    console.error("\n❌ Kritische Fehler beim Laden der Bots:")
    errors.forEach((err) => console.error(`   - ${err}`))
    return { success: false, errors }
  }

  const validationResults = {
    masterBot: { passed: false, message: "" },
    qualityBot: { passed: false, violations: [] },
    systemBot: { passed: false, issues: [] },
    validationCoordinator: { passed: false, checks: [] },
    overall: { passed: false, summary: "" },
  }

  // 1. MasterBot: Finale Entscheidung
  console.log("\n--- PHASE 1: MasterBot - Finale Entscheidung ---")
  if (bots.masterbot) {
    try {
      const decision = await bots.masterbot.coordinateTask({
        id: "final-validation",
        type: "final-approval",
        description: "Finale Abnahme von MyDispatch für Livebetrieb",
      })
      validationResults.masterBot = {
        passed: decision.decision?.includes("genehmigt") || decision.decision?.includes("approved"),
        message: decision.decision || "Keine Entscheidung",
      }
      console.log(`✅ MasterBot: ${validationResults.masterBot.passed ? "GENEHMIGT" : "NICHT GENEHMIGT"}`)
    } catch (error) {
      console.error(`❌ MasterBot Fehler: ${error.message}`)
      validationResults.masterBot.message = error.message
    }
  }

  // 2. QualityBot: Code-Qualität
  console.log("\n--- PHASE 2: QualityBot - Code-Qualität ---")
  if (bots.qualitybot) {
    try {
      // Prüfe kritische Dateien
      const criticalFiles = [
        "app/dashboard/page.tsx",
        "app/einstellungen/page.tsx",
        "components/settings/SettingsPageClient.tsx",
        "lib/email/email-service.ts",
      ]

      let allPassed = true
      const allViolations = []

      for (const file of criticalFiles) {
        const filePath = path.join(process.cwd(), file)
        if (fs.existsSync(filePath)) {
          const code = fs.readFileSync(filePath, "utf-8")
          const result = await bots.qualitybot.checkCodeAgainstDocumentation(code, {}, filePath)
          if (!result.passed) {
            allPassed = false
            allViolations.push(...result.violations)
          }
        }
      }

      validationResults.qualityBot = {
        passed: allPassed,
        violations: allViolations,
      }
      console.log(`✅ QualityBot: ${allPassed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
      if (!allPassed) {
        console.log(`   ${allViolations.length} Violations gefunden`)
      }
    } catch (error) {
      console.error(`❌ QualityBot Fehler: ${error.message}`)
      validationResults.qualityBot.violations = [error.message]
    }
  }

  // 3. SystemBot: Systemweite Analyse
  console.log("\n--- PHASE 3: SystemBot - Systemweite Analyse ---")
  if (bots.systembot) {
    try {
      const analysis = await bots.systembot.execute({
        id: "final-system-analysis",
        type: "system-analysis",
        description: "Finale systemweite Analyse für Livebetrieb",
      })
      validationResults.systemBot = {
        passed: analysis.passed !== false,
        issues: analysis.errors || [],
      }
      console.log(`✅ SystemBot: ${validationResults.systemBot.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
    } catch (error) {
      console.error(`❌ SystemBot Fehler: ${error.message}`)
      validationResults.systemBot.issues = [error.message]
    }
  }

  // 4. ValidationCoordinator: Finale Validierung
  console.log("\n--- PHASE 4: ValidationCoordinator - Finale Validierung ---")
  if (bots.validationcoordinator) {
    try {
      const validation = await bots.validationcoordinator.coordinateValidation({
        id: "final-coordination",
        type: "final-check",
        description: "Finale Koordination der Validierung",
      })
      validationResults.validationCoordinator = {
        passed: validation.passed !== false,
        checks: validation.violations || [],
      }
      console.log(`✅ ValidationCoordinator: ${validationResults.validationCoordinator.passed ? "BESTANDEN" : "FEHLGESCHLAGEN"}`)
    } catch (error) {
      console.error(`❌ ValidationCoordinator Fehler: ${error.message}`)
      validationResults.validationCoordinator.checks = [error.message]
    }
  }

  // 5. Gesamtbewertung
  console.log("\n" + "=".repeat(70))
  console.log("📊 GESAMTBEWERTUNG")
  console.log("=".repeat(70))

  const allPassed =
    validationResults.masterBot.passed &&
    validationResults.qualityBot.passed &&
    validationResults.systemBot.passed &&
    validationResults.validationCoordinator.passed

  validationResults.overall = {
    passed: allPassed,
    summary: allPassed
      ? "✅ MyDispatch ist bereit für den Livebetrieb!"
      : "❌ MyDispatch ist noch nicht bereit für den Livebetrieb.",
  }

  console.log(`\n${validationResults.overall.summary}`)
  console.log("\nDetails:")
  console.log(`- MasterBot: ${validationResults.masterBot.passed ? "✅" : "❌"} ${validationResults.masterBot.message}`)
  console.log(`- QualityBot: ${validationResults.qualityBot.passed ? "✅" : "❌"} ${validationResults.qualityBot.violations.length} Violations`)
  console.log(`- SystemBot: ${validationResults.systemBot.passed ? "✅" : "❌"} ${validationResults.systemBot.issues.length} Issues`)
  console.log(`- ValidationCoordinator: ${validationResults.validationCoordinator.passed ? "✅" : "❌"} ${validationResults.validationCoordinator.checks.length} Checks`)

  // Dokumentiere Ergebnisse
  const docPath = path.join(process.cwd(), "docs", "FINAL_VALIDATION_TEAM.md")
  const docContent = `# Finale Validierung durch AI-Team

**Datum**: ${new Date().toISOString()}
**Status**: ${allPassed ? "✅ BESTANDEN" : "❌ FEHLGESCHLAGEN"}

## Ergebnisse

### MasterBot
- **Status**: ${validationResults.masterBot.passed ? "✅ GENEHMIGT" : "❌ NICHT GENEHMIGT"}
- **Nachricht**: ${validationResults.masterBot.message}

### QualityBot
- **Status**: ${validationResults.qualityBot.passed ? "✅ BESTANDEN" : "❌ FEHLGESCHLAGEN"}
- **Violations**: ${validationResults.qualityBot.violations.length}

### SystemBot
- **Status**: ${validationResults.systemBot.passed ? "✅ BESTANDEN" : "❌ FEHLGESCHLAGEN"}
- **Issues**: ${validationResults.systemBot.issues.length}

### ValidationCoordinator
- **Status**: ${validationResults.validationCoordinator.passed ? "✅ BESTANDEN" : "❌ FEHLGESCHLAGEN"}
- **Checks**: ${validationResults.validationCoordinator.checks.length}

## Gesamtbewertung

${validationResults.overall.summary}

---

*Automatisch generiert vom AI-Team*
`

  fs.writeFileSync(docPath, docContent, "utf-8")
  console.log(`\n📝 Dokumentation erstellt: ${docPath}`)

  return validationResults
}

// CLI-Interface
if (require.main === module) {
  finalValidation()
    .then((results) => {
      if (results.overall.passed) {
        console.log("\n✅ MyDispatch ist bereit für den Livebetrieb!")
        process.exit(0)
      } else {
        console.log("\n❌ MyDispatch ist noch nicht bereit für den Livebetrieb.")
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("\n❌ Fehler bei der Validierung:", error)
      process.exit(1)
    })
}

module.exports = { finalValidation, loadAllBots }

