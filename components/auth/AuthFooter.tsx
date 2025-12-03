"use client"

import Link from "next/link"
import { COMPANY } from "@/lib/company-data"

export function AuthFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-6 px-4 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/70">
            &copy; {currentYear} {COMPANY.name}. Alle Rechte vorbehalten.
          </p>

          <nav className="flex items-center gap-6">
            <Link href="/impressum" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Datenschutz
            </Link>
            <Link href="/agb" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              AGB
            </Link>
            <Link href="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Kontakt
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
