/**
 * AUTOMATISCHES DESIGN-FIX SCRIPT
 * ===============================
 * Behebt automatisch Design-Verstöße für schnellere Auflösung
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

const DESIGN_FIXES = [
  // Cards: rounded-lg -> rounded-2xl
  {
    pattern: /rounded-lg.*Card|Card.*rounded-lg|className.*rounded-lg.*Card/g,
    replacement: (match) => match.replace(/rounded-lg/g, "rounded-2xl"),
    description: "Cards müssen rounded-2xl verwenden",
  },
  // Buttons: rounded-md -> rounded-xl
  {
    pattern: /rounded-md.*Button|Button.*rounded-md|className.*rounded-md.*Button/g,
    replacement: (match) => match.replace(/rounded-md/g, "rounded-xl"),
    description: "Buttons müssen rounded-xl verwenden",
  },
  // Gap: gap-4 oder gap-6 -> gap-5
  {
    pattern: /gap-4|gap-6/g,
    replacement: (match) => match.replace(/gap-[46]/g, "gap-5"),
    description: "Standard-Gap ist gap-5",
  },
]

function findFiles(dir, extensions = [".tsx", ".ts", ".jsx", ".js"]) {
  const files = []
  const items = readdirSync(dir)

  for (const item of items) {
    if (item === "node_modules" || item === ".next" || item === ".git") continue

    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, extensions))
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      files.push(fullPath)
    }
  }

  return files
}

function fixDesignViolations(filePath) {
  try {
    let content = readFileSync(filePath, "utf-8")
    let modified = false
    const fixes = []

    for (const fix of DESIGN_FIXES) {
      if (fix.pattern.test(content)) {
        // Spezifische Fixes
        if (fix.description.includes("Cards")) {
          // Ersetze rounded-lg in Card-Kontexten
          content = content.replace(
            /(className=["'][^"']*)(rounded-lg)([^"']*Card[^"']*["'])/g,
            "$1rounded-2xl$3"
          )
          content = content.replace(
            /(Card[^>]*className=["'][^"']*)(rounded-lg)/g,
            "$1rounded-2xl"
          )
          modified = true
          fixes.push("Cards: rounded-lg -> rounded-2xl")
        }

        if (fix.description.includes("Buttons")) {
          // Ersetze rounded-md in Button-Kontexten
          content = content.replace(
            /(className=["'][^"']*)(rounded-md)([^"']*Button[^"']*["'])/g,
            "$1rounded-xl$3"
          )
          content = content.replace(
            /(Button[^>]*className=["'][^"']*)(rounded-md)/g,
            "$1rounded-xl"
          )
          modified = true
          fixes.push("Buttons: rounded-md -> rounded-xl")
        }

        if (fix.description.includes("Gap")) {
          // Ersetze gap-4 und gap-6 durch gap-5 (aber nicht in Kommentaren)
          const lines = content.split("\n")
          const newLines = lines.map((line) => {
            if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
              return line
            }
            return line.replace(/\bgap-4\b/g, "gap-5").replace(/\bgap-6\b/g, "gap-5")
          })
          const newContent = newLines.join("\n")
          if (newContent !== content) {
            content = newContent
            modified = true
            fixes.push("Gap: gap-4/gap-6 -> gap-5")
          }
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, content, "utf-8")
      return { file: filePath, fixes }
    }

    return null
  } catch (error) {
    console.warn(`Fehler bei ${filePath}:`, error.message)
    return null
  }
}

async function main() {
  console.log("🔧 AUTOMATISCHES DESIGN-FIX\n")
  console.log("=".repeat(60))

  const componentsDir = join(process.cwd(), "components")
  const appDir = join(process.cwd(), "app")

  console.log("\n📋 Suche nach Design-Verstößen...")
  const files = [...findFiles(componentsDir), ...findFiles(appDir)]

  console.log(`   Gefunden: ${files.length} Dateien\n`)

  const results = []
  for (const file of files) {
    const result = fixDesignViolations(file)
    if (result) {
      results.push(result)
      console.log(`✅ ${file}`)
      result.fixes.forEach((fix) => console.log(`   - ${fix}`))
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`✅ ${results.length} Dateien behoben`)
  console.log("=".repeat(60))

  if (results.length > 0) {
    console.log("\n📋 Behobene Dateien:")
    results.forEach((r) => {
      console.log(`   - ${r.file}`)
      r.fixes.forEach((fix) => console.log(`     • ${fix}`))
    })
  }
}

main().catch(console.error)

