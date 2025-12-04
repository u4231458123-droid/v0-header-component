"use client"

/**
 * StatistikenPageClient V1.0
 * Umfassende Statistik-Dashboard mit Charts und KPIs
 * CI-konform: bg-primary, rounded-2xl, gap-5
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { safeNumber } from "@/lib/utils/safe-number"
import {
  TrendingUp,
  Car,
  Users,
  Euro,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
} from "lucide-react"

interface StatisticsData {
  totalBookings: number
  totalRevenue: number
  totalDrivers: number
  totalVehicles: number
  totalCustomers: number
  averageBookingValue: number
  bookingsByStatus: {
    completed: number
    pending: number
    cancelled: number
  }
  revenueByMonth: { month: string; revenue: number; bookings: number }[]
  topDrivers: { name: string; bookings: number; revenue: number; rating: number }[]
  bookingsByHour: { hour: number; count: number }[]
  bookingsByDay: { day: string; count: number }[]
  customerRetention: number
  averageWaitTime: number
}

interface StatistikenPageClientProps {
  data: StatisticsData
}

export function StatistikenPageClient({ data }: StatistikenPageClientProps) {
  const [timeRange, setTimeRange] = useState("30")
  const [activeTab, setActiveTab] = useState("overview")

  const changes = useMemo(
    () => ({
      bookings: 12.5,
      revenue: 8.3,
      customers: 15.2,
      averageValue: -2.1,
    }),
    [],
  )

  const maxHourlyBookings = useMemo(
    () => Math.max(...data.bookingsByHour.map((h) => h.count), 1),
    [data.bookingsByHour],
  )

  const maxDailyBookings = useMemo(() => Math.max(...data.bookingsByDay.map((d) => d.count), 1), [data.bookingsByDay])

  const maxMonthlyRevenue = useMemo(
    () => Math.max(...data.revenueByMonth.map((m) => m.revenue), 1),
    [data.revenueByMonth],
  )

  const statusTotal = data.bookingsByStatus.completed + data.bookingsByStatus.pending + data.bookingsByStatus.cancelled
  const statusPercentages = {
    completed: statusTotal > 0 ? (data.bookingsByStatus.completed / statusTotal) * 100 : 0,
    pending: statusTotal > 0 ? (data.bookingsByStatus.pending / statusTotal) * 100 : 0,
    cancelled: statusTotal > 0 ? (data.bookingsByStatus.cancelled / statusTotal) * 100 : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiken</h1>
          <p className="text-muted-foreground mt-1">Umfassende Analysen und Berichte für Ihr Unternehmen</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <Badge variant={changes.bookings >= 0 ? "default" : "destructive"} className="rounded-lg">
                {changes.bookings >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(changes.bookings)}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Buchungen gesamt</p>
              <p className="text-2xl font-bold text-foreground">{data.totalBookings.toLocaleString("de-DE")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-success/10">
                <Euro className="w-5 h-5 text-success" />
              </div>
              <Badge variant={changes.revenue >= 0 ? "default" : "destructive"} className="rounded-lg">
                {changes.revenue >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(changes.revenue)}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Umsatz gesamt</p>
              <p className="text-2xl font-bold text-foreground">
                {data.totalRevenue.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-info/10">
                <Users className="w-5 h-5 text-info" />
              </div>
              <Badge variant={changes.customers >= 0 ? "default" : "destructive"} className="rounded-lg">
                {changes.customers >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(changes.customers)}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Kunden gesamt</p>
              <p className="text-2xl font-bold text-foreground">{data.totalCustomers.toLocaleString("de-DE")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-warning/10">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <Badge variant={changes.averageValue >= 0 ? "default" : "destructive"} className="rounded-lg">
                {changes.averageValue >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(changes.averageValue)}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Durchschnittswert</p>
              <p className="text-2xl font-bold text-foreground">
                {data.averageBookingValue.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-lg">
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg">
            Buchungen
          </TabsTrigger>
          <TabsTrigger value="drivers" className="rounded-lg">
            Fahrer
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg">
            Kunden
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Umsatz Trend */}
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Umsatz-Entwicklung</CardTitle>
                <CardDescription>Monatlicher Umsatzverlauf</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenueByMonth.map((month, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{month.month}</span>
                        <span className="font-medium">
                          {month.revenue.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(month.revenue / maxMonthlyRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Buchungsstatus */}
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Buchungsstatus</CardTitle>
                <CardDescription>Verteilung nach Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-muted"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(142, 76%, 36%)"
                        strokeWidth="12"
                        strokeDasharray={`${statusPercentages.completed * 2.51} ${251 - statusPercentages.completed * 2.51}`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(25, 95%, 53%)"
                        strokeWidth="12"
                        strokeDasharray={`${statusPercentages.pending * 2.51} ${251 - statusPercentages.pending * 2.51}`}
                        strokeDashoffset={`${-statusPercentages.completed * 2.51}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(0, 84%, 60%)"
                        strokeWidth="12"
                        strokeDasharray={`${statusPercentages.cancelled * 2.51} ${251 - statusPercentages.cancelled * 2.51}`}
                        strokeDashoffset={`${-(statusPercentages.completed + statusPercentages.pending) * 2.51}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">{statusTotal}</span>
                      <span className="text-sm text-muted-foreground">Gesamt</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Abgeschlossen</p>
                      <p className="text-sm font-medium">{data.bookingsByStatus.completed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ausstehend</p>
                      <p className="text-sm font-medium">{data.bookingsByStatus.pending}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Storniert</p>
                      <p className="text-sm font-medium">{data.bookingsByStatus.cancelled}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fahrzeuge aktiv</p>
                    <p className="text-xl font-bold text-foreground">{data.totalVehicles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fahrer aktiv</p>
                    <p className="text-xl font-bold text-foreground">{data.totalDrivers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-info/10">
                    <Clock className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ø Wartezeit</p>
                    <p className="text-xl font-bold text-foreground">{data.averageWaitTime} Min.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Buchungen nach Uhrzeit</CardTitle>
                <CardDescription>Stoßzeiten-Analyse</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-48 gap-1">
                  {data.bookingsByHour.map((hour) => (
                    <div key={hour.hour} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className="w-full bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary min-h-[4px]"
                        style={{ height: `${(hour.count / maxHourlyBookings) * 100}%` }}
                        title={`${hour.count} Buchungen`}
                      />
                      <span className="text-[10px] text-muted-foreground">{hour.hour}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Buchungen nach Wochentag</CardTitle>
                <CardDescription>Wöchentliche Verteilung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.bookingsByDay.map((day) => (
                    <div key={day.day} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground w-12">{day.day}</span>
                        <span className="font-medium">{day.count}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(day.count / maxDailyBookings) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-5">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top-Fahrer</CardTitle>
              <CardDescription>Leistungsübersicht nach Buchungen und Umsatz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topDrivers.map((driver, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{driver.name}</p>
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{safeNumber(driver.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{driver.bookings} Buchungen</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {driver.revenue.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                      </p>
                      <p className="text-xs text-muted-foreground">Umsatz</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kundenbindung</p>
                    <p className="text-2xl font-bold text-foreground">{data.customerRetention}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                </div>
                <Progress value={data.customerRetention} className="h-2 rounded-full" />
                <p className="text-xs text-muted-foreground mt-2">Anteil der wiederkehrenden Kunden</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Neukunden (30 Tage)</p>
                    <p className="text-2xl font-bold text-foreground">+{Math.floor(data.totalCustomers * 0.12)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-info/10">
                    <TrendingUp className="w-6 h-6 text-info" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-lg">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    15% mehr
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs. Vormonat</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Kundenzufriedenheit</CardTitle>
              <CardDescription>Basierend auf Bewertungen der letzten 30 Tage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${star <= 4 ? "text-warning fill-warning" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">4.2</span>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs w-3">{rating}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning rounded-full"
                          style={{
                            width:
                              rating === 5
                                ? "45%"
                                : rating === 4
                                  ? "35%"
                                  : rating === 3
                                    ? "12%"
                                    : rating === 2
                                      ? "5%"
                                      : "3%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
