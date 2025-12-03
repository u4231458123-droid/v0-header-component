/**
 * Bot-Export für einfache Verwendung
 * ===================================
 * Zentrale Export-Datei für alle Bots
 * VOLLSTÄNDIGE INTEGRATION ALLER BOTS
 */

export { SystemBot, type BotTask, type BotResponse } from "./system-bot"
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
 */
export async function initializeAllBots() {
  const bots: Record<string, any> = {}

  // Core Bots (verpflichtend)
  try {
    const { SystemBot } = await import("./system-bot")
    bots.systemBot = new SystemBot()
  } catch (e) {
    console.warn("SystemBot nicht verfügbar")
  }

  try {
    const { QualityBot } = await import("./quality-bot")
    bots.qualityBot = new QualityBot()
  } catch (e) {
    console.warn("QualityBot nicht verfügbar")
  }

  try {
    const { MasterBot } = await import("./master-bot")
    bots.masterBot = new MasterBot()
  } catch (e) {
    console.warn("MasterBot nicht verfügbar")
  }

  // Optional Bots
  try {
    const { DocumentationBot } = await import("./documentation-bot")
    bots.documentationBot = new DocumentationBot()
  } catch (e) {
    // Optional
  }

  try {
    const { CodeAssistant } = await import("./code-assistant")
    bots.codeAssistant = new CodeAssistant()
  } catch (e) {
    // Optional
  }

  try {
    const { ValidationCoordinator } = await import("./validation-coordinator")
    bots.validationCoordinator = new ValidationCoordinator()
  } catch (e) {
    // Optional
  }

  try {
    const { PromptOptimizationBot } = await import("./prompt-optimization-bot")
    bots.promptOptimizationBot = new PromptOptimizationBot()
  } catch (e) {
    // Optional
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

  return bots
}

