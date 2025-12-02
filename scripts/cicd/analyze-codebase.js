/**
 * Codebase-Pattern-Analyse
 * ========================
 * Analysiert Codebase-Patterns für Prompt-Generierung
 */

const fs = require("fs")
const path = require("path")

/**
 * Analysiere Codebase-Patterns
 */
function analyzeCodebase(rootDir = process.cwd()) {
  const patterns = {
    framework: "React",
    language: "TypeScript",
    buildTool: "Next.js",
    backendService: "Supabase",
    fileCount: 0,
    componentPatterns: [],
    hookPatterns: [],
    importPatterns: [],
  }

  try {
    // Zähle Dateien
    patterns.fileCount = countFiles(rootDir, [".ts", ".tsx"])

    // Analysiere Komponenten-Patterns
    patterns.componentPatterns = analyzeComponents(rootDir)

    // Analysiere Hook-Patterns
    patterns.hookPatterns = analyzeHooks(rootDir)

    // Analysiere Import-Patterns
    patterns.importPatterns = analyzeImports(rootDir)
  } catch (error) {
    console.error("Fehler bei Codebase-Analyse:", error)
  }

  return patterns
}

/**
 * Zähle Dateien
 */
function countFiles(dir, extensions) {
  let count = 0
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      if (file.isDirectory()) {
        if (!file.name.startsWith(".") && file.name !== "node_modules") {
          count += countFiles(fullPath, extensions)
        }
      } else if (extensions.some((ext) => file.name.endsWith(ext))) {
        count++
      }
    }
  } catch (error) {
    // Ignoriere Fehler
  }
  return count
}

/**
 * Analysiere Komponenten-Patterns
 */
function analyzeComponents(rootDir) {
  const patterns = []
  const componentFiles = findFiles(rootDir, /\.(tsx|jsx)$/, ["node_modules", ".next"])

  for (const file of componentFiles.slice(0, 10)) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      if (content.includes("export function") || content.includes("export const")) {
        patterns.push("function-components")
      }
      if (content.includes("export default")) {
        patterns.push("default-exports")
      }
    } catch (error) {
      // Ignoriere Fehler
    }
  }

  return [...new Set(patterns)]
}

/**
 * Analysiere Hook-Patterns
 */
function analyzeHooks(rootDir) {
  const patterns = []
  const componentFiles = findFiles(rootDir, /\.(tsx|jsx)$/, ["node_modules", ".next"])

  for (const file of componentFiles.slice(0, 10)) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      if (content.includes("useState")) patterns.push("useState")
      if (content.includes("useEffect")) patterns.push("useEffect")
      if (content.includes("useCallback")) patterns.push("useCallback")
      if (content.includes("useMemo")) patterns.push("useMemo")
    } catch (error) {
      // Ignoriere Fehler
    }
  }

  return [...new Set(patterns)]
}

/**
 * Analysiere Import-Patterns
 */
function analyzeImports(rootDir) {
  const patterns = []
  const componentFiles = findFiles(rootDir, /\.(tsx|jsx|ts|js)$/, ["node_modules", ".next"])

  for (const file of componentFiles.slice(0, 10)) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      const importLines = content.split("\n").filter((line) => line.trim().startsWith("import"))

      for (const importLine of importLines) {
        if (importLine.includes("@/")) {
          patterns.push("path-aliases")
        }
        if (importLine.includes("from 'react'")) {
          patterns.push("react-imports")
        }
        if (importLine.includes("from 'next'")) {
          patterns.push("next-imports")
        }
      }
    } catch (error) {
      // Ignoriere Fehler
    }
  }

  return [...new Set(patterns)]
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

module.exports = {
  analyzeCodebase,
}

