"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { getPWAManager } from "@/lib/pwa/pwa-manager"

interface PWAInstallButtonProps {
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
}

export function PWAInstallButton({
  className = "",
  children,
  showIcon = true,
}: PWAInstallButtonProps) {
  const [hasPrompt, setHasPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window === "undefined") return

    const manager = getPWAManager()
    
    setIsIOS(manager.isIOS())
    setIsInstalled(manager.isInstalled())

    // Subscribe to prompt changes
    const unsubscribe = manager.subscribe((prompt) => {
      setHasPrompt(!!prompt)
    })

    return unsubscribe
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (typeof window === "undefined") return

    const manager = getPWAManager()

    // iOS: Show modal with instructions
    if (manager.isIOS()) {
      setShowModal(true)
      return
    }

    // Check if prompt is available
    const prompt = manager.getPrompt()
    
    if (prompt) {
      setIsInstalling(true)
      try {
        const result = await manager.triggerPrompt()
        if (result?.outcome === "accepted") {
          setIsInstalled(true)
        }
      } catch (error) {
        console.error("[PWA] Install error:", error)
        setShowModal(true)
      } finally {
        setIsInstalling(false)
      }
      return
    }

    // No prompt available - show modal
    setShowModal(true)
  }, [])

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
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">App installieren</h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
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
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Für Android/Desktop:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Tippen Sie auf das Menü (3 Punkte)</li>
                <li>Wählen Sie "App installieren" oder "Zum Startbildschirm hinzufügen"</li>
                <li>Bestätigen Sie die Installation</li>
              </ol>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
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

  // Already installed: Hide button
  if (isInstalled) {
    return null
  }

  // Render button
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={className}
        title={hasPrompt ? "App installieren" : "Installationsanleitung anzeigen"}
      >
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
