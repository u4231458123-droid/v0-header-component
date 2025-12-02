import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function TenantImpressumPage({
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
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="text-muted-foreground">
              {legalInfo.company_name || company.name}
              <br />
              {legalInfo.address && (
                <>
                  {legalInfo.address}
                  <br />
                </>
              )}
              {legalInfo.postal_code && legalInfo.city && (
                <>
                  {legalInfo.postal_code} {legalInfo.city}
                  <br />
                </>
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Vertreten durch</h2>
            <p className="text-muted-foreground">
              {legalInfo.responsible_person || legalInfo.owner_name || "Geschäftsführer"}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
            <p className="text-muted-foreground">
              {legalInfo.phone && (
                <>
                  Telefon: {legalInfo.phone}
                  <br />
                </>
              )}
              {legalInfo.email && (
                <>
                  E-Mail: {legalInfo.email}
                  <br />
                </>
              )}
            </p>
          </section>

          {(legalInfo.register_court || legalInfo.register_number) && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Registereintrag</h2>
              <p className="text-muted-foreground">
                {legalInfo.register_court && (
                  <>
                    Registergericht: {legalInfo.register_court}
                    <br />
                  </>
                )}
                {legalInfo.register_number && (
                  <>
                    Registernummer: {legalInfo.register_number}
                    <br />
                  </>
                )}
              </p>
            </section>
          )}

          {(legalInfo.tax_id || legalInfo.vat_id) && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Umsatzsteuer-ID</h2>
              <p className="text-muted-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                <br />
                {legalInfo.vat_id || legalInfo.tax_id}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold mb-4">Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Haftung für Inhalte</h2>
            <p className="text-muted-foreground">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
              Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
              eine rechtswidrige Tätigkeit hinweisen.
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
