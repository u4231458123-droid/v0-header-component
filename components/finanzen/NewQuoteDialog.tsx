"use client"

import type React from "react"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { SALUTATION_OPTIONS, VEHICLE_CATEGORIES, PASSENGER_COUNT_OPTIONS, PAYMENT_METHODS } from "@/lib/form-constants"
import { safeNumber } from "@/lib/utils/safe-number"

// Icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

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

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
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
}

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

interface NewQuoteDialogProps {
  companyId: string | null
  customers: Customer[]
  bookings?: any[]
  company?: any
  onSuccess?: (quote: any) => void
}

export function NewQuoteDialog({ companyId, customers = [], onSuccess }: NewQuoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Kunde
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [addressType, setAddressType] = useState<"private" | "business">("private")

  // Angebotsdaten
  const [validUntil, setValidUntil] = useState("")

  // Fahrtdaten (exakt wie CreateBookingDialog)
  const [pickupDate, setPickupDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [pickupTime, setPickupTime] = useState(format(new Date(), "HH:mm"))
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [vehicleClass, setVehicleClass] = useState("")
  const [passengerCount, setPassengerCount] = useState("1")
  const [passengerNames, setPassengerNames] = useState("")
  const [costCenter, setCostCenter] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [specialRequests, setSpecialRequests] = useState("")
  const [isAirportPickup, setIsAirportPickup] = useState(false)
  const [pickupType, setPickupType] = useState("airport")
  const [flightTrainNumber, setFlightTrainNumber] = useState("")
  const [departureLocation, setDepartureLocation] = useState("")

  const [notes, setNotes] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("Zahlbar innerhalb von 14 Tagen nach Auftragserteilung.")

  // Fahrer und Fahrzeuge
  const [drivers, setDrivers] = useState<Array<{ id: string; first_name: string; last_name: string; status?: string }>>([])
  const [vehicles, setVehicles] = useState<Array<{ id: string; license_plate: string; make?: string; model?: string; status?: string }>>([])
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [selectedVehicleId, setSelectedVehicleId] = useState("")

  // Positionen
  const [items, setItems] = useState<QuoteItem[]>([
    { id: "1", description: "Personenbeförderung", quantity: 1, unit: "Fahrt", unitPrice: 0 },
  ])

  const taxRate = 7
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal + taxAmount

  // Gefilterte Kunden
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchTerm)
    )
  })

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  // Lade Fahrer und Fahrzeuge
  useEffect(() => {
    if (!companyId) return

    const loadDriversAndVehicles = async () => {
      const [driversResult, vehiclesResult] = await Promise.all([
        supabase
          .from("drivers")
          .select("id, first_name, last_name, status")
          .eq("company_id", companyId)
          .order("last_name"),
        supabase
          .from("vehicles")
          .select("id, license_plate, make, model, status")
          .eq("company_id", companyId)
          .order("license_plate"),
      ])

      if (driversResult.data) setDrivers(driversResult.data)
      if (vehiclesResult.data) setVehicles(vehiclesResult.data)
    }

    loadDriversAndVehicles()
  }, [companyId, supabase])

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unit: "Stück", unitPrice: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const resetForm = () => {
    setCustomerMode("existing")
    setSearchTerm("")
    setSelectedCustomerId("")
    setAddressType("private")
    setValidUntil("")
    setPickupDate(format(new Date(), "yyyy-MM-dd"))
    setPickupTime(format(new Date(), "HH:mm"))
    setPickupAddress("")
    setDropoffAddress("")
    setVehicleClass("")
    setPassengerCount("1")
    setPassengerNames("")
    setCostCenter("")
    setPaymentMethod("cash")
    setSpecialRequests("")
    setIsAirportPickup(false)
    setPickupType("airport")
    setFlightTrainNumber("")
    setDepartureLocation("")
    setSelectedDriverId("")
    setSelectedVehicleId("")
    setNotes("")
    setPaymentTerms("Zahlbar innerhalb von 14 Tagen nach Auftragserteilung.")
    setItems([{ id: "1", description: "Personenbeförderung", quantity: 1, unit: "Fahrt", unitPrice: 0 }])
  }

  const setDefaultValidUntil = () => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    setValidUntil(date.toISOString().split("T")[0])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    let customerId = selectedCustomerId

    try {
      // Neuen Kunden erstellen wenn nötig
      if (customerMode === "new") {
        const customerData: Record<string, unknown> = {
          company_id: companyId,
          salutation: formData.get("customer_salutation") as string,
          first_name: formData.get("customer_first_name") as string,
          last_name: formData.get("customer_last_name") as string,
          email: formData.get("customer_email") as string,
          phone: formData.get("customer_phone") as string,
          mobile: formData.get("customer_mobile") as string,
          address: formData.get("customer_address") as string,
          city: formData.get("customer_city") as string,
          postal_code: formData.get("customer_postal_code") as string,
          address_type: addressType,
          status: "active",
        }

        if (addressType === "business") {
          customerData.company_name = formData.get("customer_company_name") as string
          customerData.contact_person = formData.get("customer_contact_person") as string
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
        toast.error("Bitte wählen Sie einen Kunden aus oder erstellen Sie einen neuen")
        setLoading(false)
        return
      }

      if (items.some((item) => !item.description || item.unitPrice <= 0)) {
        toast.error("Bitte füllen Sie alle Positionen aus")
        setLoading(false)
        return
      }

      const year = new Date().getFullYear()
      const { count } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .like("quote_number", `ANG-${year}-%`)

      const quoteNumber = `ANG-${year}-${String((count || 0) + 1).padStart(4, "0")}`

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          company_id: companyId,
          customer_id: customerId,
          quote_number: quoteNumber,
          status: "draft",
          valid_until: validUntil || null,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          pickup_address: pickupAddress || null,
          dropoff_address: dropoffAddress || null,
          pickup_date: pickupDate || null,
          pickup_time: pickupTime || null,
          passengers: Number.parseInt(passengerCount) || 1,
          vehicle_type: vehicleClass || null,
          driver_id: selectedDriverId || null,
          vehicle_id: selectedVehicleId || null,
          notes: notes || null,
          payment_terms: paymentTerms || null,
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      const itemsToInsert = items.map((item, index) => ({
        quote_id: quote.id,
        position: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
      }))

      await supabase.from("quote_items").insert(itemsToInsert)

      toast.success("Angebot erfolgreich erstellt")
      onSuccess?.(quote)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating quote:", error)
      toast.error("Fehler beim Erstellen des Angebots")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen && !validUntil) setDefaultValidUntil()
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Neues Angebot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Neues Angebot erstellen</DialogTitle>
          <DialogDescription>Erstellen Sie ein Angebot für Ihren Kunden</DialogDescription>
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

              {/* Bestehender Kunde */}
              <TabsContent value="existing" className="space-y-4 pt-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Kunde suchen (Name, E-Mail, Telefon)..."
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
                          Ändern
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

                  <TabsContent value="private" className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <Label>Adresse</Label>
                      <AddressAutocomplete
                        value={pickupAddress}
                        onChange={setPickupAddress}
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

                  <TabsContent value="business" className="space-y-4 pt-4">
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
                        value={pickupAddress}
                        onChange={setPickupAddress}
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

            {/* Gültig bis */}
            <div className="grid gap-2">
              <Label>Angebot gültig bis</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>

            {/* Datum und Uhrzeit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Datum *</Label>
                <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>Uhrzeit *</Label>
                <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
              </div>
            </div>

            {/* Adressen */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Adresse VON *</Label>
                <AddressAutocomplete
                  value={pickupAddress}
                  onChange={setPickupAddress}
                  placeholder="Abholadresse"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Adresse NACH *</Label>
                <AddressAutocomplete
                  value={dropoffAddress}
                  onChange={setDropoffAddress}
                  placeholder="Zieladresse"
                  required
                />
              </div>
            </div>

            {/* Fahrzeug und Passagiere */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fahrzeug Klasse *</Label>
                <Select value={vehicleClass} onValueChange={setVehicleClass} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
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
                <Label>Fahrgast Anzahl *</Label>
                <Select value={passengerCount} onValueChange={setPassengerCount} required>
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

            {/* Fahrgast Namen */}
            <div className="grid gap-2">
              <Label>Fahrgast Name/n</Label>
              <Input
                value={passengerNames}
                onChange={(e) => setPassengerNames(e.target.value)}
                placeholder="Namen der Fahrgäste (kommagetrennt)"
              />
            </div>

            {/* Zusatzangaben */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kostenstelle</Label>
                <Input
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  placeholder="z.B. Abteilung, Projekt"
                />
              </div>
              <div className="grid gap-2">
                <Label>Zahlungsart *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
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
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                placeholder="z.B. Kindersitz, Rollstuhl, Gepaeck..."
              />
            </div>
          </div>

          {/* ABSCHNITT 3: FLUGHAFEN / BAHNHOF ABHOLUNG */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-2">
              <Checkbox
                id="airport_pickup_quote"
                checked={isAirportPickup}
                onCheckedChange={(checked) => setIsAirportPickup(checked === true)}
              />
              <Label
                htmlFor="airport_pickup_quote"
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
                    <Select value={pickupType} onValueChange={setPickupType}>
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
                    <Input
                      value={flightTrainNumber}
                      onChange={(e) => setFlightTrainNumber(e.target.value)}
                      placeholder="z.B. LH1234 oder ICE 123"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Abflug-Flughafen / Abfahrt-Bahnhof</Label>
                    <Input
                      value={departureLocation}
                      onChange={(e) => setDepartureLocation(e.target.value)}
                      placeholder="z.B. Frankfurt FRA"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ABSCHNITT 4: POSITIONEN */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                4
              </span>
              Positionen
            </h3>

            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <PlusIcon className="mr-1 h-4 w-4" />
                Position
              </Button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-md">
                <div className="col-span-5 grid gap-2">
                  <Label className="text-xs">Beschreibung</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="z.B. Personenbeförderung"
                  />
                </div>
                <div className="col-span-2 grid gap-2">
                  <Label className="text-xs">Menge</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2 grid gap-2">
                  <Label className="text-xs">Einheit</Label>
                  <Select value={item.unit} onValueChange={(v) => updateItem(item.id, "unit", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fahrt">Fahrt</SelectItem>
                      <SelectItem value="Stunde">Stunde</SelectItem>
                      <SelectItem value="km">km</SelectItem>
                      <SelectItem value="Stück">Stück</SelectItem>
                      <SelectItem value="pauschal">pauschal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 grid gap-2">
                  <Label className="text-xs">Preis €</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Summen */}
            <div className="flex flex-col items-end gap-1 pt-3 border-t text-sm">
              <div className="flex justify-between w-40">
                <span className="text-muted-foreground">Netto:</span>
                <span>{safeNumber(subtotal).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between w-40">
                <span className="text-muted-foreground">MwSt. ({taxRate}%):</span>
                <span>{safeNumber(taxAmount).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between w-40 font-semibold">
                <span>Gesamt:</span>
                <span>{safeNumber(totalAmount).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Notizen (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Zahlungsbedingungen</Label>
              <Textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={2} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || (customerMode === "existing" && !selectedCustomerId)}>
              {loading ? "Wird erstellt..." : "Angebot erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
