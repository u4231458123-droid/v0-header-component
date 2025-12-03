/**
 * AUTOMATISCHER QUALITY-CHECKER SCRIPT
 * =====================================
 * Professionelle, robuste Lösung für automatische Code-Qualitätsprüfung
 * Wird automatisch nach Code-Änderungen ausgeführt
 * Prüft Code, behebt Fehler automatisch, gibt Rückmeldung
 * 
 * Verwendung: node scripts/cicd/auto-quality-check.js <filePath>
 */

const fs = require("fs")
const path = require("path")

/**
 * Lade AutoQualityChecker dynamisch (TypeScript-Module)
 */
async function loadAutoQualityChecker() {
  try {
    // Versuche Wrapper zu verwenden (CommonJS-kompatibel)
    const wrapper = require("../../lib/ai/bots/auto-quality-checker-wrapper")
    return wrapper.AutoQualityChecker
  } catch (error) {
    // Fallback: Verwende QualityBot direkt
    try {
      const QualityBot = require("../../lib/ai/bots/quality-bot").QualityBot
      
      // Erstelle einfachen Wrapper
      class SimpleAutoQualityChecker {
        async checkAndFix(filePath, code) {
          const bot = new QualityBot()
          const codeContent = code || fs.readFileSync(filePath, "utf-8")
          const checkResult = await bot.checkCodeAgainstDocumentation(codeContent, {}, filePath)
          
          // Einfache Auto-Fix-Logik
          let fixedCode = codeContent
          let autoFixed = false
          
          if (!checkResult.passed && checkResult.violations.length > 0) {
            const lines = fixedCode.split("\n")
            for (const violation of checkResult.violations) {
              if (violation.line && violation.type === "design") {
                const lineIndex = violation.line - 1
                if (lineIndex >= 0 && lineIndex < lines.length) {
                  let line = lines[lineIndex]
                  
                  // Auto-Fix: gap-4/gap-6 → gap-5
                  if (violation.message.includes("gap-4 oder gap-6")) {
                    line = line.replace(/gap-[46]/g, "gap-5")
                    if (line !== lines[lineIndex]) {
                      lines[lineIndex] = line
                      autoFixed = true
                    }
                  }
                  
                  // Auto-Fix: rounded-lg → rounded-2xl für Cards
                  if (violation.message.includes("rounded-lg.*Card")) {
                    line = line.replace(/rounded-lg(?=.*Card)/g, "rounded-2xl")
                    if (line !== lines[lineIndex]) {
                      lines[lineIndex] = line
                      autoFixed = true
                    }
                  }
                  
                  // Auto-Fix: rounded-md → rounded-xl für Buttons
                  if (violation.message.includes("rounded-md.*Button")) {
                    line = line.replace(/rounded-md(?=.*Button)/g, "rounded-xl")
                    if (line !== lines[lineIndex]) {
                      lines[lineIndex] = line
                      autoFixed = true
                    }
                  }
                }
              }
            }
            
            if (autoFixed) {
              fixedCode = lines.join("\n")
            }
          }
          
          return {
            success: checkResult.passed && !checkResult.violations.some(v => 
              v.severity === "critical" || v.severity === "high"
            ),
            filePath,
            violations: checkResult.violations.filter(v => 
              v.severity === "critical" || v.severity === "high"
            ),
            autoFixed,
            manualActionRequired: checkResult.violations.some(v => 
              v.severity === "critical" || v.severity === "high"
            ),
            fixedCode: autoFixed ? fixedCode : undefined,
          }
        }
      }
      
      return SimpleAutoQualityChecker
    } catch (err) {
      console.error("❌ Fehler beim Laden des QualityCheckers:", err.message)
      throw err
    }
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error("❌ Bitte Dateipfad angeben:")
    console.error("   node scripts/cicd/auto-quality-check.js <filePath>")
    process.exit(1)
  }

  // Prüfe ob Datei existiert
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Datei nicht gefunden: ${filePath}`)
    process.exit(1)
  }

  try {
    // Lade AutoQualityChecker
    const AutoQualityChecker = await loadAutoQualityChecker()
    const checker = new AutoQualityChecker()

    console.log(`🔍 Prüfe Code-Qualität: ${filePath}`)

    // Prüfe Code
    const result = await checker.checkAndFix(filePath)

    if (result.success) {
      console.log(`✅ Code-Qualität OK: ${filePath}`)
      process.exit(0)
    }

    // Auto-Fix angewendet
    if (result.autoFixed && result.fixedCode) {
      await fs.promises.writeFile(filePath, result.fixedCode, "utf-8")
      console.log(`✅ Auto-Fix angewendet: ${filePath}`)
      console.log(`   ${result.violations.length} verbleibende Violations`)
      
      if (result.violations.length > 0) {
        console.log(`\n⚠️  Verbleibende Violations:`)
        result.violations.forEach((v, i) => {
          console.log(`   ${i + 1}. [${v.severity.toUpperCase()}] ${v.type}`)
          if (v.line) console.log(`      Zeile ${v.line}: ${v.message}`)
          console.log(`      Vorschlag: ${v.suggestion}`)
        })
      }
      
      process.exit(0)
    }

    // Manuelle Eingriffe erforderlich
    console.log(`⚠️  Manuelle Eingriffe erforderlich: ${filePath}`)
    console.log(`   ${result.violations.length} Violations gefunden:\n`)

    result.violations.forEach((v, i) => {
      console.log(`   ${i + 1}. [${v.severity.toUpperCase()}] ${v.type}`)
      if (v.line) {
        console.log(`      Zeile ${v.line}: ${v.message}`)
      } else {
        console.log(`      ${v.message}`)
      }
      console.log(`      💡 Vorschlag: ${v.suggestion}\n`)
    })

    if (result.manualActionRequired) {
      console.log(`\n❌ Kritische Violations erfordern sofortige manuelle Behebung`)
      process.exit(1)
    } else {
      console.log(`\n⚠️  Violations gefunden, aber nicht kritisch`)
      process.exit(0)
    }
  } catch (error) {
    console.error(`❌ Fehler beim Quality-Check:`, error.message)
    if (error.stack) {
      console.error(`\nStack Trace:`, error.stack)
    }
    process.exit(1)
  }
}

// CLI-Interface
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error)
    process.exit(1)
  })
}

module.exports = {
  loadAutoQualityChecker,
  main,
}

