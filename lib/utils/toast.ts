/**
 * Standardisierte Toast-Utilities für MyDispatch
 *
 * Alle Toasts folgen diesem Format:
 * - Erfolgs-Toasts: 4000ms Duration (Standard), kann überschrieben werden
 * - Fehler-Toasts: 5000ms Duration (Standard), kann überschrieben werden
 * - Warn-Toasts: 4000ms Duration (Standard), kann überschrieben werden
 * - Info-Toasts: 3000ms Duration (Standard), kann überschrieben werden
 *
 * WICHTIG: Ursprüngliche Durations werden beibehalten, wenn explizit angegeben
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
 * @param options - Optionale Beschreibung und weitere Optionen (duration kann überschrieben werden)
 *
 * @example
 * toastSuccess("Fahrer erfolgreich angelegt", {
 *   description: "Der Fahrer wurde zu Ihrem Team hinzugefügt und kann nun zugewiesen werden.",
 *   duration: 3000 // Überschreibt Standard-Duration von 4000ms
 * })
 */
export function toastSuccess(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000, // Standard: 4000ms, kann überschrieben werden
    action: options?.action,
  })
}

/**
 * Standardisierter Fehler-Toast
 *
 * @param message - Hauptnachricht (z.B. "Fehler beim Speichern")
 * @param options - Optionale Fehlerbeschreibung und weitere Optionen (duration kann überschrieben werden)
 *
 * @example
 * toastError("Fehler beim Anlegen des Fahrers", {
 *   description: "Bitte überprüfen Sie die Eingaben und versuchen Sie es erneut.",
 *   duration: 6000 // Überschreibt Standard-Duration von 5000ms
 * })
 */
export function toastError(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000, // Standard: 5000ms, kann überschrieben werden
    action: options?.action,
  })
}

/**
 * Standardisierter Warn-Toast
 *
 * @param message - Hauptnachricht (z.B. "Achtung")
 * @param options - Optionale Warnung und Handlungsempfehlung (duration kann überschrieben werden)
 *
 * @example
 * toastWarning("E-Mail bereits registriert", {
 *   description: "Der Fahrer wird ohne Zugangsdaten angelegt.",
 *   duration: 5000 // Überschreibt Standard-Duration von 4000ms
 * })
 */
export function toastWarning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 4000, // Standard: 4000ms, kann überschrieben werden
    action: options?.action,
  })
}

/**
 * Standardisierter Info-Toast
 *
 * @param message - Hauptnachricht
 * @param options - Optionale Information (duration kann überschrieben werden)
 */
export function toastInfo(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 3000, // Standard: 3000ms, kann überschrieben werden
    action: options?.action,
  })
}

// Re-export sonner toast für erweiterte Fälle
export { toast as toastRaw } from "sonner"
