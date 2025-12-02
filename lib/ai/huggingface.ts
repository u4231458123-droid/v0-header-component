/**
 * Hugging Face API Client
 * =======================
 * Vollständiger Client für Hugging Face Inference API
 * Mit Modell-Auswahl, Fallback, Rate-Limiting und Retry-Logik
 */

import { MODEL_CONFIGS, selectModelForTask, getNextModel, type ModelConfig } from "./models"

export interface HuggingFaceRequest {
  inputs: string
  parameters?: {
    max_new_tokens?: number
    temperature?: number
    top_p?: number
    return_full_text?: boolean
  }
}

export interface HuggingFaceResponse {
  generated_text: string
  error?: string
}

export interface HuggingFaceError {
  error: string
  error_type?: string
}

export class HuggingFaceClient {
  private apiKey: string
  private baseUrl = "https://api-inference.huggingface.co/models"
  private maxRetries = 3
  private retryDelay = 1000 // 1 Sekunde
  private rateLimitDelay = 5000 // 5 Sekunden bei Rate-Limit

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || ""
    if (!this.apiKey) {
      console.warn("HUGGINGFACE_API_KEY nicht gesetzt. API-Calls werden fehlschlagen.")
    }
  }

  /**
   * Führe Inference-Request aus mit automatischem Fallback
   */
  async generate(
    prompt: string,
    taskType: "code-analysis" | "bug-fix" | "optimization" | "code-generation" = "code-analysis",
    preferredModelId?: string,
    customMaxTokens?: number
  ): Promise<{ text: string; model: ModelConfig }> {
    let currentModel = selectModelForTask(taskType, preferredModelId)
    let lastError: Error | null = null

    // Versuche mit jedem Modell (mit Fallback)
    for (let attempt = 0; attempt < MODEL_CONFIGS.length; attempt++) {
      try {
        const maxTokens = customMaxTokens || currentModel.maxTokens
        const response = await this.makeRequest(currentModel.modelId, prompt, {
          max_new_tokens: Math.min(maxTokens, currentModel.maxTokens),
          temperature: currentModel.temperature,
          return_full_text: false,
        })

        // makeRequest gibt bereits einen String zurück (parsed)
        return {
          text: typeof response === "string" ? response : JSON.stringify(response),
          model: currentModel,
        }
      } catch (error: any) {
        lastError = error
        console.warn(`Modell ${currentModel.name} fehlgeschlagen:`, error.message)

        // Prüfe ob Rate-Limit
        if (error.message?.includes("rate limit") || error.status === 429) {
          console.log(`Rate-Limit erreicht. Warte ${this.rateLimitDelay}ms...`)
          await this.sleep(this.rateLimitDelay)
          // Versuche nochmal mit gleichem Modell
          continue
        }

        // Hole nächstes Modell als Fallback
        const nextModel = getNextModel(currentModel)
        if (nextModel) {
          currentModel = nextModel
          console.log(`Wechsle zu Fallback-Modell: ${currentModel.name}`)
        } else {
          // Kein weiteres Modell verfügbar
          break
        }
      }
    }

    // Alle Modelle fehlgeschlagen
    throw new Error(
      `Alle Modelle fehlgeschlagen. Letzter Fehler: ${lastError?.message || "Unbekannter Fehler"}`
    )
  }

  /**
   * Mache API-Request mit Retry-Logik
   */
  private async makeRequest(
    modelId: string,
    prompt: string,
    parameters: HuggingFaceRequest["parameters"] = {}
  ): Promise<string> {
    const url = `${this.baseUrl}/${modelId}`
    const requestBody: HuggingFaceRequest = {
      inputs: prompt,
      parameters,
    }

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          // Rate-Limit
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After")
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.rateLimitDelay
            console.warn(`Rate-Limit. Warte ${delay}ms...`)
            await this.sleep(delay)
            continue
          }

          // Model lädt noch
          if (response.status === 503) {
            const errorData = (await response.json()) as HuggingFaceError
            if (errorData.error?.includes("loading")) {
              const estimatedTime = this.extractEstimatedTime(errorData.error)
              console.warn(`Modell lädt noch. Warte ${estimatedTime}ms...`)
              await this.sleep(estimatedTime)
              continue
            }
          }

          const errorData = (await response.json()) as HuggingFaceError
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        // Handle verschiedene Response-Formate
        if (Array.isArray(data)) {
          // Array-Format: [{ generated_text: "..." }]
          if (data[0]?.generated_text) {
            return data[0].generated_text
          }
          // Array-Format: ["..."]
          if (typeof data[0] === "string") {
            return data[0]
          }
        }
        
        if (typeof data === "string") {
          return data
        }
        
        if (data.generated_text) {
          return data.generated_text
        }
        
        // Versuche andere mögliche Felder
        if (data.text) {
          return data.text
        }
        
        if (data.output) {
          return Array.isArray(data.output) ? data.output.join("\n") : data.output
        }

        // Fallback: JSON.stringify für Debugging
        console.warn("Unerwartetes Response-Format:", JSON.stringify(data).substring(0, 200))
        throw new Error(`Unerwartetes Response-Format: ${JSON.stringify(data).substring(0, 100)}`)
      } catch (error: any) {
        // Bei letztem Versuch, Fehler werfen
        if (attempt === this.maxRetries - 1) {
          throw error
        }

        // Exponential Backoff
        const delay = this.retryDelay * Math.pow(2, attempt)
        console.warn(`Request fehlgeschlagen. Retry in ${delay}ms... (Versuch ${attempt + 1}/${this.maxRetries})`)
        await this.sleep(delay)
      }
    }

    throw new Error("Max Retries erreicht")
  }

  /**
   * Batch-Verarbeitung für mehrere Dateien (5 parallel)
   */
  async generateBatch(
    prompts: string[],
    taskType: "code-analysis" | "bug-fix" | "optimization" | "code-generation" = "code-analysis",
    batchSize: number = 5
  ): Promise<Array<{ text: string; model: ModelConfig; index: number }>> {
    const results: Array<{ text: string; model: ModelConfig; index: number }> = []
    const errors: Array<{ index: number; error: Error }> = []

    // Verarbeite in Batches
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize)
      const batchPromises = batch.map(async (prompt, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          const result = await this.generate(prompt, taskType)
          return { ...result, index: globalIndex }
        } catch (error: any) {
          errors.push({ index: globalIndex, error })
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter((r): r is NonNullable<typeof r> => r !== null))

      // Kurze Pause zwischen Batches (Rate-Limiting)
      if (i + batchSize < prompts.length) {
        await this.sleep(1000)
      }
    }

    if (errors.length > 0) {
      console.warn(`${errors.length} Fehler bei Batch-Verarbeitung:`, errors)
    }

    return results
  }

  /**
   * Extrahiere geschätzte Wartezeit aus Error-Message
   */
  private extractEstimatedTime(errorMessage: string): number {
    const match = errorMessage.match(/(\d+)\s*second/i)
    if (match) {
      return parseInt(match[1]) * 1000
    }
    return 10000 // Default: 10 Sekunden
  }

  /**
   * Sleep-Hilfsfunktion
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Prüfe ob API-Key gesetzt ist
   */
  hasApiKey(): boolean {
    return !!this.apiKey
  }
}

/**
 * Singleton-Instanz für einfache Verwendung
 */
let clientInstance: HuggingFaceClient | null = null

export function getHuggingFaceClient(apiKey?: string): HuggingFaceClient {
  if (!clientInstance) {
    clientInstance = new HuggingFaceClient(apiKey)
  }
  return clientInstance
}

