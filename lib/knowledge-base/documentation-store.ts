/**
 * Documentation Store
 * ===================
 * Supabase-basierte persistente Speicherung für Dokumentationen
 * Ersetzt In-Memory Map durch dauerhafte Datenbank-Speicherung
 */

import { createClient } from "@/lib/supabase/client"
import type {
  Documentation,
  DocumentationCategory,
  DocumentationMetadata,
} from "./documentation-templates"

/**
 * Supabase-Store für Dokumentationen
 */
export class DocumentationStore {
  private supabase = createClient()

  /**
   * Speichert eine Dokumentation in Supabase
   */
  async save(doc: Documentation): Promise<Documentation> {
    const { data, error } = await this.supabase
      .from("documentation")
      .upsert({
        id: doc.metadata.id,
        category: doc.metadata.category,
        author: doc.metadata.author,
        version: doc.metadata.version,
        summary: doc.content.summary,
        content: doc.content.content,
        references: doc.content.references,
        change_history: doc.changeHistory,
        company_id: null, // Optional: später für company-spezifische Dokumentationen
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Fehler beim Speichern der Dokumentation: ${error.message}`)
    }

    return this.mapToDocumentation(data)
  }

  /**
   * Lädt eine Dokumentation nach ID
   */
  async getById(id: string): Promise<Documentation | null> {
    const { data, error } = await this.supabase
      .from("documentation")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // Nicht gefunden
        return null
      }
      throw new Error(`Fehler beim Laden der Dokumentation: ${error.message}`)
    }

    return data ? this.mapToDocumentation(data) : null
  }

  /**
   * Lädt alle Dokumentationen einer Kategorie
   */
  async getByCategory(category: DocumentationCategory): Promise<Documentation[]> {
    const { data, error } = await this.supabase
      .from("documentation")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Fehler beim Laden der Dokumentationen: ${error.message}`)
    }

    return (data || []).map((row: any) => this.mapToDocumentation(row))
  }

  /**
   * Lädt alle Dokumentationen
   */
  async getAll(): Promise<Documentation[]> {
    const { data, error } = await this.supabase
      .from("documentation")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Fehler beim Laden der Dokumentationen: ${error.message}`)
    }

    return (data || []).map((row: any) => this.mapToDocumentation(row))
  }

  /**
   * Sucht Dokumentationen nach Query
   */
  async search(query: string): Promise<Documentation[]> {
    const queryLower = query.toLowerCase()

    // PostgreSQL Full-Text Search
    const { data, error } = await this.supabase
      .from("documentation")
      .select("*")
      .or(
        `content.ilike.%${queryLower}%,summary.ilike.%${queryLower}%,author.ilike.%${queryLower}%`
      )
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Fehler bei der Suche: ${error.message}`)
    }

    return (data || []).map((row: any) => this.mapToDocumentation(row))
  }

  /**
   * Aktualisiert eine Dokumentation
   */
  async update(id: string, updates: Partial<Documentation>): Promise<Documentation> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error(`Dokumentation mit ID ${id} nicht gefunden`)
    }

    const updated: Documentation = {
      ...existing,
      ...updates,
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

    return await this.save(updated)
  }

  /**
   * Löscht eine Dokumentation
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("documentation").delete().eq("id", id)

    if (error) {
      throw new Error(`Fehler beim Löschen der Dokumentation: ${error.message}`)
    }
  }

  /**
   * Mappt Supabase-Row zu Documentation-Objekt
   */
  private mapToDocumentation(row: any): Documentation {
    return {
      metadata: {
        id: row.id,
        date: row.created_at,
        version: row.version || "1.0.0",
        author: row.author,
        category: row.category as DocumentationCategory,
      },
      content: {
        summary: row.summary || "",
        content: row.content,
        references: (row.references as string[]) || [],
      },
      changeHistory: (row.change_history as Array<{
        date: string
        author: string
        changes: string
      }>) || [],
    }
  }
}

// Singleton-Instanz
export const documentationStore = new DocumentationStore()

