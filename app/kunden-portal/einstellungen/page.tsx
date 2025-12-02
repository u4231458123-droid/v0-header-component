"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User, Bell, Shield, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Supabase Client Helper
function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function KundenPortalEinstellungenPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = "/auth/login"
        return
      }
      
      setUserId(user.id)

      // Lade Kundendaten
      const { data: customerData, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Fehler beim Laden:", error)
        toast.error("Daten konnten nicht geladen werden")
        return
      }

      if (customerData) {
        setCustomer(customerData)
        setFormData({
          firstName: customerData.first_name || "",
          lastName: customerData.last_name || "",
          email: customerData.email || user.email || "",
          phone: customerData.phone || "",
        })
      } else {
        // Fallback: Daten aus Auth User
        setFormData(prev => ({ ...prev, email: user.email || "" }))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)

    try {
      const supabase = getSupabaseClient()
      
      // Update oder Insert
      const customerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      }

      let error
      
      if (customer) {
        const { error: updateError } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", customer.id)
        error = updateError
      } else {
        // Sollte eigentlich nicht passieren, da Kunde beim Login erstellt wird, aber sicherheitshalber:
        // Hier müsste man company_id wissen, was schwierig ist im globalen Kontext ohne Zuordnung.
        // Wir nehmen an, der Kunde existiert bereits.
        toast.error("Kundenprofil nicht gefunden. Bitte kontaktieren Sie den Support.")
        setSaving(false)
        return
      }

      if (error) throw error

      toast.success("Einstellungen erfolgreich gespeichert")
      
      // Reload data to be sure
      loadCustomerData()
    } catch (error: any) {
      console.error("Speicherfehler:", error)
      toast.error("Fehler beim Speichern: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/kunden-portal" className="text-xl font-bold text-primary">
            MyDispatch Kundenportal
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/kunden-portal" className="text-sm text-muted-foreground hover:text-foreground">
              Übersicht
            </Link>
            <Link href="/kunden-portal/einstellungen" className="text-sm font-medium text-foreground">
              Einstellungen
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Einstellungen</h1>
            <p className="text-muted-foreground">Verwalten Sie Ihre Kontoeinstellungen</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Daten
              </CardTitle>
              <CardDescription>Aktualisieren Sie Ihre persönlichen Informationen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Max" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Mustermann" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  disabled // E-Mail ändern ist komplexer (Auth)
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">E-Mail kann nur über den Support geändert werden.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+49 123 456789" 
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Speichern
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sicherheit
              </CardTitle>
              <CardDescription>Passwort und Sicherheitseinstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" asChild>
                <Link href="/auth/forgot-password">Passwort ändern</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
