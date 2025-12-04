// Client-safe subscription utilities - NO server imports allowed
// This file can be safely imported in client components

export type SubscriptionStatus = "active" | "inactive" | "past_due" | "canceled" | "trialing" | "incomplete"
export type SubscriptionTier = "starter" | "business" | "enterprise"

export interface SubscriptionLimits {
  drivers: number
  vehicles: number
  bookings: number
}

export interface TierFeatures {
  landingpage: boolean
  bookingWidget: boolean
  apiAccess: boolean
  aiCommunication: boolean
  prioritySupport: boolean
  whiteLabel: boolean
  customDomain: boolean
}

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 39,
    yearlyPrice: 31.2,
    description: "Perfekt für Einzelunternehmer",
    drivers: 3,
    vehicles: 3,
  },
  business: {
    name: "Business",
    monthlyPrice: 99,
    yearlyPrice: 79.2,
    description: "Für wachsende Flotten",
    drivers: -1, // unbegrenzt
    vehicles: -1,
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 0, // Auf Anfrage
    yearlyPrice: 0,
    description: "Für große Unternehmen",
    drivers: -1,
    vehicles: -1,
  },
}

export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  starter: {
    drivers: 3,
    vehicles: 3,
    bookings: 100,
  },
  business: {
    drivers: -1, // unbegrenzt
    vehicles: -1,
    bookings: -1,
  },
  enterprise: {
    drivers: -1,
    vehicles: -1,
    bookings: -1,
  },
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  starter: {
    landingpage: true,
    bookingWidget: false, // Only customer registration, no booking
    apiAccess: false,
    aiCommunication: false,
    prioritySupport: false,
    whiteLabel: false,
    customDomain: false,
  },
  business: {
    landingpage: true,
    bookingWidget: true,
    apiAccess: true,
    aiCommunication: true,
    prioritySupport: true,
    whiteLabel: false,
    customDomain: false,
  },
  enterprise: {
    landingpage: true,
    bookingWidget: true,
    apiAccess: true,
    aiCommunication: true,
    prioritySupport: true,
    whiteLabel: true,
    customDomain: true,
  },
}

export function getTierInfo(tier: SubscriptionTier) {
  const info = {
    starter: {
      name: "Starter",
      price: { monthly: 39, yearly: 31.2 },
      description: "Perfekt für Einzelunternehmer",
    },
    business: {
      name: "Business",
      price: { monthly: 99, yearly: 79.2 },
      description: "Für wachsende Flotten",
    },
    enterprise: {
      name: "Enterprise",
      price: { monthly: null, yearly: null },
      description: "Für große Unternehmen",
    },
  }

  return info[tier]
}

// Master-Account-Check wurde entfernt - Master-Admin wird über Role-Check ermittelt
