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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  SF_CLASSES,
  DEDUCTIBLE_OPTIONS,
  VEHICLE_CATEGORIES,
  VALIDATION_RULES,
  formatLicensePlate,
  formatVIN,
} from "@/lib/form-constants"

interface NewVehicleDialogProps {
  companyId: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (vehicle: unknown) => void
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
      <polyline points="17 8 12 3 7 8" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export function NewVehicleDialog({ companyId, open: controlledOpen, onOpenChange, onSuccess }: NewVehicleDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("fahrzeug")
  const router = useRouter()
  const supabase = createClient()

  // File Upload States
  const [fahrzeugscheinFile, setFahrzeugscheinFile] = useState<File | null>(null)
  const [konzessionsauszugFile, setKonzessionsauszugFile] = useState<File | null>(null)
  const [versicherungsunterlagenFile, setVersicherungsunterlagenFile] = useState<File | null>(null)

  // File Input Refs
  const fahrzeugscheinRef = useRef<HTMLInputElement>(null)
  const konzessionsauszugRef = useRef<HTMLInputElement>(null)
  const versicherungsunterlagenRef = useRef<HTMLInputElement>(null)

  // Form State for validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }

    switch (name) {
      case "license_plate":
        if (value && !VALIDATION_RULES.licensePlate.pattern.test(value)) {
          newErrors[name] = VALIDATION_RULES.licensePlate.message
        } else {
          delete newErrors[name]
        }
        break
      case "vin":
        if (value && value.length !== 17) {
          newErrors[name] = VALIDATION_RULES.vin.message
        } else {
          delete newErrors[name]
        }
        break
      case "hsn":
        if (value && !VALIDATION_RULES.hsn.pattern.test(value)) {
          newErrors[name] = VALIDATION_RULES.hsn.message
        } else {
          delete newErrors[name]
        }
        break
      case "tsn":
        if (value && !VALIDATION_RULES.tsn.pattern.test(value)) {
          newErrors[name] = VALIDATION_RULES.tsn.message
        } else {
          delete newErrors[name]
        }
        break
      case "kw":
      case "ps":
        if (value && !VALIDATION_RULES.power.pattern.test(value)) {
          newErrors[name] = VALIDATION_RULES.power.message
        } else {
          delete newErrors[name]
        }
        break
      case "concession_number":
        if (value && !VALIDATION_RULES.concessionNumber.pattern.test(value)) {
          newErrors[name] = VALIDATION_RULES.concessionNumber.message
        } else {
          delete newErrors[name]
        }
        break
    }

    setErrors(newErrors)
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${path}/${Date.now()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage.from("documents").upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("[v0] File upload error:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      // Upload files if present
      let fahrzeugscheinUrl = null
      let konzessionsauszugUrl = null
      let versicherungsunterlagenUrl = null

      if (fahrzeugscheinFile) {
        fahrzeugscheinUrl = await uploadFile(fahrzeugscheinFile, `vehicles/${companyId}/fahrzeugschein`)
      }
      if (konzessionsauszugFile) {
        konzessionsauszugUrl = await uploadFile(konzessionsauszugFile, `vehicles/${companyId}/konzession`)
      }
      if (versicherungsunterlagenFile) {
        versicherungsunterlagenUrl = await uploadFile(versicherungsunterlagenFile, `vehicles/${companyId}/versicherung`)
      }

      // Insert vehicle with all fields
      const vehicleData: Record<string, unknown> = {
        company_id: companyId,
        license_plate: (formData.get("license_plate") as string)?.trim() || null,
        make: (formData.get("make") as string)?.trim() || null,
        model: (formData.get("model") as string)?.trim() || null,
        vin: (formData.get("vin") as string)?.trim() || null,
        hsn: (formData.get("hsn") as string)?.trim() || null,
        tsn: (formData.get("tsn") as string)?.trim() || null,
        kw: formData.get("kw") ? Number.parseInt(formData.get("kw") as string) : null,
        ps: formData.get("ps") ? Number.parseInt(formData.get("ps") as string) : null,
        color: (formData.get("color") as string)?.trim() || null,
        year: formData.get("year") ? Number.parseInt(formData.get("year") as string) : null,
        first_registration_date: (formData.get("first_registration") as string) || null,
        mileage: formData.get("km_at_purchase") ? Number.parseInt(formData.get("km_at_purchase") as string) : null,
        tuev_date: (formData.get("tuev_due_date") as string) || null,
        category: (formData.get("category") as string) || "standard",
        seats: Number.parseInt(formData.get("seats") as string) || 4,
        fuel_type: (formData.get("fuel_type") as string) || null,
        status: "available",
        // Konzessionsdaten
        concession_number: (formData.get("concession_number") as string)?.trim() || null,
        concession_due_date: (formData.get("concession_due_date") as string) || null,
        // Dokument-URLs
        fahrzeugschein_url: fahrzeugscheinUrl,
        konzessionsauszug_url: konzessionsauszugUrl,
      }

      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert(vehicleData)
        .select()
        .single()

      if (vehicleError) throw vehicleError

      // Insert insurance data if provided
      const insuranceCompany = (formData.get("insurance_name") as string)?.trim()
      if (insuranceCompany && vehicle) {
        const insuranceData = {
          vehicle_id: vehicle.id,
          company_id: companyId,
          insurance_company: insuranceCompany,
          insurance_number: (formData.get("insurance_number") as string)?.trim() || null,
          insurance_type: (formData.get("insurance_type") as string) || "vollkasko",
          valid_from: new Date().toISOString().split("T")[0],
          valid_until: (formData.get("insurance_valid_until") as string) || null,
          premium: formData.get("insurance_premium")
            ? Number.parseFloat(formData.get("insurance_premium") as string)
            : null,
          // Erweiterte Versicherungsfelder
          sf_class_liability: (formData.get("sf_class_liability") as string) || null,
          sf_class_kasko: (formData.get("sf_class_kasko") as string) || null,
          deductible_partial: formData.get("deductible_partial")
            ? Number.parseInt(formData.get("deductible_partial") as string)
            : null,
          deductible_full: formData.get("deductible_full")
            ? Number.parseInt(formData.get("deductible_full") as string)
            : null,
          document_url: versicherungsunterlagenUrl,
        }

        const { error: insuranceError } = await supabase.from("vehicle_insurance").insert(insuranceData)

        if (insuranceError) {
          console.error("Insurance insert error (non-critical):", insuranceError)
          // Vehicle was already created, so we continue
        }
      }

      toast.success("Fahrzeug erfolgreich hinzugefügt", {
        description: "Das Fahrzeug wurde in Ihr System aufgenommen und kann nun zugewiesen werden.",
        duration: 4000,
      })
      onSuccess?.(vehicle)
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast.error("Fehler beim Hinzufügen des Fahrzeugs", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFahrzeugscheinFile(null)
    setKonzessionsauszugFile(null)
    setVersicherungsunterlagenFile(null)
    setErrors({})
    setActiveTab("fahrzeug")
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
    inputRef: React.RefObject<HTMLInputElement>
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
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
            >
              X
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <PlusIcon className="mr-2 h-4 w-4" />
          Neues Fahrzeug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Fahrzeug anlegen</DialogTitle>
          <DialogDescription>Erfassen Sie alle Fahrzeugdaten inkl. Konzession und Versicherung</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fahrzeug">Fahrzeugdaten</TabsTrigger>
              <TabsTrigger value="konzession">Konzession</TabsTrigger>
              <TabsTrigger value="versicherung">Versicherung</TabsTrigger>
            </TabsList>

            {/* Tab 1: Fahrzeugdaten */}
            <TabsContent value="fahrzeug" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Grunddaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* KFZ-Kennzeichen */}
                  <div className="space-y-2">
                    <Label htmlFor="license_plate">KFZ-Kennzeichen *</Label>
                    <Input
                      id="license_plate"
                      name="license_plate"
                      placeholder="DEG-XX 123 E"
                      maxLength={15}
                      onChange={(e) => {
                        e.target.value = formatLicensePlate(e.target.value)
                        validateField("license_plate", e.target.value)
                      }}
                      required
                    />
                    {errors.license_plate && <p className="text-xs text-destructive">{errors.license_plate}</p>}
                  </div>

                  {/* Hersteller & Modell */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="make">Hersteller *</Label>
                      <Input id="make" name="make" placeholder="z.B. Mercedes-Benz" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modell *</Label>
                      <Input id="model" name="model" placeholder="z.B. E-Klasse" required />
                    </div>
                  </div>

                  {/* FIN */}
                  <div className="space-y-2">
                    <Label htmlFor="vin">Fahrzeug-Identifikationsnummer (FIN)</Label>
                    <Input
                      id="vin"
                      name="vin"
                      placeholder="17-stellige FIN"
                      maxLength={17}
                      onChange={(e) => {
                        e.target.value = formatVIN(e.target.value)
                        validateField("vin", e.target.value)
                      }}
                    />
                    {errors.vin && <p className="text-xs text-destructive">{errors.vin}</p>}
                    <p className="text-xs text-muted-foreground">Max. 17 Zeichen</p>
                  </div>

                  {/* Schluesselnummern HSN/TSN */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="hsn">Schluesselnr. 1 (HSN)</Label>
                      <Input
                        id="hsn"
                        name="hsn"
                        placeholder="0000"
                        maxLength={4}
                        onChange={(e) => validateField("hsn", e.target.value)}
                      />
                      {errors.hsn && <p className="text-xs text-destructive">{errors.hsn}</p>}
                      <p className="text-xs text-muted-foreground">4-stellig</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tsn">Schluesselnr. 2 (TSN)</Label>
                      <Input
                        id="tsn"
                        name="tsn"
                        placeholder="AAA"
                        maxLength={3}
                        onChange={(e) => validateField("tsn", e.target.value)}
                      />
                      {errors.tsn && <p className="text-xs text-destructive">{errors.tsn}</p>}
                      <p className="text-xs text-muted-foreground">3-stellig</p>
                    </div>
                  </div>

                  {/* KW/PS */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="kw">KW-Leistung</Label>
                      <Input
                        id="kw"
                        name="kw"
                        type="number"
                        placeholder="150"
                        maxLength={3}
                        max={999}
                        onChange={(e) => validateField("kw", e.target.value)}
                      />
                      {errors.kw && <p className="text-xs text-destructive">{errors.kw}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ps">PS-Leistung</Label>
                      <Input
                        id="ps"
                        name="ps"
                        type="number"
                        placeholder="204"
                        maxLength={3}
                        max={999}
                        onChange={(e) => validateField("ps", e.target.value)}
                      />
                      {errors.ps && <p className="text-xs text-destructive">{errors.ps}</p>}
                    </div>
                  </div>

                  {/* Farbe, Baujahr, Erstzulassung */}
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="color">Farbe</Label>
                      <Input id="color" name="color" placeholder="Schwarz" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Baujahr</Label>
                      <Input id="year" name="year" type="number" min="1990" max="2030" placeholder="2024" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_registration">Erstzulassung</Label>
                      <Input id="first_registration" name="first_registration" type="date" />
                    </div>
                  </div>

                  {/* KM beim Kauf */}
                  <div className="space-y-2">
                    <Label htmlFor="km_at_purchase">KM beim Kauf</Label>
                    <Input id="km_at_purchase" name="km_at_purchase" type="number" placeholder="50000" />
                  </div>

                  {/* Fahrzeugkategorie & Sitze */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="category">Fahrzeugkategorie *</Label>
                      <Select name="category" defaultValue="business">
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seats">Sitzplaetze *</Label>
                      <Select name="seats" defaultValue="4">
                        <SelectTrigger>
                          <SelectValue placeholder="Sitze wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Sitze
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fahrzeugschein Upload */}
                  <FileUploadField
                    label="Fahrzeugschein (PDF/JPG)"
                    file={fahrzeugscheinFile}
                    setFile={setFahrzeugscheinFile}
                    inputRef={fahrzeugscheinRef as React.RefObject<HTMLInputElement>}
                  />

                  {/* TUeV */}
                  <div className="space-y-2">
                    <Label htmlFor="tuev_due_date">TUeV faellig</Label>
                    <Input id="tuev_due_date" name="tuev_due_date" type="date" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Konzession */}
            <TabsContent value="konzession" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Konzessionsdaten</CardTitle>
                  <CardDescription>Taxi-/Mietwagen-Konzession</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Konzessionsnummer */}
                  <div className="space-y-2">
                    <Label htmlFor="concession_number">Konzessionsnummer</Label>
                    <Input
                      id="concession_number"
                      name="concession_number"
                      placeholder="12345"
                      maxLength={5}
                      onChange={(e) => validateField("concession_number", e.target.value)}
                    />
                    {errors.concession_number && <p className="text-xs text-destructive">{errors.concession_number}</p>}
                    <p className="text-xs text-muted-foreground">Max. 5 Zeichen</p>
                  </div>

                  {/* Konzession faellig */}
                  <div className="space-y-2">
                    <Label htmlFor="concession_due_date">Konzession faellig</Label>
                    <Input id="concession_due_date" name="concession_due_date" type="date" />
                  </div>

                  {/* Konzessionsauszug Upload */}
                  <FileUploadField
                    label="Konzessionsauszug (PDF/JPG)"
                    file={konzessionsauszugFile}
                    setFile={setKonzessionsauszugFile}
                    inputRef={konzessionsauszugRef as React.RefObject<HTMLInputElement>}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Versicherung */}
            <TabsContent value="versicherung" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">KFZ-Versicherungsdaten</CardTitle>
                  <CardDescription>Haftpflicht- und Kaskoversicherung</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Versicherungsname & Nummer */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_name">Versicherungsname</Label>
                      <Input id="insurance_name" name="insurance_name" placeholder="z.B. Allianz" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance_number">Versicherungsnummer</Label>
                      <Input id="insurance_number" name="insurance_number" placeholder="VS-123456789" />
                    </div>
                  </div>

                  {/* SF-Klassen */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="sf_class_liability">SF-Klasse Haftpflicht</Label>
                      <Select name="sf_class_liability">
                        <SelectTrigger>
                          <SelectValue placeholder="SF-Klasse wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {SF_CLASSES.map((sf) => (
                            <SelectItem key={sf.value} value={sf.value}>
                              {sf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sf_class_kasko">SF-Klasse Kasko</Label>
                      <Select name="sf_class_kasko">
                        <SelectTrigger>
                          <SelectValue placeholder="SF-Klasse wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {SF_CLASSES.map((sf) => (
                            <SelectItem key={sf.value} value={sf.value}>
                              {sf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Selbstbeteiligung */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="deductible_partial">SB Teilkasko</Label>
                      <Select name="deductible_partial">
                        <SelectTrigger>
                          <SelectValue placeholder="Selbstbeteiligung" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEDUCTIBLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deductible_full">SB Vollkasko</Label>
                      <Select name="deductible_full">
                        <SelectTrigger>
                          <SelectValue placeholder="Selbstbeteiligung" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEDUCTIBLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Versicherungsunterlagen Upload */}
                  <FileUploadField
                    label="Versicherungsunterlagen (PDF/JPG)"
                    file={versicherungsunterlagenFile}
                    setFile={setVersicherungsunterlagenFile}
                    inputRef={versicherungsunterlagenRef as React.RefObject<HTMLInputElement>}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation & Submit */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {activeTab !== "fahrzeug" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === "versicherung" ? "konzession" : "fahrzeug")}
                >
                  Zurueck
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              {activeTab !== "versicherung" ? (
                <Button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "fahrzeug" ? "konzession" : "versicherung")}
                >
                  Weiter
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? "Wird gespeichert..." : "Fahrzeug anlegen"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
