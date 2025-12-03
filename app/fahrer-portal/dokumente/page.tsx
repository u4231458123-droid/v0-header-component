"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, differenceInDays } from "date-fns"
import { de } from "date-fns/locale"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Calendar,
  Eye,
  Home,
  User,
  LogOut,
  Shield,
} from "lucide-react"

interface Document {
  id: string
  document_type: string
  file_name: string
  file_url: string
  valid_from: string | null
  valid_until: string | null
  status: "pending" | "approved" | "rejected" | "expired"
  rejection_reason: string | null
  created_at: string
}

const DOCUMENT_TYPES = [
  { key: "drivers_license", label: "Führerschein (Vorderseite)", required: true },
  { key: "drivers_license_back", label: "Führerschein (Rückseite)", required: true },
  { key: "passenger_transport_permit", label: "Personenbeförderungsschein (P-Schein)", required: true },
  { key: "id_card", label: "Personalausweis (Vorderseite)", required: true },
  { key: "id_card_back", label: "Personalausweis (Rückseite)", required: false },
  { key: "medical_certificate", label: "Ärztliches Gutachten", required: true },
  { key: "first_aid_certificate", label: "Erste-Hilfe-Nachweis", required: true },
  { key: "training_certificate", label: "Schulungsnachweise", required: false },
  { key: "photo", label: "Passfoto", required: false },
]

export default function DriverDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [driver, setDriver] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)

  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const supabase = getSupabase()
      if (!supabase) return

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: driverData } = await supabase
        .from("drivers")
        .select("*, companies(*)")
        .eq("user_id", user.id)
        .single()

      if (driverData) {
        setDriver(driverData)
        setCompany(driverData.companies)

        const { data: docsData } = await supabase
          .from("documents")
          .select("*")
          .eq("driver_id", driverData.id)
          .order("created_at", { ascending: false })

        if (docsData) {
          setDocuments(docsData)
        }
      }
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (type: string, file: File) => {
    if (!driver) return

    setUploading(type)

    try {
      const supabase = getSupabase()
      if (!supabase) return

      // Dateigröße prüfen (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Datei ist zu groß. Maximale Größe: 10MB")
        setUploading(null)
        return
      }

      const fileName = `${driver.id}/${type}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        toast.error(`Fehler beim Hochladen: ${uploadError.message}`)
        setUploading(null)
        return
      }

      // Für private Buckets: Speichere den Pfad, nicht die URL
      // Die URL wird beim Laden dynamisch generiert
      const { error: insertError } = await supabase.from("documents").insert({
        driver_id: driver.id,
        company_id: driver.company_id,
        owner_type: "driver",
        document_type: type,
        file_name: file.name,
        file_url: fileName, // Speichere den Pfad, nicht die URL
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        toast.error(`Fehler beim Speichern: ${insertError.message}`)
        // Lösche hochgeladene Datei bei Fehler
        await supabase.storage.from("documents").remove([fileName])
        setUploading(null)
        return
      }

      toast.success("Dokument erfolgreich hochgeladen")
      loadDocuments()
    } catch (error: any) {
      console.error("Error uploading document:", error)
      toast.error(`Fehler: ${error?.message || "Unbekannter Fehler"}`)
    } finally {
      setUploading(null)
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const getStatusBadge = (doc: Document) => {
    if (doc.valid_until) {
      const daysUntilExpiry = differenceInDays(new Date(doc.valid_until), new Date())
      if (daysUntilExpiry < 0) {
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" /> Abgelaufen
          </Badge>
        )
      }
      if (daysUntilExpiry < 30) {
        return (
          <Badge className="bg-amber-500 text-white text-xs">
            <Clock className="h-3 w-3 mr-1" /> Läuft bald ab
          </Badge>
        )
      }
    }

    switch (doc.status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500 text-white text-xs">
            <CheckCircle className="h-3 w-3 mr-1" /> Genehmigt
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" /> In Prüfung
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" /> Abgelehnt
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unbekannt
          </Badge>
        )
    }
  }

  const getDocumentForType = (type: string) => {
    return documents.find((d) => d.document_type === type)
  }

  const uploadedCount = DOCUMENT_TYPES.filter((t) => getDocumentForType(t.key)).length
  const requiredCount = DOCUMENT_TYPES.filter((t) => t.required).length
  const approvedCount = documents.filter((d) => d.status === "approved").length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Lade Dokumente...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/fahrer-portal">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-slate-900">Meine Dokumente</h1>
                <p className="text-xs text-slate-500">{company?.name || "Unternehmen"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/fahrer-portal">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/fahrer-portal/profil">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{uploadedCount}</p>
              <p className="text-xs text-slate-500">Hochgeladen</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
              <p className="text-xs text-slate-500">Genehmigt</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{requiredCount}</p>
              <p className="text-xs text-slate-500">Erforderlich</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-primary font-medium">Wichtiger Hinweis</p>
                <p className="text-primary/80 mt-1">
                  Alle Dokumente werden von Ihrem Arbeitgeber geprüft. Stellen Sie sicher, dass alle Dokumente gut
                  lesbar und aktuell sind.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">Dokumentenliste</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {DOCUMENT_TYPES.map((docType) => {
                const existingDoc = getDocumentForType(docType.key)

                return (
                  <div
                    key={docType.key}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${existingDoc ? "bg-emerald-100" : "bg-muted"}`}>
                        <FileText className={`h-5 w-5 ${existingDoc ? "text-emerald-600" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          {docType.label}
                          {docType.required && <span className="text-destructive text-xs">*</span>}
                        </p>
                        {existingDoc && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {getStatusBadge(existingDoc)}
                            {existingDoc.valid_until && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Gültig bis: {format(new Date(existingDoc.valid_until), "dd.MM.yyyy", { locale: de })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {existingDoc && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={async () => {
                            try {
                              const supabase = getSupabase()
                              if (!supabase) return

                              // Erstelle signed URL für Download
                              const { data, error } = await supabase.storage
                                .from("documents")
                                .createSignedUrl(existingDoc.file_url, 3600)

                              if (error) throw error

                              if (data?.signedUrl) {
                                window.open(data.signedUrl, "_blank")
                              }
                            } catch (error: any) {
                              console.error("Error downloading document:", error)
                              toast.error("Fehler beim Öffnen des Dokuments")
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Label htmlFor={`upload-${docType.key}`} className="cursor-pointer">
                        <Button
                          variant={existingDoc ? "outline" : "default"}
                          size="sm"
                          disabled={uploading === docType.key}
                          className="rounded-full"
                          asChild
                        >
                          <span>
                            {uploading === docType.key ? (
                              <span className="animate-spin">...</span>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-1" />
                                {existingDoc ? "Ersetzen" : "Hochladen"}
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id={`upload-${docType.key}`}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            uploadDocument(docType.key, file)
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rejected Documents Info */}
            {documents.some((d) => d.status === "rejected") && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-medium text-red-900 mb-2">Abgelehnte Dokumente</p>
                {documents
                  .filter((d) => d.status === "rejected")
                  .map((doc) => (
                    <div key={doc.id} className="text-sm text-red-700">
                      <strong>{DOCUMENT_TYPES.find((t) => t.key === doc.document_type)?.label}:</strong>{" "}
                      {doc.rejection_reason || "Kein Grund angegeben"}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {company?.name || "MyDispatch"}
          </p>
        </div>
      </footer>
    </div>
  )
}
