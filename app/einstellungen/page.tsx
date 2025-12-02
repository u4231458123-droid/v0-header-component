import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/MainLayout"
import { SettingsPageClient } from "@/components/settings/SettingsPageClient"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * EINSTELLUNGEN-SEITE
 * ===================
 * Diese Seite ist NUR für MyDispatch-KUNDEN (Unternehmer/Taxi-Unternehmen)
 * Master-Admin hat einen separaten Bereich unter /admin
 */

interface Profile {
  company_id: string | null
  role: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: Error | null = null
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.warn(`[v0] Retry ${i + 1}/${retries} failed:`, error)
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  throw lastError
}

export default async function SettingsPage() {
  let supabase: SupabaseClient
  try {
    supabase = await createClient()
  } catch (error) {
    console.error("[v0] Supabase client creation failed:", error)
    redirect("/auth/login")
  }

  let user: User | undefined
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data
    })
    user = result.user
  } catch (error) {
    console.error("[v0] Auth error after retries:", error)
    redirect("/auth/login")
  }

  if (!user) {
    redirect("/auth/login")
  }

  let profile: Profile | null
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("company_id, role, full_name, email, phone, avatar_url")
        .eq("id", user!.id)
        .maybeSingle()
      if (error) throw error
      return data as Profile | null
    })
    profile = result
  } catch (error) {
    console.warn("[v0] Profile fetch failed, using fallback:", error)
    profile = null
  }

  // Kein Profil? Erstelle eines
  if (!profile) {
    console.log("[v0] No profile found, creating default profile for user:", user!.id)

    try {
      const { data: newProfile } = await withRetry(async () => {
        return await supabase
          .from("profiles")
          .insert({
            id: user!.id,
            email: user!.email,
            full_name: user!.user_metadata?.full_name || user!.email?.split("@")[0] || "Benutzer",
            role: "owner",
            company_id: null,
          })
          .select("company_id, role, full_name, email, phone, avatar_url")
          .single()
      })
      profile = newProfile
    } catch (error) {
      console.error("[v0] Could not create profile:", error)
    }

    return renderSettingsPage(
      supabase,
      profile || {
        company_id: null,
        role: "owner",
        full_name: user!.email?.split("@")[0] || "Benutzer",
        email: user!.email || "",
        phone: null,
        avatar_url: null,
      },
      user,
    )
  }

  return renderSettingsPage(supabase, profile, user)
}

async function renderSettingsPage(supabase: SupabaseClient, profile: Profile, user: User) {
  let company = null
  let teamMembers: any[] = []
  let driversCount = 0
  let vehiclesCount = 0
  let bookingsCount = 0

  if (profile.company_id) {
    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .maybeSingle()

    company = companyData

    if (company) {
      // Fetch team members
      const { data: teamData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, created_at")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: true })

      teamMembers = teamData || []

      // Fetch usage stats
      const { count: dCount } = await supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .eq("company_id", profile.company_id)

      const { count: vCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("company_id", profile.company_id)

      const { count: bCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("company_id", profile.company_id)

      driversCount = dCount || 0
      vehiclesCount = vCount || 0
      bookingsCount = bCount || 0
    }
  }

  return (
    <MainLayout>
      <SettingsPageClient
        company={company}
        profile={profile}
        teamMembers={teamMembers}
        usage={{
          drivers: driversCount,
          vehicles: vehiclesCount,
          bookings: bookingsCount,
        }}
      />
    </MainLayout>
  )
}
