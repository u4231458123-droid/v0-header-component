# Google Maps Integration

## API-Key

\`\`\`
AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8
\`\`\`

**WICHTIG:** Dieser Key ist nur für Entwicklungszwecke. Für Production muss ein neuer Key mit Domain-Restrictions erstellt werden.

## Verwendete APIs

| API | Zweck | Status |
|-----|-------|--------|
| Maps JavaScript API | Kartenanzeige | Aktiv |
| Places API | Adress-Autocomplete | Aktiv |
| Geocoding API | Adressvalidierung | Aktiv |
| Directions API | Routenberechnung | Aktiv |
| Distance Matrix API | Entfernungsberechnung | Aktiv |

## Komponenten

### AddressAutocomplete

\`\`\`tsx
import { AddressAutocomplete } from "@/components/maps"

<AddressAutocomplete
  value={address}
  onChange={setAddress}
  onSelect={(result) => {
    console.log("Lat/Lng:", result.lat, result.lng)
    console.log("Formatted:", result.formattedAddress)
  }}
  placeholder="Adresse eingeben..."
/>
\`\`\`

### FleetMap

\`\`\`tsx
import { FleetMap } from "@/components/maps"

<FleetMap
  vehicles={[
    {
      id: "1",
      licensePlate: "B-MD 1234",
      status: "available",
      location: { lat: 52.52, lng: 13.405 },
      driverName: "Max Mustermann"
    }
  ]}
  onVehicleClick={(vehicle) => console.log(vehicle)}
  showTraffic={true}
  darkMode={true}
/>
\`\`\`

### WeatherWidget

\`\`\`tsx
import { WeatherWidget } from "@/components/maps"

// Mit Koordinaten
<WeatherWidget lat={52.52} lng={13.405} />

// Mit Stadt
<WeatherWidget city="Berlin" />

// Kompakte Version
<WeatherWidget city="Berlin" compact />
\`\`\`

## Bibliotheksfunktionen

### Geocoding

\`\`\`ts
import { geocodeAddress, reverseGeocode } from "@/lib/google-maps"

// Adresse zu Koordinaten
const result = await geocodeAddress("Brandenburger Tor, Berlin")
console.log(result.lat, result.lng)

// Koordinaten zu Adresse
const address = await reverseGeocode(52.5163, 13.3777)
console.log(address.formattedAddress)
\`\`\`

### Directions

\`\`\`ts
import { getDirections, getDistanceMatrix } from "@/lib/google-maps"

// Route berechnen
const route = await getDirections(
  "Berlin Hauptbahnhof",
  "Flughafen BER",
  { departureTime: new Date() }
)

console.log(route.distance.text) // "35,2 km"
console.log(route.duration.text) // "42 Min."

// Entfernungsmatrix
const matrix = await getDistanceMatrix(
  ["Berlin", "Hamburg"],
  ["München", "Frankfurt"]
)
\`\`\`

## Konfiguration

\`\`\`ts
// lib/google-maps/config.ts
export const GOOGLE_MAPS_CONFIG = {
  apiKey: "AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8",
  libraries: ["places", "geometry", "drawing"],
  defaultCenter: { lat: 52.52, lng: 13.405 }, // Berlin
  defaultZoom: 12,
  language: "de",
  region: "DE",
}
\`\`\`

## Datenbankfelder

Die Datenbank speichert Koordinaten als `point`-Typ:

- `bookings.pickup_location` - Abholort
- `bookings.dropoff_location` - Zielort
- `drivers.current_location` - Aktuelle Fahrerposition

### Beispiel: Koordinaten speichern

\`\`\`ts
await supabase.from("bookings").insert({
  pickup_address: "Berlin Hbf",
  pickup_location: `POINT(${lng} ${lat})`,
  dropoff_address: "BER",
  dropoff_location: `POINT(${dropLng} ${dropLat})`,
})
\`\`\`

## Wetter-API

Das WeatherWidget verwendet die kostenlose Open-Meteo API (kein Key erforderlich).

Features:
- Aktuelle Temperatur
- Wetterbeschreibung
- Luftfeuchtigkeit
- Windgeschwindigkeit
- Sonnenauf-/untergang
- Automatische Aktualisierung alle 30 Minuten
