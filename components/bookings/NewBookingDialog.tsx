"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddressAutocomplete, type GeocodingResult } from "@/components/maps/AddressAutocomplete"

const PlusIcon = () => (
  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

interface NewBookingDialogProps {
  companyId: string | null
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  phone: string
}

export function NewBookingDialog({ companyId }: NewBookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lng: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open && companyId) {
      loadCustomers()
    }
  }, [open, companyId])

  async function loadCustomers() {
    const { data } = await supabase
      .from("customers")
      .select("id, first_name, last_name, phone")
      .eq("company_id", companyId)
      .order("last_name")

    if (data) {
      setCustomers(data)
    }
  }

  const handlePickupSelect = (result: GeocodingResult) => {
    setPickupAddress(result.formattedAddress)
    setPickupLocation({ lat: result.lat, lng: result.lng })
  }

  const handleDropoffSelect = (result: GeocodingResult) => {
    setDropoffAddress(result.formattedAddress)
    setDropoffLocation({ lat: result.lat, lng: result.lng })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const bookingData: any = {
        company_id: companyId,
        customer_id: selectedCustomerId,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        pickup_time: formData.get("pickup_time") as string,
        passengers: Number.parseInt(formData.get("passengers") as string),
        notes: formData.get("notes") as string,
        status: "pending",
      }

      if (pickupLocation) {
        bookingData.pickup_location = `POINT(${pickupLocation.lng} ${pickupLocation.lat})`
      }
      if (dropoffLocation) {
        bookingData.dropoff_location = `POINT(${dropoffLocation.lng} ${dropoffLocation.lat})`
      }

      const { error } = await supabase.from("bookings").insert(bookingData)

      if (error) throw error

      toast.success("Auftrag erfolgreich erstellt", {
        description: "Der Auftrag wurde angelegt und kann nun zugewiesen werden.",
        duration: 4000,
      })
      setOpen(false)
      setPickupAddress("")
      setDropoffAddress("")
      setPickupLocation(null)
      setDropoffLocation(null)
      setSelectedCustomerId("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating booking:", error)
      toast.error("Fehler beim Erstellen des Auftrags", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Neuer Auftrag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Auftrag erstellen</DialogTitle>
          <DialogDescription>Erfassen Sie einen neuen Fahrauftrag</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="customer">Kunde</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} ({customer.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Abholadresse</Label>
              <AddressAutocomplete
                value={pickupAddress}
                onChange={setPickupAddress}
                onSelect={handlePickupSelect}
                placeholder="z.B. Hauptstraße 1, 10115 Berlin"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Zieladresse</Label>
              <AddressAutocomplete
                value={dropoffAddress}
                onChange={setDropoffAddress}
                onSelect={handleDropoffSelect}
                placeholder="z.B. Bahnhofstraße 5, 10115 Berlin"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="pickup_time">Abholzeit</Label>
                <Input id="pickup_time" name="pickup_time" type="datetime-local" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passengers">Passagiere</Label>
                <Input id="passengers" name="passengers" type="number" min="1" max="8" defaultValue="1" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Anmerkungen (optional)</Label>
              <Textarea id="notes" name="notes" placeholder="z.B. Kindersitz benötigt, Rollstuhlgerecht..." rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !selectedCustomerId}>
              {loading ? "Wird erstellt..." : "Auftrag erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
