/**
 * Bot-Export für einfache Verwendung
 * ===================================
 * Zentrale Export-Datei für alle Bots
 */

export { SystemBot, type BotTask, type BotResponse } from "./system-bot"
export { QualityBot } from "./quality-bot"
export { PromptOptimizationBot, type PromptOptimization } from "./prompt-optimization-bot"

/**
 * Initialisiere alle Bots
 */
export async function initializeAllBots() {
  const { SystemBot } = await import("./system-bot")
  const { QualityBot } = await import("./quality-bot")
  const { PromptOptimizationBot } = await import("./prompt-optimization-bot")

  return {
    systemBot: new SystemBot(),
    qualityBot: new QualityBot(),
    promptOptimizationBot: new PromptOptimizationBot(),
  }
}

