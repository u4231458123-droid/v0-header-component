import type { Metadata } from "next"
import Link from "next/link"
import { V28Button } from "@/components/design-system/V28Button"

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

function CreditCardIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

export const metadata: Metadata = {
  title: "Abo erforderlich",
  description: "Ihr Abo ist abgelaufen oder inaktiv",
}

export default function SubscriptionRequiredPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 text-center border border-border">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircleIcon className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Abo erforderlich</h1>

        <p className="text-muted-foreground mb-6">
          Ihr Abonnement ist abgelaufen oder inaktiv. Bitte aktivieren Sie Ihr Abo, um MyDispatch weiterhin nutzen zu
          können.
        </p>

        <div className="space-y-3">
          <Link href="/preise">
            <V28Button size="lg" className="w-full">
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Abo auswählen
            </V28Button>
          </Link>

          <Link href="/">
            <V28Button variant="outline" className="w-full">
              Zur Startseite
            </V28Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Fragen? Kontaktieren Sie unseren Support unter{" "}
          <a href="mailto:support@mydispatch.de" className="text-primary hover:underline">
            support@mydispatch.de
          </a>
        </p>
      </div>
    </div>
  )
}
