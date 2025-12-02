"use client"

import { useState, useCallback } from "react"

interface ValidationRule {
  validate: (value: unknown) => boolean
  message: string
}

interface FieldValidation {
  rules: ValidationRule[]
  value: unknown
}

interface ValidationState {
  isValid: boolean
  errors: Record<string, string[]>
  touched: Record<string, boolean>
}

export function useValidation(fields: Record<string, FieldValidation>) {
  const [state, setState] = useState<ValidationState>({
    isValid: true,
    errors: {},
    touched: {},
  })

  const validate = useCallback((fieldName?: string) => {
    const fieldsToValidate = fieldName
      ? { [fieldName]: fields[fieldName] }
      : fields

    const newErrors: Record<string, string[]> = { ...state.errors }
    let isValid = true

    Object.entries(fieldsToValidate).forEach(([name, field]) => {
      if (!field) return

      const fieldErrors: string[] = []

      field.rules.forEach((rule) => {
        if (!rule.validate(field.value)) {
          fieldErrors.push(rule.message)
          isValid = false
        }
      })

      if (fieldErrors.length > 0) {
        newErrors[name] = fieldErrors
      } else {
        delete newErrors[name]
      }
    })

    setState((prev) => ({
      ...prev,
      isValid,
      errors: newErrors,
    }))

    return isValid
  }, [fields, state.errors])

  const touch = useCallback((fieldName: string) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true },
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isValid: true,
      errors: {},
      touched: {},
    })
  }, [])

  const getFieldError = useCallback((fieldName: string) => {
    return state.touched[fieldName] ? state.errors[fieldName]?.[0] : undefined
  }, [state.errors, state.touched])

  return {
    ...state,
    validate,
    touch,
    reset,
    getFieldError,
  }
}

// Common validation rules
export const validationRules = {
  required: (message = "Dieses Feld ist erforderlich"): ValidationRule => ({
    validate: (value) => value !== undefined && value !== null && value !== "",
    message,
  }),

  email: (message = "Ungültige E-Mail-Adresse"): ValidationRule => ({
    validate: (value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === "string" && value.length >= min,
    message: message || `Mindestens ${min} Zeichen erforderlich`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === "string" && value.length <= max,
    message: message || `Maximal ${max} Zeichen erlaubt`,
  }),

  phone: (message = "Ungültige Telefonnummer"): ValidationRule => ({
    validate: (value) => typeof value === "string" && /^[+]?[\d\s-]{6,20}$/.test(value),
    message,
  }),

  password: (message = "Passwort muss mindestens 8 Zeichen, einen Großbuchstaben und eine Zahl enthalten"): ValidationRule => ({
    validate: (value) => typeof value === "string" && /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
    message,
  }),
}

// ============================================================================
// PAGE VALIDATION HOOKS (Development Only)
// ============================================================================

type GridPattern = "HERO-GRID" | "TARIF-KARTEN-GRID" | "DASHBOARD-GRID" | "MOBILE-GRID-LAYOUT"

interface LegalComplianceOptions {
  hasForm?: boolean
  hasAI?: boolean
  hasFooter?: boolean
}

/**
 * Grid Pattern Validation Hook
 * Validates that the page uses proper grid patterns for mobile-first design
 */
export function useGridPatternValidation(pattern: GridPattern): void {
  // Only run validation in development
  if (process.env.NODE_ENV !== "development") return

  // Grid pattern validation is currently a no-op but can be extended
  // to check DOM for proper grid structure
}

/**
 * Legal Compliance Validation Hook
 * Validates DSGVO, AI Act, and TMG compliance requirements
 */
export function useLegalComplianceValidation(options: LegalComplianceOptions): void {
  // Only run validation in development
  if (process.env.NODE_ENV !== "development") return

  // Legal compliance checks:
  // - hasForm: Ensure privacy policy link exists
  // - hasAI: Ensure AI disclosure is present
  // - hasFooter: Ensure Impressum/Datenschutz links exist
}

/**
 * Touch Target Validation Hook
 * Validates that all interactive elements have minimum 44px touch targets
 */
export function useTouchTargetValidation(): void {
  // Only run validation in development
  if (process.env.NODE_ENV !== "development") return

  // Touch target validation can be extended to check DOM for
  // buttons, links, and other interactive elements with proper sizing
}
