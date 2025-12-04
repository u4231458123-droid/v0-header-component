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
import { format } from "date-fns"
import { AddressAutocomplete, type GeocodingResult } from "@/components/maps/AddressAutocomplete"
import { VEHICLE_CATEGORIES, PASSENGER_COUNT_OPTIONS, PAYMENT_METHODS } from "@/lib/form-constants"

interface Booking {
  id: string
  company_id: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  status: string
  passengers: number
  notes?: string
  customer_id: string
  driver_id?: string
  vehicle_id?: string
  vehicle_category?: string
  payment_method?: string
  flight_train_number?: string
  flight_train_origin?: string
}

interface EditBookingDialogProps {
  booking: Booking
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updated: Booking) => void
}

export function EditBookingDialog({ booking, open, onOpenChange, onSuccess }: EditBookingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(booking.status)
  const [pickupAddress, setPickupAddress] = useState(booking.pickup_address)
  const [dropoffAddress, setDropoffAddress] = useState(booking.dropoff_address)
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [passengers, setPassengers] = useState(booking.passengers)
  const [vehicleCategory, setVehicleCategory] = useState(booking.vehicle_category || "economy")
  const [paymentMethod, setPaymentMethod] = useState(booking.payment_method || "cash")
  const [flightTrainNumber, setFlightTrainNumber] = useState(booking.flight_train_number || "")
  const [flightTrainOrigin, setFlightTrainOrigin] = useState(booking.flight_train_origin || "")
  const [selectedDriverId, setSelectedDriverId] = useState(booking.driver_id || "")
  const [selectedVehicleId, setSelectedVehicleId] = useState(booking.vehicle_id || "")
  const [drivers, setDrivers] = useState<Array<{ id: string; first_name: string; last_name: string; status?: string }>>([])
  const [vehicles, setVehicles] = useState<Array<{ id: string; license_plate: string; make?: string; model?: string; status?: string }>>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open && booking.company_id) {
      loadDriversAndVehicles()
    }
  }, [open, booking.company_id])

  const loadDriversAndVehicles = async () => {
    if (!booking.company_id) return
    const [driversResult, vehiclesResult] = await Promise.all([
      supabase
        .from("drivers")
        .select("id, first_name, last_name, status")
        .eq("company_id", booking.company_id)
        .order("last_name"),
      supabase
        .from("vehicles")
        .select("id, license_plate, make, model, status")
        .eq("company_id", booking.company_id)
        .order("license_plate"),
    ])
    if (driversResult.data) setDrivers(driversResult.data)
    if (vehiclesResult.data) setVehicles(vehiclesResult.data)
  }

  useEffect(() => {
    setStatus(booking.status)
    setPickupAddress(booking.pickup_address)
    setDropoffAddress(booking.dropoff_address)
    setPassengers(booking.passengers)
    setVehicleCategory(booking.vehicle_category || "economy")
    setPaymentMethod(booking.payment_method || "cash")
    setFlightTrainNumber(booking.flight_train_number || "")
    setFlightTrainOrigin(booking.flight_train_origin || "")
    setSelectedDriverId(booking.driver_id || "")
    setSelectedVehicleId(booking.vehicle_id || "")
  }, [booking])

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
      const updateData: any = {
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        pickup_time: formData.get("pickup_time") as string,
        passengers: passengers,
        notes: formData.get("notes") as string,
        status: status,
        vehicle_category: vehicleCategory,
        payment_method: paymentMethod,
        driver_id: selectedDriverId || null,
        vehicle_id: selectedVehicleId || null,
        flight_train_number: flightTrainNumber || null,
        flight_train_origin: flightTrainOrigin || null,
      }

      if (pickupLocation) {
        updateData.pickup_location = `POINT(${pickupLocation.lng} ${pickupLocation.lat})`
      }
      if (dropoffLocation) {
        updateData.dropoff_location = `POINT(${dropoffLocation.lng} ${dropoffLocation.lat})`
      }

      // Setze updated_by (Bearbeiter)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        updateData.updated_by = user.id
      }

      const { data: updatedBooking, error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", booking.id)
        .select()
        .single()

      if (error) throw error

      toast.success("Auftrag erfolgreich aktualisiert", {
        description: "Die Änderungen wurden gespeichert und sind sofort sichtbar.",
        duration: 4000,
      })
      onSuccess?.(updatedBooking as Booking)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating booking:", error)
      toast.error("Fehler beim Aktualisieren des Auftrags", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auftrag bearbeiten</DialogTitle>
          <DialogDescription>Ändern Sie die Auftragsdaten</DialogDescription>
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
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="confirmed">Bestätigt</SelectItem>
                  <SelectItem value="assigned">Zugewiesen</SelectItem>
                  <SelectItem value="in_progress">Unterwegs</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Abholadresse</Label>
              <AddressAutocomplete
                value={pickupAddress}
                onChange={setPickupAddress}
                onSelect={handlePickupSelect}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Zieladresse</Label>
              <AddressAutocomplete
                value={dropoffAddress}
                onChange={setDropoffAddress}
                onSelect={handleDropoffSelect}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pickup_time">Abholzeit</Label>
                <Input
                  id="pickup_time"
                  name="pickup_time"
                  type="datetime-local"
                  defaultValue={format(new Date(booking.pickup_time), "yyyy-MM-dd'T'HH:mm")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Passagiere</Label>
                <Select value={String(passengers)} onValueChange={(v) => setPassengers(Number.parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PASSENGER_COUNT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fahrzeug-Kategorie</Label>
                <Select value={vehicleCategory} onValueChange={setVehicleCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Zahlungsart</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fahrer- und Fahrzeugauswahl */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fahrer (optional)</Label>
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Fahrer zugewiesen</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                        {driver.status && ` (${driver.status})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fahrzeug (optional)</Label>
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrzeug auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Fahrzeug zugewiesen</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.license_plate}
                        {vehicle.make && vehicle.model ? ` - ${vehicle.make} ${vehicle.model}` : ""}
                        {vehicle.status && ` (${vehicle.status})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3">Abholung von Flughafen / Bahnhof (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Flug- / Zugnummer</Label>
                  <Input
                    value={flightTrainNumber}
                    onChange={(e) => setFlightTrainNumber(e.target.value)}
                    placeholder="z.B. LH1234 oder ICE 123"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Abflugort / Abfahrtsort</Label>
                  <Input
                    value={flightTrainOrigin}
                    onChange={(e) => setFlightTrainOrigin(e.target.value)}
                    placeholder="z.B. Frankfurt oder Berlin Hbf"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Besondere Wünsche / Anmerkungen</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={booking.notes || ""}
                rows={3}
                placeholder="z.B. Kindersitz benötigt, Kostenstelle XY..."
              />
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
