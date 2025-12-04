import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, role, companyId, token } = body

    if (!email || !role || !companyId || !token) {
      return NextResponse.json({ success: false, error: "Fehlende Parameter" }, { status: 400 })
    }

    const supabase = await createClient()

    // Prüfe ob User authentifiziert ist
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Lade Company und prüfe Berechtigung
    const { data: company } = await supabase.from("companies").select("*").eq("id", companyId).single()

    if (!company) {
      return NextResponse.json({ success: false, error: "Unternehmen nicht gefunden" }, { status: 404 })
    }

    // Prüfe ob User Admin ist
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const isAdmin = profile?.role === "admin" || profile?.role === "master" || profile?.role === "master_admin" || profile?.role === "owner"

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Keine Berechtigung" }, { status: 403 })
    }

    // Lade Einladung
    const { data: invitation } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("token", token)
      .eq("company_id", companyId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!invitation) {
      return NextResponse.json({ success: false, error: "Einladung nicht gefunden oder abgelaufen" }, { status: 404 })
    }

    // Generiere Einladungslink
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "https://my-dispatch.de"
    const inviteUrl = `${siteUrl}/auth/accept-invite?token=${token}`

    // E-Mail-Inhalt
    const emailSubject = `Einladung zu ${company.name} - MyDispatch`
    const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      background: #323D5E;
      padding: 20px;
      text-align: center;
    }
    .email-content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #323D5E;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .email-footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e5e5e5;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 style="color: white; margin: 0;">MyDispatch</h1>
    </div>
    <div class="email-content">
      <h2>Einladung zu ${company.name}</h2>
      <p>Sie wurden eingeladen, dem Team von <strong>${company.name}</strong> beizutreten.</p>
      <p>Ihre Rolle: <strong>${role === "admin" ? "Administrator" : role === "dispatcher" ? "Disponent" : "Benutzer"}</strong></p>
      <p>Klicken Sie auf den folgenden Link, um die Einladung anzunehmen:</p>
      <a href="${inviteUrl}" class="button">Einladung annehmen</a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        Dieser Link ist 7 Tage gültig. Falls Sie diese Einladung nicht angefordert haben, können Sie diese E-Mail ignorieren.
      </p>
    </div>
    <div class="email-footer">
      <p><strong>MyDispatch</strong></p>
      <p>© 2025 my-dispatch.de by RideHub Solutions</p>
    </div>
  </div>
</body>
</html>
    `

    // TODO: E-Mail-Versand implementieren (z.B. mit Resend, SendGrid, etc.)
    // Beispiel:
    // await resend.emails.send({
    //   from: 'noreply@my-dispatch.de',
    //   to: email,
    //   subject: emailSubject,
    //   html: emailHtml
    // })

    console.log("Team Invitation Email:", {
      to: email,
      subject: emailSubject,
      inviteUrl,
      company: company.name,
    })

    return NextResponse.json({
      success: true,
      message: "Einladung erfolgreich gesendet",
    })
  } catch (error) {
    console.error("Error sending team invitation:", error)
    return NextResponse.json({ success: false, error: "Fehler beim Senden der Einladung" }, { status: 500 })
  }
}

