"use client"

import { useAuth } from "./use-auth"
import { getDemoAccountDetails } from "@/lib/demo-accounts"

const DEMO_ACCOUNT_EMAILS = ["demo.starter@my-dispatch.de", "demo.business@my-dispatch.de"]

export function useAccountType() {
  const { user, company } = useAuth()

  const isDemoUser = user?.email ? DEMO_ACCOUNT_EMAILS.includes(user.email) : false
  const demoDetails = user?.email ? getDemoAccountDetails(user.email) : null

  const accountType = isDemoUser
    ? "demo"
    : company?.subscription_plan === "enterprise"
      ? "test"
      : "standard"

  return {
    accountType,
    isDemoAccount: isDemoUser,
    demoTier: demoDetails?.tier || null,
    demoDetails,
  }
}
