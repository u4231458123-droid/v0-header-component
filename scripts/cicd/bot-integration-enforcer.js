/**
 * BOT-INTEGRATION-ENFORCER
 * ========================
 * Verpflichtende Prüfung, dass alle Bots geladen sind
 * Blockiert bei fehlenden Bots
 * 
 * Verwendung:
 *   - Automatisch in mandatory-quality-gate.js
 *   - Manuell: node scripts/cicd/bot-integration-enforcer.js
 */

const fs = require("fs")
const path = require("path")

// Liste aller verpflichtenden Bots
const REQUIRED_BOTS = [
  "quality-bot",
  "system-bot",
  "prompt-optimization-bot",
  "master-bot",
  "documentation-bot",
  "code-assistant",
  "validation-coordinator",
]

// Liste aller optionalen Bots (sollten aber auch geladen werden)
const OPTIONAL_BOTS = [
  "legal-bot",
  "marketing-text-bot",
  "mailing-text-bot",
  "text-quality-bot",
  "quality-assistant",
  "legal-assistant",
  "marketing-text-assistant",
  "mailing-text-assistant",
  "text-quality-assistant",
]

/**
 * Prüfe ob Bot-Datei existiert
 */
function botFileExists(botName) {
  const botPath = path.join(__dirname, "../../lib/ai/bots", `${botName}.ts`)
  return fs.existsSync(botPath)
}

/**
 * Prüfe ob Bot geladen werden kann
 */
async function canLoadBot(botName) {
  try {
    const botModule = require(`../../lib/ai/bots/${botName}`)
    return botModule !== null && botModule !== undefined
  } catch (error) {
    return false
  }
}

/**
 * Hauptfunktion: Prüfe alle Bots
 */
async function enforceBotIntegration() {
  console.log("")
  console.log("🤖 BOT-INTEGRATION-ENFORCER")
  console.log("============================")
  console.log("")

  const missingBots = []
  const failedBots = []
  const loadedBots = []

  // Prüfe verpflichtende Bots
  for (const botName of REQUIRED_BOTS) {
    if (!botFileExists(botName)) {
      missingBots.push(botName)
      console.error(`❌ ${botName}: Datei fehlt`)
    } else if (!(await canLoadBot(botName))) {
      failedBots.push(botName)
      console.error(`❌ ${botName}: Kann nicht geladen werden`)
    } else {
      loadedBots.push(botName)
      console.log(`✅ ${botName}: Verfügbar`)
    }
  }

  // Prüfe optionale Bots (Warnung, aber kein Fehler)
  for (const botName of OPTIONAL_BOTS) {
    if (!botFileExists(botName)) {
      console.warn(`⚠️  ${botName}: Datei fehlt (optional)`)
    } else if (!(await canLoadBot(botName))) {
      console.warn(`⚠️  ${botName}: Kann nicht geladen werden (optional)`)
    } else {
      loadedBots.push(botName)
      console.log(`✅ ${botName}: Verfügbar (optional)`)
    }
  }

  console.log("")
  console.log("📊 ZUSAMMENFASSUNG")
  console.log("==================")
  console.log(`✅ Geladen: ${loadedBots.length} Bots`)
  console.log(`❌ Fehlend: ${missingBots.length} Bots`)
  console.log(`❌ Fehler: ${failedBots.length} Bots`)

  // Fehler wenn verpflichtende Bots fehlen
  if (missingBots.length > 0 || failedBots.length > 0) {
    console.log("")
    console.error("❌ BOT-INTEGRATION FEHLGESCHLAGEN!")
    console.error("💡 Alle verpflichtenden Bots müssen verfügbar sein!")
    console.error("")
    process.exit(1)
  }

  console.log("")
  console.log("✅ BOT-INTEGRATION ERFOLGREICH")
  console.log("")
  process.exit(0)
}

// Führe Prüfung aus
enforceBotIntegration().catch((error) => {
  console.error("❌ Fehler beim Ausführen des Bot-Integration-Enforcers:", error)
  process.exit(1)
})

