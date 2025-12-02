"use server"

import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { STRIPE_PRODUCTS } from "@/lib/stripe-products"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.acacia",
})

// Admin client nur fuer Webhook verwenden
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface SignUpData {
  email: string
  password: string
  salutation: string
  title: string
  firstName: string
  lastName: string
  companyName: string
  address: string
  zip: string
  city: string
  country: string
  vatId: string
  plan: "starter" | "business" | "enterprise"
  billingInterval?: "monthly" | "yearly"
  addOnQuantity?: number
}

export async function createSubscription(data: SignUpData) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://my-dispatch.de"

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some((user) => user.email?.toLowerCase() === data.email.toLowerCase())

    if (emailExists) {
      return {
        success: false,
        error:
          "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail.",
        errorCode: "email_exists",
      }
    }

    if (data.plan === "enterprise") {
      return {
        success: false,
        error: "Bitte kontaktieren Sie uns für Enterprise-Preise",
        redirectToContact: true,
      }
    }

    const stripeCustomer = await stripe.customers.create({
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      address: {
        line1: data.address,
        postal_code: data.zip,
        city: data.city,
        country: data.country === "Deutschland" ? "DE" : data.country,
      },
      metadata: {
        company_name: data.companyName,
        vat_id: data.vatId || "",
      },
    })

    const billingInterval = data.billingInterval || "monthly"
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    if (data.plan === "starter") {
      lineItems.push({
        price:
          billingInterval === "monthly"
            ? STRIPE_PRODUCTS.starter.monthlyPriceId
            : STRIPE_PRODUCTS.starter.yearlyPriceId,
        quantity: 1,
      })

      if (data.addOnQuantity && data.addOnQuantity > 0) {
        lineItems.push({
          price: STRIPE_PRODUCTS.addon.priceId,
          quantity: data.addOnQuantity,
        })
      }
    } else if (data.plan === "business") {
      lineItems.push({
        price:
          billingInterval === "monthly"
            ? STRIPE_PRODUCTS.business.monthlyPriceId
            : STRIPE_PRODUCTS.business.yearlyPriceId,
        quantity: 1,
      })
    }

    // User/Company will be created in webhook AFTER successful payment
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ["card", "sepa_debit"],
      line_items: lineItems,
      mode: "subscription",
      success_url: `${siteUrl}/auth/sign-up-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/auth/sign-up?canceled=true`,
      locale: "de",
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata: {
        registration_email: data.email,
        registration_password: data.password, // Will be used in webhook to create user
        registration_salutation: data.salutation,
        registration_title: data.title || "",
        registration_first_name: data.firstName,
        registration_last_name: data.lastName,
        registration_company_name: data.companyName,
        registration_address: data.address,
        registration_zip: data.zip,
        registration_city: data.city,
        registration_country: data.country,
        registration_vat_id: data.vatId || "",
        registration_plan: data.plan,
      },
      subscription_data: {
        metadata: {
          plan: data.plan,
        },
      },
    })

    return {
      success: true,
      checkoutUrl: session.url,
    }
  } catch (error) {
    console.error("[v0] Subscription creation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten"
    if (errorMessage.includes("email_exists") || errorMessage.includes("already been registered")) {
      return {
        success: false,
        error:
          "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail.",
        errorCode: "email_exists",
      }
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}
