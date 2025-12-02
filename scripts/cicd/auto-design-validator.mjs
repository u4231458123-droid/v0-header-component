#!/usr/bin/env node
/**
 * AUTOMATISCHER DESIGN-FEHLERERKENNUNG
 * ====================================
 * Prüft automatisch alle Design-Verstöße:
 * - Hardcoded Farben
 * - Inkonsistente Button/Tab-Farben
 * - Fehlende Design-System-Tokens
 * - Rundungen (rounded-lg vs rounded-2xl)
 * - Spacing-Verstöße
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname, relative } from "path"

const DESIGN_TOKENS = {
  primary: ["bg-primary", "text-primary", "border-primary"],
  muted: ["bg-muted", "text-muted-foreground", "border-muted"],
  foreground: ["text-foreground", "bg-foreground"],
  background: ["bg-background"],
  card: ["bg-card", "text-card-foreground"],
  destructive: ["bg-destructive", "text-destructive-foreground"],
  secondary: ["bg-secondary", "text-secondary-foreground"],
}

const FORBIDDEN_COLORS = [
  // Hardcoded Farben
  /bg-(blue|green|red|yellow|amber|indigo|purple|pink|slate|gray|zinc|neutral|emerald|teal|cyan|orange|rose|violet|fuchsia)-\d+/g,
  /text-(blue|green|red|yellow|amber|indigo|purple|pink|slate|gray|zinc|neutral|emerald|teal|cyan|orange|rose|violet|fuchsia)-\d+/g,
  /border-(blue|green|red|yellow|amber|indigo|purple|pink|slate|gray|zinc|neutral|emerald|teal|cyan|orange|rose|violet|fuchsia)-\d+/g,
  // Hex-Farben
  /#[0-9A-Fa-f]{6}/g,
  /#[0-9A-Fa-f]{3}/g,
  // RGB/RGBA
  /rgba?\([^)]+\)/g,
]

const FORBIDDEN_PATTERNS = [
  {
    pattern: /rounded-lg.*Card|Card.*rounded-lg/,
    message: "Cards müssen rounded-2xl verwenden, nicht rounded-lg",
    severity: "medium",
  },
  {
    pattern: /rounded-md.*Button|Button.*rounded-md/,
    message: "Buttons müssen rounded-xl verwenden, nicht rounded-md",
    severity: "medium",
  },
  {
    pattern: /gap-4(?!\d)|gap-6(?!\d)/,
    message: "Verwende gap-5 als Standard statt gap-4 oder gap-6",
    severity: "low",
  },
]

const ACTIVE_TAB_PATTERNS = [
  {
    pattern: /activeTab.*bg-card|bg-card.*activeTab/,
    message: "Aktive Tabs müssen bg-primary text-primary-foreground verwenden",
    severity: "high",
  },
  {
    pattern: /data-\[state=active\].*bg-background|bg-background.*data-\[state=active\]/,
    message: "Aktive Tabs müssen bg-primary text-primary-foreground verwenden",
    severity: "high",
  },
]

const FORBIDDEN_TERMS = [
  /kostenlos/gi,
  /gratis/gi,
  /\bfree\b/gi,
  /testen/gi,
  /Testphase/gi,
  /\btrial\b/gi,
  /unverbindlich/gi,
  /ohne Risiko/gi,
]

class DesignValidator {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir
    this.errors = []
    this.warnings = []
    this.info = []
  }

  /**
   * Scanne alle relevanten Dateien
   */
  scanFiles(dir = this.rootDir, fileList = []) {
    const files = readdirSync(dir)

    for (const file of files) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        // Ignoriere node_modules, .git, etc.
        if (
          !file.startsWith(".") &&
          file !== "node_modules" &&
          file !== ".next" &&
          file !== "dist" &&
          file !== "build"
        ) {
          this.scanFiles(filePath, fileList)
        }
      } else if (stat.isFile()) {
        const ext = extname(file)
        if ([".tsx", ".ts", ".jsx", ".js", ".css"].includes(ext)) {
          // Ignoriere generierte Dateien
          if (
            !filePath.includes("node_modules") &&
            !filePath.includes(".next") &&
            !filePath.includes("dist")
          ) {
            fileList.push(filePath)
          }
        }
      }
    }

    return fileList
  }

  /**
   * Validiere eine einzelne Datei
   */
  validateFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf-8")
      const lines = content.split("\n")
      const relativePath = relative(this.rootDir, filePath)

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNum = i + 1

        // Prüfe hardcoded Farben
        for (const pattern of FORBIDDEN_COLORS) {
          const matches = line.match(pattern)
          if (matches) {
            // Ignoriere Kommentare und bestimmte Ausnahmen
            if (
              !line.trim().startsWith("//") &&
              !line.trim().startsWith("*") &&
              !line.includes("// TODO:") &&
              !line.includes("// FIXME:") &&
              !line.includes("design-system") &&
              !line.includes("Design-Token")
            ) {
              this.errors.push({
                file: relativePath,
                line: lineNum,
                severity: "high",
                type: "hardcoded-color",
                message: `Hardcoded Farbe gefunden: ${matches[0]}. Verwende Design-Tokens (bg-primary, text-primary, etc.)`,
                code: line.trim(),
              })
            }
          }
        }

        // Prüfe Tab/Button-Farben
        for (const pattern of ACTIVE_TAB_PATTERNS) {
          if (pattern.pattern.test(line)) {
            this.errors.push({
              file: relativePath,
              line: lineNum,
              severity: pattern.severity,
              type: "inconsistent-tab-color",
              message: pattern.message,
              code: line.trim(),
            })
          }
        }

        // Prüfe andere Verstöße
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.pattern.test(line)) {
            if (pattern.severity === "high" || pattern.severity === "medium") {
              this.errors.push({
                file: relativePath,
                line: lineNum,
                severity: pattern.severity,
                type: "design-violation",
                message: pattern.message,
                code: line.trim(),
              })
            } else {
              this.warnings.push({
                file: relativePath,
                line: lineNum,
                severity: pattern.severity,
                type: "design-suggestion",
                message: pattern.message,
                code: line.trim(),
              })
            }
          }
        }

        // Prüfe verbotene Begriffe
        for (const term of FORBIDDEN_TERMS) {
          if (term.test(line)) {
            this.errors.push({
              file: relativePath,
              line: lineNum,
              severity: "critical",
              type: "forbidden-term",
              message: `Verbotener Begriff gefunden. Verwende erlaubte Alternativen.`,
              code: line.trim(),
            })
          }
        }
      }
    } catch (error) {
      this.errors.push({
        file: relativePath,
        line: 0,
        severity: "high",
        type: "file-error",
        message: `Fehler beim Lesen der Datei: ${error.message}`,
        code: "",
      })
    }
  }

  /**
   * Führe vollständige Validierung durch
   */
  validate() {
    console.log("🔍 Starte automatische Design-Validierung...\n")

    const files = this.scanFiles()
    console.log(`📁 Gefunden: ${files.length} Dateien\n`)

    for (const file of files) {
      this.validateFile(file)
    }

    return {
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      totalFiles: files.length,
    }
  }

  /**
   * Generiere Report
   */
  generateReport(results) {
    console.log("\n" + "=".repeat(80))
    console.log("📊 DESIGN-VALIDIERUNGS-REPORT")
    console.log("=".repeat(80) + "\n")

    console.log(`📁 Geprüfte Dateien: ${results.totalFiles}`)
    console.log(`❌ Fehler: ${results.errors.length}`)
    console.log(`⚠️  Warnungen: ${results.warnings.length}\n`)

    if (results.errors.length > 0) {
      console.log("❌ FEHLER:\n")
      const grouped = this.groupByFile(results.errors)
      for (const [file, errors] of Object.entries(grouped)) {
        console.log(`  📄 ${file}:`)
        for (const error of errors) {
          const severity = this.getSeverityIcon(error.severity)
          console.log(`    ${severity} Zeile ${error.line}: ${error.message}`)
          if (error.code) {
            console.log(`       → ${error.code.substring(0, 60)}${error.code.length > 60 ? "..." : ""}`)
          }
        }
        console.log()
      }
    }

    if (results.warnings.length > 0) {
      console.log("⚠️  WARNUNGEN:\n")
      const grouped = this.groupByFile(results.warnings)
      for (const [file, warnings] of Object.entries(grouped)) {
        console.log(`  📄 ${file}:`)
        for (const warning of warnings) {
          console.log(`    ⚠️  Zeile ${warning.line}: ${warning.message}`)
        }
        console.log()
      }
    }

    if (results.errors.length === 0 && results.warnings.length === 0) {
      console.log("✅ Keine Design-Verstöße gefunden!\n")
    }

    console.log("=".repeat(80) + "\n")

    return {
      success: results.errors.length === 0,
      errorCount: results.errors.length,
      warningCount: results.warnings.length,
    }
  }

  groupByFile(items) {
    const grouped = {}
    for (const item of items) {
      if (!grouped[item.file]) {
        grouped[item.file] = []
      }
      grouped[item.file].push(item)
    }
    return grouped
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case "critical":
        return "🔴"
      case "high":
        return "🟠"
      case "medium":
        return "🟡"
      case "low":
        return "🔵"
      default:
        return "⚪"
    }
  }
}

// Main
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DesignValidator()
  const results = validator.validate()
  const report = validator.generateReport(results)

  process.exit(report.success ? 0 : 1)
}

export { DesignValidator }

