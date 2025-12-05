"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, X, Settings, Check, Shield } from "lucide-react"

type ConsentSettings = {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function V28CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [settings, setSettings] = useState<ConsentSettings>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) {
      // Verzögertes Anzeigen für bessere UX
      const timer = setTimeout(() => setShowConsent(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (consentSettings: ConsentSettings) => {
    localStorage.setItem("cookieConsent", JSON.stringify(consentSettings))
    localStorage.setItem("cookieConsentDate", new Date().toISOString())
    setShowConsent(false)
  }

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true })
  }

  const acceptEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false })
  }

  const saveSelection = () => {
    saveConsent(settings)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {!showDetails ? (
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Wir respektieren Ihre Privatsphäre</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Wir verwenden Cookies, um Ihnen ein optimales Erlebnis zu bieten. Einige sind technisch notwendig,
                    andere helfen uns, die Website zu verbessern.{" "}
                    <Link href="/datenschutz" className="text-primary hover:underline">
                      Mehr erfahren
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowDetails(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Einstellungen
                    </button>
                    <button
                      onClick={acceptEssential}
                      className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                    >
                      Nur Notwendige
                    </button>
                    <button
                      onClick={acceptAll}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Alle akzeptieren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Cookie-Einstellungen</h3>
                    <p className="text-sm text-muted-foreground">Passen Sie Ihre Präferenzen an</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Notwendige Cookies */}
                <div className="p-4 border border-border rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">Technisch notwendig</span>
                    </div>
                    <div className="w-10 h-6 bg-primary rounded-full relative cursor-not-allowed">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-card rounded-full shadow" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diese Cookies sind für den Betrieb der Website unerlässlich und können nicht deaktiviert werden. Sie
                    speichern z.B. Ihre Login-Daten und Spracheinstellungen.
                  </p>
                </div>

                {/* Analyse Cookies */}
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">Statistik & Analyse</span>
                    <button
                      onClick={() => setSettings((s) => ({ ...s, analytics: !s.analytics }))}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        settings.analytics ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow transition-all ${
                          settings.analytics ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diese Cookies helfen uns zu verstehen, wie Besucher die Website nutzen. Alle Daten werden
                    anonymisiert erfasst.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">Marketing</span>
                    <button
                      onClick={() => setSettings((s) => ({ ...s, marketing: !s.marketing }))}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        settings.marketing ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow transition-all ${
                          settings.marketing ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diese Cookies werden verwendet, um Ihnen relevante Werbung anzuzeigen und die Wirksamkeit von
                    Werbekampagnen zu messen.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Link href="/datenschutz" className="text-sm text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
                <div className="flex gap-3">
                  <button
                    onClick={acceptEssential}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    Nur Notwendige
                  </button>
                  <button
                    onClick={saveSelection}
                    className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Auswahl speichern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
