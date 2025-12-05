"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Car, Clock } from "lucide-react"
import Link from "next/link"

const notifications = [
  {
    id: 1,
    type: "booking",
    title: "Fahrt bestätigt",
    message: "Ihre Fahrt am 28.11.2025 um 14:00 Uhr wurde bestätigt.",
    time: "Vor 2 Stunden",
    read: false,
  },
  {
    id: 2,
    type: "driver",
    title: "Fahrer zugewiesen",
    message: "Max Mustermann wurde als Fahrer für Ihre nächste Fahrt zugewiesen.",
    time: "Vor 5 Stunden",
    read: false,
  },
  {
    id: 3,
    type: "reminder",
    title: "Erinnerung",
    message: "Ihre Fahrt beginnt in 24 Stunden.",
    time: "Gestern",
    read: true,
  },
]

export default function KundenPortalBenachrichtigungenPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/kunden-portal" className="text-xl font-bold text-primary">
            MyDispatch Kundenportal
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/kunden-portal" className="text-sm text-muted-foreground hover:text-foreground">
              Übersicht
            </Link>
            <Link href="/kunden-portal/benachrichtigungen" className="text-sm font-medium text-foreground">
              Benachrichtigungen
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Benachrichtigungen</h1>
              <p className="text-muted-foreground">Ihre aktuellen Mitteilungen</p>
            </div>
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Alle als gelesen markieren
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {notification.type === "booking" && <Car className="h-5 w-5 text-primary" />}
                      {notification.type === "driver" && <Bell className="h-5 w-5 text-primary" />}
                      {notification.type === "reminder" && <Clock className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">Neu</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Keine Benachrichtigungen</h3>
                <p className="text-muted-foreground">Sie haben keine neuen Benachrichtigungen.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
