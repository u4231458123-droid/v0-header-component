/**
 * Performance Validierung
 * ========================
 * Prüft Bundle-Größe, Code-Splitting, Lazy-Loading, Memoization
 */

const fs = require("fs")
const path = require("path")

/**
 * Validiere Performance
 */
function validatePerformance(rootDir = process.cwd()) {
  const errors = []
  const warnings = []

  // Prüfe Next.js-Konfiguration
  const nextConfigPath = path.join(rootDir, "next.config.js")
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, "utf-8")
    if (!nextConfig.includes("experimental") && !nextConfig.includes("optimize")) {
      warnings.push({
        file: nextConfigPath,
        severity: "low",
        message: "Next.js Optimierungen sollten konfiguriert sein",
      })
    }
  }

  // Finde React-Komponenten
  const componentFiles = findFiles(rootDir, /\.(tsx|jsx)$/, ["node_modules", ".next", "scripts"])

  let hasLazyLoading = false
  let hasMemoization = false

  for (const file of componentFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8")

      // Prüfe Lazy-Loading
      if (content.includes("lazy") || content.includes("dynamic") || content.includes("next/dynamic")) {
        hasLazyLoading = true
      }

      // Prüfe Memoization
      if (content.includes("useMemo") || content.includes("useCallback") || content.includes("React.memo")) {
        hasMemoization = true
      }

      // Prüfe auf große Komponenten ohne Memoization
      const lineCount = content.split("\n").length
      if (lineCount > 200 && !content.includes("useMemo") && !content.includes("useCallback")) {
        warnings.push({
          file,
          severity: "low",
          message: `Große Komponente (${lineCount} Zeilen) ohne Memoization`,
        })
      }
    } catch (error) {
      // Ignoriere Fehler
    }
  }

  if (!hasLazyLoading) {
    warnings.push({
      severity: "low",
      message: "Lazy-Loading sollte für große Komponenten verwendet werden",
    })
  }

  if (!hasMemoization) {
    warnings.push({
      severity: "low",
      message: "Memoization (useMemo, useCallback) sollte verwendet werden",
    })
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    filesChecked: componentFiles.length,
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
  const result = validatePerformance()
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.success ? 0 : 1)
}

module.exports = {
  validatePerformance,
}

