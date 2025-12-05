"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/MainLayout"
import {
  Building2,
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Edit,
  Eye,
  RotateCcw,
} from "lucide-react"
import { ContactRequestsManager } from "./ContactRequestsManager"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface Company {
  id: string
  name: string
  email: string
  subscription_status: string
  subscription_tier: string
  created_at: string
}

interface ContactRequest {
  id: string
  name: string
  email: string
  subject: string
  message: string
  company?: string
  phone?: string
  type: string
  status: string
  created_at: string
  updated_at?: string
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  company: {
    id: string
    name: string
  }
}

interface Booking {
  id: string
  pickup_address: string
  dropoff_address: string
  price: number
  status: string
  created_at: string
  company: {
    id: string
    name: string
  }
  customer: {
    first_name: string
    last_name: string
  }
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  status: string
  company: {
    id: string
    name: string
  }
}

interface Invoice {
  id: string
  total_amount: number
  status: string
  created_at: string
  company: {
    id: string
    name: string
  }
}

interface Stats {
  totalCompanies: number
  activeSubscriptions: number
  totalRevenue: number
  totalBookings: number
  pendingContactRequests: number
  totalCustomers: number
  totalDrivers: number
}

interface RevenuePerCompany {
  companyId: string
  companyName: string
  revenue: number
  invoiceCount: number
}

interface MasterDashboardProps {
  companies: Company[]
  contactRequests: ContactRequest[]
  customers: Customer[]
  bookings: Booking[]
  drivers: Driver[]
  invoices: Invoice[]
  stats: Stats
  revenuePerCompany: RevenuePerCompany[]
}

export function MasterDashboard({
  companies,
  contactRequests,
  customers,
  bookings,
  drivers,
  invoices,
  stats,
  revenuePerCompany,
}: MasterDashboardProps) {
  const [viewMode, setViewMode] = useState<"technical" | "operator">("technical")
  const [isFlipping, setIsFlipping] = useState(false)

  const handleFlip = () => {
    setIsFlipping(true)
    setTimeout(() => {
      setViewMode(viewMode === "technical" ? "operator" : "technical")
      setIsFlipping(false)
    }, 300)
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1800px] mx-auto">
        {/* Header mit Flip-Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">MyDispatch Master Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {viewMode === "technical" ? "Technische Übersicht" : "Betreiber-Übersicht"}
            </p>
          </div>
          <Button
            onClick={handleFlip}
            disabled={isFlipping}
            size="lg"
            className="gap-2 rounded-xl relative overflow-hidden group"
          >
            <RotateCcw className={`h-5 w-5 transition-transform duration-300 ${isFlipping ? "rotate-180" : ""}`} />
            <span className="relative z-10">
              Zu {viewMode === "technical" ? "Betreiber" : "Technisch"}-Ansicht wechseln
            </span>
            <div
              className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 transition-opacity duration-300 ${
                isFlipping ? "opacity-100" : "opacity-0"
              }`}
            />
          </Button>
        </div>

        {/* Flip-Animation Container */}
        <div
          className={`relative transition-all duration-500 ease-in-out ${
            isFlipping ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
          }`}
        >
          {viewMode === "technical" ? (
            <TechnicalDashboard
              companies={companies}
              stats={stats}
              revenuePerCompany={revenuePerCompany}
              bookings={bookings}
              drivers={drivers}
            />
          ) : (
            <OperatorDashboard
              contactRequests={contactRequests}
              customers={customers}
              companies={companies}
              bookings={bookings}
              invoices={invoices}
              stats={stats}
              revenuePerCompany={revenuePerCompany}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}

// Technisches Dashboard
function TechnicalDashboard({
  companies,
  stats,
  revenuePerCompany,
  bookings,
  drivers,
}: {
  companies: Company[]
  stats: Stats
  revenuePerCompany: RevenuePerCompany[]
  bookings: Booking[]
  drivers: Driver[]
}) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Unternehmen</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalCompanies}</p>
              </div>
              <Building2 className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Abonnements</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.activeSubscriptions}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Umsatz</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Buchungen</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unternehmen Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Unternehmen</CardTitle>
          <CardDescription>Übersicht aller registrierten Unternehmen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Unternehmen</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">E-Mail</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tarif</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Registriert</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium">{company.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{company.email}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">
                        {company.subscription_tier}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={company.subscription_status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {company.subscription_status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {format(new Date(company.created_at), "dd.MM.yyyy", { locale: de })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Umsatz pro Unternehmen */}
      <Card>
        <CardHeader>
          <CardTitle>Umsatz pro Unternehmen</CardTitle>
          <CardDescription>Top 10 Unternehmen nach Umsatz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenuePerCompany
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 10)
              .map((item) => (
                <div key={item.companyId} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                  <div>
                    <p className="font-medium">{item.companyName}</p>
                    <p className="text-sm text-muted-foreground">{item.invoiceCount} Rechnungen</p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {item.revenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Betreiber Dashboard
function OperatorDashboard({
  contactRequests,
  customers,
  companies,
  bookings,
  invoices,
  stats,
  revenuePerCompany,
}: {
  contactRequests: ContactRequest[]
  customers: Customer[]
  companies: Company[]
  bookings: Booking[]
  invoices: Invoice[]
  stats: Stats
  revenuePerCompany: RevenuePerCompany[]
}) {
  return (
    <div className="space-y-6">
      {/* KPI Cards für Betreiber */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offene Anfragen</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.pendingContactRequests}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-warning opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Kunden</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalCustomers}</p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Umsatz</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Unternehmen</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.activeSubscriptions}</p>
              </div>
              <Building2 className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kontaktanfragen-Verwaltung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kontaktanfragen & Support-Anfragen
          </CardTitle>
          <CardDescription>
            Verwalten Sie alle Support-Anfragen und Webseiten-Anfragen. Beantworten und bearbeiten Sie Anfragen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactRequestsManager contactRequests={contactRequests} />
        </CardContent>
      </Card>

      {/* Kunden-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Kunden-Übersicht</CardTitle>
          <CardDescription>Alle Kunden mit zugehörigem Unternehmen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">E-Mail</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Unternehmen</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 20).map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{customer.email}</td>
                    <td className="p-3 text-sm">{customer.company?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Umsatz pro Kunde */}
      <Card>
        <CardHeader>
          <CardTitle>Umsatz pro Unternehmen</CardTitle>
          <CardDescription>Detaillierte Umsatzübersicht pro Kunde</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenuePerCompany
              .sort((a, b) => b.revenue - a.revenue)
              .map((item) => (
                <div key={item.companyId} className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.companyName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.invoiceCount} Rechnung{item.invoiceCount !== 1 ? "en" : ""} • Durchschnitt:{" "}
                      {item.invoiceCount > 0
                        ? (item.revenue / item.invoiceCount).toLocaleString("de-DE", { minimumFractionDigits: 2 })
                        : 0}{" "}
                      €
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {item.revenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

