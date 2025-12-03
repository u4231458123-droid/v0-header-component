import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendContactResponseEmail } from "@/lib/email/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requestId, to, subject, message, originalSubject } = body

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, error: "Fehlende Parameter" }, { status: 400 })
    }

    // Versende E-Mail-Antwort
    const emailResult = await sendContactResponseEmail({
      to,
      subject,
      message,
      originalSubject,
    })

    if (!emailResult.success) {
      console.error("E-Mail-Versand fehlgeschlagen:", emailResult.error)
      return NextResponse.json(
        { success: false, error: emailResult.error || "Fehler beim Senden der E-Mail" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Antwort erfolgreich gesendet",
    })
  } catch (error) {
    console.error("Error sending response email:", error)
    return NextResponse.json(
      { success: false, error: "Fehler beim Senden der E-Mail" },
      { status: 500 },
    )
  }
}
