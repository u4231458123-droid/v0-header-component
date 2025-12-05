"use client"

import { BookingDetailsDialog } from "@/components/bookings/BookingDetailsDialog"
import { CreateBookingDialog } from "@/components/bookings/CreateBookingDialog"
import { EditBookingDialog } from "@/components/bookings/EditBookingDialog"
import { FilterBar } from "@/components/design-system/FilterBar"
import { PageHeader } from "@/components/design-system/PageHeader"
import { StatsCard } from "@/components/design-system/StatsCard"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { safeNumber } from "@/lib/utils/safe-number"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { CheckCircle, ClipboardList, Clock, Euro, Eye, Plus, Truck } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

interface BookingsPageClientProps {
  bookings?: any[]
  drivers?: any[]
  vehicles?: any[]
  customers?: any[]
  companyId?: string | null
}

const fetchBookings = async (companyId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:customers (id, first_name, last_name, company_name),
      driver:drivers (id, first_name, last_name),
      vehicle:vehicles (id, license_plate, brand, model)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export function BookingsPageClient({
  bookings = [],
  drivers = [],
  vehicles = [],
  customers = [],
  companyId = null,
}: BookingsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editBooking, setEditBooking] = useState<any>(null)
  const [detailsBooking, setDetailsBooking] = useState<any>(null)
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null)

  const [localBookings, setLocalBookings] = useState(bookings)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchBookingsData = useCallback(async () => {
    if (!companyId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        customer:customers (id, first_name, last_name, company_name),
        driver:drivers (id, first_name, last_name),
        vehicle:vehicles (id, license_plate, brand, model)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
    if (!error && data) {
      setLocalBookings(data)
    }
  }, [companyId])

  const mutateBookings = useCallback(async () => {
    setIsRefreshing(true)
    await fetchBookingsData()
    setIsRefreshing(false)
  }, [fetchBookingsData])

  useEffect(() => {
    const interval = setInterval(mutateBookings, 30000)
    const handleFocus = () => mutateBookings()
    window.addEventListener("focus", handleFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
    }
  }, [mutateBookings])

  const supabase = createClient()

  const stats = useMemo(() => {
    const total = localBookings.length
    const pending = localBookings.filter((b) => b.status === "pending" || b.status === "confirmed").length
    const inProgress = localBookings.filter((b) => b.status === "assigned" || b.status === "in_progress").length
    const completed = localBookings.filter((b) => b.status === "completed").length
    const revenue = localBookings
      .filter((b) => b.status === "completed" && b.price)
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayBookings = localBookings.filter((b) => {
        const bookingDate = new Date(b.created_at)
        return bookingDate.toDateString() === date.toDateString()
      })
      return dayBookings.length
    })

    const last7DaysRevenue = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayRevenue = localBookings
        .filter((b) => {
          const bookingDate = new Date(b.created_at)
          return bookingDate.toDateString() === date.toDateString() && b.status === "completed"
        })
        .reduce((sum, b) => sum + (b.price || 0), 0)
      return dayRevenue
    })

    return {
      total,
      pending,
      inProgress,
      completed,
      revenue,
      sparklineTotal: last7Days,
      sparklineRevenue: last7DaysRevenue,
    }
  }, [localBookings])

  const filteredBookings = useMemo(() => {
    return localBookings.filter((booking) => {
      const matchesSearch =
        searchTerm === "" ||
        booking.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.dropoff_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [localBookings, searchTerm, statusFilter])

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all"

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: {
        label: "Ausstehend",
        variant: "secondary",
      },
      confirmed: { label: "Bestaetigt", variant: "default" },
      assigned: {
        label: "Zugewiesen",
        variant: "default",
      },
      in_progress: {
        label: "Unterwegs",
        variant: "default",
      },
      completed: {
        label: "Abgeschlossen",
        variant: "default",
      },
      cancelled: { label: "Storniert", variant: "destructive" },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId)
    if (!error) {
      mutateBookings()
    }
  }

  const handleDelete = async () => {
    if (!deleteBookingId) return
    const { error } = await supabase.from("bookings").delete().eq("id", deleteBookingId)
    if (!error) {
      mutateBookings()
      setDeleteBookingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Auftraege" description="Verwalten Sie alle Ihre Fahrauftraege">
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Neuer Auftrag
        </Button>
      </PageHeader>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Gesamt"
          value={stats.total}
          subtitle="Alle Auftraege"
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          sparklineData={stats.sparklineTotal}
        />
        <StatsCard
          title="Ausstehend"
          value={stats.pending}
          subtitle="Warten auf Bearbeitung"
          icon={<Clock className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Unterwegs"
          value={stats.inProgress}
          subtitle="Aktuell in Fahrt"
          icon={<Truck className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Abgeschlossen"
          value={stats.completed}
          subtitle="Erfolgreich beendet"
          icon={<CheckCircle className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Umsatz"
          value={`${safeNumber(stats.revenue).toFixed(2)} EUR`}
          subtitle="Gesamtumsatz"
          icon={<Euro className="h-5 w-5 text-primary" />}
          sparklineData={stats.sparklineRevenue}
        />
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Suche nach Adresse oder Kunde..."
        showReset={hasActiveFilters}
        onReset={() => {
          setSearchTerm("")
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
            <SelectItem value="confirmed">Bestaetigt</SelectItem>
            <SelectItem value="assigned">Zugewiesen</SelectItem>
            <SelectItem value="in_progress">Unterwegs</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Card className="rounded-2xl border-border overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Alle Auftraege</CardTitle>
          <CardDescription>
            {filteredBookings.length} von {localBookings.length} Auftraegen
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold w-20">ID</TableHead>
                  <TableHead className="font-semibold">Eingang</TableHead>
                  <TableHead className="font-semibold">Abholung</TableHead>
                  <TableHead className="font-semibold">Kunde</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Von</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Nach</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      {hasActiveFilters
                        ? "Keine Auftraege gefunden. Versuchen Sie andere Filterkriterien."
                        : "Noch keine Auftraege vorhanden."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const createdAt = booking.created_at ? new Date(booking.created_at) : null
                    const pickupTime = booking.pickup_time ? new Date(booking.pickup_time) : null
                    return (
                      <TableRow key={booking.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{booking.id.slice(0, 6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {createdAt ? format(createdAt, "dd.MM.yy", { locale: de }) : "-"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {createdAt ? format(createdAt, "HH:mm", { locale: de }) : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {pickupTime ? format(pickupTime, "dd.MM.yy", { locale: de }) : "-"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {pickupTime ? format(pickupTime, "HH:mm", { locale: de }) : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {booking.customer?.first_name}{" "}
                              <span className="uppercase">{booking.customer?.last_name}</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[150px] truncate text-sm text-muted-foreground">
                          {booking.pickup_address || "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[150px] truncate text-sm text-muted-foreground">
                          {booking.dropoff_address || "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setDetailsBooking(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateBookingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        companyId={companyId}
        customers={customers}
        drivers={drivers}
        vehicles={vehicles}
        onSuccess={() => mutateBookings()}
      />

      {editBooking && (
        <EditBookingDialog
          booking={editBooking}
          open={!!editBooking}
          onOpenChange={(open) => !open && setEditBooking(null)}
          onSuccess={() => {
            mutateBookings()
            setEditBooking(null)
          }}
        />
      )}

      {detailsBooking && (
        <BookingDetailsDialog
          booking={detailsBooking}
          open={!!detailsBooking}
          onOpenChange={(open) => !open && setDetailsBooking(null)}
        />
      )}

      <AlertDialog open={!!deleteBookingId} onOpenChange={(open) => !open && setDeleteBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftrag loeschen?</AlertDialogTitle>
            <AlertDialogDescription>Diese Aktion kann nicht rueckgaengig gemacht werden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Loeschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Default export für dynamische Imports
export default BookingsPageClient
