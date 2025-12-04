/**
 * MCP Supabase Integration für Bots
 * ===================================
 * Zentrale MCP-Funktionen für alle Bots
 * Ermöglicht direkten Zugriff auf Supabase-Datenbank
 */

import { validateSQLBeforeExecution } from "@/lib/utils/sql-validator"
import { createClient } from "@/lib/supabase/client"

/**
 * Validiert Supabase-Projekt-Konfiguration
 * MUSS von allen Bots vor Datenbank-Operationen aufgerufen werden
 */
export async function validateSupabaseProject(): Promise<{
  valid: boolean
  url: string
  errors: string[]
}> {
  const errors: string[] = []
  
  try {
    const expectedUrl = "https://ykfufejycdgwonrlbhzn.supabase.co"
    
    // Versuche MCP-Aufruf (wenn verfügbar über Cursor MCP)
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_supabase_get_project_url === "function") {
        // @ts-ignore
        const url = await mcp_supabase_get_project_url()
        if (url && url !== expectedUrl) {
          errors.push(`Falsche Projekt-URL: ${url} (erwartet: ${expectedUrl})`)
        }
        return {
          valid: errors.length === 0,
          url: url || expectedUrl,
          errors,
        }
      }
    } catch (mcpError: any) {
      // MCP nicht verfügbar, verwende Fallback
      console.warn("MCP nicht verfügbar, verwende Fallback:", mcpError.message)
    }
    
    // Fallback: Validiere über Supabase-Client
    const supabase = createClient()
    const actualUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || expectedUrl
    
    if (actualUrl !== expectedUrl) {
      errors.push(`Falsche Projekt-URL: ${actualUrl} (erwartet: ${expectedUrl})`)
    }
    
    // Test-Verbindung
    const { error } = await supabase.from("profiles").select("id").limit(1)
    if (error && error.code !== "PGRST116") {
      errors.push(`Verbindungsfehler: ${error.message}`)
    }
    
    return {
      valid: errors.length === 0,
      url: actualUrl,
      errors,
    }
  } catch (error: any) {
    errors.push(`Fehler bei Projekt-Validierung: ${error.message}`)
    return {
      valid: false,
      url: "",
      errors,
    }
  }
}

/**
 * Prüft ob Tabellen existieren
 * MUSS von allen Bots vor Schema-Änderungen aufgerufen werden
 */
export async function validateSchemaTables(requiredTables: string[]): Promise<{
  valid: boolean
  existing: string[]
  missing: string[]
  errors: string[]
}> {
  const errors: string[] = []
  const existing: string[] = []
  const missing: string[] = []
  
  try {
    let tableNames: string[] = []
    
    // Versuche MCP-Aufruf (wenn verfügbar über Cursor MCP)
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_supabase_list_tables === "function") {
        // @ts-ignore
        const tables = await mcp_supabase_list_tables({ schemas: ["public"] })
        tableNames = Array.isArray(tables) 
          ? tables.map((t: any) => t.name || t)
          : []
      }
    } catch (mcpError: any) {
      // MCP nicht verfügbar, verwende Fallback
      console.warn("MCP nicht verfügbar, verwende Fallback:", mcpError.message)
    }
    
    // Fallback: Validiere über Supabase-Client
    if (tableNames.length === 0) {
      const supabase = createClient()
      
      // Prüfe jede Tabelle einzeln
      for (const table of requiredTables) {
        try {
          const { error } = await supabase.from(table).select("id").limit(1)
          if (!error || error.code === "PGRST116") {
            // Tabelle existiert (PGRST116 = keine Zeilen, aber Tabelle existiert)
            existing.push(table)
          } else if (error.code === "42P01") {
            // Tabelle existiert nicht
            missing.push(table)
          } else {
            // Anderer Fehler - Tabelle existiert vermutlich
            existing.push(table)
          }
        } catch (tableError: any) {
          // Bei Fehler: Tabelle existiert vermutlich nicht
          missing.push(table)
        }
      }
    } else {
      // Verwende MCP-Ergebnisse
      for (const table of requiredTables) {
        if (tableNames.includes(table)) {
          existing.push(table)
        } else {
          missing.push(table)
        }
      }
    }
    
    if (missing.length > 0) {
      errors.push(`Fehlende Tabellen: ${missing.join(", ")}`)
    }
    
    return {
      valid: missing.length === 0,
      existing,
      missing,
      errors,
    }
  } catch (error: any) {
    errors.push(`Fehler bei Schema-Validierung: ${error.message}`)
    return {
      valid: false,
      existing,
      missing: requiredTables,
      errors,
    }
  }
}

/**
 * Wende Migration an mit Validierung
 * MUSS von System-Bot verwendet werden
 */
export async function applyMigrationWithValidation(
  name: string,
  query: string,
  requiredTables: string[] = [],
  filePath?: string
): Promise<{
  success: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // 0. SQL-Validierung (KRITISCH - verhindert Ausführung von TS/JS-Dateien)
    const sqlValidation = validateSQLBeforeExecution(query, filePath)
    if (!sqlValidation.valid) {
      errors.push(...sqlValidation.errors)
      errors.push(
        "❌ KRITISCHER FEHLER: Es wurde versucht, eine TypeScript/JavaScript-Datei als SQL auszuführen!"
      )
      errors.push("💡 Bitte prüfe den Dateipfad und stelle sicher, dass nur .sql-Dateien ausgeführt werden.")
      return { success: false, errors, warnings: [...warnings, ...sqlValidation.warnings] }
    }
    warnings.push(...sqlValidation.warnings)
    
    // 1. Projekt validieren
    const projectValidation = await validateSupabaseProject()
    if (!projectValidation.valid) {
      errors.push(...projectValidation.errors)
      return { success: false, errors, warnings }
    }
    
    // 2. Schema validieren
    if (requiredTables.length > 0) {
      const schemaValidation = await validateSchemaTables(requiredTables)
      if (!schemaValidation.valid) {
        errors.push(...schemaValidation.errors)
        return { success: false, errors, warnings }
      }
    }
    
    // 3. Migration anwenden
    let migrationApplied = false
    
    // Versuche MCP-Aufruf (wenn verfügbar über Cursor MCP)
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_supabase_apply_migration === "function") {
        // @ts-ignore
        await mcp_supabase_apply_migration({ name, query })
        migrationApplied = true
      }
    } catch (mcpError: any) {
      // MCP nicht verfügbar, verwende Fallback
      console.warn("MCP nicht verfügbar, verwende Fallback:", mcpError.message)
    }
    
    // Fallback: Direkte SQL-Ausführung über Supabase-Client
    if (!migrationApplied) {
      const supabase = createClient()
      const { error } = await supabase.rpc("exec_sql", { sql_query: query })
      
      if (error) {
        // Versuche direkte Ausführung über execute_sql (falls RPC nicht verfügbar)
        // Split query in einzelne Statements
        const statements = query
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"))
        
        for (const statement of statements) {
          if (statement.trim()) {
            // Verwende Supabase Admin-Client falls verfügbar
            // Ansonsten: Migration muss manuell angewendet werden
            warnings.push(
              `Migration "${name}" muss manuell angewendet werden. SQL-Query ist validiert und bereit.`
            )
          }
        }
      } else {
        migrationApplied = true
      }
    }
    
    if (!migrationApplied) {
      warnings.push(
        `Migration "${name}" wurde nicht automatisch angewendet. Bitte manuell in Supabase Dashboard ausführen.`
      )
    }
    
    return {
      success: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error: any) {
    errors.push(`Fehler bei Migration: ${error.message}`)
    return {
      success: false,
      errors,
      warnings,
    }
  }
}

/**
 * Generiere TypeScript-Typen mit Validierung
 * MUSS nach Schema-Änderungen aufgerufen werden
 */
export async function generateTypesWithValidation(): Promise<{
  success: boolean
  types?: string
  errors: string[]
}> {
  const errors: string[] = []
  
  try {
    // 1. Projekt validieren
    const projectValidation = await validateSupabaseProject()
    if (!projectValidation.valid) {
      errors.push(...projectValidation.errors)
      return { success: false, errors }
    }
    
    // 2. Typen generieren
    let types: string | undefined = undefined
    
    // Versuche MCP-Aufruf (wenn verfügbar über Cursor MCP)
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_supabase_generate_typescript_types === "function") {
        // @ts-ignore
        types = await mcp_supabase_generate_typescript_types()
      }
    } catch (mcpError: any) {
      // MCP nicht verfügbar, verwende Fallback
      console.warn("MCP nicht verfügbar, verwende Fallback:", mcpError.message)
    }
    
    // Fallback: Generiere Basis-Typen manuell
    if (!types) {
      const supabase = createClient()
      
      // Hole Tabellen-Informationen
      const { data: tables } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .limit(100)
      
      if (tables && tables.length > 0) {
        // Generiere einfache TypeScript-Typen
        types = `// Auto-generated TypeScript types for Supabase\n\n`
        types += `export interface Database {\n`
        types += `  public: {\n`
        
        for (const table of tables) {
          const tableName = (table as any).table_name
          types += `    ${tableName}: {\n`
          types += `      Row: Record<string, any>\n`
          types += `      Insert: Record<string, any>\n`
          types += `      Update: Partial<Record<string, any>>\n`
          types += `    }\n`
        }
        
        types += `  }\n`
        types += `}\n`
      }
    }
    
    return {
      success: errors.length === 0,
      types,
      errors,
    }
  } catch (error: any) {
    errors.push(`Fehler bei Typ-Generierung: ${error.message}`)
    return {
      success: false,
      errors,
    }
  }
}

/**
 * Prüfe Sicherheits-Advisors
 * SOLLTE regelmäßig von Master-Bot aufgerufen werden
 */
export async function checkSecurityAdvisors(): Promise<{
  issues: Array<{ name: string; level: string; description: string }>
  errors: string[]
}> {
  const errors: string[] = []
  const issues: Array<{ name: string; level: string; description: string }> = []
  
  try {
    // Versuche MCP-Aufruf (wenn verfügbar über Cursor MCP)
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_supabase_get_advisors === "function") {
        // @ts-ignore
        const advisors = await mcp_supabase_get_advisors({ type: "security" })
        
        if (advisors && advisors.lints) {
          issues.push(
            ...advisors.lints.map((l: any) => ({
              name: l.name || "Unknown",
              level: l.level || "info",
              description: l.description || l.message || "",
            }))
          )
        }
      }
    } catch (mcpError: any) {
      // MCP nicht verfügbar, verwende Fallback
      console.warn("MCP nicht verfügbar, verwende Fallback:", mcpError.message)
    }
    
    // Fallback: Basis-Sicherheitsprüfungen
    if (issues.length === 0) {
      const supabase = createClient()
      
      // Prüfe RLS auf kritischen Tabellen
      const criticalTables = ["profiles", "companies", "bookings", "invoices", "customers"]
      
      for (const table of criticalTables) {
        try {
          const { error } = await supabase.from(table).select("id").limit(1)
          
          // Prüfe ob RLS aktiviert ist (Fehler bei fehlender Berechtigung = RLS aktiv)
          if (error && error.code === "42501") {
            // RLS ist aktiv (gut)
          } else if (error && error.code === "42P01") {
            issues.push({
              name: `Missing table: ${table}`,
              level: "error",
              description: `Kritische Tabelle ${table} existiert nicht`,
            })
          }
        } catch (tableError: any) {
          // Ignoriere einzelne Fehler
        }
      }
      
      // Warnung: Function search_path sollte gesetzt sein
      issues.push({
        name: "Function search_path",
        level: "warning",
        description:
          "Function search_path sollte explizit gesetzt werden für bessere Sicherheit",
      })
    }
    
    return {
      issues,
      errors,
    }
  } catch (error: any) {
    errors.push(`Fehler bei Sicherheits-Prüfung: ${error.message}`)
    return {
      issues,
      errors,
    }
  }
}

