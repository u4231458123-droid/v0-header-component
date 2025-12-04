// Server-only subscription utilities - requires next/headers
// This file must ONLY be imported in Server Components or Server Actions
"use server"

import { createClient } from "@/lib/supabase/server"
import {
  type SubscriptionStatus,
  type SubscriptionTier,
  type SubscriptionLimits,
  type TierFeatures,
  TIER_LIMITS,
  TIER_FEATURES,
} from "@/lib/subscription"

export async function checkSubscriptionAccess(): Promise<{
  hasAccess: boolean
  status?: SubscriptionStatus
  tier?: SubscriptionTier
  features?: TierFeatures
  limits?: SubscriptionLimits
  message?: string
}> {
  const supabase = await createClient()

  if (!supabase) {
    return { hasAccess: false, message: "Database not available" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { hasAccess: false, message: "Not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", user.id).single()

  // Check subscription status
  if (!profile?.company_id) {
    return { hasAccess: false, message: "No company assigned" }
  }

  const { data: company } = await supabase
    .from("companies")
    .select("subscription_tier, subscription_status, subscription_plan")
    .eq("id", profile.company_id)
    .single()

  if (!company) {
    return { hasAccess: false, message: "Company not found" }
  }

  // Mapping: DB subscription_plan -> Code SubscriptionTier
  // DB: free|basic|professional|enterprise
  // Code: starter|business|enterprise
  const planToTier: Record<string, SubscriptionTier> = {
    free: "starter",
    basic: "starter",
    professional: "business",
    enterprise: "enterprise",
  }

  // Verwende subscription_tier falls vorhanden, sonst mappe subscription_plan
  let tier: SubscriptionTier = "starter"
  if (company.subscription_tier && ["starter", "business", "enterprise"].includes(company.subscription_tier)) {
    tier = company.subscription_tier as SubscriptionTier
  } else if (company.subscription_plan) {
    tier = planToTier[company.subscription_plan] || "starter"
  }

  // Prüfe subscription_status falls vorhanden, sonst angenommen aktiv
  const hasAccess = company.subscription_status
    ? ["active", "trialing"].includes(company.subscription_status)
    : true // Falls kein Status, angenommen aktiv

  return {
    hasAccess,
    status: (company.subscription_status as SubscriptionStatus) || "active",
    tier,
    features: TIER_FEATURES[tier],
    limits: TIER_LIMITS[tier],
    message: hasAccess ? undefined : "Subscription inactive",
  }
}

export async function checkFeatureAccess(feature: keyof TierFeatures): Promise<boolean> {
  const access = await checkSubscriptionAccess()

  if (!access.hasAccess || !access.features) return false

  return access.features[feature]
}

export async function checkResourceLimit(
  resourceType: "drivers" | "vehicles" | "bookings",
  currentCount: number,
): Promise<{ allowed: boolean; limit: number; message?: string }> {
  const access = await checkSubscriptionAccess()

  if (!access.hasAccess || !access.tier) {
    return { allowed: false, limit: 0, message: "No active subscription" }
  }

  const limits = TIER_LIMITS[access.tier]
  const limit = limits[resourceType]

  if (limit === -1) {
    return { allowed: true, limit: -1 }
  }

  return {
    allowed: currentCount < limit,
    limit,
    message: currentCount >= limit ? `Limit erreicht (${limit} ${resourceType})` : undefined,
  }
}