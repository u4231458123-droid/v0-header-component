"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { StatsCard } from "@/components/design-system/StatsCard"
import { FilterBar } from "@/components/design-system/FilterBar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewInvoiceDialog } from "@/components/invoices/NewInvoiceDialog"
import { NewQuoteDialog } from "@/components/finanzen/NewQuoteDialog"
import { CashBookDialog } from "@/components/finanzen/CashBookDialog"
import {
  Euro,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Download,
  FileText,
  Send,
  ArrowRightLeft,
  Wallet,
  BookOpen,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { safeNumber } from "@/lib/utils/safe-number"

interface FinanzenPageClientProps {
  invoices?: any[]
  quotes?: any[]
  cashBookEntries?: any[]
  customers?: any[]
  bookings?: any[]
  company?: any
  companyId?: string | null
}

type FinanceTab = "invoices" | "quotes" | "cashbook"

export function FinanzenPageClient({
  invoices = [],
  quotes = [],
  cashBookEntries = [],
  customers = [],
  bookings = [],
  company = null,
  companyId = null,
}: FinanzenPageClientProps) {
  const [activeTab, setActiveTab] = useState<FinanceTab>("invoices")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [localInvoices, setLocalInvoices] = useState(invoices || [])
  const [localQuotes, setLocalQuotes] = useState(quotes || [])
  const [localCashBookEntries, setLocalCashBookEntries] = useState(cashBookEntries || [])

  const supabase = createClient()

  // Invoice Stats
  const invoiceStats = useMemo(() => {
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

    // Sparkline data (last 7 days revenue)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayRevenue = localInvoices
        .filter((inv) => {
          const invDate = new Date(inv.created_at)
          return invDate.toDateString() === date.toDateString() && inv.status === "paid"
        })
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
      return dayRevenue
    })

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      paidCount,
      pendingCount,
      overdueRevenue,
      overdueCount,
      sparkline: last7Days,
    }
  }, [localInvoices])

  // Quote Stats
  const quoteStats = useMemo(() => {
    const totalQuotes = localQuotes.length
    const sentQuotes = localQuotes.filter((q) => q.status === "sent").length
    const acceptedQuotes = localQuotes.filter((q) => q.status === "accepted").length
    const totalValue = localQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0)
    const acceptedValue = localQuotes
      .filter((q) => q.status === "accepted")
      .reduce((sum, q) => sum + (q.total_amount || 0), 0)

    return { totalQuotes, sentQuotes, acceptedQuotes, totalValue, acceptedValue }
  }, [localQuotes])

  // Cash Book Stats
  const cashBookStats = useMemo(() => {
    const totalIncome = localCashBookEntries
      .filter((e) => e.entry_type === "income" && !e.is_cancelled)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    const totalExpense = localCashBookEntries
      .filter((e) => e.entry_type === "expense" && !e.is_cancelled)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    const balance = totalIncome - totalExpense
    const entriesCount = localCashBookEntries.filter((e) => !e.is_cancelled).length

    return { totalIncome, totalExpense, balance, entriesCount }
  }, [localCashBookEntries])

  // Filter Invoices
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

  // Filter Quotes
  const filteredQuotes = useMemo(() => {
    return localQuotes.filter((quote) => {
      const matchesSearch =
        searchQuery === "" ||
        quote.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || quote.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [localQuotes, searchQuery, statusFilter])

  // Filter Cash Book
  const filteredCashBookEntries = useMemo(() => {
    return localCashBookEntries.filter((entry) => {
      const matchesSearch =
        searchQuery === "" ||
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.entry_number?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        entry.entry_type === statusFilter ||
        (statusFilter === "cancelled" && entry.is_cancelled)

      return matchesSearch && matchesStatus
    })
  }, [localCashBookEntries, searchQuery, statusFilter])

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all"

  // Status Badge - Using only design system colors
  const getInvoiceStatusBadge = (invoice: any) => {
    const isOverdue = invoice.status === "pending" && new Date(invoice.due_date) < new Date()
    if (isOverdue) {
      return <Badge variant="destructive">Überfällig</Badge>
    }
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      pending: { label: "Ausstehend", variant: "secondary" },
      paid: { label: "Bezahlt", variant: "default" },
      cancelled: { label: "Storniert", variant: "outline" },
    }
    const c = config[invoice.status] || config.pending
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const getQuoteStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      draft: { label: "Entwurf", variant: "outline" },
      sent: { label: "Gesendet", variant: "secondary" },
      accepted: { label: "Angenommen", variant: "default" },
      rejected: { label: "Abgelehnt", variant: "destructive" },
      expired: { label: "Abgelaufen", variant: "outline" },
      converted: { label: "In Rechnung", variant: "default" },
    }
    const c = config[status] || config.draft
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

  const renderStats = useMemo(() => {
    switch (activeTab) {
      case "invoices":
        return (
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4" key="invoices-stats">
            <StatsCard
              title="Gesamtumsatz"
              value={`${safeNumber(invoiceStats.totalRevenue).toFixed(2)} €`}
              subtitle={`${localInvoices.length} Rechnungen gesamt`}
              icon={<Euro className="h-5 w-5 text-primary" />}
              sparklineData={invoiceStats.sparkline}
              onClick={() => setStatusFilter("all")}
            />
            <StatsCard
              title="Bezahlt"
              value={`${safeNumber(invoiceStats.paidRevenue).toFixed(2)} €`}
              subtitle={`${invoiceStats.paidCount} bezahlte Rechnungen`}
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              onClick={() => setStatusFilter("paid")}
            />
            <StatsCard
              title="Ausstehend"
              value={`${safeNumber(invoiceStats.pendingRevenue).toFixed(2)} €`}
              subtitle={`${invoiceStats.pendingCount} offene Rechnungen`}
              icon={<Clock className="h-5 w-5 text-primary" />}
              onClick={() => setStatusFilter("pending")}
            />
            <StatsCard
              title="Überfällig"
              value={`${safeNumber(invoiceStats.overdueRevenue).toFixed(2)} €`}
              subtitle={`${invoiceStats.overdueCount} überfällige Rechnungen`}
              icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
              variant={invoiceStats.overdueCount > 0 ? "warning" : "default"}
              onClick={() => setStatusFilter("overdue")}
            />
          </div>
        )
      case "quotes":
        return (
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4" key="quotes-stats">
            <StatsCard
              title="Angebote Gesamt"
              value={quoteStats.totalQuotes}
              subtitle={`Gesamtwert: ${safeNumber(quoteStats.totalValue).toFixed(2)} €`}
              icon={<FileText className="h-5 w-5 text-primary" />}
            />
            <StatsCard
              title="Versendet"
              value={quoteStats.sentQuotes}
              subtitle="Warten auf Antwort"
              icon={<Send className="h-5 w-5 text-primary" />}
              onClick={() => setStatusFilter("sent")}
            />
            <StatsCard
              title="Angenommen"
              value={quoteStats.acceptedQuotes}
              subtitle={`${safeNumber(quoteStats.acceptedValue).toFixed(2)} € Auftragsvolumen`}
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              onClick={() => setStatusFilter("accepted")}
            />
            <StatsCard
              title="Konversionsrate"
              value={
                quoteStats.totalQuotes > 0
                  ? `${Math.round((quoteStats.acceptedQuotes / quoteStats.totalQuotes) * 100)}%`
                  : "0%"
              }
              subtitle="Angenommene Angebote"
              icon={<ArrowRightLeft className="h-5 w-5 text-primary" />}
            />
          </div>
        )
      case "cashbook":
        return (
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4" key="cashbook-stats">
            <StatsCard
              title="Kassenbestand"
              value={`${safeNumber(cashBookStats.balance).toFixed(2)} €`}
              subtitle={`${cashBookStats.entriesCount} Buchungen`}
              icon={<Wallet className="h-5 w-5 text-primary" />}
            />
            <StatsCard
              title="Einnahmen"
              value={`${safeNumber(cashBookStats.totalIncome).toFixed(2)} €`}
              subtitle="Gesamte Bareinnahmen"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              onClick={() => setStatusFilter("income")}
            />
            <StatsCard
              title="Ausgaben"
              value={`${safeNumber(cashBookStats.totalExpense).toFixed(2)} €`}
              subtitle="Gesamte Barausgaben"
              icon={<TrendingDown className="h-5 w-5 text-primary" />}
              onClick={() => setStatusFilter("expense")}
            />
            <StatsCard
              title="Buchungen Heute"
              value={
                localCashBookEntries.filter((e) => {
                  const today = new Date().toISOString().split("T")[0]
                  return e.entry_date === today && !e.is_cancelled
                }).length
              }
              subtitle="Aktuelle Buchungen"
              icon={<BookOpen className="h-5 w-5 text-primary" />}
            />
          </div>
        )
      default:
        return null
    }
  }, [activeTab, invoiceStats, quoteStats, cashBookStats, localInvoices.length, localCashBookEntries])

  const renderContent = () => {
    switch (activeTab) {
      case "invoices":
        return (
          <Card className="rounded-2xl border-border overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Rechnungsübersicht</CardTitle>
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
                      <TableHead className="font-semibold hidden sm:table-cell">Fällig</TableHead>
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
                            {invoice.customer?.salutation} {invoice.customer?.first_name} {invoice.customer?.last_name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {format(new Date(invoice.created_at), "dd.MM.yyyy", { locale: de })}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {format(new Date(invoice.due_date), "dd.MM.yyyy", { locale: de })}
                          </TableCell>
                          <TableCell>{getInvoiceStatusBadge(invoice)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {safeNumber(invoice.total_amount || 0).toFixed(2)} €
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {invoice.status === "pending" && (
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Als bezahlt markieren
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Per E-Mail senden
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  PDF herunterladen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )

      case "quotes":
        return (
          <Card className="rounded-2xl border-border overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Angebotsübersicht</CardTitle>
              <CardDescription>
                {filteredQuotes.length} von {localQuotes.length} Angeboten
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Angebotsnr.</TableHead>
                      <TableHead className="font-semibold">Kunde</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Erstellt</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Gültig bis</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Betrag</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          {localQuotes.length === 0
                            ? "Noch keine Angebote erstellt. Erstellen Sie Ihr erstes Angebot!"
                            : "Keine Angebote gefunden"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotes.map((quote) => (
                        <TableRow key={quote.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{quote.quote_number}</TableCell>
                          <TableCell>
                            {quote.customer?.salutation} {quote.customer?.first_name} {quote.customer?.last_name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {format(new Date(quote.created_at), "dd.MM.yyyy", { locale: de })}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {quote.valid_until
                              ? format(new Date(quote.valid_until), "dd.MM.yyyy", { locale: de })
                              : "-"}
                          </TableCell>
                          <TableCell>{getQuoteStatusBadge(quote.status)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {safeNumber(quote.total_amount || 0).toFixed(2)} €
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Per E-Mail senden
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  PDF herunterladen
                                </DropdownMenuItem>
                                {quote.status === "accepted" && (
                                  <DropdownMenuItem>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    In Rechnung umwandeln
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )

      case "cashbook":
        return (
          <Card className="rounded-2xl border-border overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Kassenbuch</CardTitle>
              <CardDescription>
                {filteredCashBookEntries.length} Buchungen | Saldo: {safeNumber(cashBookStats.balance).toFixed(2)} €
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Beleg-Nr.</TableHead>
                      <TableHead className="font-semibold">Datum</TableHead>
                      <TableHead className="font-semibold">Buchungstext</TableHead>
                      <TableHead className="font-semibold text-right">Einnahme</TableHead>
                      <TableHead className="font-semibold text-right">Ausgabe</TableHead>
                      <TableHead className="font-semibold text-right">Saldo</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCashBookEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          {localCashBookEntries.length === 0
                            ? "Noch keine Kassenbucheinträge. Erfassen Sie Ihre erste Buchung!"
                            : "Keine Buchungen gefunden"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCashBookEntries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className={`hover:bg-muted/30 ${entry.is_cancelled ? "opacity-50 line-through" : ""}`}
                        >
                          <TableCell className="font-mono text-sm">{entry.entry_number}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(entry.entry_date), "dd.MM.yyyy", { locale: de })}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.entry_type === "income" ? `${safeNumber(entry.amount).toFixed(2)} €` : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.entry_type === "expense" ? `${safeNumber(entry.amount).toFixed(2)} €` : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {safeNumber(entry.balance_after).toFixed(2)} €
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Beleg anzeigen
                                </DropdownMenuItem>
                                {!entry.is_cancelled && (
                                  <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  const getStatusOptions = () => {
    switch (activeTab) {
      case "invoices":
        return (
          <>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
            <SelectItem value="overdue">Überfällig</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
          </>
        )
      case "quotes":
        return (
          <>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="sent">Gesendet</SelectItem>
            <SelectItem value="accepted">Angenommen</SelectItem>
            <SelectItem value="rejected">Abgelehnt</SelectItem>
            <SelectItem value="expired">Abgelaufen</SelectItem>
            <SelectItem value="converted">In Rechnung</SelectItem>
          </>
        )
      case "cashbook":
        return (
          <>
            <SelectItem value="all">Alle Buchungen</SelectItem>
            <SelectItem value="income">Einnahmen</SelectItem>
            <SelectItem value="expense">Ausgaben</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
          </>
        )
    }
  }

  const renderActionButton = () => {
    switch (activeTab) {
      case "invoices":
        return <NewInvoiceDialog companyId={companyId} customers={customers} bookings={bookings} />
      case "quotes":
        return (
          <NewQuoteDialog
            companyId={companyId}
            customers={customers}
            bookings={bookings}
            company={company}
            onSuccess={(newQuote) => setLocalQuotes((prev) => [newQuote, ...prev])}
          />
        )
      case "cashbook":
        return (
          <CashBookDialog
            companyId={companyId}
            currentBalance={cashBookStats.balance}
            onSuccess={(newEntry) => setLocalCashBookEntries((prev) => [newEntry, ...prev])}
          />
        )
    }
  }

  return (
    <div className="space-y-5 min-h-[calc(100vh-200px)]">
      {/* Header mit Tab-Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Finanzen</h1>
            <p className="text-sm text-muted-foreground mt-1">Rechnungen, Angebote und Kassenbuch verwalten</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab-Switcher im Header */}
          <div className="flex items-center bg-muted rounded-xl p-1">
            <button
              onClick={() => {
                setActiveTab("invoices")
                setStatusFilter("all")
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "invoices"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Rechnungen</span>
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-md ${
                activeTab === "invoices"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}>
                {localInvoices.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("quotes")
                setStatusFilter("all")
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "quotes"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Angebote</span>
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-md ${
                activeTab === "quotes"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}>
                {localQuotes.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("cashbook")
                setStatusFilter("all")
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "cashbook"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Kassenbuch</span>
            </button>
          </div>

          {/* Action Button */}
          {renderActionButton()}
        </div>
      </div>

      {/* Stats Cards */}
      {renderStats}

      {/* Overdue Warning for Invoices - Using design system colors */}
      {activeTab === "invoices" && invoiceStats.overdueCount > 0 && (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{invoiceStats.overdueCount} überfällige Rechnung(en)</p>
              <p className="text-sm text-muted-foreground">
                Gesamtbetrag: {safeNumber(invoiceStats.overdueRevenue).toFixed(2)} €
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStatusFilter("overdue")} className="rounded-xl">
              Anzeigen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === "invoices"
            ? "Suche nach Rechnungsnummer oder Kunde..."
            : activeTab === "quotes"
              ? "Suche nach Angebotsnummer oder Kunde..."
              : "Suche nach Belegnummer oder Buchungstext..."
        }
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
          <SelectContent>{getStatusOptions()}</SelectContent>
        </Select>
      </FilterBar>

      {/* Content */}
      {renderContent()}
    </div>
  )
}
