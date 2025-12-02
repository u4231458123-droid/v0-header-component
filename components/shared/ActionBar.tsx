"use client"

/* ==================================================================================
   ACTION BAR COMPONENT - V18.3.24 ULTIMATE
   ==================================================================================
   Intelligente Action-Leiste mit automatischem Bulk-Modus
   - Primary Actions (Links, auffällig)
   - Secondary Actions (Rechts, outline)
   - Bulk Actions (Overlay wenn Selection aktiv)
   ================================================================================== */

import { V28Button } from "@/components/design-system/V28Button"
import { BulkActionBar } from "@/components/shared/BulkActionBar"
import type { ActionConfig, BulkActionConfig } from "@/types/page-template"

interface ActionBarProps {
  primary?: ActionConfig[]
  secondary?: ActionConfig[]
  bulk?: BulkActionConfig
  selectedCount?: number
  selectedIds?: string[]
}

export function ActionBar({ primary, secondary, bulk, selectedCount = 0, selectedIds = [] }: ActionBarProps) {
  // Wenn Bulk-Selection aktiv, zeige BulkActionBar
  if (bulk && selectedCount > 0 && selectedIds.length > 0) {
    return (
      <BulkActionBar
        selectedCount={selectedCount}
        onClear={bulk.onClear}
        actions={bulk.actions.map((action) => ({
          label: action.label,
          icon: action.icon,
          onClick: () => action.onClick(selectedIds),
          variant: action.variant,
        }))}
      />
    )
  }

  // Keine Actions definiert
  if (!primary && !secondary) {
    return null
  }

  // Standard Action Buttons
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* Primary Actions (Links) */}
      <div className="flex gap-2 flex-wrap">
        {primary?.map((action, i) => (
          <V28Button
            key={i}
            onClick={action.onClick}
            variant={
              action.variant === "destructive" ? "destructive" : action.variant === "default" ? "primary" : "secondary"
            }
            disabled={action.disabled}
            className="hover:text-foreground"
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
            {action.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-background/20 rounded">{action.badge}</span>
            )}
          </V28Button>
        ))}
      </div>

      {/* Secondary Actions (Rechts) */}
      {secondary && secondary.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {secondary.map((action, i) => (
            <V28Button
              key={i}
              onClick={action.onClick}
              variant="secondary"
              disabled={action.disabled}
              size="sm"
              className="hover:text-foreground"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {!action.icon && action.label}
            </V28Button>
          ))}
        </div>
      )}
    </div>
  )
}
