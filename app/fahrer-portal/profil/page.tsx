"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { safeNumber } from "@/lib/utils/safe-number"
import { toastError, toastSuccess } from "@/lib/utils/toast"
import { differenceInDays, format } from "date-fns"
import { de } from "date-fns/locale"
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Car,
    Clock,
    CreditCard,
    FileText,
    Home,
    LogOut,
    Mail,
    MapPin,
    Phone,
    Shield,
    Star,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Driver {
  id: string
  salutation: string
  title: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string | null
  nationality: string | null
  license_number: string
  license_expiry: string | null
  status: string
  address_data: {
    street?: string
    house_number?: string
    postal_code?: string
    city?: string
    country?: string
  } | null
  pbef_data: {
    number?: string
    valid_until?: string
    issuing_authority?: string
  } | null
  license_data: {
    classes?: string[]
    restrictions?: string
  } | null
  employment_data: {
    start_date?: string
    contract_type?: string
    working_hours?: number
  } | null
  license_classes?: string[]
  companies?: {
    name: string
    company_slug?: string
  }
}

interface DriverStats {
  total_bookings: number
  total_revenue: number
  total_shifts: number
  avg_rating: number
}

export default function FahrerProfilPage() {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [stats, setStats] = useState<DriverStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
  })

  useEffect(() => {
    loadDriverProfile()
  }, [])

  const loadDriverProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*, companies(name, company_slug)")
        .eq("user_id", user.id)
        .single()

      if (driverError || !driverData) {
        toastError("Fahrerprofil nicht gefunden")
        return
      }

      setDriver(driverData)
      setFormData({
        phone: driverData.phone || "",
        email: driverData.email || "",
      })

      const { data: shiftsData } = await supabase
        .from("driver_shifts")
        .select("total_bookings, total_revenue")
        .eq("driver_id", driverData.id)
        .eq("status", "completed")

      const totalBookings =
        shiftsData?.reduce((sum: number, s: { total_bookings?: number }) => sum + (s.total_bookings || 0), 0) || 0
      const totalRevenue =
        shiftsData?.reduce((sum: number, s: { total_revenue?: number }) => sum + (s.total_revenue || 0), 0) || 0

      setStats({
        total_bookings: totalBookings,
        total_revenue: totalRevenue,
        total_shifts: shiftsData?.length || 0,
        avg_rating: 4.8,
      })
    } catch (error) {
      console.error("Error loading driver profile:", error)
      toastError("Fehler beim Laden des Profils")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!driver) return
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("drivers")
        .update({
          phone: formData.phone,
          email: formData.email,
        })
        .eq("id", driver.id)

      if (error) throw error

      setDriver({ ...driver, phone: formData.phone, email: formData.email })
      setEditMode(false)
      toastSuccess("Kontaktdaten aktualisiert", {
        description: "Ihre Kontaktdaten wurden erfolgreich gespeichert.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toastError("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    // Company-Slug VOR dem Logout aus dem driver-State ermitteln
    const companySlug = driver?.companies?.company_slug

    const supabase = createClient()
    await supabase.auth.signOut()

    // Redirect zur Landingpage des Unternehmens, falls verfügbar
    if (companySlug) {
      window.location.href = `/c/${companySlug}`
      return
    }
    // Fallback: Zur MyDispatch Landingpage
    window.location.href = "/"
  }

  const getDaysUntilExpiry = (date: string | null) => {
    if (!date) return null
    return differenceInDays(new Date(date), new Date())
  }

  const getExpiryBadge = (days: number | null) => {
    if (days === null) return null
    if (days < 0) return <Badge variant="destructive">Abgelaufen</Badge>
    if (days <= 30) return <Badge variant="destructive">Läuft in {days} Tagen ab</Badge>
    return <Badge className="bg-primary text-primary-foreground">Gültig</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Lade Profil...</div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Kein Fahrerprofil gefunden</h2>
            <p className="text-muted-foreground mb-4">Ihr Konto ist nicht mit einem Fahrerprofil verknüpft.</p>
            <Link href="/fahrer-portal">
              <Button>Zurück zum Portal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const licenseExpiry = getDaysUntilExpiry(driver.license_expiry)
  // Support both valid_until and expiry_date for backwards compatibility
  const pbefExpiryDate = driver.pbef_data?.valid_until || (driver.pbef_data as any)?.expiry_date || null
  const pbefExpiry = getDaysUntilExpiry(pbefExpiryDate)
  const licenseClasses = driver.license_classes || driver.license_data?.classes || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/fahrer-portal">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-foreground">Mein Profil</h1>
                <p className="text-xs text-muted-foreground">{driver.companies?.name || "Unternehmen"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/fahrer-portal">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/fahrer-portal/dokumente">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                  <FileText className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Warnungen */}
        {((licenseExpiry !== null && licenseExpiry <= 30) || (pbefExpiry !== null && pbefExpiry <= 30)) && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Achtung: Dokumente laufen bald ab</p>
                  <ul className="text-sm text-destructive/80 mt-1 space-y-1">
                    {licenseExpiry !== null && licenseExpiry <= 30 && (
                      <li>Führerschein: {licenseExpiry < 0 ? "Abgelaufen" : `${licenseExpiry} Tage`}</li>
                    )}
                    {pbefExpiry !== null && pbefExpiry <= 30 && (
                      <li>P-Schein: {pbefExpiry < 0 ? "Abgelaufen" : `${pbefExpiry} Tage`}</li>
                    )}
                  </ul>
                  <Link
                    href="/fahrer-portal/dokumente"
                    className="text-sm text-destructive hover:underline mt-2 inline-block font-medium"
                  >
                    Dokumente aktualisieren →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profil Header */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {driver.first_name?.[0]}
                  {driver.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {driver.salutation} {driver.title && `${driver.title} `}
                  {driver.first_name} {driver.last_name}
                </h2>
                <p className="text-muted-foreground">
                  Fahrer seit{" "}
                  {driver.employment_data?.start_date
                    ? format(new Date(driver.employment_data.start_date), "MMMM yyyy", { locale: de })
                    : "k.A."}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge
                    className={
                      driver.status === "available" || driver.status === "active"
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {driver.status === "available" || driver.status === "active"
                      ? "Aktiv"
                      : driver.status === "inactive"
                        ? "Inaktiv"
                        : driver.status}
                  </Badge>
                  {licenseClasses.map((cls: string) => (
                    <Badge key={cls} variant="outline">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
              {stats && (
                <div className="grid grid-cols-2 gap-5 text-center">
                  <div className="p-3 bg-muted rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Car className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stats.total_bookings}</div>
                    <div className="text-xs text-muted-foreground">Fahrten</div>
                  </div>
                  <div className="p-3 bg-muted rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{safeNumber(stats.avg_rating).toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Bewertung</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kontaktdaten */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-foreground">Kontaktdaten</CardTitle>
            {!editMode ? (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="rounded-full">
                Bearbeiten
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="rounded-full">
                  Abbrechen
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-full">
                  {saving ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                {editMode ? (
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    className="border-0 bg-card"
                  />
                ) : (
                  <span className="text-foreground">{driver.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Phone className="w-5 h-5 text-muted-foreground" />
                {editMode ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-0 bg-card"
                  />
                ) : (
                  <span className="text-foreground">{driver.phone}</span>
                )}
              </div>
            </div>
            {driver.address_data && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-foreground">
                  {driver.address_data.street} {driver.address_data.house_number}, {driver.address_data.postal_code}{" "}
                  {driver.address_data.city}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dokumente & Lizenzen */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Dokumente & Lizenzen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Führerschein</p>
                  <p className="text-sm text-muted-foreground">Nr. {driver.license_number || "Nicht angegeben"}</p>
                </div>
              </div>
              <div className="text-right">
                {driver.license_expiry && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Gültig bis {format(new Date(driver.license_expiry), "dd.MM.yyyy")}
                    </p>
                    {getExpiryBadge(licenseExpiry)}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">P-Schein</p>
                  <p className="text-sm text-muted-foreground">
                    {driver.pbef_data?.number ? `Nr. ${driver.pbef_data.number}` : "Keine Nummer hinterlegt"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {pbefExpiryDate && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Gültig bis {format(new Date(pbefExpiryDate), "dd.MM.yyyy")}
                    </p>
                    {getExpiryBadge(pbefExpiry)}
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link href="/fahrer-portal/dokumente">
                <Button variant="outline" className="rounded-full bg-transparent">
                  Alle Dokumente verwalten
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Arbeitsverhältnis */}
        {driver.employment_data && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Arbeitsverhältnis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Eintrittsdatum</p>
                    <p className="font-medium text-foreground">
                      {driver.employment_data.start_date
                        ? format(new Date(driver.employment_data.start_date), "dd.MM.yyyy")
                        : "k.A."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vertragsart</p>
                    <p className="font-medium text-foreground">{driver.employment_data.contract_type || "k.A."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wochenstunden</p>
                    <p className="font-medium text-foreground">{driver.employment_data.working_hours || "k.A."} Std.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-4">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-primary-foreground/70">
          <p>
            © {new Date().getFullYear()} {driver.companies?.name || "MyDispatch"}
          </p>
        </div>
      </footer>
    </div>
  )
}
