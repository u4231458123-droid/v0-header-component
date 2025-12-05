/**
 * Zentrales Error-Handling
 * ========================
 * Standardisierte Fehlerbehandlung für die gesamte App
 */

import { showErrorToast } from "./toast-helpers"

export interface ErrorContext {
  component?: string
  action?: string
  metadata?: Record<string, unknown>
}

export class ErrorHandler {
  /**
   * Behandelt einen Fehler und gibt eine benutzerfreundliche Nachricht zurück
   */
  static handle(error: unknown, context?: string | ErrorContext): string {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    const errorStack = error instanceof Error ? error.stack : undefined

    // Kontext-Informationen extrahieren
    const contextInfo =
      typeof context === "string"
        ? { component: context }
        : context || { component: "Unknown" }

    // In Production: An Error-Tracking-Service senden (z.B. Sentry)
    if (process.env.NODE_ENV === "production") {
      // TODO: Error-Tracking-Service integrieren
      // Sentry.captureException(error, {
      //   tags: contextInfo,
      //   extra: { stack: errorStack },
      // })
    }

    // In Development: Detailliertes Logging
    if (process.env.NODE_ENV === "development") {
      console.error(`[${contextInfo.component}]`, errorMessage, {
        stack: errorStack,
        ...contextInfo.metadata,
      })
    }

    return errorMessage
  }

  /**
   * Behandelt einen Fehler und zeigt einen Toast
   */
  static showToast(error: unknown, context?: string | ErrorContext, customMessage?: string): void {
    const message = this.handle(error, context)
    showErrorToast(customMessage || "Fehler aufgetreten", message)
  }

  /**
   * Behandelt einen Fehler ohne Toast (für stille Fehler)
   */
  static handleSilent(error: unknown, context?: string | ErrorContext): string {
    return this.handle(error, context)
  }

  /**
   * Validiert und konvertiert unknown zu Error
   */
  static toError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    if (typeof error === "string") {
      return new Error(error)
    }
    return new Error("Unbekannter Fehler")
  }
}
