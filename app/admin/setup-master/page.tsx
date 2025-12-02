"use client"

import { useState } from "react"
import { V28Button } from "@/components/design-system/V28Button"
import { V28MarketingCard } from "@/components/design-system/V28MarketingCard"
import { createMasterAdmin } from "@/app/actions/create-master-admin"

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

export default function SetupMasterPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSetup() {
    setLoading(true)
    setResult(null)

    try {
      const response = await createMasterAdmin()
      setResult(response as { success: boolean; message: string })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <V28MarketingCard className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Master Admin Setup</h1>
          <p className="text-muted-foreground">Erstelle den permanenten Master-Admin-Account für MyDispatch</p>
        </div>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-xl text-sm">
            <p className="font-semibold text-foreground mb-2">Account Details:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Email: courbois1981@gmail.com</li>
              <li>Passwort: 1def!xO2022!!</li>
              <li>Rolle: master_admin</li>
              <li>Zugriff: Vollzugriff ohne Abo-Beschränkungen</li>
            </ul>
          </div>

          <V28Button onClick={handleSetup} disabled={loading} size="lg" className="w-full">
            {loading ? "Erstelle Account..." : "Master Admin erstellen"}
          </V28Button>

          {result && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 ${
                result.success
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              {result.success ? (
                <CheckIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <AlertCircleIcon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${result.success ? "text-foreground" : "text-destructive"}`}>{result.message}</p>
            </div>
          )}
        </div>
      </V28MarketingCard>
    </div>
  )
}
