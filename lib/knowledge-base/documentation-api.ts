/**
 * Documentation API
 * ==================
 * Zentrale API-Schnittstelle für alle AI-Agenten
 * Ermöglicht Zugriff auf die Dokumentations-Wissensbasis
 */

import type {
  Documentation,
  DocumentationCategory,
  DocumentationMetadata,
} from "./documentation-templates"
import { autoDocumentationEngine } from "./auto-documentation"

export type NewDocumentation = Omit<Documentation, "metadata" | "changeHistory"> & {
  metadata: Omit<DocumentationMetadata, "id" | "date" | "version">
}

export type DocumentationUpdate = Partial<Omit<Documentation, "metadata">> & {
  metadata?: Partial<DocumentationMetadata>
}

/**
 * Gibt alle Dokumentationen einer Kategorie zurück
 */
export async function getDocumentation(
  category: DocumentationCategory
): Promise<Documentation[]> {
  return await autoDocumentationEngine.getDocumentationByCategory(category)
}

/**
 * Sucht Dokumentationen nach Query
 */
export async function searchDocumentation(query: string): Promise<Documentation[]> {
  const { documentationStore } = await import("./documentation-store")
  return await documentationStore.search(query)
}

/**
 * Fügt eine neue Dokumentation hinzu
 */
export async function addDocumentation(
  newDoc: NewDocumentation
): Promise<Documentation> {
  const metadata: DocumentationMetadata = {
    ...newDoc.metadata,
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    date: new Date().toISOString(),
    version: "1.0.0",
  }

  const doc: Documentation = {
    metadata,
    content: newDoc.content,
    changeHistory: [
      {
        date: metadata.date,
        author: metadata.author,
        changes: "Initiale Erstellung",
      },
    ],
  }

  // Speichere in Supabase Store
  const { documentationStore } = await import("./documentation-store")
  await documentationStore.save(doc)

  // Lerne Pattern
  autoDocumentationEngine.learnPattern(doc)

  return doc
}

/**
 * Aktualisiert eine bestehende Dokumentation
 */
export async function updateDocumentation(
  id: string,
  updates: DocumentationUpdate
): Promise<Documentation> {
  const existing = await autoDocumentationEngine.getDocumentation(id)
  if (!existing) {
    throw new Error(`Dokumentation mit ID ${id} nicht gefunden`)
  }

  const updated: Documentation = {
    ...existing,
    metadata: {
      ...existing.metadata,
      ...updates.metadata,
    },
    content: {
      ...existing.content,
      ...updates.content,
    },
    changeHistory: [
      ...existing.changeHistory,
      {
        date: new Date().toISOString(),
        author: updates.metadata?.author || existing.metadata.author,
        changes: updates.content?.content
          ? "Inhalt aktualisiert"
          : "Metadaten aktualisiert",
      },
    ],
  }

  // Speichere in Supabase Store
  const { documentationStore } = await import("./documentation-store")
  await documentationStore.save(updated)

  // Versuche zu optimieren
  await autoDocumentationEngine.optimizeDocumentation(id)

  return updated
}

/**
 * Gibt eine Dokumentation nach ID zurück
 */
export async function getDocumentationById(id: string): Promise<Documentation | null> {
  return await autoDocumentationEngine.getDocumentation(id)
}

/**
 * Gibt alle Dokumentationen zurück
 */
export async function getAllDocumentation(): Promise<Documentation[]> {
  return await autoDocumentationEngine.getAllDocumentation()
}

/**
 * Erstellt automatisch eine Dokumentation aus Rohdaten
 */
export async function createDocumentationFromRaw(
  category: DocumentationCategory,
  author: string,
  rawContent: string,
  references: string[] = []
): Promise<Documentation> {
  const metadata: DocumentationMetadata = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    date: new Date().toISOString(),
    version: "1.0.0",
    author,
    category,
  }

  return await autoDocumentationEngine.createDocumentation(
    category,
    metadata,
    rawContent,
    references
  )
}

/**
 * Verlinkt verwandte Dokumentationen automatisch
 */
export async function autoLinkDocumentation(docId: string): Promise<Documentation> {
  const doc = await autoDocumentationEngine.getDocumentation(docId)
  if (!doc) {
    throw new Error(`Dokumentation mit ID ${docId} nicht gefunden`)
  }

  const allDocs = await autoDocumentationEngine.getAllDocumentation()
  const linked = await Promise.resolve(autoDocumentationEngine.autoLinkRelated(doc, allDocs))

  // Speichere verlinkte Version
  const { documentationStore } = await import("./documentation-store")
  await documentationStore.save(linked)

  return linked
}

/**
 * Prüft Konsistenz aller Dokumentationen
 */
export async function checkDocumentationConsistency(): Promise<
  Array<{
    doc1: string
    doc2: string
    issue: string
  }>
> {
  const allDocs = await autoDocumentationEngine.getAllDocumentation()
  return autoDocumentationEngine.checkConsistency(allDocs)
}

/**
 * Optimiert alle Dokumentationen
 */
export async function optimizeAllDocumentation(): Promise<
  Array<{ id: string; optimized: boolean; score?: number }>
> {
  const allDocs = await autoDocumentationEngine.getAllDocumentation()
  const results: Array<{ id: string; optimized: boolean; score?: number }> = []

  for (const doc of allDocs) {
    const before = await autoDocumentationEngine.getDocumentation(doc.metadata.id)
    const after = await autoDocumentationEngine.optimizeDocumentation(doc.metadata.id)

    if (after && after !== before) {
      const quality = autoDocumentationEngine.evaluateQuality(after)
      results.push({
        id: doc.metadata.id,
        optimized: true,
        score: quality.score,
      })
    } else {
      results.push({
        id: doc.metadata.id,
        optimized: false,
      })
    }
  }

  return results
}

/**
 * Lädt Dokumentationen beim Bot-Start
 * Sollte von allen Bots beim Start aufgerufen werden
 */
export async function loadDocumentationForBot(
  categories: DocumentationCategory[] = []
): Promise<Documentation[]> {
  if (categories.length === 0) {
    // Lade alle Dokumentationen
    return await autoDocumentationEngine.getAllDocumentation()
  }

  // Lade nur spezifische Kategorien
  const docs: Documentation[] = []
  for (const category of categories) {
    const categoryDocs = await autoDocumentationEngine.getDocumentationByCategory(category)
    docs.push(...categoryDocs)
  }

  return docs
}

