"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Trash2, Check } from "lucide-react"
import Link from "next/link"

const paymentMethods = [
  {
    id: 1,
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: 2,
    type: "card",
    brand: "Mastercard",
    last4: "8888",
    expiry: "06/25",
    isDefault: false,
  },
]

export default function KundenPortalZahlungsmethodenPage() {
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
            <Link href="/kunden-portal/zahlungsmethoden" className="text-sm font-medium text-foreground">
              Zahlungsmethoden
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Zahlungsmethoden</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihre Zahlungsmethoden</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue hinzufügen
            </Button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 rounded bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.brand} •••• {method.last4}</span>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Standard
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Läuft ab {method.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button variant="outline" size="sm">
                          Als Standard
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rechnungsanschrift</CardTitle>
              <CardDescription>Ihre Standardadresse für Rechnungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Max Mustermann</p>
              <p className="text-sm text-muted-foreground">Musterstraße 123</p>
              <p className="text-sm text-muted-foreground">12345 Musterstadt</p>
              <Button variant="outline" size="sm" className="mt-4">
                Adresse bearbeiten
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
