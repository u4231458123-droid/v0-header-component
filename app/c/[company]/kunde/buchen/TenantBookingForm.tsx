"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { CalendarIcon, Clock, Users, Car, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"

interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  logo_url: string | null
  company_slug: string
  branding: Record<string, unknown> | null
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

interface VehicleCategory {
  id: string
  name: string
  description: string | null
  max_passengers: number
}

interface TenantBookingFormProps {
  company: Company
  customer: Customer
  vehicleCategories: VehicleCategory[]
}

function getSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function TenantBookingForm({ company, customer, vehicleCategories }: TenantBookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined)
  const [pickupTime, setPickupTime] = useState("09:00")
  const [passengers, setPassengers] = useState("1")
  const [vehicleCategory, setVehicleCategory] = useState("")
  const [notes, setNotes] = useState("")
  const [passengerName, setPassengerName] = useState(`${customer.first_name} ${customer.last_name}`)
  const [passengerPhone, setPassengerPhone] = useState(customer.phone || "")

  const branding = (company.branding || {}) as Record<string, string>
  const primaryColor = branding.primary_color || branding.primaryColor || "#343f60"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!pickupAddress || !dropoffAddress || !pickupDate || !pickupTime) {
        throw new Error("Bitte fuellen Sie alle Pflichtfelder aus.")
      }

      const supabase = getSupabaseClient()

      // Kombiniere Datum und Zeit
      const [hours, minutes] = pickupTime.split(":").map(Number)
      const pickupDateTime = new Date(pickupDate)
      pickupDateTime.setHours(hours, minutes, 0, 0)

      // Erstelle Buchung
      const { error: insertError } = await supabase.from("bookings").insert({
        company_id: company.id,
        customer_id: customer.id,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        pickup_time: pickupDateTime.toISOString(),
        passenger_count: Number.parseInt(passengers),
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        vehicle_category_id: vehicleCategory || null,
        notes: notes || null,
        status: "pending",
        source: "customer_portal",
      })

      if (insertError) {
        throw new Error("Buchung konnte nicht erstellt werden: " + insertError.message)
      }

      setSuccess(true)

      // Nach 2 Sekunden zum Portal zurueck
      setTimeout(() => {
        router.push(`/c/${company.company_slug}/kunde/portal`)
      }, 2000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Buchung erfolgreich!</h2>
            <p className="text-slate-500 mb-4">Ihre Fahrt wurde angefragt. Wir werden Sie in Kuerze kontaktieren.</p>
            <Link href={`/c/${company.company_slug}/kunde/portal`}>
              <Button style={{ backgroundColor: primaryColor }} className="text-white">
                Zum Kundenportal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/c/${company.company_slug}/kunde/portal`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <Image
                  src={company.logo_url || "/placeholder.svg"}
                  alt={company.name}
                  width={32}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{company.name}</p>
                <p className="text-xs text-slate-500">Neue Fahrt buchen</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Fahrt buchen</CardTitle>
            <CardDescription>Geben Sie die Details fuer Ihre Fahrt ein. Wir melden uns bei Ihnen.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Abholadresse */}
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">
                  Abholadresse <span className="text-red-500">*</span>
                </Label>
                <AddressAutocomplete
                  id="pickupAddress"
                  value={pickupAddress}
                  onChange={setPickupAddress}
                  placeholder="z.B. Flughafen Frankfurt, Terminal 1"
                  required
                />
              </div>

              {/* Zieladresse */}
              <div className="space-y-2">
                <Label htmlFor="dropoffAddress">
                  Zieladresse <span className="text-red-500">*</span>
                </Label>
                <AddressAutocomplete
                  id="dropoffAddress"
                  value={dropoffAddress}
                  onChange={setDropoffAddress}
                  placeholder="z.B. Musterstrasse 123, 60329 Frankfurt"
                  required
                />
              </div>

              {/* Datum und Uhrzeit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Datum <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !pickupDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "dd.MM.yyyy", { locale: de }) : "Datum waehlen"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTime">
                    Uhrzeit <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="pickupTime"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Passagiere und Fahrzeugkategorie */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passengers">Anzahl Passagiere</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? "Person" : "Personen"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {vehicleCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="vehicleCategory">Fahrzeugkategorie</Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Select value={vehicleCategory} onValueChange={setVehicleCategory}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Kategorie waehlen" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name} (max. {cat.max_passengers} Pers.)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Passagier-Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passengerName">Passagiername</Label>
                  <Input
                    id="passengerName"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Name des Passagiers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengerPhone">Telefon</Label>
                  <Input
                    id="passengerPhone"
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="Telefonnummer"
                  />
                </div>
              </div>

              {/* Bemerkungen */}
              <div className="space-y-2">
                <Label htmlFor="notes">Bemerkungen</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Zusaetzliche Informationen (Flugnummer, Treffpunkt, etc.)"
                  rows={3}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: primaryColor }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  "Fahrt anfragen"
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                Nach Ihrer Anfrage erhalten Sie eine Bestaetigung per E-Mail.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
