/**
 * Query Knowledge Base Tool
 * =========================
 * MCP Tool für RAG-basierte Wissensabfragen.
 * Ermöglicht Agenten, Faktenwissen aus der Dokumentendatenbank abzurufen.
 */

import { createClient } from "@supabase/supabase-js"

// Types
export interface KnowledgeQueryResult {
  success: boolean
  query: string
  results: Array<{
    id: string
    title: string
    content: string
    source: string
    category: string | null
    similarity: number
  }>
  totalResults: number
  executionTime: number
  error?: string
}

export interface KnowledgeQueryOptions {
  query: string
  category?: string
  matchThreshold?: number
  maxResults?: number
  includeMetadata?: boolean
}

// Embedding-Service (nutzt Hugging Face oder OpenAI)
async function generateEmbedding(text: string): Promise<number[]> {
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY
  
  if (huggingfaceKey) {
    // Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${huggingfaceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    )
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }
    
    const embedding = await response.json()
    
    // Normalisiere auf 1536 Dimensionen (padding mit Nullen wenn nötig)
    const normalized = new Array(1536).fill(0)
    const sourceEmbedding = Array.isArray(embedding[0]) ? embedding[0] : embedding
    for (let i = 0; i < Math.min(sourceEmbedding.length, 1536); i++) {
      normalized[i] = sourceEmbedding[i]
    }
    
    return normalized
  }
  
  // Fallback: Einfaches TF-IDF-ähnliches Embedding (für Entwicklung)
  console.warn("⚠️ Kein HUGGINGFACE_API_KEY - verwende Fallback-Embedding")
  return generateFallbackEmbedding(text)
}

// Fallback-Embedding für Entwicklung ohne API-Key
function generateFallbackEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0)
  const words = text.toLowerCase().split(/\s+/)
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    for (let j = 0; j < word.length; j++) {
      const index = (word.charCodeAt(j) * (i + 1) * (j + 1)) % 1536
      embedding[index] += 1 / words.length
    }
  }
  
  // Normalisieren
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude
    }
  }
  
  return embedding
}

/**
 * Haupt-Funktion: Abfrage der Knowledge Base
 */
export async function queryKnowledgeBase(
  options: KnowledgeQueryOptions
): Promise<KnowledgeQueryResult> {
  const startTime = Date.now()
  
  const {
    query,
    category,
    matchThreshold = 0.78,
    maxResults = 10,
  } = options
  
  try {
    // Supabase Client erstellen
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials nicht konfiguriert")
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Embedding für die Anfrage generieren
    const queryEmbedding = await generateEmbedding(query)
    
    // Similarity-Suche via RPC
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: maxResults,
      filter_category: category || null,
    })
    
    if (error) {
      throw new Error(`Supabase RPC error: ${error.message}`)
    }
    
    const results = (data || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      source: doc.source,
      category: doc.category,
      similarity: doc.similarity,
    }))
    
    return {
      success: true,
      query,
      results,
      totalResults: results.length,
      executionTime: Date.now() - startTime,
    }
    
  } catch (error: any) {
    return {
      success: false,
      query,
      results: [],
      totalResults: 0,
      executionTime: Date.now() - startTime,
      error: error.message,
    }
  }
}

/**
 * MCP Tool Definition
 */
export const queryKnowledgeBaseTool = {
  name: "query_knowledge_base",
  description: `Durchsucht die Wissensdatenbank nach relevanten Dokumenten.
  
Verwende dieses Tool um:
- Faktenwissen abzurufen (Gesetze, Compliance-Dokus, Spezifikationen)
- Best Practices zu finden
- Architektur-Entscheidungen nachzuschlagen
- Projekt-spezifische Regeln zu prüfen

Das Tool nutzt Vector-Similarity-Suche für semantisches Matching.`,
  
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Die Suchanfrage (natürlichsprachlich)",
      },
      category: {
        type: "string",
        description: "Optional: Filtere nach Kategorie (z.B. 'compliance', 'architecture', 'api')",
      },
      matchThreshold: {
        type: "number",
        description: "Minimale Ähnlichkeit (0-1, default: 0.78)",
        default: 0.78,
      },
      maxResults: {
        type: "number",
        description: "Maximale Anzahl Ergebnisse (default: 10)",
        default: 10,
      },
    },
    required: ["query"],
  },
  
  async execute(args: KnowledgeQueryOptions): Promise<string> {
    const result = await queryKnowledgeBase(args)
    
    if (!result.success) {
      return `❌ Fehler bei Knowledge Base Abfrage: ${result.error}`
    }
    
    if (result.results.length === 0) {
      return `⚠️ Keine relevanten Dokumente gefunden für: "${args.query}"\n\nTipps:\n- Formuliere die Anfrage anders\n- Verwende spezifischere Begriffe\n- Prüfe ob die Kategorie korrekt ist`
    }
    
    let output = `📚 Knowledge Base Ergebnisse (${result.totalResults} gefunden, ${result.executionTime}ms)\n\n`
    
    for (const doc of result.results) {
      output += `### ${doc.title}\n`
      output += `📁 Quelle: ${doc.source}\n`
      if (doc.category) output += `🏷️ Kategorie: ${doc.category}\n`
      output += `📊 Relevanz: ${(doc.similarity * 100).toFixed(1)}%\n\n`
      output += `${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}\n\n`
      output += `---\n\n`
    }
    
    return output
  },
}

export default queryKnowledgeBaseTool

