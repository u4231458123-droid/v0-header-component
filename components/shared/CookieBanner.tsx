"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type ConsentSettings = {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [settings, setSettings] = useState<ConsentSettings>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsOpen(true)
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [])

  const handleAcceptAll = () => {
    const allGranted = { essential: true, analytics: true, marketing: true }
    saveConsent(allGranted)
  }

  const handleSaveSelection = () => {
    saveConsent(settings)
  }

  const saveConsent = (consentSettings: ConsentSettings) => {
    localStorage.setItem("cookie-consent", JSON.stringify(consentSettings))
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    setIsVisible(false)
    setTimeout(() => setIsOpen(false), 300)
    if (consentSettings.analytics && typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      })
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 md:p-6 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-foreground">Wir respektieren Ihre Privatsphäre</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Wir verwenden Cookies und ähnliche Technologien, um Ihr Nutzererlebnis zu verbessern, Analysen
                durchzuführen und relevante Inhalte bereitzustellen.
                <br />
                Weitere Informationen finden Sie in unserer{" "}
                <Link href="/datenschutz" className="text-foreground underline underline-offset-2 hover:text-primary">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-fit">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted/50 transition-colors"
              >
                Einstellungen
              </button>
              <button
                onClick={() => saveConsent({ essential: true, analytics: false, marketing: false })}
                className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted/50 transition-colors"
              >
                Nur Essenzielle
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Cookie-Einstellungen</h3>
              <p className="text-sm text-muted-foreground">
                Hier können Sie festlegen, welche Cookies wir verwenden dürfen.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Essential Cookies - bg-slate-50 -> bg-muted/50, bg-slate-400 -> bg-muted-foreground */}
              <div className="p-4 border rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Technisch notwendig</span>
                  <div className="w-10 h-6 bg-muted-foreground rounded-full relative cursor-not-allowed">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Diese Cookies sind für den Betrieb der Seite unerlässlich.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Statistik & Analyse</span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, analytics: !s.analytics }))}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      settings.analytics ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        settings.analytics ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Helfen uns, die Nutzung der Website zu verstehen.</p>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Marketing</span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, marketing: !s.marketing }))}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      settings.marketing ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        settings.marketing ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Werden für relevante Werbung verwendet.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={handleSaveSelection}
                className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
