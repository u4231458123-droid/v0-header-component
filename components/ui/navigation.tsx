/**
 * SYSTEMWEITE NAVIGATION
 * ======================
 * UI-Library-Komponente für systemweite Verwendung
 * NIEMALS duplizieren oder abweichen
 */

"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export interface NavigationProps {
  className?: string
  items?: Array<{ href: string; label: string }>
}

export function Navigation({ className, items }: NavigationProps) {
  const defaultItems = items || [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/bookings", label: "Aufträge" },
    { href: "/vehicles", label: "Fahrzeuge" },
    { href: "/drivers", label: "Fahrer" },
  ]

  return (
    <nav className={cn("flex items-center gap-5", className)}>
      {defaultItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

