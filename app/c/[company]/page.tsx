import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TenantLandingPage } from "./TenantLandingPage"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ company: string }>
}

export async function generateMetadata({ params }: Props) {
  const { company: slug } = await params

  if (!slug || slug.startsWith("_") || slug.length < 3) {
    return {}
  }

  const supabase = await createClient()

  const { data: company } = await supabase
    .from("companies")
    .select("name, landingpage_title, landingpage_description, logo_url")
    .eq("company_slug", slug)
    .maybeSingle()

  if (!company) {
    return {}
  }

  return {
    title: company.landingpage_title || `${company.name} - Taxi & Fahrservice`,
    description:
      company.landingpage_description ||
      `Buchen Sie Ihren Taxi- oder Fahrservice bei ${company.name}. Zuverlässig, pünktlich und professionell.`,
    openGraph: {
      title: company.landingpage_title || company.name,
      description: company.landingpage_description,
      images: company.logo_url ? [company.logo_url] : undefined,
    },
  }
}

export default async function CompanyLandingPage({ params }: Props) {
  const { company: slug } = await params

  if (!slug || slug.length < 3 || slug.startsWith("_")) {
    notFound()
  }

  const supabase = await createClient()

  const { data: company, error } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      email,
      phone,
      address,
      logo_url,
      company_slug,
      landingpage_enabled,
      landingpage_title,
      landingpage_description,
      landingpage_hero_text,
      landingpage_sections,
      landingpage_meta,
      widget_enabled,
      widget_button_text,
      branding,
      contact_info,
      legal_texts,
      legal_info,
      subscription_tier,
      subscription_status
    `)
    .eq("company_slug", slug)
    .maybeSingle()

  if (error || !company) {
    notFound()
  }

  // Allow active and trialing subscriptions
  const isActive = company.subscription_status === "active" || company.subscription_status === "trialing"

  if (!isActive) {
    notFound()
  }

  return <TenantLandingPage company={company} />
}
