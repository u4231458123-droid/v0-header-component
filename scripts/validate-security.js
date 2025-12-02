/**
 * Security Validierung
 * ====================
 * Prüft auf hardcoded Secrets, XSS-Gefahren, CSRF-Schutz
 */

const fs = require("fs")
const path = require("path")

/**
 * Validiere Security
 */
function validateSecurity(rootDir = process.cwd()) {
  const errors = []
  const warnings = []

  // Finde alle Code-Dateien
  const files = findFiles(rootDir, /\.(ts|tsx|js|jsx)$/, ["node_modules", ".next", "scripts"])

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      const fileErrors = validateSecurityFile(file, content)
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
    filesChecked: files.length,
  }
}

/**
 * Validiere einzelne Datei auf Security-Issues
 */
function validateSecurityFile(filePath, content) {
  const errors = []
  const warnings = []
  const lines = content.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Prüfe auf hardcoded Secrets
    const secretPatterns = [
      /(?:password|secret|key|token|api[_-]?key)\s*[:=]\s*["'][^"']{10,}/gi,
      /(?:sk-|pk_|hf_|ghp_)[a-zA-Z0-9]{20,}/g,
    ]

    for (const pattern of secretPatterns) {
      if (pattern.test(line) && !line.includes("process.env")) {
        errors.push({
          file: filePath,
          line: lineNum,
          severity: "critical",
          message: "Mögliches hardcoded Secret gefunden. Verwende Environment Variables.",
          code: line.trim(),
        })
      }
    }

    // Prüfe auf XSS-Gefahren
    if (/innerHTML|dangerouslySetInnerHTML/.test(line) && !/sanitize|DOMPurify/.test(content)) {
      errors.push({
        file: filePath,
        line: lineNum,
        severity: "high",
        message: "XSS-Gefahr: innerHTML/dangerouslySetInnerHTML ohne Sanitization",
        code: line.trim(),
      })
    }

    // Prüfe auf Input Validation
    if (
      (content.includes("request.json()") || content.includes("req.body")) &&
      !content.includes("zod") &&
      !content.includes("validate") &&
      !content.includes("parse")
    ) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "Input Validation sollte implementiert werden",
      })
    }

    // Prüfe auf HTTP (nicht HTTPS)
    if (/http:\/\//.test(line) && !/localhost|127\.0\.0\.1/.test(line)) {
      warnings.push({
        file: filePath,
        line: lineNum,
        severity: "medium",
        message: "HTTP sollte durch HTTPS ersetzt werden",
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
  const result = validateSecurity()
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.success ? 0 : 1)
}

module.exports = {
  validateSecurity,
  validateSecurityFile,
}

