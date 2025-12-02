import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get("input")
  const sessionToken = searchParams.get("sessiontoken")

  console.log("[v0] Autocomplete API called with input:", input)
  console.log("[v0] Using API Key:", GOOGLE_MAPS_API_KEY ? "Key present" : "No key!")

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] })
  }

  try {
    const params = new URLSearchParams({
      input,
      key: GOOGLE_MAPS_API_KEY,
      types: "address",
      components: "country:de|country:at|country:ch",
      language: "de",
    })

    if (sessionToken) {
      params.append("sessiontoken", sessionToken)
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    console.log("[v0] Calling Google API...")

    const response = await fetch(url, {
      cache: "no-store",
    })

    const data = await response.json()

    console.log("[v0] Google API response status:", data.status)
    if (data.error_message) {
      console.log("[v0] Google API error:", data.error_message)
    }

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[v0] Google Places Autocomplete error:", data.status, data.error_message)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Autocomplete API error:", error)
    return NextResponse.json({ status: "ERROR", predictions: [] }, { status: 500 })
  }
}
