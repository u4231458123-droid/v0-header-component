"use client"

import { createClientSafe } from "@/lib/supabase/client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  company_id: string | null
  email: string
  full_name: string | null
  role: string
  phone: string | null
  avatar_url: string | null
}

interface Company {
  id: string
  name: string
  email: string
  phone: string | null
  subscription_plan: string
  company_slug: string | null
  logo_url: string | null
  landingpage_enabled: boolean
  widget_enabled: boolean
  subscription_product_id?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadUserData = useCallback(
    async (supabase: NonNullable<ReturnType<typeof createClientSafe>>, userId: string, retryCount = 0): Promise<void> => {
      const maxRetries = 3

      try {
        // Load profile with timeout
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle()

        if (profileError) {
          // If it's a network error and we haven't exhausted retries, try again
          if (profileError.message?.includes("fetch") && retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
            return loadUserData(supabase, userId, retryCount + 1)
          }

          // Non-critical error - continue without profile
          console.warn("[v0] Profile load warning:", profileError.message)
          setLoading(false)
          return
        }

        // If no profile exists, create a default one
        if (!profileData) {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            const defaultProfile: Profile = {
              id: userId,
              company_id: null,
              email: userData.user.email || "",
              full_name: userData.user.user_metadata?.full_name || null,
              role: "user",
              phone: null,
              avatar_url: null,
            }
            setProfile(defaultProfile)
          }
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Load company if profile has company_id
        if (profileData?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", profileData.company_id)
            .maybeSingle()

          if (!companyError && companyData) {
            setCompany(companyData)
          }
        }
      } catch (err) {
        // Network errors - retry if possible
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
          return loadUserData(supabase, userId, retryCount + 1)
        }
        console.warn("[v0] Error loading user data after retries:", err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const supabase = createClientSafe()

    if (!supabase) {
      setError("Supabase client not available")
      setLoading(false)
      return
    }

    let isMounted = true

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error: sessionError }: { data: { session: import("@supabase/supabase-js").Session | null }, error: import("@supabase/supabase-js").AuthError | null }) => {
        if (!isMounted) return

        if (sessionError) {
          console.warn("[v0] Session warning:", sessionError.message)
          // Don't set error - just continue without auth
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserData(supabase, session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        console.warn("[v0] Session fetch warning:", err)
        // Don't block the app - just continue without auth
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: import("@supabase/supabase-js").AuthChangeEvent, session: import("@supabase/supabase-js").Session | null) => {
      if (!isMounted) return

      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(supabase, session.user.id)
      } else {
        setProfile(null)
        setCompany(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadUserData])

  async function logout() {
    const supabase = createClientSafe()
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push("/auth/login")
  }

  return {
    user,
    profile,
    company,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
  }
}
