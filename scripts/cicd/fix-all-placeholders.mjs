#!/usr/bin/env node
/**
 * AUTOMATISCHE KORREKTUR: Alle Placeholder-Texte auf Deutsch
 * ===========================================================
 * Prüft und korrigiert alle Placeholder-Texte systemweit auf Deutsch
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname, relative } from "path"

const PLACEHOLDER_TRANSLATIONS = {
  // Englische Placeholder → Deutsche Übersetzung
  "Please select": "Bitte wählen",
  "Please choose": "Bitte wählen",
  "Select": "Auswählen",
  "Choose": "Wählen",
  "Select a": "Wählen Sie einen",
  "Select an": "Wählen Sie einen",
  "Select the": "Wählen Sie den",
  "Select status": "Status wählen",
  "Select customer": "Kunde auswählen",
  "Select driver": "Fahrer auswählen",
  "Select vehicle": "Fahrzeug auswählen",
  "Select category": "Kategorie wählen",
  "Select payment": "Zahlungsart wählen",
  "Select time": "Zeitraum wählen",
  "Select partner": "Partner auswählen",
  "Search customer": "Kunde suchen",
  "Search driver": "Fahrer suchen",
  "Search vehicle": "Fahrzeug suchen",
  "Enter": "Eingeben",
  "Type": "Eingeben",
  "Search": "Suchen",
  "Enter your": "Geben Sie Ihre",
  "Enter the": "Geben Sie die",
  "Your": "Ihre",
  "The": "Die",
  "A": "Ein",
  "An": "Ein",
  "Optional": "Optional",
  "Required": "Pflichtfeld",
  "e.g.": "z.B.",
  "for example": "z.B.",
  "example": "Beispiel",
  "min": "Min.",
  "max": "Max.",
  "at least": "Mindestens",
  "minimum": "Mindestens",
  "maximum": "Maximal",
}

const COMMON_PATTERNS = [
  { en: /placeholder="([^"]*[A-Z][a-z]+[^"]*)"/gi, fix: (match) => {
    const text = match.match(/"([^"]+)"/)[1]
    // Prüfe ob englisch
    if (/[A-Z][a-z]+/.test(text) && !text.includes("z.B.") && !text.includes("z.B")) {
      // Übersetze
      let translated = text
      for (const [en, de] of Object.entries(PLACEHOLDER_TRANSLATIONS)) {
        if (text.toLowerCase().includes(en.toLowerCase())) {
          translated = text.replace(new RegExp(en, "gi"), de)
          break
        }
      }
      return `placeholder="${translated}"`
    }
    return match
  }},
]

class PlaceholderFixer {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir
    this.fixedFiles = []
    this.errors = []
  }

  scanFiles(dir = this.rootDir, fileList = []) {
    const files = readdirSync(dir)

    for (const file of files) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
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
        if ([".tsx", ".ts", ".jsx", ".js"].includes(ext)) {
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

  translatePlaceholder(text) {
    // Direkte Übersetzungen
    for (const [en, de] of Object.entries(PLACEHOLDER_TRANSLATIONS)) {
      if (text.toLowerCase().includes(en.toLowerCase())) {
        return text.replace(new RegExp(en, "gi"), de)
      }
    }

    // Spezielle Muster
    if (text.toLowerCase().includes("select") && !text.includes("auswählen") && !text.includes("wählen")) {
      if (text.toLowerCase().includes("customer")) return "Kunde auswählen"
      if (text.toLowerCase().includes("driver")) return "Fahrer auswählen"
      if (text.toLowerCase().includes("vehicle")) return "Fahrzeug auswählen"
      if (text.toLowerCase().includes("status")) return "Status wählen"
      if (text.toLowerCase().includes("category")) return "Kategorie wählen"
      if (text.toLowerCase().includes("payment")) return "Zahlungsart wählen"
      return "Bitte wählen"
    }

    return text
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, "utf-8")
      let modified = false
      const lines = content.split("\n")

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        // Skip Kommentare
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          continue
        }

        // Fix placeholder="..."
        const placeholderRegex = /placeholder="([^"]+)"/gi
        let match
        while ((match = placeholderRegex.exec(line)) !== null) {
          const originalText = match[1]
          const translated = this.translatePlaceholder(originalText)
          
          if (translated !== originalText) {
            line = line.replace(match[0], `placeholder="${translated}"`)
            lines[i] = line
            modified = true
          }
        }

        // Fix SelectValue placeholder
        const selectValueRegex = /<SelectValue\s+placeholder="([^"]+)"\s*\/?>/gi
        while ((match = selectValueRegex.exec(line)) !== null) {
          const originalText = match[1]
          const translated = this.translatePlaceholder(originalText)
          
          if (translated !== originalText) {
            line = line.replace(match[0], `<SelectValue placeholder="${translated}" />`)
            lines[i] = line
            modified = true
          }
        }
      }

      if (modified) {
        const newContent = lines.join("\n")
        writeFileSync(filePath, newContent, "utf-8")
        this.fixedFiles.push(relative(this.rootDir, filePath))
        return true
      }
      return false
    } catch (error) {
      this.errors.push({
        file: relative(this.rootDir, filePath),
        error: error.message,
      })
      return false
    }
  }

  fix() {
    console.log("🔍 Starte automatische Korrektur aller Placeholder-Texte...\n")

    const files = this.scanFiles()
    console.log(`📁 Gefunden: ${files.length} Dateien\n`)

    let fixedCount = 0
    for (const file of files) {
      if (this.fixFile(file)) {
        fixedCount++
      }
    }

    console.log(`✅ ${fixedCount} Dateien korrigiert`)
    if (this.fixedFiles.length > 0) {
      console.log("\n📝 Korrigierte Dateien:")
      this.fixedFiles.slice(0, 20).forEach((file) => console.log(`   - ${file}`))
      if (this.fixedFiles.length > 20) {
        console.log(`   ... und ${this.fixedFiles.length - 20} weitere`)
      }
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Fehler:")
      this.errors.forEach((err) => console.log(`   - ${err.file}: ${err.error}`))
    }

    return {
      fixed: fixedCount,
      errors: this.errors.length,
    }
  }
}

// Main
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const fixer = new PlaceholderFixer()
  const result = fixer.fix()
  process.exit(result.errors > 0 ? 1 : 0)
}

export { PlaceholderFixer }

