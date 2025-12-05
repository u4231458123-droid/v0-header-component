"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddressAutocomplete, type GeocodingResult } from "@/components/maps/AddressAutocomplete"

interface NewCustomerDialogProps {
  companyId: string | null
  onCustomerCreated?: (customer: any) => void
}

const PlusIcon = () => (
  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const SALUTATION_OPTIONS = [
  { value: "Herr", label: "Herr" },
  { value: "Frau", label: "Frau" },
  { value: "Divers", label: "Divers" },
]

const ADDRESS_TYPE_OPTIONS = [
  { value: "private", label: "Privat" },
  { value: "business", label: "Geschäftlich" },
]

export function NewCustomerDialog({ companyId, onCustomerCreated }: NewCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form state - ALLE Felder
  const [salutation, setSalutation] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [addressType, setAddressType] = useState("private")
  const [companyName, setCompanyName] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [notes, setNotes] = useState("")

  const resetForm = () => {
    setSalutation("")
    setFirstName("")
    setLastName("")
    setPhone("")
    setMobile("")
    setEmail("")
    setAddressType("private")
    setCompanyName("")
    setAddress("")
    setPostalCode("")
    setCity("")
    setNotes("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!salutation || !firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error("Bitte fuellen Sie alle Pflichtfelder aus (Anrede, Vorname, Nachname, Telefon)")
      return
    }

    if (addressType === "business" && !companyName.trim()) {
      toast.error("Bitte geben Sie einen Firmenname ein", {
        description: "Bei Geschäftskunden ist der Firmenname erforderlich.",
        duration: 4000,
      })
      return
    }

    if (!companyId) {
      toast.error("Keine Firma zugeordnet", {
        description: "Bitte wählen Sie eine Firma aus.",
        duration: 4000,
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          company_id: companyId,
          salutation: salutation || null,
          first_name: firstName.trim(),
          last_name: lastName.trim().toUpperCase(),
          phone: phone.trim(),
          mobile: mobile.trim() || null,
          email: email.trim() || null,
          address_type: addressType || "private",
          company_name: companyName.trim() || null,
          address: address.trim() || null,
          postal_code: postalCode.trim() || null,
          city: city.trim() || null,
          notes: notes.trim() || null,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Kunde erfolgreich hinzugefügt", {
        description: "Der Kunde wurde in Ihr System aufgenommen und kann nun zugewiesen werden.",
        duration: 4000,
      })
      onCustomerCreated?.(data)
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || "Fehler beim Hinzufügen des Kunden", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSelect = (result: GeocodingResult) => {
    setAddress(result.formattedAddress)
    if (result.components?.postalCode) {
      setPostalCode(result.components.postalCode)
    }
    if (result.components?.city) {
      setCity(result.components.city)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Neuer Kunde
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Kunden hinzufuegen</DialogTitle>
          <DialogDescription>Erfassen Sie die Basisdaten des Kunden</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-5">
            {/* Adresstyp */}
            <div className="grid gap-2">
              <Label>Kundentyp</Label>
              <Select value={addressType} onValueChange={setAddressType}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen" />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Firmenname bei Geschaeftskunden */}
            {addressType === "business" && (
              <div className="grid gap-2">
                <Label htmlFor="company_name">Firmenname *</Label>
                <Input
                  id="company_name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Musterfirma GmbH"
                  required
                />
              </div>
            )}

            {/* Anrede, Vorname, Nachname */}
            <div className="grid grid-cols-3 gap-5">
              <div className="grid gap-2">
                <Label>Anrede *</Label>
                <Select value={salutation} onValueChange={setSalutation} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALUTATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="first_name">Vorname *</Label>
                <Input id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">NACHNAME *</Label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.toUpperCase())}
                  className="uppercase"
                  required
                />
              </div>
            </div>

            {/* Telefon, Mobil und E-Mail */}
            <div className="grid grid-cols-3 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 123 456789"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobil</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+49 170 1234567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kunde@beispiel.de"
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <AddressAutocomplete
                id="address"
                value={address}
                onChange={setAddress}
                onSelect={handleAddressSelect}
                placeholder="Strasse und Hausnummer"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input
                  id="postal_code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Ort</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Berlin" />
              </div>
            </div>

            {/* Notizen */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="z.B. Stammkunde, bevorzugte Abholzeiten..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Wird hinzugefuegt..." : "Kunde hinzufuegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
