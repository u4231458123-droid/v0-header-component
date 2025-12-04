"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  CarIcon,
  FileTextIcon,
  ShieldIcon,
  CalendarIcon,
  HashIcon,
  DownloadIcon,
  GaugeIcon,
  PaletteIcon,
  FuelIcon,
  PencilIcon,
} from "lucide-react"
import { EditVehicleDialog } from "./EditVehicleDialog"
import { downloadPDF } from "@/lib/pdf/pdf-generator"
import { createClient } from "@/lib/supabase/client"
import { Printer } from "lucide-react"
import { toast } from "sonner"

interface VehicleDetailsDialogProps {
  vehicle: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onVehicleUpdated?: () => void
  onUpdate?: () => void
}

export function VehicleDetailsDialog({ vehicle, open, onOpenChange, onVehicleUpdated }: VehicleDetailsDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [localVehicle, setLocalVehicle] = useState(vehicle)
  const [printing, setPrinting] = useState(false)
  const supabase = createClient()

  // Update local vehicle when prop changes
  if (vehicle?.id !== localVehicle?.id) {
    setLocalVehicle(vehicle)
  }

  if (!localVehicle) return null

  const handlePrintPDF = async () => {
    setPrinting(true)
    try {
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", localVehicle.company_id)
        .single()

      if (!company) {
        toast.error("Unternehmen nicht gefunden")
        return
      }

      await downloadPDF({
        type: "vehicle",
        company: {
          id: company.id,
          name: company.name,
          address: company.address || "",
          email: company.email || "",
          phone: company.phone || "",
          logo_url: company.logo_url,
        },
        content: localVehicle,
      })

      setPrinting(false)
    } catch (error: any) {
      console.error("Fehler beim PDF-Druck:", error)
      toast.error("Fehler beim Erstellen des PDFs")
      setPrinting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      available: { label: "Verfuegbar", variant: "default" },
      in_use: { label: "Im Einsatz", variant: "secondary" },
      maintenance: { label: "Wartung", variant: "destructive" },
    }
    const config = statusConfig[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    try {
      return format(new Date(date), "dd.MM.yyyy", { locale: de })
    } catch {
      return "-"
    }
  }

  const handleEditSuccess = (updatedVehicle: any) => {
    setLocalVehicle(updatedVehicle)
    setShowEditDialog(false)
    onVehicleUpdated?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Fahrzeug-Details</span>
              {getStatusBadge(localVehicle.status)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ID und Kennzeichen */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fahrzeug-ID</p>
                <p className="font-mono text-sm font-medium">{localVehicle.id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Kennzeichen</p>
                <p className="font-mono text-lg font-bold">{localVehicle.license_plate || "-"}</p>
              </div>
            </div>

            <Separator />

            {/* Fahrzeugdaten */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CarIcon className="h-4 w-4" />
                Fahrzeugdaten
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Hersteller</p>
                  <p className="text-sm font-medium">{localVehicle.make || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Modell</p>
                  <p className="text-sm font-medium">{localVehicle.model || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kategorie</p>
                  <p className="text-sm font-medium">{localVehicle.category || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">FIN (VIN)</p>
                  <p className="text-sm font-medium font-mono">{localVehicle.vin || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PaletteIcon className="h-3 w-3" />
                    Farbe
                  </p>
                  <p className="text-sm font-medium">{localVehicle.color || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">HSN / TSN</p>
                  <p className="text-sm font-medium font-mono">
                    {localVehicle.hsn || "-"} / {localVehicle.tsn || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <GaugeIcon className="h-3 w-3" />
                    Leistung
                  </p>
                  <p className="text-sm font-medium">
                    {localVehicle.kw ? `${localVehicle.kw} KW` : "-"}
                    {localVehicle.ps ? ` / ${localVehicle.ps} PS` : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Sitzplaetze</p>
                  <p className="text-sm font-medium">{localVehicle.seats || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FuelIcon className="h-3 w-3" />
                    Kraftstoff
                  </p>
                  <p className="text-sm font-medium">{localVehicle.fuel_type || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Baujahr</p>
                  <p className="text-sm font-medium">{localVehicle.year || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Erstzulassung
                  </p>
                  <p className="text-sm font-medium">{formatDate(localVehicle.first_registration_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kilometerstand</p>
                  <p className="text-sm font-medium">
                    {localVehicle.mileage ? `${localVehicle.mileage.toLocaleString("de-DE")} km` : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    TUeV bis
                  </p>
                  <p className="text-sm font-medium">{formatDate(localVehicle.tuev_date)}</p>
                </div>
              </div>
              {localVehicle.fahrzeugschein_url && (
                <div className="pl-6 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={localVehicle.fahrzeugschein_url} target="_blank" rel="noopener noreferrer">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Fahrzeugschein anzeigen
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Konzession */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Konzession
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <HashIcon className="h-3 w-3" />
                    Nummer
                  </p>
                  <p className="text-sm font-medium font-mono">{localVehicle.concession_number || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Ablauf
                  </p>
                  <p className="text-sm font-medium">{formatDate(localVehicle.concession_due_date)}</p>
                </div>
              </div>
              {localVehicle.konzessionsauszug_url && (
                <div className="pl-6 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={localVehicle.konzessionsauszug_url} target="_blank" rel="noopener noreferrer">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Konzessionsauszug anzeigen
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Versicherung */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                Versicherung
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Versicherung</p>
                  <p className="text-sm font-medium">{localVehicle.insurance_company || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Versicherungsnummer</p>
                  <p className="text-sm font-medium font-mono">{localVehicle.insurance_number || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Gueltig bis
                  </p>
                  <p className="text-sm font-medium">{formatDate(localVehicle.insurance_valid_until)}</p>
                </div>
              </div>
            </div>

            {/* Notizen */}
            {localVehicle.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Notizen</h4>
                  <p className="text-sm text-muted-foreground pl-6">{localVehicle.notes}</p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schliessen
            </Button>
            <Button variant="outline" onClick={handlePrintPDF} disabled={printing}>
              <Printer className="h-4 w-4 mr-2" />
              {printing ? "Wird erstellt..." : "PDF Drucken"}
            </Button>
            <Button onClick={() => setShowEditDialog(true)}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditVehicleDialog
        vehicle={localVehicle}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
