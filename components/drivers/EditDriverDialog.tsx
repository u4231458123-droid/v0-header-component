"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LicenseClassSelector } from "./LicenseClassSelector"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"
import { SALUTATION_OPTIONS, formatPhoneNumber } from "@/lib/form-constants"

function UploadIcon({ className }: { className?: string }) {
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
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

interface Driver {
  id: string
  company_id?: string
  salutation?: string
  title?: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  mobile?: string
  date_of_birth?: string
  nationality?: string
  license_number: string
  license_expiry?: string
  license_classes?: string[]
  status: string
  address_data?: {
    street?: string
    postal_code?: string
    city?: string
    country?: string
  }
  license_data?: {
    license_number?: string
    license_classes?: string[]
    issue_date?: string
    expiry_date?: string
    issuing_authority?: string
  }
  pbef_data?: {
    number?: string
    issue_date?: string
    expiry_date?: string
    issuing_authority?: string
  }
  employment_data?: {
    type?: string
    start_date?: string
    end_date?: string
    contract_type?: string
  }
}

interface EditDriverDialogProps {
  driver: Driver
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (driver: Driver) => void
}

export function EditDriverDialog({ driver, open, onOpenChange, onSuccess }: EditDriverDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [pbefFile, setPbefFile] = useState<File | null>(null)
  const licenseFileRef = useRef<HTMLInputElement>(null)
  const pbefFileRef = useRef<HTMLInputElement>(null)

  // Persoenliche Daten
  const [salutation, setSalutation] = useState(driver.salutation || "")
  const [title, setTitle] = useState(driver.title || "")
  const [firstName, setFirstName] = useState(driver.first_name)
  const [lastName, setLastName] = useState(driver.last_name)
  const [email, setEmail] = useState(driver.email || "")
  const [phone, setPhone] = useState(driver.phone)
  const [mobile, setMobile] = useState(driver.mobile || "")
  const [dateOfBirth, setDateOfBirth] = useState(driver.date_of_birth || "")
  const [nationality, setNationality] = useState(driver.nationality || "")
  const [status, setStatus] = useState(driver.status)

  // Adresse
  const [street, setStreet] = useState(driver.address_data?.street || "")
  const [postalCode, setPostalCode] = useState(driver.address_data?.postal_code || "")
  const [city, setCity] = useState(driver.address_data?.city || "")

  // Fuehrerschein
  const [licenseNumber, setLicenseNumber] = useState(driver.license_number || driver.license_data?.license_number || "")
  const [licenseClasses, setLicenseClasses] = useState<string[]>(
    driver.license_classes || driver.license_data?.license_classes || [],
  )
  const [licenseIssueDate, setLicenseIssueDate] = useState(driver.license_data?.issue_date || "")
  const [licenseExpiry, setLicenseExpiry] = useState(driver.license_expiry || driver.license_data?.expiry_date || "")
  const [licenseAuthority, setLicenseAuthority] = useState(driver.license_data?.issuing_authority || "")

  // P-Schein
  const [pbefNumber, setPbefNumber] = useState(driver.pbef_data?.number || "")
  const [pbefIssueDate, setPbefIssueDate] = useState(driver.pbef_data?.issue_date || "")
  const [pbefExpiryDate, setPbefExpiryDate] = useState(driver.pbef_data?.expiry_date || "")
  const [pbefAuthority, setPbefAuthority] = useState(driver.pbef_data?.issuing_authority || "")

  // Beschaeftigung
  const [employmentType, setEmploymentType] = useState(driver.employment_data?.type || "employee")
  const [employmentStart, setEmploymentStart] = useState(driver.employment_data?.start_date || "")
  const [employmentEnd, setEmploymentEnd] = useState(driver.employment_data?.end_date || "")

  // Update state when driver prop changes
  useEffect(() => {
    setSalutation(driver.salutation || "")
    setTitle(driver.title || "")
    setFirstName(driver.first_name)
    setLastName(driver.last_name)
    setEmail(driver.email || "")
    setPhone(driver.phone)
    setMobile(driver.mobile || "")
    setDateOfBirth(driver.date_of_birth || "")
    setNationality(driver.nationality || "")
    setStatus(driver.status)
    setStreet(driver.address_data?.street || "")
    setPostalCode(driver.address_data?.postal_code || "")
    setCity(driver.address_data?.city || "")
    setLicenseNumber(driver.license_number || driver.license_data?.license_number || "")
    setLicenseClasses(driver.license_classes || driver.license_data?.license_classes || [])
    setLicenseIssueDate(driver.license_data?.issue_date || "")
    setLicenseExpiry(driver.license_expiry || driver.license_data?.expiry_date || "")
    setLicenseAuthority(driver.license_data?.issuing_authority || "")
    setPbefNumber(driver.pbef_data?.number || "")
    setPbefIssueDate(driver.pbef_data?.issue_date || "")
    setPbefExpiryDate(driver.pbef_data?.expiry_date || "")
    setPbefAuthority(driver.pbef_data?.issuing_authority || "")
    setEmploymentType(driver.employment_data?.type || "employee")
    setEmploymentStart(driver.employment_data?.start_date || "")
    setEmploymentEnd(driver.employment_data?.end_date || "")
    // Reset files
    setLicenseFile(null)
    setPbefFile(null)
  }, [driver])

  const FileUploadField = ({
    label,
    file,
    setFile,
    inputRef,
    accept = ".pdf,.jpg,.jpeg,.png",
  }: {
    label: string
    file: File | null
    setFile: (file: File | null) => void
    inputRef: React.RefObject<HTMLInputElement | null>
    accept?: string
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileIcon className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary font-medium">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
            >
              ✕
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <UploadIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">PDF oder JPG hochladen</span>
          </div>
        )}
      </div>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData = {
        salutation: salutation || null,
        title: title || null,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone,
        mobile: mobile || null,
        date_of_birth: dateOfBirth || null,
        nationality: nationality || null,
        status,
        license_number: licenseNumber || "Nicht angegeben",
        license_expiry: licenseExpiry || null,
        license_classes: licenseClasses,
        address_data: {
          street,
          postal_code: postalCode,
          city,
          country: "Deutschland",
        },
        license_data: {
          license_number: licenseNumber,
          license_classes: licenseClasses,
          issue_date: licenseIssueDate || null,
          expiry_date: licenseExpiry || null,
          issuing_authority: licenseAuthority,
        },
        pbef_data: {
          number: pbefNumber,
          issue_date: pbefIssueDate || null,
          expiry_date: pbefExpiryDate || null,
          issuing_authority: pbefAuthority,
          valid: !!pbefNumber,
        },
        employment_data: {
          type: employmentType,
          start_date: employmentStart || null,
          end_date: employmentEnd || null,
          contract_type: "full-time",
        },
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("drivers").update(updateData).eq("id", driver.id).select().single()

      if (error) throw error

      toast.success("Fahrer erfolgreich aktualisiert")
      onOpenChange(false)

      if (onSuccess && data) {
        onSuccess(data)
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating driver:", error)
      toast.error("Fehler beim Aktualisieren des Fahrers")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fahrer bearbeiten</DialogTitle>
          <DialogDescription>Aktualisieren Sie alle Daten des Fahrers.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Persoenlich</TabsTrigger>
              <TabsTrigger value="address">Anschrift</TabsTrigger>
              <TabsTrigger value="license">Fuehrerschein</TabsTrigger>
              <TabsTrigger value="pbef">P-Schein</TabsTrigger>
              <TabsTrigger value="employment">Beschaeftigung</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">NACHNAME *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.toUpperCase())}
                    required
                    className="rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="phone">Telefon Nummer *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    required
                    maxLength={20}
                    placeholder="+49 170 1234567"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobil Nummer</Label>
                  <Input
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(formatPhoneNumber(e.target.value))}
                    maxLength={20}
                    placeholder="+49 170 1234567"
                    className="rounded-xl"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nationality">Nationalitaet</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="z.B. Deutsch"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Verfuegbar</SelectItem>
                      <SelectItem value="busy">Beschaeftigt</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
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
                  placeholder="Strasse und Hausnummer eingeben"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <div className="grid gap-2 col-span-2">
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

            <TabsContent value="license" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="licenseNumber">Fuehrerscheinnummer</Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="licenseAuthority">Ausstellungsbehoerde</Label>
                  <Input
                    id="licenseAuthority"
                    value={licenseAuthority}
                    onChange={(e) => setLicenseAuthority(e.target.value)}
                    placeholder="z.B. Stadt Koeln"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="licenseIssueDate">Ausgestellt am</Label>
                  <Input
                    id="licenseIssueDate"
                    type="date"
                    value={licenseIssueDate}
                    onChange={(e) => setLicenseIssueDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="licenseExpiry">Gueltig bis</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <LicenseClassSelector selectedClasses={licenseClasses} onChange={setLicenseClasses} />

              <FileUploadField
                label="Fuehrerschein Kopie"
                file={licenseFile}
                setFile={setLicenseFile}
                inputRef={licenseFileRef}
              />
            </TabsContent>

            <TabsContent value="pbef" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pbefNumber">P-Schein Nummer</Label>
                  <Input
                    id="pbefNumber"
                    value={pbefNumber}
                    onChange={(e) => setPbefNumber(e.target.value)}
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pbefAuthority">Ausstellungsbehoerde</Label>
                  <Input
                    id="pbefAuthority"
                    value={pbefAuthority}
                    onChange={(e) => setPbefAuthority(e.target.value)}
                    placeholder="z.B. Ordnungsamt"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pbefIssueDate">P-Schein Erteilt (Datum)</Label>
                  <Input
                    id="pbefIssueDate"
                    type="date"
                    value={pbefIssueDate}
                    onChange={(e) => setPbefIssueDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pbefExpiryDate">P-Schein Ablauf (Datum)</Label>
                  <Input
                    id="pbefExpiryDate"
                    type="date"
                    value={pbefExpiryDate}
                    onChange={(e) => setPbefExpiryDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <FileUploadField
                label="Personenbefoerderungsschein (PDF, JPG)"
                file={pbefFile}
                setFile={setPbefFile}
                inputRef={pbefFileRef}
              />
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="employmentType">Beschaeftigungsart</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Angestellter</SelectItem>
                    <SelectItem value="freelancer">Freiberufler</SelectItem>
                    <SelectItem value="contractor">Subunternehmer</SelectItem>
                    <SelectItem value="minijob">Minijob</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employmentStart">Beschaeftigt seit</Label>
                  <Input
                    id="employmentStart"
                    type="date"
                    value={employmentStart}
                    onChange={(e) => setEmploymentStart(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employmentEnd">Beschaeftigt bis</Label>
                  <Input
                    id="employmentEnd"
                    type="date"
                    value={employmentEnd}
                    onChange={(e) => setEmploymentEnd(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
