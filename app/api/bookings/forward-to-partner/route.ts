import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, partnerId, selectedFields, companyId } = body

    if (!bookingId || !partnerId || !companyId) {
      return NextResponse.json({ success: false, error: "Fehlende Parameter" }, { status: 400 })
    }

    const supabase = await createClient()

    // Lade Booking-Daten
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        customer:customers(*),
        driver:drivers(*),
        vehicle:vehicles(*),
        company:companies(*)
      `,
      )
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ success: false, error: "Auftrag nicht gefunden" }, { status: 404 })
    }

    // Lade Partner-Daten
    const { data: partner, error: partnerError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", partnerId)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ success: false, error: "Partner nicht gefunden" }, { status: 404 })
    }

    // Generiere E-Mail-Inhalt mit nur ausgewählten Feldern
    const emailContent = generatePartnerEmail(booking, selectedFields)

    // TODO: E-Mail-Versand implementieren (z.B. mit Resend, SendGrid, etc.)
    // Beispiel:
    // await resend.emails.send({
    //   from: 'noreply@my-dispatch.de',
    //   to: partner.email,
    //   subject: `Auftrag ${booking.id} - Weiterleitung`,
    //   html: emailContent
    // })

    console.log("Partner Forward Email:", {
      to: partner.email,
      subject: `Auftrag ${booking.id} - Weiterleitung`,
      content: emailContent,
    })

    return NextResponse.json({
      success: true,
      message: "Auftrag erfolgreich weitergeleitet",
    })
  } catch (error) {
    console.error("Error forwarding booking to partner:", error)
    return NextResponse.json(
      { success: false, error: "Fehler beim Weiterleiten des Auftrags" },
      { status: 500 },
    )
  }
}

function generatePartnerEmail(booking: any, selectedFields: string[]): string {
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString("de-DE"),
      time: date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const dt = formatDateTime(booking.pickup_time)
  const showField = (field: string) => selectedFields.includes(field)

  let content = `<h2>Auftrag weitergeleitet</h2><p>Folgende Daten wurden freigegeben:</p><ul>`

  if (showField("id")) content += `<li><strong>ID:</strong> ${booking.id}</li>`
  if (showField("date")) content += `<li><strong>Datum:</strong> ${dt.date}</li>`
  if (showField("time")) content += `<li><strong>Uhrzeit:</strong> ${dt.time} Uhr</li>`
  if (showField("customer") && booking.customer) {
    content += `<li><strong>Kunde:</strong> ${[booking.customer.salutation, booking.customer.first_name, booking.customer.last_name].filter(Boolean).join(" ")}</li>`
  }
  if (showField("pickup")) content += `<li><strong>Abhol-Adresse:</strong> ${booking.pickup_address}</li>`
  if (showField("dropoff")) content += `<li><strong>Ziel-Adresse:</strong> ${booking.dropoff_address}</li>`
  if (showField("passengers")) content += `<li><strong>Passagier Anzahl:</strong> ${booking.passengers || 1}</li>`
  if (showField("passenger_names") && booking.passenger_name) {
    content += `<li><strong>Passagier Name/n:</strong> ${booking.passenger_name}</li>`
  }
  if (showField("vehicle_category") && booking.vehicle_category) {
    content += `<li><strong>Fahrzeug Kategorie:</strong> ${booking.vehicle_category}</li>`
  }
  if (showField("flight_train_origin") && booking.flight_train_origin) {
    content += `<li><strong>Flug / Zug aus:</strong> ${booking.flight_train_origin}</li>`
  }
  if (showField("flight_train_number") && booking.flight_train_number) {
    content += `<li><strong>Flug / Zug Nummer:</strong> ${booking.flight_train_number}</li>`
  }
  if (showField("driver") && booking.driver) {
    content += `<li><strong>Fahrer:</strong> ${booking.driver.first_name} ${booking.driver.last_name}</li>`
  }
  if (showField("vehicle") && booking.vehicle) {
    content += `<li><strong>Fahrzeug Kennzeichen:</strong> ${booking.vehicle.license_plate}</li>`
  }
  if (showField("price") && booking.price) {
    content += `<li><strong>Fahrpreis:</strong> ${booking.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</li>`
  }

  content += `</ul>`

  return content
}

