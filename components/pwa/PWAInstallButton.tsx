"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface Window {
    deferredPWAPrompt: BeforeInstallPromptEvent | null
  }
}

interface PWAInstallButtonProps {
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  forceShowInstall?: boolean
}

export function PWAInstallButton({
  className = "",
  children,
  showIcon = true,
  forceShowInstall = false,
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window === "undefined") return

    // iOS Detection
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if already installed
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    setIsInstalled(isInStandaloneMode)

    // Check for existing prompt
    if (window.deferredPWAPrompt) {
      setDeferredPrompt(window.deferredPWAPrompt)
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      window.deferredPWAPrompt = promptEvent
      setDeferredPrompt(promptEvent)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      window.deferredPWAPrompt = null
    }

    // Listen for custom event from ServiceWorkerRegistration
    const handlePWAAvailable = () => {
      if (window.deferredPWAPrompt) {
        setDeferredPrompt(window.deferredPWAPrompt)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)
    window.addEventListener("pwa-install-available", handlePWAAvailable)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      window.removeEventListener("pwa-install-available", handlePWAAvailable)
    }
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (typeof window === "undefined") return

    // iOS: Show modal with instructions
    if (isIOS) {
      setShowModal(true)
      return
    }

    // Android/Desktop: Trigger native prompt if available
    const prompt = deferredPrompt || window.deferredPWAPrompt
    if (prompt) {
      setIsInstalling(true)
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === "accepted") {
          setDeferredPrompt(null)
          window.deferredPWAPrompt = null
        }
      } catch (error) {
        console.error("[PWA] Install error:", error)
      } finally {
        setIsInstalling(false)
      }
    } else {
      // Kein Prompt verfuegbar - Modal mit Anleitung zeigen
      setShowModal(true)
    }
  }, [deferredPrompt, isIOS])

  // Icons
  const DownloadIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )

  const SpinnerIcon = () => (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

  const ShareIcon = () => (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )

  const CloseIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  )

  const ChromeIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  // Install Modal
  const InstallModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => setShowModal(false)}
    >
      <div
        className="w-full max-w-md bg-primary text-primary-foreground rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">MyDispatch installieren</h3>
          <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <CloseIcon />
          </button>
        </div>

        {isIOS ? (
          // iOS Anleitung
          <div className="space-y-4">
            <p className="text-sm opacity-90">Installieren Sie MyDispatch auf Ihrem iPhone/iPad:</p>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Tippen Sie auf das Teilen-Symbol</p>
                <div className="mt-1 flex items-center gap-2 text-sm opacity-80">
                  <ShareIcon />
                  <span>(unten in der Mitte)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="font-medium">Scrollen Sie und tippen Sie auf "Zum Home-Bildschirm"</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="font-medium">Tippen Sie auf "Hinzufuegen"</p>
            </div>
          </div>
        ) : (
          // Desktop/Android Anleitung
          <div className="space-y-4">
            <p className="text-sm opacity-90">So installieren Sie MyDispatch:</p>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ChromeIcon />
              </div>
              <div>
                <p className="font-medium">Chrome / Edge</p>
                <p className="text-sm opacity-80 mt-1">
                  Klicken Sie auf das Installations-Symbol in der Adressleiste (rechts neben der URL) oder oeffnen Sie
                  das Menue (3 Punkte) und waehlen Sie "App installieren"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                <DownloadIcon />
              </div>
              <div>
                <p className="font-medium">Android</p>
                <p className="text-sm opacity-80 mt-1">
                  Tippen Sie auf das Menue (3 Punkte) und waehlen Sie "App installieren" oder "Zum Startbildschirm
                  hinzufuegen"
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/10 rounded-lg text-sm">
              <p className="font-medium">Hinweis</p>
              <p className="opacity-80 mt-1">
                Die Installation ist nur auf der Live-Website moeglich (my-dispatch.de). In der Vorschau-Umgebung ist
                diese Funktion nicht verfuegbar.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowModal(false)}
          className="w-full mt-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-white/90 transition-colors"
        >
          Verstanden
        </button>
      </div>
    </div>
  )

  // SSR: Render button placeholder
  if (!isMounted) {
    return (
      <button type="button" className={className} disabled>
        {children || "App installieren"}
        {showIcon && <DownloadIcon />}
      </button>
    )
  }

  // Already installed: Hide button
  if (isInstalled) {
    return null
  }

  // Install Button anzeigen
  return (
    <>
      <button type="button" onClick={handleInstallClick} disabled={isInstalling} className={className}>
        {isInstalling ? (
          <>
            <SpinnerIcon />
            Installiere...
          </>
        ) : (
          <>
            {children || "App installieren"}
            {showIcon && <DownloadIcon />}
          </>
        )}
      </button>

      {showModal && <InstallModal />}
    </>
  )
}
