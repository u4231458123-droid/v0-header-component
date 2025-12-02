"use client"

import { Button } from "@/components/ui/button"
import type { ReactNode, ComponentType } from "react"

interface BulkAction {
  label: string
  onClick: () => void
  icon?: ReactNode | ComponentType<{ className?: string }>
  variant?: "primary" | "secondary" | "danger"
  disabled?: boolean
}

export interface BulkActionBarProps {
  selectedCount: number
  onClear: () => void
  actions: BulkAction[]
}

export function BulkActionBar({ selectedCount, onClear, actions }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3 shadow-lg">
      <span className="text-sm font-medium text-muted-foreground">
        {selectedCount} ausgewählt
      </span>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          // Handle both ReactNode and ComponentType icons
          let iconElement: ReactNode = null
          if (action.icon) {
            if (typeof action.icon === "function") {
              const IconComponent = action.icon as ComponentType<{ className?: string }>
              iconElement = <IconComponent className="h-4 w-4 mr-1" />
            } else {
              iconElement = action.icon
            }
          }

          return (
            <Button
              key={index}
              variant={action.variant === "danger" ? "ghost" : action.variant === "primary" ? "default" : "ghost"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.variant === "danger" ? "text-destructive hover:text-destructive" : ""}
            >
              {iconElement}
              {action.label}
            </Button>
          )
        })}
      </div>

      <div className="h-4 w-px bg-border" />

      <Button variant="ghost" size="sm" onClick={onClear}>
        Auswahl aufheben
      </Button>
    </div>
  )
}
