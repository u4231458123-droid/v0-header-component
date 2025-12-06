/**
 * Document Ingestion Job
 * ======================
 * Trigger.dev Job für automatisches Chunking und Embedding von Dokumenten.
 * Wird bei Upload von PDFs, Markdowns oder anderen Dokumenten ausgeführt.
 */

import { task } from "@trigger.dev/sdk/v3"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

// Input Schema
const DocumentIngestionSchema = z.object({
  documentId: z.string().optional(),
  source: z.string(),
  sourceType: z.enum(["markdown", "pdf", "text", "code", "url"]),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  ownerId: z.string().optional(),
})

type DocumentIngestionInput = z.infer<typeof DocumentIngestionSchema>

// Chunk Configuration
const CHUNK_SIZE = 1000 // Zeichen pro Chunk
const CHUNK_OVERLAP = 200 // Überlappung für Kontext

/**
 * Teilt Text in überlappende Chunks
 */
function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    
    // Versuche an Satzende zu brechen wenn möglich
    if (end < text.length) {
      const lastSentenceEnd = chunk.lastIndexOf(". ")
      const lastNewline = chunk.lastIndexOf("\n\n")
      const breakPoint = Math.max(lastSentenceEnd, lastNewline)
      
      if (breakPoint > chunkSize / 2) {
        chunks.push(chunk.slice(0, breakPoint + 1).trim())
        start += breakPoint + 1 - overlap
      } else {
        chunks.push(chunk.trim())
        start = end - overlap
      }
    } else {
      chunks.push(chunk.trim())
      break
    }
  }
  
  return chunks.filter(c => c.length > 0)
}

/**
 * Generiert Embedding für Text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY
  
  if (!huggingfaceKey) {
    console.warn("⚠️ HUGGINGFACE_API_KEY nicht gesetzt - verwende Fallback")
    return generateFallbackEmbedding(text)
  }
  
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${huggingfaceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text.substring(0, 512) }), // Limit für API
      }
    )
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }
    
    const embedding = await response.json()
    
    // Normalisiere auf 1536 Dimensionen
    const normalized = new Array(1536).fill(0)
    const sourceEmbedding = Array.isArray(embedding[0]) ? embedding[0] : embedding
    for (let i = 0; i < Math.min(sourceEmbedding.length, 1536); i++) {
      normalized[i] = sourceEmbedding[i]
    }
    
    return normalized
  } catch (error) {
    console.error("Embedding-Fehler:", error)
    return generateFallbackEmbedding(text)
  }
}

/**
 * Fallback-Embedding für Entwicklung
 */
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
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude
    }
  }
  
  return embedding
}

/**
 * Haupt-Task: Document Ingestion
 */
export const documentIngestion = task({
  id: "document-ingestion",
  
  run: async (payload: DocumentIngestionInput, { ctx }) => {
    const startTime = Date.now()
    const results = {
      success: false,
      documentId: payload.documentId,
      source: payload.source,
      chunksCreated: 0,
      embeddingsGenerated: 0,
      errors: [] as string[],
    }
    
    try {
      // Supabase Client
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase credentials nicht konfiguriert")
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // 1. Chunking
      console.log(`📄 Chunking document: ${payload.title}`)
      const chunks = chunkText(payload.content)
      results.chunksCreated = chunks.length
      
      console.log(`✂️ ${chunks.length} Chunks erstellt`)
      
      // 2. Embeddings generieren und speichern
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        console.log(`🔄 Generiere Embedding ${i + 1}/${chunks.length}`)
        
        // Embedding generieren
        const embedding = await generateEmbedding(chunk)
        results.embeddingsGenerated++
        
        // In Datenbank speichern
        const { error } = await supabase.from("documents").insert({
          title: chunks.length > 1 ? `${payload.title} (Teil ${i + 1}/${chunks.length})` : payload.title,
          source: payload.source,
          source_type: payload.sourceType,
          category: payload.category,
          content: chunk,
          chunk_index: i,
          chunk_total: chunks.length,
          embedding,
          metadata: {
            ...payload.metadata,
            originalLength: payload.content.length,
            chunkLength: chunk.length,
            ingestionTaskId: ctx.task.id,
          },
          owner_id: payload.ownerId,
        })
        
        if (error) {
          results.errors.push(`Chunk ${i + 1}: ${error.message}`)
          console.error(`❌ Fehler bei Chunk ${i + 1}:`, error)
        }
        
        // Rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      results.success = results.errors.length === 0
      
      const duration = Date.now() - startTime
      console.log(`✅ Document Ingestion abgeschlossen in ${duration}ms`)
      console.log(`   - Chunks: ${results.chunksCreated}`)
      console.log(`   - Embeddings: ${results.embeddingsGenerated}`)
      console.log(`   - Fehler: ${results.errors.length}`)
      
      return results
      
    } catch (error: any) {
      results.errors.push(error.message)
      console.error("❌ Document Ingestion fehlgeschlagen:", error)
      return results
    }
  },
  
  schema: DocumentIngestionSchema,
})

/**
 * Batch-Ingestion für mehrere Dokumente
 */
export const batchDocumentIngestion = task({
  id: "batch-document-ingestion",
  
  run: async (payload: { documents: DocumentIngestionInput[] }, { ctx }) => {
    const results = {
      total: payload.documents.length,
      successful: 0,
      failed: 0,
      details: [] as Array<{ source: string; success: boolean; error?: string }>,
    }
    
    for (const doc of payload.documents) {
      try {
        const result = await documentIngestion.triggerAndWait(doc)
        
        if (result.ok && result.output.success) {
          results.successful++
          results.details.push({ source: doc.source, success: true })
        } else {
          results.failed++
          results.details.push({
            source: doc.source,
            success: false,
            error: result.ok ? result.output.errors.join(", ") : "Task failed",
          })
        }
      } catch (error: any) {
        results.failed++
        results.details.push({
          source: doc.source,
          success: false,
          error: error.message,
        })
      }
    }
    
    return results
  },
  
  schema: z.object({
    documents: z.array(DocumentIngestionSchema),
  }),
})

