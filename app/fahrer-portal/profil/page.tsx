"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { format, differenceInDays } from "date-fns"
import { de } from "date-fns/locale"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Shield,
  AlertTriangle,
  Home,
  FileText,
  LogOut,
  Car,
  Clock,
  Star,
} from "lucide-react"
import { safeNumber } from "@/lib/utils/safe-number"

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
        .select("*, companies(name)")
        .eq("user_id", user.id)
        .single()

      if (driverError || !driverData) {
        toast.error("Fahrerprofil nicht gefunden")
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
      toast.error("Fehler beim Laden des Profils")
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
      toast.success("Kontaktdaten aktualisiert")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const getDaysUntilExpiry = (date: string | null) => {
    if (!date) return null
    return differenceInDays(new Date(date), new Date())
  }

  const getExpiryBadge = (days: number | null) => {
    if (days === null) return null
    if (days < 0) return <Badge variant="destructive">Abgelaufen</Badge>
    if (days <= 30) return <Badge className="bg-amber-500 text-white">Läuft in {days} Tagen ab</Badge>
    return <Badge className="bg-emerald-500 text-white">Gültig</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-muted-foreground">Lade Profil...</div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
  const pbefExpiry = getDaysUntilExpiry(driver.pbef_data?.valid_until || null)
  const licenseClasses = driver.license_classes || driver.license_data?.classes || []

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
                <h1 className="font-semibold text-slate-900">Mein Profil</h1>
                <p className="text-xs text-slate-500">{driver.companies?.name || "Unternehmen"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/fahrer-portal">
                <Button variant="ghost" size="icon" className="rounded-full text-slate-700 hover:text-slate-900">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/fahrer-portal/dokumente">
                <Button variant="ghost" size="icon" className="rounded-full text-slate-700 hover:text-slate-900">
                  <FileText className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-700 hover:text-slate-900"
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
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Achtung: Dokumente laufen bald ab</p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    {licenseExpiry !== null && licenseExpiry <= 30 && (
                      <li>Führerschein: {licenseExpiry < 0 ? "Abgelaufen" : `${licenseExpiry} Tage`}</li>
                    )}
                    {pbefExpiry !== null && pbefExpiry <= 30 && (
                      <li>P-Schein: {pbefExpiry < 0 ? "Abgelaufen" : `${pbefExpiry} Tage`}</li>
                    )}
                  </ul>
                  <Link
                    href="/fahrer-portal/dokumente"
                    className="text-sm text-amber-800 hover:underline mt-2 inline-block font-medium"
                  >
                    Dokumente aktualisieren →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profil Header */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {driver.first_name?.[0]}
                  {driver.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {driver.salutation} {driver.title && `${driver.title} `}
                  {driver.first_name} {driver.last_name}
                </h2>
                <p className="text-slate-500">
                  Fahrer seit{" "}
                  {driver.employment_data?.start_date
                    ? format(new Date(driver.employment_data.start_date), "MMMM yyyy", { locale: de })
                    : "k.A."}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge
                    className={
                      driver.status === "available" || driver.status === "active"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-700"
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
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                      <Car className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.total_bookings}</div>
                    <div className="text-xs text-slate-500">Fahrten</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{safeNumber(stats.avg_rating).toFixed(1)}</div>
                    <div className="text-xs text-slate-500">Bewertung</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kontaktdaten */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-slate-900">Kontaktdaten</CardTitle>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                {editMode ? (
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    className="border-0 bg-white"
                  />
                ) : (
                  <span className="text-slate-700">{driver.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-5 h-5 text-slate-400" />
                {editMode ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-0 bg-white"
                  />
                ) : (
                  <span className="text-slate-700">{driver.phone}</span>
                )}
              </div>
            </div>
            {driver.address_data && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <span className="text-slate-700">
                  {driver.address_data.street} {driver.address_data.house_number}, {driver.address_data.postal_code}{" "}
                  {driver.address_data.city}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dokumente & Lizenzen */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Dokumente & Lizenzen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Führerschein</p>
                  <p className="text-sm text-slate-500">Nr. {driver.license_number}</p>
                </div>
              </div>
              <div className="text-right">
                {driver.license_expiry && (
                  <>
                    <p className="text-sm text-slate-600">
                      Gültig bis {format(new Date(driver.license_expiry), "dd.MM.yyyy")}
                    </p>
                    {getExpiryBadge(licenseExpiry)}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">P-Schein</p>
                  <p className="text-sm text-slate-500">
                    {driver.pbef_data?.number ? `Nr. ${driver.pbef_data.number}` : "Keine Nummer hinterlegt"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {driver.pbef_data?.valid_until && (
                  <>
                    <p className="text-sm text-slate-600">
                      Gültig bis {format(new Date(driver.pbef_data.valid_until), "dd.MM.yyyy")}
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
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Arbeitsverhältnis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Eintrittsdatum</p>
                    <p className="font-medium text-slate-900">
                      {driver.employment_data.start_date
                        ? format(new Date(driver.employment_data.start_date), "dd.MM.yyyy")
                        : "k.A."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Vertragsart</p>
                    <p className="font-medium text-slate-900">{driver.employment_data.contract_type || "k.A."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Wochenstunden</p>
                    <p className="font-medium text-slate-900">{driver.employment_data.working_hours || "k.A."} Std.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {driver.companies?.name || "MyDispatch"}
          </p>
        </div>
      </footer>
    </div>
  )
}
