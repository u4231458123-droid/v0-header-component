/**
 * AUTO-QUALITY-CHECKER WRAPPER (CommonJS)
 * ========================================
 * CommonJS-Wrapper für TypeScript-Module
 * Ermöglicht direkten Import in Node.js-Scripts
 */

const fs = require("fs")
const path = require("path")

/**
 * Wrapper-Klasse für AutoQualityChecker
 * Lädt TypeScript-Module dynamisch
 */
class AutoQualityCheckerWrapper {
  constructor() {
    this.checker = null
    this.initialized = false
  }

  /**
   * Initialisiere QualityChecker
   */
  async initialize() {
    if (this.initialized) return

    try {
      // Versuche TypeScript-Modul zu laden
      // Da TypeScript-Module kompiliert werden müssen, verwenden wir einen Workaround
      const modulePath = path.resolve(__dirname, "./auto-quality-checker")
      
      // Prüfe ob kompilierte .js Version existiert
      const compiledPath = modulePath + ".js"
      if (fs.existsSync(compiledPath)) {
        const module = require(compiledPath)
        const AutoQualityChecker = module.AutoQualityChecker || module.default?.AutoQualityChecker
        if (AutoQualityChecker) {
          this.checker = new AutoQualityChecker()
          this.initialized = true
          return
        }
      }

      // Fallback: Verwende QualityBot direkt
      const QualityBot = require("./quality-bot").QualityBot
      this.checker = {
        checkAndFix: async (filePath, code) => {
          const bot = new QualityBot()
          const codeContent = code || fs.readFileSync(filePath, "utf-8")
          const checkResult = await bot.checkCodeAgainstDocumentation(codeContent, {}, filePath)
          
          return {
            success: checkResult.passed,
            filePath,
            violations: checkResult.violations,
            autoFixed: false,
            manualActionRequired: checkResult.violations.some(v => 
              v.severity === "critical" || v.severity === "high"
            ),
          }
        }
      }
      this.initialized = true
    } catch (error) {
      console.error("Fehler beim Initialisieren des QualityCheckers:", error)
      throw error
    }
  }

  /**
   * Prüfe Code und behebe Fehler
   */
  async checkAndFix(filePath, code) {
    await this.initialize()
    return await this.checker.checkAndFix(filePath, code)
  }
}

module.exports = {
  AutoQualityChecker: AutoQualityCheckerWrapper,
}

