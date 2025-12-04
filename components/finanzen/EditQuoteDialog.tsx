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

interface Quote {
  id: string
  company_id: string
  customer_id: string
  quote_number: string
  pickup_address?: string
  dropoff_address?: string
  pickup_date?: string
  valid_until?: string
  amount?: number
  tax_amount?: number
  total_amount?: number
  status: string
  notes?: string
  payment_method?: string
  vehicle_category?: string
  passengers?: number
  customer?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
}

interface EditQuoteDialogProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updated: Quote) => void
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf" },
  { value: "pending", label: "Ausstehend" },
  { value: "sent", label: "Versendet" },
  { value: "accepted", label: "Angenommen" },
  { value: "rejected", label: "Abgelehnt" },
  { value: "expired", label: "Abgelaufen" },
]

const TAX_RATE_OPTIONS = [
  { value: "0", label: "0%" },
  { value: "7", label: "7%" },
  { value: "19", label: "19%" },
]

export function EditQuoteDialog({ quote, open, onOpenChange, onSuccess }: EditQuoteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(quote.status)
  const [validUntil, setValidUntil] = useState(quote.valid_until ? format(new Date(quote.valid_until), "yyyy-MM-dd") : "")
  const [pickupAddress, setPickupAddress] = useState(quote.pickup_address || "")
  const [dropoffAddress, setDropoffAddress] = useState(quote.dropoff_address || "")
  const [pickupDate, setPickupDate] = useState(quote.pickup_date ? format(new Date(quote.pickup_date), "yyyy-MM-dd") : "")
  const [netAmount, setNetAmount] = useState(quote.amount || 0)
  const [taxRate, setTaxRate] = useState(
    quote.tax_amount && quote.amount ? Math.round((quote.tax_amount / quote.amount) * 100).toString() : "7"
  )
  const [notes, setNotes] = useState(quote.notes || "")
  const [vehicleCategory, setVehicleCategory] = useState(quote.vehicle_category || "")
  const [passengers, setPassengers] = useState(quote.passengers?.toString() || "1")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setStatus(quote.status)
    setValidUntil(quote.valid_until ? format(new Date(quote.valid_until), "yyyy-MM-dd") : "")
    setPickupAddress(quote.pickup_address || "")
    setDropoffAddress(quote.dropoff_address || "")
    setPickupDate(quote.pickup_date ? format(new Date(quote.pickup_date), "yyyy-MM-dd") : "")
    setNetAmount(quote.amount || 0)
    setTaxRate(
      quote.tax_amount && quote.amount ? Math.round((quote.tax_amount / quote.amount) * 100).toString() : "7"
    )
    setNotes(quote.notes || "")
    setVehicleCategory(quote.vehicle_category || "")
    setPassengers(quote.passengers?.toString() || "1")
  }, [quote])

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
        valid_until: validUntil || null,
        pickup_address: pickupAddress || null,
        dropoff_address: dropoffAddress || null,
        pickup_date: pickupDate || null,
        amount: netAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: notes || null,
        vehicle_category: vehicleCategory || null,
        passengers: passengers ? Number.parseInt(passengers) : null,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      }

      const { data, error } = await supabase
        .from("quotes")
        .update(updateData)
        .eq("id", quote.id)
        .select(`
          *,
          customer:customers(id, first_name, last_name, email)
        `)
        .single()

      if (error) throw error

      toast.success("Angebot erfolgreich aktualisiert")
      onOpenChange(false)
      router.refresh()

      if (onSuccess && data) {
        onSuccess(data as Quote)
      }
    } catch (error) {
      console.error("Error updating quote:", error)
      toast.error("Fehler beim Aktualisieren des Angebots")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Angebot bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie das Angebot {quote.quote_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kunde (nur Anzeige) */}
          {quote.customer && (
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">Kunde</Label>
              <p className="font-medium">
                {quote.customer.first_name} {quote.customer.last_name}
              </p>
              {quote.customer.email && (
                <p className="text-sm text-muted-foreground">{quote.customer.email}</p>
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

          {/* Gültigkeit und Fahrtermin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="validUntil">Gültig bis</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pickupDate">Fahrtdatum</Label>
              <Input
                id="pickupDate"
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
          </div>

          {/* Adressen */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pickupAddress">Abholadresse</Label>
              <Input
                id="pickupAddress"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Von..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dropoffAddress">Zieladresse</Label>
              <Input
                id="dropoffAddress"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Nach..."
              />
            </div>
          </div>

          {/* Fahrzeug und Passagiere */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicleCategory">Fahrzeugkategorie</Label>
              <Select value={vehicleCategory} onValueChange={setVehicleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first_class">First Class</SelectItem>
                  <SelectItem value="van">Van / Kleinbus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="passengers">Passagiere</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              />
            </div>
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

