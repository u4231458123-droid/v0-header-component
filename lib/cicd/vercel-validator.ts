/**
 * Vercel Projekt-Validierung
 * ===========================
 * Validiert Vercel-Konfiguration vor jedem Deployment
 * Verhindert Erstellung neuer Projekte
 */

export const VERCEL_CONFIG = {
  TEAM_ID: "team_jO6cawqC6mFroPHujn47acpU",
  PROJECT_NAME: "v0-header-component",
  PROJECT_URL: "https://vercel.com/mydispatchs-projects/v0-header-component",
  OIDC_ISSUER: "https://oidc.vercel.com/mydispatchs-projects",
  OIDC_AUDIENCE: "https://vercel.com/mydispatchs-projects",
  OIDC_SCOPE: "owner:mydispatchs-projects:project:mydispatch-rebuild-copy:environment:production",
} as const

export interface VercelValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  teamId?: string
  projectName?: string
}

/**
 * Validiert Vercel-Konfiguration
 * MUSS vor jedem Deployment aufgerufen werden
 */
export function validateVercelConfig(config?: {
  teamId?: string
  projectName?: string
  orgId?: string
}): VercelValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const teamId = config?.teamId || process.env.VERCEL_TEAM_ID
  const projectName = config?.projectName || process.env.VERCEL_PROJECT_NAME
  const orgId = config?.orgId || process.env.VERCEL_ORG_ID

  // Validiere Team-ID
  if (!teamId) {
    errors.push("VERCEL_TEAM_ID ist nicht gesetzt")
  } else if (teamId !== VERCEL_CONFIG.TEAM_ID) {
    errors.push(`Falsche Team-ID: ${teamId} (erwartet: ${VERCEL_CONFIG.TEAM_ID})`)
  }

  // Validiere Projekt-Name
  if (!projectName) {
    errors.push("VERCEL_PROJECT_NAME ist nicht gesetzt")
  } else if (projectName !== VERCEL_CONFIG.PROJECT_NAME) {
    errors.push(`Falscher Projekt-Name: ${projectName} (erwartet: ${VERCEL_CONFIG.PROJECT_NAME})`)
  }

  // Warnung wenn Org-ID fehlt (optional)
  if (!orgId) {
    warnings.push("VERCEL_ORG_ID ist nicht gesetzt (optional, wird aus Team-ID ermittelt)")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    teamId,
    projectName,
  }
}

/**
 * Validiert Vercel-Konfiguration und wirft Fehler bei Ungültigkeit
 */
export function assertVercelConfig(config?: {
  teamId?: string
  projectName?: string
  orgId?: string
}): void {
  const validation = validateVercelConfig(config)
  if (!validation.valid) {
    throw new Error(
      `Vercel-Konfiguration ungültig:\n${validation.errors.join("\n")}`
    )
  }
  if (validation.warnings.length > 0) {
    console.warn("Vercel-Konfiguration Warnungen:", validation.warnings.join(", "))
  }
}

