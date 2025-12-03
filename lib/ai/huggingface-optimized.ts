/**
 * OPTIMIERTER HUGGING FACE CLIENT
 * ===============================
 * Unterstützt mehrere Modelle pro Bot mit Fallback
 */

import { getAllModelsForBot, getPrimaryModelForBot, type ModelConfig } from "./models-optimized"
import { getHuggingFaceMCPClient } from "./bots/huggingface-mcp"

export interface HuggingFaceResponse {
  text: string
  model: string
  tokens?: number
}

export interface HuggingFaceRequest {
  prompt: string
  model: ModelConfig
  taskType: string
}

/**
 * Optimierter Hugging Face Client mit Multi-Model-Support
 */
export class OptimizedHuggingFaceClient {
  private apiKey: string
  private geminiApiKey: string
  private baseUrl: string = "https://api-inference.huggingface.co/models"
  private geminiBaseUrl: string = "https://generativelanguage.googleapis.com/v1beta/models"

  constructor(apiKey?: string, geminiApiKey?: string) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || ""
    this.geminiApiKey = geminiApiKey || process.env.GEMINI_API_KEY || ""
    
    if (!this.apiKey) {
      console.warn("⚠️ HUGGINGFACE_API_KEY nicht gesetzt")
    }
    if (!this.geminiApiKey) {
      console.warn("⚠️ GEMINI_API_KEY nicht gesetzt")
    }
  }

  /**
   * Generiere mit Bot-spezifischen Modellen (mit Fallback)
   * Versucht zuerst MCP, dann normale API
   */
  async generateForBot(
    botName: string,
    prompt: string,
    taskType: string
  ): Promise<HuggingFaceResponse> {
    const models = getAllModelsForBot(botName)
    
    // Versuche zuerst MCP (wenn verfügbar)
    try {
      const mcpClient = getHuggingFaceMCPClient()
      if (mcpClient.hasAuth()) {
        const serverCheck = await mcpClient.checkMCPServer()
        if (serverCheck.available) {
          // Versuche mit primärem Modell über MCP
          const primaryModel = models[0]
          if (primaryModel && primaryModel.provider !== "google") {
            console.log(`🔌 Versuche MCP mit Modell: ${primaryModel.name}`)
            const mcpResponse = await mcpClient.generate(
              primaryModel.modelId,
              prompt,
              {
                max_new_tokens: primaryModel.maxTokens,
                temperature: primaryModel.temperature,
                return_full_text: false,
              }
            )
            
            if (mcpResponse.generated_text && !mcpResponse.error) {
              console.log(`✅ Erfolg mit MCP: ${primaryModel.name}`)
              return {
                text: mcpResponse.generated_text,
                model: primaryModel.modelId,
                tokens: mcpResponse.generated_text.length / 4,
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.warn(`⚠️ MCP fehlgeschlagen, Fallback zu normaler API: ${error.message}`)
    }
    
    // Fallback: Versuche mit jedem Modell über normale API (in Prioritäts-Reihenfolge)
    for (const model of models) {
      try {
        console.log(`🤖 Versuche Modell: ${model.name} (${model.modelId})`)
        const response = await this.generateWithModel(prompt, model, taskType)
        console.log(`✅ Erfolg mit Modell: ${model.name}`)
        return response
      } catch (error: any) {
        console.warn(`⚠️ Modell ${model.name} fehlgeschlagen: ${error.message}`)
        // Versuche nächstes Modell
        continue
      }
    }

    // Wenn alle Modelle fehlgeschlagen sind
    throw new Error(`Alle Modelle für ${botName} fehlgeschlagen`)
  }

  /**
   * Generiere mit spezifischem Modell
   */
  private async generateWithModel(
    prompt: string,
    model: ModelConfig,
    taskType: string
  ): Promise<HuggingFaceResponse> {
    // Unterscheide nach Provider
    if (model.provider === "google") {
      return this.generateWithGemini(prompt, model, taskType)
    }

    const url = `${this.baseUrl}/${model.modelId}`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: model.maxTokens,
          temperature: model.temperature,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      // Wenn Modell noch lädt, warte und versuche erneut
      if (response.status === 503) {
        const retryAfter = response.headers.get("Retry-After")
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000
        console.log(`⏳ Modell lädt, warte ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        return this.generateWithModel(prompt, model, taskType)
      }
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    
    // Parse Response (unterschiedliche Formate möglich)
    let text = ""
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text
    } else if (data.generated_text) {
      text = data.generated_text
    } else if (typeof data === "string") {
      text = data
    } else {
      text = JSON.stringify(data)
    }

    // Entferne Prompt aus Antwort falls vorhanden
    if (text.startsWith(prompt)) {
      text = text.substring(prompt.length).trim()
    }

    return {
      text,
      model: model.modelId,
      tokens: text.length / 4, // Geschätzte Token-Anzahl
    }
  }

  /**
   * Generiere mit Google Gemini API
   */
  private async generateWithGemini(
    prompt: string,
    model: ModelConfig,
    taskType: string
  ): Promise<HuggingFaceResponse> {
    if (!this.geminiApiKey) {
      throw new Error("GEMINI_API_KEY ist nicht gesetzt")
    }

    const url = `${this.geminiBaseUrl}/${model.modelId}:generateContent?key=${this.geminiApiKey}`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: model.temperature,
          maxOutputTokens: model.maxTokens,
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // Prüfe auf Rate Limit
      if (response.status === 429) {
        console.log(`⏳ Gemini Rate Limit, warte 5s...`)
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return this.generateWithGemini(prompt, model, taskType)
      }
      throw new Error(`Gemini API Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // Parse Gemini Response
    let text = ""
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      text = data.candidates[0].content.parts[0].text
    } else {
      text = JSON.stringify(data)
    }

    return {
      text,
      model: model.modelId,
      tokens: text.length / 4, // Geschätzt
    }
  }

  /**
   * Batch-Generierung für mehrere Prompts
   */
  async generateBatch(
    botName: string,
    prompts: string[],
    taskType: string
  ): Promise<HuggingFaceResponse[]> {
    const results: HuggingFaceResponse[] = []
    
    // Verarbeite in Batches von 5
    for (let i = 0; i < prompts.length; i += 5) {
      const batch = prompts.slice(i, i + 5)
      const batchResults = await Promise.all(
        batch.map((prompt) => this.generateForBot(botName, prompt, taskType))
      )
      results.push(...batchResults)
    }
    
    return results
  }
}

// Singleton-Instanz
let clientInstance: OptimizedHuggingFaceClient | null = null

export function getOptimizedHuggingFaceClient(apiKey?: string, geminiApiKey?: string): OptimizedHuggingFaceClient {
  if (!clientInstance) {
    clientInstance = new OptimizedHuggingFaceClient(apiKey, geminiApiKey)
  }
  return clientInstance
}

