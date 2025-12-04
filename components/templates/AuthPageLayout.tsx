/* ==================================================================================
   ⚠️ LAYOUT FREEZE V28.1 - KEINE DESIGN/LAYOUT-ÄNDERUNGEN ERLAUBT!
   ==================================================================================
   DESIGN-SYSTEM: V28.1 Professional Minimalism (Slate-Palette)
   GESCHÜTZT: Layout-Struktur, Fixed Header/Footer, Spacing, Z-Index
   ERLAUBT: Technische Optimierungen (Performance, A11y, Security)
   VERBOTEN: Design-Änderungen, Layout-Anpassungen, neue UI-Features
   LETZTE FREIGABE: 2025-01-30
   ==================================================================================

   AUTH-PAGE LAYOUT V28.1 - SPECIALIZED LAYOUT FOR AUTH PAGES
   ==================================================================================
   ✅ NO Sidebar (Desktop oder Mobile Sheet Menu)
   ✅ Uses AuthHeader (nicht Marketing-Header)
   ✅ Uses AuthFooter (nicht Marketing-Footer)
   ✅ Fixed Header (64px) + Fixed Footer (64px)
   ✅ Content Area mit korrektem Padding (pt-20 pb-20)
   ✅ min-h-screen für vertikale Zentrierung
   ✅ Scroll-fähig bei langen Forms
   ✅ V28ChatWidget Integration (Global)
   ✅ V28CookieConsent Integration (Global)
   ================================================================================== */

import type { ReactNode } from "react"
import { AuthHeader } from "@/components/auth/AuthHeader"
import { AuthFooter } from "@/components/auth/AuthFooter"
import { V28ChatWidget } from "@/components/chat/V28ChatWidget"
import { V28CookieConsent } from "@/components/shared/V28CookieConsent"

interface AuthPageLayoutProps {
  children: ReactNode
  companyName?: string
  logoUrl?: string
}

export function AuthPageLayout({ children, companyName = "MyDispatch", logoUrl }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Fixed Top (z-30) */}
      <AuthHeader companyName={companyName} logoUrl={logoUrl} />

      {/* Main Content - Scrollable mit pb für Footer (h-16 mobile, h-12 desktop) */}
      <main className="flex-1 pt-20 sm:pt-16 pb-20 sm:pb-16">{children}</main>

      {/* Footer - Fixed Bottom (z-20) */}
      <AuthFooter />

      {/* Cookie Consent - Global (z-60 - highest priority) */}
      <div className="z-60 relative">
        <V28CookieConsent />
      </div>

      {/* Chat Widget - Global (z-50 button, z-70 dialog) */}
      <div className="[&>button]:z-50 [&>div[role='dialog']]:z-70">
        <V28ChatWidget />
      </div>
    </div>
  )
}
