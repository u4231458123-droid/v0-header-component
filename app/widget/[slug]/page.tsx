"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { TenantBookingForm } from "@/app/c/[company]/kunde/buchen/TenantBookingForm"
// Types inline definiert, da @/types nicht existiert
interface Company {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  slug?: string
  company_slug?: string
  logo_url?: string | null
  branding?: Record<string, unknown> | null
  [key: string]: any
}

interface Customer {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string | null
  [key: string]: any
}

export default function WidgetPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState<"small" | "medium" | "large">("medium")

  const supabase = createClient()

  useEffect(() => {
    if (!slug) return

    // Größe aus URL-Parameter lesen
    const urlParams = new URLSearchParams(window.location.search)
    const sizeParam = urlParams.get("size") as "small" | "medium" | "large"
    if (sizeParam && ["small", "medium", "large"].includes(sizeParam)) {
      setSize(sizeParam)
    }

    loadCompany()
  }, [slug])

  const loadCompany = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("company_slug", slug)
        .eq("widget_enabled", true)
        .single()

      if (error || !data) {
        console.error("Company not found or widget disabled:", error)
        return
      }

      setCompany(data as Company)
    } catch (error) {
      console.error("Error loading company:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Lade Widget...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Widget nicht verfügbar</p>
          <p className="text-sm text-muted-foreground mt-2">Das Buchungswidget ist für dieses Unternehmen nicht aktiviert.</p>
        </div>
      </div>
    )
  }

  // Größen-spezifische Styles
  const sizeStyles = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
  }

  // Default Customer für Widget (anonyme Buchungen)
  const defaultCustomer: Customer = {
    id: "widget-anonymous",
    first_name: "",
    last_name: "",
    email: "",
    phone: null,
  }

  return (
    <div className={`w-full ${sizeStyles[size]} mx-auto p-4`}>
      <TenantBookingForm 
        company={company as any} 
        customer={defaultCustomer as any} 
        vehicleCategories={[]} 
      />
    </div>
  )
}

