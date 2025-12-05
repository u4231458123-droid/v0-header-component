#!/usr/bin/env node
/**
 * ABHÄNGIGKEITS-PRÜFUNG
 * =====================
 * Prüft automatisch direkte und indirekte Abhängigkeiten bei Änderungen:
 * - Verwandte Dialoge: Sind alle ähnlichen Komponenten konsistent?
 * - DB-Schema-Änderungen: Sind TypeScript-Types aktualisiert?
 * - Neue Komponenten: Werden Design-Tokens verwendet?
 * - RLS-Policies: Bei neuen Tabellen/Spalten Policies prüfen
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs"
import { join, extname, relative, dirname } from "path"
import { execSync } from "child_process"

const ROOT_DIR = process.cwd()

// Gruppierungen verwandter Komponenten
const RELATED_COMPONENTS = {
  "DetailsDialog": [
    "components/bookings/BookingDetailsDialog.tsx",
    "components/invoices/InvoiceDetailsDialog.tsx",
    "components/finanzen/QuoteDetailsDialog.tsx",
    "components/drivers/DriverDetailsDialog.tsx",
    "components/customers/CustomerDetailsDialog.tsx",
    "components/settings/EmployeeDetailsDialog.tsx",
  ],
  "EditDialog": [
    "components/bookings/EditBookingDialog.tsx",
    "components/invoices/EditInvoiceDialog.tsx",
    "components/drivers/EditDriverDialog.tsx",
    "components/customers/EditCustomerDialog.tsx",
    "components/settings/EditEmployeeDialog.tsx",
  ],
  "CreateDialog": [
    "components/bookings/CreateBookingDialog.tsx",
    "components/invoices/NewInvoiceDialog.tsx",
    "components/finanzen/NewQuoteDialog.tsx",
  ],
}

// DB-Tabellen und zugehörige TypeScript-Types
const DB_TABLES_TO_TYPES = {
  "profiles": "types/supabase.ts",
  "bookings": "types/supabase.ts",
  "invoices": "types/supabase.ts",
  "quotes": "types/supabase.ts",
  "drivers": "types/supabase.ts",
  "customers": "types/supabase.ts",
  "vehicles": "types/supabase.ts",
  "documents": "types/supabase.ts",
}

class DependencyChecker {
  constructor(rootDir = ROOT_DIR) {
    this.rootDir = rootDir
    this.errors = []
    this.warnings = []
    this.changedFiles = this.getChangedFiles()
  }

  /**
   * Ermittle geänderte Dateien (via git diff)
   */
  getChangedFiles() {
    try {
      const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
        encoding: "utf-8",
        cwd: this.rootDir,
      })
      return output
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trim())
    } catch (error) {
      // Wenn kein git repo oder keine staged files, verwende alle relevanten Dateien
      return []
    }
  }

  /**
   * Prüfe ob verwandte Dialoge konsistent sind
   */
  checkRelatedDialogs(changedFile) {
    for (const [groupName, relatedFiles] of Object.entries(RELATED_COMPONENTS)) {
      if (relatedFiles.includes(changedFile)) {
        // Finde alle anderen Dateien in derselben Gruppe
        const otherFiles = relatedFiles.filter((f) => f !== changedFile)

        // Prüfe ob geänderte Datei bestimmte Patterns hat, die auch in anderen sein sollten
        const changedContent = this.readFile(changedFile)
        if (!changedContent) return

        // Prüfe auf created_by/updated_by Pattern
        const hasCreatedBy = /created_by|createdBy/.test(changedContent)
        const hasUpdatedBy = /updated_by|updatedBy/.test(changedContent)
        const hasBearbeiterInfo = /Bearbeiter|Erstellt von|Zuletzt bearbeitet/.test(changedContent)

        for (const otherFile of otherFiles) {
          if (!existsSync(join(this.rootDir, otherFile))) continue

          const otherContent = this.readFile(otherFile)
          if (!otherContent) continue

          // Prüfe Konsistenz
          if (hasCreatedBy && !/created_by|createdBy/.test(otherContent)) {
            this.warnings.push({
              file: changedFile,
              type: "inconsistent-dialog",
              message: `${otherFile} sollte auch created_by/updated_by unterstützen (wie ${changedFile})`,
            })
          }

          if (hasBearbeiterInfo && !/Bearbeiter|Erstellt von|Zuletzt bearbeitet/.test(otherContent)) {
            this.warnings.push({
              file: changedFile,
              type: "inconsistent-dialog",
              message: `${otherFile} sollte auch Bearbeiter-Info anzeigen (wie ${changedFile})`,
            })
          }
        }
      }
    }
  }

  /**
   * Prüfe ob DB-Schema-Änderungen TypeScript-Types aktualisiert haben
   */
  checkTypeScriptTypes(changedFile) {
    // Prüfe ob SQL-Migration geändert wurde
    if (!changedFile.includes("scripts/") || !changedFile.endsWith(".sql")) {
      return
    }

    const sqlContent = this.readFile(changedFile)
    if (!sqlContent) return

    // Finde alle Tabellen, die geändert wurden
    const tableMatches = sqlContent.match(/ALTER TABLE\s+(\w+)|CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/gi)
    if (!tableMatches) return

    const tables = []
    for (const match of tableMatches) {
      const tableMatch = match.match(/(?:ALTER|CREATE)\s+TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)
      if (tableMatch) {
        tables.push(tableMatch[1])
      }
    }

    // Prüfe ob TypeScript-Types existieren und aktuell sind
    for (const table of tables) {
      if (DB_TABLES_TO_TYPES[table]) {
        const typesFile = join(this.rootDir, DB_TABLES_TO_TYPES[table])
        if (!existsSync(typesFile)) {
          this.errors.push({
            file: changedFile,
            type: "missing-types",
            message: `SQL-Migration ändert Tabelle '${table}', aber TypeScript-Types fehlen in ${DB_TABLES_TO_TYPES[table]}`,
          })
        }
      }
    }
  }

  /**
   * Prüfe ob neue Komponenten Design-Tokens verwenden
   */
  checkDesignTokens(changedFile) {
    if (!changedFile.includes("components/") || (!changedFile.endsWith(".tsx") && !changedFile.endsWith(".ts"))) {
      return
    }

    const content = this.readFile(changedFile)
    if (!content) return

    // Prüfe auf hardcoded Farben
    const hardcodedColors = [
      /#[0-9A-Fa-f]{6}/g,
      /bg-(blue|green|red|yellow|amber|indigo|purple|pink|slate|gray|zinc|neutral|emerald|teal|cyan|orange|rose|violet|fuchsia)-\d+/g,
      /text-(blue|green|red|yellow|amber|indigo|purple|pink|slate|gray|zinc|neutral|emerald|teal|cyan|orange|rose|violet|fuchsia)-\d+/g,
    ]

    const lines = content.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Ignoriere Kommentare
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue

      for (const pattern of hardcodedColors) {
        if (pattern.test(line)) {
          this.errors.push({
            file: changedFile,
            line: i + 1,
            type: "hardcoded-color",
            message: `Hardcoded Farbe gefunden. Verwende Design-Tokens (bg-primary, text-muted-foreground, etc.)`,
            code: line.trim(),
          })
        }
      }
    }
  }

  /**
   * Prüfe RLS-Policies bei neuen Tabellen/Spalten
   */
  checkRLSPolicies(changedFile) {
    if (!changedFile.includes("scripts/") || !changedFile.endsWith(".sql")) {
      return
    }

    const sqlContent = this.readFile(changedFile)
    if (!sqlContent) return

    // Prüfe ob neue Tabelle erstellt wird
    if (/CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/i.test(sqlContent)) {
      const tableMatch = sqlContent.match(/CREATE TABLE\s+IF NOT EXISTS\s+(\w+)/i)
      if (tableMatch) {
        const tableName = tableMatch[1]

        // Prüfe ob RLS aktiviert wird
        if (!new RegExp(`ALTER TABLE\\s+${tableName}.*ENABLE ROW LEVEL SECURITY`, "i").test(sqlContent)) {
          this.warnings.push({
            file: changedFile,
            type: "missing-rls",
            message: `Neue Tabelle '${tableName}' sollte RLS aktivieren: ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
          })
        }

        // Prüfe ob Policies erstellt werden
        if (!new RegExp(`CREATE POLICY.*ON\\s+${tableName}`, "i").test(sqlContent)) {
          this.warnings.push({
            file: changedFile,
            type: "missing-policies",
            message: `Neue Tabelle '${tableName}' sollte RLS-Policies haben`,
          })
        }
      }
    }
  }

  /**
   * Lese Datei-Inhalt
   */
  readFile(filePath) {
    try {
      const fullPath = join(this.rootDir, filePath)
      if (!existsSync(fullPath)) return null
      return readFileSync(fullPath, "utf-8")
    } catch (error) {
      return null
    }
  }

  /**
   * Führe alle Prüfungen durch
   */
  check() {
    console.log("🔍 Starte Abhängigkeits-Prüfung...\n")

    if (this.changedFiles.length === 0) {
      console.log("ℹ️  Keine geänderten Dateien gefunden (git diff --cached)")
      return {
        success: true,
        errors: [],
        warnings: [],
      }
    }

    console.log(`📁 Gefundene geänderte Dateien: ${this.changedFiles.length}\n`)

    for (const file of this.changedFiles) {
      // Prüfe verwandte Dialoge
      this.checkRelatedDialogs(file)

      // Prüfe TypeScript-Types bei DB-Änderungen
      this.checkTypeScriptTypes(file)

      // Prüfe Design-Tokens bei neuen Komponenten
      this.checkDesignTokens(file)

      // Prüfe RLS-Policies bei DB-Änderungen
      this.checkRLSPolicies(file)
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    }
  }

  /**
   * Kategorisiere Fehler in kritisch (blockierend) und nicht-kritisch (Warnung)
   */
  categorizeErrors(errors) {
    const criticalErrors = []
    const nonCriticalWarnings = []

    for (const error of errors) {
      // Kritische Fehler (blockieren Commit/Push):
      // - Hardcoded Farben (Design-Konsistenz)
      // - Fehlende TypeScript-Types bei DB-Änderungen
      if (error.type === "hardcoded-color" || error.type === "missing-types") {
        criticalErrors.push(error)
      } else {
        // Alle anderen Fehler werden zu Warnungen (nicht blockierend)
        nonCriticalWarnings.push(error)
      }
    }

    return { criticalErrors, nonCriticalWarnings }
  }

  /**
   * Generiere Report
   */
  generateReport(results) {
    console.log("\n" + "=".repeat(80))
    console.log("📊 ABHÄNGIGKEITS-PRÜFUNGS-REPORT")
    console.log("=".repeat(80) + "\n")

    console.log(`📁 Geprüfte Dateien: ${this.changedFiles.length}`)
    
    // Kategorisiere Fehler
    const { criticalErrors, nonCriticalWarnings } = this.categorizeErrors(results.errors)
    const allWarnings = [...nonCriticalWarnings, ...results.warnings]

    console.log(`❌ Kritische Fehler: ${criticalErrors.length}`)
    console.log(`⚠️  Warnungen: ${allWarnings.length}\n`)

    if (criticalErrors.length > 0) {
      console.log("❌ KRITISCHE FEHLER (blockieren Commit/Push):\n")
      const grouped = this.groupByFile(criticalErrors)
      for (const [file, errors] of Object.entries(grouped)) {
        console.log(`  📄 ${file}:`)
        for (const error of errors) {
          console.log(`    🔴 ${error.type}: ${error.message}`)
          if (error.code) {
            console.log(`       → ${error.code.substring(0, 60)}${error.code.length > 60 ? "..." : ""}`)
          }
        }
        console.log()
      }
    }

    if (allWarnings.length > 0) {
      console.log("⚠️  WARNUNGEN (nicht blockierend):\n")
      const grouped = this.groupByFile(allWarnings)
      for (const [file, warnings] of Object.entries(grouped)) {
        console.log(`  📄 ${file}:`)
        for (const warning of warnings) {
          console.log(`    ⚠️  ${warning.type}: ${warning.message}`)
        }
        console.log()
      }
    }

    if (criticalErrors.length === 0 && allWarnings.length === 0) {
      console.log("✅ Keine Abhängigkeits-Probleme gefunden!\n")
    }

    console.log("=".repeat(80) + "\n")

    return {
      success: criticalErrors.length === 0, // Nur kritische Fehler blockieren
      errorCount: criticalErrors.length,
      warningCount: allWarnings.length,
      criticalErrors,
      warnings: allWarnings,
    }
  }

  groupByFile(items) {
    const grouped = {}
    for (const item of items) {
      const key = item.file || "unknown"
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(item)
    }
    return grouped
  }
}

// Main
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))

if (isMainModule || process.argv[1]?.includes("check-dependencies")) {
  const checker = new DependencyChecker()
  const results = checker.check()
  const report = checker.generateReport(results)

  // Exit-Code: 0 = Erfolg, 1 = Kritische Fehler (blockierend), 2 = Nur Warnungen (nicht blockierend)
  if (report.errorCount > 0) {
    console.log("❌ Kritische Fehler gefunden - Commit/Push wird blockiert")
    process.exit(1)
  } else if (report.warningCount > 0) {
    console.log("⚠️  Warnungen gefunden, aber nicht blockierend")
    process.exit(0) // Warnungen blockieren nicht
  } else {
    console.log("✅ Keine Probleme gefunden")
    process.exit(0)
  }
}

export { DependencyChecker }

