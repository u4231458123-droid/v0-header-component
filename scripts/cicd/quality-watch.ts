/**
 * QUALITY-WATCH-MODE
 * ==================
 * Ueberwacht Datei-Aenderungen
 * Prueft sofort nach Speichern
 * Zeigt Fehler in Echtzeit
 */

import { watch } from "fs"
import { join, relative } from "path"
import { QualityBot } from "@/lib/ai/bots/quality-bot"
import { getErrorLearningSystem } from "@/lib/ai/error-learning"
import { readFileSync } from "fs"

const qualityBot = new QualityBot()
const errorLearning = getErrorLearningSystem()

// Dateien die ueberwacht werden sollen
const WATCH_PATTERNS = [
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx",
]

// Ignorierte Pfade
const IGNORE_PATTERNS = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
]

interface WatchResult {
  filePath: string
  errors: Array<{
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    line?: number
    suggestion: string
  }>
  timestamp: Date
}

/**
 * Pruefe eine Datei mit QualityBot
 */
async function checkFile(filePath: string): Promise<WatchResult> {
  try {
    const codeContent = readFileSync(filePath, "utf-8")
    const result = await qualityBot.checkCodeAgainstDocumentation(codeContent, {}, filePath)

    // Lerne aus Fehlern
    for (const violation of result.violations) {
      await errorLearning.learnError({
        id: `${filePath}-${violation.line || 0}-${Date.now()}`,
        type: violation.type === "design" ? "design" : violation.type === "functionality" ? "logic" : "other",
        severity: violation.severity,
        pattern: violation.message,
        message: violation.message,
        filePath: filePath,
        lineNumber: violation.line,
        context: codeContent.substring(Math.max(0, (violation.line || 0) - 10), (violation.line || 0) + 10),
        fix: violation.suggestion,
        occurrences: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        fixed: false,
      })
    }

    return {
      filePath,
      errors: result.violations,
      timestamp: new Date(),
    }
  } catch (error: any) {
    console.error(`❌ Fehler beim Prüfen von ${filePath}:`, error.message)
    return {
      filePath,
      errors: [
        {
          type: "other",
          severity: "high",
          message: `Fehler beim Prüfen: ${error.message}`,
          suggestion: "Bitte manuell prüfen",
        },
      ],
      timestamp: new Date(),
    }
  }
}

/**
 * Zeige Fehler in Echtzeit
 */
function displayErrors(result: WatchResult) {
  if (result.errors.length === 0) {
    console.log(`✅ ${result.filePath} - Keine Fehler`)
    return
  }

  console.log(`\n🔍 ${result.filePath} - ${result.errors.length} Fehler gefunden:`)
  for (const error of result.errors) {
    const icon = error.severity === "critical" ? "🔴" : error.severity === "high" ? "🟠" : error.severity === "medium" ? "🟡" : "🟢"
    console.log(`  ${icon} [${error.severity.toUpperCase()}] ${error.message}`)
    if (error.line) {
      console.log(`     Zeile: ${error.line}`)
    }
    if (error.suggestion) {
      console.log(`     Vorschlag: ${error.suggestion}`)
    }
  }
}

/**
 * Hauptfunktion: Watch-Mode starten
 */
async function startWatchMode() {
  console.log("🔍 Quality-Watch-Mode gestartet")
  console.log("Ueberwache Datei-Aenderungen...")
  console.log("Drücke Ctrl+C zum Beenden\n")

  const watchedFiles = new Map<string, NodeJS.Timeout>()

  // Watch-Verzeichnis
  const watchDir = process.cwd()

  // Initiale Pruefung aller relevanten Dateien
  console.log("📋 Initiale Pruefung...")
  const glob = require("glob")
  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    ignore: IGNORE_PATTERNS.map((pattern) => `**/${pattern}/**`),
    cwd: watchDir,
  })

  for (const file of files.slice(0, 10)) {
    // Pruefe nur erste 10 Dateien initial
    const filePath = join(watchDir, file)
    const result = await checkFile(filePath)
    displayErrors(result)
  }

  console.log("\n👀 Warte auf Datei-Aenderungen...\n")

  // Watch-Verzeichnis
  watch(
    watchDir,
    { recursive: true },
    async (eventType, filename) => {
      if (!filename) return

      // Pruefe ob Datei relevant ist
      const isRelevant = WATCH_PATTERNS.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"))
        return regex.test(filename)
      })

      if (!isRelevant) return

      // Pruefe ob Datei ignoriert werden soll
      const shouldIgnore = IGNORE_PATTERNS.some((pattern) => filename.includes(pattern))
      if (shouldIgnore) return

      const filePath = join(watchDir, filename)

      // Debounce: Warte 500ms bevor Pruefung
      if (watchedFiles.has(filePath)) {
        clearTimeout(watchedFiles.get(filePath)!)
      }

      const timeout = setTimeout(async () => {
        watchedFiles.delete(filePath)
        const result = await checkFile(filePath)
        displayErrors(result)
      }, 500)

      watchedFiles.set(filePath, timeout)
    }
  )
}

// Starte Watch-Mode
if (require.main === module) {
  startWatchMode().catch((error) => {
    console.error("❌ Fehler im Watch-Mode:", error)
    process.exit(1)
  })
}

export { startWatchMode, checkFile }

