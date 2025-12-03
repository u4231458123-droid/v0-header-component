// Stripe Configuration for MyDispatch
// ====================================
//
// Zahlungsloesung: Stripe Checkout + Stripe Kundenportal
// - Checkout: Klassische Online-Zahlung direkt auf Stripe
// - Kundenportal: Verwaltung von Abonnements, Zahlungsmethoden, Rechnungen
//
// STRIPE WEBHOOK
// --------------
// Endpoint-URL: https://v0-header-component-pink.vercel.app/api/webhooks/stripe
// Webhook Secret: Set via STRIPE_WEBHOOK_SECRET environment variable
//
// Benoetigte Events:
// - checkout.session.completed
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
//
// STRIPE KUNDENPORTAL
// -------------------
// Billing Portal Configuration ID: bpc_1RxQ0jLX5M8TT990YlRPctFy
// URL: Dynamisch generiert via createBillingPortalSession()
//
// Funktionen im Kundenportal:
// - Abonnement verwalten (Upgrade/Downgrade)
// - Zahlungsmethode aendern
// - Rechnungshistorie einsehen
// - Rechnungsadresse aktualisieren
// - Abonnement kuendigen

import Stripe from "stripe"
import { STRIPE_PRODUCTS } from "@/lib/stripe-products"

// Stripe Client initialisieren - lazy initialization um Build-Fehler zu vermeiden
let stripeInstance: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set")
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-11-17.clover",
    })
  }
  return stripeInstance
}

// Deprecated: Direkter Export für Kompatibilität (wird durch getStripeClient() ersetzt)
export const stripe = {
  get billingPortal() { return getStripeClient().billingPortal },
  get checkout() { return getStripeClient().checkout },
  get subscriptions() { return getStripeClient().subscriptions },
  get customers() { return getStripeClient().customers },
  get webhooks() { return getStripeClient().webhooks },
} as unknown as Stripe

export const STRIPE_CONFIG = {
  // Webhook Secret - MUST be set via environment variable
  // Keine Warnung beim Build - nur zur Laufzeit prüfen
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Billing Portal Configuration ID
  billingPortalConfigId: "bpc_1RxQ0jLX5M8TT990YlRPctFy",

  prices: {
    starter: {
      monthly: STRIPE_PRODUCTS.starter.monthlyPriceId,
      yearly: STRIPE_PRODUCTS.starter.yearlyPriceId,
    },
    business: {
      monthly: STRIPE_PRODUCTS.business.monthlyPriceId,
      yearly: STRIPE_PRODUCTS.business.yearlyPriceId,
    },
    addon: STRIPE_PRODUCTS.addon.priceId,
  },

  // Tarif-Limits
  limits: {
    starter: { drivers: 3, vehicles: 3 },
    business: { drivers: -1, vehicles: -1 }, // -1 = unbegrenzt
    enterprise: { drivers: -1, vehicles: -1 },
  },

  // Helper: Price ID zu Tarif-Name
  getPlanFromPriceId: (priceId: string): "starter" | "business" | "enterprise" | null => {
    const starterPrices = [
      STRIPE_CONFIG.prices.starter.monthly,
      STRIPE_CONFIG.prices.starter.yearly,
      "price_1SX5eQIbAq3GlqKy7oUJ0dic", // Basic legacy
    ]
    const businessPrices = [
      STRIPE_CONFIG.prices.business.monthly,
      STRIPE_CONFIG.prices.business.yearly,
      "price_1SX5eQIbAq3GlqKyMtpF1e04", // Professional legacy
    ]

    if (starterPrices.includes(priceId)) return "starter"
    if (businessPrices.includes(priceId)) return "business"
    return null
  },
}

// Stripe Billing Portal Session erstellen
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    configuration: STRIPE_CONFIG.billingPortalConfigId,
  })
}

// Stripe Checkout Session erstellen
export async function createCheckoutSession(
  priceId: string,
  customerId: string | undefined,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "sepa_debit"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    customer_update: { name: "auto" },
  })
}
