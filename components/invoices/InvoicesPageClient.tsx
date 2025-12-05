"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { PageHeader } from "@/components/design-system/PageHeader"
import { StatsCard } from "@/components/design-system/StatsCard"
import { FilterBar } from "@/components/design-system/FilterBar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewInvoiceDialog } from "@/components/invoices/NewInvoiceDialog"
import { InvoiceDetailsDialog } from "@/components/invoices/InvoiceDetailsDialog"
import { Euro, CheckCircle, Clock, AlertTriangle, Eye } from "lucide-react"
import { safeNumber } from "@/lib/utils/safe-number"

interface InvoicesPageClientProps {
  invoices?: any[]
  customers?: any[]
  bookings?: any[]
  companyId?: string | null
}

export function InvoicesPageClient({
  invoices = [],
  customers = [],
  bookings = [],
  companyId = null,
}: InvoicesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [localInvoices, setLocalInvoices] = useState(invoices || [])
  const [detailsInvoice, setDetailsInvoice] = useState<any>(null)

  const supabase = createClient()

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = localInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    const paidRevenue = localInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    const pendingRevenue = localInvoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    const paidCount = localInvoices.filter((inv) => inv.status === "paid").length
    const pendingCount = localInvoices.filter((inv) => inv.status === "pending").length

    const overdueInvoices = localInvoices.filter((inv) => {
      if (inv.status !== "pending") return false
      return new Date(inv.due_date) < new Date()
    })
    const overdueRevenue = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    const overdueCount = overdueInvoices.length

    return { totalRevenue, paidRevenue, pendingRevenue, paidCount, pendingCount, overdueRevenue, overdueCount }
  }, [localInvoices])

  // Filter
  const filteredInvoices = useMemo(() => {
    return localInvoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (statusFilter === "overdue") {
        matchesStatus = invoice.status === "pending" && new Date(invoice.due_date) < new Date()
      } else if (statusFilter !== "all") {
        matchesStatus = invoice.status === statusFilter
      }

      return matchesSearch && matchesStatus
    })
  }, [localInvoices, searchQuery, statusFilter])

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all"

  const getStatusBadge = (invoice: any) => {
    const isOverdue = invoice.status === "pending" && new Date(invoice.due_date) < new Date()
    if (isOverdue) {
      return <Badge variant="destructive">Ueberfaellig</Badge>
    }
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: {
        label: "Ausstehend",
        variant: "secondary",
      },
      paid: {
        label: "Bezahlt",
        variant: "default",
      },
      cancelled: { label: "Storniert", variant: "outline" },
    }
    const c = config[invoice.status] || config.pending
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", invoiceId)
    if (!error) {
      setLocalInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv)))
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader title="Rechnungen" description="Verwalten Sie Ihre Rechnungen und Zahlungen">
        <NewInvoiceDialog companyId={companyId} customers={customers} bookings={bookings} />
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Gesamtumsatz"
          value={`${safeNumber(stats.totalRevenue).toFixed(2)} EUR`}
          subtitle={`${localInvoices.length} Rechnungen gesamt`}
          icon={<Euro className="h-5 w-5 text-primary" />}
          onClick={() => setStatusFilter("all")}
        />
        <StatsCard
          title="Bezahlt"
          value={`${safeNumber(stats.paidRevenue).toFixed(2)} EUR`}
          subtitle={`${stats.paidCount} bezahlte Rechnungen`}
          icon={<CheckCircle className="h-5 w-5 text-primary" />}
          onClick={() => setStatusFilter("paid")}
        />
        <StatsCard
          title="Ausstehend"
          value={`${safeNumber(stats.pendingRevenue).toFixed(2)} EUR`}
          subtitle={`${stats.pendingCount} offene Rechnungen`}
          icon={<Clock className="h-5 w-5 text-primary" />}
          onClick={() => setStatusFilter("pending")}
        />
        <StatsCard
          title="Ueberfaellig"
          value={`${safeNumber(stats.overdueRevenue).toFixed(2)} EUR`}
          subtitle={`${stats.overdueCount} ueberfaellige Rechnungen`}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          variant={stats.overdueCount > 0 ? "warning" : "default"}
          onClick={() => setStatusFilter("overdue")}
        />
      </div>

      {/* Overdue Warning */}
      {stats.overdueCount > 0 && (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-5 py-4">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{stats.overdueCount} ueberfaellige Rechnung(en)</p>
              <p className="text-sm text-muted-foreground">
                Gesamtbetrag: {safeNumber(stats.overdueRevenue).toFixed(2)} EUR
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("overdue")}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl"
            >
              Anzeigen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Suche nach Rechnungsnummer oder Kunde..."
        showReset={hasActiveFilters}
        onReset={() => {
          setSearchQuery("")
          setStatusFilter("all")
        }}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
            <SelectItem value="overdue">Ueberfaellig</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Table */}
      <Card className="rounded-2xl border-border overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Rechnungsuebersicht</CardTitle>
          <CardDescription>
            {filteredInvoices.length} von {localInvoices.length} Rechnungen
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Rechnungsnr.</TableHead>
                  <TableHead className="font-semibold">Kunde</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Datum</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Faellig</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Betrag</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Keine Rechnungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {invoice.customer?.first_name} {invoice.customer?.last_name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {format(new Date(invoice.created_at), "dd.MM.yyyy", { locale: de })}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {format(new Date(invoice.due_date), "dd.MM.yyyy", { locale: de })}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {safeNumber(invoice.total_amount || 0).toFixed(2)} EUR
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDetailsInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {detailsInvoice && (
        <InvoiceDetailsDialog
          invoice={detailsInvoice}
          open={!!detailsInvoice}
          onOpenChange={(open) => !open && setDetailsInvoice(null)}
          onUpdate={(updated) => {
            setLocalInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
            setDetailsInvoice(updated)
          }}
        />
      )}
    </div>
  )
}
