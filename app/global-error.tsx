"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <html lang="de">
      <body className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Ein Fehler ist aufgetreten
            </h1>
            <p className="text-muted-foreground">
              Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
            </p>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded-xl">
              Fehler-ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Erneut versuchen
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <Home className="w-4 h-4" />
              Zur Startseite
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
