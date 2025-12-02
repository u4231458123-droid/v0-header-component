/* ==================================================================================
   PAGE WRAPPER V31.6 - GLOBALES LAYOUT-SYSTEM
   ==================================================================================
   ✅ Zentrale Steuerung für Spacing & Responsive-Grid
   ✅ max-w-screen-xl mx-auto für alle Seiten
   ✅ px-4 sm:px-6 md:px-12 für konsistente Außenabstände
   ✅ gap-16, py-20 für globales Innen-Spacing
   ✅ Mandatorisch auf ALLEN Pre-Login-Seiten
   ================================================================================== */

import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div
      className={`min-h-screen bg-background text-foreground flex flex-col items-center justify-start px-4 sm:px-6 md:px-12 max-w-screen-xl mx-auto gap-16 py-20 ${className}`}
    >
      {children}
    </div>
  )
}
