"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Car,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  LogOut,
  Navigation,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface Company {
  id: string
  name: string
  logo_url: string | null
  company_slug: string
  branding: any
  contact_info: any
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  mobile: string | null
  status: string
  license_number: string
  license_expiry: string | null
}

interface Booking {
  id: string
  customer_name: string
  pickup_address: string
  destination_address: string
  pickup_time: string
  status: string
  passenger_count: number
  notes: string | null
  price: number | null
}

interface Shift {
  id: string
  start_time: string
  end_time: string
  status: string
}

interface TenantDriverPortalProps {
  company: Company
  driver: Driver
  bookings: Booking[]
  shifts: Shift[]
}

function getSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function TenantDriverPortal({ company, driver, bookings, shifts }: TenantDriverPortalProps) {
  const [activeTab, setActiveTab] = useState("auftraege")
  const [driverStatus, setDriverStatus] = useState(driver.status || "offline")

  const branding = company.branding || {}
  const primaryColor = branding.primary_color || branding.primaryColor || "#343f60"

  const todayBookings = bookings.filter((b) => {
    const pickupDate = new Date(b.pickup_time)
    const today = new Date()
    return pickupDate.toDateString() === today.toDateString()
  })

  const upcomingBookings = bookings.filter((b) => {
    const pickupDate = new Date(b.pickup_time)
    const today = new Date()
    return pickupDate > today && pickupDate.toDateString() !== today.toDateString()
  })

  const completedBookings = bookings.filter((b) => b.status === "completed")

  const handleStatusChange = async (newStatus: string) => {
    const supabase = getSupabaseClient()
    await supabase.from("drivers").update({ status: newStatus }).eq("id", driver.id)
    setDriverStatus(newStatus)
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    // Redirect zur Login-Seite des Unternehmens
    window.location.href = `/c/${company.company_slug}/login`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
    > = {
      pending: { label: "Ausstehend", variant: "secondary", icon: Clock },
      confirmed: { label: "Bestaetigt", variant: "default", icon: CheckCircle },
      in_progress: { label: "Aktiv", variant: "default", icon: Play },
      completed: { label: "Abgeschlossen", variant: "outline", icon: CheckCircle },
      cancelled: { label: "Storniert", variant: "destructive", icon: XCircle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getDriverStatusColor = () => {
    switch (driverStatus) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/c/${company.company_slug}`} className="flex items-center gap-3">
              {company.logo_url ? (
                <Image
                  src={company.logo_url || "/placeholder.svg"}
                  alt={company.name}
                  width={40}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-900 block">{company.name}</span>
                <span className="text-xs text-slate-500">Fahrer-Portal</span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {todayBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {todayBookings.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Driver Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {driver.first_name.charAt(0)}
                    {driver.last_name.charAt(0)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${getDriverStatusColor()}`}
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">
                    {driver.first_name} {driver.last_name}
                  </h2>
                  <p className="text-sm text-slate-500">{driver.phone}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={driverStatus === "available" ? "default" : "outline"}
                  onClick={() => handleStatusChange("available")}
                  style={driverStatus === "available" ? { backgroundColor: primaryColor } : {}}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Verfuegbar
                </Button>
                <Button
                  size="sm"
                  variant={driverStatus === "offline" ? "secondary" : "outline"}
                  onClick={() => handleStatusChange("offline")}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Offline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                {todayBookings.length}
              </div>
              <div className="text-xs text-slate-500">Heute</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                {upcomingBookings.length}
              </div>
              <div className="text-xs text-slate-500">Anstehend</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                {completedBookings.length}
              </div>
              <div className="text-xs text-slate-500">Abgeschlossen</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="auftraege">Auftraege</TabsTrigger>
            <TabsTrigger value="schichten">Schichten</TabsTrigger>
            <TabsTrigger value="profil">Profil</TabsTrigger>
          </TabsList>

          {/* Auftraege Tab */}
          <TabsContent value="auftraege" className="space-y-4">
            {todayBookings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                  Heute ({todayBookings.length})
                </h3>
                <div className="space-y-3">
                  {todayBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="font-semibold">
                                {format(new Date(booking.pickup_time), "HH:mm", { locale: de })} Uhr
                              </span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Abholung</p>
                                <p className="text-sm">{booking.pickup_address}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Ziel</p>
                                <p className="text-sm">{booking.destination_address}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User className="h-4 w-4" />
                              {booking.customer_name}
                              {booking.passenger_count > 1 && (
                                <span className="text-slate-400">(+{booking.passenger_count - 1})</span>
                              )}
                            </div>
                            <Button size="sm" style={{ backgroundColor: primaryColor }} className="text-white">
                              <Navigation className="h-4 w-4 mr-1" />
                              Navigation
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {upcomingBookings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: primaryColor }} />
                  Anstehend ({upcomingBookings.length})
                </h3>
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {format(new Date(booking.pickup_time), "dd.MM.yyyy", { locale: de })}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(booking.pickup_time), "HH:mm", { locale: de })} Uhr -{" "}
                              {booking.pickup_address.substring(0, 30)}...
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {todayBookings.length === 0 && upcomingBookings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">Keine Auftraege vorhanden</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schichten Tab */}
          <TabsContent value="schichten" className="space-y-4">
            {shifts.length > 0 ? (
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <Card key={shift.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {format(new Date(shift.start_time), "dd.MM.yyyy", { locale: de })}
                          </p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(shift.start_time), "HH:mm", { locale: de })} -{" "}
                            {format(new Date(shift.end_time), "HH:mm", { locale: de })} Uhr
                          </p>
                        </div>
                        <Badge variant={shift.status === "active" ? "default" : "secondary"}>
                          {shift.status === "active" ? "Aktiv" : "Geplant"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">Keine Schichten geplant</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Persoenliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Vorname</p>
                    <p className="font-medium">{driver.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nachname</p>
                    <p className="font-medium">{driver.last_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-5 w-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-xs text-slate-500">Telefon</p>
                    <p className="font-medium">{driver.phone}</p>
                  </div>
                </div>

                {driver.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="h-5 w-5" style={{ color: primaryColor }} />
                    <div>
                      <p className="text-xs text-slate-500">E-Mail</p>
                      <p className="font-medium">{driver.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuehrerschein</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Fuehrerscheinnummer</p>
                  <p className="font-medium">{driver.license_number}</p>
                </div>
                {driver.license_expiry && (
                  <div>
                    <p className="text-xs text-slate-500">Gueltig bis</p>
                    <p className="font-medium">
                      {format(new Date(driver.license_expiry), "dd.MM.yyyy", { locale: de })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Passwort aendern
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
