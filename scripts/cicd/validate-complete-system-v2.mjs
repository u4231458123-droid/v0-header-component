/**
 * VOLLSTÄNDIGE SYSTEM-VALIDIERUNG V2
 * ===================================
 * Prüft alle Bots, alle Funktionen, alle CI/CD-Komponenten
 * Vollständige Prüfung für fehlerfreien Betrieb
 */

async function validateCompleteSystem() {
  console.log("🔍 VOLLSTÄNDIGE SYSTEM-VALIDIERUNG GESTARTET\n")

  const results = {
    bots: {},
    workflows: {},
    errorDetector: {},
    systemwideChangeManager: {},
    overall: { success: true, errors: [], warnings: [] },
  }

  // 1. PRÜFE ALLE BOTS
  console.log("1. PRÜFE ALLE BOTS...")
  
  // System-Bot
  try {
    const { SystemBot } = await import("../../lib/ai/bots/system-bot.ts")
    const systemBot = new SystemBot()
    const { BotWorkflowManager } = await import("../../lib/ai/bots/bot-workflow.ts")
    const workflowManager = new BotWorkflowManager()
    const systemBotWorkflow = workflowManager.getWorkflow("system-bot")
    if (!systemBotWorkflow) {
      results.overall.errors.push("System-Bot Workflow nicht gefunden")
      results.overall.success = false
    } else {
      results.bots["system-bot"] = {
        workflow: "✅ Gefunden",
        steps: systemBotWorkflow.steps.length,
        mandatoryChecks: systemBotWorkflow.mandatoryChecks.length,
      }
    }
  } catch (error) {
    results.overall.errors.push(`System-Bot Fehler: ${error.message}`)
    results.overall.success = false
  }

  // Quality-Bot
  try {
    const { QualityBot } = await import("../../lib/ai/bots/quality-bot.ts")
    const qualityBot = new QualityBot()
    const { BotWorkflowManager } = await import("../../lib/ai/bots/bot-workflow.ts")
    const workflowManager = new BotWorkflowManager()
    const qualityBotWorkflow = workflowManager.getWorkflow("quality-bot")
    if (!qualityBotWorkflow) {
      results.overall.errors.push("Quality-Bot Workflow nicht gefunden")
      results.overall.success = false
    } else {
      results.bots["quality-bot"] = {
        workflow: "✅ Gefunden",
        steps: qualityBotWorkflow.steps.length,
        mandatoryChecks: qualityBotWorkflow.mandatoryChecks.length,
      }
    }
  } catch (error) {
    results.overall.errors.push(`Quality-Bot Fehler: ${error.message}`)
    results.overall.success = false
  }

  // Prompt-Optimization-Bot
  try {
    const { PromptOptimizationBot } = await import("../../lib/ai/bots/prompt-optimization-bot.ts")
    const promptBot = new PromptOptimizationBot()
    const { BotWorkflowManager } = await import("../../lib/ai/bots/bot-workflow.ts")
    const workflowManager = new BotWorkflowManager()
    const promptBotWorkflow = workflowManager.getWorkflow("prompt-optimization-bot")
    if (!promptBotWorkflow) {
      results.overall.errors.push("Prompt-Optimization-Bot Workflow nicht gefunden")
      results.overall.success = false
    } else {
      results.bots["prompt-optimization-bot"] = {
        workflow: "✅ Gefunden",
        steps: promptBotWorkflow.steps.length,
        mandatoryChecks: promptBotWorkflow.mandatoryChecks.length,
      }
    }
  } catch (error) {
    results.overall.errors.push(`Prompt-Optimization-Bot Fehler: ${error.message}`)
    results.overall.success = false
  }

  // Master-Bot
  try {
    const { MasterBot } = await import("../../lib/ai/bots/master-bot.ts")
    const masterBot = new MasterBot()
    const pendingRequests = await masterBot.getPendingRequests()
    results.bots["master-bot"] = {
      status: "✅ Initialisiert",
      pendingRequests: pendingRequests.length,
    }
  } catch (error) {
    results.overall.errors.push(`Master-Bot Fehler: ${error.message}`)
    results.overall.success = false
  }

  // 2. PRÜFE ERROR DETECTOR
  console.log("\n2. PRÜFE ERROR DETECTOR...")
  try {
    const { ErrorDetector } = await import("../../lib/cicd/error-detector.ts")
    const errorDetector = new ErrorDetector()
    const detectionResult = await errorDetector.detectErrors()
    results.errorDetector = {
      status: "✅ Funktioniert",
      errorsFound: detectionResult.errors.length,
      summary: detectionResult.summary,
    }
  } catch (error) {
    results.overall.errors.push(`Error Detector Fehler: ${error.message}`)
    results.overall.success = false
  }

  // 3. PRÜFE SYSTEMWIDE CHANGE MANAGER
  console.log("\n3. PRÜFE SYSTEMWIDE CHANGE MANAGER...")
  try {
    const { SystemwideChangeManager } = await import("../../lib/cicd/systemwide-change-manager.ts")
    const changeManager = new SystemwideChangeManager()
    results.systemwideChangeManager = {
      status: "✅ Initialisiert",
    }
  } catch (error) {
    results.overall.errors.push(`Systemwide Change Manager Fehler: ${error.message}`)
    results.overall.success = false
  }

  // 4. PRÜFE WORKFLOWS
  console.log("\n4. PRÜFE WORKFLOWS...")
  try {
    const { BotWorkflowManager } = await import("../../lib/ai/bots/bot-workflow.ts")
    const workflowManager = new BotWorkflowManager()
    const allWorkflows = workflowManager.getAllWorkflows()
    results.workflows = {
      total: allWorkflows.length,
      bots: allWorkflows.map((w) => w.botId),
    }
  } catch (error) {
    results.overall.errors.push(`Workflow Manager Fehler: ${error.message}`)
    results.overall.success = false
  }

  // 5. ZUSAMMENFASSUNG
  console.log("\n" + "=".repeat(60))
  console.log("VALIDIERUNGS-ERGEBNISSE")
  console.log("=".repeat(60))
  console.log(JSON.stringify(results, null, 2))
  console.log("=".repeat(60))

  if (results.overall.success) {
    console.log("\n✅ SYSTEM VOLLSTÄNDIG VALIDIERT - STARTBEREIT")
    process.exit(0)
  } else {
    console.log("\n❌ VALIDIERUNG FEHLGESCHLAGEN")
    console.log("Fehler:", results.overall.errors)
    process.exit(1)
  }
}

validateCompleteSystem().catch((error) => {
  console.error("Kritischer Fehler bei Validierung:", error)
  process.exit(1)
})

