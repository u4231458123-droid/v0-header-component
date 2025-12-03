"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { TenantBookingForm } from "@/app/c/[company]/kunde/buchen/TenantBookingForm"
import type { Company, Customer } from "@/types"

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

  return (
    <div className={`w-full ${sizeStyles[size]} mx-auto p-4`}>
      <TenantBookingForm company={company} customer={null} vehicleCategories={[]} />
    </div>
  )
}

