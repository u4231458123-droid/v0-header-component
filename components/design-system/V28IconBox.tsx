import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface V28IconBoxProps {
  icon: ReactNode
  variant?: "slate" | "primary" | "blue"
  className?: string
}

export function V28IconBox({ icon, variant = "slate", className }: V28IconBoxProps) {
  const variants = {
    slate: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    blue: "bg-info/20 text-info",
  }

  return (
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", variants[variant], className)}>
      {icon}
    </div>
  )
}
