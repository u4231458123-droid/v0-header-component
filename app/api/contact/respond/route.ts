import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requestId, to, subject, message } = body

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, error: "Fehlende Parameter" }, { status: 400 })
    }

    // In production, you would send an actual email here
    // For now, we just log it and return success
    console.log("Email Response:", {
      to,
      subject,
      message,
      requestId,
    })

    // TODO: Integrate with email service (e.g., Resend, SendGrid, etc.)
    // Example:
    // await resend.emails.send({
    //   from: 'support@my-dispatch.de',
    //   to: to,
    //   subject: subject,
    //   html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    // })

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

