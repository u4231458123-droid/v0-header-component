/* ==================================================================================
   FOOTER V30.0 - OHNE SIDEBAR-OFFSET
   ==================================================================================
   - Sidebar entfernt, Footer hat jetzt volle Breite
   - Semantische Design-Tokens
   ================================================================================== */

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary/20 py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
            <span>© 2025 my-dispatch.de by RideHub Solutions</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Made in Germany</span>
          </div>

          {/* Right: Links */}
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/impressum" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Datenschutz
            </Link>
            <Link href="/agb" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              AGB
            </Link>
            <Link href="/kontakt" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Kontakt
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
