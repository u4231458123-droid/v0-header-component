import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface V28MarketingSectionProps {
  children: ReactNode
  title?: string
  description?: string
  background?: "white" | "canvas" | "slate"
  className?: string
}

export function V28MarketingSection({
  children,
  title,
  description,
  background = "white",
  className,
}: V28MarketingSectionProps) {
  const bgClass = background === "canvas" ? "bg-muted/50" : background === "slate" ? "bg-muted" : "bg-background"

  return (
    <section className={cn("py-16 md:py-24", bgClass, className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center mb-12 md:mb-16">
            {title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
