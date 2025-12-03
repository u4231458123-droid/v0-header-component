/**
 * Debug Endpoint - Zeigt verfügbare Umgebungsvariablen
 * NUR für Development/Debugging - NIEMALS in Production aktivieren!
 */

import { NextResponse } from "next/server"

export async function GET() {
  // Nur in Development oder mit speziellem Secret
  const isDev = process.env.NODE_ENV === "development"
  const debugSecret = process.env.DEBUG_SECRET
  const requestSecret = new URL(process.env.URL || "http://localhost:3000").searchParams.get("secret")

  if (!isDev && debugSecret && requestSecret !== debugSecret) {
    return NextResponse.json(
      { error: "Not authorized" },
      { status: 401 }
    )
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ gesetzt" : "❌ fehlt",
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || "nicht gesetzt",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ gesetzt" : "❌ fehlt",
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ gesetzt" : "❌ fehlt",
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    },
    redirect: {
      devRedirect: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "nicht gesetzt",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "nicht gesetzt",
    },
    timestamp: new Date().toISOString(),
  })
}

