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
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { EditBookingDialog } from "./EditBookingDialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { safeNumber } from "@/lib/utils/safe-number"

interface Booking {
  id: string
  company_id: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  status: string
  price: number
  passengers: number
  notes?: string
  customer_id: string
  customer: {
    first_name: string
    last_name: string
  }
  driver?: {
    first_name: string
    last_name: string
  }
}

interface BookingsTableProps {
  bookings: Booking[]
}

const statusConfig = {
  pending: { label: "Ausstehend", variant: "secondary" as const },
  confirmed: { label: "Bestätigt", variant: "default" as const },
  assigned: { label: "Zugewiesen", variant: "default" as const },
  in_progress: { label: "Unterwegs", variant: "default" as const },
  completed: { label: "Abgeschlossen", variant: "default" as const },
  cancelled: { label: "Storniert", variant: "destructive" as const },
}

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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
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

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteBookingId) return

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", deleteBookingId)

      if (error) throw error

      toast.success("Auftrag erfolgreich gelöscht")
      setDeleteBookingId(null)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting booking:", error)
      toast.error("Fehler beim Löschen des Auftrags")
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum & Uhrzeit</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Von</TableHead>
            <TableHead>Nach</TableHead>
            <TableHead>Fahrer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Preis</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Noch keine Aufträge vorhanden
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {format(new Date(booking.pickup_time), "dd.MM.yyyy HH:mm", { locale: de })}
                </TableCell>
                <TableCell>
                  {booking.customer.first_name} {booking.customer.last_name}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{booking.pickup_address}</TableCell>
                <TableCell className="max-w-[200px] truncate">{booking.dropoff_address}</TableCell>
                <TableCell>
                  {booking.driver ? `${booking.driver.first_name} ${booking.driver.last_name}` : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[booking.status as keyof typeof statusConfig]?.variant}>
                    {statusConfig[booking.status as keyof typeof statusConfig]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {booking.price ? `${safeNumber(booking.price).toFixed(2)} €` : "-"}
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
                      <DropdownMenuItem onClick={() => setEditBooking(booking)}>
                        <EditIcon className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteBookingId(booking.id)}>
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editBooking && (
        <EditBookingDialog
          booking={editBooking}
          open={!!editBooking}
          onOpenChange={(open) => !open && setEditBooking(null)}
        />
      )}

      <AlertDialog open={!!deleteBookingId} onOpenChange={(open) => !open && setDeleteBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Auftrag wird permanent gelöscht.
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
