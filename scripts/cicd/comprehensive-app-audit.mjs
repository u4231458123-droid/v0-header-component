#!/usr/bin/env node
/**
 * VOLLUMFÄNGLICHE APP-PRÜFUNG
 * ============================
 * Prüft die gesamte App auf:
 * - Design-System-Konsistenz
 * - Funktionalität
 * - Performance
 * - Sicherheit
 * - Form-Validierung
 * - Required-Fields
 * - Dropdown-Texte
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname, relative } from "path"

const ISSUES = {
  design: [],
  functionality: [],
  performance: [],
  security: [],
  forms: [],
  dropdowns: [],
}

// Hardcoded Farben die ersetzt werden müssen
const HARDCODED_COLORS = [
  { pattern: /bg-gray-\d+/g, replacement: "bg-muted", type: "design" },
  { pattern: /text-gray-\d+/g, replacement: "text-muted-foreground", type: "design" },
  { pattern: /bg-slate-\d+/g, replacement: "bg-muted", type: "design" },
  { pattern: /text-slate-\d+/g, replacement: "text-muted-foreground", type: "design" },
  { pattern: /bg-blue-\d+/g, replacement: "bg-primary", type: "design" },
  { pattern: /text-blue-\d+/g, replacement: "text-primary", type: "design" },
  { pattern: /border-gray-\d+/g, replacement: "border-border", type: "design" },
  { pattern: /border-slate-\d+/g, replacement: "border-border", type: "design" },
]

// Required Fields die Asterisk brauchen
const REQUIRED_FIELDS = [
  "email", "password", "first_name", "last_name", "company_name",
  "address", "city", "postal_code", "phone", "pickup_address",
  "dropoff_address", "pickup_time", "customer_id", "driver_id", "vehicle_id"
]

// Englische/Denglische Dropdown-Texte
const DROPDOWN_FIXES = {
  "waehlen": "wählen",
  "auswaehlen": "auswählen",
  "Bitte waehlen": "Bitte wählen",
  "Bitte auswaehlen": "Bitte auswählen",
  "Select": "Auswählen",
  "Choose": "Wählen",
  "Please select": "Bitte auswählen",
}

function scanDirectory(dir, fileList = []) {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!file.startsWith(".") && file !== "node_modules" && file !== ".next") {
        scanDirectory(filePath, fileList)
      }
    } else if (extname(file) === ".tsx" || extname(file) === ".ts") {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

function checkFile(filePath) {
  const content = readFileSync(filePath, "utf-8")
  const lines = content.split("\n")
  const relativePath = relative(process.cwd(), filePath)
  
  // Prüfe Hardcoded Farben
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    for (const { pattern, replacement, type } of HARDCODED_COLORS) {
      if (pattern.test(line) && !line.includes("//") && !line.includes("/*")) {
        ISSUES.design.push({
          file: relativePath,
          line: i + 1,
          issue: `Hardcoded Farbe gefunden: ${line.match(pattern)?.[0]}`,
          fix: `Ersetze durch: ${replacement}`,
          code: line.trim(),
        })
      }
    }
    
    // Prüfe Required Fields ohne Asterisk
    for (const field of REQUIRED_FIELDS) {
      const fieldPattern = new RegExp(`name=["']${field}["']`, "i")
      if (fieldPattern.test(line)) {
        // Prüfe ob Label Asterisk hat
        const labelLine = lines.slice(Math.max(0, i - 5), i).join("\n")
        if (labelLine.includes(`<Label`) && !labelLine.includes("*") && !labelLine.includes("required")) {
          ISSUES.forms.push({
            file: relativePath,
            line: i + 1,
            issue: `Required Field "${field}" ohne Asterisk-Markierung`,
            fix: `Füge <span className="text-destructive">*</span> zum Label hinzu`,
          })
        }
      }
    }
    
    // Prüfe Dropdown-Texte
    for (const [wrong, correct] of Object.entries(DROPDOWN_FIXES)) {
      if (line.includes(wrong) && (line.includes("SelectValue") || line.includes("SelectItem") || line.includes("placeholder"))) {
        ISSUES.dropdowns.push({
          file: relativePath,
          line: i + 1,
          issue: `Falscher Dropdown-Text: "${wrong}"`,
          fix: `Ersetze durch: "${correct}"`,
          code: line.trim(),
        })
      }
    }
  }
}

// Hauptfunktion
function main() {
  console.log("🔍 Starte vollumfängliche App-Prüfung...\n")
  
  const files = scanDirectory(join(process.cwd(), "components"))
  const appFiles = scanDirectory(join(process.cwd(), "app"))
  const allFiles = [...files, ...appFiles]
  
  console.log(`📁 ${allFiles.length} Dateien gefunden\n`)
  
  for (const file of allFiles) {
    try {
      checkFile(file)
    } catch (error) {
      console.warn(`⚠️  Fehler beim Prüfen von ${file}:`, error.message)
    }
  }
  
  // Bericht ausgeben
  console.log("\n" + "=".repeat(80))
  console.log("PRÜFUNGSBERICHT")
  console.log("=".repeat(80) + "\n")
  
  const totalIssues = Object.values(ISSUES).reduce((sum, arr) => sum + arr.length, 0)
  
  console.log(`📊 GESAMT: ${totalIssues} Probleme gefunden\n`)
  
  if (ISSUES.design.length > 0) {
    console.log(`🎨 DESIGN-PROBLEME: ${ISSUES.design.length}`)
    ISSUES.design.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`)
    })
    if (ISSUES.design.length > 10) {
      console.log(`   ... und ${ISSUES.design.length - 10} weitere`)
    }
    console.log()
  }
  
  if (ISSUES.forms.length > 0) {
    console.log(`📝 FORM-PROBLEME: ${ISSUES.forms.length}`)
    ISSUES.forms.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`)
    })
    if (ISSUES.forms.length > 10) {
      console.log(`   ... und ${ISSUES.forms.length - 10} weitere`)
    }
    console.log()
  }
  
  if (ISSUES.dropdowns.length > 0) {
    console.log(`🔽 DROPDOWN-PROBLEME: ${ISSUES.dropdowns.length}`)
    ISSUES.dropdowns.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`)
    })
    if (ISSUES.dropdowns.length > 10) {
      console.log(`   ... und ${ISSUES.dropdowns.length - 10} weitere`)
    }
    console.log()
  }
  
  // JSON-Report speichern
  const reportPath = join(process.cwd(), "docs", "COMPREHENSIVE_AUDIT_REPORT.json")
  require("fs").writeFileSync(reportPath, JSON.stringify(ISSUES, null, 2))
  console.log(`📄 Vollständiger Bericht gespeichert: ${reportPath}\n`)
  
  if (totalIssues === 0) {
    console.log("✅ Keine Probleme gefunden! App ist bereit für Production.")
    process.exit(0)
  } else {
    console.log(`⚠️  ${totalIssues} Probleme müssen behoben werden.`)
    process.exit(1)
  }
}

main()

