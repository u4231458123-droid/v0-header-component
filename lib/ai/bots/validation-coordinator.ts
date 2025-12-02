/**
 * VALIDATION-COORDINATOR
 * ======================
 * Koordiniert Prüfungsaufträge zwischen Assistenten und Prüfungsbots
 */

import { getBotArchitectureForArea } from "./bot-architecture"
import { findWorksByBot } from "@/lib/cicd/work-documentation"

export interface ValidationRequest {
  id: string
  workId: string
  area: string
  validationBots: string[]
  status: "pending" | "in-progress" | "completed" | "failed"
  results: Record<string, any>
  createdAt: string
  completedAt?: string
}

/**
 * Validation-Coordinator für Prüfungsaufträge
 */
export class ValidationCoordinator {
  private requests: ValidationRequest[] = []

  /**
   * Erstelle Prüfungsauftrag
   */
  async createValidationRequest(workId: string, area: string): Promise<ValidationRequest> {
    const architecture = getBotArchitectureForArea(area)
    if (!architecture) {
      throw new Error(`Keine Architektur gefunden für Bereich: ${area}`)
    }

    const request: ValidationRequest = {
      id: `validation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      workId,
      area,
      validationBots: architecture.validationBots,
      status: "pending",
      results: {},
      createdAt: new Date().toISOString(),
    }

    this.requests.push(request)
    console.log(`📋 Prüfungsauftrag erstellt: ${request.id} für ${workId}`)

    // Starte Prüfungen
    await this.startValidations(request)

    return request
  }

  /**
   * Starte Prüfungen
   */
  private async startValidations(request: ValidationRequest): Promise<void> {
    request.status = "in-progress"

    // Starte Prüfungen parallel
    const validationPromises = request.validationBots.map(async (botId) => {
      try {
        console.log(`🔍 Starte Prüfung: ${botId} für ${request.workId}`)
        const result = await this.runValidation(botId, request.workId)
        request.results[botId] = result
        console.log(`✅ Prüfung abgeschlossen: ${botId}`)
      } catch (error: any) {
        console.error(`❌ Prüfung fehlgeschlagen: ${botId} - ${error.message}`)
        request.results[botId] = { error: error.message }
      }
    })

    await Promise.all(validationPromises)

    // Prüfe ob alle Prüfungen erfolgreich waren
    const allSuccessful = Object.values(request.results).every(
      (result) => !result.error && (result.passed !== false)
    )

    request.status = allSuccessful ? "completed" : "failed"
    request.completedAt = new Date().toISOString()

    console.log(`📊 Prüfungsauftrag abgeschlossen: ${request.id} - Status: ${request.status}`)
  }

  /**
   * Führe Prüfung mit Bot aus
   */
  private async runValidation(botId: string, workId: string): Promise<any> {
    // Lade Work-Entry
    const { findWorksByBot } = await import("@/lib/cicd/work-documentation")
    const allWorks = await findWorksByBot("all")
    const work = allWorks.find((w) => w.id === workId)

    if (!work) {
      throw new Error(`Work-Entry ${workId} nicht gefunden`)
    }

    // Lade Bot basierend auf botId
    let result: any = null

    switch (botId) {
      case "quality-bot": {
        const { QualityBot } = await import("./quality-bot")
        const bot = new QualityBot()
        
        // Führe Qualitätsprüfung durch
        if (work.filePath) {
          const fs = await import("fs/promises")
          const codeContent = await fs.readFile(work.filePath, "utf-8")
          const validation = await bot.checkCodeAgainstDocumentation(
            codeContent,
            work,
            work.filePath
          )
          result = {
            passed: validation.passed,
            issues: validation.violations.map((v) => v.message),
            violations: validation.violations,
            timestamp: new Date().toISOString(),
          }
        } else {
          // Fallback: Prüfe Dokumentation
          result = {
            passed: work.errors?.length === 0,
            issues: work.errors?.map((e: any) => e.message) || [],
            timestamp: new Date().toISOString(),
          }
        }
        break
      }
      case "text-quality-bot": {
        const { TextQualityBot } = await import("./text-quality-bot")
        const bot = new TextQualityBot()
        
        // Führe Text-Qualitäts-Prüfung durch
        const review = await bot.reviewTextQuality(workId)
        result = {
          passed: review.passed,
          issues: review.issues,
          timestamp: new Date().toISOString(),
        }
        break
      }
      case "master-bot": {
        const { MasterBot } = await import("./master-bot")
        const bot = new MasterBot()
        
        // Master-Bot validiert die Prüfung
        result = {
          passed: work.errors?.length === 0 && work.status === "completed",
          issues: work.errors?.map((e: any) => e.message) || [],
          timestamp: new Date().toISOString(),
        }
        break
      }
      default:
        throw new Error(`Unbekannter Prüfungsbot: ${botId}`)
    }

    return result
  }

  /**
   * Sammle Prüfungsergebnisse
   */
  async collectValidationResults(workId: string): Promise<any> {
    const request = this.requests.find((r) => r.workId === workId)
    if (!request) {
      throw new Error(`Kein Prüfungsauftrag gefunden für: ${workId}`)
    }

    // Warte bis Prüfung abgeschlossen ist
    while (request.status === "pending" || request.status === "in-progress") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return {
      requestId: request.id,
      status: request.status,
      results: request.results,
      completedAt: request.completedAt,
    }
  }

  /**
   * Hole Prüfungsauftrag
   */
  getValidationRequest(workId: string): ValidationRequest | undefined {
    return this.requests.find((r) => r.workId === workId)
  }
}

// Singleton-Instanz
export const validationCoordinator = new ValidationCoordinator()

