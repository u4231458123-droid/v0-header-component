"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton"

interface PreLoginHeaderProps {
  activePage?: "home" | "preise" | "fragen" | "kontakt"
}

export function PreLoginHeader({ activePage }: PreLoginHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navigation: Preise, FAQ, Kontakt entfernt (nur Startseite und Anmelden)
  const navLinks = [
    { href: "/", label: "Startseite", id: "home" },
    // Entfernt: Preise, FAQ, Kontakt aus Header-Navigation
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-accent transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center">
            <Image
              src="/images/mydispatch-3d-logo.png"
              alt="MyDispatch - simply arrive"
              width={180}
              height={45}
              className="h-9 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  activePage === link.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Anmelden
            </Link>
            <PWAInstallButton
              forceShowInstall={true}
              showIcon={false}
              className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              App installieren
            </PWAInstallButton>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activePage === link.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border mt-4 space-y-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-center"
            >
              Anmelden
            </Link>
            <PWAInstallButton
              forceShowInstall={true}
              showIcon={false}
              className="block w-full px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
            >
              App installieren
            </PWAInstallButton>
          </div>
        </div>
      )}
    </header>
  )
}
