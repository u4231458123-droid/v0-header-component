"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { SALUTATION_OPTIONS, VEHICLE_CATEGORIES, PASSENGER_COUNT_OPTIONS, PAYMENT_METHODS } from "@/lib/form-constants"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const UserPlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
)

const PlaneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
)

const TrainIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <rect width="16" height="16" x="4" y="3" rx="2" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <path d="m8 19-2 3" />
    <path d="m18 22-2-3" />
    <path d="M8 15h.01" />
    <path d="M16 15h.01" />
  </svg>
)

interface Customer {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  customer_number?: string
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  status?: string
}

interface Vehicle {
  id: string
  license_plate: string
  make?: string
  model?: string
  status?: string
}

interface CreateBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
  companyId: string | null
  drivers?: Driver[]
  vehicles?: Vehicle[]
  onSuccess?: (booking: unknown) => void
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  customers = [],
  companyId,
  drivers = [],
  vehicles = [],
  onSuccess,
}: CreateBookingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [vehicleCategories, setVehicleCategories] = useState<Array<{ id: string; name: string; max_passengers: number }>>([])
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [isAirportPickup, setIsAirportPickup] = useState(false)
  const [addressType, setAddressType] = useState<"private" | "business">("private")
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

  const router = useRouter()
  const supabase = createClient()

  // Lade Fahrzeugkategorien aus DB
  useEffect(() => {
    if (open && companyId) {
      supabase
        .from("vehicle_categories")
        .select("id, name, max_passengers")
        .eq("company_id", companyId)
        .order("name")
        .then(({ data }: { data: Array<{ id: string; name: string; max_passengers: number }> | null }) => {
          if (data) setVehicleCategories(data)
        })
    }
  }, [open, companyId, supabase])

  // Gefilterte Kunden basierend auf Suche
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchTerm) ||
      c.customer_number?.toLowerCase().includes(searchLower)
    )
  })

  // Auswahl eines Kunden
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    let customerId = selectedCustomerId

    try {
      // Wenn neuer Kunde, zuerst erstellen
      if (customerMode === "new") {
        const customerData: Record<string, unknown> = {
          company_id: companyId,
          salutation: (formData.get("customer_salutation") as string) || null,
          first_name: (formData.get("customer_first_name") as string)?.trim() || "",
          last_name: ((formData.get("customer_last_name") as string)?.trim() || "").toUpperCase(),
          email: (formData.get("customer_email") as string)?.trim() || null,
          phone: (formData.get("customer_phone") as string)?.trim() || null,
          address: customerAddress?.trim() || null,
          city: (formData.get("customer_city") as string)?.trim() || null,
          postal_code: (formData.get("customer_postal_code") as string)?.trim() || null,
        }

        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert(customerData)
          .select("id")
          .single()

        if (customerError) throw customerError
        customerId = newCustomer.id
      }

      if (!customerId) {
        toast.error("Bitte wählen Sie einen Kunden aus oder erstellen Sie einen neuen", {
          description: "Ein Kunde ist erforderlich, um einen Auftrag zu erstellen.",
          duration: 4000,
        })
        setLoading(false)
        return
      }

      // Datum und Uhrzeit kombinieren
      const pickupDate = formData.get("pickup_date") as string
      const pickupTime = formData.get("pickup_time") as string
      const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`)

      const bookingData: Record<string, unknown> = {
        company_id: companyId,
        customer_id: customerId,
        pickup_time: pickupDateTime.toISOString(),
        pickup_address: pickupAddress?.trim() || "",
        dropoff_address: dropoffAddress?.trim() || "",
        vehicle_category: (formData.get("vehicle_class") as string) || "standard",
        passengers: Number.parseInt(formData.get("passenger_count") as string) || 1,
        passenger_name: (formData.get("passenger_names") as string)?.trim() || null,
        passenger_salutation: (formData.get("passenger_salutation") as string) || null,
        cost_center: (formData.get("cost_center") as string)?.trim() || null,
        notes: (formData.get("special_requests") as string)?.trim() || null,
        payment_method: (formData.get("payment_method") as string) || "bar",
        driver_id: selectedDriverId && selectedDriverId.trim() !== "" ? selectedDriverId : null,
        vehicle_id: selectedVehicleId && selectedVehicleId.trim() !== "" ? selectedVehicleId : null,
        status: "pending",
      }

      // Flughafen/Bahnhof Abholung
      if (isAirportPickup) {
        bookingData.flight_train_number = (formData.get("flight_train_number") as string)?.trim() || null
        bookingData.flight_train_origin = (formData.get("departure_location") as string)?.trim() || null
      }

      // Setze created_by (Bearbeiter)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        bookingData.created_by = user.id
      }

      const { error: bookingError } = await supabase.from("bookings").insert(bookingData)

      if (bookingError) throw bookingError

      toast.success("Auftrag erfolgreich erstellt", {
        description: "Der Auftrag wurde angelegt und kann nun zugewiesen werden.",
        duration: 4000,
      })
      onOpenChange(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || "Fehler beim Erstellen des Auftrags", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCustomerMode("existing")
    setSearchTerm("")
    setSelectedCustomerId("")
    setIsAirportPickup(false)
    setAddressType("private")
    setPickupAddress("")
    setDropoffAddress("")
    setCustomerAddress("")
    setSelectedDriverId("")
    setSelectedVehicleId("")
  }

  // Default-Datum auf heute setzen
  const today = format(new Date(), "yyyy-MM-dd")
  const nowTime = format(new Date(), "HH:mm")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Neuen Auftrag erstellen</DialogTitle>
          <DialogDescription>Erfassen Sie alle Details fuer den neuen Fahrtauftrag</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ABSCHNITT 1: KUNDE */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                1
              </span>
              Kunde
            </h3>

            <Tabs value={customerMode} onValueChange={(v) => setCustomerMode(v as "existing" | "new")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing" className="flex items-center gap-2">
                  <SearchIcon className="h-4 w-4" />
                  Bestehender Kunde
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <UserPlusIcon className="h-4 w-4" />
                  Neuer Kunde
                </TabsTrigger>
              </TabsList>

              {/* Bestehender Kunde - Suche */}
              <TabsContent value="existing" className="space-y-4 pt-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Kunde suchen (Name, E-Mail, Telefon, Kundennummer)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-48 overflow-y-auto rounded-md border">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Kein Kunde gefunden. Erstellen Sie einen neuen Kunden.
                      </div>
                    ) : (
                      filteredCustomers.slice(0, 10).map((customer) => (
                        <div
                          key={customer.id}
                          className={`cursor-pointer p-3 hover:bg-muted/50 border-b last:border-0 ${
                            selectedCustomerId === customer.id ? "bg-primary/10" : ""
                          }`}
                          onClick={() => {
                            setSelectedCustomerId(customer.id)
                            setSearchTerm(`${customer.first_name} ${customer.last_name}`)
                          }}
                        >
                          <div className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.email} {customer.phone && `| ${customer.phone}`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedCustomer && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {selectedCustomer.first_name} {selectedCustomer.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomerId("")
                            setSearchTerm("")
                          }}
                        >
                          Aendern
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Neuer Kunde - Formular */}
              <TabsContent value="new" className="space-y-4 pt-4">
                {/* Persoenliche Daten */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Anrede *</Label>
                    <Select name="customer_salutation" required={customerMode === "new"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALUTATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Vorname *</Label>
                    <Input name="customer_first_name" required={customerMode === "new"} />
                  </div>
                  <div className="grid gap-2">
                    <Label>NACHNAME *</Label>
                    <Input name="customer_last_name" required={customerMode === "new"} className="uppercase" />
                  </div>
                </div>

                {/* Kontaktdaten */}
                <div className="grid gap-2">
                  <Label>E-Mail</Label>
                  <Input name="customer_email" type="email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Mobil Nummer</Label>
                    <Input name="customer_mobile" type="tel" maxLength={20} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefon Nummer</Label>
                    <Input name="customer_phone" type="tel" maxLength={20} />
                  </div>
                </div>

                {/* Rechnungsanschrift mit Tabs */}
                <Tabs value={addressType} onValueChange={(v) => setAddressType(v as "private" | "business")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="private">Privat</TabsTrigger>
                    <TabsTrigger value="business">Geschaeftlich</TabsTrigger>
                  </TabsList>

                  <TabsContent value="private" className="space-y-3">
                    <div className="grid gap-2">
                      <Label>Adresse</Label>
                      <AddressAutocomplete
                        value={customerAddress}
                        onChange={setCustomerAddress}
                        placeholder="Strasse und Hausnummer"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>PLZ</Label>
                        <Input name="customer_postal_code" maxLength={5} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Ort</Label>
                        <Input name="customer_city" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-3">
                    <div className="grid gap-2">
                      <Label>Firmenname *</Label>
                      <Input name="customer_company_name" required={addressType === "business"} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Ansprechpartner/in</Label>
                      <Input name="customer_contact_person" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Adresse</Label>
                      <AddressAutocomplete
                        value={customerAddress}
                        onChange={setCustomerAddress}
                        placeholder="Strasse und Hausnummer"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>PLZ</Label>
                        <Input name="customer_postal_code" maxLength={5} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Ort</Label>
                        <Input name="customer_city" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>

          {/* ABSCHNITT 2: AUFTRAGSDATEN */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </span>
              Auftragsdaten
            </h3>

            {/* Datum und Uhrzeit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Datum *</Label>
                <Input type="date" name="pickup_date" defaultValue={today} required />
              </div>
              <div className="grid gap-2">
                <Label>Uhrzeit *</Label>
                <Input type="time" name="pickup_time" defaultValue={nowTime} required />
              </div>
            </div>

            {/* Adressen */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Adresse VON *</Label>
                <AddressAutocomplete
                  value={pickupAddress}
                  onChange={(value) => {
                    setPickupAddress(value)
                  }}
                  onSelect={(result) => {
                    setPickupAddress(result.formattedAddress)
                  }}
                  placeholder="Abholadresse eingeben..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Adresse NACH *</Label>
                <AddressAutocomplete
                  value={dropoffAddress}
                  onChange={(value) => {
                    setDropoffAddress(value)
                  }}
                  onSelect={(result) => {
                    setDropoffAddress(result.formattedAddress)
                  }}
                  placeholder="Zieladresse eingeben..."
                  required
                />
              </div>
            </div>

            {/* Fahrzeug und Passagiere */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fahrzeug Klasse *</Label>
                <Select name="vehicle_class" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleCategories.length > 0 ? (
                      vehicleCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} (max. {cat.max_passengers} Pers.)
                        </SelectItem>
                      ))
                    ) : (
                      VEHICLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fahrgast Anzahl *</Label>
                <Select name="passenger_count" required defaultValue="1">
                  <SelectTrigger>
                    <SelectValue placeholder="Anzahl" />
                  </SelectTrigger>
                  <SelectContent>
                    {PASSENGER_COUNT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
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
                <Select 
                  value={selectedDriverId || ""} 
                  onValueChange={(value) => setSelectedDriverId(value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Fahrer zugewiesen</SelectItem>
                    {drivers && drivers.length > 0 ? (
                      drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.first_name} {driver.last_name}
                          {driver.status && ` (${driver.status})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="">Keine Fahrer verfügbar</SelectItem>
                    )}
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

            {/* Fahrgast Namen */}
            <div className="grid gap-2">
              <Label>Fahrgast Name/n</Label>
              <Input name="passenger_names" placeholder="Namen der Fahrgaeste (kommagetrennt)" />
            </div>

            {/* Zusatzangaben */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kostenstelle</Label>
                <Input name="cost_center" placeholder="z.B. Abteilung, Projekt" />
              </div>
              <div className="grid gap-2">
                <Label>Zahlungsart *</Label>
                <Select name="payment_method" required defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue placeholder="Zahlungsart" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        {pm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Besondere Wuensche */}
            <div className="grid gap-2">
              <Label>Besondere Wuensche</Label>
              <Textarea name="special_requests" rows={2} placeholder="z.B. Kindersitz, Rollstuhl, Gepaeck..." />
            </div>
          </div>

          {/* ABSCHNITT 3: FLUGHAFEN / BAHNHOF ABHOLUNG */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-2">
              <Checkbox
                id="airport_pickup"
                checked={isAirportPickup}
                onCheckedChange={(checked) => setIsAirportPickup(checked === true)}
              />
              <Label
                htmlFor="airport_pickup"
                className="font-semibold text-foreground cursor-pointer flex items-center gap-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">3</span>
                Abholung von Flughafen / Bahnhof
              </Label>
            </div>

            {isAirportPickup && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Abholungsart</Label>
                    <Select name="pickup_type" defaultValue="airport">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airport">
                          <span className="flex items-center gap-2">
                            <PlaneIcon className="h-4 w-4" /> Flughafen
                          </span>
                        </SelectItem>
                        <SelectItem value="train">
                          <span className="flex items-center gap-2">
                            <TrainIcon className="h-4 w-4" /> Bahnhof
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Flug- / Zug-Nummer</Label>
                    <Input name="flight_train_number" placeholder="z.B. LH1234 oder ICE 123" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Abflug-Flughafen / Abfahrt-Bahnhof</Label>
                    <Input name="departure_location" placeholder="z.B. Frankfurt FRA" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || (customerMode === "existing" && !selectedCustomerId)}>
              {loading ? "Wird erstellt..." : "Auftrag erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
