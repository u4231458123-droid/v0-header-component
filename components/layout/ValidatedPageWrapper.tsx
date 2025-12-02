import type { ReactNode } from "react"
import { useGridPatternValidation, useLegalComplianceValidation, useTouchTargetValidation } from "@/hooks/validation"

/**
 * Validated Page Wrapper
 *
 * Automatische Validierung für jede Page:
 * - Grid-Pattern (Mobile-First)
 * - Legal-Compliance (DSGVO, AI Act, TMG)
 * - Touch-Targets (≥ 44px)
 *
 * Siehe: docs/OPTIMIERUNGSPOTENZIAL_V18.5.1.md
 *
 * @example
 * <ValidatedPageWrapper
 *   gridPattern="DASHBOARD-GRID"
 *   hasForm={true}
 * >
 *   <YourPageContent />
 * </ValidatedPageWrapper>
 */

interface ValidatedPageWrapperProps {
  children: ReactNode
  gridPattern?: "HERO-GRID" | "TARIF-KARTEN-GRID" | "DASHBOARD-GRID" | "MOBILE-GRID-LAYOUT"
  hasForm?: boolean
  hasAI?: boolean
  hasFooter?: boolean
  className?: string
}

export const ValidatedPageWrapper = ({
  children,
  gridPattern,
  hasForm = false,
  hasAI = false,
  hasFooter = true,
  className = "",
}: ValidatedPageWrapperProps) => {
  // Validation Hooks (nur in Development)
  useGridPatternValidation(gridPattern || "MOBILE-GRID-LAYOUT")
  useLegalComplianceValidation({ hasForm, hasAI, hasFooter })
  useTouchTargetValidation()

  return <div className={className}>{children}</div>
}
