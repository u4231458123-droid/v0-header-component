/**
 * Codebase-Analyzer für automatische Pattern-Erkennung
 * =====================================================
 * Analysiert Codebase-Patterns für Prompt-Generierung
 */

import { promises as fs } from "fs"
import path from "path"

export interface CodebasePatterns {
  framework: string
  language: string
  buildTool: string
  backendService: string
  fileCount: number
  componentPatterns: string[]
  hookPatterns: string[]
  importPatterns: string[]
  dependencies: string[]
  commonImports: string[]
  stylingApproach: string
}

/**
 * Analysiere Codebase-Patterns
 */
export async function analyzeCodebase(rootDir: string = process.cwd()): Promise<CodebasePatterns> {
  const patterns: CodebasePatterns = {
    framework: "React",
    language: "TypeScript",
    buildTool: "Next.js",
    backendService: "Supabase",
    fileCount: 0,
    componentPatterns: [],
    hookPatterns: [],
    importPatterns: [],
    dependencies: [],
    commonImports: [],
    stylingApproach: "Tailwind CSS",
  }

  try {
    // Zähle Dateien
    patterns.fileCount = await countFiles(rootDir, [".ts", ".tsx"])

    // Analysiere package.json für Dependencies
    const packageJsonPath = path.join(rootDir, "package.json")
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"))
      patterns.dependencies = Object.keys(packageJson.dependencies || {})
    } catch {
      // Ignoriere Fehler
    }

    // Analysiere Komponenten-Patterns
    patterns.componentPatterns = await analyzeComponents(rootDir)

    // Analysiere Hook-Patterns
    patterns.hookPatterns = await analyzeHooks(rootDir)

    // Analysiere Import-Patterns
    const importAnalysis = await analyzeImports(rootDir)
    patterns.importPatterns = importAnalysis.patterns
    patterns.commonImports = importAnalysis.commonImports

    // Analysiere Styling-Approach
    patterns.stylingApproach = await analyzeStyling(rootDir)
  } catch (error) {
    console.error("Fehler bei Codebase-Analyse:", error)
  }

  return patterns
}

/**
 * Zähle Dateien
 */
async function countFiles(dir: string, extensions: string[]): Promise<number> {
  let count = 0
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== ".next") {
          count += await countFiles(fullPath, extensions)
        }
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        count++
      }
    }
  } catch {
    // Ignoriere Fehler
  }
  return count
}

/**
 * Analysiere Komponenten-Patterns
 */
async function analyzeComponents(rootDir: string): Promise<string[]> {
  const patterns: string[] = []
  const componentFiles = await findFiles(rootDir, /\.(tsx|jsx)$/, ["node_modules", ".next", "scripts"])

  for (const file of componentFiles.slice(0, 20)) {
    try {
      const content = await fs.readFile(file, "utf-8")
      if (content.includes("export function") || content.includes("export const")) {
        patterns.push("function-components")
      }
      if (content.includes("export default")) {
        patterns.push("default-exports")
      }
      if (content.includes("'use client'")) {
        patterns.push("client-components")
      }
      if (content.includes("'use server'")) {
        patterns.push("server-components")
      }
    } catch {
      // Ignoriere Fehler
    }
  }

  return [...new Set(patterns)]
}

/**
 * Analysiere Hook-Patterns
 */
async function analyzeHooks(rootDir: string): Promise<string[]> {
  const patterns: string[] = []
  const componentFiles = await findFiles(rootDir, /\.(tsx|jsx)$/, ["node_modules", ".next", "scripts"])

  for (const file of componentFiles.slice(0, 20)) {
    try {
      const content = await fs.readFile(file, "utf-8")
      if (content.includes("useState")) patterns.push("useState")
      if (content.includes("useEffect")) patterns.push("useEffect")
      if (content.includes("useCallback")) patterns.push("useCallback")
      if (content.includes("useMemo")) patterns.push("useMemo")
      if (content.includes("useRef")) patterns.push("useRef")
      if (content.includes("useContext")) patterns.push("useContext")
    } catch {
      // Ignoriere Fehler
    }
  }

  return [...new Set(patterns)]
}

/**
 * Analysiere Import-Patterns
 */
async function analyzeImports(rootDir: string): Promise<{ patterns: string[]; commonImports: string[] }> {
  const patterns: string[] = []
  const commonImports: string[] = []
  const importCounts: Record<string, number> = {}
  const componentFiles = await findFiles(rootDir, /\.(tsx|jsx|ts|js)$/, ["node_modules", ".next", "scripts"])

  for (const file of componentFiles.slice(0, 20)) {
    try {
      const content = await fs.readFile(file, "utf-8")
      const importLines = content.split("\n").filter((line) => line.trim().startsWith("import"))

      for (const importLine of importLines) {
        if (importLine.includes("@/")) {
          patterns.push("path-aliases")
        }
        if (importLine.includes("from 'react'") || importLine.includes('from "react"')) {
          patterns.push("react-imports")
        }
        if (importLine.includes("from 'next'") || importLine.includes('from "next"')) {
          patterns.push("next-imports")
        }

        // Zähle häufige Imports
        const match = importLine.match(/from\s+['"]([^'"]+)['"]/)
        if (match) {
          const importPath = match[1]
          importCounts[importPath] = (importCounts[importPath] || 0) + 1
        }
      }
    } catch {
      // Ignoriere Fehler
    }
  }

  // Top 10 häufigste Imports
  const sortedImports = Object.entries(importCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path]) => path)

  return {
    patterns: [...new Set(patterns)],
    commonImports: sortedImports,
  }
}

/**
 * Analysiere Styling-Approach
 */
async function analyzeStyling(rootDir: string): Promise<string> {
  const tailwindConfig = path.join(rootDir, "tailwind.config.ts")
  const globalsCss = path.join(rootDir, "app/globals.css")

  try {
    if (await fs.access(tailwindConfig).then(() => true).catch(() => false)) {
      return "Tailwind CSS"
    }
    if (await fs.access(globalsCss).then(() => true).catch(() => false)) {
      const content = await fs.readFile(globalsCss, "utf-8")
      if (content.includes("tailwind")) {
        return "Tailwind CSS"
      }
    }
  } catch {
    // Ignoriere Fehler
  }

  return "CSS Modules / Styled Components"
}

/**
 * Finde Dateien rekursiv
 */
async function findFiles(dir: string, pattern: RegExp, ignoreDirs: string[] = []): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith(".")) {
          files.push(...(await findFiles(fullPath, pattern, ignoreDirs)))
        }
      } else if (pattern.test(entry.name)) {
        files.push(fullPath)
      }
    }
  } catch {
    // Ignoriere Fehler
  }
  return files
}

/**
 * Formatiere Patterns für Prompt
 */
export function formatPatternsForPrompt(patterns: CodebasePatterns): string {
  return `
Codebase-Patterns:
- Framework: ${patterns.framework}
- Sprache: ${patterns.language}
- Build-Tool: ${patterns.buildTool}
- Backend: ${patterns.backendService}
- Dateien: ${patterns.fileCount}
- Komponenten-Patterns: ${patterns.componentPatterns.join(", ") || "Standard"}
- Hook-Patterns: ${patterns.hookPatterns.join(", ") || "Standard"}
- Import-Patterns: ${patterns.importPatterns.join(", ") || "Standard"}
- Styling: ${patterns.stylingApproach}
- Häufige Imports: ${patterns.commonImports.slice(0, 5).join(", ")}
`.trim()
}

