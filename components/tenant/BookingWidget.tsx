"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddressAutocomplete, type GeocodingResult } from "@/components/maps/AddressAutocomplete"

const LoaderIcon = () => (
  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

const MapPinIcon = () => (
  <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const UserIcon = () => (
  <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const MailIcon = () => (
  <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

interface BookingWidgetProps {
  company: {
    id: string
    name: string
  }
  open: boolean
  onClose: () => void
}

export function BookingWidget({ company, open, onClose }: BookingWidgetProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    pickup_address: "",
    dropoff_address: "",
    pickup_time: "",
    notes: "",
  })
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handlePickupSelect = (result: GeocodingResult) => {
    setFormData({ ...formData, pickup_address: result.formattedAddress })
    setPickupLocation({ lat: result.lat, lng: result.lng })
  }

  const handleDropoffSelect = (result: GeocodingResult) => {
    setFormData({ ...formData, dropoff_address: result.formattedAddress })
    setDropoffLocation({ lat: result.lat, lng: result.lng })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()

      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          company_id: company.id,
          first_name: formData.customer_name.split(" ")[0] || formData.customer_name,
          last_name: formData.customer_name.split(" ").slice(1).join(" ") || "",
          phone: formData.customer_phone,
          email: formData.customer_email,
        })
        .select()
        .single()

      if (customerError) throw customerError

      const bookingData: any = {
        company_id: company.id,
        customer_id: customer.id,
        pickup_address: formData.pickup_address,
        dropoff_address: formData.dropoff_address,
        pickup_time: formData.pickup_time,
        notes: formData.notes,
        status: "pending",
        payment_method: "cash",
        payment_status: "unpaid",
      }

      if (pickupLocation) {
        bookingData.pickup_location = `POINT(${pickupLocation.lng} ${pickupLocation.lat})`
      }
      if (dropoffLocation) {
        bookingData.dropoff_location = `POINT(${dropoffLocation.lng} ${dropoffLocation.lat})`
      }

      const { error: bookingError } = await supabase.from("bookings").insert(bookingData)

      if (bookingError) throw bookingError

      toast({
        title: "Buchung erfolgreich",
        description: "Wir haben Ihre Buchungsanfrage erhalten und werden Sie kontaktieren.",
      })

      onClose()
    } catch (error) {
      console.error("[v0] Booking error:", error)
      toast({
        title: "Fehler",
        description: "Die Buchung konnte nicht erstellt werden. Bitte rufen Sie uns an.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Online-Buchung bei {company.name}</DialogTitle>
          <DialogDescription>Füllen Sie das Formular aus und wir melden uns bei Ihnen</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_name">
                <UserIcon />
                Name *
              </Label>
              <Input
                id="customer_name"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">
                <PhoneIcon />
                Telefon *
              </Label>
              <Input
                id="customer_phone"
                type="tel"
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">
              <MailIcon />
              E-Mail
            </Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>
              <MapPinIcon />
              Abholadresse *
            </Label>
            <AddressAutocomplete
              value={formData.pickup_address}
              onChange={(value) => setFormData({ ...formData, pickup_address: value })}
              onSelect={handlePickupSelect}
              placeholder="Straße, PLZ Stadt"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              <MapPinIcon />
              Zieladresse *
            </Label>
            <AddressAutocomplete
              value={formData.dropoff_address}
              onChange={(value) => setFormData({ ...formData, dropoff_address: value })}
              onSelect={handleDropoffSelect}
              placeholder="Straße, PLZ Stadt"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_time">
              <CalendarIcon />
              Abholzeit *
            </Label>
            <Input
              id="pickup_time"
              type="datetime-local"
              required
              value={formData.pickup_time}
              onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Besondere Wünsche oder Anmerkungen..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <LoaderIcon />}
              Buchung anfragen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
