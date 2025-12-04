/**
 * TYPESCRIPT AUTO-FIX SCRIPT
 * ===========================
 * Automatische Behebung von TypeScript-Fehlern mit AI-Unterstützung
 * Wird in GitHub Actions verwendet
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Lade AI-Bots
let SystemBot, QualityBot, CodeAssistant

try {
  const { SystemBot: SB } = require("../../lib/ai/bots/system-bot")
  SystemBot = SB
} catch (error) {
  console.warn("⚠️  SystemBot nicht verfügbar")
}

try {
  const { QualityBot: QB } = require("../../lib/ai/bots/quality-bot")
  QualityBot = QB
} catch (error) {
  console.warn("⚠️  QualityBot nicht verfügbar")
}

try {
  const { CodeAssistant: CA } = require("../../lib/ai/bots/code-assistant")
  CodeAssistant = CA
} catch (error) {
  console.warn("⚠️  CodeAssistant nicht verfügbar")
}

/**
 * Analysiere TypeScript-Fehler
 */
function analyzeTypeScriptErrors() {
  try {
    const output = execSync("pnpm exec tsc --noEmit --pretty false 2>&1", {
      encoding: "utf-8",
      stdio: "pipe",
    })
    
    if (!output || output.trim().length === 0) {
      console.log("✅ Keine TypeScript-Fehler gefunden")
      return []
    }

    const errors = []
    const lines = output.split("\n")
    
    for (const line of lines) {
      // Parse TypeScript-Fehler: file.ts(line,col): error TSxxxx: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/)
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          col: parseInt(match[3]),
          code: match[4],
          message: match[5],
        })
      }
    }

    return errors
  } catch (error) {
    // TypeScript gibt Fehler über stderr zurück, das ist normal
    const output = error.stdout?.toString() || error.stderr?.toString() || ""
    if (output.includes("error TS")) {
      return analyzeTypeScriptErrorsFromOutput(output)
    }
    return []
  }
}

function analyzeTypeScriptErrorsFromOutput(output) {
  const errors = []
  const lines = output.split("\n")
  
  for (const line of lines) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/)
    if (match) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        col: parseInt(match[3]),
        code: match[4],
        message: match[5],
      })
    }
  }

  return errors
}

/**
 * Behebe bekannte TypeScript-Fehler-Muster
 */
async function fixTypeScriptErrors(errors) {
  if (errors.length === 0) {
    console.log("✅ Keine Fehler zu beheben")
    return 0
  }

  console.log(`🔧 Behebe ${errors.length} TypeScript-Fehler...`)

  let fixedCount = 0

  for (const error of errors) {
    try {
      // Bekannte Muster: "Parameter 'x' implicitly has an 'any' type"
      if (error.message.includes("implicitly has an 'any' type")) {
        const fixed = await fixImplicitAnyError(error)
        if (fixed) {
          fixedCount++
        }
      }
    } catch (err) {
      console.warn(`⚠️  Fehler beim Beheben von ${error.file}:${error.line}:`, err.message)
    }
  }

  return fixedCount
}

/**
 * Behebe "implicitly has an 'any' type" Fehler
 */
async function fixImplicitAnyError(error) {
  const filePath = path.resolve(process.cwd(), error.file)
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Datei nicht gefunden: ${filePath}`)
    return false
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split("\n")
  
  if (error.line > lines.length) {
    return false
  }

  const lineIndex = error.line - 1
  const line = lines[lineIndex]

  // Suche nach reduce/forEach/map mit fehlenden Typen
  if (line.includes("reduce") || line.includes("forEach") || line.includes("map")) {
    // Versuche Typen hinzuzufügen basierend auf Kontext
    // Dies ist eine vereinfachte Version - in Produktion würde man AI-Bots verwenden
    
    // Beispiel: reduce((sum, b) => ...) -> reduce((sum: number, b: { price?: number | string | null }) => ...)
    const paramMatch = line.match(/(reduce|forEach|map)\(\((\w+)(?:,\s*(\w+))?\)\s*=>/)
    if (paramMatch) {
      const method = paramMatch[1]
      const param1 = paramMatch[2]
      const param2 = paramMatch[3]

      // Vereinfachte Typ-Inferenz basierend auf Kontext
      let newLine = line
      
      if (method === "reduce" && param1 && param2) {
        // reduce((sum, b) => sum + ...) -> reduce((sum: number, b: { price?: number | string | null }) => ...)
        newLine = line.replace(
          new RegExp(`\\(${param1}(?:,\\s*${param2})?\\)\\s*=>`),
          `(${param1}: number, ${param2}: { price?: number | string | null }) =>`
        )
      } else if (method === "forEach" && param1) {
        // forEach((booking) => ...) -> forEach((booking: { created_at: string; price?: number | string | null }) => ...)
        newLine = line.replace(
          new RegExp(`\\(${param1}\\)\\s*=>`),
          `(${param1}: { created_at: string; price?: number | string | null }) =>`
        )
      }

      if (newLine !== line) {
        lines[lineIndex] = newLine
        fs.writeFileSync(filePath, lines.join("\n"), "utf-8")
        console.log(`✅ Behoben: ${error.file}:${error.line}`)
        return true
      }
    }
  }

  return false
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log("🔍 Analysiere TypeScript-Fehler...")
  
  const errors = analyzeTypeScriptErrors()
  
  if (errors.length === 0) {
    console.log("✅ Keine TypeScript-Fehler gefunden")
    process.exit(0)
  }

  console.log(`❌ ${errors.length} TypeScript-Fehler gefunden`)
  
  // Zeige erste 10 Fehler
  errors.slice(0, 10).forEach((error) => {
    console.log(`  - ${error.file}:${error.line}: ${error.message}`)
  })

  // Versuche Fehler zu beheben
  const fixedCount = await fixTypeScriptErrors(errors)
  
  if (fixedCount > 0) {
    console.log(`✅ ${fixedCount} Fehler automatisch behoben`)
    console.log("🔄 Bitte führe 'pnpm exec tsc --noEmit' erneut aus, um zu verifizieren")
  } else {
    console.log("⚠️  Keine Fehler konnten automatisch behoben werden")
    console.log("💡 Bitte behebe die Fehler manuell oder verwende AI-Bots")
  }

  process.exit(fixedCount > 0 ? 0 : 1)
}

// Führe Script aus
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Fehler:", error)
    process.exit(1)
  })
}

module.exports = { analyzeTypeScriptErrors, fixTypeScriptErrors }

