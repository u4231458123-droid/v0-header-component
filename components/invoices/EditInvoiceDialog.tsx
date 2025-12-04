"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { safeNumber } from "@/lib/utils/safe-number"

interface Invoice {
  id: string
  company_id: string
  customer_id: string
  booking_id?: string
  invoice_number: string
  issue_date?: string
  due_date: string
  amount: number
  tax_amount: number
  total_amount: number
  status: string
  notes?: string
  payment_method?: string
  customer?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
}

interface EditInvoiceDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updated: Invoice) => void
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf" },
  { value: "pending", label: "Ausstehend" },
  { value: "sent", label: "Versendet" },
  { value: "paid", label: "Bezahlt" },
  { value: "overdue", label: "Überfällig" },
  { value: "cancelled", label: "Storniert" },
]

const TAX_RATE_OPTIONS = [
  { value: "0", label: "0%" },
  { value: "7", label: "7%" },
  { value: "19", label: "19%" },
]

export function EditInvoiceDialog({ invoice, open, onOpenChange, onSuccess }: EditInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(invoice.status)
  const [dueDate, setDueDate] = useState(invoice.due_date ? format(new Date(invoice.due_date), "yyyy-MM-dd") : "")
  const [netAmount, setNetAmount] = useState(invoice.amount)
  const [taxRate, setTaxRate] = useState(invoice.tax_amount > 0 ? Math.round((invoice.tax_amount / invoice.amount) * 100).toString() : "7")
  const [notes, setNotes] = useState(invoice.notes || "")
  const [paymentMethod, setPaymentMethod] = useState(invoice.payment_method || "")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setStatus(invoice.status)
    setDueDate(invoice.due_date ? format(new Date(invoice.due_date), "yyyy-MM-dd") : "")
    setNetAmount(invoice.amount)
    setTaxRate(invoice.tax_amount > 0 ? Math.round((invoice.tax_amount / invoice.amount) * 100).toString() : "7")
    setNotes(invoice.notes || "")
    setPaymentMethod(invoice.payment_method || "")
  }, [invoice])

  const taxAmount = netAmount * (Number.parseFloat(taxRate) / 100)
  const totalAmount = netAmount + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Hole aktuellen User für updated_by
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const updateData = {
        status,
        due_date: dueDate,
        amount: netAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: notes || null,
        payment_method: paymentMethod || null,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      }

      const { data, error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoice.id)
        .select(`
          *,
          customer:customers(id, first_name, last_name, email)
        `)
        .single()

      if (error) throw error

      toast.success("Rechnung erfolgreich aktualisiert")
      onOpenChange(false)
      router.refresh()

      if (onSuccess && data) {
        onSuccess(data as Invoice)
      }
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast.error("Fehler beim Aktualisieren der Rechnung")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rechnung bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Rechnung {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kunde (nur Anzeige) */}
          {invoice.customer && (
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">Kunde</Label>
              <p className="font-medium">
                {invoice.customer.first_name} {invoice.customer.last_name}
              </p>
              {invoice.customer.email && (
                <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fälligkeitsdatum */}
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Beträge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="netAmount">Nettobetrag (€)</Label>
              <Input
                id="netAmount"
                type="number"
                step="0.01"
                min="0"
                value={netAmount}
                onChange={(e) => setNetAmount(Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxRate">Steuersatz</Label>
              <Select value={taxRate} onValueChange={setTaxRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_RATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summen-Anzeige */}
          <div className="rounded-md border p-4 bg-muted">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Nettobetrag:</span>
              <span className="text-sm font-medium">{safeNumber(netAmount).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">MwSt. ({taxRate}%):</span>
              <span className="text-sm font-medium">{safeNumber(taxAmount).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Gesamtbetrag:</span>
              <span className="font-semibold">{safeNumber(totalAmount).toFixed(2)} €</span>
            </div>
          </div>

          {/* Zahlungsmethode */}
          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Zahlungsmethode</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Barzahlung</SelectItem>
                <SelectItem value="card">Kartenzahlung</SelectItem>
                <SelectItem value="transfer">Überweisung</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="invoice">Rechnung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notizen */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

