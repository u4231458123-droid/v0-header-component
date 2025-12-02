/**
 * Statistiken Page V2.0
 * Vollumfängliche Server-Component für alle Unternehmensstatistiken
 */

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/layout/MainLayout"
import { StatistikenPageClient } from "@/components/statistiken/StatistikenPageClient"

async function getComprehensiveStatistics(companyId: string) {
  const supabase = await createClient()

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split("T")[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString()

  // Parallele Abfragen für alle Daten
  const [
    { data: allBookings },
    { data: bookingsToday },
    { data: bookingsThisMonth },
    { data: bookingsLastMonth },
    { data: allDrivers },
    { data: allVehicles },
    { data: allCustomers },
    { data: allInvoices },
    { data: cashbookEntries },
    { data: partnerConnections },
    { data: partnerBookings },
    { data: activityLog },
    { data: driverShifts },
    { data: company },
  ] = await Promise.all([
    // Alle Buchungen mit Details
    supabase
      .from("bookings")
      .select(`
      id, status, price, payment_status, payment_method, pickup_time, created_at,
      passengers, pickup_address, dropoff_address, notes, cost_center,
      driver:drivers(id, first_name, last_name),
      vehicle:vehicles(id, make, model, license_plate),
      customer:customers(id, first_name, last_name)
    `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),

    // Buchungen heute
    supabase
      .from("bookings")
      .select("id, price, status")
      .eq("company_id", companyId)
      .gte("pickup_time", today),

    // Buchungen diesen Monat
    supabase
      .from("bookings")
      .select("id, price, status, created_at")
      .eq("company_id", companyId)
      .gte("created_at", startOfMonth),

    // Buchungen letzten Monat
    supabase
      .from("bookings")
      .select("id, price, status")
      .eq("company_id", companyId)
      .gte("created_at", startOfLastMonth)
      .lt("created_at", startOfMonth),

    // Alle Fahrer mit Status
    supabase
      .from("drivers")
      .select("id, first_name, last_name, status, email, phone, created_at, license_expiry")
      .eq("company_id", companyId),

    // Alle Fahrzeuge mit Details
    supabase
      .from("vehicles")
      .select(
        "id, make, model, license_plate, status, category, fuel_type, seats, year, tuev_date, insurance_valid_until, current_lat, current_lng",
      )
      .eq("company_id", companyId),

    // Alle Kunden
    supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, created_at, customer_number")
      .eq("company_id", companyId),

    // Alle Rechnungen
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, tax_amount, total_amount, status, due_date, paid_date, created_at")
      .eq("company_id", companyId),

    // Kassenbuch-Einträge
    supabase
      .from("cashbook_entries")
      .select("id, entry_type, amount, category, entry_date, is_cancelled")
      .eq("company_id", companyId)
      .eq("is_cancelled", false),

    // Partner-Verbindungen
    supabase
      .from("partner_connections")
      .select("id, status, created_at")
      .or(`requester_company_id.eq.${companyId},target_company_id.eq.${companyId}`),

    // Partner-Buchungen
    supabase
      .from("partner_bookings")
      .select("id, status, created_at, booking_data")
      .or(`source_company_id.eq.${companyId},target_company_id.eq.${companyId}`),

    // Aktivitäts-Log (letzte 100)
    supabase
      .from("activity_log")
      .select("id, action, entity_type, user_name, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(100),

    // Fahrer-Schichten
    supabase
      .from("driver_shifts")
      .select("id, status, shift_start, shift_end, total_bookings, total_revenue, total_distance_km, driver_id")
      .eq("company_id", companyId),

    // Unternehmensdaten
    supabase
      .from("companies")
      .select("subscription_tier, subscription_status, created_at, driver_limit, vehicle_limit")
      .eq("id", companyId)
      .single(),
  ])

  // Berechnungen
  const bookings = allBookings || []
  const drivers = allDrivers || []
  const vehicles = allVehicles || []
  const customers = allCustomers || []
  const invoices = allInvoices || []
  const cashbook = cashbookEntries || []
  const shifts = driverShifts || []

  // Buchungs-Statistiken
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0

  const bookingsByStatus = {
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    in_progress: bookings.filter((b) => b.status === "in_progress").length,
    completed: completedBookings.length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  const bookingsByPaymentStatus = {
    pending: bookings.filter((b) => b.payment_status === "pending").length,
    paid: bookings.filter((b) => b.payment_status === "paid").length,
    partial: bookings.filter((b) => b.payment_status === "partial").length,
    overdue: bookings.filter((b) => b.payment_status === "overdue").length,
  }

  const bookingsByPaymentMethod = {
    cash: bookings.filter((b) => b.payment_method === "cash").length,
    card: bookings.filter((b) => b.payment_method === "card").length,
    invoice: bookings.filter((b) => b.payment_method === "invoice").length,
    paypal: bookings.filter((b) => b.payment_method === "paypal").length,
  }

  // Umsatz nach Zeiträumen
  const revenueToday = (bookingsToday || [])
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0)
  const revenueThisMonth = (bookingsThisMonth || [])
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0)
  const revenueLastMonth = (bookingsLastMonth || [])
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0)
  const revenueGrowth = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0

  // Buchungen nach Stunde (für Heatmap)
  const bookingsByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: bookings.filter((b) => {
      const bookingHour = new Date(b.pickup_time).getHours()
      return bookingHour === hour
    }).length,
  }))

  // Buchungen nach Wochentag
  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const bookingsByDay = dayNames.map((day, idx) => ({
    day,
    count: bookings.filter((b) => new Date(b.pickup_time).getDay() === idx).length,
  }))

  // Monatlicher Umsatz (letzte 12 Monate)
  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
  const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    const month = date.getMonth()
    const year = date.getFullYear()
    const monthBookings = bookings.filter((b) => {
      const bDate = new Date(b.created_at)
      return bDate.getMonth() === month && bDate.getFullYear() === year && b.status === "completed"
    })
    return {
      month: monthNames[month],
      year,
      revenue: monthBookings.reduce((sum, b) => sum + (b.price || 0), 0),
      bookings: monthBookings.length,
    }
  })

  // Fahrer-Statistiken
  const driversAvailable = drivers.filter((d) => d.status === "available").length
  const driversBusy = drivers.filter((d) => d.status === "busy").length
  const driversOffline = drivers.filter((d) => d.status === "offline").length

  // Top Fahrer nach Buchungen
  const driverBookingCounts = drivers
    .map((driver) => {
      const driverBookings = bookings.filter((b) => b.driver?.id === driver.id)
      const completedDriverBookings = driverBookings.filter((b) => b.status === "completed")
      return {
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        totalBookings: driverBookings.length,
        completedBookings: completedDriverBookings.length,
        revenue: completedDriverBookings.reduce((sum, b) => sum + (b.price || 0), 0),
        status: driver.status,
      }
    })
    .sort((a, b) => b.completedBookings - a.completedBookings)

  // Fahrzeug-Statistiken
  const vehiclesAvailable = vehicles.filter((v) => v.status === "available").length
  const vehiclesBusy = vehicles.filter((v) => v.status === "busy" || v.status === "in_use").length
  const vehiclesMaintenance = vehicles.filter((v) => v.status === "maintenance").length

  const vehiclesByCategory = {
    limousine: vehicles.filter((v) => v.category === "limousine").length,
    van: vehicles.filter((v) => v.category === "van").length,
    suv: vehicles.filter((v) => v.category === "suv").length,
    luxury: vehicles.filter((v) => v.category === "luxury").length,
    other: vehicles.filter((v) => !v.category || !["limousine", "van", "suv", "luxury"].includes(v.category)).length,
  }

  const vehiclesByFuel = {
    petrol: vehicles.filter((v) => v.fuel_type === "petrol" || v.fuel_type === "benzin").length,
    diesel: vehicles.filter((v) => v.fuel_type === "diesel").length,
    electric: vehicles.filter((v) => v.fuel_type === "electric" || v.fuel_type === "elektro").length,
    hybrid: vehicles.filter((v) => v.fuel_type === "hybrid").length,
    other: vehicles.filter((v) => !v.fuel_type).length,
  }

  // TÜV und Versicherung Warnungen
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const vehiclesWithTuevExpiring = vehicles.filter(
    (v) => v.tuev_date && new Date(v.tuev_date) <= thirtyDaysFromNow,
  ).length
  const vehiclesWithInsuranceExpiring = vehicles.filter(
    (v) => v.insurance_valid_until && new Date(v.insurance_valid_until) <= thirtyDaysFromNow,
  ).length

  // Kunden-Statistiken
  const newCustomersThisMonth = customers.filter((c) => new Date(c.created_at) >= new Date(startOfMonth)).length
  const newCustomersLastMonth = customers.filter((c) => {
    const created = new Date(c.created_at)
    return created >= new Date(startOfLastMonth) && created < new Date(startOfMonth)
  }).length
  const customerGrowth =
    newCustomersLastMonth > 0 ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100 : 0

  // Wiederkehrende Kunden (mehr als 1 Buchung)
  const customerBookingCounts = customers.map((customer) => ({
    id: customer.id,
    name: `${customer.first_name} ${customer.last_name}`,
    bookings: bookings.filter((b) => b.customer?.id === customer.id).length,
  }))
  const repeatCustomers = customerBookingCounts.filter((c) => c.bookings > 1).length
  const customerRetentionRate = customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0

  // Top Kunden
  const topCustomers = customerBookingCounts.sort((a, b) => b.bookings - a.bookings).slice(0, 10)

  // Rechnungs-Statistiken
  const invoicesPaid = invoices.filter((i) => i.status === "paid")
  const invoicesPending = invoices.filter((i) => i.status === "pending" || i.status === "sent")
  const invoicesOverdue = invoices.filter(
    (i) => i.status === "overdue" || (i.status !== "paid" && new Date(i.due_date) < new Date()),
  )

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
  const totalPaid = invoicesPaid.reduce((sum, i) => sum + (i.total_amount || 0), 0)
  const totalOutstanding = totalInvoiced - totalPaid

  // Kassenbuch-Statistiken
  const cashIncome = cashbook.filter((e) => e.entry_type === "income").reduce((sum, e) => sum + (e.amount || 0), 0)
  const cashExpense = cashbook.filter((e) => e.entry_type === "expense").reduce((sum, e) => sum + (e.amount || 0), 0)
  const cashBalance = cashIncome - cashExpense

  const cashbookByCategory: Record<string, number> = {}
  cashbook.forEach((entry) => {
    const cat = entry.category || "Sonstiges"
    cashbookByCategory[cat] = (cashbookByCategory[cat] || 0) + entry.amount
  })

  // Partner-Statistiken
  const activePartners = (partnerConnections || []).filter((p) => p.status === "accepted").length
  const pendingPartnerRequests = (partnerConnections || []).filter((p) => p.status === "pending").length
  const partnerBookingsReceived = (partnerBookings || []).length
  const partnerBookingsAccepted = (partnerBookings || []).filter((p) => p.status === "accepted").length

  // Schicht-Statistiken
  const totalShiftHours = shifts.reduce((sum, s) => {
    if (s.shift_start && s.shift_end) {
      return sum + (new Date(s.shift_end).getTime() - new Date(s.shift_start).getTime()) / (1000 * 60 * 60)
    }
    return sum
  }, 0)
  const totalShiftRevenue = shifts.reduce((sum, s) => sum + (s.total_revenue || 0), 0)
  const totalShiftDistance = shifts.reduce((sum, s) => sum + (s.total_distance_km || 0), 0)

  // Durchschnittswerte
  const avgPassengers =
    bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.passengers || 1), 0) / bookings.length : 0
  const avgRevenuePerDriver = drivers.length > 0 ? totalRevenue / drivers.length : 0
  const avgBookingsPerDriver = drivers.length > 0 ? completedBookings.length / drivers.length : 0
  const avgBookingsPerVehicle = vehicles.length > 0 ? completedBookings.length / vehicles.length : 0

  // Aktivitäts-Zusammenfassung
  const activitySummary = {
    total: (activityLog || []).length,
    creates: (activityLog || []).filter((a) => a.action === "create").length,
    updates: (activityLog || []).filter((a) => a.action === "update").length,
    deletes: (activityLog || []).filter((a) => a.action === "delete").length,
  }

  return {
    // Übersicht
    overview: {
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
      totalRevenue,
      avgBookingValue,
      revenueToday,
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowth,
      bookingsToday: (bookingsToday || []).length,
      bookingsThisMonth: (bookingsThisMonth || []).length,
      bookingsLastMonth: (bookingsLastMonth || []).length,
      bookingsGrowth: bookings.length > 0 ? ((bookings.length - bookingsLastMonth) / bookingsLastMonth) * 100 : 0,
    },

    // Buchungen
    bookings: {
      byStatus: bookingsByStatus,
      byPaymentStatus: bookingsByPaymentStatus,
      byPaymentMethod: bookingsByPaymentMethod,
      byHour: bookingsByHour,
      byDay: bookingsByDay,
      byVehicleCategory: {},
      avgPassengers,
      avgDistance: 0,
      avgDuration: 0,
    },

    // Umsatz
    revenue: {
      byMonth: revenueByMonth,
      byWeek: [],
      growth: revenueGrowth,
    },

    // Fahrer
    drivers: {
      total: drivers.length,
      available: driversAvailable,
      busy: driversBusy,
      offline: driversOffline,
      topDrivers: driverBookingCounts.slice(0, 10).map((d) => ({
        ...d,
        avgRating: 0,
        totalDistance: 0,
        totalHours: 0,
        cancelledBookings: 0,
      })),
      avgRevenuePerDriver,
      avgBookingsPerDriver,
      avgRating: 0,
      limit: company?.driver_limit || 0,
      performanceByDay: [],
    },

    // Fahrzeuge
    vehicles: {
      total: vehicles.length,
      available: vehiclesAvailable,
      busy: vehiclesBusy,
      maintenance: vehiclesMaintenance,
      byCategory: vehiclesByCategory,
      byFuel: vehiclesByFuel,
      tuevExpiring: vehiclesWithTuevExpiring,
      insuranceExpiring: vehiclesWithInsuranceExpiring,
      avgBookingsPerVehicle,
      limit: company?.vehicle_limit || 0,
      utilizationRate: 0,
    },

    // Kunden
    customers: {
      total: customers.length,
      newThisMonth: newCustomersThisMonth,
      newLastMonth: newCustomersLastMonth,
      growth: customerGrowth,
      repeatCustomers,
      retentionRate: customerRetentionRate,
      topCustomers: topCustomers.map((c) => ({
        ...c,
        revenue: 0,
      })),
      byType: { private: 0, business: 0 },
      avgBookingsPerCustomer: 0,
    },

    // Finanzen
    finances: {
      invoices: {
        total: invoices.length,
        paid: invoicesPaid.length,
        pending: invoicesPending.length,
        overdue: invoicesOverdue.length,
        totalInvoiced,
        totalPaid,
        totalOutstanding,
      },
      cashbook: {
        income: cashIncome,
        expense: cashExpense,
        balance: cashBalance,
        byCategory: cashbookByCategory,
      },
    },

    // Partner
    partners: {
      activeConnections: activePartners,
      pendingRequests: pendingPartnerRequests,
      bookingsReceived: partnerBookingsReceived,
      bookingsAccepted: partnerBookingsAccepted,
      bookingsSent: 0,
      partnerRevenue: 0,
    },

    // Schichten
    shifts: {
      totalHours: Math.round(totalShiftHours),
      totalRevenue: totalShiftRevenue,
      totalDistance: Math.round(totalShiftDistance),
      avgHoursPerDay: 0,
    },

    // Aktivität
    activity: activitySummary,

    // Unternehmen
    company: {
      subscriptionTier: company?.subscription_tier || "starter",
      subscriptionStatus: company?.subscription_status || "active",
      createdAt: company?.created_at || new Date().toISOString(),
    },
  }
}

export default async function StatistikenPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("company_id, role").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/dashboard")
  }

  const statisticsData = await getComprehensiveStatistics(profile.company_id)

  const safeData = {
    ...statisticsData,
    overview: {
      totalBookings: statisticsData.overview?.totalBookings || 0,
      completedBookings: statisticsData.overview?.completedBookings || 0,
      cancelledBookings: statisticsData.overview?.cancelledBookings || 0,
      totalRevenue: statisticsData.overview?.totalRevenue || 0,
      avgBookingValue: statisticsData.overview?.avgBookingValue || 0,
      revenueToday: statisticsData.overview?.revenueToday || 0,
      revenueThisMonth: statisticsData.overview?.revenueThisMonth || 0,
      revenueLastMonth: statisticsData.overview?.revenueLastMonth || 0,
      revenueGrowth: statisticsData.overview?.revenueGrowth || 0,
      bookingsToday: statisticsData.overview?.bookingsToday || 0,
      bookingsThisMonth: statisticsData.overview?.bookingsThisMonth || 0,
      bookingsLastMonth: statisticsData.overview?.bookingsLastMonth || 0,
      bookingsGrowth: statisticsData.overview?.bookingsGrowth || 0,
    },
    bookings: {
      byStatus: statisticsData.bookings?.byStatus || {},
      byPaymentStatus: statisticsData.bookings?.byPaymentStatus || {},
      byPaymentMethod: statisticsData.bookings?.byPaymentMethod || {},
      byHour: statisticsData.bookings?.byHour || [],
      byDay: statisticsData.bookings?.byDay || [],
      byVehicleCategory: statisticsData.bookings?.byVehicleCategory || {},
      avgPassengers: statisticsData.bookings?.avgPassengers || 0,
      avgDistance: statisticsData.bookings?.avgDistance || 0,
      avgDuration: statisticsData.bookings?.avgDuration || 0,
    },
    revenue: {
      byMonth: statisticsData.revenue?.byMonth || [],
      byWeek: statisticsData.revenue?.byWeek || [],
      growth: statisticsData.revenue?.growth || 0,
    },
    drivers: {
      total: statisticsData.drivers?.total || 0,
      available: statisticsData.drivers?.available || 0,
      busy: statisticsData.drivers?.busy || 0,
      offline: statisticsData.drivers?.offline || 0,
      topDrivers: (statisticsData.drivers?.topDrivers || []).map((d) => ({
        ...d,
        avgRating: d.avgRating || 0,
        totalDistance: d.totalDistance || 0,
        totalHours: d.totalHours || 0,
        cancelledBookings: d.cancelledBookings || 0,
      })),
      avgRevenuePerDriver: statisticsData.drivers?.avgRevenuePerDriver || 0,
      avgBookingsPerDriver: statisticsData.drivers?.avgBookingsPerDriver || 0,
      avgRating: statisticsData.drivers?.avgRating || 0,
      limit: statisticsData.drivers?.limit || 0,
      performanceByDay: statisticsData.drivers?.performanceByDay || [],
    },
    vehicles: {
      total: statisticsData.vehicles?.total || 0,
      available: statisticsData.vehicles?.available || 0,
      busy: statisticsData.vehicles?.busy || 0,
      maintenance: statisticsData.vehicles?.maintenance || 0,
      byCategory: statisticsData.vehicles?.byCategory || {},
      byFuel: statisticsData.vehicles?.byFuel || {},
      tuevExpiring: statisticsData.vehicles?.tuevExpiring || 0,
      insuranceExpiring: statisticsData.vehicles?.insuranceExpiring || 0,
      avgBookingsPerVehicle: statisticsData.vehicles?.avgBookingsPerVehicle || 0,
      limit: statisticsData.vehicles?.limit || 0,
      utilizationRate: statisticsData.vehicles?.utilizationRate || 0,
    },
    customers: {
      total: statisticsData.customers?.total || 0,
      newThisMonth: statisticsData.customers?.newThisMonth || 0,
      newLastMonth: statisticsData.customers?.newLastMonth || 0,
      growth: statisticsData.customers?.growth || 0,
      repeatCustomers: statisticsData.customers?.repeatCustomers || 0,
      retentionRate: statisticsData.customers?.retentionRate || 0,
      topCustomers: (statisticsData.customers?.topCustomers || []).map((c) => ({
        ...c,
        revenue: c.revenue || 0,
      })),
      byType: statisticsData.customers?.byType || { private: 0, business: 0 },
      avgBookingsPerCustomer: statisticsData.customers?.avgBookingsPerCustomer || 0,
    },
    finances: {
      invoices: {
        total: statisticsData.finances?.invoices?.total || 0,
        paid: statisticsData.finances?.invoices?.paid || 0,
        pending: statisticsData.finances?.invoices?.pending || 0,
        overdue: statisticsData.finances?.invoices?.overdue || 0,
        totalInvoiced: statisticsData.finances?.invoices?.totalInvoiced || 0,
        totalPaid: statisticsData.finances?.invoices?.totalPaid || 0,
        totalOutstanding: statisticsData.finances?.invoices?.totalOutstanding || 0,
      },
      cashbook: {
        income: statisticsData.finances?.cashbook?.income || 0,
        expense: statisticsData.finances?.cashbook?.expense || 0,
        balance: statisticsData.finances?.cashbook?.balance || 0,
        byCategory: statisticsData.finances?.cashbook?.byCategory || {},
      },
    },
    partners: {
      activeConnections: statisticsData.partners?.activeConnections || 0,
      pendingRequests: statisticsData.partners?.pendingRequests || 0,
      bookingsReceived: statisticsData.partners?.bookingsReceived || 0,
      bookingsAccepted: statisticsData.partners?.bookingsAccepted || 0,
      bookingsSent: statisticsData.partners?.bookingsSent || 0,
      partnerRevenue: statisticsData.partners?.partnerRevenue || 0,
    },
    shifts: {
      totalHours: statisticsData.shifts?.totalHours || 0,
      totalRevenue: statisticsData.shifts?.totalRevenue || 0,
      totalDistance: statisticsData.shifts?.totalDistance || 0,
      avgHoursPerDay: statisticsData.shifts?.avgHoursPerDay || 0,
    },
    activity: {
      total: statisticsData.activity?.total || 0,
      creates: statisticsData.activity?.creates || 0,
      updates: statisticsData.activity?.updates || 0,
      deletes: statisticsData.activity?.deletes || 0,
    },
    company: {
      subscriptionTier: statisticsData.company?.subscriptionTier || "starter",
      subscriptionStatus: statisticsData.company?.subscriptionStatus || "active",
      createdAt: statisticsData.company?.createdAt || new Date().toISOString(),
    },
  }

  return (
    <MainLayout>
      <StatistikenPageClient data={safeData} />
    </MainLayout>
  )
}
