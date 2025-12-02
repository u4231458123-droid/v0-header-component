"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import Link from "next/link"
import { CustomerHelpBot } from "@/components/ai/CustomerHelpBot"
import { safeNumber } from "@/lib/utils/safe-number"

export const dynamic = "force-dynamic"

function CarIcon({ className }: { className?: string }) {
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
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}
function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function UserIcon({ className }: { className?: string }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function PhoneIcon({ className }: { className?: string }) {
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
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
function MailIcon({ className }: { className?: string }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
function CreditCardIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
function SettingsIcon({ className }: { className?: string }) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.39a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15-.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function LogOutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
function FileTextIcon({ className }: { className?: string }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
function StarIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function MessageSquareIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

interface CustomerAccount {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  street: string
  house_number: string
  postal_code: string
  city: string
  preferred_payment_method: string
  registered_companies: string[]
}

interface Booking {
  id: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  status: string
  price: number
  passengers: number
  payment_status: string
  company: {
    name: string
    logo_url: string
  }
  driver?: {
    first_name: string
    last_name: string
  }
}

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  status: string
  created_at: string
  due_date: string
}

export default function CustomerPortalPage() {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("fahrten")
  const supabaseRef = createClient()

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    try {
      const supabase = supabaseRef
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Lade Kundenaccount
      const { data: customerData } = await supabase
        .from("customer_accounts")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (customerData) {
        setCustomer(customerData)

        // Lade Buchungen mit Company-Info
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(`
            *,
            company:companies(name, logo_url),
            driver:drivers(first_name, last_name)
          `)
          .eq("customer_id", customerData.id)
          .order("pickup_time", { ascending: false })
          .limit(50)

        if (bookingsData) {
          setBookings(bookingsData)
        }

        // Lade Rechnungen
        const { data: invoicesData } = await supabase
          .from("invoices")
          .select("*")
          .eq("customer_id", customerData.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (invoicesData) {
          setInvoices(invoicesData)
        }
      }
    } catch (error) {
      console.error("Error loading customer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-primary">Abgeschlossen</Badge>
      case "in_progress":
        return <Badge>In Fahrt</Badge>
      case "assigned":
        return <Badge variant="secondary">Zugewiesen</Badge>
      case "pending":
        return <Badge variant="secondary">Ausstehend</Badge>
      case "cancelled":
        return <Badge variant="destructive">Storniert</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleLogout = async () => {
    const supabase = supabaseRef
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Kein Kundenkonto gefunden</CardTitle>
            <CardDescription>
              Sie haben noch kein Kundenkonto. Bitte melden Sie sich bei einem unserer Partner-Unternehmen an.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Zur Startseite</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Berechne Statistiken
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const avgRating = 4.8 // Placeholder

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {customer.first_name?.[0]}
                  {customer.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="text-sm text-muted-foreground">Kundenportal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/kunden-portal/einstellungen">
                  <SettingsIcon className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOutIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{safeNumber(totalSpent).toFixed(0)}€</p>
              <p className="text-sm text-muted-foreground">Fahrten</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{safeNumber(totalSpent).toFixed(0)}€</p>
              <p className="text-sm text-muted-foreground">Ausgaben</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <StarIcon className="h-5 w-5 text-primary fill-primary" />
                <p className="text-3xl font-bold text-foreground">{avgRating}</p>
              </div>
              <p className="text-sm text-muted-foreground">Bewertung</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fahrten" className="gap-2">
              <CarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Fahrten</span>
            </TabsTrigger>
            <TabsTrigger value="rechnungen" className="gap-2">
              <FileTextIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Rechnungen</span>
            </TabsTrigger>
            <TabsTrigger value="profil" className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
          </TabsList>

          {/* Fahrten Tab */}
          <TabsContent value="fahrten" className="mt-4 space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Noch keine Fahrten</p>
                  <p className="text-sm text-slate-400 mt-1">Buchen Sie Ihre erste Fahrt über einen unserer Partner.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.company?.logo_url || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{booking.company?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{booking.company?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(booking.pickup_time), "dd.MM.yyyy, HH:mm", { locale: de })}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <p className="text-sm">{booking.pickup_address}</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2"></div>
                            <p className="text-sm">{booking.dropoff_address}</p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {booking.passengers}
                            </span>
                            {booking.driver && <span>Fahrer: {booking.driver.first_name}</span>}
                          </div>
                          <p className="font-semibold text-foreground">{safeNumber(booking.price).toFixed(2)} €</p>
                        </div>
                      </div>

                      {booking.status === "completed" && (
                        <div className="bg-background px-4 py-2 flex items-center justify-between border-t">
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <MessageSquareIcon className="h-4 w-4 mr-1" />
                            Feedback geben
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            Beleg
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rechnungen Tab */}
          <TabsContent value="rechnungen" className="mt-4 space-y-4">
            {invoices.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileTextIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Keine Rechnungen</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invoice.created_at), "dd.MM.yyyy", { locale: de })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{safeNumber(invoice.amount).toFixed(2)} €</p>
                          <Badge
                            variant={invoice.status === "paid" ? "default" : "secondary"}
                            className={invoice.status === "paid" ? "bg-primary" : ""}
                          >
                            {invoice.status === "paid" ? "Bezahlt" : "Offen"}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" size="sm">
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          PDF herunterladen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profil" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Persönliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vorname</p>
                    <p className="font-medium">{customer.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nachname</p>
                    <p className="font-medium">{customer.last_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MailIcon className="h-3 w-3" /> E-Mail
                  </p>
                  <p className="font-medium">{customer.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" /> Telefon
                  </p>
                  <p className="font-medium">{customer.phone || "Nicht angegeben"}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" /> Adresse
                  </p>
                  <p className="font-medium">
                    {customer.street && customer.house_number ? (
                      <>
                        {customer.street} {customer.house_number}
                        <br />
                        {customer.postal_code} {customer.city}
                      </>
                    ) : (
                      "Nicht angegeben"
                    )}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CreditCardIcon className="h-5 w-5 text-slate-400" />
                    Bevorzugte Zahlungsart
                  </p>
                  <p className="font-medium">
                    {customer.preferred_payment_method === "cash" && "Bargeld"}
                    {customer.preferred_payment_method === "card" && "Kartenzahlung"}
                    {customer.preferred_payment_method === "invoice" && "Rechnung"}
                    {customer.preferred_payment_method === "paypal" && "PayPal"}
                  </p>
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full">
                    <Link href="/kunden-portal/einstellungen">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Profil bearbeiten
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-0">
                <Link
                  href="/kunden-portal/zahlungsmethoden"
                  className="flex items-center justify-between p-4 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-5 w-5 text-slate-400" />
                    <span>Zahlungsmethoden verwalten</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                </Link>
                <Separator />
                <Link
                  href="/kunden-portal/benachrichtigungen"
                  className="flex items-center justify-between p-4 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquareIcon className="h-5 w-5 text-slate-400" />
                    <span>Benachrichtigungen</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                </Link>
                <Separator />
                <Link
                  href="/datenschutz"
                  className="flex items-center justify-between p-4 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="h-5 w-5 text-slate-400" />
                    <span>Datenschutz</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                </Link>
              </CardContent>
            </Card>

            {/* Kunden AI Chatbot */}
            <CustomerHelpBot />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
