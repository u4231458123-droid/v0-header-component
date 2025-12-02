/**
 * SYSTEMWEITE ÄNDERUNGS-MANAGER
 * =============================
 * Stellt sicher, dass Änderungen SYSTEMWEIT umgesetzt werden
 * NIEMALS nur ein Bereich - IMMER alle betroffenen Bereiche
 */

import { promises as fs } from "fs"
import path from "path"
import { logError } from "./error-logger"

export interface SystemwideChange {
  id: string
  timestamp: string
  changeRequestId: string
  affectedAreas: string[]
  affectedFiles: string[]
  affectedDocs: string[]
  affectedOnboarding: boolean
  affectedBrowserGuidance: boolean
  affectedCustomerDescriptions: boolean
  status: "planned" | "in-progress" | "completed" | "failed"
  implementationPlan: {
    code: string[]
    documentation: string[]
    onboarding: string[]
    ui: string[]
    api: string[]
    database: string[]
    email: string[]
    pdf: string[]
  }
}

export class SystemwideChangeManager {
  private changesPath: string

  constructor() {
    this.changesPath = path.join(process.cwd(), ".cicd", "systemwide-changes.json")
  }

  /**
   * Erstelle systemweite Änderungsplan
   */
  async createSystemwideChange(changeRequest: any, impact: any): Promise<SystemwideChange> {
    const change: SystemwideChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      changeRequestId: changeRequest.id,
      affectedAreas: impact.affectedAreas || [],
      affectedFiles: impact.affectedFiles || [],
      affectedDocs: impact.affectedDocs || [],
      affectedOnboarding: impact.affectedOnboarding || false,
      affectedBrowserGuidance: impact.affectedBrowserGuidance || false,
      affectedCustomerDescriptions: impact.affectedCustomerDescriptions || false,
      status: "planned",
      implementationPlan: {
        code: this.planCodeChanges(impact),
        documentation: this.planDocumentationChanges(impact),
        onboarding: this.planOnboardingChanges(impact),
        ui: this.planUIChanges(impact),
        api: this.planAPIChanges(impact),
        database: this.planDatabaseChanges(impact),
        email: this.planEmailChanges(impact),
        pdf: this.planPDFChanges(impact),
      },
    }

    await this.saveChange(change)

    await logError({
      type: "systemwide-change-created",
      severity: "low",
      category: "systemwide-change-manager",
      message: `Systemweite Änderung geplant: ${change.id}`,
      context: {
        changeId: change.id,
        affectedAreas: change.affectedAreas,
        implementationPlan: change.implementationPlan,
      },
      solution: "Wird systemweit umgesetzt",
      botId: "systemwide-change-manager",
    })

    return change
  }

  /**
   * Plane Code-Änderungen
   */
  private planCodeChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.code) {
      plans.push("Alle betroffenen Code-Dateien aktualisieren")
      plans.push("TypeScript-Typen aktualisieren")
      plans.push("Tests aktualisieren")
      plans.push("Komponenten aktualisieren")
    }

    if (impact.affectedAreas.includes("Routing")) {
      plans.push("Middleware aktualisieren")
      plans.push("Routing-Logik aktualisieren")
    }

    if (impact.affectedAreas.includes("UI/UX")) {
      plans.push("UI-Komponenten aktualisieren")
      plans.push("Design-System aktualisieren")
    }

    return plans
  }

  /**
   * Plane Dokumentations-Änderungen
   */
  private planDocumentationChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.documentation) {
      plans.push("Knowledge-Base aktualisieren")
      plans.push("Vorgaben-Dokumentation aktualisieren")
      plans.push("Best-Practices-Dokumentation aktualisieren")
    }

    if (impact.affectedDocs.length > 0) {
      impact.affectedDocs.forEach((doc: string) => {
        plans.push(`${doc} aktualisieren`)
      })
    }

    return plans
  }

  /**
   * Plane Onboarding-Änderungen
   */
  private planOnboardingChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.affectedOnboarding) {
      plans.push("Onboarding-Prozess aktualisieren")
      plans.push("Onboarding-Texte aktualisieren")
      plans.push("Onboarding-Screenshots aktualisieren")
    }

    if (impact.affectedBrowserGuidance) {
      plans.push("Browser-Führung aktualisieren")
      plans.push("Schritt-für-Schritt-Anleitung aktualisieren")
    }

    if (impact.affectedCustomerDescriptions) {
      plans.push("Kundenbeschreibungen aktualisieren")
      plans.push("Feature-Beschreibungen aktualisieren")
    }

    return plans
  }

  /**
   * Plane UI-Änderungen
   */
  private planUIChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.ui) {
      plans.push("UI-Komponenten aktualisieren")
      plans.push("Design-Tokens aktualisieren")
      plans.push("Layout-Komponenten aktualisieren")
      plans.push("Responsive Design prüfen")
    }

    return plans
  }

  /**
   * Plane API-Änderungen
   */
  private planAPIChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.api) {
      plans.push("API-Endpoints aktualisieren")
      plans.push("API-Dokumentation aktualisieren")
      plans.push("API-Tests aktualisieren")
    }

    return plans
  }

  /**
   * Plane Datenbank-Änderungen
   */
  private planDatabaseChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.database) {
      plans.push("Datenbank-Schema aktualisieren")
      plans.push("Migrationen erstellen")
      plans.push("Datenbank-Dokumentation aktualisieren")
    }

    return plans
  }

  /**
   * Plane E-Mail-Änderungen
   */
  private planEmailChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.email) {
      plans.push("E-Mail-Templates aktualisieren")
      plans.push("E-Mail-Branding aktualisieren")
      plans.push("E-Mail-Tests aktualisieren")
    }

    return plans
  }

  /**
   * Plane PDF-Änderungen
   */
  private planPDFChanges(impact: any): string[] {
    const plans: string[] = []

    if (impact.systemwideImpact?.pdf) {
      plans.push("PDF-Generierung aktualisieren")
      plans.push("PDF-Templates aktualisieren")
      plans.push("PDF-Tests aktualisieren")
    }

    return plans
  }

  /**
   * Speichere Änderung
   */
  private async saveChange(change: SystemwideChange): Promise<void> {
    const changes = await this.loadChanges()
    changes.push(change)
    await fs.mkdir(path.dirname(this.changesPath), { recursive: true })
    await fs.writeFile(this.changesPath, JSON.stringify(changes, null, 2), "utf-8")
  }

  /**
   * Lade Änderungen
   */
  private async loadChanges(): Promise<SystemwideChange[]> {
    try {
      const content = await fs.readFile(this.changesPath, "utf-8")
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * Erhalte Änderung
   */
  async getChange(changeId: string): Promise<SystemwideChange | null> {
    const changes = await this.loadChanges()
    return changes.find((c) => c.id === changeId) || null
  }

  /**
   * Aktualisiere Status
   */
  async updateStatus(changeId: string, status: SystemwideChange["status"]): Promise<void> {
    const changes = await this.loadChanges()
    const change = changes.find((c) => c.id === changeId)
    if (change) {
      change.status = status
      await fs.writeFile(this.changesPath, JSON.stringify(changes, null, 2), "utf-8")
    }
  }
}

