"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"
import { SALUTATION_OPTIONS, formatPhoneNumber } from "@/lib/form-constants"

interface Employee {
  id: string
  company_id?: string
  email: string
  full_name?: string
  role?: string
  phone?: string
  phone_mobile?: string
  salutation?: string
  title?: string
  date_of_birth?: string
  nationality?: string
  address_data?: {
    street?: string
    house_number?: string
    postal_code?: string
    city?: string
    country?: string
  }
  employment_data?: {
    start_date?: string
    contract_type?: string
    department?: string
    position?: string
    working_hours?: number
    hourly_rate?: number
    monthly_salary?: number
  }
}

interface EditEmployeeDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (employee: Employee) => void
}

export function EditEmployeeDialog({ employee, open, onOpenChange, onSuccess }: EditEmployeeDialogProps) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Persönliche Daten
  const [salutation, setSalutation] = useState(employee.salutation || "")
  const [title, setTitle] = useState(employee.title || "")
  const [fullName, setFullName] = useState(employee.full_name || "")
  const [email, setEmail] = useState(employee.email || "")
  const [phone, setPhone] = useState(employee.phone || "")
  const [phoneMobile, setPhoneMobile] = useState(employee.phone_mobile || "")
  const [dateOfBirth, setDateOfBirth] = useState(employee.date_of_birth || "")
  const [nationality, setNationality] = useState(employee.nationality || "")
  const [role, setRole] = useState(employee.role || "user")

  // Adresse
  const [street, setStreet] = useState(employee.address_data?.street || "")
  const [houseNumber, setHouseNumber] = useState(employee.address_data?.house_number || "")
  const [postalCode, setPostalCode] = useState(employee.address_data?.postal_code || "")
  const [city, setCity] = useState(employee.address_data?.city || "")

  // Beschäftigung
  const [contractType, setContractType] = useState(employee.employment_data?.contract_type || "full-time")
  const [startDate, setStartDate] = useState(employee.employment_data?.start_date || "")
  const [department, setDepartment] = useState(employee.employment_data?.department || "")
  const [position, setPosition] = useState(employee.employment_data?.position || "")
  const [workingHours, setWorkingHours] = useState(employee.employment_data?.working_hours?.toString() || "")
  const [hourlyRate, setHourlyRate] = useState(employee.employment_data?.hourly_rate?.toString() || "")
  const [monthlySalary, setMonthlySalary] = useState(employee.employment_data?.monthly_salary?.toString() || "")

  // Update state when employee prop changes
  useEffect(() => {
    setSalutation(employee.salutation || "")
    setTitle(employee.title || "")
    setFullName(employee.full_name || "")
    setEmail(employee.email || "")
    setPhone(employee.phone || "")
    setPhoneMobile(employee.phone_mobile || "")
    setDateOfBirth(employee.date_of_birth || "")
    setNationality(employee.nationality || "")
    setRole(employee.role || "user")
    setStreet(employee.address_data?.street || "")
    setHouseNumber(employee.address_data?.house_number || "")
    setPostalCode(employee.address_data?.postal_code || "")
    setCity(employee.address_data?.city || "")
    setContractType(employee.employment_data?.contract_type || "full-time")
    setStartDate(employee.employment_data?.start_date || "")
    setDepartment(employee.employment_data?.department || "")
    setPosition(employee.employment_data?.position || "")
    setWorkingHours(employee.employment_data?.working_hours?.toString() || "")
    setHourlyRate(employee.employment_data?.hourly_rate?.toString() || "")
    setMonthlySalary(employee.employment_data?.monthly_salary?.toString() || "")
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData: any = {
        salutation: salutation || null,
        title: title || null,
        full_name: fullName || null,
        email: email || null,
        phone: phone || null,
        phone_mobile: phoneMobile || null,
        date_of_birth: dateOfBirth || null,
        nationality: nationality || null,
        role: role || "user",
        address_data: {
          street: street || "",
          house_number: houseNumber || "",
          postal_code: postalCode || "",
          city: city || "",
          country: "Deutschland",
        },
        employment_data: {
          start_date: startDate || null,
          contract_type: contractType || "full-time",
          department: department || "",
          position: position || "",
          working_hours: workingHours ? parseFloat(workingHours) : null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          monthly_salary: monthlySalary ? parseFloat(monthlySalary) : null,
        },
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("profiles").update(updateData).eq("id", employee.id).select().single()

      if (error) throw error

      toast.success("Mitarbeiter erfolgreich aktualisiert")
      onOpenChange(false)

      if (onSuccess && data) {
        onSuccess(data)
      }
    } catch (error: any) {
      console.error("Error updating employee:", error)
      toast.error(error.message || "Fehler beim Aktualisieren des Mitarbeiters")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
          <DialogDescription>Aktualisieren Sie alle Daten des Mitarbeiters.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Persönlich</TabsTrigger>
              <TabsTrigger value="address">Anschrift</TabsTrigger>
              <TabsTrigger value="employment">Beschäftigung</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="salutation">Anrede</Label>
                  <Select value={salutation} onValueChange={setSalutation}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALUTATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dr., Prof."
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="fullName">Vollständiger Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rolle</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Inhaber</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="dispatcher">Disponent</SelectItem>
                      <SelectItem value="user">Benutzer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon Nummer</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    maxLength={20}
                    placeholder="+49 170 1234567"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneMobile">Mobil Nummer</Label>
                  <Input
                    id="phoneMobile"
                    value={phoneMobile}
                    onChange={(e) => setPhoneMobile(formatPhoneNumber(e.target.value))}
                    maxLength={20}
                    placeholder="+49 170 1234567"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nationality">Nationalität</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="z.B. Deutsch"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="street">Adresse</Label>
                <AddressAutocomplete
                  id="street"
                  value={street}
                  onChange={setStreet}
                  onSelect={(result) => {
                    setStreet(result.formattedAddress)
                    if (result.components?.postalCode) {
                      setPostalCode(result.components.postalCode)
                    }
                    if (result.components?.city) {
                      setCity(result.components.city)
                    }
                  }}
                  placeholder="Straße und Hausnummer eingeben"
                />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div className="grid gap-2 col-span-1">
                  <Label htmlFor="houseNumber">Hausnummer</Label>
                  <Input
                    id="houseNumber"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="12"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 col-span-1">
                  <Label htmlFor="postalCode">PLZ</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    maxLength={5}
                    placeholder="12345"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 col-span-1">
                  <Label htmlFor="city">Ort</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Stadt"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="contractType">Vertragsart</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Vollzeit</SelectItem>
                      <SelectItem value="part-time">Teilzeit</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="contract">Vertrag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Beschäftigt seit</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="department">Abteilung</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="z.B. Disposition"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="z.B. Disponent"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="workingHours">Arbeitsstunden/Woche</Label>
                  <Input
                    id="workingHours"
                    type="number"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="40"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hourlyRate">Stundenlohn (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="15.00"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlySalary">Monatsgehalt (€)</Label>
                  <Input
                    id="monthlySalary"
                    type="number"
                    step="0.01"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    placeholder="3000.00"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

