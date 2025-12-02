"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, BuildingIcon, CalendarIcon, PencilIcon } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { EditCustomerDialog } from "./EditCustomerDialog"

interface CustomerDetailsDialogProps {
  customer: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerUpdated?: () => void
}

export function CustomerDetailsDialog({ customer, open, onOpenChange, onCustomerUpdated }: CustomerDetailsDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [localCustomer, setLocalCustomer] = useState(customer)

  // Update local customer when prop changes
  if (customer?.id !== localCustomer?.id) {
    setLocalCustomer(customer)
  }

  if (!localCustomer) return null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      active: { label: "Aktiv", variant: "default" },
      inactive: { label: "Inaktiv", variant: "secondary" },
      blocked: { label: "Gesperrt", variant: "destructive" },
    }
    const config = statusConfig[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleEditSuccess = (updatedCustomer: any) => {
    setLocalCustomer(updatedCustomer)
    setShowEditDialog(false)
    onCustomerUpdated?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Kunden-Details</span>
              {getStatusBadge(localCustomer.status || "active")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ID */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Kunden-ID</p>
              <p className="font-mono text-sm font-medium">{localCustomer.id?.substring(0, 8).toUpperCase()}</p>
            </div>

            <Separator />

            {/* Persoenliche Daten */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Persoenliche Daten
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {localCustomer.salutation || ""} {localCustomer.first_name || ""}{" "}
                    <span className="uppercase">{localCustomer.last_name || "-"}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MailIcon className="h-3 w-3" />
                    E-Mail
                  </p>
                  <p className="text-sm font-medium">{localCustomer.email || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Mobil
                  </p>
                  <p className="text-sm font-medium">{localCustomer.mobile || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Telefon
                  </p>
                  <p className="text-sm font-medium">{localCustomer.phone || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rechnungsanschrift */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Rechnungsanschrift
              </h4>

              <Tabs defaultValue={localCustomer.address_type || "private"} className="pl-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="private">Privat</TabsTrigger>
                  <TabsTrigger value="business">Geschaeftlich</TabsTrigger>
                </TabsList>

                <TabsContent value="private" className="space-y-2 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="text-sm font-medium">{localCustomer.address || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">PLZ</p>
                      <p className="text-sm font-medium">{localCustomer.postal_code || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ort</p>
                      <p className="text-sm font-medium">{localCustomer.city || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-2 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <BuildingIcon className="h-3 w-3" />
                        Firmenname
                      </p>
                      <p className="text-sm font-medium">{localCustomer.company_name || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ansprechpartner/in</p>
                      <p className="text-sm font-medium">{localCustomer.contact_person || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="text-sm font-medium">{localCustomer.business_address || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">PLZ</p>
                      <p className="text-sm font-medium">{localCustomer.business_postal_code || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ort</p>
                      <p className="text-sm font-medium">{localCustomer.business_city || "-"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Statistik */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Statistik
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Anzahl Buchungen</p>
                  <p className="text-sm font-medium">{localCustomer.booking_count || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kunde seit</p>
                  <p className="text-sm font-medium">
                    {localCustomer.created_at
                      ? format(new Date(localCustomer.created_at), "dd.MM.yyyy", { locale: de })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schliessen
            </Button>
            <Button onClick={() => setShowEditDialog(true)}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditCustomerDialog
        customer={localCustomer}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
