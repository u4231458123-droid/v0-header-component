"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { safeNumber } from "@/lib/utils/safe-number"
import { EditBookingDialog } from "./EditBookingDialog"
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CarIcon,
  PlaneIcon,
  CreditCardIcon,
  UsersIcon,
  ReceiptIcon,
  Edit,
} from "lucide-react"

interface BookingDetailsDialogProps {
  booking: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updatedBooking: any) => void
}

export function BookingDetailsDialog({ booking, open, onOpenChange, onUpdate }: BookingDetailsDialogProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentBooking, setCurrentBooking] = useState(booking)

  if (!currentBooking) return null

  const createdAt = currentBooking.created_at ? new Date(currentBooking.created_at) : null
  const pickupTime = currentBooking.pickup_time ? new Date(currentBooking.pickup_time) : null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      pending: { label: "Ausstehend", variant: "secondary" },
      confirmed: { label: "Bestaetigt", variant: "default" },
      in_progress: { label: "Unterwegs", variant: "default" },
      completed: { label: "Abgeschlossen", variant: "outline" },
      cancelled: { label: "Storniert", variant: "destructive" },
    }
    const config = statusConfig[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "Ausstehend", variant: "secondary" },
      paid: { label: "Bezahlt", variant: "default" },
      unpaid: { label: "Unbezahlt", variant: "destructive" },
    }
    const c = config[status] || config.pending
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const handleEditSuccess = (updatedBooking: any) => {
    setCurrentBooking(updatedBooking)
    setEditDialogOpen(false)
    if (onUpdate) {
      onUpdate(updatedBooking)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-8">
              <span>Auftragsdetails</span>
              {getStatusBadge(currentBooking.status)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ID und Eingangszeit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Auftrags-ID</p>
                <p className="font-mono text-sm font-medium">{currentBooking.id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Auftrag Eingang</p>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {createdAt ? format(createdAt, "dd.MM.yyyy", { locale: de }) : "-"}
                  <ClockIcon className="h-4 w-4 text-muted-foreground ml-2" />
                  {createdAt ? format(createdAt, "HH:mm", { locale: de }) : "-"} Uhr
                </div>
              </div>
            </div>

            <Separator />

            {/* Auftragszeitpunkt */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Auftrag Zeitpunkt
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="text-sm font-medium">
                    {pickupTime ? format(pickupTime, "dd.MM.yyyy", { locale: de }) : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Uhrzeit</p>
                  <p className="text-sm font-medium">
                    {pickupTime ? format(pickupTime, "HH:mm", { locale: de }) : "-"} Uhr
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Kunde - Use correct nested customer fields */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Kunde
              </h4>
              <div className="pl-6">
                <p className="text-sm font-medium">
                  {currentBooking.customer?.salutation || ""} {currentBooking.customer?.first_name || ""}{" "}
                  <span className="uppercase">{currentBooking.customer?.last_name || "-"}</span>
                </p>
                {currentBooking.customer?.email && (
                  <p className="text-sm text-muted-foreground">{currentBooking.customer.email}</p>
                )}
                {currentBooking.customer?.phone && (
                  <p className="text-sm text-muted-foreground">{currentBooking.customer.phone}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Adressen */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Fahrstrecke
              </h4>
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Abhol Adresse</p>
                  <p className="text-sm font-medium">{currentBooking.pickup_address || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ziel Adresse</p>
                  <p className="text-sm font-medium">{currentBooking.dropoff_address || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Passagiere - Use correct field names from schema */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Passagiere
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Anzahl (Max. 8)</p>
                  <p className="text-sm font-medium">{currentBooking.passengers || 1}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Anrede</p>
                  <p className="text-sm font-medium">{currentBooking.passenger_salutation || "-"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Name/n</p>
                  <p className="text-sm font-medium">{currentBooking.passenger_name || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Fahrzeug - Use correct nested vehicle fields */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CarIcon className="h-4 w-4" />
                Fahrzeug
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kategorie</p>
                  <p className="text-sm font-medium">{currentBooking.vehicle_category || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kennzeichen</p>
                  <p className="text-sm font-medium font-mono">{currentBooking.vehicle?.license_plate || "-"}</p>
                </div>
              </div>
            </div>

            {/* Flug/Zug Abholung - Use correct field names */}
            {(currentBooking.flight_train_number || currentBooking.flight_train_origin) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <PlaneIcon className="h-4 w-4" />
                    Flug-/Zug-Abholung
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Flug-/Zug-Nummer</p>
                      <p className="text-sm font-medium font-mono">{currentBooking.flight_train_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Abflug-/Abfahrtsort</p>
                      <p className="text-sm font-medium">{currentBooking.flight_train_origin || "-"}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Fahrer und Preis - Use correct nested driver fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fahrer</p>
                <p className="text-sm font-medium">
                  {currentBooking.driver
                    ? `${currentBooking.driver.first_name || ""} ${currentBooking.driver.last_name || ""}`
                    : "Nicht zugewiesen"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCardIcon className="h-3 w-3" />
                  Fahrpreis
                </p>
                <p className="text-lg font-bold">
                  {currentBooking.price ? `${safeNumber(currentBooking.price).toFixed(2)} EUR` : "-"}
                </p>
              </div>
            </div>

            {/* Zusaetzliche Infos - Use correct field names */}
            {(currentBooking.cost_center ||
              currentBooking.notes ||
              currentBooking.payment_method ||
              currentBooking.payment_status) && (
              <>
                <Separator />
                <div className="space-y-3">
                  {currentBooking.payment_method && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Zahlungsart</p>
                        <p className="text-sm font-medium">{currentBooking.payment_method}</p>
                      </div>
                      {currentBooking.payment_status && getPaymentStatusBadge(currentBooking.payment_status)}
                    </div>
                  )}
                  {currentBooking.cost_center && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Kostenstelle</p>
                      <p className="text-sm font-medium">{currentBooking.cost_center}</p>
                    </div>
                  )}
                  {currentBooking.notes && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Besondere Wuensche / Notizen</p>
                      <p className="text-sm">{currentBooking.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Partner Booking Info */}
            {currentBooking.is_partner_booking && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <ReceiptIcon className="h-4 w-4" />
                    Partner-Auftrag
                  </h4>
                  <div className="pl-6">
                    <Badge variant="outline">
                      {currentBooking.partner_booking_direction === "incoming" ? "Eingehend" : "Ausgehend"}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Schliessen
            </Button>
            <Button onClick={() => setEditDialogOpen(true)} className="gap-2 rounded-xl">
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editDialogOpen && (
        <EditBookingDialog
          booking={currentBooking}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
