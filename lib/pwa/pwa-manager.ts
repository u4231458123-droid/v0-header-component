/**
 * Zentrale PWA-Manager für Install-Prompt-Verwaltung
 * Verwaltet den beforeinstallprompt Event zentral und stellt ihn allen Komponenten zur Verfügung
 */

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
    pwaManager?: PWAManager
  }
}

class PWAManager {
  private prompt: BeforeInstallPromptEvent | null = null
  private listeners: Set<(prompt: BeforeInstallPromptEvent | null) => void> = new Set()

  constructor() {
    if (typeof window === "undefined") return

    // Initialize
    window.deferredPWAPrompt = null

    // Listen for beforeinstallprompt
    window.addEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt.bind(this))
    
    // Listen for app installed
    window.addEventListener("appinstalled", this.handleAppInstalled.bind(this))
  }

  private handleBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    const promptEvent = e as BeforeInstallPromptEvent
    this.prompt = promptEvent
    window.deferredPWAPrompt = promptEvent
    this.notifyListeners()
  }

  private handleAppInstalled() {
    this.prompt = null
    window.deferredPWAPrompt = null
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.prompt))
  }

  getPrompt(): BeforeInstallPromptEvent | null {
    return this.prompt || window.deferredPWAPrompt
  }

  async triggerPrompt(): Promise<{ outcome: "accepted" | "dismissed" } | null> {
    const prompt = this.getPrompt()
    if (!prompt) return null

    try {
      await prompt.prompt()
      const result = await prompt.userChoice
      
      if (result.outcome === "accepted") {
        this.prompt = null
        window.deferredPWAPrompt = null
        this.notifyListeners()
      }
      
      return { outcome: result.outcome }
    } catch (error) {
      console.error("[PWA Manager] Error triggering prompt:", error)
      // Prompt might be invalid, clear it
      this.prompt = null
      window.deferredPWAPrompt = null
      this.notifyListeners()
      return null
    }
  }

  subscribe(listener: (prompt: BeforeInstallPromptEvent | null) => void) {
    this.listeners.add(listener)
    // Immediately notify with current state
    listener(this.prompt)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  isInstalled(): boolean {
    if (typeof window === "undefined") return false
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    )
  }

  isIOS(): boolean {
    if (typeof window === "undefined") return false
    const userAgent = navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
  }
}

// Singleton instance
let pwaManagerInstance: PWAManager | null = null

export function getPWAManager(): PWAManager {
  if (typeof window === "undefined") {
    // Return a dummy manager for SSR
    return {
      getPrompt: () => null,
      triggerPrompt: async () => null,
      subscribe: () => () => {},
      isInstalled: () => false,
      isIOS: () => false,
    } as unknown as PWAManager
  }

  if (!pwaManagerInstance) {
    pwaManagerInstance = new PWAManager()
    window.pwaManager = pwaManagerInstance
  }

  return pwaManagerInstance
}

