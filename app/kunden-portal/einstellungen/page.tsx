"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User, Bell, Shield } from "lucide-react"
import Link from "next/link"

export default function KundenPortalEinstellungenPage() {
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
                  <Input id="firstName" placeholder="Max" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" placeholder="Mustermann" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" placeholder="max@beispiel.de" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" placeholder="+49 123 456789" />
              </div>
              <Button>Speichern</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>Verwalten Sie Ihre Benachrichtigungseinstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Benachrichtigungseinstellungen werden in Kürze verfügbar sein.
              </p>
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
              <Button variant="outline">Passwort ändern</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
