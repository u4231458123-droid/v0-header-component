"use client"

import { useEffect } from "react"
import { getPWAManager } from "@/lib/pwa/pwa-manager"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const manager = getPWAManager()

    // Register service worker
    if ("serviceWorker" in navigator) {
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
  }, [])

  return null
}
