import type { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface V28MarketingCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function V28MarketingCard({ children, className, ...props }: V28MarketingCardProps) {
  return (
    <div className={cn("p-6 rounded-xl bg-white border border-slate-200 shadow-sm", className)} {...props}>
      {children}
    </div>
  )
}
