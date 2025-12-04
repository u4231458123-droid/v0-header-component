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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SALUTATION_OPTIONS, formatPhoneNumber } from "@/lib/form-constants"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"
import { Loader2 } from "lucide-react"

interface NewEmployeeDialogProps {
  companyId: string
  currentUserId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (employee: any) => void
}

const ROLE_OPTIONS = [
  { value: "user", label: "Benutzer", description: "Kann Buchungen und Fahrten verwalten" },
  { value: "dispatcher", label: "Disponent", description: "Kann Fahrer und Fahrzeuge zuweisen" },
  { value: "admin", label: "Administrator", description: "Voller Zugriff auf alle Funktionen" },
]

const CONTRACT_TYPE_OPTIONS = [
  { value: "full-time", label: "Vollzeit" },
  { value: "part-time", label: "Teilzeit" },
  { value: "contractor", label: "Freelancer" },
  { value: "intern", label: "Praktikant" },
]

export function NewEmployeeDialog({
  companyId,
  currentUserId,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
}: NewEmployeeDialogProps) {
  const [open, setOpen] = useState(externalOpen ?? false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isControlled = externalOpen !== undefined && externalOnOpenChange !== undefined
  const dialogOpen = isControlled ? externalOpen : open
  const setDialogOpen = isControlled ? externalOnOpenChange : setOpen

  // Persönliche Daten
  const [salutation, setSalutation] = useState("")
  const [title, setTitle] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [nationality, setNationality] = useState("")

  // Kontakt
  const [phone, setPhone] = useState("")
  const [phoneMobile, setPhoneMobile] = useState("")

  // Adresse
  const [street, setStreet] = useState("")
  const [houseNumber, setHouseNumber] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Deutschland")

  // Beschäftigung
  const [role, setRole] = useState("user")
  const [contractType, setContractType] = useState("full-time")
  const [startDate, setStartDate] = useState("")
  const [department, setDepartment] = useState("")
  const [position, setPosition] = useState("")
  const [workingHours, setWorkingHours] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [monthlySalary, setMonthlySalary] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setSalutation("")
    setTitle("")
    setFullName("")
    setEmail("")
    setDateOfBirth("")
    setNationality("")
    setPhone("")
    setPhoneMobile("")
    setStreet("")
    setHouseNumber("")
    setPostalCode("")
    setCity("")
    setCountry("Deutschland")
    setRole("user")
    setContractType("full-time")
    setStartDate("")
    setDepartment("")
    setPosition("")
    setWorkingHours("")
    setHourlyRate("")
    setMonthlySalary("")
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!salutation) newErrors.salutation = "Anrede ist erforderlich"
    if (!fullName) newErrors.fullName = "Name ist erforderlich"
    if (!email) newErrors.email = "E-Mail ist erforderlich"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) newErrors.email = "Ungültige E-Mail-Adresse"
    if (!phone && !phoneMobile) newErrors.phone = "Mindestens eine Telefonnummer ist erforderlich"
    if (!role) newErrors.role = "Rolle ist erforderlich"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus")
      return
    }

    setLoading(true)

    try {
      // 1. Erstelle Profil in profiles (ohne user_id, da noch kein Auth-User existiert)
      const profileData = {
        email: email.toLowerCase(),
        full_name: fullName,
        company_id: companyId,
        role: role,
        salutation: salutation || null,
        title: title || null,
        phone: phone || null,
        phone_mobile: phoneMobile || null,
        date_of_birth: dateOfBirth || null,
        nationality: nationality || "deutsch",
        address_data: {
          street: street || "",
          house_number: houseNumber || "",
          postal_code: postalCode || "",
          city: city || "",
          country: country || "Deutschland",
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
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        // Wenn Profil bereits existiert (E-Mail bereits vorhanden), verwende es
        if (profileError.code === "23505") {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email.toLowerCase())
            .single()

          if (existingProfile) {
            // Aktualisiere bestehendes Profil
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update({
                ...profileData,
                company_id: companyId,
                role: role,
              })
              .eq("id", existingProfile.id)
              .select()
              .single()

            if (updateError) throw updateError

            // Erstelle Einladung
            await createInvitation(updatedProfile.id, email.toLowerCase(), role)
            toast.success("Mitarbeiter erfolgreich eingeladen")
            setDialogOpen(false)
            resetForm()
            if (onSuccess) onSuccess(updatedProfile)
            router.refresh()
            return
          }
        }
        throw profileError
      }

      // 2. Erstelle Einladung
      await createInvitation(profile.id, email.toLowerCase(), role)

      // 3. Log Activity
      await supabase.from("activity_log").insert({
        company_id: companyId,
        user_id: currentUserId,
        action: "create",
        entity_type: "employee",
        entity_name: fullName || email,
        details: { role, email },
      })

      toast.success("Mitarbeiter erfolgreich eingeladen")
      setDialogOpen(false)
      resetForm()
      if (onSuccess) onSuccess(profile)
      router.refresh()
    } catch (error: any) {
      console.error("Error creating employee:", error)
      toast.error(error.message || "Fehler beim Erstellen des Mitarbeiters")
    } finally {
      setLoading(false)
    }
  }

  const createInvitation = async (profileId: string, email: string, role: string) => {
    // Generate unique token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Erstelle Einladung in team_invitations
    const { error: inviteError } = await supabase.from("team_invitations").insert({
      company_id: companyId,
      email: email.toLowerCase(),
      role: role,
      token: token,
      invited_by: currentUserId,
      expires_at: expiresAt.toISOString(),
    })

    if (inviteError) throw inviteError

    // Sende E-Mail-Einladung
    const emailResponse = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        role: role,
        companyId,
        token,
      }),
    })

    if (!emailResponse.ok) {
      console.error("Failed to send invitation email")
      // Einladung wurde erstellt, aber E-Mail konnte nicht gesendet werden
      // Das ist nicht kritisch, da der Link auch manuell geteilt werden kann
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team-Mitglied einladen</DialogTitle>
          <DialogDescription>
            Erfassen Sie alle Daten des neuen Mitarbeiters. Nach der Anlage wird eine Einladungs-E-Mail versendet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Persönliche Daten</TabsTrigger>
              <TabsTrigger value="contact">Kontakt</TabsTrigger>
              <TabsTrigger value="address">Adresse</TabsTrigger>
              <TabsTrigger value="employment">Beschäftigung</TabsTrigger>
            </TabsList>

            {/* Tab 1: Persönliche Daten */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salutation">
                    Anrede <span className="text-destructive">*</span>
                  </Label>
                  <Select value={salutation} onValueChange={setSalutation}>
                    <SelectTrigger id="salutation">
                      <SelectValue placeholder="Anrede wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALUTATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.salutation && <p className="text-sm text-destructive">{errors.salutation}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dr., Prof., etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Vollständiger Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Max Mustermann"
                  required
                />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-Mail-Adresse <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mitarbeiter@example.com"
                  required
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationalität</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="deutsch"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Kontakt */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneMobile">Mobiltelefon</Label>
                  <Input
                    id="phoneMobile"
                    type="tel"
                    value={phoneMobile}
                    onChange={(e) => setPhoneMobile(formatPhoneNumber(e.target.value))}
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </TabsContent>

            {/* Tab 3: Adresse */}
            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="address">Straße und Hausnummer</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Straße"
                    className="col-span-2"
                  />
                  <Input
                    id="houseNumber"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="Nr."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postleitzahl</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Berlin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Deutschland"
                />
              </div>
            </TabsContent>

            {/* Tab 4: Beschäftigung */}
            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Rolle <span className="text-destructive">*</span>
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <p className="font-medium">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractType">Vertragsart</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger id="contractType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Beschäftigungsbeginn</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Abteilung</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="z.B. Disposition"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="z.B. Disponent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Arbeitsstunden/Woche</Label>
                  <Input
                    id="workingHours"
                    type="number"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Stundenlohn (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="15.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlySalary">Monatsgehalt (€)</Label>
                  <Input
                    id="monthlySalary"
                    type="number"
                    step="0.01"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    placeholder="3000.00"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Mitarbeiter einladen"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

