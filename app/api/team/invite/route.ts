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

    // Versende Team-Einladungs-E-Mail mit einheitlichem Template
    try {
      const { sendTeamInvitationEmail } = await import("@/lib/email/email-service")
      
      const emailResult = await sendTeamInvitationEmail({
        to: email,
        companyName: company.name,
        role,
        inviteUrl,
      })

      if (!emailResult.success) {
        console.error("E-Mail-Versand fehlgeschlagen:", emailResult.error)
        // Weiterhin als Erfolg zurückgeben, da die Einladung gespeichert wurde
      }
    } catch (emailError) {
      console.error("Fehler beim Versenden der E-Mail:", emailError)
      // Weiterhin als Erfolg zurückgeben, da die Einladung gespeichert wurde
    }

    return NextResponse.json({
      success: true,
      message: "Einladung erfolgreich gesendet",
    })
  } catch (error) {
    console.error("Error sending team invitation:", error)
    return NextResponse.json({ success: false, error: "Fehler beim Senden der Einladung" }, { status: 500 })
  }
}

