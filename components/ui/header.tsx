/**
 * SYSTEMWEITER HEADER
 * ===================
 * UI-Library-Komponente für systemweite Verwendung
 * NIEMALS duplizieren oder abweichen
 */

"use client"

import { Logo } from "./logo"
import { Navigation } from "./navigation"
import { cn } from "@/lib/utils"

export interface HeaderProps {
  className?: string
  variant?: "default" | "minimal" | "full"
}

export function Header({ className, variant = "default" }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-5">
        <Logo />
        {variant !== "minimal" && <Navigation />}
      </div>
    </header>
  )
}

