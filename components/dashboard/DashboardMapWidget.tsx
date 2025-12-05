"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FleetMap } from "@/components/maps/FleetMap"
import { WeatherWidget } from "@/components/maps/WeatherWidget"
import { createBrowserClient } from "@/lib/supabase/client"
import { MapPin, Car, RefreshCw, AlertTriangle, Navigation, X } from "lucide-react"
import { safeNumber } from "@/lib/utils/safe-number"

interface VehicleLocation {
  id: string
  licensePlate: string
  make?: string
  model?: string
  status: "available" | "busy" | "offline" | "maintenance"
  location?: {
    lat: number
    lng: number
  }
  driverName?: string
  lastUpdate?: string
}

interface TrafficInfo {
  status: "free" | "moderate" | "heavy" | "blocked"
  description: string
  lastUpdate: string
}

interface DashboardMapWidgetProps {
  companyId: string | null
  initialVehicles?: VehicleLocation[]
}

export function DashboardMapWidget({ companyId, initialVehicles = [] }: DashboardMapWidgetProps) {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>(initialVehicles)
  const [trafficInfo, setTrafficInfo] = useState<TrafficInfo | null>(null)
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false)
  const [lastTrafficUpdate, setLastTrafficUpdate] = useState<Date | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)

  useEffect(() => {
    try {
      supabaseRef.current = createBrowserClient()
    } catch (err) {
      console.error("[v0] Failed to initialize Supabase client:", err)
      setError("Datenbankverbindung fehlgeschlagen")
    }
  }, [])

  const fetchVehicleLocations = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false)
      return
    }

    if (!supabaseRef.current) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const supabase = supabaseRef.current

      const { data: vehiclesData, error: fetchError } = await supabase
        .from("vehicles")
        .select(`
          id,
          license_plate,
          make,
          model,
          status,
          current_lat,
          current_lng,
          location_updated_at,
          driver:drivers(first_name, last_name)
        `)
        .eq("company_id", companyId)

      if (fetchError) {
        console.error("[v0] Error fetching vehicle locations:", fetchError.message)
        if (fetchError.code !== "PGRST116") {
          setError("Fahrzeugdaten konnten nicht geladen werden")
        }
        return
      }

      const mappedVehicles: VehicleLocation[] = (vehiclesData || []).map((v: any) => ({
        id: v.id,
        licensePlate: v.license_plate,
        make: v.make,
        model: v.model,
        status: v.status || "offline",
        location:
          v.current_lat && v.current_lng
            ? {
                lat: v.current_lat,
                lng: v.current_lng,
              }
            : undefined,
        driverName: v.driver ? `${v.driver.first_name} ${v.driver.last_name}` : undefined,
        lastUpdate: v.location_updated_at,
      }))

      setVehicles(mappedVehicles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unbekannter Fehler"
      if (!errorMessage.includes("Failed to fetch")) {
        console.error("[v0] Vehicle location fetch error:", errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  const fetchTrafficInfo = useCallback(async () => {
    setIsLoadingTraffic(true)

    try {
      const hour = new Date().getHours()
      let status: TrafficInfo["status"] = "free"
      let description = "Freie Fahrt auf allen Strecken"

      if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
        status = "heavy"
        description = "Berufsverkehr - Stau auf Hauptverkehrsadern"
      } else if ((hour >= 10 && hour <= 15) || (hour >= 19 && hour <= 21)) {
        status = "moderate"
        description = "Maessiger Verkehr - vereinzelte Verzoegerungen"
      }

      setTrafficInfo({
        status,
        description,
        lastUpdate: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      })
      setLastTrafficUpdate(new Date())
    } catch (err) {
      console.error("[v0] Traffic fetch error:", err)
    } finally {
      setIsLoadingTraffic(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicleLocations()
      fetchTrafficInfo()
    }, 100)

    const vehicleInterval = setInterval(fetchVehicleLocations, 30 * 1000)

    const trafficInterval = setInterval(fetchTrafficInfo, 30 * 60 * 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(vehicleInterval)
      clearInterval(trafficInterval)
    }
  }, [fetchVehicleLocations, fetchTrafficInfo])

  useEffect(() => {
    if (!companyId || !supabaseRef.current) return

    const supabase = supabaseRef.current

    const channel = supabase
      .channel("vehicle-locations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vehicles",
          filter: `company_id=eq.${companyId}`,
        },
        (payload: {
          new: { id: string; current_lat?: number; current_lng?: number; status?: string; location_updated_at?: string }
        }) => {
          const newStatus = payload.new.status as VehicleLocation["status"] | undefined
          setVehicles((prev) =>
            prev.map((v) =>
              v.id === payload.new.id
                ? {
                    ...v,
                    location:
                      payload.new.current_lat && payload.new.current_lng
                        ? {
                            lat: payload.new.current_lat,
                            lng: payload.new.current_lng,
                          }
                        : undefined,
                    status: newStatus || v.status,
                    lastUpdate: payload.new.location_updated_at,
                  }
                : v,
            ),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId])

  const getTrafficStatusColor = (status: TrafficInfo["status"]) => {
    switch (status) {
      case "free":
        return "text-success"
      case "moderate":
        return "text-warning"
      case "heavy":
        return "text-warning"
      case "blocked":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrafficStatusLabel = (status: TrafficInfo["status"]) => {
    switch (status) {
      case "free":
        return "Freie Fahrt"
      case "moderate":
        return "Maessiger Verkehr"
      case "heavy":
        return "Dichter Verkehr"
      case "blocked":
        return "Stau"
      default:
        return "Unbekannt"
    }
  }

  const onlineVehicles = vehicles.filter((v) => v.location && v.status !== "offline")
  const offlineVehicles = vehicles.filter((v) => !v.location || v.status === "offline")

  const mapHeight = 350
  const vehicleListHeight = mapHeight

  if (isLoading && vehicles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Lade Fahrzeugdaten...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">{onlineVehicles.length} Online</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{offlineVehicles.length} Offline</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-background rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Fahrzeugstandorte Live
            </h3>
          </div>
          <FleetMap
            vehicles={onlineVehicles}
            onVehicleClick={(v) => setSelectedVehicle(v as VehicleLocation)}
            className={`h-[${mapHeight}px]`}
            showTraffic={true}
            darkMode={false}
          />
        </div>

        <div className="flex flex-col gap-5" style={{ height: `${mapHeight + 52}px` }}>
          <WeatherWidget city="Berlin" compact={true} className="w-full shrink-0" />

          <div className="bg-background rounded-xl border border-border overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                Verkehrslage
              </h4>
              {isLoadingTraffic && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="p-4">
              {trafficInfo ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${getTrafficStatusColor(trafficInfo.status)}`} />
                    <span className={`text-sm font-medium ${getTrafficStatusColor(trafficInfo.status)}`}>
                      {getTrafficStatusLabel(trafficInfo.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{trafficInfo.description}</p>
                  <p className="text-[10px] text-muted-foreground/70">Aktualisiert: {trafficInfo.lastUpdate}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Lade Verkehrsdaten...
                </div>
              )}
            </div>
          </div>

          <div className="bg-background rounded-xl border border-border overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                Fahrzeuge ({vehicles.length})
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="px-4 py-2.5 hover:bg-accent/50 cursor-pointer transition-smooth"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{vehicle.licensePlate}</p>
                        {vehicle.driverName && (
                          <p className="text-[10px] text-muted-foreground">{vehicle.driverName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            vehicle.status === "available"
                              ? "bg-success"
                              : vehicle.status === "busy"
                                ? "bg-warning"
                                : vehicle.status === "maintenance"
                                  ? "bg-destructive"
                                  : "bg-muted-foreground"
                          }`}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {vehicle.status === "available"
                            ? "Frei"
                            : vehicle.status === "busy"
                              ? "Besetzt"
                              : vehicle.status === "maintenance"
                                ? "Wartung"
                                : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground flex-1 flex items-center justify-center">
                  Keine Fahrzeuge vorhanden
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            className="bg-card rounded-xl border border-border p-5 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedVehicle.licensePlate}</h3>
                  {selectedVehicle.make && selectedVehicle.model && (
                    <p className="text-xs text-muted-foreground">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 hover:bg-accent rounded-xl transition-smooth"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedVehicle.driverName && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Fahrer</span>
                  <span className="text-sm font-medium">{selectedVehicle.driverName}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedVehicle.status === "available"
                        ? "bg-success"
                        : selectedVehicle.status === "busy"
                          ? "bg-warning"
                          : selectedVehicle.status === "maintenance"
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {selectedVehicle.status === "available"
                      ? "Verfuegbar"
                      : selectedVehicle.status === "busy"
                        ? "Im Einsatz"
                        : selectedVehicle.status === "maintenance"
                          ? "In Wartung"
                          : "Offline"}
                  </span>
                </div>
              </div>
              {selectedVehicle.location && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Position</span>
                  <span className="text-xs font-mono">
                    {safeNumber(selectedVehicle.location.lat).toFixed(4)},{" "}
                    {safeNumber(selectedVehicle.location.lng).toFixed(4)}
                  </span>
                </div>
              )}
              {selectedVehicle.lastUpdate && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Letzte Aktualisierung</span>
                  <span className="text-xs">{new Date(selectedVehicle.lastUpdate).toLocaleString("de-DE")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
