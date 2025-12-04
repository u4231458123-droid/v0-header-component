/**
 * Auto-Documentation Engine
 * ==========================
 * AI-gestützte, selbstoptimierende Dokumentation
 * Integration mit Hugging Face für Zusammenfassungen
 */

import type { Documentation, DocumentationCategory, DocumentationMetadata } from "./documentation-templates"
import { createDocumentationFromTemplate } from "./documentation-templates"
import { documentationStore } from "./documentation-store"

/**
 * Hugging Face Model-Konfiguration
 */
export const HUGGINGFACE_MODELS = {
  summary: "facebook/bart-large-cnn", // Für Zusammenfassungen
  structured: "mistralai/Mistral-7B-Instruct-v0.3", // Für strukturierte Dokumentation
} as const

/**
 * Qualitätsbewertung für Dokumentation
 */
export interface DocumentationQuality {
  score: number // 0-100
  completeness: number // 0-100
  clarity: number // 0-100
  structure: number // 0-100
  issues: string[]
}

/**
 * Auto-Documentation Engine
 */
export class AutoDocumentationEngine {
  private qualityHistory: Map<string, DocumentationQuality[]> = new Map()
  private patterns: Map<string, number> = new Map() // Pattern-Learning
  private documentationStore = documentationStore

  /**
   * Generiert eine Zusammenfassung mit Hugging Face
   */
  async generateSummary(content: string): Promise<string> {
    try {
      // Versuche Hugging Face MCP Integration
      if (typeof window === "undefined" && process.env.MCP_HUGGINGFACE_URL) {
        // Server-side: Verwende MCP
        const response = await fetch(`${process.env.MCP_HUGGINGFACE_URL}/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: HUGGINGFACE_MODELS.summary,
            text: content,
            max_length: 150,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          return data.summary || this.fallbackSummary(content)
        }
      }

      // Fallback: Einfache Zusammenfassung
      return this.fallbackSummary(content)
    } catch (error) {
      console.warn("Hugging Face Summarization fehlgeschlagen, verwende Fallback:", error)
      return this.fallbackSummary(content)
    }
  }

  /**
   * Fallback-Zusammenfassung (wenn Hugging Face nicht verfügbar)
   */
  private fallbackSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    if (sentences.length === 0) return content.substring(0, 150) + "..."
    return sentences.slice(0, 2).join(". ").substring(0, 150) + "..."
  }

  /**
   * Erstellt automatisch eine Dokumentation
   */
  async createDocumentation(
    category: DocumentationCategory,
    metadata: DocumentationMetadata,
    rawContent: string,
    references: string[] = []
  ): Promise<Documentation> {
    // Generiere Zusammenfassung
    const summary = await this.generateSummary(rawContent)

    // Erstelle Dokumentation aus Template
    const doc = createDocumentationFromTemplate(category, metadata, {
      summary,
      content: rawContent,
      references,
    })

    // Speichere Dokumentation in Supabase
    await documentationStore.save(doc)

    // Bewerte Qualität
    const quality = this.evaluateQuality(doc)
    this.recordQuality(metadata.id, quality)

    return doc
  }

  /**
   * Bewertet die Qualität einer Dokumentation
   */
  evaluateQuality(doc: Documentation): DocumentationQuality {
    const issues: string[] = []
    let completeness = 0
    let clarity = 0
    let structure = 0

    // Vollständigkeit prüfen
    const hasSummary = doc.content.summary.length > 0
    const hasContent = doc.content.content.length > 50
    const hasMetadata = doc.metadata.id && doc.metadata.date && doc.metadata.author
    completeness = (hasSummary ? 25 : 0) + (hasContent ? 50 : 0) + (hasMetadata ? 25 : 0)

    if (!hasSummary) issues.push("Fehlende Zusammenfassung")
    if (!hasContent) issues.push("Inhalt zu kurz")
    if (!hasMetadata) issues.push("Unvollständige Metadaten")

    // Klarheit prüfen
    const wordCount = doc.content.content.split(/\s+/).length
    const hasStructure = doc.content.content.includes("##") || doc.content.content.includes("###")
    clarity = Math.min(100, (wordCount / 10) * 10) // Mehr Wörter = besser (bis 100)
    if (!hasStructure) {
      issues.push("Fehlende Struktur (Überschriften)")
      clarity -= 20
    }

    // Struktur prüfen
    const hasSections = (doc.content.content.match(/##/g) || []).length >= 2
    const hasReferences = doc.content.references.length > 0
    structure = (hasSections ? 50 : 0) + (hasReferences ? 25 : 0) + (doc.metadata.category ? 25 : 0)

    if (!hasSections) issues.push("Zu wenige Abschnitte")
    if (!hasReferences && doc.metadata.category !== "change-log") {
      issues.push("Fehlende Referenzen")
    }

    const score = Math.round((completeness + clarity + structure) / 3)

    return {
      score,
      completeness,
      clarity,
      structure,
      issues,
    }
  }

  /**
   * Zeichnet Qualitätsbewertung auf
   */
  private recordQuality(docId: string, quality: DocumentationQuality): void {
    if (!this.qualityHistory.has(docId)) {
      this.qualityHistory.set(docId, [])
    }
    const history = this.qualityHistory.get(docId)!
    history.push(quality)
    if (history.length > 10) {
      history.shift() // Behalte nur die letzten 10 Bewertungen
    }
  }

  /**
   * Erkennt häufige Dokumentationsmuster
   */
  learnPattern(doc: Documentation): void {
    const key = `${doc.metadata.category}-${doc.content.content.substring(0, 50)}`
    this.patterns.set(key, (this.patterns.get(key) || 0) + 1)
  }

  /**
   * Optimiert Dokumentation basierend auf Qualitätshistorie
   */
  async optimizeDocumentation(docId: string): Promise<Documentation | null> {
    const doc = await this.documentationStore.getById(docId)
    if (!doc) return null

    const qualityHistory = this.qualityHistory.get(docId)
    if (!qualityHistory || qualityHistory.length < 3) return doc

    // Berechne Durchschnittsqualität
    const avgQuality = qualityHistory.reduce(
      (sum, q) => sum + q.score,
      0
    ) / qualityHistory.length

    // Wenn Qualität niedrig ist, versuche zu optimieren
    if (avgQuality < 70) {
      const commonIssues = this.getCommonIssues(qualityHistory)
      const optimizedContent = this.applyOptimizations(doc, commonIssues)
      const optimizedSummary = await this.generateSummary(optimizedContent.content)

      const optimized: Documentation = {
        ...doc,
        content: {
          ...optimizedContent,
          summary: optimizedSummary,
        },
        changeHistory: [
          ...doc.changeHistory,
          {
            date: new Date().toISOString(),
            author: "Auto-Documentation Engine",
            changes: `Automatische Optimierung basierend auf Qualitätsbewertung (Score: ${avgQuality.toFixed(1)})`,
          },
        ],
      }

      await documentationStore.save(optimized)
      return optimized
    }

    return doc
  }

  /**
   * Ermittelt häufige Probleme aus Qualitätshistorie
   */
  private getCommonIssues(qualityHistory: DocumentationQuality[]): string[] {
    const issueCounts = new Map<string, number>()
    qualityHistory.forEach((q) => {
      q.issues.forEach((issue) => {
        issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1)
      })
    })

    return Array.from(issueCounts.entries())
      .filter(([, count]) => count >= 2) // Mindestens 2x aufgetreten
      .map(([issue]) => issue)
  }

  /**
   * Wendet Optimierungen basierend auf Problemen an
   */
  private applyOptimizations(
    doc: Documentation,
    issues: string[]
  ): Documentation["content"] {
    let content = doc.content.content

    if (issues.includes("Fehlende Struktur (Überschriften)")) {
      // Versuche Überschriften hinzuzufügen
      if (!content.includes("##")) {
        content = `## Beschreibung\n\n${content}\n\n## Details\n\nWeitere Informationen folgen.`
      }
    }

    if (issues.includes("Zu wenige Abschnitte")) {
      // Füge weitere Abschnitte hinzu
      if ((content.match(/##/g) || []).length < 3) {
        content += `\n\n## Weitere Informationen\n\nDetails werden ergänzt.`
      }
    }

    return {
      ...doc.content,
      content,
    }
  }

  /**
   * Verlinkt verwandte Dokumente automatisch
   */
  autoLinkRelated(doc: Documentation, allDocs: Documentation[]): Documentation {
    const related: string[] = []

    // Suche nach ähnlichen Dokumenten
    allDocs.forEach((other) => {
      if (other.metadata.id === doc.metadata.id) return

      // Gleiche Kategorie
      if (other.metadata.category === doc.metadata.category) {
        related.push(other.metadata.id)
      }

      // Ähnliche Referenzen
      const commonRefs = doc.content.references.filter((ref) =>
        other.content.references.includes(ref)
      )
      if (commonRefs.length > 0) {
        related.push(other.metadata.id)
      }
    })

    return {
      ...doc,
      content: {
        ...doc.content,
        references: [...new Set([...doc.content.references, ...related])],
      },
    }
  }

  /**
   * Prüft auf Widersprüche zwischen Dokumentationen
   */
  checkConsistency(docs: Documentation[]): Array<{
    doc1: string
    doc2: string
    issue: string
  }> {
    const inconsistencies: Array<{ doc1: string; doc2: string; issue: string }> = []

    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const doc1 = docs[i]
        const doc2 = docs[j]

        // Prüfe auf widersprüchliche Informationen
        if (doc1.metadata.category === "error-documentation" && doc2.metadata.category === "error-documentation") {
          // Prüfe ob beide denselben Fehler beschreiben, aber unterschiedliche Lösungen
          const doc1Error = doc1.content.content.match(/ERR-\d+/)?.[0]
          const doc2Error = doc2.content.content.match(/ERR-\d+/)?.[0]
          if (doc1Error === doc2Error && doc1.content.content !== doc2.content.content) {
            inconsistencies.push({
              doc1: doc1.metadata.id,
              doc2: doc2.metadata.id,
              issue: `Widersprüchliche Dokumentation für ${doc1Error}`,
            })
          }
        }
      }
    }

    return inconsistencies
  }

  /**
   * Gibt alle Dokumentationen zurück
   */
  async getAllDocumentation(): Promise<Documentation[]> {
    return await documentationStore.getAll()
  }

  /**
   * Gibt Dokumentation nach ID zurück
   */
  async getDocumentation(id: string): Promise<Documentation | null> {
    return await documentationStore.getById(id)
  }

  /**
   * Gibt Dokumentationen nach Kategorie zurück
   */
  async getDocumentationByCategory(category: DocumentationCategory): Promise<Documentation[]> {
    return await documentationStore.getByCategory(category)
  }
}

// Singleton-Instanz
export const autoDocumentationEngine = new AutoDocumentationEngine()

