"use client"
import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"

// =============================================================================
// INLINE COMPANY DATA - Single Source of Truth (aus Pflichtenheft)
// =============================================================================
const COMPANY = {
  name: "RideHub Solutions",
  domain: "my-dispatch.de",
  copyright: `© ${new Date().getFullYear()} my-dispatch.de by RideHub Solutions`,
  description: "Die moderne Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Unternehmen. Made in Germany.",
  pricing: {
    starter: { price: 39, drivers: 3, vehicles: 3 },
    business: { price: 99, drivers: "unbegrenzt", vehicles: "unbegrenzt" },
  },
}

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§1 Geltungsbereich</h2>
              <p className="text-muted-foreground leading-relaxed">
                Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Nutzung der
                MyDispatch-Software, die zwischen der RideHub Solutions (nachfolgend &quot;Anbieter&quot;) und dem
                Kunden geschlossen werden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§2 Vertragsgegenstand</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Anbieter stellt dem Kunden eine cloudbasierte Softwarelösung zur Verwaltung von Taxi-, Mietwagen-
                und Chauffeurunternehmen zur Verfügung. Die konkrete Leistungsbeschreibung ergibt sich aus der jeweils
                gewählten Paketbeschreibung auf der Website www.my-dispatch.de.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§3 Vertragsschluss</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Vertrag kommt durch die Registrierung des Kunden und die Bestätigung durch den Anbieter zustande.
                Die Registrierung stellt ein bindendes Angebot des Kunden dar. Der Anbieter kann dieses Angebot
                innerhalb von 5 Werktagen annehmen. Mit der Registrierung wählt der Kunde einen kostenpflichtigen Tarif.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§4 Nutzungsrechte</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Kunde erhält ein nicht-exklusives, nicht übertragbares Recht zur Nutzung der Software für die
                Vertragslaufzeit. Die Nutzung ist auf den vereinbarten Umfang beschränkt (z.B. Anzahl der Fahrer,
                Fahrzeuge).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§5 Vergütung und Zahlungsbedingungen</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Die Vergütung richtet sich nach dem vom Kunden gewählten Tarif:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Starter: 39€/Monat (bis 3 Fahrer, 3 Fahrzeuge)</li>
                <li>Business: 99€/Monat (unbegrenzte Fahrer & Fahrzeuge)</li>
                <li>Enterprise: Individuell (unbegrenzt, persönlicher Support)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Die Abrechnung erfolgt monatlich im Voraus. Die Zahlung ist innerhalb von 14 Tagen nach
                Rechnungsstellung fällig. Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer. Bei
                jährlicher Vorauszahlung gewähren wir einen Rabatt von 20%.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§6 Vertragslaufzeit und Kündigung</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Vertrag wird für die Dauer von einem Monat geschlossen und verlängert sich automatisch um jeweils
                einen weiteren Monat, wenn er nicht mit einer Frist von 14 Tagen zum Monatsende gekündigt wird. Die
                Kündigung bedarf der Textform (E-Mail genügt). Bei jährlicher Zahlungsweise beträgt die Vertragslaufzeit
                12 Monate mit einer Kündigungsfrist von 30 Tagen zum Ende der Vertragslaufzeit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§7 Gewährleistung und Verfügbarkeit</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Anbieter gewährleistet eine Verfügbarkeit der Software von 99% im Jahresmittel. Ausgenommen sind
                planmäßige Wartungsarbeiten (werden vorab angekündigt) und Zeiten, in denen die Server aufgrund von
                höherer Gewalt nicht erreichbar sind.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§8 Haftung</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für die Verletzung von
                Leben, Körper oder Gesundheit. Im Übrigen ist die Haftung auf die vertragstypischen, vorhersehbaren
                Schäden begrenzt und auf maximal die Höhe der in den letzten 12 Monaten gezahlten Vergütung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§9 Datenschutz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Der Anbieter verpflichtet sich, alle gesetzlichen Bestimmungen zum Datenschutz (DSGVO, BDSG)
                einzuhalten. Einzelheiten regelt die Datenschutzerklärung unter www.my-dispatch.de/datenschutz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">§10 Schlussbestimmungen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Deggendorf, sofern der Kunde
                Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
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
