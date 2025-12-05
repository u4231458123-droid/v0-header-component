/**
 * SYSTEMWEITER FOOTER
 * ===================
 * UI-Library-Komponente für systemweite Verwendung
 * NIEMALS duplizieren oder abweichen
 */

"use client"

import { cn } from "@/lib/utils"
import { Logo } from "./logo"

export interface FooterProps {
  className?: string
  variant?: "default" | "minimal" | "full"
}

export function Footer({ className, variant = "default" }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t bg-background",
        className
      )}
    >
      <div className="container py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="text-sm text-muted-foreground">
            <p>MyDispatch - Professionelle Fahrdienst-Software</p>
            <p>Einfach. Übersichtlich. Vollständig. Wirtschaftlich.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

