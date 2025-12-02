import { NextResponse } from "next/server"

// Dieser Key ist per Domain-Restriction geschuetzt und kann nur von autorisierten Domains verwendet werden
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8"

export async function GET() {
  return NextResponse.json({
    apiKey: GOOGLE_MAPS_API_KEY,
    isConfigured: true,
  })
}
