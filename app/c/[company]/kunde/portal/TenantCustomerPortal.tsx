"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Euro,
  FileText,
  Download,
  Phone,
  Mail,
  User,
  LogOut,
  Settings,
  CheckCircle2,
  Plus,
} from "lucide-react"

interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  logo_url: string | null
  company_slug: string
  branding: Record<string, unknown> | null
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  created_at: string
}

interface Booking {
  id: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  status: string
  price: number | null
  notes: string | null
  driver?: {
    first_name: string
    last_name: string
    phone: string | null
  } | null
  vehicle?: {
    brand: string
    model: string
    license_plate: string
  } | null
}

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  status: string
  created_at: string
  pdf_url: string | null
}

interface TenantCustomerPortalProps {
  company: Company
  customer: Customer
  bookings: Booking[]
  invoices: Invoice[]
}

function getSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function TenantCustomerPortal({ company, customer, bookings, invoices }: TenantCustomerPortalProps) {
  const [activeTab, setActiveTab] = useState("fahrten")

  const branding = (company.branding || {}) as Record<string, string>
  const primaryColor = branding.primary_color || branding.primaryColor || "#343f60"

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = `/c/${company.company_slug}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Abgeschlossen</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Fahrt</Badge>
      case "assigned":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Zugewiesen</Badge>
      case "pending":
        return <Badge variant="secondary">Ausstehend</Badge>
      case "cancelled":
        return <Badge variant="destructive">Storniert</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Bezahlt</Badge>
      case "pending":
        return <Badge variant="secondary">Offen</Badge>
      case "overdue":
        return <Badge variant="destructive">Ueberfaellig</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Statistiken berechnen
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const totalBookings = bookings.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
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
                <p className="font-semibold text-slate-900">{company.name}</p>
                <p className="text-xs text-slate-500">Kundenportal</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href={`/c/${company.company_slug}/kunde/portal/einstellungen`}>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Willkommens-Bereich */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Hallo, {customer.first_name}!</h1>
          <p className="text-slate-500">Willkommen in Ihrem Kundenportal bei {company.name}</p>
        </div>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalBookings}</p>
                  <p className="text-sm text-slate-500">Fahrten gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedBookings.length}</p>
                  <p className="text-sm text-slate-500">Abgeschlossen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Euro className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSpent.toFixed(2)} EUR</p>
                  <p className="text-sm text-slate-500">Gesamtausgaben</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Neue Fahrt buchen Button */}
        <div className="mb-6">
          <Link href={`/c/${company.company_slug}/kunde/buchen`}>
            <Button style={{ backgroundColor: primaryColor }} className="text-white">
              <Plus className="h-4 w-4 mr-2" />
              Neue Fahrt buchen
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="fahrten">Meine Fahrten</TabsTrigger>
            <TabsTrigger value="rechnungen">Rechnungen</TabsTrigger>
            <TabsTrigger value="profil">Mein Profil</TabsTrigger>
          </TabsList>

          {/* Fahrten Tab */}
          <TabsContent value="fahrten">
            <Card>
              <CardHeader>
                <CardTitle>Meine Fahrten</CardTitle>
                <CardDescription>Uebersicht ueber alle Ihre Buchungen</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Sie haben noch keine Fahrten gebucht.</p>
                    <Link href={`/c/${company.company_slug}/kunde/buchen`}>
                      <Button variant="link" style={{ color: primaryColor }}>
                        Jetzt erste Fahrt buchen
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">
                              {format(new Date(booking.pickup_time), "dd. MMMM yyyy", { locale: de })}
                            </span>
                            <Clock className="h-4 w-4 text-slate-400 ml-2" />
                            <span>{format(new Date(booking.pickup_time), "HH:mm", { locale: de })} Uhr</span>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{booking.pickup_address}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                            <span className="text-sm">{booking.dropoff_address}</span>
                          </div>
                        </div>

                        {booking.driver && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>
                                {booking.driver.first_name} {booking.driver.last_name}
                              </span>
                            </div>
                            {booking.vehicle && (
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                <span>
                                  {booking.vehicle.brand} {booking.vehicle.model}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {booking.price && (
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <span className="text-sm text-slate-500">Fahrpreis</span>
                            <span className="font-semibold">{booking.price.toFixed(2)} EUR</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rechnungen Tab */}
          <TabsContent value="rechnungen">
            <Card>
              <CardHeader>
                <CardTitle>Meine Rechnungen</CardTitle>
                <CardDescription>Alle Ihre Rechnungen im Ueberblick</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Keine Rechnungen vorhanden.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium">{invoice.invoice_number}</p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(invoice.created_at), "dd.MM.yyyy", { locale: de })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{invoice.amount.toFixed(2)} EUR</span>
                          {getInvoiceStatusBadge(invoice.status)}
                          {invoice.pdf_url && (
                            <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profil">
            <Card>
              <CardHeader>
                <CardTitle>Mein Profil</CardTitle>
                <CardDescription>Ihre persoenlichen Daten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl text-white" style={{ backgroundColor: primaryColor }}>
                        {customer.first_name.charAt(0)}
                        {customer.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl font-semibold">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Kunde seit {format(new Date(customer.created_at), "MMMM yyyy", { locale: de })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">E-Mail</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>

                    {customer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Telefon</p>
                          <p className="font-medium">{customer.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <Link href={`/c/${company.company_slug}/kunde/portal/einstellungen`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Profil bearbeiten
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Kontakt-Bereich */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Hilfe benoetigt?</h3>
                <p className="text-sm text-slate-500">Kontaktieren Sie uns bei Fragen</p>
              </div>
              <div className="flex items-center gap-4">
                {company.phone && (
                  <a href={`tel:${company.phone}`}>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      {company.phone}
                    </Button>
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`}>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      E-Mail
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-8 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {company.name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href={`/c/${company.company_slug}/impressum`} className="hover:underline">
              Impressum
            </Link>
            <Link href={`/c/${company.company_slug}/datenschutz`} className="hover:underline">
              Datenschutz
            </Link>
            <Link href={`/c/${company.company_slug}/agb`} className="hover:underline">
              AGB
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
