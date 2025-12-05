"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { safeNumber } from "@/lib/utils/safe-number"
import { CalendarIcon, UserIcon, CreditCardIcon, Printer, MapPinIcon, PencilIcon, FileTextIcon } from "lucide-react"
import { downloadPDF } from "@/lib/pdf/pdf-generator"
import { createClient } from "@/lib/supabase/client"
import { ErrorHandler } from "@/lib/utils/error-handler"
import { EditQuoteDialog } from "./EditQuoteDialog"
import type { Quote, QuoteItem } from "@/types/entities"
import { toast } from "sonner"

interface QuoteDetailsDialogProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (updatedQuote: Quote) => void
}

export function QuoteDetailsDialog({ quote, open, onOpenChange, onUpdate }: QuoteDetailsDialogProps) {
  const [currentQuote, setCurrentQuote] = useState(quote)
  const [printing, setPrinting] = useState(false)
  const [createdByProfile, setCreatedByProfile] = useState<any>(null)
  const [updatedByProfile, setUpdatedByProfile] = useState<any>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setCurrentQuote(quote)
  }, [quote])

  // Lade Bearbeiter-Profile und Quote Items
  useEffect(() => {
    const loadData = async () => {
      if (currentQuote?.created_by) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", currentQuote.created_by)
          .single()
        if (data) setCreatedByProfile(data)
      }
      if (currentQuote?.updated_by && currentQuote.updated_by !== currentQuote.created_by) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", currentQuote.updated_by)
          .single()
        if (data) setUpdatedByProfile(data)
      }

      // Lade Quote Items
      if (currentQuote?.id) {
        const { data: items } = await supabase
          .from("quote_items")
          .select("*")
          .eq("quote_id", currentQuote.id)
          .order("position", { ascending: true })

        if (items) {
          setQuoteItems(items)
        }
      }
    }
    if (open && currentQuote) {
      loadData()
    }
  }, [open, currentQuote, supabase])

  if (!currentQuote) return null

  const createdAt = currentQuote.created_at ? new Date(currentQuote.created_at) : null
  const validUntil = currentQuote.valid_until ? new Date(currentQuote.valid_until) : null
  const pickupDate = currentQuote.pickup_date ? new Date(currentQuote.pickup_date) : null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Entwurf", variant: "secondary" },
      sent: { label: "Gesendet", variant: "default" },
      accepted: { label: "Angenommen", variant: "default" },
      rejected: { label: "Abgelehnt", variant: "destructive" },
      expired: { label: "Abgelaufen", variant: "outline" },
      converted: { label: "Konvertiert", variant: "default" },
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
        .eq("id", currentQuote.company_id)
        .single()

      if (!company) {
        throw new Error("Unternehmen nicht gefunden")
      }

      const { data: fullQuote } = await supabase
        .from("quotes")
        .select(
          `
          *,
          customer:customers(*),
          booking:bookings(*)
        `
        )
        .eq("id", currentQuote.id)
        .single()

      if (!fullQuote) {
        throw new Error("Angebot nicht gefunden")
      }

      // Lade Quote Items
      const { data: items } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", currentQuote.id)
        .order("position", { ascending: true })

      await downloadPDF({
        type: "quote",
        company: company,
        content: {
          quote: fullQuote,
          customer: fullQuote.customer,
          booking: fullQuote.booking,
          items: items || [],
        },
      })

      setPrinting(false)
    } catch (error: unknown) {
      ErrorHandler.showToast(error, { component: "QuoteDetailsDialog", action: "printPDF" }, "Fehler beim Erstellen des PDFs")
      setPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 pr-8">
            <span>Angebotsdetails</span>
            {getStatusBadge(currentQuote.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Angebotsnummer und Datum */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Angebotsnummer</p>
              <p className="font-mono text-sm font-medium">{currentQuote.quote_number || "-"}</p>
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
          {currentQuote.customer && (
            <>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Kunde
                </h4>
                <div className="pl-6 space-y-1">
                  <p className="text-sm font-medium">
                    {currentQuote.customer?.first_name} {currentQuote.customer?.last_name}
                  </p>
                  {currentQuote.customer?.email && (
                    <p className="text-sm text-muted-foreground">{currentQuote.customer.email}</p>
                  )}
                  {currentQuote.customer?.phone && (
                    <p className="text-sm text-muted-foreground">{currentQuote.customer.phone}</p>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Fahrtdetails */}
          {(currentQuote.pickup_address || currentQuote.dropoff_address) && (
            <>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Fahrtdetails
                </h4>
                <div className="pl-6 space-y-2">
                  {currentQuote.pickup_address && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Abholadresse</p>
                      <p className="text-sm font-medium">{currentQuote.pickup_address}</p>
                    </div>
                  )}
                  {currentQuote.dropoff_address && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Zieladresse</p>
                      <p className="text-sm font-medium">{currentQuote.dropoff_address}</p>
                    </div>
                  )}
                  {pickupDate && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Abholdatum</p>
                      <p className="text-sm font-medium">
                        {format(pickupDate, "dd.MM.yyyy", { locale: de })}
                        {currentQuote.pickup_time && ` um ${currentQuote.pickup_time}`}
                      </p>
                    </div>
                  )}
                  {currentQuote.passengers && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Passagiere</p>
                      <p className="text-sm font-medium">{currentQuote.passengers}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Angebotspositionen */}
          {quoteItems.length > 0 && (
            <>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Positionen
                </h4>
                <div className="pl-6 space-y-2">
                  {quoteItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-start p-2 rounded-xl border bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description || `Position ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} × {safeNumber(item.unit_price).toFixed(2)} €
                        </p>
                      </div>
                      <p className="text-sm font-medium">{safeNumber(item.total_price).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Angebotsdetails */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Gültig bis</p>
                <p className="text-sm font-medium">
                  {validUntil ? format(validUntil, "dd.MM.yyyy", { locale: de }) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCardIcon className="h-3 w-3" />
                  Gesamtbetrag
                </p>
                <p className="text-lg font-bold">
                  {currentQuote.total_amount ? `${safeNumber(currentQuote.total_amount).toFixed(2)} EUR` : "-"}
                </p>
              </div>
            </div>

            {currentQuote.subtotal && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Zwischensumme</p>
                <p className="text-sm font-medium">{safeNumber(currentQuote.subtotal).toFixed(2)} EUR</p>
              </div>
            )}

            {currentQuote.tax_amount && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">MwSt. ({currentQuote.tax_rate || 19}%)</p>
                <p className="text-sm font-medium">{safeNumber(currentQuote.tax_amount).toFixed(2)} EUR</p>
              </div>
            )}
          </div>

          {currentQuote.notes && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Notizen</p>
                <p className="text-sm">{currentQuote.notes}</p>
              </div>
            </>
          )}

          {currentQuote.payment_terms && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Zahlungsbedingungen</p>
                <p className="text-sm">{currentQuote.payment_terms}</p>
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
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button onClick={() => onOpenChange(false)}>Schließen</Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Edit Dialog */}
      <EditQuoteDialog
        quote={currentQuote}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={(updatedQuote) => {
          setCurrentQuote(updatedQuote)
          if (onUpdate) {
            onUpdate(updatedQuote)
          }
        }}
      />
    </Dialog>
  )
}

