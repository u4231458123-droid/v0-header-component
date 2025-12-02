/**
 * KI-Modell-Konfigurationen für CI/CD
 * ====================================
 * Alle verfügbaren Hugging Face Modelle mit ihren Parametern
 */

export interface ModelConfig {
  id: string
  name: string
  modelId: string
  maxTokens: number
  temperature: number
  priority: number
  description: string
  useCases: string[]
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    modelId: "deepseek-ai/DeepSeek-V3",
    maxTokens: 4096,
    temperature: 0.3,
    priority: 1,
    description: "Primäres Modell für Code-Analyse und Bug-Fixes",
    useCases: ["code-analysis", "bug-fixes", "code-optimization"],
  },
  {
    id: "starcoder2-15b",
    name: "StarCoder2 15B",
    modelId: "bigcode/starcoder2-15b",
    maxTokens: 8192,
    temperature: 0.3,
    priority: 2,
    description: "Fallback-Modell mit höherem Token-Limit",
    useCases: ["code-analysis", "code-generation", "large-files"],
  },
  {
    id: "codellama-13b",
    name: "CodeLlama 13B",
    modelId: "codellama/CodeLlama-13b-Instruct-hf",
    maxTokens: 4096,
    temperature: 0.3,
    priority: 3,
    description: "Alternative Modell für Code-Analyse",
    useCases: ["code-analysis", "code-generation"],
  },
  {
    id: "wizardcoder-15b",
    name: "WizardCoder 15B",
    modelId: "WizardLM/WizardCoder-15B-V1.0",
    maxTokens: 4096,
    temperature: 0.3,
    priority: 4,
    description: "Alternative Modell für Code-Analyse",
    useCases: ["code-analysis", "code-generation"],
  },
]

/**
 * Wähle Modell basierend auf Task-Typ
 */
export function selectModelForTask(
  taskType: "code-analysis" | "bug-fix" | "optimization" | "code-generation",
  preferredModelId?: string
): ModelConfig {
  // Wenn spezifisches Modell gewünscht
  if (preferredModelId) {
    const model = MODEL_CONFIGS.find((m) => m.id === preferredModelId || m.modelId === preferredModelId)
    if (model) return model
  }

  // Wähle basierend auf Task-Typ
  switch (taskType) {
    case "code-analysis":
    case "bug-fix":
      return MODEL_CONFIGS[0] // DeepSeek V3
    case "optimization":
      return MODEL_CONFIGS[0] // DeepSeek V3
    case "code-generation":
      return MODEL_CONFIGS[1] // StarCoder2 (höheres Token-Limit)
    default:
      return MODEL_CONFIGS[0] // Default: DeepSeek V3
  }
}

/**
 * Hole Modell nach Priorität (mit Fallback)
 */
export function getModelByPriority(priority: number = 1): ModelConfig | null {
  const model = MODEL_CONFIGS.find((m) => m.priority === priority)
  return model || null
}

/**
 * Hole nächstes Modell als Fallback
 */
export function getNextModel(currentModel: ModelConfig): ModelConfig | null {
  const nextPriority = currentModel.priority + 1
  return getModelByPriority(nextPriority)
}

