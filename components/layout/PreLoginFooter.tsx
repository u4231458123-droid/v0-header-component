"use client"

import Link from "next/link"
import Image from "next/image"

export function PreLoginFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/images/mydispatch-3d-logo.png"
              alt="MyDispatch - simply arrive"
              width={140}
              height={35}
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-sm text-primary-foreground/70">
              Die moderne Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Unternehmen. Made in Germany.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/preise" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/fragen" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link
                  href="/nutzungsbedingungen"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Nutzungsbedingungen
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>RideHub Solutions</li>
              <li>Ensbachmühle 4</li>
              <li>94571 Schaufling</li>
              <li className="pt-2">
                <a href="mailto:info@my-dispatch.de" className="hover:text-primary-foreground transition-colors">
                  info@my-dispatch.de
                </a>
              </li>
              <li>
                <a href="tel:+4917080044230" className="hover:text-primary-foreground transition-colors">
                  +49 170 8004423
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} my-dispatch.de by RideHub Solutions. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/ki-vorschriften"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              KI-Vorschriften
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("cookie-consent")
                  window.location.reload()
                }
              }}
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              Cookie-Einstellungen
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
