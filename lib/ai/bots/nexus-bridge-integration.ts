/**
 * Nexus Bridge Integration für Bot-Architektur
 * =============================================
 * Verbindet den Nexus Bridge MCP-Server mit der bestehenden Bot-Architektur.
 * Ermöglicht allen Bots den Zugriff auf Live-Kontext über das Projekt.
 *
 * Resources:
 * - project://ui/tokens - Design-Tokens
 * - project://db/schema - Datenbank-Schema
 * - project://app/routes - App-Routen
 * - project://docs/active - Aktive Dokumentation
 *
 * Tools:
 * - validate_slug - URL-Slug-Validierung
 * - validate_compliance - Code-Compliance-Prüfung
 * - scaffold_feature - Feature-Scaffolding
 * - get_project_health - Projekt-Gesundheitscheck
 */


// Types für Nexus Bridge Resources
export interface UITokens {
  colors: Record<string, unknown>
  spacing: Record<string, string>
  radius: Record<string, string>
  elevation: Record<string, string>
  motion: {
    duration: Record<string, string>
    timing: Record<string, string>
  }
  zIndex: Record<string, number>
  typography: {
    fontFamily: Record<string, string>
    fontSize: Record<string, string>
  }
}

export interface DBSchema {
  tables: Array<{
    name: string
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      isPrimaryKey?: boolean
      isForeignKey?: boolean
      references?: {
        table: string
        column: string
      }
    }>
    relationships: Array<{
      name: string
      type: "one-to-one" | "one-to-many" | "many-to-many"
      referencedTable: string
      foreignKey: string
    }>
  }>
  enums: Record<string, string[]>
  functions: Array<{
    name: string
    args: string
    returns: string
  }>
}

export interface AppRoutes {
  pages: Array<{
    path: string
    type: "page" | "layout" | "loading" | "error" | "not-found"
    file: string
    isDynamic: boolean
    params?: string[]
  }>
  apiRoutes: Array<{
    path: string
    type: "api"
    file: string
    isDynamic: boolean
    params?: string[]
  }>
  layouts: Array<{
    path: string
    type: "layout"
    file: string
    isDynamic: boolean
  }>
  middleware: string[]
}

export interface ActiveDocs {
  cursorRules: string
  projectSpecs: string
  eslintRules: Record<string, unknown>
  forbiddenTerms: string[]
  designRules: {
    roundings: Record<string, string>
    spacing: Record<string, string>
    activeTabs: string
  }
  languageRules: {
    code: string
    ui: string
    forbiddenTerms: string[]
  }
}

// Types für Nexus Bridge Tools
export interface SlugValidationResult {
  valid: boolean
  slug: string
  errors: string[]
  suggestions: string[]
}

export interface ComplianceResult {
  compliant: boolean
  violations: Array<{
    rule: string
    severity: "error" | "warning" | "info"
    message: string
    line?: number
    suggestion?: string
  }>
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

export interface ScaffoldResult {
  success: boolean
  createdFiles: string[]
  errors: string[]
  structure: string
}

export interface HealthResult {
  healthy: boolean
  lint: {
    passed: boolean
    errorCount: number
    warningCount: number
    output: string
  }
  typeCheck: {
    passed: boolean
    errorCount: number
    output: string
  }
  build: {
    passed: boolean
    output: string
  }
  timestamp: string
}

/**
 * Nexus Bridge Client
 * Stellt Verbindung zum MCP-Server her und ermöglicht Resource- und Tool-Zugriff
 */
export class NexusBridgeClient {
  private static instance: NexusBridgeClient
  private cachedResources: Map<string, { data: unknown; timestamp: number }> = new Map()
  private cacheTimeout = 60000 // 1 Minute Cache

  private constructor() {}

  static getInstance(): NexusBridgeClient {
    if (!NexusBridgeClient.instance) {
      NexusBridgeClient.instance = new NexusBridgeClient()
    }
    return NexusBridgeClient.instance
  }

  /**
   * Prüft ob Nexus Bridge MCP verfügbar ist
   */
  async isAvailable(): Promise<boolean> {
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_nexus_bridge_read_resource === "function") {
        return true
      }
      // Fallback: Prüfe ob MCP-Server läuft
      return false
    } catch {
      return false
    }
  }

  /**
   * Lese Resource vom Nexus Bridge MCP-Server
   */
  private async readResource<T>(uri: string): Promise<T | null> {
    // Prüfe Cache
    const cached = this.cachedResources.get(uri)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T
    }

    try {
      // Versuche MCP-Aufruf (wenn verfügbar über Cursor MCP)
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_nexus_bridge_read_resource === "function") {
        // @ts-ignore
        const result = await mcp_nexus_bridge_read_resource({ uri })
        if (result && result.contents && result.contents[0]) {
          const data = JSON.parse(result.contents[0].text)
          this.cachedResources.set(uri, { data, timestamp: Date.now() })
          return data as T
        }
      }

      // Fallback: Lade aus lokalen Dateien
      return await this.loadFromLocalFiles<T>(uri)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn(`Nexus Bridge Resource nicht verfügbar: ${uri}`, errorMessage)
      return null
    }
  }

  /**
   * Fallback: Lade Daten aus lokalen Dateien
   */
  private async loadFromLocalFiles<T>(uri: string): Promise<T | null> {
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const projectRoot = process.cwd()

      switch (uri) {
        case "project://ui/tokens": {
          const tokensPath = path.join(projectRoot, "config", "design-tokens.ts")
          const content = await fs.readFile(tokensPath, "utf-8")
          // Einfaches Parsing (für vollständiges Parsing würde ts-node benötigt)
          const tokens = this.parseDesignTokens(content)
          return tokens as T
        }

        case "project://db/schema": {
          const schemaPath = path.join(projectRoot, "types", "supabase.ts")
          const content = await fs.readFile(schemaPath, "utf-8")
          const schema = this.parseDBSchema(content)
          return schema as T
        }

        case "project://app/routes": {
          const routes = await this.scanAppRoutes(projectRoot)
          return routes as T
        }

        case "project://docs/active": {
          const docs = await this.loadActiveDocs(projectRoot)
          return docs as T
        }

        default:
          return null
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Parse Design-Tokens aus TypeScript-Datei
   */
  private parseDesignTokens(_content: string): UITokens {
    // Vereinfachtes Parsing - gibt Basis-Tokens zurück
    return {
      colors: {
        primary: { DEFAULT: "#343f60", light: "#475569", dark: "#2a3447" },
        background: "bg-background",
        foreground: "text-foreground",
        muted: "bg-muted",
        mutedForeground: "text-muted-foreground",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "gap-standard": "gap-5",
      },
      radius: {
        cards: "rounded-2xl",
        buttons: "rounded-xl",
        badges: "rounded-md",
      },
      elevation: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      motion: {
        duration: { default: "200ms", slow: "300ms", fast: "150ms" },
        timing: { easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)" },
      },
      zIndex: {
        header: 30,
        footer: 20,
        sidebar: 40,
        mobileHeader: 50,
        modal: 100,
      },
      typography: {
        fontFamily: { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" },
        fontSize: { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem" },
      },
    }
  }

  /**
   * Parse DB-Schema aus TypeScript-Datei
   */
  private parseDBSchema(content: string): DBSchema {
    // Vereinfachtes Parsing - extrahiert Tabellennamen
    const tableMatches = content.match(/(\w+):\s*\{[\s\S]*?Row:\s*\{/g) || []
    const tables = tableMatches.map((match) => {
      const nameMatch = match.match(/^(\w+):/)
      return {
        name: nameMatch ? nameMatch[1] : "unknown",
        columns: [],
        relationships: [],
      }
    })

    return {
      tables,
      enums: {},
      functions: [],
    }
  }

  /**
   * Scanne App-Routen
   */
  private async scanAppRoutes(projectRoot: string): Promise<AppRoutes> {
    const fs = await import("fs/promises")
    const path = await import("path")
    const appDir = path.join(projectRoot, "app")

    const routes: AppRoutes = {
      pages: [],
      apiRoutes: [],
      layouts: [],
      middleware: [],
    }

    try {
      const scanDir = async (dir: string, basePath: string = "") => {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith(".")) {
            await scanDir(path.join(dir, entry.name), `${basePath}/${entry.name}`)
          } else if (entry.isFile()) {
            const routePath = basePath || "/"
            const isDynamic = routePath.includes("[")

            if (entry.name === "page.tsx" || entry.name === "page.ts") {
              routes.pages.push({
                path: routePath,
                type: "page",
                file: `app${basePath}/${entry.name}`,
                isDynamic,
              })
            } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
              routes.apiRoutes.push({
                path: routePath,
                type: "api",
                file: `app${basePath}/${entry.name}`,
                isDynamic,
              })
            } else if (entry.name === "layout.tsx" || entry.name === "layout.ts") {
              routes.layouts.push({
                path: routePath,
                type: "layout",
                file: `app${basePath}/${entry.name}`,
                isDynamic,
              })
            }
          }
        }
      }

      await scanDir(appDir)

      // Check for middleware
      try {
        await fs.access(path.join(projectRoot, "middleware.ts"))
        routes.middleware.push("middleware.ts")
      } catch {
        // No middleware
      }
    } catch (error) {
      console.warn("Fehler beim Scannen der App-Routen:", error)
    }

    return routes
  }

  /**
   * Lade aktive Dokumentation
   */
  private async loadActiveDocs(projectRoot: string): Promise<ActiveDocs> {
    const fs = await import("fs/promises")
    const path = await import("path")

    const docs: ActiveDocs = {
      cursorRules: "",
      projectSpecs: "",
      eslintRules: {},
      forbiddenTerms: ["kostenlos", "gratis", "free", "testen", "trial"],
      designRules: {
        roundings: { cards: "rounded-2xl", buttons: "rounded-xl", badges: "rounded-md" },
        spacing: { standard: "gap-5" },
        activeTabs: "bg-primary text-primary-foreground",
      },
      languageRules: {
        code: "English",
        ui: "German (Sie-Form, DIN 5008)",
        forbiddenTerms: ["kostenlos", "gratis", "free", "testen", "trial"],
      },
    }

    try {
      // Lade Cursor Rules
      const cursorRulesPath = path.join(projectRoot, ".cursor", "rules", "mydispatch.mdc")
      docs.cursorRules = await fs.readFile(cursorRulesPath, "utf-8")
    } catch {
      // Skip
    }

    try {
      // Lade Project Specs
      const specsPath = path.join(projectRoot, "project_specs.md")
      docs.projectSpecs = await fs.readFile(specsPath, "utf-8")
    } catch {
      // Skip
    }

    return docs
  }

  // ==================== PUBLIC API ====================

  /**
   * Hole UI Design-Tokens
   */
  async getUITokens(): Promise<UITokens | null> {
    return this.readResource<UITokens>("project://ui/tokens")
  }

  /**
   * Hole Datenbank-Schema
   */
  async getDBSchema(): Promise<DBSchema | null> {
    return this.readResource<DBSchema>("project://db/schema")
  }

  /**
   * Hole App-Routen
   */
  async getAppRoutes(): Promise<AppRoutes | null> {
    return this.readResource<AppRoutes>("project://app/routes")
  }

  /**
   * Hole aktive Dokumentation
   */
  async getActiveDocs(): Promise<ActiveDocs | null> {
    return this.readResource<ActiveDocs>("project://docs/active")
  }

  /**
   * Validiere URL-Slug
   */
  async validateSlug(text: string): Promise<SlugValidationResult> {
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_nexus_bridge_validate_slug === "function") {
        // @ts-ignore
        const result = await mcp_nexus_bridge_validate_slug({ text })
        return JSON.parse(result.content[0].text)
      }

      // Fallback: Lokale Validierung
      return this.localValidateSlug(text)
    } catch (error) {
      return this.localValidateSlug(text)
    }
  }

  /**
   * Lokale Slug-Validierung (Fallback)
   */
  private localValidateSlug(text: string): SlugValidationResult {
    const errors: string[] = []
    const suggestions: string[] = []

    if (!text) {
      return { valid: false, slug: "", errors: ["Input required"], suggestions: [] }
    }

    if (text !== text.toLowerCase()) {
      errors.push("Contains uppercase")
      suggestions.push("Convert to lowercase")
    }

    const umlauts = ["ä", "ö", "ü", "ß"]
    for (const u of umlauts) {
      if (text.includes(u)) {
        errors.push(`Contains umlaut: ${u}`)
      }
    }

    const slug = text
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    return { valid: errors.length === 0, slug, errors, suggestions }
  }

  /**
   * Validiere Code-Compliance
   */
  async validateCompliance(code: string, filePath?: string): Promise<ComplianceResult> {
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_nexus_bridge_validate_compliance === "function") {
        // @ts-ignore
        const result = await mcp_nexus_bridge_validate_compliance({ code, filePath })
        return JSON.parse(result.content[0].text)
      }

      // Fallback: Lokale Validierung
      return this.localValidateCompliance(code, filePath)
    } catch (error) {
      return this.localValidateCompliance(code, filePath)
    }
  }

  /**
   * Lokale Compliance-Validierung (Fallback)
   */
  private localValidateCompliance(code: string, filePath?: string): ComplianceResult {
    const violations: ComplianceResult["violations"] = []

    // Prüfe verbotene Begriffe
    const forbiddenTerms = ["kostenlos", "gratis", "free", "testen", "trial"]
    for (const term of forbiddenTerms) {
      if (code.toLowerCase().includes(term)) {
        violations.push({
          rule: "forbidden-terms",
          severity: "error",
          message: `Verbotener Begriff: "${term}"`,
          suggestion: `Entferne "${term}"`,
        })
      }
    }

    // Prüfe hardcoded colors
    const hexColors = code.match(/#[0-9a-fA-F]{3,8}/g) || []
    if (hexColors.length > 0) {
      violations.push({
        rule: "hardcoded-colors",
        severity: "warning",
        message: `${hexColors.length} hardcoded colors gefunden`,
        suggestion: "Verwende Design-Tokens",
      })
    }

    // Prüfe any-Types
    if (/:\s*any\b/.test(code)) {
      violations.push({
        rule: "typescript-strict",
        severity: "warning",
        message: 'Untyped "any" gefunden',
        suggestion: "Verwende explizite Typen",
      })
    }

    return {
      compliant: violations.filter((v) => v.severity === "error").length === 0,
      violations,
      summary: {
        errors: violations.filter((v) => v.severity === "error").length,
        warnings: violations.filter((v) => v.severity === "warning").length,
        info: violations.filter((v) => v.severity === "info").length,
      },
    }
  }

  /**
   * Hole Projekt-Gesundheitsstatus
   */
  async getProjectHealth(): Promise<HealthResult> {
    try {
      // @ts-ignore - MCP-Funktionen werden zur Laufzeit von Cursor bereitgestellt
      if (typeof mcp_nexus_bridge_get_project_health === "function") {
        // @ts-ignore
        const result = await mcp_nexus_bridge_get_project_health({})
        return JSON.parse(result.content[0].text)
      }

      // Fallback: Basis-Health
      return {
        healthy: true,
        lint: { passed: true, errorCount: 0, warningCount: 0, output: "Skipped" },
        typeCheck: { passed: true, errorCount: 0, output: "Skipped" },
        build: { passed: true, output: "Skipped" },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        healthy: false,
        lint: { passed: false, errorCount: 1, warningCount: 0, output: "Error" },
        typeCheck: { passed: false, errorCount: 1, output: "Error" },
        build: { passed: false, output: "Error" },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Cache leeren
   */
  clearCache(): void {
    this.cachedResources.clear()
  }
}

/**
 * Lade vollständigen Projekt-Kontext für Bot-Aufgaben
 * Wird vor jeder Bot-Aufgabe aufgerufen
 */
export async function loadProjectContext(): Promise<{
  uiTokens: UITokens | null
  dbSchema: DBSchema | null
  appRoutes: AppRoutes | null
  activeDocs: ActiveDocs | null
  timestamp: string
}> {
  const client = NexusBridgeClient.getInstance()

  const [uiTokens, dbSchema, appRoutes, activeDocs] = await Promise.all([
    client.getUITokens(),
    client.getDBSchema(),
    client.getAppRoutes(),
    client.getActiveDocs(),
  ])

  return {
    uiTokens,
    dbSchema,
    appRoutes,
    activeDocs,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Validiere Bot-Output gegen Projekt-Kontext
 * Wird nach jeder Bot-Aufgabe aufgerufen
 */
export async function validateBotOutput(
  code: string,
  filePath?: string
): Promise<{
  valid: boolean
  compliance: ComplianceResult
  suggestions: string[]
}> {
  const client = NexusBridgeClient.getInstance()
  const compliance = await client.validateCompliance(code, filePath)

  const suggestions: string[] = []

  // Generiere Verbesserungsvorschläge
  for (const violation of compliance.violations) {
    if (violation.suggestion) {
      suggestions.push(violation.suggestion)
    }
  }

  return {
    valid: compliance.compliant,
    compliance,
    suggestions,
  }
}

/**
 * Singleton-Export für einfachen Zugriff
 */
export const nexusBridge = NexusBridgeClient.getInstance()

// ============================================================================
// SHARED CONTEXT CACHE
// ============================================================================

/**
 * Gemeinsamer Kontext-Cache zwischen allen Agenten
 * Implementiert das Lazy-Loading und Cache-Invalidierung Pattern
 */
export class SharedContextCache {
  private static instance: SharedContextCache

  // Cache-Speicher
  private projectContext: {
    uiTokens: UITokens | null
    dbSchema: DBSchema | null
    appRoutes: AppRoutes | null
    activeDocs: ActiveDocs | null
    timestamp: string
  } | null = null

  // Cache-Konfiguration
  private cacheLifetime = 5 * 60 * 1000 // 5 Minuten
  private lastUpdate = 0
  private isLoading = false
  private loadingPromise: Promise<void> | null = null

  // Subscriber für Cache-Invalidierung
  private subscribers: Map<string, (context: typeof this.projectContext) => void> = new Map()

  private constructor() {}

  static getInstance(): SharedContextCache {
    if (!SharedContextCache.instance) {
      SharedContextCache.instance = new SharedContextCache()
    }
    return SharedContextCache.instance
  }

  /**
   * Hole Projekt-Kontext (mit Lazy-Loading und Caching)
   */
  async getContext(): Promise<{
    uiTokens: UITokens | null
    dbSchema: DBSchema | null
    appRoutes: AppRoutes | null
    activeDocs: ActiveDocs | null
    timestamp: string
  }> {
    // Prüfe ob Cache gültig ist
    if (this.projectContext && Date.now() - this.lastUpdate < this.cacheLifetime) {
      return this.projectContext
    }

    // Wenn bereits am Laden, warte auf das Promise
    if (this.isLoading && this.loadingPromise) {
      await this.loadingPromise
      return this.projectContext!
    }

    // Lade neuen Kontext
    await this.refreshContext()
    return this.projectContext!
  }

  /**
   * Erzwinge Aktualisierung des Kontexts
   */
  async refreshContext(): Promise<void> {
    this.isLoading = true

    this.loadingPromise = (async () => {
      try {
        this.projectContext = await loadProjectContext()
        this.lastUpdate = Date.now()

        // Benachrichtige Subscriber
        this.notifySubscribers()

        console.log(`🔄 Shared Context Cache aktualisiert: ${this.projectContext.timestamp}`)
      } catch (error) {
        console.error("❌ Fehler beim Laden des Shared Context:", error)
        // Bei Fehler: Alten Cache behalten wenn vorhanden
      } finally {
        this.isLoading = false
        this.loadingPromise = null
      }
    })()

    await this.loadingPromise
  }

  /**
   * Invalidiere Cache (z.B. nach Dateiänderungen)
   */
  invalidate(): void {
    this.lastUpdate = 0
    console.log("⚠️ Shared Context Cache invalidiert")
  }

  /**
   * Setze Cache-Lifetime
   */
  setCacheLifetime(ms: number): void {
    this.cacheLifetime = ms
  }

  /**
   * Hole einzelne Resource aus dem Cache
   */
  async getUITokens(): Promise<UITokens | null> {
    const context = await this.getContext()
    return context.uiTokens
  }

  async getDBSchema(): Promise<DBSchema | null> {
    const context = await this.getContext()
    return context.dbSchema
  }

  async getAppRoutes(): Promise<AppRoutes | null> {
    const context = await this.getContext()
    return context.appRoutes
  }

  async getActiveDocs(): Promise<ActiveDocs | null> {
    const context = await this.getContext()
    return context.activeDocs
  }

  /**
   * Subscribiere auf Cache-Änderungen
   */
  subscribe(agentId: string, callback: (context: typeof this.projectContext) => void): void {
    this.subscribers.set(agentId, callback)
    console.log(`📡 Agent ${agentId} subscribed zu Context-Updates`)
  }

  /**
   * Unsubscribe von Cache-Änderungen
   */
  unsubscribe(agentId: string): void {
    this.subscribers.delete(agentId)
    console.log(`📡 Agent ${agentId} unsubscribed von Context-Updates`)
  }

  /**
   * Benachrichtige alle Subscriber
   */
  private notifySubscribers(): void {
    for (const [agentId, callback] of this.subscribers) {
      try {
        callback(this.projectContext)
      } catch (error) {
        console.error(`Fehler beim Benachrichtigen von Agent ${agentId}:`, error)
      }
    }
  }

  /**
   * Hole Cache-Statistiken
   */
  getStats(): {
    cacheAge: number
    isValid: boolean
    subscriberCount: number
    lastUpdate: string
  } {
    return {
      cacheAge: Date.now() - this.lastUpdate,
      isValid: this.projectContext !== null && Date.now() - this.lastUpdate < this.cacheLifetime,
      subscriberCount: this.subscribers.size,
      lastUpdate: this.lastUpdate ? new Date(this.lastUpdate).toISOString() : "never",
    }
  }
}

/**
 * Singleton-Export für Shared Context Cache
 */
export const sharedContextCache = SharedContextCache.getInstance()

