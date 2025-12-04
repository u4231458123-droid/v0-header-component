/**
 * E-MAIL-VERSAND API ROUTE
 * ========================
 * Versendet E-Mails über Resend (via Supabase Edge Function oder direkt)
 * 
 * Hinweis: Da Resend bereits in Supabase integriert ist, können wir
 * entweder eine Supabase Edge Function nutzen oder direkt Resend API aufrufen.
 * 
 * Für die direkte Nutzung von Resend benötigen wir RESEND_API_KEY.
 * Alternativ können wir Supabase Auth Admin API nutzen (nur für Auth-E-Mails).
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, html, from = "noreply@my-dispatch.de" } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Fehlende Parameter: to, subject, html erforderlich" },
        { status: 400 }
      )
    }

    // Validiere E-Mail-Adresse
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Option 1: Verwende Supabase Edge Function für E-Mail-Versand
    // (Falls eine Edge Function "send-email" existiert)
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          subject,
          html,
          from,
        },
      })

      if (error) {
        console.error("[Email API] Supabase Edge Function Fehler:", error)
        // Fallback zu Option 2
        throw error
      }

      if (data && data.success) {
        return NextResponse.json({ success: true, message: "E-Mail erfolgreich versendet" })
      }
    } catch (edgeFunctionError) {
      // Option 2: Direkter Resend API-Aufruf (falls RESEND_API_KEY vorhanden)
      const resendApiKey = process.env.RESEND_API_KEY

      if (resendApiKey) {
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              to,
              subject,
              html,
            }),
          })

          if (!resendResponse.ok) {
            const errorData = await resendResponse.json().catch(() => ({}))
            console.error("[Email API] Resend API Fehler:", errorData)
            throw new Error(errorData.message || "Fehler beim Versenden über Resend")
          }

          const resendData = await resendResponse.json()
          return NextResponse.json({
            success: true,
            message: "E-Mail erfolgreich versendet",
            id: resendData.id,
          })
        } catch (resendError: any) {
          console.error("[Email API] Resend Direktaufruf Fehler:", resendError)
          // Weiter zu Option 3
        }
      }

      // Option 3: Logge E-Mail (für Development/Testing)
      console.log("[Email API] E-Mail würde versendet werden (Development Mode):", {
        to,
        subject,
        from,
        htmlLength: html.length,
      })

      // In Development: Simuliere erfolgreichen Versand
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "E-Mail erfolgreich versendet (Development Mode - nur geloggt)",
          development: true,
        })
      }

      // In Production: Fehler zurückgeben
      return NextResponse.json(
        {
          success: false,
          error: "E-Mail-Versand nicht konfiguriert. Bitte RESEND_API_KEY setzen oder Supabase Edge Function 'send-email' erstellen.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Unbekannter Fehler beim Versenden der E-Mail" },
      { status: 500 }
    )
  } catch (error: any) {
    console.error("[Email API] Unerwarteter Fehler:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unbekannter Fehler" },
      { status: 500 }
    )
  }
}

