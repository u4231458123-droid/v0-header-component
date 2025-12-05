/* ==================================================================================
   V28 BROWSER MOCKUP - V28.1 COMPLIANT
   ==================================================================================
   ✅ rounded-2xl (Pricing-Style)
   ✅ shadow-2xl (Premium)
   ✅ Browser Window mit Verkehrsampeln
   ✅ 100% Tailwind-native Slate Colors
   ✅ Wiederverwendbar für Dashboard-Previews
   ================================================================================== */

import type { ReactNode } from "react"

interface V28BrowserMockupProps {
  children: ReactNode
  title?: string
}

export function V28BrowserMockup({ children, title = "MyDispatch Dashboard" }: V28BrowserMockupProps) {
  return (
    <div className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card">
      {/* Premium Glow Effect - Tailwind-native */}
      <div className="absolute inset-0 bg-muted blur-xl opacity-20 pointer-events-none" />

      {/* Browser Window Container */}
      <div className="relative z-10">
        {/* Traffic Lights + Address Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
          {/* macOS Traffic Lights - SVG for Pixel-Perfect Rendering */}
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-red-400">
              <circle cx="6" cy="6" r="5" fill="currentColor" stroke="rgb(239 68 68)" strokeWidth="1" />
            </svg>
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-yellow-400">
              <circle cx="6" cy="6" r="5" fill="currentColor" stroke="rgb(250 204 21)" strokeWidth="1" />
            </svg>
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-green-400">
              <circle cx="6" cy="6" r="5" fill="currentColor" stroke="rgb(74 222 128)" strokeWidth="1" />
            </svg>
          </div>

          {/* Address Bar */}
          <div className="flex-1 mx-4 px-3 py-1.5 rounded-xl bg-card text-sm font-mono text-foreground text-center antialiased">
            {title}
          </div>

          {/* Spacer */}
          <div className="w-20" />
        </div>

        {/* Dashboard Content */}
        <div className="relative bg-card">{children}</div>
      </div>
    </div>
  )
}
