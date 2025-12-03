/**
 * Supabase Health Check Endpoint
 * ==============================
 * Prüft ob Supabase-Verbindung funktioniert
 */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Prüfe ob alle Variablen gesetzt sind
    const missing: string[] = []
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")

    if (missing.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Fehlende Environment Variables",
          missing,
          url: url || "nicht gesetzt",
        },
        { status: 500 }
      )
    }

    // Teste Verbindung mit Anon Key
    const supabase = createClient(url, anonKey)
    const { data, error } = await supabase.from("companies").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Supabase Verbindungsfehler",
          error: error.message,
          url,
          hasAnonKey: !!anonKey,
          hasServiceKey: !!serviceKey,
        },
        { status: 500 }
      )
    }

    // Teste Service Role Key
    const supabaseAdmin = createClient(url, serviceKey)
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("companies")
      .select("count")
      .limit(1)

    return NextResponse.json({
      status: "success",
      message: "Supabase Verbindung erfolgreich",
      url,
      anonKeyConfigured: !!anonKey,
      serviceKeyConfigured: !!serviceKey,
      anonKeyTest: error ? "failed" : "success",
      serviceKeyTest: adminError ? "failed" : "success",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unerwarteter Fehler",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

