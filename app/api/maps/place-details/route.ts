import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get("place_id")

  if (!placeId) {
    return NextResponse.json({ status: "INVALID_REQUEST", error: "place_id is required" }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_MAPS_API_KEY,
      fields: "formatted_address,geometry,address_components",
      language: "de",
    })

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`, {
      cache: "no-store",
    })

    const data = await response.json()

    if (data.status !== "OK") {
      console.error("[v0] Google Places Details error:", data.status, data.error_message)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Place details API error:", error)
    return NextResponse.json({ status: "ERROR" }, { status: 500 })
  }
}
