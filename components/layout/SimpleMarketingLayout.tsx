"use client"

/**
 * SimpleMarketingLayout - V0-Compatible Version
 * NO shadcn/ui dependencies, NO lucide-react
 * Pure HTML/Tailwind with inline SVGs
 */

import { type ReactNode, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Inline SVG Icons
const Icons = {
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  HelpCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
}

interface SimpleMarketingLayoutProps {
  children: ReactNode
  currentPage?: string
}

export function SimpleMarketingLayout({ children, currentPage = "" }: SimpleMarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const menuItems = [
    { title: "Startseite", icon: Icons.Home, url: "/", page: "home" },
    { title: "Preise", icon: Icons.FileText, url: "/pricing", page: "pricing" },
    { title: "FAQ", icon: Icons.HelpCircle, url: "/faq", page: "faq" },
    { title: "Kontakt", icon: Icons.Mail, url: "/contact", page: "contact" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-muted"
            >
              {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>

            {/* Logo */}
            <Image
              src="/images/mydispatch-3d-logo.png"
              alt="MyDispatch"
              width={180}
              height={45}
              onClick={() => router.push("/")}
              className="h-9 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === item.page ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/auth/sign-up")}
                className="hidden sm:block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Starten
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
              >
                Anmelden
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      currentPage === item.page ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <IconComponent />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 my-dispatch.de by RideHub Solutions</p>
            <div className="flex items-center gap-6">
              <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">
                Datenschutz
              </Link>
              <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
