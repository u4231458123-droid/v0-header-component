"use client"

/* ==================================================================================
   FLOATING ACTIONS COMPONENT - V18.3.24 ULTIMATE
   ==================================================================================
   Mobile-optimierte Floating Action Buttons
   - Fixed Position (bottom-right)
   - Stack-Layout (vertikal)
   - Touch-optimiert (min 44px)
   ================================================================================== */

import { V28Button } from "@/components/design-system/V28Button"
import type { FloatingActionConfig } from "@/types/page-template"
import { cn } from "@/lib/utils"

interface FloatingActionsProps {
  actions: FloatingActionConfig[]
}

export function FloatingActions({ actions }: FloatingActionsProps) {
  if (!actions || actions.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-40">
      {actions.map((action, i) => {
        const variantMap: Record<string, "primary" | "secondary" | "ghost" | "destructive"> = {
          default: "primary",
          outline: "secondary",
          ghost: "ghost",
          destructive: "destructive",
        }
        return (
          <V28Button
            key={i}
            onClick={action.onClick}
            variant={variantMap[action.variant || "default"] || "primary"}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg p-0",
              "hover:scale-110 active:scale-95 transition-transform",
            )}
            aria-label={action.label}
            icon={action.icon}
          >
            {/* Empty for icon-only */}
          </V28Button>
        )
      })}
    </div>
  )
}
