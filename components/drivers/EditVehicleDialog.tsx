"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface EditVehicleDialogProps {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updatedVehicle: Vehicle) => void
}

export function EditVehicleDialog({ vehicle, open, onOpenChange, onSuccess }: EditVehicleDialogProps) {
  const [licensePlate, setLicensePlate] = useState(vehicle.license_plate)
  const [make, setMake] = useState(vehicle.make)
  const [model, setModel] = useState(vehicle.model)
  const [year, setYear] = useState(vehicle.year?.toString() || "")
  const [color, setColor] = useState(vehicle.color || "")
  const [seats, setSeats] = useState(vehicle.seats.toString())
  const [status, setStatus] = useState(vehicle.status)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("vehicles")
        .update({
          license_plate: licensePlate,
          make,
          model,
          year: year ? Number.parseInt(year) : null,
          color: color || null,
          seats: Number.parseInt(seats),
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicle.id)

      if (error) throw error

      // Verwende dieselben Werte wie beim Supabase-Update für Konsistenz
      const yearValue = year ? Number.parseInt(year) : undefined
      const colorValue = color || undefined

      const updateData: Partial<Vehicle> = {
        license_plate: licensePlate,
        make,
        model,
        year: yearValue,
        color: colorValue,
        seats: Number.parseInt(seats),
        status,
      }

      toast.success("Fahrzeug erfolgreich aktualisiert", {
        description: "Die Änderungen wurden gespeichert und sind sofort sichtbar.",
        duration: 4000,
      })
      onOpenChange(false)
      router.refresh()
      if (onSuccess) {
        onSuccess({ ...vehicle, ...updateData } as Vehicle)
      }
    } catch (error) {
      console.error("Error updating vehicle:", error)
      toast.error("Fehler beim Aktualisieren des Fahrzeugs", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fahrzeug bearbeiten</DialogTitle>
          <DialogDescription>Aktualisieren Sie die Fahrzeugdaten.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Kennzeichen</Label>
            <Input
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="make">Marke</Label>
              <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modell</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="year">Baujahr</Label>
              <Input
                id="year"
                type="number"
                min="1990"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Farbe</Label>
              <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Sitze</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="50"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Verfuegbar</SelectItem>
                <SelectItem value="in_use">Im Einsatz</SelectItem>
                <SelectItem value="maintenance">Wartung</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}