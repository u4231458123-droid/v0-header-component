"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SALUTATION_OPTIONS, formatPhoneNumber } from "@/lib/form-constants"
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, AlertCircle, CheckCircle2 } from "lucide-react"
import { LicenseClassSelector } from "./LicenseClassSelector"

interface NewDriverDialogProps {
  companyId: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (driver: unknown) => void
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

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
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

export function NewDriverDialog({ companyId, onSuccess }: NewDriverDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [pbefFile, setPbefFile] = useState<File | null>(null)

  const licenseFileRef = useRef<HTMLInputElement>(null)
  const pbefFileRef = useRef<HTMLInputElement>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [createCredentials, setCreateCredentials] = useState(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Persoenliche Daten
    salutation: "",
    title: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
    date_of_birth: "",
    nationality: "",
    // Anschrift
    address: "",
    postal_code: "",
    city: "",
    // Fuehrerschein
    license_number: "",
    license_issued_date: "",
    license_expiry: "",
    license_authority: "",
    // Personenbefoerderungsschein (P-Schein)
    pbef_number: "",
    pbef_issued_date: "",
    pbef_expiry_date: "",
    pbef_authority: "",
    username: "",
    password: "",
    password_confirm: "",
    // Beschäftigungsdaten
    employment_type: "",
    employment_start: "",
    employment_end: "",
  })

  const [licenseClasses, setLicenseClasses] = useState<string[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${path}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("File upload error:", error)
      return null
    }
  }

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

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.salutation) newErrors.salutation = "Anrede ist erforderlich"
    if (!formData.first_name) newErrors.first_name = "Vorname ist erforderlich"
    if (!formData.last_name) newErrors.last_name = "Nachname ist erforderlich"
    if (!formData.phone) newErrors.phone = "Telefonnummer ist erforderlich"
    if (!formData.license_number) newErrors.license_number = "Fuehrerscheinnummer ist erforderlich"
    if (!formData.license_expiry) newErrors.license_expiry = "Fuehrerschein-Ablaufdatum ist erforderlich"

    if (createCredentials) {
      if (!formData.email) newErrors.email = "E-Mail ist erforderlich fuer Zugangsdaten"
      if (!formData.username) newErrors.username = "Benutzername ist erforderlich"
      if (!formData.password) newErrors.password = "Passwort ist erforderlich"
      if (formData.password.length < 8) newErrors.password = "Passwort muss mindestens 8 Zeichen haben"
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = "Passwoerter stimmen nicht ueberein"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!companyId) {
      toast.error("Keine Firma zugeordnet", {
        description: "Bitte wählen Sie eine Firma aus.",
        duration: 4000,
      })
      return
    }

    if (!formData.first_name || !formData.last_name) {
      toast.error("Bitte Vor- und Nachnamen eingeben", {
        description: "Beide Felder sind erforderlich.",
        duration: 4000,
      })
      return
    }

    if (!formData.license_number) {
      toast.error("Bitte geben Sie die Fuehrerscheinnummer ein", {
        description: "Dieses Feld ist erforderlich.",
        duration: 4000,
      })
      return
    }

    if (!formData.license_expiry) {
      toast.error("Bitte geben Sie das Fuehrerschein-Ablaufdatum ein", {
        description: "Dieses Feld ist erforderlich.",
        duration: 4000,
      })
      return
    }

    setLoading(true)
    setCredentialError(null)

    try {
      let userId: string | null = null
      let credentialsCreated = false

      if (createCredentials && formData.email && formData.password) {
        try {
          const credentialResponse = await fetch("/api/auth/create-driver", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              firstName: formData.first_name,
              lastName: formData.last_name,
            }),
          })

          const credentialData = await credentialResponse.json()

          if (!credentialResponse.ok) {
            // Bei bereits existierender E-Mail: Fahrer trotzdem anlegen, aber ohne Auth
            if (credentialData.error?.includes("already") || credentialData.error?.includes("existiert")) {
              // Zeige Warnung, aber fahre fort mit der Fahrer-Erstellung
              toast.warning("E-Mail bereits registriert - Fahrer wird ohne Zugangsdaten angelegt", {
                description: "Der Fahrer kann später manuell Zugangsdaten erhalten.",
                duration: 4000,
              })
              credentialsCreated = false
              // Nicht return - wir legen den Fahrer trotzdem an!
            } else {
              throw new Error(credentialData.error || "Fehler beim Erstellen der Zugangsdaten")
            }
          } else {
            userId = credentialData.userId
            credentialsCreated = true
          }
        } catch (credError: unknown) {
          const errorMessage = credError instanceof Error ? credError.message : "Unbekannter Fehler"
          if (errorMessage.includes("already") || errorMessage.includes("existiert")) {
            // Zeige Warnung, aber fahre fort
            toast.warning("E-Mail bereits registriert - Fahrer wird ohne Zugangsdaten angelegt", {
              description: "Der Fahrer kann später manuell Zugangsdaten erhalten.",
              duration: 4000,
            })
            credentialsCreated = false
          } else {
            throw credError
          }
        }
      }

      // Fahrer-Daten vorbereiten
      const driverData = {
        company_id: companyId,
        salutation: formData.salutation || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || formData.mobile || "Nicht angegeben",
        mobile: formData.mobile || null,
        license_number: formData.license_number || "Nicht angegeben",
        license_expiry: formData.license_expiry || null,
        license_classes: licenseClasses,
        date_of_birth: formData.date_of_birth || null,
        nationality: formData.nationality || "deutsch",
        status: "available",
        user_id: userId,
        username: credentialsCreated ? formData.email : null,
        must_change_password: credentialsCreated ? true : null,
        address_data: {
          street: formData.address || "",
          postal_code: formData.postal_code || "",
          city: formData.city || "",
          country: "Deutschland",
          house_number: "",
        },
        license_data: {
          license_number: formData.license_number || "",
          license_classes: licenseClasses,
          issue_date: formData.license_issued_date || null,
          expiry_date: formData.license_expiry || null,
          issuing_authority: formData.license_authority || "",
        },
        pbef_data: {
          number: formData.pbef_number || "",
          issue_date: formData.pbef_issued_date || null,
          valid_until: formData.pbef_expiry_date || null,
          issuing_authority: formData.pbef_authority || "",
          valid: formData.pbef_number ? true : false,
        },
        employment_data: {
          type: formData.employment_type || "employee",
          start_date: formData.employment_start || null,
          contract_type: formData.employment_type === "freelance" ? "freelance" : "full-time",
          working_hours: 40,
          hourly_rate: null,
          monthly_salary: null,
        },
      }

      console.log("[v0] Driver data to insert:", JSON.stringify(driverData, null, 2))

      const { data, error } = await supabase.from("drivers").insert(driverData).select().single()

      if (error) {
        console.log("[v0] Supabase insert error:", error.message, error.details, error.hint)
        throw error
      }

      console.log("[v0] Driver inserted successfully:", data)
      toast.success("Fahrer erfolgreich angelegt", {
        description: "Der Fahrer wurde in Ihr System aufgenommen und kann nun zugewiesen werden.",
        duration: 4000,
      })
      setOpen(false)
      resetForm()

      if (onSuccess) {
        onSuccess(data)
      }

      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
      toast.error("Fehler beim Anlegen des Fahrers", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      salutation: "",
      title: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      mobile: "",
      date_of_birth: "",
      nationality: "",
      address: "",
      postal_code: "",
      city: "",
      license_number: "",
      license_issued_date: "",
      license_expiry: "",
      license_authority: "",
      pbef_number: "",
      pbef_issued_date: "",
      pbef_expiry_date: "",
      pbef_authority: "",
      username: "",
      password: "",
      password_confirm: "",
      employment_type: "",
      employment_start: "",
      employment_end: "",
    })
    setLicenseClasses([])
    setErrors({})
    setLicenseFile(null)
    setPbefFile(null)
    setCreateCredentials(false)
    setShowPassword(false)
    setCredentialError(null)
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
        <Button className="rounded-xl">
          <PlusIcon className="mr-2 h-4 w-4" />
          Neuer Fahrer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Fahrer hinzufuegen</DialogTitle>
          <DialogDescription>Erfassen Sie die vollstaendigen Fahrerdaten</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4 mt-4"
        >
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Persoenlich</TabsTrigger>
              <TabsTrigger value="address">Anschrift</TabsTrigger>
              <TabsTrigger value="license">Fuehrerschein</TabsTrigger>
              <TabsTrigger value="pbef">P-Schein</TabsTrigger>
              <TabsTrigger value="credentials">Zugangsdaten</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-4 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="salutation">Anrede *</Label>
                  <Select value={formData.salutation} onValueChange={(value) => updateField("salutation", value)}>
                    <SelectTrigger className={`rounded-xl ${errors.salutation ? "border-destructive" : ""}`}>
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
                  {errors.salutation && <p className="text-xs text-destructive">{errors.salutation}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Dr., Prof."
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="first_name">Vorname *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    className={`rounded-xl ${errors.first_name ? "border-destructive" : ""}`}
                  />
                  {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">NACHNAME *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateField("last_name", e.target.value.toUpperCase())}
                    className={`uppercase rounded-xl ${errors.last_name ? "border-destructive" : ""}`}
                  />
                  {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon Nummer *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", formatPhoneNumber(e.target.value))}
                    maxLength={20}
                    placeholder="+49 170 1234567"
                    className={`rounded-xl ${errors.phone ? "border-destructive" : ""}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobil Nummer</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => updateField("mobile", formatPhoneNumber(e.target.value))}
                    maxLength={20}
                    placeholder="+49 170 1234567"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date_of_birth">Geburtsdatum</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateField("date_of_birth", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nationality">Nationalitaet</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => updateField("nationality", e.target.value)}
                  placeholder="z.B. Deutsch"
                  className="rounded-xl"
                />
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse</Label>
                <AddressAutocomplete
                  id="address"
                  value={formData.address}
                  onChange={(value) => updateField("address", value)}
                  onSelect={(result) => {
                    updateField("address", result.formattedAddress)
                    if (result.components?.postalCode) {
                      updateField("postal_code", result.components.postalCode)
                    }
                    if (result.components?.city) {
                      updateField("city", result.components.city)
                    }
                  }}
                  placeholder="Strasse und Hausnummer"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="grid gap-2 col-span-1">
                  <Label htmlFor="postal_code">PLZ</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => updateField("postal_code", e.target.value)}
                    maxLength={10}
                    placeholder="12345"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Stadt"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="license" className="space-y-4">
              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="license_number">Fuehrerscheinnummer</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => updateField("license_number", e.target.value)}
                    className="rounded-xl font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="license_authority">Ausstellungsbehoerde</Label>
                  <Input
                    id="license_authority"
                    value={formData.license_authority}
                    onChange={(e) => updateField("license_authority", e.target.value)}
                    placeholder="z.B. Stadt Koeln"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="license_issued_date">Ausgestellt am</Label>
                  <Input
                    id="license_issued_date"
                    type="date"
                    value={formData.license_issued_date}
                    onChange={(e) => updateField("license_issued_date", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="license_expiry">Gueltig bis *</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => updateField("license_expiry", e.target.value)}
                    className={`rounded-xl ${errors.license_expiry ? "border-destructive" : ""}`}
                    required
                  />
                  {errors.license_expiry && <p className="text-xs text-destructive">{errors.license_expiry}</p>}
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

            <TabsContent value="pbef" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="pbef_number">P-Schein Nummer</Label>
                <Input
                  id="pbef_number"
                  value={formData.pbef_number}
                  onChange={(e) => updateField("pbef_number", e.target.value)}
                  className="rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="pbef_issued_date">P-Schein Erteilt (Datum)</Label>
                  <Input
                    id="pbef_issued_date"
                    type="date"
                    value={formData.pbef_issued_date}
                    onChange={(e) => updateField("pbef_issued_date", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pbef_expiry_date">P-Schein Ablauf (Datum)</Label>
                  <Input
                    id="pbef_expiry_date"
                    type="date"
                    value={formData.pbef_expiry_date}
                    onChange={(e) => updateField("pbef_expiry_date", e.target.value)}
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

            <TabsContent value="credentials" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="createCredentials"
                  checked={createCredentials}
                  onChange={(e) => {
                    setCreateCredentials(e.target.checked)
                    setCredentialError(null)
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="createCredentials" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Zugangsdaten fuer Fahrer-Portal erstellen
                </Label>
              </div>

              {credentialError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{credentialError}</AlertDescription>
                </Alert>
              )}

              {createCredentials && (
                <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Der Fahrer muss sein Passwort beim ersten Login aendern (rechtliche Anforderung).
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-2">
                    <Label htmlFor="username">Benutzername *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => updateField("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                      placeholder="z.B. max.mustermann"
                      className={`rounded-xl ${errors.username ? "border-destructive" : ""}`}
                    />
                    {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                    <p className="text-xs text-muted-foreground">
                      Der Benutzername wird fuer die Anmeldung verwendet (keine Leerzeichen)
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="credential_email">E-Mail Adresse *</Label>
                    <Input
                      id="credential_email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="fahrer@email.de"
                      className={`rounded-xl ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground">
                      Die E-Mail wird fuer die Authentifizierung und Passwort-Zuruecksetzung verwendet
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Initiales Passwort *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => updateField("password", e.target.value)}
                          placeholder="Min. 8 Zeichen"
                          className={`rounded-xl pr-10 ${errors.password ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password_confirm">Passwort bestaetigen *</Label>
                      <Input
                        id="password_confirm"
                        type={showPassword ? "text" : "password"}
                        value={formData.password_confirm}
                        onChange={(e) => updateField("password_confirm", e.target.value)}
                        placeholder="Passwort wiederholen"
                        className={`rounded-xl ${errors.password_confirm ? "border-destructive" : ""}`}
                      />
                      {errors.password_confirm && <p className="text-xs text-destructive">{errors.password_confirm}</p>}
                    </div>
                  </div>

                  <Alert className="bg-destructive/10 border-destructive/30">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive/90">
                      <strong>Wichtig:</strong> Der Fahrer wird beim ersten Login aufgefordert, ein neues Passwort zu
                      waehlen. Teilen Sie ihm das initiale Passwort sicher mit.
                    </AlertDescription>
                  </Alert>

                  {formData.password &&
                    formData.password.length >= 8 &&
                    formData.password === formData.password_confirm && (
                      <Alert className="bg-primary/10 border-primary/30">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-primary">
                          Zugangsdaten sind vollstaendig und gueltig.
                        </AlertDescription>
                      </Alert>
                    )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? "Speichern..." : "Fahrer anlegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
