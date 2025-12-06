/**
 * Config Sync System
 * ==================
 * Autonome Konfigurationssynchronisation für das NEO-GENESIS System.
 * Erkennt Änderungen und propagiert sie automatisch zu abhängigen Konfigurationen.
 */

import { promises as fs } from "fs"
import path from "path"
import { logError } from "@/lib/cicd/error-logger"

// Types
export interface ConfigFile {
  path: string
  type: "json" | "yaml" | "ts" | "mdc" | "md"
  category: "mcp" | "ci" | "ide" | "lint" | "build" | "docs" | "other"
  dependsOn: string[]
  affects: string[]
  lastModified?: string
  hash?: string
}

export interface ConfigChange {
  file: string
  changeType: "created" | "modified" | "deleted"
  timestamp: string
  affectedConfigs: string[]
  autoFixed: boolean
  fixDetails?: string
}

export interface SyncResult {
  success: boolean
  changesDetected: number
  configsUpdated: number
  errors: string[]
  changes: ConfigChange[]
}

// Konfigurationsdatei-Registry
const CONFIG_REGISTRY: ConfigFile[] = [
  // MCP-Server Konfigurationen
  {
    path: "mcp-server/package.json",
    type: "json",
    category: "mcp",
    dependsOn: [],
    affects: ["config/mcp-nexus-bridge.json", ".cursor/environment.json"],
  },
  {
    path: "config/mcp-nexus-bridge.json",
    type: "json",
    category: "mcp",
    dependsOn: ["mcp-server/package.json"],
    affects: [".roo/mcp.json"],
  },
  
  // IDE-Konfigurationen
  {
    path: ".cursorrules",
    type: "md",
    category: "ide",
    dependsOn: ["project_specs.md"],
    affects: [".cursor/rules/mydispatch.mdc"],
  },
  {
    path: ".cursor/rules/mydispatch.mdc",
    type: "mdc",
    category: "ide",
    dependsOn: [".cursorrules", "project_specs.md"],
    affects: [],
  },
  
  // CI/CD-Konfigurationen
  {
    path: ".github/workflows/ci.yml",
    type: "yaml",
    category: "ci",
    dependsOn: ["package.json"],
    affects: [],
  },
  {
    path: ".coderabbit.yaml",
    type: "yaml",
    category: "ci",
    dependsOn: [],
    affects: [],
  },
  
  // Lint-Konfigurationen
  {
    path: "eslint.config.mjs",
    type: "ts",
    category: "lint",
    dependsOn: ["tsconfig.json"],
    affects: [".github/workflows/ci.yml"],
  },
  {
    path: "tsconfig.json",
    type: "json",
    category: "build",
    dependsOn: [],
    affects: ["eslint.config.mjs", "mcp-server/tsconfig.json"],
  },
  
  // Dokumentation
  {
    path: "project_specs.md",
    type: "md",
    category: "docs",
    dependsOn: [],
    affects: [".cursorrules", ".cursor/rules/mydispatch.mdc", "scripts/cicd/llm-compliance-check.ts"],
  },
]

/**
 * Config Sync Manager
 */
export class ConfigSyncManager {
  private static instance: ConfigSyncManager
  private registry: ConfigFile[]
  private projectRoot: string
  private changeHistory: ConfigChange[] = []

  private constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
    this.registry = CONFIG_REGISTRY
  }

  static getInstance(projectRoot?: string): ConfigSyncManager {
    if (!ConfigSyncManager.instance) {
      ConfigSyncManager.instance = new ConfigSyncManager(projectRoot)
    }
    return ConfigSyncManager.instance
  }

  /**
   * Scanne alle Konfigurationsdateien auf Änderungen
   */
  async scanForChanges(): Promise<ConfigChange[]> {
    const changes: ConfigChange[] = []
    
    for (const config of this.registry) {
      const fullPath = path.join(this.projectRoot, config.path)
      
      try {
        const stats = await fs.stat(fullPath)
        const lastModified = stats.mtime.toISOString()
        
        // Prüfe ob geändert seit letztem Scan
        if (config.lastModified && config.lastModified !== lastModified) {
          changes.push({
            file: config.path,
            changeType: "modified",
            timestamp: new Date().toISOString(),
            affectedConfigs: config.affects,
            autoFixed: false,
          })
        }
        
        config.lastModified = lastModified
      } catch {
        // Datei existiert nicht - prüfe ob gelöscht
        if (config.lastModified) {
          changes.push({
            file: config.path,
            changeType: "deleted",
            timestamp: new Date().toISOString(),
            affectedConfigs: config.affects,
            autoFixed: false,
          })
          config.lastModified = undefined
        }
      }
    }
    
    return changes
  }

  /**
   * Propagiere Änderungen zu abhängigen Konfigurationen
   */
  async propagateChanges(changes: ConfigChange[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      changesDetected: changes.length,
      configsUpdated: 0,
      errors: [],
      changes: [],
    }
    
    for (const change of changes) {
      console.log(`🔄 Verarbeite Änderung: ${change.file}`)
      
      for (const affectedPath of change.affectedConfigs) {
        try {
          const updateResult = await this.updateAffectedConfig(change.file, affectedPath)
          
          if (updateResult.updated) {
            result.configsUpdated++
            result.changes.push({
              ...change,
              autoFixed: true,
              fixDetails: updateResult.details,
            })
            console.log(`  ✅ ${affectedPath} aktualisiert`)
          }
        } catch (error: any) {
          result.errors.push(`Fehler bei ${affectedPath}: ${error.message}`)
          result.success = false
          console.error(`  ❌ ${affectedPath}: ${error.message}`)
        }
      }
    }
    
    // Speichere Änderungsverlauf
    this.changeHistory.push(...result.changes)
    
    return result
  }

  /**
   * Aktualisiere betroffene Konfigurationsdatei
   */
  private async updateAffectedConfig(
    sourceFile: string,
    targetFile: string
  ): Promise<{ updated: boolean; details?: string }> {
    const targetPath = path.join(this.projectRoot, targetFile)
    
    // Spezifische Update-Logik basierend auf Dateityp
    if (targetFile.endsWith(".json")) {
      return await this.syncJsonConfig(sourceFile, targetPath)
    }
    
    if (targetFile.endsWith(".yml") || targetFile.endsWith(".yaml")) {
      return await this.syncYamlConfig(sourceFile, targetPath)
    }
    
    if (targetFile.endsWith(".mdc") || targetFile.endsWith(".md")) {
      return await this.syncMarkdownConfig(sourceFile, targetPath)
    }
    
    return { updated: false }
  }

  /**
   * Synchronisiere JSON-Konfiguration
   */
  private async syncJsonConfig(
    _sourceFile: string,
    targetPath: string
  ): Promise<{ updated: boolean; details?: string }> {
    try {
      // Prüfe ob Datei existiert
      await fs.access(targetPath)
      
      // JSON-spezifische Sync-Logik
      // Hier könnte Version-Sync, Dependency-Sync etc. implementiert werden
      
      return { updated: false, details: "JSON-Sync nicht implementiert" }
    } catch {
      return { updated: false }
    }
  }

  /**
   * Synchronisiere YAML-Konfiguration
   */
  private async syncYamlConfig(
    _sourceFile: string,
    targetPath: string
  ): Promise<{ updated: boolean; details?: string }> {
    try {
      await fs.access(targetPath)
      return { updated: false, details: "YAML-Sync nicht implementiert" }
    } catch {
      return { updated: false }
    }
  }

  /**
   * Synchronisiere Markdown-Konfiguration
   */
  private async syncMarkdownConfig(
    sourceFile: string,
    targetPath: string
  ): Promise<{ updated: boolean; details?: string }> {
    try {
      // Wenn project_specs.md geändert wurde, aktualisiere Referenz
      if (sourceFile === "project_specs.md") {
        const content = await fs.readFile(targetPath, "utf-8")
        const newContent = content.replace(
          /<!-- LAST_SYNC: .* -->/,
          `<!-- LAST_SYNC: ${new Date().toISOString()} -->`
        )
        
        if (content !== newContent) {
          await fs.writeFile(targetPath, newContent)
          return { updated: true, details: "Sync-Timestamp aktualisiert" }
        }
      }
      
      return { updated: false }
    } catch {
      return { updated: false }
    }
  }

  /**
   * Vollständige Synchronisation aller Konfigurationen
   */
  async fullSync(): Promise<SyncResult> {
    console.log("🔄 Starte vollständige Config-Synchronisation...")
    
    const changes = await this.scanForChanges()
    
    if (changes.length === 0) {
      console.log("✅ Keine Änderungen erkannt")
      return {
        success: true,
        changesDetected: 0,
        configsUpdated: 0,
        errors: [],
        changes: [],
      }
    }
    
    console.log(`📋 ${changes.length} Änderungen erkannt`)
    
    return await this.propagateChanges(changes)
  }

  /**
   * Validiere alle Konfigurationen
   */
  async validateConfigs(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []
    
    for (const config of this.registry) {
      const fullPath = path.join(this.projectRoot, config.path)
      
      try {
        await fs.access(fullPath)
        
        // Typ-spezifische Validierung
        if (config.type === "json") {
          const content = await fs.readFile(fullPath, "utf-8")
          JSON.parse(content) // Wirft Fehler bei ungültigem JSON
        }
      } catch (error: any) {
        if (error.code === "ENOENT") {
          // Datei nicht gefunden - prüfe ob optional
          issues.push(`Konfigurationsdatei fehlt: ${config.path}`)
        } else {
          issues.push(`Ungültige Konfiguration in ${config.path}: ${error.message}`)
        }
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Hole Änderungsverlauf
   */
  getChangeHistory(): ConfigChange[] {
    return [...this.changeHistory]
  }

  /**
   * Registriere neue Konfigurationsdatei
   */
  registerConfig(config: ConfigFile): void {
    const existing = this.registry.find(c => c.path === config.path)
    if (existing) {
      Object.assign(existing, config)
    } else {
      this.registry.push(config)
    }
  }
}

// Singleton Export
export const configSync = ConfigSyncManager.getInstance()

// Convenience Functions
export const fullConfigSync = () => configSync.fullSync()
export const validateConfigs = () => configSync.validateConfigs()
export const getConfigChangeHistory = () => configSync.getChangeHistory()

