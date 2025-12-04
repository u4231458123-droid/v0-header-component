/**
 * Bot-Export für einfache Verwendung
 * ===================================
 * Zentrale Export-Datei für alle Bots
 * VOLLSTÄNDIGE INTEGRATION ALLER BOTS
 */

export { SystemBot } from "./system-bot"
export { type BotTask, type BotResponse } from "./base-bot"
export { QualityBot } from "./quality-bot"
export { PromptOptimizationBot, type PromptOptimization } from "./prompt-optimization-bot"
export { MasterBot } from "./master-bot"
export { DocumentationBot } from "./documentation-bot"
export { CodeAssistant } from "./code-assistant"
export { ValidationCoordinator } from "./validation-coordinator"
export { LegalBot } from "./legal-bot"
export { MarketingTextBot } from "./marketing-text-bot"
export { MailingTextBot } from "./mailing-text-bot"
export { TextQualityBot } from "./text-quality-bot"
export { DocumentationAssistant } from "./documentation-assistant"
export { QualityAssistant } from "./quality-assistant"
export { LegalAssistant } from "./legal-assistant"
export { MarketingTextAssistant } from "./marketing-text-assistant"
export { MailingTextAssistant } from "./mailing-text-assistant"
export { TextQualityAssistant } from "./text-quality-assistant"
export { autonomousWorkflow } from "./autonomous-workflow"

/**
 * Initialisiere alle Bots (VOLLSTÄNDIG)
 * Core-Bots sind VERPFLICHTEND und müssen verfügbar sein
 */
export async function initializeAllBots() {
  const bots: Record<string, any> = {}
  const errors: string[] = []

  // Core Bots (VERPFLICHTEND - Teil des AI-Teams)
  try {
    const { SystemBot } = await import("./system-bot")
    bots.systemBot = new SystemBot()
    // Health-Check
    if (!bots.systemBot) {
      throw new Error("SystemBot konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `SystemBot ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { SystemBot } = await import("./system-bot")
      bots.systemBot = new SystemBot()
    } catch (retryError: any) {
      throw new Error(`SystemBot ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  try {
    const { QualityBot } = await import("./quality-bot")
    bots.qualityBot = new QualityBot()
    if (!bots.qualityBot) {
      throw new Error("QualityBot konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `QualityBot ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { QualityBot } = await import("./quality-bot")
      bots.qualityBot = new QualityBot()
    } catch (retryError: any) {
      throw new Error(`QualityBot ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  try {
    const { MasterBot } = await import("./master-bot")
    bots.masterBot = new MasterBot()
    if (!bots.masterBot) {
      throw new Error("MasterBot konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `MasterBot ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { MasterBot } = await import("./master-bot")
      bots.masterBot = new MasterBot()
    } catch (retryError: any) {
      throw new Error(`MasterBot ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  // Erweiterte Bots (VERPFLICHTEND für vollständige AI-Team-Arbeit)
  try {
    const { DocumentationBot } = await import("./documentation-bot")
    bots.documentationBot = new DocumentationBot()
    if (!bots.documentationBot) {
      throw new Error("DocumentationBot konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `DocumentationBot ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { DocumentationBot } = await import("./documentation-bot")
      bots.documentationBot = new DocumentationBot()
    } catch (retryError: any) {
      throw new Error(`DocumentationBot ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  try {
    const { CodeAssistant } = await import("./code-assistant")
    bots.codeAssistant = new CodeAssistant()
    if (!bots.codeAssistant) {
      throw new Error("CodeAssistant konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `CodeAssistant ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { CodeAssistant } = await import("./code-assistant")
      bots.codeAssistant = new CodeAssistant()
    } catch (retryError: any) {
      throw new Error(`CodeAssistant ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  try {
    const { ValidationCoordinator } = await import("./validation-coordinator")
    bots.validationCoordinator = new ValidationCoordinator()
    if (!bots.validationCoordinator) {
      throw new Error("ValidationCoordinator konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `ValidationCoordinator ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { ValidationCoordinator } = await import("./validation-coordinator")
      bots.validationCoordinator = new ValidationCoordinator()
    } catch (retryError: any) {
      throw new Error(`ValidationCoordinator ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  try {
    const { PromptOptimizationBot } = await import("./prompt-optimization-bot")
    bots.promptOptimizationBot = new PromptOptimizationBot()
    if (!bots.promptOptimizationBot) {
      throw new Error("PromptOptimizationBot konnte nicht initialisiert werden")
    }
  } catch (e: any) {
    const errorMsg = `PromptOptimizationBot ist VERPFLICHTEND: ${e.message || e}`
    console.error(`❌ ${errorMsg}`)
    errors.push(errorMsg)
    // Retry-Versuch
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { PromptOptimizationBot } = await import("./prompt-optimization-bot")
      bots.promptOptimizationBot = new PromptOptimizationBot()
    } catch (retryError: any) {
      throw new Error(`PromptOptimizationBot ist verpflichtend und muss verfügbar sein: ${retryError.message || retryError}`)
    }
  }

  // Text Bots
  try {
    const { LegalBot } = await import("./legal-bot")
    bots.legalBot = new LegalBot()
  } catch (e) {
    // Optional
  }

  try {
    const { MarketingTextBot } = await import("./marketing-text-bot")
    bots.marketingTextBot = new MarketingTextBot()
  } catch (e) {
    // Optional
  }

  try {
    const { MailingTextBot } = await import("./mailing-text-bot")
    bots.mailingTextBot = new MailingTextBot()
  } catch (e) {
    // Optional
  }

  try {
    const { TextQualityBot } = await import("./text-quality-bot")
    bots.textQualityBot = new TextQualityBot()
  } catch (e) {
    // Optional
  }

  // Prüfe ob alle verpflichtenden Bots geladen wurden
  const requiredBots = ["systemBot", "qualityBot", "masterBot", "documentationBot", "codeAssistant", "validationCoordinator", "promptOptimizationBot"]
  const missingBots = requiredBots.filter((botName) => !bots[botName])

  if (missingBots.length > 0) {
    throw new Error(`Verpflichtende Bots fehlen: ${missingBots.join(", ")}. Alle Bots müssen verfügbar sein für AI-Team-Arbeit.`)
  }

  if (errors.length > 0) {
    console.warn(`⚠️  ${errors.length} Bot-Initialisierungs-Fehler wurden behoben`)
  }

  console.log(`✅ ${Object.keys(bots).length} Bots erfolgreich initialisiert`)

  return bots
}



