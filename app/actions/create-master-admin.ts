"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function createMasterAdmin() {
  const supabase = await createServerClient()

  try {
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "courbois1981@gmail.com")
      .single()

    if (existingProfile) {
      return { success: true, message: "Master admin already exists", alreadyExists: true }
    }

    // Create auth user via Supabase Admin API
    // Note: This requires SUPABASE_SERVICE_ROLE_KEY
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "courbois1981@gmail.com",
      password: "1def!xO2022!!",
      email_confirm: true,
      user_metadata: {
        full_name: "Master Admin",
      },
    })

    if (authError) {
      console.error("Auth creation error:", authError)
      return { success: false, error: authError.message }
    }

    // Get or create master company
    let companyId: string

    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("email", "courbois1981@gmail.com")
      .single()

    if (existingCompany) {
      companyId = existingCompany.id
    } else {
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: "Master Admin Company",
          email: "courbois1981@gmail.com",
          subscription_status: "active",
          subscription_tier: "enterprise",
        })
        .select()
        .single()

      if (companyError || !newCompany) {
        console.error("Company creation error:", companyError)
        return { success: false, error: "Failed to create company" }
      }

      companyId = newCompany.id
    }

    // Update profile with master_admin role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "master_admin",
        company_id: companyId,
        full_name: "Master Admin",
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { success: false, error: profileError.message }
    }

    return {
      success: true,
      message: "Master admin created successfully",
      userId: authData.user.id,
      companyId,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
