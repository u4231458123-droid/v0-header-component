"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { safeNumber } from "@/lib/utils/safe-number"
import { CalendarIcon, UserIcon, CreditCardIcon, Printer, PencilIcon } from "lucide-react"
import { downloadPDF } from "@/lib/pdf/pdf-generator"
import { createClient } from "@/lib/supabase/client"
import { ErrorHandler } from "@/lib/utils/error-handler"
import { EditInvoiceDialog } from "./EditInvoiceDialog"
import type { Invoice, Profile } from "@/types/entities"

interface InvoiceDetailsDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updatedInvoice: Invoice) => void
}

export function InvoiceDetailsDialog({ invoice, open, onOpenChange, onUpdate }: InvoiceDetailsDialogProps) {
  const [currentInvoice, setCurrentInvoice] = useState(invoice)
  const [printing, setPrinting] = useState(false)
  const [createdByProfile, setCreatedByProfile] = useState<Profile | null>(null)
  const [updatedByProfile, setUpdatedByProfile] = useState<Profile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setCurrentInvoice(invoice)
  }, [invoice])

  // Lade Bearbeiter-Profile
  useEffect(() => {
    const loadBearbeiter = async () => {
      if (currentInvoice?.created_by) {
        const { data } = await supabase.from("profiles").select("id, full_name, email").eq("id", currentInvoice.created_by).single()
        if (data) setCreatedByProfile(data)
      }
      if (currentInvoice?.updated_by && currentInvoice.updated_by !== currentInvoice.created_by) {
        const { data } = await supabase.from("profiles").select("id, full_name, email").eq("id", currentInvoice.updated_by).single()
        if (data) setUpdatedByProfile(data)
      }
    }
    if (open && currentInvoice) {
      loadBearbeiter()
    }
  }, [open, currentInvoice, supabase])

  if (!currentInvoice) return null

  const createdAt = currentInvoice.created_at ? new Date(currentInvoice.created_at) : null
  const dueDate = currentInvoice.due_date ? new Date(currentInvoice.due_date) : null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Ausstehend", variant: "secondary" },
      paid: { label: "Bezahlt", variant: "default" },
      overdue: { label: "Überfällig", variant: "destructive" },
      cancelled: { label: "Storniert", variant: "outline" },
    }
    const config = statusConfig[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handlePrintPDF = async () => {
    setPrinting(true)
    try {
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", currentInvoice.company_id)
        .single()

      if (!company) {
        throw new Error("Unternehmen nicht gefunden")
      }

      const { data: fullInvoice } = await supabase
        .from("invoices")
        .select(
          `
          *,
          customer:customers(*),
          booking:bookings(*)
        `
        )
        .eq("id", currentInvoice.id)
        .single()

      if (!fullInvoice) {
        throw new Error("Rechnung nicht gefunden")
      }

      await downloadPDF({
        type: "invoice",
        company: company,
        content: fullInvoice,
      })

      setPrinting(false)
    } catch (error: unknown) {
      ErrorHandler.showToast(error, { component: "InvoiceDetailsDialog", action: "printPDF" }, "Fehler beim PDF-Druck")
      setPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 pr-8">
            <span>Rechnungsdetails</span>
            {getStatusBadge(currentInvoice.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rechnungsnummer und Datum */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rechnungsnummer</p>
              <p className="font-mono text-sm font-medium">{currentInvoice.invoice_number || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Erstellt am</p>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {createdAt ? format(createdAt, "dd.MM.yyyy", { locale: de }) : "-"}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bearbeiter-Info */}
          {(createdByProfile || updatedByProfile) && (
            <>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Bearbeiter
                </h4>
                <div className="grid grid-cols-2 gap-5 pl-6">
                  {createdByProfile && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Erstellt von</p>
                      <p className="text-sm font-medium">
                        {createdByProfile.full_name || createdByProfile.email || "Unbekannt"}
                      </p>
                      {createdByProfile.email && (
                        <p className="text-xs text-muted-foreground">{createdByProfile.email}</p>
                      )}
                    </div>
                  )}
                  {updatedByProfile && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Zuletzt bearbeitet von</p>
                      <p className="text-sm font-medium">
                        {updatedByProfile.full_name || updatedByProfile.email || "Unbekannt"}
                      </p>
                      {updatedByProfile.email && (
                        <p className="text-xs text-muted-foreground">{updatedByProfile.email}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Kunde */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Kunde
            </h4>
            <div className="pl-6 space-y-1">
              <p className="text-sm font-medium">
                {currentInvoice.customer?.first_name} {currentInvoice.customer?.last_name}
              </p>
              {currentInvoice.customer?.email && (
                <p className="text-sm text-muted-foreground">{currentInvoice.customer.email}</p>
              )}
              {currentInvoice.customer?.phone && (
                <p className="text-sm text-muted-foreground">{currentInvoice.customer.phone}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Rechnungsdetails */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fälligkeitsdatum</p>
                <p className="text-sm font-medium">
                  {dueDate ? format(dueDate, "dd.MM.yyyy", { locale: de }) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCardIcon className="h-3 w-3" />
                  Betrag
                </p>
                <p className="text-lg font-bold">
                  {currentInvoice.total_amount ? `${safeNumber(currentInvoice.total_amount).toFixed(2)} EUR` : "-"}
                </p>
              </div>
            </div>

            {currentInvoice.subtotal && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Zwischensumme</p>
                <p className="text-sm font-medium">{safeNumber(currentInvoice.subtotal).toFixed(2)} EUR</p>
              </div>
            )}

            {currentInvoice.tax_amount && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">MwSt.</p>
                <p className="text-sm font-medium">{safeNumber(currentInvoice.tax_amount).toFixed(2)} EUR</p>
              </div>
            )}
          </div>

          {currentInvoice.notes && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Notizen</p>
                <p className="text-sm">{currentInvoice.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={handlePrintPDF} disabled={printing} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            {printing ? "Wird erstellt..." : "PDF drucken"}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="flex-1 sm:flex-initial"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1 sm:flex-initial">Schließen</Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Edit Dialog */}
      <EditInvoiceDialog
        invoice={currentInvoice}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={(updatedInvoice) => {
          setCurrentInvoice(updatedInvoice)
          if (onUpdate) {
            onUpdate(updatedInvoice)
          }
        }}
      />
    </Dialog>
  )
}

