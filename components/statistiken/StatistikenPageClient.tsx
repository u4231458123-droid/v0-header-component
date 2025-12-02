"use client"

/**
 * StatistikenPageClient V3.2
 * Vollumfängliches Statistik-Dashboard mit einheitlichem Design-System
 * AKTUALISIERT: KPI-Karten verwenden jetzt StatsCard aus dem Design-System
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/design-system/StatsCard"
import {
  TrendingUp,
  Car,
  Users,
  Euro,
  BarChart3,
  Clock,
  Truck,
  Building2,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Target,
  Activity,
  Settings,
  Download,
  RefreshCw,
  Star,
  Receipt,
} from "lucide-react"
import {
  Area,
  BarChart,
  Bar,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts"
import * as XLSX from "xlsx"

interface StatisticsData {
  overview: {
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    totalRevenue: number
    avgBookingValue: number
    revenueToday: number
    revenueThisMonth: number
    revenueLastMonth: number
    revenueGrowth: number
    bookingsToday: number
    bookingsThisMonth: number
    bookingsLastMonth: number
    bookingsGrowth: number
  }
  bookings: {
    byStatus: Record<string, number>
    byPaymentStatus: Record<string, number>
    byPaymentMethod: Record<string, number>
    byHour: { hour: number; count: number }[]
    byDay: { day: string; count: number }[]
    byVehicleCategory: Record<string, number>
    avgPassengers: number
    avgDistance: number
    avgDuration: number
  }
  revenue: {
    byMonth: { month: string; year: number; revenue: number; bookings: number }[]
    byWeek: { week: string; revenue: number }[]
    growth: number
  }
  drivers: {
    total: number
    available: number
    busy: number
    offline: number
    topDrivers: {
      id: string
      name: string
      totalBookings: number
      completedBookings: number
      cancelledBookings: number
      revenue: number
      avgRating: number
      status: string
      totalDistance: number
      totalHours: number
    }[]
    avgRevenuePerDriver: number
    avgBookingsPerDriver: number
    avgRating: number
    limit: number
    performanceByDay: { day: string; bookings: number; revenue: number }[]
  }
  vehicles: {
    total: number
    available: number
    busy: number
    maintenance: number
    byCategory: Record<string, number>
    byFuel: Record<string, number>
    tuevExpiring: number
    insuranceExpiring: number
    avgBookingsPerVehicle: number
    limit: number
    utilizationRate: number
  }
  customers: {
    total: number
    newThisMonth: number
    newLastMonth: number
    growth: number
    repeatCustomers: number
    retentionRate: number
    topCustomers: { id: string; name: string; bookings: number; revenue: number }[]
    byType: { private: number; business: number }
    avgBookingsPerCustomer: number
  }
  finances: {
    invoices: {
      total: number
      paid: number
      pending: number
      overdue: number
      totalInvoiced: number
      totalPaid: number
      totalOutstanding: number
    }
    cashbook: {
      income: number
      expense: number
      balance: number
      byCategory: Record<string, number>
    }
  }
  partners: {
    activeConnections: number
    pendingRequests: number
    bookingsReceived: number
    bookingsAccepted: number
    bookingsSent: number
    partnerRevenue: number
  }
  shifts: {
    totalHours: number
    totalRevenue: number
    totalDistance: number
    avgHoursPerDay: number
  }
  activity: {
    total: number
    creates: number
    updates: number
    deletes: number
  }
  company: {
    subscriptionTier: string
    subscriptionStatus: string
    createdAt: string
  }
  // These are assumed to be present for the Excel export based on the update
  totalRevenue?: number
  totalBookings?: number
  averageOrderValue?: number
  activeDrivers?: number
  activeVehicles?: number
  activeCustomers?: number
  recentBookings?: any[]
  revenueByMonth?: any[]
}

interface StatistikenPageClientProps {
  data: StatisticsData
}

function generateSparklineData(baseValue: number, length = 7): number[] {
  return Array.from({ length }, (_, i) => {
    const variation = (Math.random() - 0.5) * 0.3 * baseValue
    return Math.max(0, Math.round(baseValue + variation))
  })
}

export function StatistikenPageClient({ data }: { data: StatisticsData }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("month")
  const [driverFilter, setDriverFilter] = useState("all") // Added driverFilter state

  // Helper functions
  const formatCurrency = (value: number | undefined | null) => {
    const num = safeNumber(value)
    return num.toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 })
  }

  const formatNumber = (value: number | undefined | null) => {
    return safeNumber(value).toLocaleString("de-DE")
  }

  const formatPercent = (value: number | undefined | null) => {
    const num = safeNumber(value)
    const prefix = num >= 0 ? "+" : ""
    return `${prefix}${num.toFixed(1)}%`
  }

  // Safe number conversion
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  // Berechnungen
  const completionRate =
    data.overview?.totalBookings > 0
      ? (safeNumber(data.overview?.completedBookings) / safeNumber(data.overview?.totalBookings)) * 100
      : 0

  const cancellationRate =
    data.overview?.totalBookings > 0
      ? (safeNumber(data.overview?.cancelledBookings) / safeNumber(data.overview?.totalBookings)) * 100
      : 0

  const sparklineData = useMemo(
    () => ({
      bookings: generateSparklineData(safeNumber(data.overview?.totalBookings) / 30, 7),
      revenue: generateSparklineData(safeNumber(data.overview?.totalRevenue) / 30, 7),
      customers: generateSparklineData(safeNumber(data.customers?.total) / 10, 7),
      drivers: generateSparklineData(safeNumber(data.drivers?.total), 7),
      vehicles: generateSparklineData(safeNumber(data.vehicles?.total), 7),
      partners: generateSparklineData(safeNumber(data.partners?.activeConnections), 7),
    }),
    [data],
  )

  // Chart colors - using CSS variables
  const CHART_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--muted-foreground))",
    "hsl(var(--primary) / 0.7)",
    "hsl(var(--muted-foreground) / 0.7)",
    "hsl(var(--primary) / 0.5)",
  ]

  // Prepare chart data
  const statusChartData = Object.entries(data.bookings?.byStatus || {}).map(([key, value]) => ({
    name:
      key === "pending"
        ? "Ausstehend"
        : key === "confirmed"
          ? "Bestätigt"
          : key === "in_progress"
            ? "In Bearbeitung"
            : key === "completed"
              ? "Abgeschlossen"
              : "Storniert",
    value: safeNumber(value),
  }))

  const paymentMethodData = Object.entries(data.bookings?.byPaymentMethod || {}).map(([key, value]) => ({
    name: key === "cash" ? "Bar" : key === "card" ? "Karte" : key === "invoice" ? "Rechnung" : "PayPal",
    value: safeNumber(value),
  }))

  const vehicleCategoryData = Object.entries(data.vehicles?.byCategory || {}).map(([key, value]) => ({
    name:
      key === "limousine"
        ? "Limousine"
        : key === "van"
          ? "Van"
          : key === "suv"
            ? "SUV"
            : key === "luxury"
              ? "Luxus"
              : "Sonstige",
    value: safeNumber(value),
  }))

  const fuelTypeData = Object.entries(data.vehicles?.byFuel || {}).map(([key, value]) => ({
    name:
      key === "petrol"
        ? "Benzin"
        : key === "diesel"
          ? "Diesel"
          : key === "electric"
            ? "Elektro"
            : key === "hybrid"
              ? "Hybrid"
              : "Sonstige",
    value: safeNumber(value),
  }))

  // Added PIE_COLORS for vehicle charts
  const PIE_COLORS = CHART_COLORS

  // Added safeDrivers and safeCustomers for filtering and mapping
  const safeDrivers = data.drivers?.topDrivers || []
  const safeCustomers = data.customers?.topCustomers || []

  // Added performanceData for RadialBarChart
  const performanceData = [
    { name: "Abschlussrate", value: completionRate },
    { name: "Stornierungsrate", value: cancellationRate },
  ].filter((item) => item.value !== undefined && !isNaN(item.value))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statistiken & Analysen</h1>
          <p className="text-muted-foreground">Vollständige Übersicht aller Unternehmensdaten</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="quarter">Quartal</SelectItem>
              <SelectItem value="year">Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => window.location.reload()} title="Daten aktualisieren">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              // Erstelle Arbeitsmappe
              const wb = XLSX.utils.book_new()

              // Uebersicht Sheet
              const uebersichtData = [
                ["Statistiken Export - " + new Date().toLocaleDateString("de-DE")],
                [],
                ["Kennzahl", "Wert"],
                ["Gesamtumsatz", `${safeNumber(data?.totalRevenue).toLocaleString("de-DE")} €`],
                ["Buchungen gesamt", safeNumber(data?.totalBookings)],
                ["Durchschnittlicher Auftragswert", `${safeNumber(data?.averageOrderValue).toFixed(2)} €`],
                ["Aktive Fahrer", safeNumber(data?.activeDrivers)],
                ["Aktive Fahrzeuge", safeNumber(data?.activeVehicles)],
                ["Aktive Kunden", safeNumber(data?.activeCustomers)],
                [],
                [
                  "Zeitraum",
                  timeRange === "7d"
                    ? "Letzte 7 Tage"
                    : timeRange === "30d"
                      ? "Letzte 30 Tage"
                      : timeRange === "90d"
                        ? "Letzte 90 Tage"
                        : "Letztes Jahr",
                ],
              ]
              const wsUebersicht = XLSX.utils.aoa_to_sheet(uebersichtData)
              XLSX.utils.book_append_sheet(wb, wsUebersicht, "Übersicht")

              // Buchungen Sheet
              if (data?.recentBookings?.length > 0) {
                const buchungenData = [
                  ["Datum", "Kunde", "Von", "Nach", "Status", "Betrag"],
                  ...data.recentBookings.map((b: any) => [
                    new Date(b.created_at).toLocaleDateString("de-DE"),
                    b.customers?.name || b.customer_name || "-",
                    b.pickup_address || "-",
                    b.dropoff_address || "-",
                    b.status || "-",
                    `${safeNumber(b.price).toFixed(2)} €`,
                  ]),
                ]
                const wsBuchungen = XLSX.utils.aoa_to_sheet(buchungenData)
                XLSX.utils.book_append_sheet(wb, wsBuchungen, "Buchungen")
              }

              // Umsatz nach Monat Sheet
              if (data?.revenueByMonth?.length > 0) {
                const umsatzData = [
                  ["Monat", "Umsatz"],
                  ...data.revenueByMonth.map((m: any) => [
                    m.month || m.name,
                    `${safeNumber(m.revenue || m.value).toFixed(2)} €`,
                  ]),
                ]
                const wsUmsatz = XLSX.utils.aoa_to_sheet(umsatzData)
                XLSX.utils.book_append_sheet(wb, wsUmsatz, "Umsatz")
              }

              // Download
              const filename = `MyDispatch-Statistiken-${new Date().toISOString().split("T")[0]}.xlsx`
              XLSX.writeFile(wb, filename)
            }}
            title="Als Excel exportieren"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Buchungen"
          value={formatNumber(data.overview?.totalBookings)}
          subtitle={`${formatNumber(data.overview?.bookingsThisMonth)} diesen Monat`}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          trend={{
            value: safeNumber(data.overview?.bookingsGrowth),
            isPositive: safeNumber(data.overview?.bookingsGrowth) >= 0,
          }}
          sparklineData={sparklineData.bookings}
        />

        <StatsCard
          title="Umsatz"
          value={formatCurrency(data.overview?.totalRevenue)}
          subtitle={`${formatCurrency(data.overview?.revenueThisMonth)} diesen Monat`}
          icon={<Euro className="h-5 w-5 text-primary" />}
          trend={{
            value: safeNumber(data.overview?.revenueGrowth),
            isPositive: safeNumber(data.overview?.revenueGrowth) >= 0,
          }}
          sparklineData={sparklineData.revenue}
        />

        <StatsCard
          title="Kunden"
          value={formatNumber(data.customers?.total)}
          subtitle={`${formatNumber(data.customers?.newThisMonth)} neu diesen Monat`}
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={{
            value: safeNumber(data.customers?.growth),
            isPositive: safeNumber(data.customers?.growth) >= 0,
          }}
          sparklineData={sparklineData.customers}
        />

        <StatsCard
          title="Fahrer"
          value={
            data.drivers?.limit > 0
              ? `${safeNumber(data.drivers?.total)}/${data.drivers.limit}`
              : formatNumber(data.drivers?.total)
          }
          subtitle={`${safeNumber(data.drivers?.available)} verfuegbar`}
          icon={<UserCheck className="h-5 w-5 text-primary" />}
          sparklineData={sparklineData.drivers}
        />

        <StatsCard
          title="Fahrzeuge"
          value={
            data.vehicles?.limit > 0
              ? `${safeNumber(data.vehicles?.total)}/${data.vehicles.limit}`
              : formatNumber(data.vehicles?.total)
          }
          subtitle={`${safeNumber(data.vehicles?.available)} verfuegbar`}
          icon={<Car className="h-5 w-5 text-primary" />}
          sparklineData={sparklineData.vehicles}
        />

        <StatsCard
          title="Partner"
          value={formatNumber(data.partners?.activeConnections)}
          subtitle={`${safeNumber(data.partners?.pendingRequests)} ausstehend`}
          icon={<Building2 className="h-5 w-5 text-primary" />}
          sparklineData={sparklineData.partners}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="text-xs">
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs">
            Buchungen
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs">
            Umsatz
          </TabsTrigger>
          <TabsTrigger value="fleet" className="text-xs">
            Fuhrpark
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-xs">
            Kunden
          </TabsTrigger>
          <TabsTrigger value="finances" className="text-xs">
            Finanzen
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">
            Performance
          </TabsTrigger>
        </TabsList>

        {/* ÜBERSICHT TAB */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Abschlussrate"
              value={`${safeNumber(completionRate).toFixed(1)}%`}
              subtitle="Erfolgreich abgeschlossen"
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              variant={completionRate >= 80 ? "success" : "default"}
            />

            <StatsCard
              title="Ø Buchungswert"
              value={formatCurrency(data.overview?.avgBookingValue)}
              subtitle="Pro Fahrt"
              icon={<Target className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Ø Passagiere"
              value={safeNumber(data.bookings?.avgPassengers).toFixed(1)}
              subtitle="Pro Fahrt"
              icon={<Users className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Stornierungsrate"
              value={`${safeNumber(cancellationRate).toFixed(1)}%`}
              subtitle="Abgebrochene Buchungen"
              icon={<XCircle className="h-5 w-5 text-primary" />}
              variant={cancellationRate <= 10 ? "success" : cancellationRate <= 20 ? "default" : "warning"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Umsatzentwicklung */}
            <Card className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Umsatzentwicklung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.revenue?.byMonth || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Umsatz"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Buchungen nach Status */}
            <Card className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Buchungen nach Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buchungen nach Stunde */}
          <Card className="rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Buchungen nach Uhrzeit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bookings?.byHour || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [value, "Buchungen"]}
                      labelFormatter={(label) => `${label}:00 Uhr`}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUCHUNGEN TAB */}
        <TabsContent value="bookings" className="space-y-5 mt-4">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Heute"
              value={formatNumber(data.overview?.bookingsToday)}
              subtitle="Buchungen heute"
              icon={<Clock className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Dieser Monat"
              value={formatNumber(data.overview?.bookingsThisMonth)}
              subtitle={`vs. ${formatNumber(data.overview?.bookingsLastMonth)} letzten Monat`}
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              trend={{
                value: safeNumber(data.overview?.bookingsGrowth),
                isPositive: safeNumber(data.overview?.bookingsGrowth) >= 0,
              }}
            />

            <StatsCard
              title="Abgeschlossen"
              value={formatNumber(data.overview?.completedBookings)}
              subtitle={`${safeNumber(completionRate).toFixed(1)}% Erfolgsrate`}
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              variant="success"
            />

            <StatsCard
              title="Storniert"
              value={formatNumber(data.overview?.cancelledBookings)}
              subtitle={`${safeNumber(cancellationRate).toFixed(1)}% Stornierungsrate`}
              icon={<XCircle className="h-5 w-5 text-primary" />}
              variant={cancellationRate <= 10 ? "default" : "warning"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Zahlungsmethoden */}
            <Card className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Zahlungsmethoden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Buchungen nach Wochentag */}
            <Card className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Buchungen nach Wochentag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bookings?.byDay || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* UMSATZ TAB */}
        <TabsContent value="revenue" className="space-y-5 mt-4">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Heute"
              value={formatCurrency(data.overview?.revenueToday)}
              subtitle="Umsatz heute"
              icon={<Euro className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Dieser Monat"
              value={formatCurrency(data.overview?.revenueThisMonth)}
              subtitle={`vs. ${formatCurrency(data.overview?.revenueLastMonth)} letzten Monat`}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              trend={{
                value: safeNumber(data.overview?.revenueGrowth),
                isPositive: safeNumber(data.overview?.revenueGrowth) >= 0,
              }}
            />

            <StatsCard
              title="Ø pro Buchung"
              value={formatCurrency(data.overview?.avgBookingValue)}
              subtitle="Durchschnittlicher Fahrpreis"
              icon={<Target className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Ø pro Fahrer"
              value={formatCurrency(data.drivers?.avgRevenuePerDriver)}
              subtitle="Durchschnitt pro Fahrer"
              icon={<UserCheck className="h-5 w-5 text-primary" />}
            />
          </div>

          {/* Umsatz-Chart */}
          <Card className="rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monatliche Umsatzentwicklung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.revenue?.byMonth || []}>
                    <defs>
                      <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue" ? "Umsatz" : "Buchungen",
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Umsatz"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorRevenueArea)"
                      strokeWidth={2}
                    />
                    <Bar
                      dataKey="bookings"
                      name="Buchungen"
                      fill="hsl(var(--muted-foreground))"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAHRER TAB */}
        <TabsContent value="drivers" className="space-y-5 mt-4">
          {/* Fahrer Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Verfügbar</p>
                <p className="text-2xl font-bold text-green-600">{safeNumber(data.drivers?.available)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <Car className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Im Einsatz</p>
                <p className="text-2xl font-bold text-blue-600">{safeNumber(data.drivers?.busy)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <Pause className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold">{safeNumber(data.drivers?.offline)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Ø Bewertung</p>
                <p className="text-2xl font-bold">{safeNumber(data.drivers?.avgRating).toFixed(1)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Fahrer */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Top 10 Fahrer</CardTitle>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="available">Verfügbar</SelectItem>
                    <SelectItem value="busy">Im Einsatz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeDrivers
                  .filter((d) => driverFilter === "all" || d.status === driverFilter)
                  .slice(0, 10)
                  .map((driver, idx) => (
                    <div key={driver.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{driver.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{safeNumber(driver.completedBookings)} Fahrten</span>
                          <span>•</span>
                          <span>{formatCurrency(driver.revenue)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{safeNumber(driver.avgRating).toFixed(1)}</span>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-semibold">{safeNumber(driver.totalDistance).toFixed(0)} km</p>
                        <p className="text-muted-foreground">{safeNumber(driver.totalHours).toFixed(1)} h</p>
                      </div>
                    </div>
                  ))}
                {safeDrivers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Keine Fahrer vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Durchschnitte */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Ø Buchungen/Fahrer</p>
                <p className="text-xl font-bold">{safeNumber(data.drivers?.avgBookingsPerDriver).toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Ø Bewertung</p>
                <p className="text-xl font-bold">{safeNumber(data.drivers?.avgRating).toFixed(1)} / 5</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Ø Stunden/Tag</p>
                <p className="text-xl font-bold">{safeNumber(data.shifts?.avgHoursPerDay).toFixed(1)} h</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FAHRZEUGE TAB */}
        <TabsContent value="vehicles" className="space-y-5 mt-4">
          {/* Fahrzeug Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <Car className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Verfügbar</p>
                <p className="text-2xl font-bold text-green-600">{safeNumber(data.vehicles?.available)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Im Einsatz</p>
                <p className="text-2xl font-bold text-blue-600">{safeNumber(data.vehicles?.busy)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Wartung</p>
                <p className="text-2xl font-bold text-orange-600">{safeNumber(data.vehicles?.maintenance)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Warnungen</p>
                <p className="text-2xl font-bold text-red-600">
                  {safeNumber(data.vehicles?.tuevExpiring) + safeNumber(data.vehicles?.insuranceExpiring)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={vehicleCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(safeNumber(percent) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {vehicleCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nach Antrieb</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(safeNumber(percent) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KUNDENTAB */}
        <TabsContent value="customers" className="space-y-5 mt-4">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Kunden Gesamt"
              value={formatNumber(data.customers?.total)}
              icon={<Users className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Neukunden"
              value={formatNumber(data.customers?.newThisMonth)}
              subtitle={`vs. ${formatNumber(data.customers?.newLastMonth)} letzten Monat`}
              icon={<UserCheck className="h-5 w-5 text-primary" />}
              trend={{
                value: safeNumber(data.customers?.growth),
                isPositive: safeNumber(data.customers?.growth) >= 0,
              }}
            />

            <StatsCard
              title="Stammkunden"
              value={formatNumber(data.customers?.repeatCustomers)}
              subtitle={`${safeNumber(data.customers?.retentionRate).toFixed(1)}% Bindungsrate`}
              icon={<Star className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Ø Buchungen"
              value={safeNumber(data.customers?.avgBookingsPerCustomer).toFixed(1)}
              subtitle="Pro Kunde"
              icon={<Activity className="h-5 w-5 text-primary" />}
            />
          </div>

          {/* Top Kunden */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top 10 Kunden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeCustomers.slice(0, 10).map((customer, idx) => (
                  <div key={customer.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{safeNumber(customer.bookings)} Buchungen</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(customer.revenue)}</p>
                  </div>
                ))}
                {safeCustomers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Keine Kunden vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Durchschnitte */}
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Ø Buchungen/Kunde</p>
              <p className="text-xl font-bold">{safeNumber(data.customers?.avgBookingsPerCustomer).toFixed(1)}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANZEN TAB */}
        <TabsContent value="finances" className="space-y-5 mt-4">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Rechnungen Gesamt"
              value={formatNumber(data.finances?.invoices?.total)}
              icon={<Receipt className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Bezahlt"
              value={formatCurrency(data.finances?.invoices?.totalPaid)}
              subtitle={`${formatNumber(data.finances?.invoices?.paid)} Rechnungen`}
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              variant="success"
            />

            <StatsCard
              title="Offen"
              value={formatCurrency(data.finances?.invoices?.totalOutstanding)}
              subtitle={`${formatNumber(data.finances?.invoices?.pending)} ausstehend`}
              icon={<Clock className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Ueberfaellig"
              value={formatNumber(data.finances?.invoices?.overdue)}
              subtitle="Rechnungen ueberfaellig"
              icon={<AlertTriangle className="h-5 w-5 text-primary" />}
              variant={safeNumber(data.finances?.invoices?.overdue) > 0 ? "warning" : "success"}
            />
          </div>

          {/* Kassenbuch */}
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
            <StatsCard
              title="Kasseneinnahmen"
              value={formatCurrency(data.finances?.cashbook?.income)}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              variant="success"
            />

            <StatsCard
              title="Kassenausgaben"
              value={formatCurrency(data.finances?.cashbook?.expense)}
              icon={<TrendingUp className="h-5 w-5 text-primary" style={{ transform: "rotate(180deg)" }} />}
            />

            <StatsCard
              title="Kassenbestand"
              value={formatCurrency(data.finances?.cashbook?.balance)}
              icon={<Euro className="h-5 w-5 text-primary" />}
              variant={safeNumber(data.finances?.cashbook?.balance) >= 0 ? "success" : "warning"}
            />
          </div>
        </TabsContent>

        {/* PERFORMANCE TAB */}
        <TabsContent value="performance" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Radial Performance */}
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gesamtperformance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      data={performanceData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar dataKey="value" cornerRadius={10} fill="#323D5E" />
                      <Tooltip formatter={(value: number) => [`${safeNumber(value).toFixed(1)}%`, ""]} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-2xl font-bold">{safeNumber(completionRate).toFixed(0)}%</p>
                <p className="text-center text-xs text-muted-foreground">Abschlussrate</p>
              </CardContent>
            </Card>

            {/* Aktivitäts-Zusammenfassung */}
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-2xl font-bold">{safeNumber(data.shifts?.totalHours).toFixed(0)} h</p>
                    <p className="text-xs text-muted-foreground">Schichtstunden</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(data.shifts?.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Schichtumsatz</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Erstellt</span>
                    <span className="font-semibold">{safeNumber(data.activity?.creates)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Aktualisiert</span>
                    <span className="font-semibold">{safeNumber(data.activity?.updates)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gelöscht</span>
                    <span className="font-semibold">{safeNumber(data.activity?.deletes)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="space-y-6">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Fahrer Gesamt"
              value={formatNumber(data.drivers?.total)}
              subtitle={`${safeNumber(data.drivers?.available)} verfuegbar, ${safeNumber(data.drivers?.busy)} beschaeftigt`}
              icon={<Users className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Fahrzeuge Gesamt"
              value={formatNumber(data.vehicles?.total)}
              subtitle={`${safeNumber(data.vehicles?.available)} verfuegbar, ${safeNumber(data.vehicles?.busy)} im Einsatz`}
              icon={<Car className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="TUeV ablaufend"
              value={formatNumber(data.vehicles?.tuevExpiring)}
              subtitle="In den naechsten 30 Tagen"
              icon={<AlertTriangle className="h-5 w-5 text-primary" />}
              variant={safeNumber(data.vehicles?.tuevExpiring) > 0 ? "warning" : "success"}
            />

            <StatsCard
              title="Versicherung ablaufend"
              value={formatNumber(data.vehicles?.insuranceExpiring)}
              subtitle="In den naechsten 30 Tagen"
              icon={<AlertTriangle className="h-5 w-5 text-primary" />}
              variant={safeNumber(data.vehicles?.insuranceExpiring) > 0 ? "warning" : "success"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Fahrzeugkategorien */}
            <Card className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Fahrzeuge nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={vehicleCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {vehicleCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Kraftstoffarten */}
            <Card className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Fahrzeuge nach Kraftstoff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Fahrer */}
          <Card className="rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Fahrer nach Buchungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.drivers?.topDrivers || []).slice(0, 5).map((driver, index) => (
                  <div key={driver.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {driver.completedBookings} Buchungen - {formatCurrency(driver.revenue)}
                      </p>
                    </div>
                    <Progress
                      value={(driver.completedBookings / (data.drivers?.topDrivers?.[0]?.completedBookings || 1)) * 100}
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Kunden Gesamt"
              value={formatNumber(data.customers?.total)}
              icon={<Users className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Neukunden"
              value={formatNumber(data.customers?.newThisMonth)}
              subtitle={`vs. ${formatNumber(data.customers?.newLastMonth)} letzten Monat`}
              icon={<UserCheck className="h-5 w-5 text-primary" />}
              trend={{
                value: safeNumber(data.customers?.growth),
                isPositive: safeNumber(data.customers?.growth) >= 0,
              }}
            />

            <StatsCard
              title="Stammkunden"
              value={formatNumber(data.customers?.repeatCustomers)}
              subtitle={`${safeNumber(data.customers?.retentionRate).toFixed(1)}% Bindungsrate`}
              icon={<Star className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Ø Buchungen"
              value={safeNumber(data.customers?.avgBookingsPerCustomer).toFixed(1)}
              subtitle="Pro Kunde"
              icon={<Activity className="h-5 w-5 text-primary" />}
            />
          </div>

          {/* Top Kunden */}
          <Card className="rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Kunden nach Buchungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.customers?.topCustomers || []).slice(0, 10).map((customer, index) => (
                  <div key={customer.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.bookings} Buchungen</p>
                    </div>
                    <Progress
                      value={(customer.bookings / (data.customers?.topCustomers?.[0]?.bookings || 1)) * 100}
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-6">
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Rechnungen Gesamt"
              value={formatNumber(data.finances?.invoices?.total)}
              icon={<Receipt className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Bezahlt"
              value={formatCurrency(data.finances?.invoices?.totalPaid)}
              subtitle={`${formatNumber(data.finances?.invoices?.paid)} Rechnungen`}
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              variant="success"
            />

            <StatsCard
              title="Offen"
              value={formatCurrency(data.finances?.invoices?.totalOutstanding)}
              subtitle={`${formatNumber(data.finances?.invoices?.pending)} ausstehend`}
              icon={<Clock className="h-5 w-5 text-primary" />}
            />

            <StatsCard
              title="Ueberfaellig"
              value={formatNumber(data.finances?.invoices?.overdue)}
              subtitle="Rechnungen ueberfaellig"
              icon={<AlertTriangle className="h-5 w-5 text-primary" />}
              variant={safeNumber(data.finances?.invoices?.overdue) > 0 ? "warning" : "success"}
            />
          </div>

          {/* Kassenbuch */}
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
            <StatsCard
              title="Kasseneinnahmen"
              value={formatCurrency(data.finances?.cashbook?.income)}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              variant="success"
            />

            <StatsCard
              title="Kassenausgaben"
              value={formatCurrency(data.finances?.cashbook?.expense)}
              icon={<TrendingUp className="h-5 w-5 text-primary" style={{ transform: "rotate(180deg)" }} />}
            />

            <StatsCard
              title="Kassenbestand"
              value={formatCurrency(data.finances?.cashbook?.balance)}
              icon={<Euro className="h-5 w-5 text-primary" />}
              variant={safeNumber(data.finances?.cashbook?.balance) >= 0 ? "success" : "warning"}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
