import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function POST(request: Request) {
  try {
    const { email, password, companyId } = await request.json()

    if (!email || !password || !companyId) {
      return NextResponse.json({ error: "E-Mail, Passwort und Company-ID sind erforderlich" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users?.some((u) => u.email === email)

    if (userExists) {
      return NextResponse.json({ error: "Ein Benutzer mit dieser E-Mail existiert bereits" }, { status: 400 })
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for drivers created by admin
      user_metadata: {
        role: "driver",
        company_id: companyId,
        must_change_password: true,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
    })
  } catch (error: any) {
    console.error("Create driver error:", error)
    return NextResponse.json({ error: error.message || "Interner Serverfehler" }, { status: 500 })
  }
}
