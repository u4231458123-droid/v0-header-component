import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Contact form submission handler
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, company, phone, type } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Alle Pflichtfelder muessen ausgefuellt werden" },
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
