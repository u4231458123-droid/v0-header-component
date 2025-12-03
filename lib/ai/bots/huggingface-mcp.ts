/**
 * Hugging Face MCP Integration
 * =============================
 * Integration für Hugging Face Model Context Protocol (MCP)
 * Ermöglicht direkten Zugriff auf Hugging Face Models über MCP
 */

export interface HuggingFaceMCPConfig {
  readToken?: string
  apiKey?: string
  baseUrl?: string
}

export interface HuggingFaceMCPRequest {
  model: string
  inputs: string
  parameters?: {
    max_new_tokens?: number
    temperature?: number
    top_p?: number
    return_full_text?: boolean
  }
}

export interface HuggingFaceMCPResponse {
  generated_text?: string
  text?: string
  error?: string
}

/**
 * Hugging Face MCP Client
 * Nutzt MCP für direkten Zugriff auf Hugging Face Models
 */
export class HuggingFaceMCPClient {
  private config: HuggingFaceMCPConfig
  private mcpServerUrl = "https://huggingface.co/mcp"
  private loginUrl = "https://huggingface.co/mcp?login"

  constructor(config?: HuggingFaceMCPConfig) {
    this.config = {
      readToken: config?.readToken || process.env.HUGGINGFACE_READ_TOKEN,
      apiKey: config?.apiKey || process.env.HUGGINGFACE_API_KEY,
      baseUrl: config?.baseUrl || this.mcpServerUrl,
    }
  }

  /**
   * Prüfe ob MCP-Server verfügbar ist
   */
  async checkMCPServer(): Promise<{ available: boolean; message?: string }> {
    try {
      // Prüfe ob MCP-Server erreichbar ist
      const response = await fetch(this.mcpServerUrl, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (response.ok || response.status === 401) {
        // 401 bedeutet Server ist verfügbar, aber Auth fehlt
        return { available: true }
      }

      return {
        available: false,
        message: `MCP-Server nicht verfügbar: ${response.status} ${response.statusText}`,
      }
    } catch (error: any) {
      return {
        available: false,
        message: `Fehler beim Prüfen des MCP-Servers: ${error.message}`,
      }
    }
  }

  /**
   * Generiere Text mit Hugging Face Model über MCP
   */
  async generate(
    model: string,
    prompt: string,
    parameters?: HuggingFaceMCPRequest["parameters"]
  ): Promise<HuggingFaceMCPResponse> {
    try {
      // Prüfe MCP-Server-Verfügbarkeit
      const serverCheck = await this.checkMCPServer()
      if (!serverCheck.available) {
        throw new Error(serverCheck.message || "MCP-Server nicht verfügbar")
      }

      // MCP-Request vorbereiten
      const request: HuggingFaceMCPRequest = {
        model,
        inputs: prompt,
        parameters: parameters || {
          max_new_tokens: 512,
          temperature: 0.7,
          return_full_text: false,
        },
      }

      // Sende Request über MCP
      const response = await fetch(`${this.mcpServerUrl}/inference`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()

      // Parse Response
      if (Array.isArray(data)) {
        return {
          generated_text: data[0]?.generated_text || data[0]?.text || "",
        }
      }

      return {
        generated_text: data.generated_text || data.text || "",
      }
    } catch (error: any) {
      return {
        error: error.message || "Unbekannter Fehler bei MCP-Request",
      }
    }
  }

  /**
   * Hole verfügbare Models über MCP
   */
  async listModels(): Promise<{ models: string[]; error?: string }> {
    try {
      const serverCheck = await this.checkMCPServer()
      if (!serverCheck.available) {
        return {
          models: [],
          error: serverCheck.message || "MCP-Server nicht verfügbar",
        }
      }

      const response = await fetch(`${this.mcpServerUrl}/models`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        return {
          models: [],
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return {
        models: Array.isArray(data) ? data : data.models || [],
      }
    } catch (error: any) {
      return {
        models: [],
        error: error.message || "Unbekannter Fehler",
      }
    }
  }

  /**
   * Hole Auth-Headers für MCP-Requests
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}

    // Priorität: READ Token > API Key
    if (this.config.readToken) {
      headers.Authorization = `Bearer ${this.config.readToken}`
    } else if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`
    }

    return headers
  }

  /**
   * Prüfe ob Auth konfiguriert ist
   */
  hasAuth(): boolean {
    return !!(this.config.readToken || this.config.apiKey)
  }

  /**
   * Hole Login-URL für OAuth
   */
  getLoginUrl(): string {
    return this.loginUrl
  }
}

/**
 * Singleton-Instanz für einfache Verwendung
 */
let mcpClientInstance: HuggingFaceMCPClient | null = null

export function getHuggingFaceMCPClient(
  config?: HuggingFaceMCPConfig
): HuggingFaceMCPClient {
  if (!mcpClientInstance) {
    mcpClientInstance = new HuggingFaceMCPClient(config)
  }
  return mcpClientInstance
}

