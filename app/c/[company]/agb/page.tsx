import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function TenantAGBPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company: companySlug } = await params
  const supabase = await createClient()

  const { data: company, error } = await supabase.from("companies").select("*").eq("company_slug", companySlug).single()

  if (error || !company) {
    notFound()
  }

  const legalInfo = (company.legal_info as Record<string, string>) || {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/c/${companySlug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{company.name}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">§ 1 Geltungsbereich</h2>
            <p className="text-muted-foreground">
              Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge zwischen
              {legalInfo.company_name || company.name} (nachfolgend „Anbieter") und dem Kunden über
              Personenbeförderungsleistungen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">§ 2 Vertragsschluss</h2>
            <p className="text-muted-foreground">
              (1) Die Darstellung unserer Dienstleistungen stellt kein rechtlich bindendes Angebot dar, sondern eine
              Aufforderung zur Abgabe eines Angebots.
              <br />
              <br />
              (2) Durch die Buchung einer Fahrt gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt zustande,
              wenn wir die Buchung per E-Mail oder telefonisch bestätigen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">§ 3 Preise und Zahlung</h2>
            <p className="text-muted-foreground">
              (1) Die angegebenen Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer.
              <br />
              <br />
              (2) Die Zahlung erfolgt, sofern nicht anders vereinbart, in bar oder per Überweisung nach
              Rechnungsstellung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">§ 4 Stornierung</h2>
            <p className="text-muted-foreground">
              (1) Eine unentgeltliche Stornierung ist bis zu 24 Stunden vor dem vereinbarten Abholtermin möglich.
              <br />
              <br />
              (2) Bei späterer Stornierung oder Nichterscheinen kann eine Stornogebühr erhoben werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">§ 5 Pflichten des Fahrgastes</h2>
            <p className="text-muted-foreground">
              (1) Der Fahrgast ist verpflichtet, sich an die Anweisungen des Fahrers zu halten.
              <br />
              <br />
              (2) Das Rauchen im Fahrzeug ist nicht gestattet.
              <br />
              <br />
              (3) Für durch den Fahrgast verursachte Schäden haftet dieser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">§ 6 Haftung</h2>
            <p className="text-muted-foreground">
              (1) Wir haften für Schäden nur bei Vorsatz oder grober Fahrlässigkeit.
              <br />
              <br />
              (2) Die Haftung für leichte Fahrlässigkeit ist, soweit gesetzlich zulässig, ausgeschlossen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">§ 7 Schlussbestimmungen</h2>
            <p className="text-muted-foreground">
              (1) Es gilt das Recht der Bundesrepublik Deutschland.
              <br />
              <br />
              (2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen
              Bestimmungen unberührt.
            </p>
          </section>

          <section className="pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Anbieter:</strong>
              <br />
              {legalInfo.company_name || company.name}
              <br />
              {legalInfo.address}
              <br />
              {legalInfo.postal_code} {legalInfo.city}
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {company.name}. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  )
}
