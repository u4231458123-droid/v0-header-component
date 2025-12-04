"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/design-system/PageHeader"
import { StatsCard } from "@/components/design-system/StatsCard"
import { FilterBar } from "@/components/design-system/FilterBar"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewDriverDialog } from "@/components/drivers/NewDriverDialog"
import { NewVehicleDialog } from "@/components/drivers/NewVehicleDialog"
import { DriverDetailsDialog } from "@/components/drivers/DriverDetailsDialog"
import { VehicleDetailsDialog } from "@/components/drivers/VehicleDetailsDialog"
import { Users, Car, CheckCircle, AlertTriangle, Eye } from "lucide-react"

interface DriversPageClientProps {
  initialDrivers?: any[]
  initialVehicles?: any[]
  companyId?: string | null
}

const fetchDrivers = async (companyId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

const fetchVehicles = async (companyId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export function DriversPageClient({
  initialDrivers = [],
  initialVehicles = [],
  companyId = null,
}: DriversPageClientProps) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("fahrer")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
  const [isNewDriverOpen, setIsNewDriverOpen] = useState(false)
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false)

  const fetchDriversCallback = useCallback(async () => {
    if (!companyId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
    if (!error && data) {
      setDrivers(data)
    }
  }, [companyId])

  const fetchVehiclesCallback = useCallback(async () => {
    if (!companyId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
    if (!error && data) {
      setVehicles(data)
    }
  }, [companyId])

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchDriversCallback(), fetchVehiclesCallback()])
    setIsLoading(false)
  }, [fetchDriversCallback, fetchVehiclesCallback])

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    const handleFocus = () => refreshData()
    window.addEventListener("focus", handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
    }
  }, [refreshData])

  const handleDriverSuccess = () => {
    refreshData()
  }

  const handleVehicleSuccess = () => {
    refreshData()
  }

  const activeDrivers = drivers.filter((d) => d.status === "active" || d.status === "available").length
  const busyDrivers = drivers.filter((d) => d.status === "busy").length
  const availableVehicles = vehicles.filter((v) => v.status === "available").length
  const inUseVehicles = vehicles.filter((v) => v.status === "in_use").length

  const expiringLicenses = drivers.filter((d) => {
    if (!d.license_expiry) return false
    const expiry = new Date(d.license_expiry)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
  })

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
        vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [vehicles, searchTerm, statusFilter])

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all"

  const getDriverStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      active: {
        label: "Aktiv",
        variant: "default",
      },
      available: {
        label: "Verfuegbar",
        variant: "default",
      },
      busy: {
        label: "Beschaeftigt",
        variant: "secondary",
      },
      offline: { label: "Offline", variant: "outline" },
    }
    const c = config[status] || config.offline
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const getVehicleStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      available: {
        label: "Verfuegbar",
        variant: "default",
      },
      in_use: { label: "Im Einsatz", variant: "default" },
      maintenance: {
        label: "Wartung",
        variant: "secondary",
      },
    }
    const c = config[status] || config.available
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Fahrer & Fahrzeuge" description="Verwalten Sie Ihre Fahrer und Fahrzeugflotte">
        <NewDriverDialog companyId={companyId} onSuccess={handleDriverSuccess} />
      </PageHeader>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fahrer Gesamt"
          value={drivers.length}
          subtitle={`${activeDrivers} aktiv, ${busyDrivers} beschaeftigt`}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Fahrzeuge Gesamt"
          value={vehicles.length}
          subtitle={`${availableVehicles} verfuegbar, ${inUseVehicles} im Einsatz`}
          icon={<Car className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Einsatzbereit"
          value={activeDrivers}
          subtitle="Fahrer verfuegbar"
          icon={<CheckCircle className="h-5 w-5 text-primary" />}
        />
        {expiringLicenses.length > 0 ? (
          <StatsCard
            title="Ablaufende Lizenzen"
            value={expiringLicenses.length}
            subtitle="In den naechsten 30 Tagen"
            icon={<AlertTriangle className="h-5 w-5 text-warning" />}
            variant="warning"
          />
        ) : (
          <StatsCard
            title="Lizenz-Status"
            value="OK"
            subtitle="Keine ablaufenden Lizenzen"
            icon={<CheckCircle className="h-5 w-5 text-success" />}
            variant="success"
          />
        )}
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Suchen nach Name, Telefon, Kennzeichen..."
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
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="available">Verfuegbar</SelectItem>
            <SelectItem value="busy">Beschaeftigt</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="in_use">Im Einsatz</SelectItem>
            <SelectItem value="maintenance">Wartung</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Tabs defaultValue="drivers" className="space-y-5">
        <TabsList className="bg-muted rounded-xl p-1">
          <TabsTrigger value="drivers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Fahrer ({filteredDrivers.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Fahrzeuge ({filteredVehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{filteredDrivers.length} Fahrer gefunden</span>
            <Button variant="default" onClick={() => setIsNewVehicleOpen(true)}>
              Neues Fahrzeug hinzufuegen
            </Button>
          </div>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800">
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium hidden md:table-cell">Telefon</TableHead>
                    <TableHead className="font-medium hidden lg:table-cell">E-Mail</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Keine Fahrer gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow
                        key={driver.id}
                        className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer"
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <TableCell className="font-medium">
                          {driver.salutation} {driver.first_name} {driver.last_name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{driver.phone || driver.mobile || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{driver.email || "-"}</TableCell>
                        <TableCell>{getDriverStatusBadge(driver.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDriver(driver)
                            }}
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
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{filteredVehicles.length} Fahrzeuge gefunden</span>
            <Button variant="default" onClick={() => setIsNewVehicleOpen(true)}>
              Neues Fahrzeug hinzufuegen
            </Button>
          </div>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800">
                    <TableHead className="font-medium">Kennzeichen</TableHead>
                    <TableHead className="font-medium hidden md:table-cell">Marke / Modell</TableHead>
                    <TableHead className="font-medium hidden lg:table-cell">Kategorie</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Keine Fahrzeuge gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow
                        key={vehicle.id}
                        className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer"
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vehicle.brand} {vehicle.model}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{vehicle.category || "-"}</TableCell>
                        <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVehicle(vehicle)
                            }}
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
        </TabsContent>
      </Tabs>

      {selectedDriver && (
        <DriverDetailsDialog
          driver={selectedDriver}
          open={!!selectedDriver}
          onOpenChange={(open) => !open && setSelectedDriver(null)}
          onUpdate={() => refreshData()}
        />
      )}

      {selectedVehicle && (
        <VehicleDetailsDialog
          vehicle={selectedVehicle}
          open={!!selectedVehicle}
          onOpenChange={(open) => !open && setSelectedVehicle(null)}
          onUpdate={() => refreshData()}
        />
      )}

      {isNewDriverOpen && (
        <NewDriverDialog
          companyId={companyId}
          open={isNewDriverOpen}
          onOpenChange={setIsNewDriverOpen}
          onSuccess={handleDriverSuccess}
        />
      )}

      {isNewVehicleOpen && (
        <NewVehicleDialog
          companyId={companyId}
          open={isNewVehicleOpen}
          onOpenChange={setIsNewVehicleOpen}
          onSuccess={handleVehicleSuccess}
        />
      )}
    </div>
  )
}
