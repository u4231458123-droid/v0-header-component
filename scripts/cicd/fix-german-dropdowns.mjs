#!/usr/bin/env node
/**
 * AUTOMATISCHE KORREKTUR: Deutsche Dropdown-Texte
 * ================================================
 * Prüft und korrigiert alle Dropdown-Texte auf vollständiges Deutsch
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname, relative } from "path"

const ENGLISH_PATTERNS = [
  { pattern: /placeholder="[^"]*[A-Z][a-z]+[^"]*"/gi, type: "placeholder" },
  { pattern: /SelectItem.*>.*[A-Z][a-z]+.*</gi, type: "selectItem" },
  { pattern: /SelectValue.*placeholder="[^"]*[A-Z][a-z]+[^"]*"/gi, type: "selectValue" },
]

const COMMON_TRANSLATIONS = {
  "Please select": "Bitte wählen",
  "Select": "Auswählen",
  "Choose": "Wählen",
  "Status": "Status",
  "All": "Alle",
  "All Status": "Alle Status",
  "All Bookings": "Alle Buchungen",
  "Select Status": "Status wählen",
  "Select Partner": "Partner auswählen",
  "Select Customer": "Kunde auswählen",
  "Select Driver": "Fahrer auswählen",
  "Select Vehicle": "Fahrzeug auswählen",
  "Select Category": "Kategorie wählen",
  "Select Payment": "Zahlungsart wählen",
  "Select Time": "Zeitraum wählen",
}

class GermanDropdownFixer {
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

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, "utf-8")
      let modified = false
      const lines = content.split("\n")

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        // Fix common translations
        for (const [en, de] of Object.entries(COMMON_TRANSLATIONS)) {
          if (line.includes(en) && !line.includes(de)) {
            line = line.replace(new RegExp(en, "gi"), de)
            lines[i] = line
            modified = true
          }
        }

        // Fix placeholder="..." patterns
        const placeholderMatch = line.match(/placeholder="([^"]+)"/gi)
        if (placeholderMatch) {
          for (const match of placeholderMatch) {
            const text = match.match(/"([^"]+)"/)[1]
            // Check if it contains English words (capital letter followed by lowercase)
            if (/[A-Z][a-z]+/.test(text) && !text.includes("z.B.") && !text.includes("z.B")) {
              // Try to translate common patterns
              const translated = this.translateText(text)
              if (translated !== text) {
                line = line.replace(match, `placeholder="${translated}"`)
                lines[i] = line
                modified = true
              }
            }
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

  translateText(text) {
    // Common translations
    const translations = {
      "Please select": "Bitte wählen",
      "Please choose": "Bitte wählen",
      "Select": "Auswählen",
      "Choose": "Wählen",
      "Select a": "Wählen Sie einen",
      "Select an": "Wählen Sie einen",
      "Select the": "Wählen Sie den",
    }

    for (const [en, de] of Object.entries(translations)) {
      if (text.toLowerCase().includes(en.toLowerCase())) {
        return text.replace(new RegExp(en, "gi"), de)
      }
    }

    return text
  }

  fix() {
    console.log("🔍 Starte automatische Korrektur der Dropdown-Texte...\n")

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
      this.fixedFiles.forEach((file) => console.log(`   - ${file}`))
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
  const fixer = new GermanDropdownFixer()
  const result = fixer.fix()
  process.exit(result.errors > 0 ? 1 : 0)
}

export { GermanDropdownFixer }

