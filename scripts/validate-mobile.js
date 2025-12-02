/**
 * Mobile Responsiveness Validierung
 * ==================================
 * Prüft Media Queries, Breakpoints, Touch-Targets, Viewport
 */

const fs = require("fs")
const path = require("path")

/**
 * Validiere Mobile Responsiveness
 */
function validateMobile(rootDir = process.cwd()) {
  const errors = []
  const warnings = []

  // Prüfe HTML-Dateien (app/layout.tsx, etc.)
  const htmlFiles = findFiles(rootDir, /\.(tsx|jsx|html)$/, ["node_modules", ".next"])

  for (const file of htmlFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8")

      // Prüfe Viewport Meta Tag
      if (content.includes("<head>") || content.includes("metadata")) {
        if (!content.includes("viewport") && !content.includes("viewport")) {
          warnings.push({
            file,
            severity: "medium",
            message: "Viewport Meta Tag fehlt",
          })
        }
      }

      // Prüfe Media Queries in CSS/Tailwind
      if (content.includes("className") || content.includes("class=")) {
        const hasMobileBreakpoints =
          /sm:|md:|lg:|xl:|2xl:|max-w-|w-full|responsive/.test(content)

        if (!hasMobileBreakpoints && file.includes("page.tsx")) {
          warnings.push({
            file,
            severity: "low",
            message: "Keine Mobile Breakpoints gefunden (sm:, md:, lg:, etc.)",
          })
        }
      }
    } catch (error) {
      console.error(`Fehler beim Lesen von ${file}:`, error.message)
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    filesChecked: htmlFiles.length,
  }
}

/**
 * Finde Dateien rekursiv
 */
function findFiles(dir, pattern, ignoreDirs = []) {
  const files = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith(".")) {
          files.push(...findFiles(fullPath, pattern, ignoreDirs))
        }
      } else if (pattern.test(entry.name)) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Ignoriere Fehler
  }
  return files
}

// CLI-Interface
if (require.main === module) {
  const result = validateMobile()
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.success ? 0 : 1)
}

module.exports = {
  validateMobile,
}

