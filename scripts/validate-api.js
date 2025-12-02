/**
 * API-Endpoints Validierung
 * ==========================
 * Prüft API-Endpoints auf Error Handling, Input Validation, Authentication
 */

const fs = require("fs")
const path = require("path")

/**
 * Validiere API-Endpoints
 */
function validateAPI(rootDir = process.cwd()) {
  const errors = []
  const warnings = []

  // Finde alle API-Route-Dateien
  const apiFiles = findFiles(rootDir, /route\.(ts|js)$/, ["node_modules", ".next"])

  for (const file of apiFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      const fileErrors = validateAPIFile(file, content)
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
    filesChecked: apiFiles.length,
  }
}

/**
 * Validiere einzelne API-Datei
 */
function validateAPIFile(filePath, content) {
  const errors = []
  const warnings = []

  // Prüfe ob Error Handling vorhanden
  const hasErrorHandling =
    content.includes("try") ||
    content.includes("catch") ||
    content.includes("error") ||
    content.includes("Error")

  if (!hasErrorHandling) {
    warnings.push({
      file: filePath,
      severity: "medium",
      message: "Kein explizites Error Handling gefunden",
    })
  }

  // Prüfe Input Validation
  const hasInputValidation =
    content.includes("zod") ||
    content.includes("validate") ||
    content.includes("schema") ||
    content.includes("parse")

  if (!hasInputValidation && content.includes("request.json()")) {
    warnings.push({
      file: filePath,
      severity: "medium",
      message: "Input Validation sollte implementiert werden (z.B. mit Zod)",
    })
  }

  // Prüfe Authentication
  const hasAuth =
    content.includes("getUser") ||
    content.includes("auth") ||
    content.includes("session") ||
    content.includes("createClient")

  if (!hasAuth && !filePath.includes("public")) {
    warnings.push({
      file: filePath,
      severity: "high",
      message: "Keine Authentication-Prüfung gefunden",
    })
  }

  // Prüfe auf hardcoded Secrets
  if (/password|secret|key|token.*=.*["'][^"']{10,}/.test(content)) {
    errors.push({
      file: filePath,
      severity: "critical",
      message: "Mögliches hardcoded Secret gefunden",
    })
  }

  // Prüfe auf unsichere API-Calls
  if (content.includes("fetch(") && !content.includes("https://")) {
    warnings.push({
      file: filePath,
      severity: "medium",
      message: "API-Calls sollten HTTPS verwenden",
    })
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
  const result = validateAPI()
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.success ? 0 : 1)
}

module.exports = {
  validateAPI,
  validateAPIFile,
}

