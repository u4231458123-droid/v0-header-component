"use client"

import { useAuth } from "./use-auth"
import { getDemoAccountDetails } from "@/lib/demo-accounts"

const DEMO_ACCOUNT_EMAILS = ["demo.starter@my-dispatch.de", "demo.business@my-dispatch.de"]

export function useAccountType() {
  const { user, profile, company } = useAuth()

  // Master-Admin wird über Role-Check ermittelt
  const isMasterAccount = profile?.role === "master_admin" || profile?.role === "master"

  const isDemoUser = user?.email ? DEMO_ACCOUNT_EMAILS.includes(user.email) : false
  const demoDetails = user?.email ? getDemoAccountDetails(user.email) : null

  const accountType = isMasterAccount
    ? "master"
    : isDemoUser
      ? "demo"
      : company?.subscription_plan === "enterprise"
        ? "test"
        : "standard"

  return {
    accountType,
    isMasterAccount,
    isDemoAccount: isDemoUser,
    demoTier: demoDetails?.tier || null,
    demoDetails,
  }
}
