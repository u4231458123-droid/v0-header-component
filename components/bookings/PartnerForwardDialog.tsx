"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { downloadPDF, type PDFData } from "@/lib/pdf/pdf-generator"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Send, FileText, Printer } from "lucide-react"

interface Booking {
  id: string
  pickup_time: string
  pickup_address: string
  dropoff_address: string
  passengers: number
  passenger_name?: string
  vehicle_category?: string
  flight_train_origin?: string
  flight_train_number?: string
  price?: number
  customer?: {
    salutation?: string
    first_name: string
    last_name: string
  }
  driver?: {
    first_name: string
    last_name: string
  }
  vehicle?: {
    license_plate: string
  }
}

interface Company {
  id: string
  name: string
  logo_url?: string | null
  briefpapier_url?: string | null
  address?: string
  email?: string
  phone?: string
  tax_id?: string
  vat_id?: string
  bank_info?: any
  is_small_business?: boolean
  small_business_note?: string
}

interface Partner {
  id: string
  name: string
  email?: string
  phone?: string
}

interface PartnerForwardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking
  company: Company
  partners?: Partner[]
}

// Verfügbare Datenfelder für Partner-Weiterleitung
const AVAILABLE_FIELDS = [
  { id: "id", label: "ID", description: "Auftrags-ID" },
  { id: "date", label: "Datum", description: "Auftrag Zeitpunkt (Datum)" },
  { id: "time", label: "Uhrzeit", description: "Auftrag Zeitpunkt (Uhrzeit)" },
  { id: "customer", label: "Kunde", description: "Anrede, Vorname NAME" },
  { id: "pickup", label: "Abhol-Adresse", description: "Abholadresse" },
  { id: "dropoff", label: "Ziel-Adresse", description: "Zieladresse" },
  { id: "passengers", label: "Passagier Anzahl", description: "Anzahl der Passagiere" },
  { id: "passenger_names", label: "Passagier Name/n", description: "Namen der Passagiere" },
  { id: "vehicle_category", label: "Fahrzeug Kategorie", description: "Fahrzeugklasse" },
  { id: "flight_train_origin", label: "Flug / Zug aus", description: "Abflug-Flughafen / Abfahrt-Bahnhof" },
  { id: "flight_train_number", label: "Flug / Zug Nummer", description: "Flug- oder Zugnummer" },
  { id: "driver", label: "Fahrer", description: "Zugewiesener Fahrer" },
  { id: "vehicle", label: "Fahrzeug Kennzeichen", description: "Kennzeichen des Fahrzeugs" },
  { id: "price", label: "Fahrpreis", description: "Preis der Fahrt" },
]

export function PartnerForwardDialog({
  open,
  onOpenChange,
  booking,
  company,
  partners = [],
}: PartnerForwardDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "id",
    "date",
    "time",
    "customer",
    "pickup",
    "dropoff",
    "passengers",
  ])
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("")
  const [forwardMethod, setForwardMethod] = useState<"email" | "pdf" | "both">("email")
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId],
    )
  }

  const handleForward = async () => {
    if (forwardMethod === "email" || forwardMethod === "both") {
      if (!selectedPartnerId) {
        toast.error("Bitte waehlen Sie einen Partner aus")
        return
      }
    }

    setIsProcessing(true)

    try {
      // Partner-Weiterleitung per E-Mail
      if ((forwardMethod === "email" || forwardMethod === "both") && selectedPartnerId) {
        const partner = partners.find((p) => p.id === selectedPartnerId)
        if (partner?.email) {
          const { error } = await fetch("/api/bookings/forward-to-partner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              partnerId: selectedPartnerId,
              selectedFields,
              companyId: company.id,
            }),
          }).then((res) => res.json())

          if (error) throw new Error(error)
          toast.success(`Auftrag erfolgreich an ${partner.name} weitergeleitet`)
        }
      }

      // PDF-Generierung
      if (forwardMethod === "pdf" || forwardMethod === "both") {
        const pdfData: PDFData = {
          type: "partner",
          company,
          content: booking,
          selectedFields,
        }
        downloadPDF(pdfData)
        toast.success("PDF erfolgreich generiert")
      }

      onOpenChange(false)
    } catch (error: any) {
      console.error("Error forwarding booking:", error)
      toast.error(error?.message || "Fehler beim Weiterleiten des Auftrags")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auftrag an Partner weiterleiten</DialogTitle>
          <DialogDescription>
            Waehlen Sie die Daten aus, die dem Partner uebermittelt oder im PDF ausgedruckt werden sollen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weiterleitungsmethode */}
          <div className="space-y-3">
            <Label>Weiterleitungsmethode</Label>
            <Select value={forwardMethod} onValueChange={(v) => setForwardMethod(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Per E-Mail</SelectItem>
                <SelectItem value="pdf">Als PDF ausdrucken</SelectItem>
                <SelectItem value="both">E-Mail & PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partner-Auswahl (nur bei E-Mail) */}
          {(forwardMethod === "email" || forwardMethod === "both") && (
            <div className="space-y-3">
              <Label>Partner auswaehlen *</Label>
              <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Partner auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                      {partner.email && ` (${partner.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Datenauswahl */}
          <Card>
            <CardHeader>
              <CardTitle>Datenauswahl</CardTitle>
              <CardDescription>
                Markieren Sie die Daten, die uebermittelt oder ausgedruckt werden sollen. Alle markierten Daten sind
                standardmaessig in Ihrem Account sichtbar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {AVAILABLE_FIELDS.map((field) => (
                  <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={`field-${field.id}`} className="font-medium cursor-pointer">
                        {field.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{field.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vorschau */}
          <Card>
            <CardHeader>
              <CardTitle>Vorschau</CardTitle>
              <CardDescription>So werden die ausgewaehlten Daten angezeigt:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {selectedFields.includes("id") && (
                  <div>
                    <span className="font-medium">ID:</span> {booking.id}
                  </div>
                )}
                {selectedFields.includes("date") && (
                  <div>
                    <span className="font-medium">Datum:</span>{" "}
                    {format(new Date(booking.pickup_time), "dd.MM.yyyy", { locale: de })}
                  </div>
                )}
                {selectedFields.includes("time") && (
                  <div>
                    <span className="font-medium">Uhrzeit:</span>{" "}
                    {format(new Date(booking.pickup_time), "HH:mm", { locale: de })} Uhr
                  </div>
                )}
                {selectedFields.includes("customer") && booking.customer && (
                  <div>
                    <span className="font-medium">Kunde:</span>{" "}
                    {[booking.customer.salutation, booking.customer.first_name, booking.customer.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                )}
                {selectedFields.includes("pickup") && (
                  <div>
                    <span className="font-medium">Abhol-Adresse:</span> {booking.pickup_address}
                  </div>
                )}
                {selectedFields.includes("dropoff") && (
                  <div>
                    <span className="font-medium">Ziel-Adresse:</span> {booking.dropoff_address}
                  </div>
                )}
                {selectedFields.includes("passengers") && (
                  <div>
                    <span className="font-medium">Passagier Anzahl:</span> {booking.passengers || 1}
                  </div>
                )}
                {selectedFields.includes("passenger_names") && booking.passenger_name && (
                  <div>
                    <span className="font-medium">Passagier Name/n:</span> {booking.passenger_name}
                  </div>
                )}
                {selectedFields.includes("vehicle_category") && booking.vehicle_category && (
                  <div>
                    <span className="font-medium">Fahrzeug Kategorie:</span> {booking.vehicle_category}
                  </div>
                )}
                {selectedFields.includes("flight_train_origin") && booking.flight_train_origin && (
                  <div>
                    <span className="font-medium">Flug / Zug aus:</span> {booking.flight_train_origin}
                  </div>
                )}
                {selectedFields.includes("flight_train_number") && booking.flight_train_number && (
                  <div>
                    <span className="font-medium">Flug / Zug Nummer:</span> {booking.flight_train_number}
                  </div>
                )}
                {selectedFields.includes("driver") && booking.driver && (
                  <div>
                    <span className="font-medium">Fahrer:</span> {booking.driver.first_name} {booking.driver.last_name}
                  </div>
                )}
                {selectedFields.includes("vehicle") && booking.vehicle && (
                  <div>
                    <span className="font-medium">Fahrzeug Kennzeichen:</span> {booking.vehicle.license_plate}
                  </div>
                )}
                {selectedFields.includes("price") && booking.price && (
                  <div>
                    <span className="font-medium">Fahrpreis:</span>{" "}
                    {booking.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleForward}
            disabled={isProcessing || ((forwardMethod === "email" || forwardMethod === "both") && !selectedPartnerId)}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Printer className="h-4 w-4 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              <>
                {forwardMethod === "email" ? (
                  <Send className="h-4 w-4" />
                ) : forwardMethod === "pdf" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {forwardMethod === "email" ? "Weiterleiten" : forwardMethod === "pdf" ? "PDF erstellen" : "Weiterleiten & PDF"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

