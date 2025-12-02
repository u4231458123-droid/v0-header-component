/**
 * OPTIMIERTE KI-MODELLE
 * =====================
 * Hochwertige, kostenfreie Modelle von Hugging Face
 * Jeder Bot hat mindestens 1, idealerweise 3 Modelle
 */

export interface ModelConfig {
  id: string
  name: string
  provider: "huggingface" | "google"
  modelId: string
  maxTokens: number
  temperature: number
  priority: number // 1 = höchste Priorität
  useCases: string[]
  strengths: string[]
  limitations: string[]
  cost: "free"
}

/**
 * Google Gemini Models
 */
export const GEMINI_MODELS: ModelConfig[] = [
  {
    id: "gemini-2.0-flash-thinking",
    name: "Gemini 2.0 Flash Thinking",
    provider: "google",
    modelId: "gemini-2.0-flash-thinking-exp-01-21",
    maxTokens: 32768,
    temperature: 0.7,
    priority: 1,
    useCases: ["complex-reasoning", "system-architecture", "master-bot-decisions", "deep-analysis"],
    strengths: ["Reasoning", "Großer Kontext", "Multimodal", "Komplexe Zusammenhänge"],
    limitations: ["Experimental"],
    cost: "free",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    modelId: "gemini-2.0-flash-001",
    maxTokens: 32768,
    temperature: 0.7,
    priority: 2,
    useCases: ["fast-chat", "summarization", "quick-generation"],
    strengths: ["Sehr schnell", "Großer Kontext", "Effizient"],
    limitations: ["Weniger Reasoning als Thinking-Modell"],
    cost: "free",
  },
]

/**
 * Code-Generation & Analysis Models
 */
export const CODE_MODELS: ModelConfig[] = [
  // Gemini als Top-Priorität für Code
  GEMINI_MODELS[0], // Flash Thinking
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "huggingface",
    modelId: "deepseek-ai/DeepSeek-V3",
    maxTokens: 4096,
    temperature: 0.3,
    priority: 1,
    useCases: ["code-analysis", "bug-fixing", "code-optimization", "refactoring"],
    strengths: ["Code-Verständnis", "Fehleranalyse", "Performance-Optimierung", "Best Practices"],
    limitations: ["Englisch bevorzugt", "Längere Kontexte können limitiert sein"],
    cost: "free",
  },
  {
    id: "starcoder2-15b",
    name: "StarCoder2 15B",
    provider: "huggingface",
    modelId: "bigcode/starcoder2-15b",
    maxTokens: 8192,
    temperature: 0.3,
    priority: 2,
    useCases: ["code-generation", "code-completion", "code-analysis"],
    strengths: ["Große Kontexte", "Multi-Language Support", "Code-Patterns"],
    limitations: ["Größeres Modell", "Längere Antwortzeiten"],
    cost: "free",
  },
  {
    id: "codellama-13b",
    name: "CodeLlama 13B",
    provider: "huggingface",
    modelId: "codellama/CodeLlama-13b-Instruct-hf",
    maxTokens: 4096,
    temperature: 0.3,
    priority: 3,
    useCases: ["code-generation", "code-explanation", "documentation"],
    strengths: ["Code-Erklärung", "Dokumentation", "Instruct-Tuning"],
    limitations: ["Kleinere Kontexte", "Weniger spezialisiert"],
    cost: "free",
  },
]

/**
 * Text-Quality & Content Models
 */
export const TEXT_MODELS: ModelConfig[] = [
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    provider: "huggingface",
    modelId: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 4096,
    temperature: 0.7,
    priority: 1,
    useCases: ["text-generation", "content-creation", "marketing-texts", "email-texts"],
    strengths: ["Natürliche Sprache", "SEO-Optimierung", "Mehrsprachig", "Kreativität"],
    limitations: ["Kleinere Kontexte", "Weniger Code-spezifisch"],
    cost: "free",
  },
  {
    id: "llama-3-8b-instruct",
    name: "Llama 3 8B Instruct",
    provider: "huggingface",
    modelId: "meta-llama/Meta-Llama-3-8B-Instruct",
    maxTokens: 8192,
    temperature: 0.7,
    priority: 2,
    useCases: ["text-generation", "content-creation", "documentation", "legal-texts"],
    strengths: ["Große Kontexte", "Präzision", "Instruct-Tuning", "Mehrsprachig"],
    limitations: ["Größeres Modell", "Längere Antwortzeiten"],
    cost: "free",
  },
  {
    id: "phi-3-mini",
    name: "Phi-3 Mini",
    provider: "huggingface",
    modelId: "microsoft/Phi-3-mini-4k-instruct",
    maxTokens: 4096,
    temperature: 0.7,
    priority: 3,
    useCases: ["text-generation", "content-creation", "quick-responses"],
    strengths: ["Schnell", "Effizient", "Klein", "Gute Qualität"],
    limitations: ["Kleinere Kontexte", "Weniger Features"],
    cost: "free",
  },
]

/**
 * Quality & Validation Models
 */
export const QUALITY_MODELS: ModelConfig[] = [
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "huggingface",
    modelId: "deepseek-ai/DeepSeek-V3",
    maxTokens: 4096,
    temperature: 0.2,
    priority: 1,
    useCases: ["quality-check", "validation", "code-review", "error-detection"],
    strengths: ["Präzision", "Fehlererkennung", "Qualitätsbewertung"],
    limitations: ["Englisch bevorzugt"],
    cost: "free",
  },
  {
    id: "llama-3-8b-instruct",
    name: "Llama 3 8B Instruct",
    provider: "huggingface",
    modelId: "meta-llama/Meta-Llama-3-8B-Instruct",
    maxTokens: 8192,
    temperature: 0.2,
    priority: 2,
    useCases: ["quality-check", "validation", "comprehensive-review"],
    strengths: ["Große Kontexte", "Präzision", "Vollständigkeit"],
    limitations: ["Größeres Modell"],
    cost: "free",
  },
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    provider: "huggingface",
    modelId: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 4096,
    temperature: 0.2,
    priority: 3,
    useCases: ["quality-check", "validation", "quick-checks"],
    strengths: ["Schnell", "Effizient", "Gute Qualität"],
    limitations: ["Kleinere Kontexte"],
    cost: "free",
  },
]

/**
 * Documentation & Research Models
 */
export const DOCUMENTATION_MODELS: ModelConfig[] = [
  {
    id: "llama-3-8b-instruct",
    name: "Llama 3 8B Instruct",
    provider: "huggingface",
    modelId: "meta-llama/Meta-Llama-3-8B-Instruct",
    maxTokens: 8192,
    temperature: 0.5,
    priority: 1,
    useCases: ["documentation", "research", "content-creation", "summarization"],
    strengths: ["Große Kontexte", "Präzision", "Vollständigkeit", "Mehrsprachig"],
    limitations: ["Größeres Modell"],
    cost: "free",
  },
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    provider: "huggingface",
    modelId: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 4096,
    temperature: 0.5,
    priority: 2,
    useCases: ["documentation", "research", "content-creation"],
    strengths: ["Natürliche Sprache", "SEO-Optimierung", "Kreativität"],
    limitations: ["Kleinere Kontexte"],
    cost: "free",
  },
  {
    id: "phi-3-mini",
    name: "Phi-3 Mini",
    provider: "huggingface",
    modelId: "microsoft/Phi-3-mini-4k-instruct",
    maxTokens: 4096,
    temperature: 0.5,
    priority: 3,
    useCases: ["documentation", "research", "quick-docs"],
    strengths: ["Schnell", "Effizient", "Gute Qualität"],
    limitations: ["Kleinere Kontexte"],
    cost: "free",
  },
]

/**
 * Legal & Compliance Models
 */
export const LEGAL_MODELS: ModelConfig[] = [
  {
    id: "llama-3-8b-instruct",
    name: "Llama 3 8B Instruct",
    provider: "huggingface",
    modelId: "meta-llama/Meta-Llama-3-8B-Instruct",
    maxTokens: 8192,
    temperature: 0.2,
    priority: 1,
    useCases: ["legal-texts", "compliance", "documentation"],
    strengths: ["Präzision", "Vollständigkeit", "Große Kontexte"],
    limitations: ["Größeres Modell"],
    cost: "free",
  },
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    provider: "huggingface",
    modelId: "mistralai/Mistral-7B-Instruct-v0.2",
    maxTokens: 4096,
    temperature: 0.2,
    priority: 2,
    useCases: ["legal-texts", "compliance", "documentation"],
    strengths: ["Natürliche Sprache", "Präzision"],
    limitations: ["Kleinere Kontexte"],
    cost: "free",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "huggingface",
    modelId: "deepseek-ai/DeepSeek-V3",
    maxTokens: 4096,
    temperature: 0.2,
    priority: 3,
    useCases: ["legal-texts", "compliance", "analysis"],
    strengths: ["Präzision", "Analyse"],
    limitations: ["Englisch bevorzugt"],
    cost: "free",
  },
]

/**
 * Bot-Modell-Zuordnung
 */
export const BOT_MODELS: Record<string, ModelConfig[]> = {
  "system-bot": CODE_MODELS,
  "code-assistant": CODE_MODELS,
  "quality-bot": QUALITY_MODELS,
  "quality-assistant": QUALITY_MODELS,
  "documentation-bot": [...DOCUMENTATION_MODELS, GEMINI_MODELS[1]], // Flash für Doku
  "documentation-assistant": [...DOCUMENTATION_MODELS, GEMINI_MODELS[1]],
  "marketing-text-bot": TEXT_MODELS,
  "marketing-text-assistant": TEXT_MODELS,
  "mailing-text-bot": TEXT_MODELS,
  "mailing-text-assistant": TEXT_MODELS,
  "legal-bot": LEGAL_MODELS,
  "legal-assistant": LEGAL_MODELS,
  "text-quality-bot": QUALITY_MODELS,
  "text-quality-assistant": QUALITY_MODELS,
  "master-bot": [GEMINI_MODELS[0], ...CODE_MODELS, ...QUALITY_MODELS], // Master-Bot nutzt primär Gemini Thinking
  "prompt-optimization-bot": [GEMINI_MODELS[0], ...CODE_MODELS, ...TEXT_MODELS], // Prompt-Opt auch mit Gemini
}

/**
 * Hole Modelle für Bot
 */
export function getModelsForBot(botName: string): ModelConfig[] {
  return BOT_MODELS[botName] || CODE_MODELS
}

/**
 * Hole primäres Modell für Bot
 */
export function getPrimaryModelForBot(botName: string): ModelConfig {
  const models = getModelsForBot(botName)
  return models[0] || CODE_MODELS[0]
}

/**
 * Hole alle Modelle für Bot (mit Fallback)
 */
export function getAllModelsForBot(botName: string): ModelConfig[] {
  const models = getModelsForBot(botName)
  // Stelle sicher, dass mindestens 1 Modell vorhanden ist
  if (models.length === 0) {
    return [CODE_MODELS[0]]
  }
  // Stelle sicher, dass idealerweise 3 Modelle vorhanden sind
  if (models.length < 3) {
    // Füge Fallback-Modelle hinzu
    const fallback = CODE_MODELS.filter((m) => !models.find((model) => model.id === m.id))
    return [...models, ...fallback.slice(0, 3 - models.length)]
  }
  return models
}

