#!/usr/bin/env node
/**
 * Design-Token-Validierung
 * ========================
 * Prüft ob alle Komponenten Design-Tokens verwenden
 * Basierend auf CPO-Vorgaben
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

const FORBIDDEN_COLORS = [
  /bg-white\b/,
  /text-white\b/,
  /bg-gray-\d+/,
  /text-gray-\d+/,
  /bg-slate-\d+/,
  /text-slate-\d+/,
  /bg-emerald-\d+/,
  /text-emerald-\d+/,
  /bg-blue-\d+/,
  /text-blue-\d+/,
  /bg-green-\d+/,
  /text-green-\d+/,
  /bg-red-\d+/,
  /text-red-\d+/,
  /bg-yellow-\d+/,
  /text-yellow-\d+/,
]

const FORBIDDEN_ROUNDING = [
  /rounded-lg\b(?!.*badge)/, // rounded-lg ist OK für Badges
  /rounded-md\b(?!.*badge)/, // rounded-md ist OK für Badges
]

const FORBIDDEN_SPACING = [
  /gap-4\b/,
  /gap-6\b/,
]

const DESIGN_TOKENS = [
  /bg-primary/,
  /text-primary/,
  /bg-card/,
  /text-card/,
  /bg-foreground/,
  /text-foreground/,
  /bg-muted/,
  /text-muted/,
  /bg-success/,
  /text-success/,
  /bg-warning/,
  /text-warning/,
  /bg-destructive/,
  /text-destructive/,
  /bg-info/,
  /text-info/,
  /rounded-xl/,
  /rounded-2xl/,
  /gap-5/,
]

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.git/,
  /scripts/,
  /docs/,
  /wiki/,
  /public/,
  /\.config\./,
  /\.test\./,
  /\.spec\./,
]

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath))
}

function findFiles(dir, extensions = [".tsx", ".ts", ".jsx", ".js"]) {
  const files = []
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      
      if (shouldExclude(fullPath)) {
        continue
      }
      
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, extensions))
      } else if (entry.isFile()) {
        const ext = extname(entry.name)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files
}

function validateFile(filePath) {
  const content = readFileSync(filePath, "utf-8")
  const errors = []
  const warnings = []
  
  // Prüfe auf verbotene Farben
  FORBIDDEN_COLORS.forEach((pattern) => {
    const matches = content.match(new RegExp(pattern.source, "g"))
    if (matches) {
      matches.forEach((match) => {
        const line = content.substring(0, content.indexOf(match)).split("\n").length
        errors.push({
          file: filePath,
          line,
          type: "forbidden-color",
          message: `Verbotene Farbe gefunden: ${match}. Verwende Design-Tokens (bg-primary, text-foreground, etc.)`,
        })
      })
    }
  })
  
  // Prüfe auf falsche Rundungen (nur in kritischen Komponenten)
  if (filePath.includes("/app/") || filePath.includes("/components/")) {
    FORBIDDEN_ROUNDING.forEach((pattern) => {
      const matches = content.match(new RegExp(pattern.source, "g"))
      if (matches) {
        matches.forEach((match) => {
          const line = content.substring(0, content.indexOf(match)).split("\n").length
          warnings.push({
            file: filePath,
            line,
            type: "wrong-rounding",
            message: `Falsche Rundung gefunden: ${match}. Cards sollten rounded-2xl, Buttons rounded-xl verwenden.`,
          })
        })
      }
    })
  }
  
  // Prüfe auf falsche Spacing (nur in kritischen Komponenten)
  if (filePath.includes("/app/") || filePath.includes("/components/")) {
    FORBIDDEN_SPACING.forEach((pattern) => {
      const matches = content.match(new RegExp(pattern.source, "g"))
      if (matches) {
        matches.forEach((match) => {
          const line = content.substring(0, content.indexOf(match)).split("\n").length
          warnings.push({
            file: filePath,
            line,
            type: "wrong-spacing",
            message: `Falsche Spacing gefunden: ${match}. Standard sollte gap-5 sein.`,
          })
        })
      }
    })
  }
  
  return { errors, warnings }
}

function main() {
  console.log("🎨 Design-Token-Validierung")
  console.log("===========================\n")
  
  const appFiles = findFiles("app")
  const componentFiles = findFiles("components")
  const allFiles = [...appFiles, ...componentFiles]
  
  console.log(`📁 Gefundene Dateien: ${allFiles.length}\n`)
  
  const allErrors = []
  const allWarnings = []
  
  allFiles.forEach((file) => {
    const { errors, warnings } = validateFile(file)
    allErrors.push(...errors)
    allWarnings.push(...warnings)
  })
  
  // Ausgabe
  if (allErrors.length > 0) {
    console.log("❌ FEHLER (müssen behoben werden):\n")
    allErrors.forEach((error) => {
      console.log(`  ${error.file}:${error.line}`)
      console.log(`    ${error.message}\n`)
    })
  }
  
  if (allWarnings.length > 0) {
    console.log("⚠️ WARNUNGEN (sollten behoben werden):\n")
    allWarnings.forEach((warning) => {
      console.log(`  ${warning.file}:${warning.line}`)
      console.log(`    ${warning.message}\n`)
    })
  }
  
  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log("✅ Alle Design-Token-Prüfungen bestanden!\n")
    process.exit(0)
  } else {
    console.log(`\n📊 Zusammenfassung:`)
    console.log(`   Fehler: ${allErrors.length}`)
    console.log(`   Warnungen: ${allWarnings.length}\n`)
    
    if (allErrors.length > 0) {
      process.exit(1)
    } else {
      process.exit(0) // Warnungen blockieren nicht
    }
  }
}

main()
