"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/design-system/PageHeader"
import {
  Building2,
  CreditCard,
  FileText,
  Users,
  Car,
  Crown,
  Activity,
  CheckCircle,
  Database,
  Shield,
} from "lucide-react"

interface Company {
  id: string
  name: string
  email: string
  subscription_tier: string
  subscription_status: string
  created_at: string
}

interface AdminDashboardClientProps {
  stats: {
    companies: number
    activeSubscriptions: number
    totalBookings: number
    totalDrivers: number
    totalVehicles: number
  }
  recentCompanies: Company[]
}

export function AdminDashboardClient({ stats, recentCompanies }: AdminDashboardClientProps) {
  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Master-Administrator Übersicht - Alle MyDispatch-Unternehmen und Systemstatus"
      >
        <Badge variant="default" className="bg-warning/20 text-warning border-warning/30">
          <Crown className="w-3 h-3 mr-1" />
          Master Admin
        </Badge>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unternehmen</p>
                <p className="text-3xl font-bold text-info">{stats.companies}</p>
              </div>
              <Building2 className="w-10 h-10 text-info/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Abos</p>
                <p className="text-3xl font-bold text-success">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="w-10 h-10 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buchungen</p>
                <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
              </div>
              <FileText className="w-10 h-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fahrer</p>
                <p className="text-3xl font-bold text-primary">{stats.totalDrivers}</p>
              </div>
              <Users className="w-10 h-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fahrzeuge</p>
                <p className="text-3xl font-bold text-warning">{stats.totalVehicles}</p>
              </div>
              <Car className="w-10 h-10 text-warning/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Neueste Unternehmen
            </CardTitle>
            <CardDescription>Zuletzt registrierte MyDispatch-Kunden</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompanies.length > 0 ? (
              <div className="space-y-3">
                {recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {company.subscription_tier || "starter"}
                      </Badge>
                      <Badge
                        variant={company.subscription_status === "active" ? "default" : "secondary"}
                        className={
                          company.subscription_status === "active"
                            ? "bg-success/20 text-success border-success/30"
                            : ""
                        }
                      >
                        {company.subscription_status === "active" ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Noch keine Unternehmen registriert</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System-Status
            </CardTitle>
            <CardDescription>Überwachung aller Dienste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">Datenbank</span>
                </div>
                <Badge variant="outline" className="text-success border-green-600">
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">Stripe Zahlungen</span>
                </div>
                <Badge variant="outline" className="text-success border-green-600">
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">E-Mail-Dienst</span>
                </div>
                <Badge variant="outline" className="text-success border-green-600">
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">Google Maps API</span>
                </div>
                <Badge variant="outline" className="text-success border-green-600">
                  Online
                </Badge>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Letzte Aktivitäten
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Backup erstellt</span>
                  </div>
                  <span className="text-muted-foreground">vor 6 Stunden</span>
                </div>
                <div className="flex items-center justify-between p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <span>SSL-Zertifikat gültig</span>
                  </div>
                  <span className="text-muted-foreground">noch 89 Tage</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
