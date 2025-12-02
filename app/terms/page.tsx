import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"
import { redirect } from "next/navigation"

export default function TermsPage() {
  redirect("/nutzungsbedingungen")

  return (
    <MarketingLayout background="white">
      <V28MarketingSection className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold text-foreground mb-8">Nutzungsbedingungen</h1>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Akzeptanz der Nutzungsbedingungen</h2>
          <p className="text-muted-foreground">
            Durch die Nutzung von MyDispatch erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Wenn Sie
            mit diesen Bedingungen nicht einverstanden sind, dürfen Sie die Software nicht nutzen.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Nutzerkonto</h2>
          <p className="text-muted-foreground">
            Für die Nutzung der Software ist die Registrierung eines Nutzerkontos erforderlich. Sie sind verpflichtet,
            bei der Registrierung wahrheitsgemäße Angaben zu machen und diese aktuell zu halten. Sie sind für alle
            Aktivitäten verantwortlich, die unter Ihrem Konto durchgeführt werden.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Zulässige Nutzung</h2>
          <p className="text-muted-foreground">
            Sie verpflichten sich, die Software nur für rechtmäßige Zwecke zu nutzen. Insbesondere ist es untersagt:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>Die Software für illegale Aktivitäten zu verwenden</li>
            <li>Unbefugten Zugang zu den Systemen zu verschaffen</li>
            <li>Schadsoftware oder Viren zu verbreiten</li>
            <li>Die Rechte Dritter zu verletzen</li>
            <li>Die Software zu dekompilieren oder zu reverse-engineeren</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Datensicherheit</h2>
          <p className="text-muted-foreground">
            Sie sind verantwortlich für die Sicherheit Ihrer Zugangsdaten. Bewahren Sie Ihr Passwort sicher auf und
            teilen Sie es nicht mit Dritten. Informieren Sie uns umgehend, wenn Sie einen unbefugten Zugriff auf Ihr
            Konto vermuten.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Geistiges Eigentum</h2>
          <p className="text-muted-foreground">
            Alle Rechte an der Software, einschließlich Urheberrechte, Markenrechte und sonstige Schutzrechte, liegen
            beim Anbieter. Sie erhalten lediglich ein beschränktes Nutzungsrecht gemäß diesen Bedingungen.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Änderungen der Nutzungsbedingungen</h2>
          <p className="text-muted-foreground">
            Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Wesentliche Änderungen werden
            wir Ihnen per E-Mail mitteilen. Wenn Sie nach der Mitteilung die Software weiter nutzen, gelten die neuen
            Bedingungen als akzeptiert.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Kontakt</h2>
          <p className="text-muted-foreground">
            Bei Fragen zu diesen Nutzungsbedingungen wenden Sie sich bitte an: support@my-dispatch.de
          </p>

          <p className="text-muted-foreground text-sm mt-8">Stand: Januar 2025</p>
        </div>
      </V28MarketingSection>
    </MarketingLayout>
  )
}
