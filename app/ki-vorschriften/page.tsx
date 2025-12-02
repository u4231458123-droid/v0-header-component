import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Shield, Eye, Database, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { COMPANY } from "@/lib/company-data"

export default function KIVorschriftenPage() {
  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">KI-Vorschriften & Transparenz</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Informationen zur Nutzung von Künstlicher Intelligenz in MyDispatch gemäß EU AI Act (Verordnung (EU)
              2024/1689) und deutschen Datenschutzbestimmungen.
            </p>
          </div>

          {/* Overview Cards - Alle Icon-Backgrounds auf bg-primary/10 geaendert */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Niedriges Risiko</h3>
                <p className="text-sm text-muted-foreground">
                  Unsere KI-Systeme fallen in die Kategorie mit niedrigem Risiko gemäß EU AI Act
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Volle Transparenz</h3>
                <p className="text-sm text-muted-foreground">
                  Wir informieren Sie klar über den Einsatz und Umfang unserer KI-Funktionen
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">DSGVO-konform</h3>
                <p className="text-sm text-muted-foreground">
                  Alle KI-Verarbeitungen erfolgen unter Einhaltung der DSGVO
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Eingesetzte KI-Systeme</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                MyDispatch setzt folgende KI-gestützte Funktionen ein:
              </p>

              <div className="space-y-4">
                <Card className="rounded-xl border-border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground mb-2">KI-Assistent (Chatbot)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ein Sprachmodell zur Beantwortung von Fragen und Unterstützung bei der Softwarenutzung. Der
                      Assistent kann keine Entscheidungen treffen und greift nicht auf personenbezogene Daten zu.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Niedriges Risiko, transparente Kennzeichnung</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground mb-2">Intelligente Routenoptimierung</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Algorithmen zur Optimierung von Fahrtrouten basierend auf Verkehrsdaten und historischen Mustern.
                      Keine Verarbeitung personenbezogener Daten.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Niedriges Risiko, rein operationale Funktion</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground mb-2">Automatische Auftragszuordnung</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Unterstützung bei der Zuordnung von Aufträgen zu verfügbaren Fahrern basierend auf Standort und
                      Verfügbarkeit. Endentscheidung liegt beim Disponenten.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        Niedriges Risiko, menschliche Kontrolle gewährleistet
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Risikoeinstufung nach EU AI Act</h2>
              <p className="text-muted-foreground leading-relaxed">
                Gemäß der Verordnung (EU) 2024/1689 (EU AI Act) werden KI-Systeme in verschiedene Risikokategorien
                eingeteilt. Alle in MyDispatch eingesetzten KI-Systeme fallen in die Kategorie &quot;niedriges
                Risiko&quot; oder &quot;minimales Risiko&quot;, da sie:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                <li>Keine automatisierten Entscheidungen mit rechtlichen Auswirkungen treffen</li>
                <li>Keine biometrischen Daten verarbeiten</li>
                <li>Keine Bewertung natürlicher Personen vornehmen (Scoring)</li>
                <li>Stets unter menschlicher Aufsicht und Kontrolle stehen</li>
                <li>Transparent als KI-generiert gekennzeichnet sind</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Datenverarbeitung durch KI</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Bei der Nutzung unserer KI-Funktionen werden folgende Daten verarbeitet:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Eingaben an den KI-Assistenten (Fragen, Befehle)</li>
                <li>Standortdaten für Routenoptimierung (anonymisiert)</li>
                <li>Auftragsparameter für Zuordnungsvorschläge</li>
              </ul>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Wichtig:</strong> Keine personenbezogenen Kundendaten (Namen,
                    Adressen, Kontaktdaten) werden an externe KI-Dienste übertragen. Die Verarbeitung erfolgt
                    ausschließlich auf Servern innerhalb der EU.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Ihre Rechte</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Im Zusammenhang mit KI-gestützter Datenverarbeitung haben Sie folgende Rechte:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Recht auf Information über den Einsatz von KI (Art. 13 DSGVO)</li>
                <li>Recht auf menschliche Überprüfung automatisierter Entscheidungen (Art. 22 DSGVO)</li>
                <li>Recht auf Widerspruch gegen KI-gestützte Verarbeitung</li>
                <li>Recht auf Löschung von KI-verarbeiteten Daten</li>
                <li>Recht auf Auskunft über die Logik der KI-Systeme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Deaktivierung von KI-Funktionen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sie können KI-gestützte Funktionen in Ihren Kontoeinstellungen jederzeit deaktivieren. Die
                Kernfunktionen von MyDispatch bleiben auch ohne KI-Unterstützung vollständig nutzbar. Bei Fragen zur
                Deaktivierung wenden Sie sich an unseren Support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Kontakt & Beschwerden</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bei Fragen oder Beschwerden zu unseren KI-Systemen erreichen Sie uns unter:
              </p>
              <div className="bg-muted/50 rounded-xl p-4 mt-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">E-Mail:</strong>{" "}
                  <a href={`mailto:${COMPANY.contact.datenschutz}`} className="text-primary hover:underline">
                    {COMPANY.contact.datenschutz}
                  </a>
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Post:</strong> {COMPANY.name}, {COMPANY.address.street},{" "}
                  {COMPANY.address.zip} {COMPANY.address.city}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">7. Weiterführende Informationen</h2>
              <p className="text-muted-foreground leading-relaxed">
                Weitere Informationen zum Datenschutz und zur Datenverarbeitung finden Sie in unserer{" "}
                <Link href="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
                . Allgemeine Vertragsbedingungen regeln unsere{" "}
                <Link href="/agb" className="text-primary hover:underline">
                  AGB
                </Link>
                .
              </p>
            </section>

            <p className="text-muted-foreground text-sm pt-8 border-t border-border">
              Stand: November 2025 | Zuletzt aktualisiert gemäß EU AI Act (VO 2024/1689)
            </p>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  )
}
