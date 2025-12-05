import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Vielen Dank für Ihre Registrierung!</CardTitle>
              <CardDescription>Bestätigen Sie Ihre E-Mail</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sie haben sich erfolgreich registriert. Bitte überprüfen Sie Ihr E-Mail-Postfach und bestätigen Sie Ihre
                E-Mail-Adresse, bevor Sie sich anmelden.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Zum Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
