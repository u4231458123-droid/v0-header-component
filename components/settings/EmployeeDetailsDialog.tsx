"use client"

import { useState, useEffect } from "react"
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
  CalendarIcon,
  FileTextIcon,
  DownloadIcon,
  GlobeIcon,
  PencilIcon,
  BriefcaseIcon,
} from "lucide-react"
import { EditEmployeeDialog } from "./EditEmployeeDialog"
import { createClient } from "@/lib/supabase/client"

interface EmployeeDetailsDialogProps {
  employee: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmployeeUpdated?: () => void
}

interface EmployeeDocument {
  id: string
  document_type: string
  file_name: string
  file_url: string
  valid_from: string | null
  valid_until: string | null
  status: "pending" | "approved" | "rejected" | "expired"
  created_at: string
}

const EMPLOYEE_DOCUMENT_TYPES: Record<string, string> = {
  health_insurance_card: "Krankenkassenkarte",
  bank_card: "Bankverbindung/Karte",
  employment_contract: "Arbeitsvertrag",
  qualification_certificate: "Qualifikationsnachweis",
  reference_letter: "Zeugnis",
  employee_other: "Sonstige Mitarbeiter-Dokumente",
}

export function EmployeeDetailsDialog({ employee, open, onOpenChange, onEmployeeUpdated }: EmployeeDetailsDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [localEmployee, setLocalEmployee] = useState(employee)
  const [documents, setDocuments] = useState<EmployeeDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const supabase = createClient()

  // Update local employee when prop changes
  useEffect(() => {
    if (employee?.id !== localEmployee?.id) {
      setLocalEmployee(employee)
    }
  }, [employee, localEmployee?.id])

  // Load documents when dialog opens
  useEffect(() => {
    if (open && localEmployee?.id) {
      loadDocuments()
    }
  }, [open, localEmployee?.id])

  const loadDocuments = async () => {
    if (!localEmployee?.id) return
    setLoadingDocuments(true)
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("profile_id", localEmployee.id)
        .eq("owner_type", "employee")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setDocuments(data)
      }
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleDownloadDocument = async (fileUrl: string) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(fileUrl, 3600)

    if (error) {
      console.error("Error creating signed URL:", error)
      return
    }

    window.open(data.signedUrl, "_blank")
  }

  if (!localEmployee) return null

  const addressData = localEmployee.address_data || {}
  const employmentData = localEmployee.employment_data || {}

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      owner: { label: "Inhaber", variant: "default" },
      admin: { label: "Administrator", variant: "secondary" },
      dispatcher: { label: "Disponent", variant: "outline" },
      user: { label: "Benutzer", variant: "outline" },
    }
    const config = roleConfig[role] || { label: role, variant: "secondary" }
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

  const handleEditSuccess = (updatedEmployee: any) => {
    setLocalEmployee(updatedEmployee)
    setShowEditDialog(false)
    onEmployeeUpdated?.()
    loadDocuments()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Mitarbeiter-Details</span>
              {getRoleBadge(localEmployee.role)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ID */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Mitarbeiter-ID</p>
              <p className="font-mono text-sm font-medium">{localEmployee.id?.substring(0, 8).toUpperCase()}</p>
            </div>

            <Separator />

            {/* Persönliche Daten */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Persönliche Daten
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {localEmployee.salutation || ""} {localEmployee.title || ""} {localEmployee.full_name || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MailIcon className="h-3 w-3" />
                    E-Mail
                  </p>
                  <p className="text-sm font-medium">{localEmployee.email || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Telefon
                  </p>
                  <p className="text-sm font-medium">{localEmployee.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Mobil
                  </p>
                  <p className="text-sm font-medium">{localEmployee.phone_mobile || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Geburtsdatum
                  </p>
                  <p className="text-sm font-medium">{formatDate(localEmployee.date_of_birth)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <GlobeIcon className="h-3 w-3" />
                    Nationalität
                  </p>
                  <p className="text-sm font-medium">{localEmployee.nationality || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Anschrift */}
            {(addressData.street || addressData.city) && (
              <>
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
                    {addressData.country && <p className="text-sm font-medium">{addressData.country}</p>}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Beschäftigung */}
            {employmentData.start_date && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <BriefcaseIcon className="h-4 w-4" />
                    Beschäftigung
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Vertragsart</p>
                      <p className="text-sm font-medium">
                        {employmentData.contract_type === "full-time"
                          ? "Vollzeit"
                          : employmentData.contract_type === "part-time"
                            ? "Teilzeit"
                            : employmentData.contract_type === "freelance"
                              ? "Freelance"
                              : employmentData.contract_type || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Seit</p>
                      <p className="text-sm font-medium">{formatDate(employmentData.start_date)}</p>
                    </div>
                    {employmentData.department && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Abteilung</p>
                        <p className="text-sm font-medium">{employmentData.department}</p>
                      </div>
                    )}
                    {employmentData.position && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="text-sm font-medium">{employmentData.position}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Dokumente */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Dokumente
              </h4>
              {loadingDocuments ? (
                <div className="pl-6 text-sm text-muted-foreground">Lade Dokumente...</div>
              ) : documents.length > 0 ? (
                <div className="pl-6 space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-xl border bg-muted/50">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {EMPLOYEE_DOCUMENT_TYPES[doc.document_type] || doc.document_type}
                          </p>
                          <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            doc.status === "approved"
                              ? "default"
                              : doc.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {doc.status === "approved"
                            ? "Genehmigt"
                            : doc.status === "rejected"
                              ? "Abgelehnt"
                              : "Ausstehend"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.file_url)}
                          className="h-8 w-8 p-0"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pl-6 text-sm text-muted-foreground">Keine Dokumente vorhanden</div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
            <Button onClick={() => setShowEditDialog(true)} className="gap-2">
              <PencilIcon className="h-4 w-4" />
              Bearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditEmployeeDialog
        employee={localEmployee}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}

