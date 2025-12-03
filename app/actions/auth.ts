"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[Auth] Missing Supabase env vars:", {
      hasUrl: !!url,
      hasKey: !!key,
    })
    throw new Error("Supabase-Konfiguration fehlt. Bitte prüfen Sie die Environment Variables.")
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component - cookies can't be set
        }
      },
    },
  })
}

async function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("[Auth] Missing Supabase admin env vars:", {
      hasUrl: !!url,
      hasKey: !!key,
    })
    throw new Error("Supabase Service Role Key fehlt. Bitte prüfen Sie die Environment Variables.")
  }

  const { createClient } = await import("@supabase/supabase-js")
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getGermanErrorMessage(errorCode: string, errorMessage: string): string {
  const errorMessages: Record<string, string> = {
    invalid_credentials: "Ungültige E-Mail-Adresse oder Passwort. Bitte überprüfen Sie Ihre Eingaben.",
    email_not_confirmed: "Ihre E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfen Sie Ihr Postfach.",
    user_not_found: "Kein Konto mit dieser E-Mail-Adresse gefunden.",
    invalid_grant: "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.",
    too_many_requests: "Zu viele Anmeldeversuche. Bitte warten Sie einige Minuten.",
    user_banned: "Dieses Konto wurde gesperrt. Bitte kontaktieren Sie den Support.",
  }

  return errorMessages[errorCode] || errorMessage || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
}

export async function loginAction(email: string, password: string) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const errorCode = (error as any).code || ""
      const germanMessage = getGermanErrorMessage(errorCode, error.message)
      return { success: false, error: germanMessage }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return {
      success: false,
      error: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
    }
  }
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return { success: false, error: "Fehler beim Abmelden" }
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "https://my-dispatch.de"
    const redirectUrl = `${siteUrl}/auth/callback?type=recovery&next=/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.error("[v0] Password reset error:", error.message)
    }

    // Always return success to prevent email enumeration
    return { success: true }
  } catch (error) {
    console.error("[v0] Password reset error:", error)
    return { success: true }
  }
}

export async function updatePasswordAction(accessToken: string, newPassword: string) {
  try {
    const supabase = await createSupabaseAdminClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      return { success: false, error: "Ungültiger oder abgelaufener Link. Bitte fordern Sie einen neuen an." }
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
    }
  }
}

export async function resendConfirmationEmailAction(email: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "https://my-dispatch.de"
    const redirectUrl = `${siteUrl}/auth/callback?type=signup&next=/dashboard`

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error("[v0] Resend confirmation error:", error.message)
      return { success: false, error: "Fehler beim Versenden der Bestätigungs-E-Mail. Bitte versuchen Sie es erneut." }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Resend confirmation error:", error)
    return { success: false, error: "Ein unerwarteter Fehler ist aufgetreten." }
  }
}
