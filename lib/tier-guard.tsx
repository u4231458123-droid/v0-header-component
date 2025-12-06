"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SubscriptionTier } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

// Inline SVG Icons
function LockIcon({ className }: { className?: string }) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

interface TierGuardProps {
  children: ReactNode
  requiredFeature: "bookingWidget" | "apiAccess" | "aiCommunication" | "whiteLabel" | "customDomain"
  fallback?: ReactNode
}

export function TierGuard({ children, requiredFeature, fallback }: TierGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [tier, setTier] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setHasAccess(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", user.id).single()

    if (!profile?.company_id) {
      setHasAccess(false)
      return
    }

    const { data: company } = await supabase
      .from("companies")
      .select("subscription_tier, subscription_status, subscription_plan")
      .eq("id", profile.company_id)
      .single()

    if (!company || !["active", "trialing"].includes(company.subscription_status || "")) {
      setHasAccess(false)
      return
    }

    // Mapping: DB subscription_plan -> Code SubscriptionTier
    const planToTier: Record<string, SubscriptionTier> = {
      free: "starter",
      basic: "starter",
      professional: "business",
      enterprise: "enterprise",
    }

    let tier: SubscriptionTier = "starter"
    if (company.subscription_tier && ["starter", "business", "enterprise"].includes(company.subscription_tier)) {
      tier = company.subscription_tier as SubscriptionTier
    } else if (company.subscription_plan) {
      tier = planToTier[company.subscription_plan] || "starter"
    }

    setTier(tier)

    const featureAccess: Record<string, Record<string, boolean>> = {
      starter: {
        bookingWidget: false,
        apiAccess: false,
        aiCommunication: false,
        whiteLabel: false,
        customDomain: false,
      },
      business: { bookingWidget: true, apiAccess: true, aiCommunication: true, whiteLabel: false, customDomain: false },
      enterprise: { bookingWidget: true, apiAccess: true, aiCommunication: true, whiteLabel: true, customDomain: true },
    }

    setHasAccess(featureAccess[tier]?.[requiredFeature] ?? false)
  }

  if (hasAccess === null) {
    return <div className="animate-pulse h-32 bg-muted rounded-xl"></div>
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>

    return (
      <Card className="bg-muted border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-xl">
              <LockIcon className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-foreground text-lg">Upgrade erforderlich</CardTitle>
              <CardDescription>
                Diese Funktion ist in Ihrem aktuellen Tarif ({tier || "Starter"}) nicht verfügbar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Upgraden Sie auf Business oder Enterprise, um diese Funktion freizuschalten.
          </p>
          <Button asChild>
            <Link href="/einstellungen/abo">
              Upgrade ansehen
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
