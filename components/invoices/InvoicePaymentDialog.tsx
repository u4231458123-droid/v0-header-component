"use client"

import { useCallback, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createInvoiceCheckoutSession, handlePaymentSuccess } from "@/app/actions/stripe"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { safeNumber } from "@/lib/utils/safe-number"

// Inline SVG Icons
function CreditCardIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function CheckCircle2Icon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51SX5cXIbAq3GlqKyK6yxEaCsHqCYzJjGbvAMYL1TqIy8DZMz5zZX8H9V8LwJzCzLqH9NQOmHv8XNKd9V9LzQ00MrJ1ey9r",
)

interface InvoicePaymentDialogProps {
  invoiceId: string
  invoiceNumber: string
  totalAmount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePaymentDialog({
  invoiceId,
  invoiceNumber,
  totalAmount,
  open,
  onOpenChange,
}: InvoicePaymentDialogProps) {
  const [paymentComplete, setPaymentComplete] = useState(false)
  const router = useRouter()

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    try {
      const secret = await createInvoiceCheckoutSession(invoiceId)
      if (!secret) {
        throw new Error("No client secret returned")
      }
      return secret
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast.error("Fehler beim Erstellen der Zahlungssitzung")
      throw error
    }
  }, [invoiceId])

  const handlePaymentCompletion = async () => {
    try {
      await handlePaymentSuccess(invoiceId)
      setPaymentComplete(true)
      toast.success("Zahlung erfolgreich abgeschlossen")

      setTimeout(() => {
        onOpenChange(false)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error handling payment completion:", error)
      toast.error("Fehler beim Verarbeiten der Zahlung")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Rechnung bezahlen
          </DialogTitle>
          <DialogDescription>
            Rechnung {invoiceNumber} - {safeNumber(totalAmount).toFixed(2)} €
          </DialogDescription>
        </DialogHeader>

        {!paymentComplete ? (
          <div className="space-y-4">
            <div id="checkout">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  fetchClientSecret,
                  onComplete: handlePaymentCompletion,
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2Icon className="h-16 w-16 text-green-500" />
            <h3 className="text-2xl font-semibold">Zahlung erfolgreich!</h3>
            <p className="text-muted-foreground">Die Rechnung wurde erfolgreich bezahlt.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
