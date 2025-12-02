import { GOOGLE_MAPS_CONFIG } from "./config"

export interface GeocodingResult {
  address: string
  formattedAddress: string
  lat: number
  lng: number
  placeId: string
  components: {
    streetNumber?: string
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
}

export interface AutocompleteResult {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

// Geocode address to coordinates
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_CONFIG.apiKey}&language=${GOOGLE_MAPS_CONFIG.language}&region=${GOOGLE_MAPS_CONFIG.region}`,
    )

    const data = await response.json()

    if (data.status !== "OK" || !data.results[0]) {
      return null
    }

    const result = data.results[0]
    const components: GeocodingResult["components"] = {}

    for (const component of result.address_components) {
      if (component.types.includes("street_number")) {
        components.streetNumber = component.long_name
      }
      if (component.types.includes("route")) {
        components.street = component.long_name
      }
      if (component.types.includes("locality")) {
        components.city = component.long_name
      }
      if (component.types.includes("administrative_area_level_1")) {
        components.state = component.long_name
      }
      if (component.types.includes("country")) {
        components.country = component.long_name
      }
      if (component.types.includes("postal_code")) {
        components.postalCode = component.long_name
      }
    }

    return {
      address,
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId: result.place_id,
      components,
    }
  } catch (error) {
    console.error("[v0] Geocoding error:", error)
    return null
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_CONFIG.apiKey}&language=${GOOGLE_MAPS_CONFIG.language}`,
    )

    const data = await response.json()

    if (data.status !== "OK" || !data.results[0]) {
      return null
    }

    const result = data.results[0]
    const components: GeocodingResult["components"] = {}

    for (const component of result.address_components) {
      if (component.types.includes("street_number")) {
        components.streetNumber = component.long_name
      }
      if (component.types.includes("route")) {
        components.street = component.long_name
      }
      if (component.types.includes("locality")) {
        components.city = component.long_name
      }
      if (component.types.includes("administrative_area_level_1")) {
        components.state = component.long_name
      }
      if (component.types.includes("country")) {
        components.country = component.long_name
      }
      if (component.types.includes("postal_code")) {
        components.postalCode = component.long_name
      }
    }

    return {
      address: result.formatted_address,
      formattedAddress: result.formatted_address,
      lat,
      lng,
      placeId: result.place_id,
      components,
    }
  } catch (error) {
    console.error("[v0] Reverse geocoding error:", error)
    return null
  }
}

// Get autocomplete suggestions
export async function getAutocompleteSuggestions(input: string, sessionToken?: string): Promise<AutocompleteResult[]> {
  if (!input || input.length < 3) {
    return []
  }

  try {
    const params = new URLSearchParams({
      input,
      key: GOOGLE_MAPS_CONFIG.apiKey,
      language: GOOGLE_MAPS_CONFIG.language,
      components: `country:${GOOGLE_MAPS_CONFIG.region.toLowerCase()}`,
      types: "address",
    })

    if (sessionToken) {
      params.append("sessiontoken", sessionToken)
    }

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`)

    const data = await response.json()

    if (data.status !== "OK") {
      return []
    }

    return data.predictions.map((prediction: any) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }))
  } catch (error) {
    console.error("[v0] Autocomplete error:", error)
    return []
  }
}

// Get place details by place ID
export async function getPlaceDetails(placeId: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_CONFIG.apiKey}&language=${GOOGLE_MAPS_CONFIG.language}&fields=formatted_address,geometry,address_components`,
    )

    const data = await response.json()

    if (data.status !== "OK" || !data.result) {
      return null
    }

    const result = data.result
    const components: GeocodingResult["components"] = {}

    for (const component of result.address_components || []) {
      if (component.types.includes("street_number")) {
        components.streetNumber = component.long_name
      }
      if (component.types.includes("route")) {
        components.street = component.long_name
      }
      if (component.types.includes("locality")) {
        components.city = component.long_name
      }
      if (component.types.includes("administrative_area_level_1")) {
        components.state = component.long_name
      }
      if (component.types.includes("country")) {
        components.country = component.long_name
      }
      if (component.types.includes("postal_code")) {
        components.postalCode = component.long_name
      }
    }

    return {
      address: result.formatted_address,
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId,
      components,
    }
  } catch (error) {
    console.error("[v0] Place details error:", error)
    return null
  }
}
