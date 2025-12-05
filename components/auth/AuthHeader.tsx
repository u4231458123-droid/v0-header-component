"use client"

import Link from "next/link"
import { COMPANY } from "@/lib/company-data"

interface AuthHeaderProps {
  companyName?: string
  logoUrl?: string
}

export function AuthHeader({ companyName, logoUrl }: AuthHeaderProps = {}) {
  const displayName = companyName || COMPANY.product

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        {logoUrl && <img src={logoUrl || "/placeholder.svg"} alt={displayName} className="h-8 w-8 object-contain" />}
        <span className="text-xl font-bold text-primary">{displayName}</span>
      </Link>
      <nav className="flex items-center gap-5">
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
          Anmelden
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90"
        >
          Starten
        </Link>
      </nav>
    </header>
  )
}
