"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { InvoicePaymentDialog } from "./InvoicePaymentDialog"
import { safeNumber } from "@/lib/utils/safe-number"

// Inline SVG Icons
function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  )
}

function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  status: string
  total_amount: number
  tax_amount: number
  customer: {
    first_name: string
    last_name: string
  }
}

interface InvoicesTableProps {
  invoices: Invoice[]
}

const statusConfig = {
  draft: { label: "Entwurf", variant: "secondary" as const },
  pending: { label: "Ausstehend", variant: "default" as const },
  paid: { label: "Bezahlt", variant: "default" as const },
  overdue: { label: "Überfällig", variant: "destructive" as const },
  cancelled: { label: "Storniert", variant: "outline" as const },
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteInvoiceId) return

    try {
      const { error } = await supabase.from("invoices").delete().eq("id", deleteInvoiceId)

      if (error) throw error

      toast.success("Rechnung erfolgreich gelöscht", {
        description: "Die Rechnung wurde aus dem System entfernt.",
        duration: 4000,
      })
      setDeleteInvoiceId(null)
      router.refresh()
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast.error("Fehler beim Löschen der Rechnung", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    }
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_date: new Date().toISOString() })
        .eq("id", invoiceId)

      if (error) throw error

      toast.success("Rechnung als bezahlt markiert")
      router.refresh()
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast.error("Fehler beim Aktualisieren der Rechnung")
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rechnungsnummer</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Rechnungsdatum</TableHead>
            <TableHead>Fällig am</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Betrag</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Noch keine Rechnungen vorhanden
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const isOverdue = invoice.status === "pending" && new Date(invoice.due_date) < new Date()
              const displayStatus = isOverdue ? "overdue" : invoice.status

              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    {invoice.customer.first_name} {invoice.customer.last_name}
                  </TableCell>
                  <TableCell>{format(new Date(invoice.issue_date), "dd.MM.yyyy", { locale: de })}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), "dd.MM.yyyy", { locale: de })}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[displayStatus as keyof typeof statusConfig]?.variant}>
                      {statusConfig[displayStatus as keyof typeof statusConfig]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {safeNumber(invoice.total_amount).toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                        {invoice.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => setPaymentInvoice(invoice)}>
                              <CreditCardIcon className="mr-2 h-4 w-4" />
                              Mit Stripe bezahlen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                              Als bezahlt markieren
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          PDF herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <SendIcon className="mr-2 h-4 w-4" />
                          Per E-Mail senden
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <EditIcon className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteInvoiceId(invoice.id)}>
                          <Trash2Icon className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {paymentInvoice && (
        <InvoicePaymentDialog
          invoiceId={paymentInvoice.id}
          invoiceNumber={paymentInvoice.invoice_number}
          totalAmount={paymentInvoice.total_amount}
          open={!!paymentInvoice}
          onOpenChange={(open) => !open && setPaymentInvoice(null)}
        />
      )}

      <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Rechnung wird permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
