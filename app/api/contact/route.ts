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

    // TODO: E-Mail-Versand implementieren (z.B. mit Resend, SendGrid, etc.)
    // Beispiel:
    // await resend.emails.send({
    //   from: 'noreply@my-dispatch.de',
    //   to: 'info@my-dispatch.de',
    //   subject: `Kontaktanfrage: ${subject}`,
    //   html: `
    //     <h2>Neue Kontaktanfrage</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>E-Mail:</strong> ${email}</p>
    //     <p><strong>Telefon:</strong> ${phone}</p>
    //     ${company ? `<p><strong>Unternehmen:</strong> ${company}</p>` : ''}
    //     <p><strong>Betreff:</strong> ${subject}</p>
    //     <p><strong>Nachricht:</strong></p>
    //     <p>${message.replace(/\n/g, '<br>')}</p>
    //   `
    // })

    console.log("Contact form submission:", {
      name,
      email,
      phone,
      company,
      subject,
      type,
      messageLength: message.length,
    })

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
