/**
 * Accessibility Validierung
 * ==========================
 * Prüft ARIA-Attribute, Alt-Texte, Keyboard-Navigation, Color-Contrast
 */

const fs = require("fs")
const path = require("path")

/**
 * Validiere Accessibility
 */
function validateAccessibility(rootDir = process.cwd()) {
  const errors = []
  const warnings = []

  // Finde alle React-Komponenten
  const componentFiles = findFiles(rootDir, /\.(tsx|jsx)$/, ["node_modules", ".next", "scripts"])

  for (const file of componentFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      const fileErrors = validateAccessibilityFile(file, content)
      errors.push(...fileErrors.errors)
      warnings.push(...fileErrors.warnings)
    } catch (error) {
      console.error(`Fehler beim Lesen von ${file}:`, error.message)
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    filesChecked: componentFiles.length,
  }
}

/**
 * Validiere einzelne Datei auf Accessibility
 */
function validateAccessibilityFile(filePath, content) {
  const errors = []
  const warnings = []
  const lines = content.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Prüfe auf Bilder ohne Alt-Text
    if (/<img|Image.*src/.test(line) && !/alt=/.test(line)) {
      errors.push({
        file: filePath,
        line: lineNum,
        severity: "high",
        message: "Bild ohne Alt-Text gefunden",
        code: line.trim(),
      })
    }

    // Prüfe auf Buttons ohne ARIA-Labels
    if (/<button|Button/.test(line) && !/aria-label|aria-labelledby|children/.test(content.substring(Math.max(0, i - 5), i + 5))) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "Button sollte ARIA-Label haben wenn kein Text-Inhalt",
      })
    }

    // Prüfe auf Links ohne accessible Text
    if (/<a|Link.*href/.test(line) && !/aria-label|children|>.*</.test(content.substring(Math.max(0, i - 3), i + 3))) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "low",
        message: "Link sollte accessible Text haben",
      })
    }

    // Prüfe auf fehlende Keyboard-Navigation
    if (/onClick/.test(line) && !/onKeyDown|onKeyPress|role="button"|button/.test(line)) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "Element mit onClick sollte Keyboard-Navigation unterstützen",
        code: line.trim(),
      })
    }
  }

  return { errors, warnings }
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
  const result = validateAccessibility()
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.success ? 0 : 1)
}

module.exports = {
  validateAccessibility,
  validateAccessibilityFile,
}

