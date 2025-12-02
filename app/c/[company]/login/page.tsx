import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { TenantLoginPage } from "./TenantLoginPage"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company: slug } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    },
  )

  // Lade Unternehmensdaten fuer das Branding
  const { data: companyData } = await supabase.from("companies").select("*").eq("company_slug", slug).single()

  if (!companyData) {
    notFound()
  }

  return <TenantLoginPage company={companyData} />
}
