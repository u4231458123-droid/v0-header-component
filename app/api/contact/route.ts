import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Contact form submission handler
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, company, phone, type } = body

    // Validate required fields
    if (!name || !email || !subject || !message || !phone) {
      return NextResponse.json(
        { success: false, error: "Alle Pflichtfelder muessen ausgefuellt werden (inkl. Telefon)" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Ungueltige E-Mail-Adresse" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error: dbError } = await supabase.from("contact_requests").insert({
      name,
      email,
      subject,
      message,
      company: company || null,
      phone: phone || null,
      type: type || "general",
      status: "new",
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { success: false, error: "Fehler beim Speichern der Nachricht" },
        { status: 500 },
      )
    }

    // Versende E-Mail an MyDispatch
    try {
      const { sendContactFormEmail } = await import("@/lib/email/email-service")
      const emailResult = await sendContactFormEmail({
        name,
        email,
        phone,
        subject,
        message,
        company: company || undefined,
      })

      if (!emailResult.success) {
        console.error("E-Mail-Versand fehlgeschlagen:", emailResult.error)
        // Weiterhin als Erfolg zurückgeben, da die Anfrage gespeichert wurde
      }
    } catch (emailError) {
      console.error("Fehler beim Versenden der E-Mail:", emailError)
      // Weiterhin als Erfolg zurückgeben, da die Anfrage gespeichert wurde
    }

    return NextResponse.json({
      success: true,
      message: "Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kuerze bei Ihnen.",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es spaeter erneut." },
      { status: 500 },
    )
  }
}
