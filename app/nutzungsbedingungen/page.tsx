import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import Link from "next/link"

export default function NutzungsbedingungenPage() {
  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Nutzungsbedingungen</h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Akzeptanz der Nutzungsbedingungen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Durch die Nutzung von MyDispatch erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Wenn
                Sie mit diesen Bedingungen nicht einverstanden sind, dürfen Sie die Software nicht nutzen. Diese
                Nutzungsbedingungen ergänzen unsere
                <Link href="/agb" className="text-primary hover:underline mx-1">
                  Allgemeinen Geschäftsbedingungen
                </Link>
                und die
                <Link href="/datenschutz" className="text-primary hover:underline mx-1">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Nutzerkonto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Für die Nutzung der Software ist die Registrierung eines Nutzerkontos erforderlich. Sie sind
                verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen und diese aktuell zu halten. Sie
                sind für alle Aktivitäten verantwortlich, die unter Ihrem Konto durchgeführt werden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Zulässige Nutzung</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Sie verpflichten sich, die Software nur für rechtmäßige Zwecke zu nutzen. Insbesondere ist es untersagt:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Die Software für illegale Aktivitäten zu verwenden</li>
                <li>Unbefugten Zugang zu den Systemen zu verschaffen</li>
                <li>Schadsoftware oder Viren zu verbreiten</li>
                <li>Die Rechte Dritter zu verletzen</li>
                <li>Die Software zu dekompilieren oder zu reverse-engineeren</li>
                <li>Automatisierte Zugriffe ohne unsere Genehmigung durchzuführen</li>
                <li>Die Software für Spam oder unerwünschte Werbung zu nutzen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Datensicherheit</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sie sind verantwortlich für die Sicherheit Ihrer Zugangsdaten. Bewahren Sie Ihr Passwort sicher auf und
                teilen Sie es nicht mit Dritten. Informieren Sie uns umgehend unter support@my-dispatch.de, wenn Sie
                einen unbefugten Zugriff auf Ihr Konto vermuten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Geistiges Eigentum</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alle Rechte an der Software, einschließlich Urheberrechte, Markenrechte und sonstige Schutzrechte,
                liegen beim Anbieter (RideHub Solutions). Sie erhalten lediglich ein beschränktes Nutzungsrecht gemäß
                diesen Bedingungen. Das Logo, der Name &quot;MyDispatch&quot; und alle damit verbundenen Marken sind
                geschützt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Inhalte und Daten</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sie behalten alle Rechte an den Daten, die Sie in MyDispatch eingeben. Sie gewähren uns jedoch das
                Recht, diese Daten zu verarbeiten, um unsere Dienste zu erbringen. Wir werden Ihre Daten nicht ohne Ihre
                Zustimmung an Dritte weitergeben, außer wenn dies gesetzlich erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">7. Nutzung durch Mitarbeiter</h2>
              <p className="text-muted-foreground leading-relaxed">
                Als Kontoinhaber sind Sie dafür verantwortlich, dass alle Personen, denen Sie Zugang zu Ihrem Konto
                gewähren (z.B. Fahrer, Disponenten), diese Nutzungsbedingungen einhalten. Sie haften für Verstöße durch
                autorisierte Nutzer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">8. Verfügbarkeit der Dienste</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wir bemühen uns um eine hohe Verfügbarkeit unserer Dienste. Wir garantieren jedoch keine
                unterbrechungsfreie Nutzung. Wartungsarbeiten werden nach Möglichkeit vorab angekündigt und außerhalb
                der Hauptgeschäftszeiten durchgeführt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">9. Änderungen der Nutzungsbedingungen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Wesentliche Änderungen
                werden wir Ihnen mindestens 30 Tage vor Inkrafttreten per E-Mail mitteilen. Wenn Sie nach der Mitteilung
                die Software weiter nutzen, gelten die neuen Bedingungen als akzeptiert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">10. Kontakt</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bei Fragen zu diesen Nutzungsbedingungen wenden Sie sich bitte an:
                <br />
                <a href="mailto:support@my-dispatch.de" className="text-primary hover:underline">
                  support@my-dispatch.de
                </a>
              </p>
            </section>

            <p className="text-muted-foreground text-sm pt-8 border-t border-border">Stand: November 2025</p>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  )
}
