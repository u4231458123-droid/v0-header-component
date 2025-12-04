/**
 * Toast-Helper Utilities
 * ======================
 * Standardisierte Toast-Funktionen für konsistente UX
 */

import { toast } from "sonner"

/**
 * Standardisierter Erfolgs-Toast
 */
export function showSuccessToast(title: string, description?: string) {
  toast.success(title, {
    description,
    duration: 4000,
  })
}

/**
 * Standardisierter Fehler-Toast
 */
export function showErrorToast(title: string, description?: string) {
  toast.error(title, {
    description,
    duration: 5000,
  })
}

/**
 * Standardisierter Info-Toast
 */
export function showInfoToast(title: string, description?: string) {
  toast.info(title, {
    description,
    duration: 4000,
  })
}

/**
 * Standardisierter Warn-Toast
 */
export function showWarningToast(title: string, description?: string) {
  toast.warning(title, {
    description,
    duration: 4000,
  })
}
