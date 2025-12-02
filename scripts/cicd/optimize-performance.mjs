/**
 * PERFORMANCE-OPTIMIERUNG SCRIPT
 * ==============================
 * Optimiert Performance durch Lazy-Loading und Memoization
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

function findFiles(dir, extensions = [".tsx", ".ts"]) {
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

function optimizeFile(filePath) {
  try {
    let content = readFileSync(filePath, "utf-8")
    let modified = false
    const optimizations = []

    // Prüfe ob große Komponente ohne Memoization
    const lineCount = content.split("\n").length
    const isComponent = content.includes("export") && (content.includes("function") || content.includes("const") && content.includes("="))
    const hasMemo = content.includes("React.memo") || content.includes("useMemo") || content.includes("useCallback")
    const isPage = filePath.includes("/page.tsx") || filePath.includes("/layout.tsx")

    // Füge React.memo hinzu für große Komponenten
    if (lineCount > 200 && isComponent && !hasMemo && !isPage && !content.includes("React.memo")) {
      // Finde export statement
      if (content.includes("export default function")) {
        content = content.replace(
          /export default function (\w+)/,
          `import { memo } from "react"\n\nexport default memo(function $1`
        )
        // Füge schließende Klammer hinzu
        const lastBrace = content.lastIndexOf("}")
        if (lastBrace > 0) {
          content = content.slice(0, lastBrace) + "})" + content.slice(lastBrace + 1)
        }
        modified = true
        optimizations.push("React.memo hinzugefügt")
      } else if (content.includes("export default")) {
        const exportMatch = content.match(/export default (const|function) (\w+)/)
        if (exportMatch) {
          content = content.replace(
            /export default (const|function) (\w+)/,
            `import { memo } from "react"\n\nexport default memo($1 $2`
          )
          // Füge schließende Klammer hinzu
          const lastBrace = content.lastIndexOf("}")
          if (lastBrace > 0) {
            content = content.slice(0, lastBrace) + "})" + content.slice(lastBrace + 1)
          }
          modified = true
          optimizations.push("React.memo hinzugefügt")
        }
      }
    }

    // Prüfe ob dynamische Imports verwendet werden können
    if (isPage && !content.includes("dynamic") && !content.includes("next/dynamic")) {
      // Für Seiten-Komponenten: Prüfe ob große Imports vorhanden
      const hasLargeImports = content.match(/import.*from.*["'](@\/components|\.\.\/)/g)
      if (hasLargeImports && hasLargeImports.length > 5) {
        // Ersetze einige Imports mit dynamic
        const imports = content.match(/import (\w+) from ["']([^"']+)["']/g)
        if (imports && imports.length > 3) {
          // Ersetze letzte 2 Imports mit dynamic
          for (let i = imports.length - 2; i < imports.length; i++) {
            const importMatch = imports[i].match(/import (\w+) from ["']([^"']+)["']/)
            if (importMatch && !importMatch[2].includes("ui/")) {
              const componentName = importMatch[1]
              const importPath = importMatch[2]
              content = content.replace(
                imports[i],
                `const ${componentName} = dynamic(() => import("${importPath}"), { ssr: false })`
              )
              if (!content.includes("import dynamic")) {
                content = `import dynamic from "next/dynamic"\n${content}`
              }
              modified = true
              optimizations.push(`Dynamic import für ${componentName}`)
            }
          }
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, content, "utf-8")
      return { file: filePath, optimizations }
    }

    return null
  } catch (error) {
    console.warn(`Fehler bei ${filePath}:`, error.message)
    return null
  }
}

async function main() {
  console.log("⚡ PERFORMANCE-OPTIMIERUNG\n")
  console.log("=".repeat(60))

  const componentsDir = join(process.cwd(), "components")
  const appDir = join(process.cwd(), "app")

  console.log("\n📋 Suche nach Optimierungsmöglichkeiten...")
  const files = [...findFiles(componentsDir), ...findFiles(appDir)]

  console.log(`   Gefunden: ${files.length} Dateien\n`)

  const results = []
  for (const file of files) {
    const result = optimizeFile(file)
    if (result) {
      results.push(result)
      console.log(`✅ ${file}`)
      result.optimizations.forEach((opt) => console.log(`   - ${opt}`))
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`✅ ${results.length} Dateien optimiert`)
  console.log("=".repeat(60))
}

main().catch(console.error)

