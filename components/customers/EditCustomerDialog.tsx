"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddressAutocomplete, type GeocodingResult } from "@/components/maps/AddressAutocomplete"

interface Customer {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  notes?: string
  status: string
}

interface EditCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updatedCustomer: Customer) => void
}

export function EditCustomerDialog({ customer, open, onOpenChange, onSuccess }: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(customer.status)
  const [address, setAddress] = useState(customer.address || "")
  const [city, setCity] = useState(customer.city || "")
  const [postalCode, setPostalCode] = useState(customer.postal_code || "")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setStatus(customer.status)
    setAddress(customer.address || "")
    setCity(customer.city || "")
    setPostalCode(customer.postal_code || "")
  }, [customer])

  const handleAddressSelect = (result: GeocodingResult) => {
    setAddress(result.formattedAddress)
    if (result.components?.postalCode) {
      setPostalCode(result.components.postalCode)
    }
    if (result.components?.city) {
      setCity(result.components.city)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: formData.get("first_name") as string,
          last_name: formData.get("last_name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          address: address,
          city: city,
          postal_code: postalCode,
          notes: formData.get("notes") as string,
          status: status,
        })
        .eq("id", customer.id)

      if (error) {
        console.error("[EditCustomerDialog] Update error:", error)
        throw error
      }

      // Lade aktualisierten Kunden
      const { data: updatedCustomer, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customer.id)
        .single()

      if (fetchError) {
        console.error("[EditCustomerDialog] Fetch error:", fetchError)
      }

      toast.success("Kunde erfolgreich aktualisiert", {
        description: "Die Änderungen wurden gespeichert und sind sofort sichtbar.",
        duration: 4000,
      })
      
      // Callback aufrufen wenn vorhanden
      if (onSuccess && updatedCustomer) {
        onSuccess(updatedCustomer)
      }
      
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating customer:", error)
      toast.error("Fehler beim Aktualisieren des Kunden", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Kunde bearbeiten</DialogTitle>
          <DialogDescription>Ändern Sie die Kundendaten</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                  <SelectItem value="blocked">Gesperrt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">Vorname</Label>
                <Input id="first_name" name="first_name" defaultValue={customer.first_name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Nachname</Label>
                <Input id="last_name" name="last_name" defaultValue={customer.last_name} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" defaultValue={customer.email || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={customer.phone} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <AddressAutocomplete
                id="address"
                value={address}
                onChange={setAddress}
                onSelect={handleAddressSelect}
                placeholder="Strasse und Hausnummer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input id="postal_code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Stadt</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea id="notes" name="notes" defaultValue={customer.notes || ""} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
