import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import Link from "next/link"
import { DashboardMapWidget } from "@/components/dashboard/DashboardMapWidget"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import {
  ClipboardList,
  Zap,
  Users,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  Car,
  FileText,
  Calendar,
} from "lucide-react"

// Force dynamic rendering - Version 0.2.0
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Spezielle Routing-Logik für Master-Account (courbois1981@gmail.com)
  // Master-Account hat direkten Zugang ins Dashboard ohne weitere Checks
  const MASTER_ACCOUNT_EMAIL = "courbois1981@gmail.com"
  const CUSTOMER_ACCOUNT_EMAIL = "courbois83@gmail.com"

  if (user.email === MASTER_ACCOUNT_EMAIL) {
    // Master-Account: Direkter Zugang, keine weiteren Checks nötig
    // Weiter mit normalem Dashboard-Flow
  } else if (user.email === CUSTOMER_ACCOUNT_EMAIL) {
    // Kunden-Account: Weiterleitung ins Kunden-Portal
    const { data: customer } = await supabase
      .from("customers")
      .select("id, company_id, company:companies(company_slug)")
      .eq("user_id", user.id)
      .single()

    if (customer) {
      const companySlug = (customer.company as any)?.company_slug
      if (companySlug) {
        redirect(`/c/${companySlug}/kunde/portal`)
      }
      redirect("/kunden-portal")
    }
    redirect("/kunden-portal")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, company:companies(*), role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "driver") {
    redirect("/fahrer-portal")
  }

  if (profile?.role === "customer") {
    const { data: customer } = await supabase
      .from("customers")
      .select("id, company_id, company:companies(company_slug)")
      .eq("user_id", user.id)
      .single()

    if (customer) {
      const companySlug = (customer.company as any)?.company_slug
      if (companySlug) {
        redirect(`/c/${companySlug}/kunde/portal`)
      }
    }
    redirect("/kunden-portal")
  }

  if (profileError || !profile) {
    // Pruefe ob Fahrer
    const { data: driver } = await supabase
      .from("drivers")
      .select("id, company_id, company:companies(company_slug)")
      .eq("user_id", user.id)
      .single()

    if (driver) {
      redirect("/fahrer-portal")
    }

    // Pruefe ob Kunde
    const { data: customer } = await supabase
      .from("customers")
      .select("id, company_id, company:companies(company_slug)")
      .eq("user_id", user.id)
      .single()

    if (customer) {
      const companySlug = (customer.company as any)?.company_slug
      if (companySlug) {
        redirect(`/c/${companySlug}/kunde/portal`)
      }
      redirect("/kunden-portal")
    }

    // Pruefe customer_accounts als Fallback
    const { data: customerAccount } = await supabase
      .from("customer_accounts")
      .select("id, registered_companies")
      .eq("user_id", user.id)
      .single()

    if (customerAccount) {
      redirect("/kunden-portal")
    }

    // Kein bekannter Nutzertyp - Logout und zur Startseite
    await supabase.auth.signOut()
    redirect("/")
  }

  const companyId = profile?.company_id

  const stats = {
    bookingsToday: 0,
    activeBookings: 0,
    driversAvailable: 0,
    driversTotal: 0,
    customersTotal: 0,
    revenueToday: 0,
    revenue30Days: 0,
    pendingInvoices: 0,
    vehiclesTotal: 0,
    bookingsYesterday: 0,
    customersLastMonth: 0,
  }

  let recentBookings: any[] = []
  let upcomingBookings: any[] = []
  let vehicles: any[] = []
  let revenueData: any[] = []
  let customers: any[] = []
  let drivers: any[] = []

  if (companyId) {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      bookingsTodayRes,
      bookingsYesterdayRes,
      activeBookingsRes,
      driversAvailableRes,
      driversTotalRes,
      customersTotalRes,
      recentBookingsRes,
      upcomingBookingsRes,
      pendingInvoicesRes,
      vehiclesRes,
      revenue30DaysRes,
      customersRes,
      driversRes,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("pickup_time", todayStr),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("pickup_time", yesterdayStr)
        .lt("pickup_time", todayStr),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .in("status", ["confirmed", "assigned", "in_progress"]),
      supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "available"),
      supabase.from("drivers").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase
        .from("bookings")
        .select("*, customer:customers(first_name, last_name, salutation), driver:drivers(first_name, last_name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("bookings")
        .select("*, customer:customers(first_name, last_name, salutation), driver:drivers(first_name, last_name)")
        .eq("company_id", companyId)
        .gte("pickup_time", today.toISOString())
        .in("status", ["pending", "confirmed", "assigned"])
        .order("pickup_time", { ascending: true })
        .limit(5),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "pending"),
      supabase
        .from("vehicles")
        .select(
          `id, license_plate, make, model, status, current_lat, current_lng, location_updated_at, driver:drivers(first_name, last_name)`,
        )
        .eq("company_id", companyId),
      supabase
        .from("bookings")
        .select("price, pickup_time, created_at")
        .eq("company_id", companyId)
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("customers")
        .select("id, first_name, last_name, salutation, email, phone")
        .eq("company_id", companyId)
        .limit(100),
      supabase.from("drivers").select("id, first_name, last_name, status").eq("company_id", companyId),
    ])

    stats.bookingsToday = bookingsTodayRes.count || 0
    stats.bookingsYesterday = bookingsYesterdayRes.count || 0
    stats.activeBookings = activeBookingsRes.count || 0
    stats.driversAvailable = driversAvailableRes.count || 0
    stats.driversTotal = driversTotalRes.count || 0
    stats.customersTotal = customersTotalRes.count || 0
    stats.pendingInvoices = pendingInvoicesRes.count || 0
    recentBookings = recentBookingsRes.data || []
    upcomingBookings = upcomingBookingsRes.data || []
    customers = customersRes.data || []
    drivers = driversRes.data || []

    if (revenue30DaysRes.data) {
      stats.revenue30Days = revenue30DaysRes.data.reduce((sum, b) => sum + (Number(b.price) || 0), 0)
      const revenueByDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        revenueByDay[dateStr] = 0
      }
      revenue30DaysRes.data.forEach((booking) => {
        const dateStr = new Date(booking.created_at).toISOString().split("T")[0]
        if (revenueByDay[dateStr] !== undefined) {
          revenueByDay[dateStr] += Number(booking.price) || 0
        }
      })
      revenueData = Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount,
        label: new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      }))
    }

    if (!vehiclesRes.error && vehiclesRes.data) {
      stats.vehiclesTotal = vehiclesRes.data.length
      vehicles = vehiclesRes.data.map((v: any) => ({
        id: v.id,
        licensePlate: v.license_plate,
        make: v.make,
        model: v.model,
        status: v.status || "offline",
        location: v.current_lat && v.current_lng ? { lat: v.current_lat, lng: v.current_lng } : undefined,
        driverName: v.driver ? `${v.driver.first_name} ${v.driver.last_name}` : undefined,
        lastUpdate: v.location_updated_at,
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/15 text-success"
      case "in_progress":
        return "bg-info/15 text-info"
      case "confirmed":
      case "assigned":
        return "bg-warning/15 text-warning"
      case "cancelled":
        return "bg-destructive/15 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Abgeschlossen"
      case "in_progress":
        return "Unterwegs"
      case "confirmed":
        return "Bestätigt"
      case "assigned":
        return "Zugewiesen"
      case "cancelled":
        return "Storniert"
      case "pending":
        return "Ausstehend"
      default:
        return status
    }
  }

  const bookingsTrend =
    stats.bookingsYesterday > 0
      ? Math.round(((stats.bookingsToday - stats.bookingsYesterday) / stats.bookingsYesterday) * 100)
      : stats.bookingsToday > 0
        ? 100
        : 0

  return (
    <MainLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto">
        <DashboardHeader
          userName={profile?.full_name || user.email?.split("@")[0] || "Benutzer"}
          companyId={companyId}
          customers={customers}
          drivers={drivers}
        />

        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {/* Aufträge Heute */}
          <Link
            href="/auftraege"
            className="group relative bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            {bookingsTrend !== 0 && (
              <div
                className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bookingsTrend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={bookingsTrend >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                  />
                </svg>
                {Math.abs(bookingsTrend)}%
              </div>
            )}
            <div className="flex items-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{stats.bookingsToday}</p>
              <p className="text-sm text-muted-foreground">Aufträge heute</p>
            </div>
            {/* Integrierte Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden rounded-b-2xl opacity-30">
              <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 25 Q10 20 20 22 T40 15 T60 20 T80 12 T100 18 V30 H0 Z" fill="url(#spark1)" />
                <path
                  d="M0 25 Q10 20 20 22 T40 15 T60 20 T80 12 T100 18"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </Link>

          {/* Aktive Fahrten */}
          <Link
            href="/auftraege?status=active"
            className="group relative bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            {stats.activeBookings > 0 && (
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
            )}
            <div className="flex items-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{stats.activeBookings}</p>
              <p className="text-sm text-muted-foreground">Aktive Fahrten</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden rounded-b-2xl opacity-30">
              <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 20 Q15 25 25 18 T50 22 T75 15 T100 20 V30 H0 Z" fill="url(#spark2)" />
                <path
                  d="M0 20 Q15 25 25 18 T50 22 T75 15 T100 20"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </Link>

          {/* Fleet mit Donut-Chart */}
          <Link
            href="/fleet"
            className="group relative bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute top-3 right-3 w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.driversAvailable / Math.max(stats.driversTotal, 1)) * 88} 88`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">
                {stats.driversAvailable}
                <span className="text-lg font-normal text-muted-foreground">/{stats.driversTotal}</span>
              </p>
              <p className="text-sm text-muted-foreground">Fahrer verfügbar</p>
            </div>
          </Link>

          {/* Kunden */}
          <Link
            href="/kunden"
            className="group relative bg-card rounded-2xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <ChevronRight className="absolute top-3 right-3 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{stats.customersTotal}</p>
              <p className="text-sm text-muted-foreground">Kunden gesamt</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden rounded-b-2xl opacity-30">
              <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 22 Q20 18 35 25 T60 15 T85 20 T100 12 V30 H0 Z" fill="url(#spark4)" />
                <path
                  d="M0 22 Q20 18 35 25 T60 15 T85 20 T100 12"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </Link>
        </div>

        <div className="grid gap-5 grid-cols-3">
          <Link
            href="/fleet"
            className="group bg-card rounded-2xl border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.vehiclesTotal}</p>
                <p className="text-sm text-muted-foreground">Fahrzeuge</p>
              </div>
            </div>
          </Link>

          <Link
            href="/finanzen"
            className="group bg-card rounded-2xl border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingInvoices}</p>
                <p className="text-sm text-muted-foreground">Offene Rechnungen</p>
              </div>
            </div>
          </Link>

          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.revenue30Days.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
                </p>
                <p className="text-sm text-muted-foreground">Umsatz 30 Tage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Map Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg font-semibold">Live-Übersicht</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Fahrzeugstandorte, Wetter & Verkehr</p>
          </div>
          <div className="p-5">
            <DashboardMapWidget companyId={companyId} initialVehicles={vehicles} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Letzte Aufträge */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Letzte Aufträge</h3>
                  <p className="text-xs text-muted-foreground">Die neuesten 5 Buchungen</p>
                </div>
              </div>
              <Link
                href="/auftraege"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Alle <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-border flex-1">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="px-6 py-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {booking.customer
                            ? `${booking.customer.salutation || ""} ${booking.customer.first_name} ${booking.customer.last_name}`.trim()
                            : "Unbekannter Kunde"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {booking.pickup_address} → {booking.dropoff_address}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Keine Aufträge vorhanden</p>
                </div>
              )}
            </div>
          </div>

          {/* Nächste Aufträge */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Nächste Aufträge</h3>
                  <p className="text-xs text-muted-foreground">Die nächsten 5 geplanten Fahrten</p>
                </div>
              </div>
              <Link
                href="/auftraege?filter=upcoming"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Alle <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-border flex-1">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="px-6 py-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {booking.customer
                            ? `${booking.customer.salutation || ""} ${booking.customer.first_name} ${booking.customer.last_name}`.trim()
                            : "Unbekannter Kunde"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {booking.pickup_address} → {booking.dropoff_address}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-foreground">
                          {new Date(booking.pickup_time).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.pickup_time).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Keine geplanten Aufträge</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Umsatz Chart */}
        <DashboardCharts revenueData={revenueData} totalRevenue={stats.revenue30Days} />
      </div>
    </MainLayout>
  )
}
