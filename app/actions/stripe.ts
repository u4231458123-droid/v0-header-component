"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function createInvoiceCheckoutSession(invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customer:customers(*), booking:bookings(*)")
    .eq("id", invoiceId)
    .single()

  if (!invoice) {
    throw new Error(`Invoice with id "${invoiceId}" not found`)
  }

  if (invoice.payment_status === "paid") {
    throw new Error("Invoice is already paid")
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Rechnung ${invoice.invoice_number}`,
            description: `Fahrt von ${invoice.booking?.pickup_address} nach ${invoice.booking?.dropoff_address}`,
          },
          unit_amount: Math.round(invoice.total_amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      invoice_id: invoiceId,
    },
  })

  return session.client_secret
}

export async function handlePaymentSuccess(invoiceId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("invoices")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)

  if (error) {
    console.error("[v0] Error updating invoice:", error)
    throw error
  }

  // Also update the booking payment status
  const { data: invoice } = await supabase.from("invoices").select("booking_id").eq("id", invoiceId).single()

  if (invoice?.booking_id) {
    await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", invoice.booking_id)
  }
}
