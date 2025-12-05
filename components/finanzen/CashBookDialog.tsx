"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { toast } from "sonner"
import { safeNumber } from "@/lib/utils/safe-number"

const PlusIcon = () => (
  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

interface CashBookDialogProps {
  companyId: string | null
  currentBalance: number
  onSuccess?: (entry: any) => void
}

// GoBD-konforme Kategorien für das Kassenbuch
const INCOME_CATEGORIES = [
  { value: "bareinnahme", label: "Bareinnahme" },
  { value: "taxifahrt_bar", label: "Taxifahrt (Barzahlung)" },
  { value: "mietwagenfahrt_bar", label: "Mietwagenfahrt (Barzahlung)" },
  { value: "privateinlage", label: "Privateinlage" },
  { value: "bankabhebung", label: "Bankabhebung" },
  { value: "sonstige_einnahme", label: "Sonstige Einnahme" },
]

const EXPENSE_CATEGORIES = [
  { value: "kraftstoff", label: "Kraftstoff/Tanken" },
  { value: "fahrzeugwaesche", label: "Fahrzeugwäsche" },
  { value: "parkgebuehren", label: "Parkgebühren" },
  { value: "maut", label: "Maut/Straßengebühren" },
  { value: "buero", label: "Büromaterial" },
  { value: "telefon", label: "Telefon/Internet" },
  { value: "bankeinzahlung", label: "Bankeinzahlung" },
  { value: "privatentnahme", label: "Privatentnahme" },
  { value: "gehaelter", label: "Gehälter (bar)" },
  { value: "trinkgeld", label: "Trinkgeld (ausgegeben)" },
  { value: "reparatur", label: "Kleine Reparaturen" },
  { value: "sonstige_ausgabe", label: "Sonstige Ausgabe" },
]

export function CashBookDialog({ companyId, currentBalance, onSuccess }: CashBookDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [entryType, setEntryType] = useState<"income" | "expense">("income")
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [notes, setNotes] = useState("")

  // File upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  const parsedAmount = safeNumber(Number.parseFloat(amount)) || 0
  const newBalance =
    entryType === "income" ? safeNumber(currentBalance) + parsedAmount : safeNumber(currentBalance) - parsedAmount

  const resetForm = () => {
    setEntryType("income")
    setEntryDate(new Date().toISOString().split("T")[0])
    setDescription("")
    setCategory("")
    setAmount("")
    setDocumentNumber("")
    setNotes("")
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Bitte nur Bilder (JPG, PNG, WebP) oder PDF hochladen", {
        description: "Unterstützte Formate: JPG, PNG, WebP oder PDF.",
        duration: 5000,
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Datei ist zu groß (max. 10 MB)", {
        description: "Bitte wählen Sie eine kleinere Datei oder komprimieren Sie das Bild.",
        duration: 5000,
      })
      return
    }

    setReceiptFile(file)

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setReceiptPreview(null)
    }
  }

  const removeFile = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadReceipt = async (entryId: string): Promise<string | null> => {
    if (!receiptFile || !companyId) return null

    setUploadingFile(true)
    try {
      const fileExt = receiptFile.name.split(".").pop()
      const fileName = `${companyId}/cashbook/${entryId}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("receipts").upload(fileName, receiptFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("receipts").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error uploading receipt:", error)
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async () => {
    if (!companyId) {
      toast.error("Kein Unternehmen gefunden", {
        description: "Bitte laden Sie die Seite neu oder kontaktieren Sie den Support.",
        duration: 5000,
      })
      return
    }

    if (!description.trim()) {
      toast.error("Bitte geben Sie einen Buchungstext ein", {
        description: "Der Buchungstext ist ein Pflichtfeld und beschreibt die Transaktion.",
        duration: 5000,
      })
      return
    }

    if (!category) {
      toast.error("Bitte wählen Sie eine Kategorie")
      return
    }

    if (parsedAmount <= 0) {
      toast.error("Bitte geben Sie einen gültigen Betrag ein")
      return
    }

    if (entryType === "expense" && newBalance < 0) {
      toast.error("Der Kassensaldo darf nicht negativ werden!")
      return
    }

    setLoading(true)

    try {
      const year = new Date(entryDate).getFullYear()
      const { count } = await supabase
        .from("cashbook_entries")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("entry_date", `${year}-01-01`)
        .lte("entry_date", `${year}-12-31`)

      const entryNumber = `KB-${year}-${String((count || 0) + 1).padStart(5, "0")}`

      const { data: entry, error } = await supabase
        .from("cashbook_entries")
        .insert({
          company_id: companyId,
          entry_number: entryNumber,
          entry_date: entryDate,
          entry_type: entryType,
          description: description.trim(),
          category,
          amount: parsedAmount,
          balance_after: newBalance,
          document_number: documentNumber.trim() || null,
          notes: notes.trim() || null,
          is_cancelled: false,
        })
        .select()
        .single()

      if (error) throw error

      if (receiptFile && entry) {
        const receiptUrl = await uploadReceipt(entry.id)
        if (receiptUrl) {
          await supabase.from("cashbook_entries").update({ receipt_url: receiptUrl }).eq("id", entry.id)
          entry.receipt_url = receiptUrl
        }
      }

      toast.success(
        entryType === "income"
          ? `Einnahme von ${safeNumber(parsedAmount).toFixed(2)} € erfasst`
          : `Ausgabe von ${safeNumber(parsedAmount).toFixed(2)} € erfasst`,
      )

      onSuccess?.(entry)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error("Fehler beim Erstellen des Kassenbucheintrags:", error)
      toast.error("Fehler beim Speichern der Buchung")
    } finally {
      setLoading(false)
    }
  }

  const categories = entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

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
          Neue Buchung
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kassenbuch-Eintrag</DialogTitle>
          <DialogDescription>Neue Einnahme oder Ausgabe erfassen (GoBD)</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="grid gap-5">
            {/* Entry Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={entryType === "income" ? "default" : "outline"}
                onClick={() => {
                  setEntryType("income")
                  setCategory("")
                }}
              >
                Einnahme
              </Button>
              <Button
                type="button"
                variant={entryType === "expense" ? "default" : "outline"}
                onClick={() => {
                  setEntryType("expense")
                  setCategory("")
                }}
              >
                Ausgabe
              </Button>
            </div>

            {/* Current Balance Info */}
            <div className="flex justify-between items-center text-sm p-3 bg-muted rounded-xl">
              <span className="text-muted-foreground">Aktueller Saldo:</span>
              <span className="font-semibold">{safeNumber(currentBalance).toFixed(2)} €</span>
            </div>

            {/* Date & Category */}
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="entryDate">Datum</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Kategorie</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Buchungstext</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  entryType === "income" ? "z.B. Fahrt Müller → Flughafen" : "z.B. Shell Tankstelle, 45L Diesel"
                }
                required
              />
            </div>

            {/* Amount & Document Number */}
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="documentNumber">Belegnummer (opt.)</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="z.B. Q-2024-0001"
                />
              </div>
            </div>

            {/* Receipt Upload - Compact */}
            <div className="grid gap-2">
              <Label>Beleg (optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!receiptFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full justify-start text-muted-foreground"
                >
                  Beleg hochladen (JPG, PNG, PDF)
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-xl">
                  {receiptPreview ? (
                    <img
                      src={receiptPreview || "/placeholder.svg"}
                      alt="Vorschau"
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">PDF</div>
                  )}
                  <span className="flex-1 text-sm truncate">{receiptFile.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    ×
                  </Button>
                </div>
              )}
            </div>

            {/* Notes - Compact */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>

            {/* Preview */}
            {parsedAmount > 0 && (
              <div className="flex justify-between items-center text-sm p-3 bg-muted rounded-xl">
                <span className="text-muted-foreground">
                  {entryType === "income" ? "+" : "-"}
                  {safeNumber(parsedAmount).toFixed(2)} €
                </span>
                <span
                  className={`font-semibold ${entryType === "expense" && safeNumber(newBalance) < 0 ? "text-destructive" : ""}`}
                >
                  Neuer Saldo: {safeNumber(newBalance).toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFile || (entryType === "expense" && safeNumber(newBalance) < 0)}
            >
              {loading || uploadingFile
                ? "Wird gespeichert..."
                : entryType === "income"
                  ? "Einnahme buchen"
                  : "Ausgabe buchen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
