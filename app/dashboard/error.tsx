"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to monitoring service
    console.error("[DashboardError]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Dashboard-Fehler
          </h2>
          <p className="text-muted-foreground">
            Beim Laden des Dashboards ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded-lg inline-block">
            Fehler-ID: {error.digest}
          </p>
        )}

        {error.message && (
          <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              reset()
              router.refresh()
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zum Login
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <Home className="w-3 h-3" />
            Zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

