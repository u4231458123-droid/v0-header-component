import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface V28IconBoxProps {
  icon: ReactNode
  variant?: "slate" | "primary" | "blue"
  className?: string
}

export function V28IconBox({ icon, variant = "slate", className }: V28IconBoxProps) {
  const variants = {
    slate: "bg-slate-100 text-slate-700",
    primary: "bg-slate-700 text-white",
    blue: "bg-blue-100 text-blue-700",
  }

  return (
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", variants[variant], className)}>
      {icon}
    </div>
  )
}
