import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * Revalidate API Route
 * ====================
 * Wird verwendet um Next.js Cache zu invalidieren
 * z.B. wenn Landingpage aktiviert/deaktiviert wird
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path parameter required" }, { status: 400 })
    }

    // Revalidate den angegebenen Pfad
    revalidatePath(path)

    return NextResponse.json({ revalidated: true, path, now: Date.now() })
  } catch (error: any) {
    console.error("[Revalidate] Error:", error)
    return NextResponse.json({ error: error.message || "Revalidation failed" }, { status: 500 })
  }
}

