import { GOOGLE_MAPS_CONFIG } from "./config"

export interface DirectionsResult {
  distance: {
    text: string
    value: number // meters
  }
  duration: {
    text: string
    value: number // seconds
  }
  durationInTraffic?: {
    text: string
    value: number
  }
  startAddress: string
  endAddress: string
  polyline: string
  steps: Array<{
    instruction: string
    distance: string
    duration: string
    maneuver?: string
  }>
}

export async function getDirections(
  origin: string | { lat: number; lng: number },
  destination: string | { lat: number; lng: number },
  options?: {
    waypoints?: Array<string | { lat: number; lng: number }>
    departureTime?: Date
    avoidTolls?: boolean
    avoidHighways?: boolean
  },
): Promise<DirectionsResult | null> {
  try {
    const originStr = typeof origin === "string" ? encodeURIComponent(origin) : `${origin.lat},${origin.lng}`

    const destinationStr =
      typeof destination === "string" ? encodeURIComponent(destination) : `${destination.lat},${destination.lng}`

    const params = new URLSearchParams({
      origin: originStr,
      destination: destinationStr,
      key: GOOGLE_MAPS_CONFIG.apiKey,
      language: GOOGLE_MAPS_CONFIG.language,
      mode: "driving",
      units: "metric",
    })

    if (options?.waypoints && options.waypoints.length > 0) {
      const waypointStr = options.waypoints
        .map((wp) => (typeof wp === "string" ? encodeURIComponent(wp) : `${wp.lat},${wp.lng}`))
        .join("|")
      params.append("waypoints", `optimize:true|${waypointStr}`)
    }

    if (options?.departureTime) {
      params.append("departure_time", Math.floor(options.departureTime.getTime() / 1000).toString())
    }

    const avoid: string[] = []
    if (options?.avoidTolls) avoid.push("tolls")
    if (options?.avoidHighways) avoid.push("highways")
    if (avoid.length > 0) {
      params.append("avoid", avoid.join("|"))
    }

    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params}`)

    const data = await response.json()

    if (data.status !== "OK" || !data.routes[0]) {
      return null
    }

    const route = data.routes[0]
    const leg = route.legs[0]

    return {
      distance: leg.distance,
      duration: leg.duration,
      durationInTraffic: leg.duration_in_traffic,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
        distance: step.distance.text,
        duration: step.duration.text,
        maneuver: step.maneuver,
      })),
    }
  } catch (error) {
    console.error("[v0] Directions error:", error)
    return null
  }
}

// Calculate distance matrix between multiple origins and destinations
export async function getDistanceMatrix(
  origins: Array<string | { lat: number; lng: number }>,
  destinations: Array<string | { lat: number; lng: number }>,
): Promise<{
  rows: Array<{
    elements: Array<{
      distance: { text: string; value: number }
      duration: { text: string; value: number }
      status: string
    }>
  }>
} | null> {
  try {
    const originsStr = origins
      .map((o) => (typeof o === "string" ? encodeURIComponent(o) : `${o.lat},${o.lng}`))
      .join("|")

    const destinationsStr = destinations
      .map((d) => (typeof d === "string" ? encodeURIComponent(d) : `${d.lat},${d.lng}`))
      .join("|")

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&key=${GOOGLE_MAPS_CONFIG.apiKey}&language=${GOOGLE_MAPS_CONFIG.language}&units=metric`,
    )

    const data = await response.json()

    if (data.status !== "OK") {
      return null
    }

    return { rows: data.rows }
  } catch (error) {
    console.error("[v0] Distance matrix error:", error)
    return null
  }
}
