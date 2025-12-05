"use client"

import { useEffect, useRef, useState } from "react"
import { MAP_STYLES, VEHICLE_MARKER_COLORS } from "@/lib/google-maps/config"
import { MapPin, Car, Loader2 } from "lucide-react"

const GOOGLE_MAPS_API_KEY = "AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8"

interface Vehicle {
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
}

interface FleetMapProps {
  vehicles: Vehicle[]
  onVehicleClick?: (vehicle: Vehicle) => void
  className?: string
  showTraffic?: boolean
  darkMode?: boolean
  apiKey?: string
}

declare global {
  interface Window {
    google: any
    initFleetMap: () => void
  }
}

function MapFallback({
  vehicles,
  onVehicleClick,
}: { vehicles: Vehicle[]; onVehicleClick?: (vehicle: Vehicle) => void }) {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted/30 flex flex-col">
      {/* Vehicle list as fallback */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-2">
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => onVehicleClick?.(vehicle)}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{vehicle.licensePlate}</p>
                    {vehicle.driverName && <p className="text-xs text-muted-foreground">{vehicle.driverName}</p>}
                  </div>
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
                  <span className="text-xs text-muted-foreground capitalize">
                    {vehicle.status === "available"
                      ? "Frei"
                      : vehicle.status === "busy"
                        ? "Besetzt"
                        : vehicle.status === "maintenance"
                          ? "Wartung"
                          : "Offline"}
                  </span>
                  {vehicle.location && <MapPin className="w-3 h-3 text-muted-foreground" />}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Fahrzeuge verfuegbar</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>Frei</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span>Besetzt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span>Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span>Wartung</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FleetMap({
  vehicles,
  onVehicleClick,
  className = "",
  showTraffic = true,
  darkMode = false,
  apiKey: propApiKey,
}: FleetMapProps & { apiKey?: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const trafficLayerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const apiKey = propApiKey || GOOGLE_MAPS_API_KEY

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,drawing&language=de&callback=initFleetMap`
    script.async = true
    script.defer = true

    script.onerror = () => {
      setLoadError(true)
    }

    window.initFleetMap = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      window.initFleetMap = undefined as unknown as () => void
    }
  }, [apiKey])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current || loadError) return

    try {
      const mapStyles = darkMode === true ? MAP_STYLES.dark : undefined

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 52.52, lng: 13.405 },
        zoom: 12,
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      if (showTraffic) {
        trafficLayerRef.current = new window.google.maps.TrafficLayer()
        trafficLayerRef.current.setMap(mapInstanceRef.current)
      }
    } catch (err) {
      console.error("[v0] Error initializing Google Maps:", err)
      setLoadError(true)
    }
  }, [isLoaded, darkMode, showTraffic, loadError])

  // Update markers when vehicles change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || loadError) return

    const currentVehicleIds = new Set(vehicles.map((v) => v.id))
    markersRef.current.forEach((marker, id) => {
      if (!currentVehicleIds.has(id)) {
        marker.setMap(null)
        markersRef.current.delete(id)
      }
    })

    const bounds = new window.google.maps.LatLngBounds()
    let hasValidLocations = false

    vehicles.forEach((vehicle) => {
      if (!vehicle.location) return

      hasValidLocations = true
      const position = new window.google.maps.LatLng(vehicle.location.lat, vehicle.location.lng)
      bounds.extend(position)

      const existingMarker = markersRef.current.get(vehicle.id)

      if (existingMarker) {
        existingMarker.setPosition(position)
        existingMarker.setIcon(createVehicleIcon(vehicle.status))
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          icon: createVehicleIcon(vehicle.status),
          title: `${vehicle.licensePlate} - ${vehicle.driverName || "Kein Fahrer"}`,
        })

        marker.addListener("click", () => {
          setSelectedVehicle(vehicle)
          onVehicleClick?.(vehicle)
        })

        markersRef.current.set(vehicle.id, marker)
      }
    })

    if (hasValidLocations && vehicles.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)

      const listener = window.google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        if (mapInstanceRef.current.getZoom() > 15) {
          mapInstanceRef.current.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [isLoaded, vehicles, onVehicleClick, loadError])

  function createVehicleIcon(status: Vehicle["status"]) {
    const color = VEHICLE_MARKER_COLORS[status] || VEHICLE_MARKER_COLORS.offline

    return {
      path: "M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24),
    }
  }

  if (loadError) {
    return (
      <div className={`relative rounded-xl overflow-hidden ${className}`}>
        <MapFallback vehicles={vehicles} onVehicleClick={onVehicleClick} />
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Karte wird geladen...</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {isLoaded && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl p-3 text-sm">
          <div className="font-medium mb-2">Fahrzeugstatus</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VEHICLE_MARKER_COLORS.available }} />
              <span>Verfuegbar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VEHICLE_MARKER_COLORS.busy }} />
              <span>Im Einsatz</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VEHICLE_MARKER_COLORS.offline }} />
              <span>Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VEHICLE_MARKER_COLORS.maintenance }} />
              <span>Wartung</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected vehicle info */}
      {selectedVehicle && (
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-4 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">{selectedVehicle.licensePlate}</span>
            <button onClick={() => setSelectedVehicle(null)} className="p-1 hover:bg-accent rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {selectedVehicle.make && selectedVehicle.model && (
            <div className="text-sm text-muted-foreground">
              {selectedVehicle.make} {selectedVehicle.model}
            </div>
          )}
          {selectedVehicle.driverName && <div className="text-sm">Fahrer: {selectedVehicle.driverName}</div>}
          <div className="mt-2 flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: VEHICLE_MARKER_COLORS[selectedVehicle.status] }}
            />
            <span className="text-sm capitalize">{selectedVehicle.status}</span>
          </div>
        </div>
      )}
    </div>
  )
}
