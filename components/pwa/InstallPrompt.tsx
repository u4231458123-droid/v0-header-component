"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show banner after 3 seconds if not dismissed before
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  // Don't show if already installed
  if (isStandalone) return null

  // iOS specific instructions
  if (isIOS && showInstallBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
        <div className="max-w-7xl mx-auto flex items-start gap-4">
          <div className="flex-1">
            <p className="font-semibold mb-1">MyDispatch installieren</p>
            <p className="text-sm text-primary-foreground/70">
              Tippen Sie auf{" "}
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" />
                </svg>
              </span>{" "}
              und dann auf "Zum Home-Bildschirm"
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-primary-foreground/60 hover:text-primary-foreground p-1"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Android/Desktop install prompt
  if (deferredPrompt && showInstallBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold">MyDispatch als App installieren</p>
            <p className="text-sm text-primary-foreground/70">Schneller Zugriff direkt vom Startbildschirm</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
            >
              Später
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-primary rounded-xl font-medium hover:bg-gray-100"
            >
              Installieren
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
