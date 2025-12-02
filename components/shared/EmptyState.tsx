"use client"

import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}

      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}
