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
import { EditVehicleDialog } from "@/components/drivers/EditVehicleDialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Vehicle {
  id: string
  license_plate: string
  make: string
  model: string
  year?: number
  color?: string
  seats: number
  status: string
}

interface VehiclesTableProps {
  vehicles: Vehicle[]
}

const statusConfig = {
  available: { label: "Verfügbar", variant: "default" as const },
  in_use: { label: "Im Einsatz", variant: "secondary" as const },
  maintenance: { label: "Wartung", variant: "outline" as const },
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
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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

export function VehiclesTable({ vehicles }: VehiclesTableProps) {
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteVehicleId) return

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", deleteVehicleId)

      if (error) throw error

      toast.success("Fahrzeug erfolgreich gelöscht")
      setDeleteVehicleId(null)
      router.refresh()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      toast.error("Fehler beim Löschen des Fahrzeugs")
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kennzeichen</TableHead>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>Baujahr</TableHead>
            <TableHead>Farbe</TableHead>
            <TableHead>Sitze</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Noch keine Fahrzeuge vorhanden
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                <TableCell>
                  {vehicle.make} {vehicle.model}
                </TableCell>
                <TableCell>{vehicle.year || "-"}</TableCell>
                <TableCell>{vehicle.color || "-"}</TableCell>
                <TableCell>{vehicle.seats}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[vehicle.status as keyof typeof statusConfig]?.variant}>
                    {statusConfig[vehicle.status as keyof typeof statusConfig]?.label}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => setEditVehicle(vehicle)}>
                        <EditIcon className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteVehicleId(vehicle.id)}>
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

      {editVehicle && (
        <EditVehicleDialog
          vehicle={editVehicle}
          open={!!editVehicle}
          onOpenChange={(open) => !open && setEditVehicle(null)}
        />
      )}

      <AlertDialog open={!!deleteVehicleId} onOpenChange={(open) => !open && setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fahrzeug löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Fahrzeug wird permanent gelöscht.
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
