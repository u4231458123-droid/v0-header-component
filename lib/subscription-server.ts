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

const MASTER_ACCOUNT_EMAILS = ["courbois1981@gmail.com", "info@my-dispatch.de"]

export async function checkSubscriptionAccess(): Promise<{
  hasAccess: boolean
  isMasterAdmin: boolean
  status?: SubscriptionStatus
  tier?: SubscriptionTier
  features?: TierFeatures
  limits?: SubscriptionLimits
  message?: string
}> {
  const supabase = await createClient()

  if (!supabase) {
    return { hasAccess: false, isMasterAdmin: false, message: "Database not available" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { hasAccess: false, isMasterAdmin: false, message: "Not authenticated" }
  }

  // Case-insensitive E-Mail-Prüfung für Master-Accounts
  const userEmailNormalized = user.email?.toLowerCase().trim()
  if (userEmailNormalized && MASTER_ACCOUNT_EMAILS.some((email) => email.toLowerCase().trim() === userEmailNormalized)) {
    return {
      hasAccess: true,
      isMasterAdmin: true,
      tier: "enterprise",
      features: TIER_FEATURES.enterprise,
      limits: TIER_LIMITS.enterprise,
    }
  }

  const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", user.id).single()

  if (profile?.role === "master_admin" || profile?.role === "master") {
    return {
      hasAccess: true,
      isMasterAdmin: true,
      tier: "enterprise",
      features: TIER_FEATURES.enterprise,
      limits: TIER_LIMITS.enterprise,
    }
  }

  // Check subscription status
  if (!profile?.company_id) {
    return { hasAccess: false, isMasterAdmin: false, message: "No company assigned" }
  }

  const { data: company } = await supabase
    .from("companies")
    .select("subscription_status, subscription_tier")
    .eq("id", profile.company_id)
    .single()

  if (!company) {
    return { hasAccess: false, isMasterAdmin: false, message: "Company not found" }
  }

  const tier = (company.subscription_tier as SubscriptionTier) || "starter"
  const hasAccess = ["active", "trialing"].includes(company.subscription_status)

  return {
    hasAccess,
    isMasterAdmin: false,
    status: company.subscription_status as SubscriptionStatus,
    tier,
    features: TIER_FEATURES[tier],
    limits: TIER_LIMITS[tier],
    message: hasAccess ? undefined : "Subscription inactive",
  }
}

export async function checkFeatureAccess(feature: keyof TierFeatures): Promise<boolean> {
  const access = await checkSubscriptionAccess()

  if (access.isMasterAdmin) return true
  if (!access.hasAccess || !access.features) return false

  return access.features[feature]
}

export async function checkResourceLimit(
  resourceType: "drivers" | "vehicles" | "bookings",
  currentCount: number,
): Promise<{ allowed: boolean; limit: number; message?: string }> {
  const access = await checkSubscriptionAccess()

  if (access.isMasterAdmin) {
    return { allowed: true, limit: -1 }
  }

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
