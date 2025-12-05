"use client"

import Link from "next/link"
import { COMPANY } from "@/lib/company-data"

export function AuthFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-6 px-4 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {COMPANY.name}. Alle Rechte vorbehalten.
          </p>

          <nav className="flex items-center gap-5">
            <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">
              Datenschutz
            </Link>
            <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground">
              AGB
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Kontakt
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
