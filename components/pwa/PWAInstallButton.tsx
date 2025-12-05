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
}: PWAInstallButtonProps) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
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
      setPrompt(window.deferredPWAPrompt)
    }

    // Listen for beforeinstallprompt - WICHTIG: preventDefault() verhindert automatischen Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] beforeinstallprompt event received!")
      e.preventDefault() // Verhindert automatischen Browser-Prompt
      const promptEvent = e as BeforeInstallPromptEvent
      window.deferredPWAPrompt = promptEvent
      setPrompt(promptEvent)
      console.log("[PWA] Prompt stored and ready to use")
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log("[PWA] App installed")
      setIsInstalled(true)
      setPrompt(null)
      window.deferredPWAPrompt = null
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = useCallback(async () => {
    console.log("[PWA] Button clicked")
    
    if (typeof window === "undefined") return

    // iOS: Show modal with instructions
    if (isIOS) {
      console.log("[PWA] iOS detected - showing modal")
      setShowModal(true)
      return
    }

    // Get prompt - prüfe zuerst window, dann state
    const currentPrompt = window.deferredPWAPrompt || prompt
    
    console.log("[PWA] Current prompt:", currentPrompt)
    console.log("[PWA] window.deferredPWAPrompt:", window.deferredPWAPrompt)
    console.log("[PWA] state prompt:", prompt)

    // If prompt available, trigger it immediately
    if (currentPrompt) {
      console.log("[PWA] Triggering prompt...")
      setIsInstalling(true)
      try {
        // WICHTIG: prompt() muss aufgerufen werden, um den Browser-Dialog zu öffnen
        await currentPrompt.prompt()
        console.log("[PWA] Prompt shown, waiting for user choice...")
        
        const { outcome } = await currentPrompt.userChoice
        console.log("[PWA] User choice:", outcome)
        
        if (outcome === "accepted") {
          console.log("[PWA] Installation accepted")
          setPrompt(null)
          window.deferredPWAPrompt = null
          setIsInstalled(true)
        } else {
          console.log("[PWA] Installation dismissed")
        }
      } catch (error) {
        console.error("[PWA] Error triggering prompt:", error)
        // Prompt might be invalid - clear it
        setPrompt(null)
        window.deferredPWAPrompt = null
        setShowModal(true)
      } finally {
        setIsInstalling(false)
      }
      return
    }

    // No prompt available - show modal
    console.warn("[PWA] No prompt available - showing modal")
    console.warn("[PWA] Possible reasons:")
    console.warn("[PWA] 1. PWA already installed")
    console.warn("[PWA] 2. Browser doesn't support PWA")
    console.warn("[PWA] 3. beforeinstallprompt event not fired (needs HTTPS + valid manifest + service worker)")
    console.warn("[PWA] 4. Running in preview/development environment")
    setShowModal(true)
  }, [prompt, isIOS])

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

  // Install Modal
  const InstallModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">App installieren</h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 rounded-xl hover:bg-muted transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <p className="font-medium mb-2">Für iOS (iPhone/iPad):</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Tippen Sie auf das Teilen-Symbol</li>
                <li>Wählen Sie "Zum Home-Bildschirm"</li>
                <li>Bestätigen Sie die Installation</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <p className="font-medium mb-2">Für Android/Desktop:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Tippen Sie auf das Menü (3 Punkte)</li>
                <li>Wählen Sie "App installieren" oder "Zum Startbildschirm hinzufügen"</li>
                <li>Bestätigen Sie die Installation</li>
              </ol>
            </div>
            <div className="p-3 bg-warning/10 border border-warning rounded-xl text-sm">
              <p className="font-medium text-amber-900">Hinweis</p>
              <p className="text-amber-800 mt-1">
                Die Installation ist nur auf der Live-Website (my-dispatch.de) möglich. In der Vorschau-Umgebung ist diese Funktion nicht verfügbar.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowModal(false)}
          className="w-full mt-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
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

  // WICHTIG: Button wird IMMER angezeigt, auch wenn bereits installiert
  // Der Benutzer kann die App jederzeit neu installieren oder die Anleitung sehen

  // Render button - IMMER anzeigen
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={className}
        title={isInstalled ? "App bereits installiert - Anleitung anzeigen" : "App installieren"}
      >
        {isInstalling ? (
          <>
            <SpinnerIcon />
            Installiere...
          </>
        ) : (
          <>
            {children || (isInstalled ? "Installationsanleitung" : "App installieren")}
            {showIcon && <DownloadIcon />}
          </>
        )}
      </button>

      {showModal && <InstallModal />}
    </>
  )
}
