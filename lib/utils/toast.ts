/**
 * Standardisierte Toast-Utilities für MyDispatch
 *
 * Alle Toasts folgen diesem Format:
 * - Erfolgs-Toasts: 4000ms Duration, mit Beschreibung des nächsten Schritts
 * - Fehler-Toasts: 5000ms Duration, mit hilfreicher Fehlerbeschreibung
 * - Warn-Toasts: 4000ms Duration, mit Handlungsempfehlung
 * - Info-Toasts: 3000ms Duration, mit kurzer Information
 */

import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Standardisierter Erfolgs-Toast
 *
 * @param message - Hauptnachricht (z.B. "Aktion erfolgreich")
 * @param options - Optionale Beschreibung und weitere Optionen
 *
 * @example
 * toastSuccess("Fahrer erfolgreich angelegt", {
 *   description: "Der Fahrer wurde zu Ihrem Team hinzugefügt und kann nun zugewiesen werden."
 * })
 */
export function toastSuccess(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action,
  })
}

/**
 * Standardisierter Fehler-Toast
 *
 * @param message - Hauptnachricht (z.B. "Fehler beim Speichern")
 * @param options - Optionale Fehlerbeschreibung und weitere Optionen
 *
 * @example
 * toastError("Fehler beim Anlegen des Fahrers", {
 *   description: "Bitte überprüfen Sie die Eingaben und versuchen Sie es erneut."
 * })
 */
export function toastError(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    action: options?.action,
  })
}

/**
 * Standardisierter Warn-Toast
 *
 * @param message - Hauptnachricht (z.B. "Achtung")
 * @param options - Optionale Warnung und Handlungsempfehlung
 *
 * @example
 * toastWarning("E-Mail bereits registriert", {
 *   description: "Der Fahrer wird ohne Zugangsdaten angelegt."
 * })
 */
export function toastWarning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action,
  })
}

/**
 * Standardisierter Info-Toast
 *
 * @param message - Hauptnachricht
 * @param options - Optionale Information
 */
export function toastInfo(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 3000,
    action: options?.action,
  })
}

// Re-export sonner toast für erweiterte Fälle
export { toast as toastRaw } from "sonner"
