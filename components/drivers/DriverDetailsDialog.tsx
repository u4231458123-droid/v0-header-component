"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  FileTextIcon,
  DownloadIcon,
  GlobeIcon,
  PencilIcon,
} from "lucide-react"
import { EditDriverDialog } from "./EditDriverDialog"
import { downloadPDF } from "@/lib/pdf/pdf-generator"
import { createClient } from "@/lib/supabase/client"
import { Printer } from "lucide-react"
import { toast } from "sonner"

interface DriverDetailsDialogProps {
  driver: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onDriverUpdated?: () => void
  onUpdate?: () => void
}

export function DriverDetailsDialog({ driver, open, onOpenChange, onDriverUpdated }: DriverDetailsDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [localDriver, setLocalDriver] = useState(driver)
  const [printing, setPrinting] = useState(false)
  const supabase = createClient()

  // Update local driver when prop changes
  if (driver?.id !== localDriver?.id) {
    setLocalDriver(driver)
  }

  if (!localDriver) return null

  const addressData = localDriver.address_data || {}
  const licenseData = localDriver.license_data || {}
  const pbefData = localDriver.pbef_data || {}
  const employmentData = localDriver.employment_data || {}

  const licenseClasses = localDriver.license_classes || licenseData.license_classes || []

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      active: { label: "Aktiv", variant: "default" },
      available: { label: "Verfuegbar", variant: "default" },
      busy: { label: "Beschaeftigt", variant: "secondary" },
      offline: { label: "Offline", variant: "outline" },
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

  const handlePrintPDF = async () => {
    setPrinting(true)
    try {
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", localDriver.company_id)
        .single()

      if (!company) {
        toast.error("Unternehmen nicht gefunden", {
          description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
          duration: 4000,
        })
        setPrinting(false)
        return
      }

      await downloadPDF({
        type: "driver",
        company: {
          id: company.id,
          name: company.name,
          address: company.address || "",
          email: company.email || "",
          phone: company.phone || "",
          logo_url: company.logo_url,
        },
        content: localDriver,
      })

      setPrinting(false)
    } catch (error: any) {
      console.error("Fehler beim PDF-Druck:", error)
      toast.error("Fehler beim Erstellen des PDFs", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 4000,
      })
      setPrinting(false)
    }
  }

  const handleEditSuccess = (updatedDriver: any) => {
    setLocalDriver(updatedDriver)
    setShowEditDialog(false)
    onDriverUpdated?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Fahrer-Details</span>
              {getStatusBadge(localDriver.status)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ID */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fahrer-ID</p>
              <p className="font-mono text-sm font-medium">{localDriver.id?.substring(0, 8).toUpperCase()}</p>
            </div>

            <Separator />

            {/* Persoenliche Daten */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Persoenliche Daten
              </h4>
              <div className="grid grid-cols-2 gap-5 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {localDriver.salutation || ""} {localDriver.title || ""} {localDriver.first_name || ""}{" "}
                    <span className="uppercase">{localDriver.last_name || "-"}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MailIcon className="h-3 w-3" />
                    E-Mail
                  </p>
                  <p className="text-sm font-medium">{localDriver.email || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Telefon
                  </p>
                  <p className="text-sm font-medium">{localDriver.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Mobil
                  </p>
                  <p className="text-sm font-medium">{localDriver.mobile || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Geburtsdatum
                  </p>
                  <p className="text-sm font-medium">{formatDate(localDriver.date_of_birth)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <GlobeIcon className="h-3 w-3" />
                    Nationalitaet
                  </p>
                  <p className="text-sm font-medium">{localDriver.nationality || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Anschrift */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Anschrift
              </h4>
              <div className="pl-6 space-y-1">
                <p className="text-sm font-medium">
                  {addressData.street || "-"} {addressData.house_number || ""}
                </p>
                <p className="text-sm font-medium">
                  {addressData.postal_code || ""} {addressData.city || ""}
                </p>
                {addressData.country && (
                  <p className="text-sm font-medium">{addressData.country}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Fuehrerschein */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Fuehrerschein
              </h4>
              <div className="grid grid-cols-2 gap-5 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nummer</p>
                  <p className="text-sm font-medium font-mono">
                    {localDriver.license_number || licenseData.number || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Gueltig bis
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(localDriver.license_expiry || licenseData.expiry_date)}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Klassen</p>
                  <div className="flex flex-wrap gap-1">
                    {licenseClasses.length > 0 ? (
                      licenseClasses.map((cls: string) => (
                        <Badge key={cls} variant="outline" className="text-xs">
                          {cls}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm">-</span>
                    )}
                  </div>
                </div>
                {licenseData.issuing_authority && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Ausstellungsbehoerde</p>
                    <p className="text-sm font-medium">{licenseData.issuing_authority}</p>
                  </div>
                )}
                {licenseData.document_url && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Dokument</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={licenseData.document_url} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Fuehrerschein anzeigen
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* P-Schein */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Personenbefoerderungsschein (P-Schein)
              </h4>
              <div className="grid grid-cols-2 gap-5 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nummer</p>
                  <p className="text-sm font-medium font-mono">{pbefData.number || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Erteilt am
                  </p>
                  <p className="text-sm font-medium">{formatDate(pbefData.issued_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Ablauf
                  </p>
                  <p className="text-sm font-medium">{formatDate(pbefData.expiry_date)}</p>
                </div>
                {pbefData.issuing_authority && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Ausstellungsbehoerde</p>
                    <p className="text-sm font-medium">{pbefData.issuing_authority}</p>
                  </div>
                )}
                {pbefData.document_url && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Dokument</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={pbefData.document_url} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        P-Schein anzeigen
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {employmentData.type && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Beschaeftigung
                  </h4>
                  <div className="grid grid-cols-2 gap-5 pl-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Art</p>
                      <p className="text-sm font-medium">
                        {employmentData.type === "employee"
                          ? "Angestellter"
                          : employmentData.type === "freelancer"
                            ? "Freiberufler"
                            : employmentData.type === "contractor"
                              ? "Subunternehmer"
                              : employmentData.type === "minijob"
                                ? "Minijob"
                                : employmentData.type}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Seit</p>
                      <p className="text-sm font-medium">{formatDate(employmentData.start_date)}</p>
                    </div>
                  </div>
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
              <PencilIcon className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditDriverDialog
        driver={localDriver}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
