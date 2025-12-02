import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DriverChatPanel } from "@/components/drivers/DriverChatPanel"

export default async function FahrerChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("company_id, role").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/dashboard")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fahrer-Kommunikation</h1>
        <p className="text-muted-foreground">Direkte Chat-Kommunikation mit Ihren Fahrern</p>
      </div>
      <DriverChatPanel companyId={profile.company_id} />
    </div>
  )
}
