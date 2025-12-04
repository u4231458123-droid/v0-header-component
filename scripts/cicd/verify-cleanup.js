/**
 * VERIFY CLEANUP SCRIPT
 * =====================
 * Verifiziert dass alle Master-Admin-Referenzen aus produktivem Code entfernt wurden
 * Prueft TypeScript-Fehler
 * Prueft korrekte E-Mail-Adressen
 * Gibt detaillierten Status-Report aus
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Verbotene Patterns im produktiven Code
const FORBIDDEN_PATTERNS = [
  /courbois1981@gmail\.com/,
  /master_admin/,
  /MASTER_ADMIN/,
  /isMasterAccount/,
  /isMasterAdmin/,
  /MASTER_ACCOUNT/,
]

// Erlaubte Verzeichnisse (nur produktiver Code)
const PRODUCTIVE_DIRS = [
  "app",
  "components",
  "lib",
  "hooks",
  "scripts/cicd",
]

// Ausgeschlossene Verzeichnisse (Dokumentation ist OK)
const EXCLUDED_DIRS = [
  "docs",
  "wiki",
  "node_modules",
  ".git",
  ".next",
  "scripts/028",
  "scripts/029",
]

// Erlaubte Dateien in scripts (nur CI/CD)
const ALLOWED_SCRIPT_FILES = [
  "scripts/cicd",
  "scripts/028_create_nexify_account.sql", // SQL-Migration ist OK
  "scripts/029_remove_master_admin_policies.sql", // SQL-Migration ist OK
]

/**
 * Pruefe ob Datei produktiver Code ist
 */
function isProductiveCode(filePath) {
  // Pruefe ausgeschlossene Verzeichnisse
  for (const excluded of EXCLUDED_DIRS) {
    if (filePath.includes(excluded)) {
      return false
    }
  }

  // Pruefe erlaubte Verzeichnisse
  for (const dir of PRODUCTIVE_DIRS) {
    if (filePath.startsWith(dir)) {
      return true
    }
  }

  // Pruefe erlaubte Script-Dateien
  for (const allowed of ALLOWED_SCRIPT_FILES) {
    if (filePath.includes(allowed)) {
      return true
    }
  }

  return false
}

/**
 * Pruefe Datei auf verbotene Patterns
 */
function checkFileForForbiddenPatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const violations = []

  for (const pattern of FORBIDDEN_PATTERNS) {
    const matches = content.match(new RegExp(pattern.source, "g"))
    if (matches) {
      const lines = content.split("\n")
      matches.forEach((match) => {
        const lineIndex = lines.findIndex((line) => line.includes(match))
        if (lineIndex >= 0) {
          violations.push({
            pattern: pattern.source,
            line: lineIndex + 1,
            match: match,
          })
        }
      })
    }
  }

  return violations
}

/**
 * Pruefe TypeScript-Fehler
 */
function checkTypeScriptErrors() {
  try {
    const output = execSync("pnpm exec tsc --noEmit --pretty false 2>&1", {
      encoding: "utf-8",
      stdio: "pipe",
      cwd: process.cwd(),
    })

    const errors = []
    const lines = output.split("\n")

    for (const line of lines) {
      if (line.includes("error TS")) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/)
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            code: match[4],
            message: match[5],
          })
        }
      }
    }

    return errors
  } catch (error) {
    // TypeScript gibt Fehler ueber stderr zurueck
    const output = error.stdout?.toString() || error.stderr?.toString() || ""
    const errors = []
    const lines = output.split("\n")

    for (const line of lines) {
      if (line.includes("error TS")) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/)
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            code: match[4],
            message: match[5],
          })
        }
      }
    }

    return errors
  }
}

/**
 * Pruefe auf korrekte E-Mail-Adresse
 */
function checkEmailAddresses() {
  const violations = []
  const files = getAllProductiveFiles()

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")

    // Pruefe auf alte E-Mail (sollte nicht mehr vorkommen)
    if (content.includes("nexify.login@gmail.com") && !file.includes("028_create_nexify_account.sql")) {
      violations.push({
        file,
        issue: "Alte E-Mail-Adresse 'nexify.login@gmail.com' gefunden (sollte 'login.nexify@gmail.com' sein)",
      })
    }

    // Pruefe auf korrekte E-Mail
    if (content.includes("login.nexify@gmail.com")) {
      // Das ist OK
    }
  }

  return violations
}

/**
 * Hole alle produktiven Dateien
 */
function getAllProductiveFiles() {
  const files = []

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      // Ueberspringe ausgeschlossene Verzeichnisse
      if (entry.isDirectory()) {
        let shouldExclude = false
        for (const excluded of EXCLUDED_DIRS) {
          if (fullPath.includes(excluded)) {
            shouldExclude = true
            break
          }
        }
        if (!shouldExclude) {
          walkDir(fullPath)
        }
      } else if (entry.isFile()) {
        // Nur TypeScript/TSX/JS/JSX Dateien
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          if (isProductiveCode(fullPath)) {
            files.push(fullPath)
          }
        }
      }
    }
  }

  // Starte von Projekt-Root
  walkDir(process.cwd())

  return files
}

/**
 * Hauptfunktion
 */
function main() {
  console.log("🔍 VERIFY CLEANUP - Starte Verifizierung...\n")

  const results = {
    forbiddenPatterns: [],
    typescriptErrors: [],
    emailViolations: [],
    overall: { success: true, errors: [], warnings: [] },
  }

  // 1. Pruefe auf verbotene Patterns
  console.log("1. Pruefe auf verbotene Master-Admin-Patterns...")
  const files = getAllProductiveFiles()
  for (const file of files) {
    const violations = checkFileForForbiddenPatterns(file)
    if (violations.length > 0) {
      results.forbiddenPatterns.push({
        file,
        violations,
      })
      results.overall.success = false
      results.overall.errors.push(`Verbotene Patterns in ${file}`)
    }
  }

  if (results.forbiddenPatterns.length === 0) {
    console.log("✅ Keine verbotenen Patterns gefunden\n")
  } else {
    console.log(`❌ ${results.forbiddenPatterns.length} Dateien mit verbotenen Patterns gefunden\n`)
    results.forbiddenPatterns.forEach((item) => {
      console.log(`  - ${item.file}`)
      item.violations.forEach((v) => {
        console.log(`    Zeile ${v.line}: ${v.pattern}`)
      })
    })
    console.log("")
  }

  // 2. Pruefe TypeScript-Fehler
  console.log("2. Pruefe TypeScript-Fehler...")
  results.typescriptErrors = checkTypeScriptErrors()
  if (results.typescriptErrors.length === 0) {
    console.log("✅ Keine TypeScript-Fehler gefunden\n")
  } else {
    console.log(`❌ ${results.typescriptErrors.length} TypeScript-Fehler gefunden\n`)
    results.overall.success = false
    results.overall.errors.push(`${results.typescriptErrors.length} TypeScript-Fehler`)
    results.typescriptErrors.slice(0, 10).forEach((error) => {
      console.log(`  - ${error.file}:${error.line} - ${error.message}`)
    })
    if (results.typescriptErrors.length > 10) {
      console.log(`  ... und ${results.typescriptErrors.length - 10} weitere`)
    }
    console.log("")
  }

  // 3. Pruefe E-Mail-Adressen
  console.log("3. Pruefe E-Mail-Adressen...")
  results.emailViolations = checkEmailAddresses()
  if (results.emailViolations.length === 0) {
    console.log("✅ Alle E-Mail-Adressen korrekt\n")
  } else {
    console.log(`⚠️  ${results.emailViolations.length} E-Mail-Verletzungen gefunden\n`)
    results.overall.warnings.push(`${results.emailViolations.length} E-Mail-Verletzungen`)
    results.emailViolations.forEach((v) => {
      console.log(`  - ${v.file}: ${v.issue}`)
    })
    console.log("")
  }

  // 4. Zusammenfassung
  console.log("=".repeat(60))
  console.log("ZUSAMMENFASSUNG")
  console.log("=".repeat(60))
  console.log(`Verbotene Patterns: ${results.forbiddenPatterns.length}`)
  console.log(`TypeScript-Fehler: ${results.typescriptErrors.length}`)
  console.log(`E-Mail-Verletzungen: ${results.emailViolations.length}`)
  console.log("")

  if (results.overall.success && results.emailViolations.length === 0) {
    console.log("✅ ALLE PRUEFUNGEN BESTANDEN")
    console.log("✅ Codebase ist sauber und bereit fuer Commit/Push")
    process.exit(0)
  } else {
    console.log("❌ PRUEFUNGEN FEHLGESCHLAGEN")
    if (results.overall.errors.length > 0) {
      console.log("\nFehler:")
      results.overall.errors.forEach((error) => console.log(`  - ${error}`))
    }
    if (results.overall.warnings.length > 0) {
      console.log("\nWarnungen:")
      results.overall.warnings.forEach((warning) => console.log(`  - ${warning}`))
    }
    process.exit(1)
  }
}

// Fuehre Script aus
if (require.main === module) {
  main()
}

module.exports = { checkFileForForbiddenPatterns, checkTypeScriptErrors, checkEmailAddresses }

