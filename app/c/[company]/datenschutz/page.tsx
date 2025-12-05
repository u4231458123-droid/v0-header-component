import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function TenantDatenschutzPage({
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
        <div className="container mx-auto px-4 py-4 flex items-center gap-5">
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
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
            <p className="text-muted-foreground">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
              persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Verantwortliche Stelle</h2>
            <p className="text-muted-foreground">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              <br />
              <br />
              {legalInfo.company_name || company.name}
              <br />
              {legalInfo.responsible_person || legalInfo.owner_name}
              <br />
              {legalInfo.address}
              <br />
              {legalInfo.postal_code} {legalInfo.city}
              <br />
              <br />
              Telefon: {legalInfo.phone || company.phone}
              <br />
              E-Mail: {legalInfo.email || company.email}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Datenerfassung auf dieser Website</h2>
            <h3 className="text-lg font-medium mb-2">Cookies</h3>
            <p className="text-muted-foreground">
              Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Textdateien und richten auf
              Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung
              (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Kontaktformular</h2>
            <p className="text-muted-foreground">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular
              inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
              Anschlussfragen bei uns gespeichert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Ihre Rechte</h2>
            <p className="text-muted-foreground">
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten,
              deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder
              Löschung dieser Daten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. SSL- bzw. TLS-Verschlüsselung</h2>
            <p className="text-muted-foreground">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-
              bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des
              Browsers von „http://" auf „https://" wechselt.
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
