/**
 * Context Intelligence (Greptile-Alternative)
 * ============================================
 * Lokale Codebase-Analyse für tiefes Verständnis des Projekts.
 * Beantwortet Fragen zu Abhängigkeiten, Impact-Analyse und Code-Struktur.
 */

import { promises as fs } from "fs"
import path from "path"
import { glob } from "glob"

// Types
export interface CodebaseContext {
  files: FileInfo[]
  dependencies: DependencyGraph
  imports: ImportMap
  exports: ExportMap
  components: ComponentInfo[]
  routes: RouteInfo[]
  timestamp: string
}

export interface FileInfo {
  path: string
  type: "page" | "component" | "hook" | "util" | "api" | "config" | "type" | "test" | "other"
  size: number
  imports: string[]
  exports: string[]
  lastModified: string
}

export interface DependencyGraph {
  [file: string]: {
    dependsOn: string[]
    usedBy: string[]
  }
}

export interface ImportMap {
  [module: string]: string[] // Module -> Files die es importieren
}

export interface ExportMap {
  [file: string]: string[] // File -> Exportierte Symbole
}

export interface ComponentInfo {
  name: string
  file: string
  props: string[]
  usedIn: string[]
}

export interface RouteInfo {
  path: string
  file: string
  type: "page" | "api" | "layout"
  isDynamic: boolean
}

export interface ImpactAnalysis {
  directImpact: string[]
  indirectImpact: string[]
  totalAffected: number
  riskLevel: "low" | "medium" | "high" | "critical"
  recommendations: string[]
}

/**
 * Context Intelligence Engine
 */
export class ContextIntelligence {
  private static instance: ContextIntelligence
  private context: CodebaseContext | null = null
  private projectRoot: string
  private cacheTimeout = 5 * 60 * 1000 // 5 Minuten
  private lastUpdate = 0

  private constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
  }

  static getInstance(projectRoot?: string): ContextIntelligence {
    if (!ContextIntelligence.instance) {
      ContextIntelligence.instance = new ContextIntelligence(projectRoot)
    }
    return ContextIntelligence.instance
  }

  /**
   * Lade oder aktualisiere Codebase-Kontext
   */
  async getContext(): Promise<CodebaseContext> {
    if (this.context && Date.now() - this.lastUpdate < this.cacheTimeout) {
      return this.context
    }

    await this.scanCodebase()
    return this.context!
  }

  /**
   * Scanne gesamte Codebase
   */
  private async scanCodebase(): Promise<void> {
    console.log("🔍 Scanne Codebase...")
    const startTime = Date.now()

    const files: FileInfo[] = []
    const dependencies: DependencyGraph = {}
    const imports: ImportMap = {}
    const exports: ExportMap = {}
    const components: ComponentInfo[] = []
    const routes: RouteInfo[] = []

    // Finde alle relevanten Dateien
    const patterns = [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
      "hooks/**/*.{ts,tsx}",
      "utils/**/*.{ts,tsx}",
      "types/**/*.{ts,tsx}",
    ]

    const ignorePatterns = [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ]

    for (const pattern of patterns) {
      const matchedFiles = await glob(pattern, {
        cwd: this.projectRoot,
        ignore: ignorePatterns,
      })

      for (const file of matchedFiles) {
        const fileInfo = await this.analyzeFile(file)
        if (fileInfo) {
          files.push(fileInfo)

          // Baue Dependency Graph
          dependencies[file] = { dependsOn: fileInfo.imports, usedBy: [] }

          // Baue Import Map
          for (const imp of fileInfo.imports) {
            if (!imports[imp]) imports[imp] = []
            imports[imp].push(file)
          }

          // Baue Export Map
          exports[file] = fileInfo.exports

          // Extrahiere Komponenten
          if (fileInfo.type === "component" || fileInfo.type === "page") {
            const componentInfo = this.extractComponentInfo(fileInfo)
            if (componentInfo) components.push(componentInfo)
          }

          // Extrahiere Routen
          if (file.startsWith("app/")) {
            const routeInfo = this.extractRouteInfo(file)
            if (routeInfo) routes.push(routeInfo)
          }
        }
      }
    }

    // Vervollständige usedBy in Dependency Graph
    for (const [file, deps] of Object.entries(dependencies)) {
      for (const dep of deps.dependsOn) {
        const normalizedDep = this.normalizeImportPath(dep, file)
        if (dependencies[normalizedDep]) {
          dependencies[normalizedDep].usedBy.push(file)
        }
      }
    }

    this.context = {
      files,
      dependencies,
      imports,
      exports,
      components,
      routes,
      timestamp: new Date().toISOString(),
    }

    this.lastUpdate = Date.now()
    console.log(`✅ Codebase gescannt in ${Date.now() - startTime}ms`)
    console.log(`   - ${files.length} Dateien`)
    console.log(`   - ${components.length} Komponenten`)
    console.log(`   - ${routes.length} Routen`)
  }

  /**
   * Analysiere einzelne Datei
   */
  private async analyzeFile(filePath: string): Promise<FileInfo | null> {
    try {
      const fullPath = path.join(this.projectRoot, filePath)
      const content = await fs.readFile(fullPath, "utf-8")
      const stats = await fs.stat(fullPath)

      const fileImports = this.extractImports(content)
      const fileExports = this.extractExports(content)
      const fileType = this.determineFileType(filePath)

      return {
        path: filePath,
        type: fileType,
        size: stats.size,
        imports: fileImports,
        exports: fileExports,
        lastModified: stats.mtime.toISOString(),
      }
    } catch {
      return null
    }
  }

  /**
   * Extrahiere Imports aus Datei
   */
  private extractImports(content: string): string[] {
    const imports: string[] = []
    const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g

    let match
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    return imports
  }

  /**
   * Extrahiere Exports aus Datei
   */
  private extractExports(content: string): string[] {
    const exports: string[] = []

    // Named exports
    const namedExportRegex = /export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g
    let match
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    // Default export
    if (/export\s+default/.test(content)) {
      exports.push("default")
    }

    return exports
  }

  /**
   * Bestimme Dateityp
   */
  private determineFileType(filePath: string): FileInfo["type"] {
    if (filePath.includes("/page.")) return "page"
    if (filePath.includes("/route.") || filePath.includes("/api/")) return "api"
    if (filePath.startsWith("components/")) return "component"
    if (filePath.startsWith("hooks/") || filePath.includes("/use")) return "hook"
    if (filePath.startsWith("lib/") || filePath.startsWith("utils/")) return "util"
    if (filePath.startsWith("types/") || filePath.includes(".d.ts")) return "type"
    if (filePath.includes("config")) return "config"
    if (filePath.includes(".test.") || filePath.includes(".spec.")) return "test"
    return "other"
  }

  /**
   * Extrahiere Komponenten-Info
   */
  private extractComponentInfo(fileInfo: FileInfo): ComponentInfo | null {
    const name = path.basename(fileInfo.path, path.extname(fileInfo.path))
    return {
      name,
      file: fileInfo.path,
      props: [], // Könnte mit AST-Parsing erweitert werden
      usedIn: [], // Wird später gefüllt
    }
  }

  /**
   * Extrahiere Routen-Info
   */
  private extractRouteInfo(filePath: string): RouteInfo | null {
    const routePath = "/" + filePath
      .replace(/^app/, "")
      .replace(/\/page\.(ts|tsx)$/, "")
      .replace(/\/route\.(ts|tsx)$/, "")
      .replace(/\/layout\.(ts|tsx)$/, "")
      .replace(/\[([^\]]+)\]/g, ":$1")

    const isApi = filePath.includes("/api/") || filePath.includes("route.")
    const isLayout = filePath.includes("layout.")
    const isDynamic = filePath.includes("[")

    return {
      path: routePath || "/",
      file: filePath,
      type: isApi ? "api" : isLayout ? "layout" : "page",
      isDynamic,
    }
  }

  /**
   * Normalisiere Import-Pfad
   */
  private normalizeImportPath(importPath: string, fromFile: string): string {
    if (importPath.startsWith("@/")) {
      return importPath.replace("@/", "")
    }
    if (importPath.startsWith(".")) {
      const dir = path.dirname(fromFile)
      return path.normalize(path.join(dir, importPath))
    }
    return importPath
  }

  /**
   * Impact-Analyse: Was bricht wenn ich diese Datei ändere?
   */
  async analyzeImpact(filePath: string): Promise<ImpactAnalysis> {
    const context = await this.getContext()

    const directImpact: Set<string> = new Set()
    const indirectImpact: Set<string> = new Set()

    // Finde direkte Abhängigkeiten
    const deps = context.dependencies[filePath]
    if (deps) {
      for (const usedBy of deps.usedBy) {
        directImpact.add(usedBy)
      }
    }

    // Finde indirekte Abhängigkeiten (rekursiv)
    const findIndirect = (file: string, visited: Set<string>) => {
      if (visited.has(file)) return
      visited.add(file)

      const fileDeps = context.dependencies[file]
      if (fileDeps) {
        for (const usedBy of fileDeps.usedBy) {
          if (!directImpact.has(usedBy)) {
            indirectImpact.add(usedBy)
          }
          findIndirect(usedBy, visited)
        }
      }
    }

    for (const direct of directImpact) {
      findIndirect(direct, new Set())
    }

    const totalAffected = directImpact.size + indirectImpact.size

    // Bestimme Risiko-Level
    let riskLevel: ImpactAnalysis["riskLevel"] = "low"
    if (totalAffected > 20) riskLevel = "critical"
    else if (totalAffected > 10) riskLevel = "high"
    else if (totalAffected > 5) riskLevel = "medium"

    // Generiere Empfehlungen
    const recommendations: string[] = []
    if (riskLevel === "critical" || riskLevel === "high") {
      recommendations.push("Führe umfangreiche Tests durch vor dem Merge")
      recommendations.push("Erwäge die Änderung in kleinere PRs aufzuteilen")
    }
    if (directImpact.size > 0) {
      recommendations.push(`Prüfe diese direkt betroffenen Dateien: ${[...directImpact].slice(0, 5).join(", ")}`)
    }

    return {
      directImpact: [...directImpact],
      indirectImpact: [...indirectImpact],
      totalAffected,
      riskLevel,
      recommendations,
    }
  }

  /**
   * Finde verwandte Dateien
   */
  async findRelatedFiles(filePath: string): Promise<string[]> {
    const context = await this.getContext()
    const related: Set<string> = new Set()

    const deps = context.dependencies[filePath]
    if (deps) {
      // Dateien die diese Datei importiert
      for (const dep of deps.dependsOn) {
        const normalized = this.normalizeImportPath(dep, filePath)
        if (context.dependencies[normalized]) {
          related.add(normalized)
        }
      }

      // Dateien die diese Datei verwenden
      for (const usedBy of deps.usedBy) {
        related.add(usedBy)
      }
    }

    return [...related]
  }

  /**
   * Suche nach Symbol-Verwendung
   */
  async findSymbolUsage(symbolName: string): Promise<string[]> {
    const context = await this.getContext()
    const usages: string[] = []

    for (const file of context.files) {
      if (file.exports.includes(symbolName)) {
        usages.push(`${file.path} (definiert)`)
      }
      if (file.imports.some(imp => imp.includes(symbolName))) {
        usages.push(`${file.path} (importiert)`)
      }
    }

    return usages
  }

  /**
   * Hole Zusammenfassung
   */
  async getSummary(): Promise<{
    totalFiles: number
    byType: Record<string, number>
    topDependencies: Array<{ module: string; usedBy: number }>
    recentlyModified: string[]
  }> {
    const context = await this.getContext()

    const byType: Record<string, number> = {}
    for (const file of context.files) {
      byType[file.type] = (byType[file.type] || 0) + 1
    }

    const topDependencies = Object.entries(context.imports)
      .map(([module, files]) => ({ module, usedBy: files.length }))
      .sort((a, b) => b.usedBy - a.usedBy)
      .slice(0, 10)

    const recentlyModified = [...context.files]
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 10)
      .map(f => f.path)

    return {
      totalFiles: context.files.length,
      byType,
      topDependencies,
      recentlyModified,
    }
  }
}

// Singleton Export
export const contextIntelligence = ContextIntelligence.getInstance()

// Convenience Functions
export const analyzeImpact = (filePath: string) => contextIntelligence.analyzeImpact(filePath)
export const findRelatedFiles = (filePath: string) => contextIntelligence.findRelatedFiles(filePath)
export const findSymbolUsage = (symbolName: string) => contextIntelligence.findSymbolUsage(symbolName)
export const getCodebaseSummary = () => contextIntelligence.getSummary()

