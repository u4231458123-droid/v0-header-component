import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { STRIPE_CONFIG } from "@/lib/stripe-config"

// Lazy initialization to avoid build-time errors
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(secretKey, { apiVersion: "2025-11-17.acacia" })
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase environment variables not set")
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(req: Request) {
  const stripe = getStripeClient()
  const supabase = getSupabaseClient()

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const isNewRegistration = session.metadata?.registration_email

        if (isNewRegistration && session.mode === "subscription" && session.subscription) {
          const email = session.metadata!.registration_email!
          const password = session.metadata!.registration_password!
          const firstName = session.metadata!.registration_first_name!
          const lastName = session.metadata!.registration_last_name!
          const companyName = session.metadata!.registration_company_name!
          const address = session.metadata!.registration_address!
          const zip = session.metadata!.registration_zip!
          const city = session.metadata!.registration_city!
          const country = session.metadata!.registration_country!
          const salutation = session.metadata!.registration_salutation!
          const title = session.metadata!.registration_title || ""
          const vatId = session.metadata!.registration_vat_id || ""
          const plan = session.metadata!.registration_plan as "starter" | "business"

          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0]?.price.id
          const tier = STRIPE_CONFIG.getPlanFromPriceId(priceId || "") || plan
          const limits = STRIPE_CONFIG.limits[tier as keyof typeof STRIPE_CONFIG.limits]

          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm since they paid
            user_metadata: {
              full_name: `${firstName} ${lastName}`,
              salutation: salutation,
              title: title,
            },
          })

          if (authError || !authData.user) {
            console.error("[Webhook] Failed to create user:", authError?.message)
            // User might already exist - try to find them
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const existingUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

            if (!existingUser) {
              return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
            }

            // Update existing user's company with Stripe data
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("company_id")
              .eq("id", existingUser.id)
              .single()

            if (existingProfile?.company_id) {
              await supabase
                .from("companies")
                .update({
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: subscription.id,
                  subscription_status: "active",
                  subscription_tier: tier,
                  driver_limit: limits.drivers,
                  vehicle_limit: limits.vehicles,
                })
                .eq("id", existingProfile.company_id)
            }
            break
          }

          const { data: company, error: companyError } = await supabase
            .from("companies")
            .insert({
              name: companyName,
              email: email,
              phone: "",
              address: `${address}, ${zip} ${city}, ${country}`,
              vat_id: vatId || null,
              subscription_tier: tier,
              subscription_status: "active",
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              driver_limit: limits.drivers,
              vehicle_limit: limits.vehicles,
              widget_enabled: tier !== "starter",
              landingpage_enabled: true,
            })
            .select()
            .single()

          if (companyError || !company) {
            console.error("[Webhook] Failed to create company:", companyError?.message)
            // Cleanup user
            await supabase.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
          }

          const { error: profileError } = await supabase.from("profiles").upsert({
            id: authData.user.id,
            email: email,
            company_id: company.id,
            full_name: `${title ? title + " " : ""}${firstName} ${lastName}`,
            role: "admin",
          })

          if (profileError) {
            console.error("[Webhook] Failed to create profile:", profileError.message)
          }

          await supabase.from("user_companies").insert({
            user_id: authData.user.id,
            company_id: company.id,
            role: "owner",
          })

          console.log("[Webhook] Successfully created user and company after payment:", {
            userId: authData.user.id,
            companyId: company.id,
            tier: tier,
          })
        } else if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0]?.price.id
          const tier = STRIPE_CONFIG.getPlanFromPriceId(priceId || "") || "starter"
          const limits = STRIPE_CONFIG.limits[tier as keyof typeof STRIPE_CONFIG.limits]

          await supabase
            .from("companies")
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: "active",
              subscription_tier: tier,
              driver_limit: limits.drivers,
              vehicle_limit: limits.vehicles,
              widget_enabled: tier !== "starter",
              landingpage_enabled: true,
            })
            .eq("stripe_customer_id", session.customer)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          incomplete: "incomplete",
          incomplete_expired: "inactive",
          trialing: "trialing",
          unpaid: "past_due",
          paused: "inactive",
        }

        const priceId = subscription.items.data[0]?.price.id
        const tier = STRIPE_CONFIG.getPlanFromPriceId(priceId || "") || "starter"
        const limits = STRIPE_CONFIG.limits[tier as keyof typeof STRIPE_CONFIG.limits]

        await supabase
          .from("companies")
          .update({
            subscription_status: statusMap[subscription.status] || "inactive",
            subscription_tier: tier,
            driver_limit: limits.drivers,
            vehicle_limit: limits.vehicles,
            widget_enabled: tier !== "starter",
          })
          .eq("stripe_subscription_id", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("companies")
          .update({
            subscription_status: "canceled",
            subscription_tier: "free",
            driver_limit: 1,
            vehicle_limit: 1,
            widget_enabled: false,
            landingpage_enabled: false,
          })
          .eq("stripe_subscription_id", subscription.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null }
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : typeof invoice.subscription === "object" && invoice.subscription !== null
              ? invoice.subscription.id
              : null

        if (subscriptionId) {
          await supabase
            .from("companies")
            .update({
              subscription_status: "active",
            })
            .eq("stripe_subscription_id", subscriptionId)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null }
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : typeof invoice.subscription === "object" && invoice.subscription !== null
              ? invoice.subscription.id
              : null

        if (subscriptionId) {
          await supabase
            .from("companies")
            .update({
              subscription_status: "past_due",
            })
            .eq("stripe_subscription_id", subscriptionId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
