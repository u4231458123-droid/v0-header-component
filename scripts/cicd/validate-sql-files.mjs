#!/usr/bin/env node
/**
 * SQL-Dateien-Validierung
 * ========================
 * Prüft alle SQL-Dateien im scripts/ Ordner
 * Stellt sicher, dass keine TypeScript/JavaScript-Dateien versehentlich als SQL markiert wurden
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"
import { createRequire } from "module"
const require = createRequire(import.meta.url)

// Import SQL-Validator (TypeScript-Module)
// Da wir in .mjs sind, müssen wir den Validator dynamisch laden
// Für jetzt: Inline-Implementierung der wichtigsten Funktionen
function isValidSQLFile(filePath) {
  if (!filePath) return false
  const normalizedPath = filePath.toLowerCase().trim()
  return normalizedPath.endsWith(".sql")
}

function validateSQLBeforeExecution(query, filePath) {
  const errors = []
  const warnings = []

  if (filePath && !isValidSQLFile(filePath)) {
    errors.push(`Ungültige Dateiendung: '${filePath}' (erwartet: .sql)`)
  }

  if (!query || typeof query !== "string") {
    errors.push("Inhalt ist leer oder kein String")
    return { valid: false, errors, warnings }
  }

  const trimmed = query.trim()

  // Prüfe auf verbotene JavaScript/TypeScript-Syntax
  const forbiddenPatterns = [
    { pattern: /^["']use\s+(client|server)["']/i, reason: "TypeScript 'use client'/'use server' Direktive gefunden" },
    { pattern: /^import\s+/i, reason: "JavaScript/TypeScript 'import' Statement gefunden" },
    { pattern: /^export\s+/i, reason: "JavaScript/TypeScript 'export' Statement gefunden" },
    { pattern: /^const\s+\w+\s*=/i, reason: "JavaScript 'const' Statement gefunden" },
    { pattern: /^function\s+\w+/i, reason: "JavaScript 'function' Statement gefunden" },
  ]

  for (const { pattern, reason } of forbiddenPatterns) {
    if (pattern.test(trimmed)) {
      errors.push(`Ungültiger SQL-Inhalt: ${reason}`)
      if (filePath) {
        errors.push(`Datei: ${filePath}`)
      }
      errors.push(
        "HINWEIS: Es scheint, dass eine TypeScript/JavaScript-Datei als SQL ausgeführt werden soll. Bitte prüfe den Dateipfad."
      )
      return { valid: false, errors, warnings }
    }
  }

  // Prüfe ob SQL-Keywords vorhanden sind
  const sqlKeywords = ["SELECT", "INSERT", "UPDATE", "CREATE", "ALTER", "DROP", "TABLE", "FROM", "WHERE"]
  const upperContent = trimmed.toUpperCase()
  const hasSQLKeyword = sqlKeywords.some((keyword) => upperContent.includes(keyword))

  if (!hasSQLKeyword && trimmed.length > 50) {
    errors.push("Keine SQL-Keywords gefunden (möglicherweise JavaScript/TypeScript-Code)")
    return { valid: false, errors, warnings }
  }

  return { valid: true, errors, warnings }
}

const ROOT_DIR = process.cwd()
const SCRIPTS_DIR = join(ROOT_DIR, "scripts")

class SQLFileValidator {
  constructor() {
    this.errors = []
    this.warnings = []
  }

  /**
   * Finde alle SQL-Dateien im scripts/ Ordner
   */
  findSQLFiles(dir = SCRIPTS_DIR) {
    const sqlFiles = []
    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          // Rekursiv in Unterordnern suchen
          sqlFiles.push(...this.findSQLFiles(fullPath))
        } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".sql") {
          sqlFiles.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Fehler beim Lesen von ${dir}:`, error.message)
    }
    return sqlFiles
  }

  /**
   * Validiere eine SQL-Datei
   */
  validateSQLFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf-8")
      const relativePath = filePath.replace(ROOT_DIR + "/", "")

      // Validiere Dateiendung
      if (!isValidSQLFile(filePath)) {
        this.errors.push({
          file: relativePath,
          error: "Dateiendung ist nicht .sql",
        })
        return
      }

      // Validiere Inhalt
      const validation = validateSQLBeforeExecution(content, filePath)
      if (!validation.valid) {
        this.errors.push({
          file: relativePath,
          errors: validation.errors,
        })
      }
      if (validation.warnings.length > 0) {
        this.warnings.push({
          file: relativePath,
          warnings: validation.warnings,
        })
      }
    } catch (error) {
      this.errors.push({
        file: filePath.replace(ROOT_DIR + "/", ""),
        error: `Fehler beim Lesen: ${error.message}`,
      })
    }
  }

  /**
   * Validiere alle SQL-Dateien
   */
  validateAll() {
    const sqlFiles = this.findSQLFiles()
    console.log(`📋 Gefundene SQL-Dateien: ${sqlFiles.length}`)

    for (const filePath of sqlFiles) {
      this.validateSQLFile(filePath)
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      fileCount: sqlFiles.length,
    }
  }

  /**
   * Generiere Report
   */
  generateReport(results) {
    console.log("\n" + "=".repeat(80))
    console.log("📊 SQL-DATEIEN-VALIDIERUNGS-REPORT")
    console.log("=".repeat(80) + "\n")

    console.log(`📁 Geprüfte SQL-Dateien: ${results.fileCount}`)
    console.log(`❌ Fehler: ${results.errors.length}`)
    console.log(`⚠️  Warnungen: ${results.warnings.length}\n`)

    if (results.errors.length > 0) {
      console.log("❌ FEHLER:\n")
      for (const error of results.errors) {
        console.log(`  📄 ${error.file}:`)
        if (error.error) {
          console.log(`    🔴 ${error.error}`)
        }
        if (error.errors) {
          for (const err of error.errors) {
            console.log(`    🔴 ${err}`)
          }
        }
        console.log()
      }
    }

    if (results.warnings.length > 0) {
      console.log("⚠️  WARNUNGEN:\n")
      for (const warning of results.warnings) {
        console.log(`  📄 ${warning.file}:`)
        for (const warn of warning.warnings) {
          console.log(`    ⚠️  ${warn}`)
        }
        console.log()
      }
    }

    if (results.errors.length === 0 && results.warnings.length === 0) {
      console.log("✅ Alle SQL-Dateien sind gültig!\n")
    }

    console.log("=".repeat(80) + "\n")

    return {
      success: results.success,
      errorCount: results.errors.length,
      warningCount: results.warnings.length,
    }
  }
}

// Main
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))

if (isMainModule || process.argv[1]?.includes("validate-sql-files")) {
  const validator = new SQLFileValidator()
  const results = validator.validateAll()
  const report = validator.generateReport(results)

  process.exit(report.success ? 0 : 1)
}

export { SQLFileValidator }

