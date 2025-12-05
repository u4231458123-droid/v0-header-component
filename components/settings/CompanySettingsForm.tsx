"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Inline SVG Icon
function Loader2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

interface Company {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  company_slug?: string
  logo_url?: string
  landingpage_enabled: boolean
  widget_enabled: boolean
  landingpage_title?: string
  landingpage_description?: string
  landingpage_hero_text?: string
  widget_button_text?: string
}

interface CompanySettingsFormProps {
  company: Company
}

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Kein Unternehmen gefunden. Bitte erstellen Sie zuerst ein Unternehmen.</p>
      </div>
    )
  }

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: company?.name || "",
    email: company?.email || "",
    phone: company?.phone || "",
    address: company?.address || "",
    company_slug: company?.company_slug || "",
    landingpage_enabled: company?.landingpage_enabled || false,
    widget_enabled: company?.widget_enabled || false,
    landingpage_title: company?.landingpage_title || "",
    landingpage_description: company?.landingpage_description || "",
    landingpage_hero_text: company?.landingpage_hero_text || "",
    widget_button_text: company?.widget_button_text || "Jetzt buchen",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("companies").update(formData).eq("id", company.id)

      if (error) throw error

      toast.success("Einstellungen erfolgreich gespeichert")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating company:", error)
      toast.error("Fehler beim Speichern der Einstellungen")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${company.id}-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage.from("company-assets").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("company-assets").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("companies")
        .update({ logo_url: publicUrl })
        .eq("id", company.id)

      if (updateError) throw updateError

      toast.success("Logo erfolgreich hochgeladen")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error uploading logo:", error)
      toast.error("Fehler beim Hochladen des Logos")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basisdaten</TabsTrigger>
          <TabsTrigger value="landingpage">Landingpage</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Unternehmensname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="landingpage" className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="landingpage_enabled"
              checked={formData.landingpage_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, landingpage_enabled: checked })}
            />
            <Label htmlFor="landingpage_enabled">Öffentliche Landingpage aktivieren</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_slug">URL-Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">my-dispatch.de/</span>
              <Input
                id="company_slug"
                value={formData.company_slug}
                onChange={(e) =>
                  setFormData({ ...formData, company_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                }
                placeholder="ihr-unternehmen"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="landingpage_title">Seitentitel</Label>
            <Input
              id="landingpage_title"
              value={formData.landingpage_title}
              onChange={(e) => setFormData({ ...formData, landingpage_title: e.target.value })}
              placeholder="z.B. Ihr zuverlässiger Taxiservice"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landingpage_hero_text">Hero-Text</Label>
            <Textarea
              id="landingpage_hero_text"
              value={formData.landingpage_hero_text}
              onChange={(e) => setFormData({ ...formData, landingpage_hero_text: e.target.value })}
              placeholder="Beschreiben Sie Ihr Unternehmen..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="widget_enabled"
              checked={formData.widget_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, widget_enabled: checked })}
            />
            <Label htmlFor="widget_enabled">Online-Buchungswidget aktivieren</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="widget_button_text">Button-Text</Label>
            <Input
              id="widget_button_text"
              value={formData.widget_button_text}
              onChange={(e) => setFormData({ ...formData, widget_button_text: e.target.value })}
              placeholder="z.B. Jetzt buchen"
            />
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Unternehmenslogo</Label>
            {company.logo_url && (
              <div className="mb-4">
                <img src={company.logo_url || "/placeholder.svg"} alt="Logo" className="h-20 w-auto object-contain" />
              </div>
            )}
            <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
            {uploading && <p className="text-sm text-muted-foreground">Logo wird hochgeladen...</p>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Speichern
        </Button>
      </div>
    </form>
  )
}
