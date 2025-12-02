"use client"

import { useEffect } from "react"

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

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Initialize global prompt storage
    if (!window.deferredPWAPrompt) {
      window.deferredPWAPrompt = null
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      window.deferredPWAPrompt = e as BeforeInstallPromptEvent
      console.log("[PWA] Install prompt captured and ready")
      // Notify all components
      window.dispatchEvent(new CustomEvent("pwa-install-available"))
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // In v0 Preview funktioniert SW nicht, aber in Production schon
    if ("serviceWorker" in navigator) {
      // Registrierung SOFORT starten
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[SW] Registered successfully:", registration.scope)

          // Update Handler
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[SW] New version available")
                  window.dispatchEvent(new CustomEvent("pwa-update-available"))
                }
              })
            }
          })
        })
        .catch((error) => {
          // Silent fail in development/preview
          console.log("[SW] Registration skipped:", error.message)
        })
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  return null
}
