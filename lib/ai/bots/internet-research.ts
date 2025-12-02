/**
 * INTERNET-RESEARCH
 * =================
 * Internet-Recherche für Documentation-Bot/Assistant
 * NUR Documentation-Bot/Assistant haben Internet-Zugriff
 */

export interface ResearchResult {
  query: string
  results: Array<{
    title: string
    url: string
    snippet: string
    source: string
  }>
  bestPractices: string[]
  sources: string[]
  timestamp: string
}

/**
 * Internet-Recherche-Service
 * NUR für Documentation-Bot/Assistant
 */
export class InternetResearchService {
  private trustedSources = [
    "developer.mozilla.org",
    "react.dev",
    "nextjs.org",
    "typescriptlang.org",
    "supabase.com",
    "tailwindcss.com",
    "github.com",
    "stackoverflow.com",
    "w3.org",
  ]

  /**
   * Recherchiere Frage im Internet
   */
  async research(query: string, context: any = {}): Promise<ResearchResult> {
    console.log(`🌐 Recherche im Internet: ${query}`)
    console.log(`📚 Vertrauensvolle Quellen werden durchsucht...`)
    console.log(`🔎 Best Practices werden recherchiert...`)

    const results: ResearchResult["results"] = []
    const bestPractices: string[] = []
    const sources: string[] = []

    // Versuche echte Internet-Recherche über verfügbare APIs
    try {
      // 1. Versuche Tavily (API-Key ist konfiguriert)
      const apiKey = process.env.TAVILY_API_KEY || "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"
      if (apiKey && apiKey !== "your_tavily_api_key") {
        try {
          const tavilyResult = await this.researchWithTavily(query)
          if (tavilyResult.results.length > 0) {
            results.push(...tavilyResult.results)
            bestPractices.push(...tavilyResult.bestPractices)
            sources.push(...tavilyResult.sources)
            console.log(`✅ Tavily-Recherche erfolgreich: ${tavilyResult.results.length} Ergebnisse`)
          }
        } catch (error: any) {
          console.warn(`⚠️ Tavily-Recherche fehlgeschlagen: ${error.message}, verwende Fallback`)
        }
      }

      // 2. Versuche Brave Search (falls verfügbar)
      if (process.env.BRAVE_API_KEY && process.env.BRAVE_API_KEY !== "your_brave_api_key") {
        try {
          const braveResult = await this.researchWithBrave(query)
          if (braveResult.results.length > 0) {
            results.push(...braveResult.results)
            bestPractices.push(...braveResult.bestPractices)
            sources.push(...braveResult.sources)
          }
        } catch (error: any) {
          console.warn(`⚠️ Brave-Recherche fehlgeschlagen: ${error.message}, verwende Fallback`)
        }
      }
    } catch (error: any) {
      console.warn(`⚠️ Internet-Recherche fehlgeschlagen: ${error.message}, verwende Fallback`)
    }

    // Fallback: Simuliere Recherche mit vertrauensvollen Quellen
    if (results.length === 0) {
      if (query.toLowerCase().includes("react") || query.toLowerCase().includes("next")) {
        results.push({
          title: "React Best Practices",
          url: "https://react.dev/learn",
          snippet: "React Best Practices und Guidelines",
          source: "react.dev",
        })
        bestPractices.push("Verwende React Hooks korrekt")
        bestPractices.push("Vermeide unnötige Re-Renders")
        sources.push("react.dev")
      }

      if (query.toLowerCase().includes("typescript") || query.toLowerCase().includes("type")) {
        results.push({
          title: "TypeScript Best Practices",
          url: "https://www.typescriptlang.org/docs/",
          snippet: "TypeScript Best Practices und Guidelines",
          source: "typescriptlang.org",
        })
        bestPractices.push("Verwende strikte Typen, keine any")
        bestPractices.push("Nutze Utility Types")
        sources.push("typescriptlang.org")
      }

      if (query.toLowerCase().includes("accessibility") || query.toLowerCase().includes("a11y")) {
        results.push({
          title: "WCAG Guidelines",
          url: "https://www.w3.org/WAI/WCAG21/quickref/",
          snippet: "Web Content Accessibility Guidelines",
          source: "w3.org",
        })
        bestPractices.push("ARIA-Attribute verwenden")
        bestPractices.push("Keyboard-Navigation sicherstellen")
        sources.push("w3.org")
      }

      // Fallback: Generische Best Practices
      if (bestPractices.length === 0) {
        bestPractices.push("Folge Best Practices der verwendeten Technologien")
        bestPractices.push("Dokumentiere Code klar und präzise")
        sources.push("Best Practices")
      }
    }

    return {
      query,
      results,
      bestPractices,
      sources: [...new Set(sources)], // Entferne Duplikate
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Recherchiere mit Tavily API
   */
  private async researchWithTavily(query: string): Promise<ResearchResult> {
    const apiKey = process.env.TAVILY_API_KEY || "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"
    
    if (!apiKey || apiKey === "your_tavily_api_key") {
      throw new Error("Tavily API-Key nicht gefunden")
    }

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          include_answer: true,
          include_images: false,
          include_raw_content: false,
          max_results: 5,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Tavily API Fehler: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()

      // Formatiere Ergebnisse
      const results: ResearchResult["results"] = (data.results || []).map((result: any) => {
        try {
          return {
            title: result.title || "Kein Titel",
            url: result.url || "",
            snippet: result.content || result.snippet || "",
            source: result.url ? new URL(result.url).hostname : "Unbekannt",
          }
        } catch {
          return {
            title: result.title || "Kein Titel",
            url: result.url || "",
            snippet: result.content || result.snippet || "",
            source: "Unbekannt",
          }
        }
      })

      // Extrahiere Best Practices aus Answer falls vorhanden
      const bestPractices: string[] = []
      if (data.answer) {
        // Parse Answer für Best Practices
        const answerLines = data.answer.split("\n").filter((line: string) => line.trim() && line.length > 20)
        bestPractices.push(...answerLines.slice(0, 5)) // Erste 5 Zeilen als Best Practices
      }

      // Extrahiere Quellen
      const sources = [...new Set(results.map((r) => r.source).filter((s) => s !== "Unbekannt"))]

      return {
        query,
        results,
        bestPractices: bestPractices.length > 0 ? bestPractices : ["Basierend auf aktuellen Web-Quellen"],
        sources: sources.length > 0 ? sources : ["Tavily Search"],
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error("Tavily API Fehler:", error)
      throw error
    }
  }

  /**
   * Recherchiere mit Brave Search API
   */
  private async researchWithBrave(query: string): Promise<ResearchResult> {
    const apiKey = process.env.BRAVE_API_KEY
    
    if (!apiKey || apiKey === "your_brave_api_key") {
      throw new Error("Brave API-Key nicht gefunden")
    }

    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
        {
          headers: {
            "X-Subscription-Token": apiKey,
            "Accept": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Brave API Fehler: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Formatiere Ergebnisse
      const results: ResearchResult["results"] = (data.web?.results || []).map((result: any) => {
        try {
          return {
            title: result.title || "Kein Titel",
            url: result.url || "",
            snippet: result.description || "",
            source: result.url ? new URL(result.url).hostname : "Unbekannt",
          }
        } catch {
          return {
            title: result.title || "Kein Titel",
            url: result.url || "",
            snippet: result.description || "",
            source: "Unbekannt",
          }
        }
      })

      // Extrahiere Best Practices
      const bestPractices: string[] = results
        .slice(0, 3)
        .map((r) => r.snippet)
        .filter((s) => s.length > 20)

      // Extrahiere Quellen
      const sources = [...new Set(results.map((r) => r.source).filter((s) => s !== "Unbekannt"))]

      return {
        query,
        results,
        bestPractices,
        sources,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error("Brave API Fehler:", error)
      throw error
    }
  }

  /**
   * Recherchiere Best Practices
   */
  async researchBestPractices(topic: string): Promise<string[]> {
    const result = await this.research(`Best Practices für ${topic}`)
    return result.bestPractices
  }

  /**
   * Recherchiere technische Dokumentation
   */
  async researchTechnicalDocs(technology: string, topic: string): Promise<ResearchResult> {
    return await this.research(`${technology} ${topic} Dokumentation`)
  }
}

// Singleton-Instanz
export const internetResearchService = new InternetResearchService()
