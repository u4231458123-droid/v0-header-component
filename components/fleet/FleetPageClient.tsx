"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatsCard } from "@/components/design-system/StatsCard"
import { FilterBar } from "@/components/design-system/FilterBar"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewDriverDialog } from "@/components/drivers/NewDriverDialog"
import { NewVehicleDialog } from "@/components/drivers/NewVehicleDialog"
import { DriverDetailsDialog } from "@/components/drivers/DriverDetailsDialog"
import { VehicleDetailsDialog } from "@/components/drivers/VehicleDetailsDialog"
import { Users, Car, CheckCircle, AlertTriangle, Eye } from "lucide-react"

interface FleetPageClientProps {
  initialDrivers?: any[]
  initialVehicles?: any[]
  companyId?: string | null
}

type FleetTab = "drivers" | "vehicles"

export function FleetPageClient({ initialDrivers = [], initialVehicles = [], companyId = null }: FleetPageClientProps) {
  const [activeTab, setActiveTab] = useState<FleetTab>("drivers")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [drivers, setDrivers] = useState(initialDrivers || [])
  const [vehicles, setVehicles] = useState(initialVehicles || [])
  const [detailDriver, setDetailDriver] = useState<any>(null)
  const [detailVehicle, setDetailVehicle] = useState<any>(null)

  const supabase = createClient()

  // Stats
  const activeDrivers = drivers.filter((d) => d.status === "active" || d.status === "available").length
  const busyDrivers = drivers.filter((d) => d.status === "busy").length
  const availableVehicles = vehicles.filter((v) => v.status === "available").length
  const inUseVehicles = vehicles.filter((v) => v.status === "in_use").length

  // Expiring licenses (within 30 days)
  const expiringLicenses = drivers.filter((d) => {
    if (!d.license_expiry) return false
    const expiry = new Date(d.license_expiry)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
  })

  // Generate sparkline data
  const driverSparkline = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 3) + activeDrivers - 1)
  }, [activeDrivers])

  const vehicleSparkline = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 2) + availableVehicles - 1)
  }, [availableVehicles])

  // Filter
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        searchTerm === "" ||
        driver.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.includes(searchTerm)
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [drivers, searchTerm, statusFilter])

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        searchTerm === "" ||
        vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [vehicles, searchTerm, statusFilter])

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all"

  const getDriverStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: {
        label: "Aktiv",
        className: "bg-primary/10 text-primary",
      },
      available: {
        label: "Verfügbar",
        className: "bg-primary/10 text-primary",
      },
      busy: {
        label: "Beschäftigt",
        className: "bg-muted text-muted-foreground",
      },
      offline: {
        label: "Offline",
        className: "bg-muted text-muted-foreground",
      },
    }
    const c = config[status] || config.offline
    return <Badge className={c.className}>{c.label}</Badge>
  }

  const getVehicleStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      available: {
        label: "Verfügbar",
        className: "bg-primary/10 text-primary",
      },
      in_use: {
        label: "Im Einsatz",
        className: "bg-muted text-muted-foreground",
      },
      maintenance: {
        label: "Wartung",
        className: "bg-destructive/10 text-destructive",
      },
    }
    const c = config[status] || config.available
    return <Badge className={c.className}>{c.label}</Badge>
  }

  return (
    <div className="space-y-5">
      {/* Header mit Tab-Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Fuhrpark</h1>
            <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihre Fahrer und Fahrzeugflotte</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab-Switcher im Header */}
          <div className="flex items-center bg-muted rounded-xl p-1">
            <button
              onClick={() => setActiveTab("drivers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "drivers"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Fahrer</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-md">{drivers.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "vehicles"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Fahrzeuge</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-md">
                {vehicles.length}
              </span>
            </button>
          </div>

          {/* Action Button */}
          {activeTab === "drivers" ? (
            <NewDriverDialog
              companyId={companyId}
              onSuccess={(newDriver) => setDrivers((prev) => [...prev, newDriver])}
            />
          ) : (
            <NewVehicleDialog
              companyId={companyId}
              onSuccess={(newVehicle) => setVehicles((prev) => [...prev, newVehicle])}
            />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fahrer Gesamt"
          value={drivers.length}
          subtitle={`${activeDrivers} aktiv, ${busyDrivers} beschäftigt`}
          icon={<Users className="h-5 w-5 text-primary" />}
          sparklineData={driverSparkline}
        />
        <StatsCard
          title="Fahrzeuge Gesamt"
          value={vehicles.length}
          subtitle={`${availableVehicles} verfügbar, ${inUseVehicles} im Einsatz`}
          icon={<Car className="h-5 w-5 text-primary" />}
          sparklineData={vehicleSparkline}
        />
        <StatsCard
          title="Einsatzbereit"
          value={activeDrivers}
          subtitle="Fahrer verfügbar"
          icon={<CheckCircle className="h-5 w-5 text-primary" />}
        />
        {expiringLicenses.length > 0 ? (
          <StatsCard
            title="Ablaufende Lizenzen"
            value={expiringLicenses.length}
            subtitle="In den nächsten 30 Tagen"
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            variant="warning"
          />
        ) : (
          <StatsCard
            title="Lizenz-Status"
            value="OK"
            subtitle="Keine ablaufenden Lizenzen"
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
            variant="success"
          />
        )}
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={
          activeTab === "drivers" ? "Suchen nach Name, Telefon..." : "Suchen nach Kennzeichen, Hersteller..."
        }
        showReset={hasActiveFilters}
        onReset={() => {
          setSearchTerm("")
          setStatusFilter("all")
        }}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {activeTab === "drivers" ? (
              <>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="available">Verfügbar</SelectItem>
                <SelectItem value="busy">Beschäftigt</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="available">Verfügbar</SelectItem>
                <SelectItem value="in_use">Im Einsatz</SelectItem>
                <SelectItem value="maintenance">Wartung</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Content based on active tab */}
      {activeTab === "drivers" ? (
        <Card className="rounded-2xl border-border overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Telefon</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">E-Mail</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Keine Fahrer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {driver.first_name} <span className="uppercase">{driver.last_name}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {driver.phone || driver.mobile || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {driver.email || "-"}
                      </TableCell>
                      <TableCell>{getDriverStatusBadge(driver.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDetailDriver(driver)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Kennzeichen</TableHead>
                  <TableHead className="font-semibold">Fahrzeug</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Kategorie</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Keine Fahrzeuge gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium">{vehicle.license_plate}</TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {vehicle.category || "-"}
                      </TableCell>
                      <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDetailVehicle(vehicle)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialogs */}
      {detailDriver && (
        <DriverDetailsDialog
          driver={detailDriver}
          open={!!detailDriver}
          onOpenChange={(open) => !open && setDetailDriver(null)}
        />
      )}
      {detailVehicle && (
        <VehicleDetailsDialog
          vehicle={detailVehicle}
          open={!!detailVehicle}
          onOpenChange={(open) => !open && setDetailVehicle(null)}
        />
      )}
    </div>
  )
}
