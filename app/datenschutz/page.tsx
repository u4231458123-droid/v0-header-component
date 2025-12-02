"use client"

import Link from "next/link"
import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  Eye,
  Database,
  Cookie,
  Lock,
  UserCheck,
  Server,
  FileText,
  Mail,
  Bot,
  Globe,
  Trash2,
} from "lucide-react"

const COMPANY = {
  name: "RideHub Solutions",
  owner: "Ibrahim SIMSEK",
  street: "Ensbachmühle 4",
  zip: "94571",
  city: "Schaufling",
  country: "Deutschland",
  email: "datenschutz@my-dispatch.de",
  domain: "my-dispatch.de",
}

const sections = [
  {
    id: "ueberblick",
    icon: Eye,
    title: "1. Datenschutz auf einen Blick",
    content: `
      <h3>Allgemeine Hinweise</h3>
      <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.</p>
      
      <h3>Datenerfassung auf dieser Website</h3>
      <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
      <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt "Hinweis zur verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.</p>
      
      <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
      <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
    `,
  },
  {
    id: "verantwortlicher",
    icon: UserCheck,
    title: "2. Verantwortliche Stelle",
    content: `
      <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
      <p>
        <strong>${COMPANY.name}</strong><br>
        ${COMPANY.owner}<br>
        ${COMPANY.street}<br>
        D-${COMPANY.zip} ${COMPANY.city}<br>
        ${COMPANY.country}
      </p>
      <p>E-Mail: <a href="mailto:${COMPANY.email}" class="text-primary hover:underline">${COMPANY.email}</a></p>
      <p>Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.</p>
    `,
  },
  {
    id: "speicherdauer",
    icon: Database,
    title: "3. Speicherdauer",
    content: `
      <p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z.B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.</p>
      
      <h3>Aufbewahrungsfristen</h3>
      <ul>
        <li><strong>Geschäftliche Korrespondenz:</strong> 6 Jahre (§ 257 HGB)</li>
        <li><strong>Buchungsbelege und Rechnungen:</strong> 10 Jahre (§ 147 AO)</li>
        <li><strong>Fahrtendaten (MyDispatch):</strong> 10 Jahre (GoBD)</li>
        <li><strong>Nutzerkonto-Daten:</strong> Bis zur Löschung des Kontos + 30 Tage</li>
      </ul>
    `,
  },
  {
    id: "rechte",
    icon: Shield,
    title: "4. Ihre Rechte",
    content: `
      <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.</p>
      
      <h3>Ihre Betroffenenrechte nach DSGVO:</h3>
      <ul>
        <li><strong>Recht auf Auskunft (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.</li>
        <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger oder die Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen.</li>
        <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen.</li>
        <li><strong>Recht auf Einschränkung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten verlangen.</li>
        <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können verlangen, dass wir Ihnen Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format übermitteln.</li>
        <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das Recht, der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen.</li>
      </ul>
      
      <p>Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, haben Sie das Recht, bei einer Datenschutz-Aufsichtsbehörde Beschwerde einzulegen.</p>
    `,
  },
  {
    id: "ssl",
    icon: Lock,
    title: "5. SSL-/TLS-Verschlüsselung",
    content: `
      <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
      <p>Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.</p>
    `,
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "6. Cookies",
    content: `
      <p>Unsere Internetseiten verwenden sogenannte "Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.</p>
      
      <h3>Welche Cookies setzen wir ein?</h3>
      <table class="w-full text-sm mt-4">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">Cookie-Name</th>
            <th class="text-left py-2">Zweck</th>
            <th class="text-left py-2">Speicherdauer</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b">
            <td class="py-2">cookie-consent</td>
            <td class="py-2">Speichert Ihre Cookie-Einstellungen</td>
            <td class="py-2">1 Jahr</td>
          </tr>
          <tr class="border-b">
            <td class="py-2">sb-*-auth-token</td>
            <td class="py-2">Authentifizierung (Login-Status)</td>
            <td class="py-2">Session</td>
          </tr>
          <tr class="border-b">
            <td class="py-2">sidebar_state</td>
            <td class="py-2">UI-Präferenz (Seitenleiste)</td>
            <td class="py-2">7 Tage</td>
          </tr>
        </tbody>
      </table>
      
      <p class="mt-4">Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben. Bei der Deaktivierung von Cookies kann die Funktionalität dieser Website eingeschränkt sein.</p>
    `,
  },
  {
    id: "hosting",
    icon: Server,
    title: "7. Hosting und CDN",
    content: `
      <p>Wir hosten die Inhalte unserer Website bei folgenden Anbietern:</p>
      
      <h3>Vercel</h3>
      <p>Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Vercel ist ein Cloud-Service, der es ermöglicht, Websites und Applikationen zu hosten. Beim Besuch unserer Website wird Ihre IP-Adresse an Vercel übermittelt. Vercel hat sich zur Einhaltung der EU-Datenschutzstandards verpflichtet.</p>
      <p>Details finden Sie in der Datenschutzerklärung von Vercel: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">https://vercel.com/legal/privacy-policy</a></p>
      
      <h3>Supabase</h3>
      <p>Für die Datenbankfunktionen nutzen wir Supabase Inc. Die Daten werden in EU-Rechenzentren (Frankfurt am Main) gespeichert. Supabase ist DSGVO-konform und SOC 2 Type II zertifiziert.</p>
    `,
  },
  {
    id: "ki",
    icon: Bot,
    title: "8. Künstliche Intelligenz (KI)",
    content: `
      <p>MyDispatch setzt Künstliche Intelligenz für verschiedene Funktionen ein:</p>
      
      <h3>KI-Assistenten und Chatbot</h3>
      <p>Unsere KI-Assistenten nutzen große Sprachmodelle (LLMs), um Ihnen bei Fragen zu helfen und Aufgaben zu unterstützen. Die Verarbeitung erfolgt über:</p>
      <ul>
        <li><strong>Vercel AI Gateway:</strong> Sichere Routing-Schicht für KI-Anfragen</li>
        <li><strong>OpenAI / Anthropic:</strong> Verarbeitung der Sprachmodelle</li>
      </ul>
      
      <h3>Datennutzung für KI</h3>
      <p><strong>Wichtig:</strong> Ihre Geschäftsdaten werden NICHT für das Training von KI-Modellen verwendet. Die KI-Funktionen verarbeiten Ihre Daten nur für den unmittelbaren Zweck (z.B. Beantwortung einer Frage) und speichern keine Konversationshistorie dauerhaft.</p>
      
      <h3>EU AI Act Compliance</h3>
      <p>Unsere KI-Systeme entsprechen dem EU AI Act. Die eingesetzten Anwendungen fallen unter die Kategorie "minimales Risiko" und werden transparent dokumentiert. Sie können alle KI-Funktionen in den Einstellungen deaktivieren.</p>
      
      <h3>Ihre Rechte bezüglich KI</h3>
      <ul>
        <li>Sie können alle KI-Funktionen deaktivieren</li>
        <li>Kein Profiling oder automatisierte Entscheidungsfindung gemäß Art. 22 DSGVO</li>
        <li>Recht auf menschliche Überprüfung bei allen Entscheidungen</li>
      </ul>
    `,
  },
  {
    id: "kontaktformular",
    icon: Mail,
    title: "9. Kontaktformular",
    content: `
      <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
      
      <p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).</p>
      
      <p>Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt. Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.</p>
    `,
  },
  {
    id: "kundendaten",
    icon: FileText,
    title: "10. Verarbeitung von Kundendaten",
    content: `
      <p>Als Nutzer der MyDispatch-Software verarbeiten wir folgende Daten:</p>
      
      <h3>Registrierungsdaten</h3>
      <ul>
        <li>E-Mail-Adresse</li>
        <li>Name / Unternehmensbezeichnung</li>
        <li>Adressdaten</li>
        <li>Telefonnummer (optional)</li>
      </ul>
      
      <h3>Nutzungsdaten</h3>
      <ul>
        <li>Login-Zeitpunkte</li>
        <li>IP-Adressen (für Sicherheitszwecke)</li>
        <li>Genutzte Funktionen (anonymisiert)</li>
      </ul>
      
      <h3>Geschäftsdaten (in der Software eingegeben)</h3>
      <ul>
        <li>Fahrerprofile und -dokumente</li>
        <li>Fahrzeugdaten</li>
        <li>Kundenstammdaten</li>
        <li>Auftragsdaten und Fahrten</li>
        <li>Rechnungsdaten</li>
      </ul>
      
      <p>Die Verarbeitung erfolgt auf Grundlage des Vertrags zur Softwarenutzung (Art. 6 Abs. 1 lit. b DSGVO). Für die Verarbeitung Ihrer Geschäftsdaten (z.B. Fahrgastdaten) sind Sie selbst verantwortlich. Wir stellen Ihnen einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO zur Verfügung.</p>
    `,
  },
  {
    id: "loeschung",
    icon: Trash2,
    title: "11. Datenlöschung und Kontosperrung",
    content: `
      <h3>Löschung des Nutzerkontos</h3>
      <p>Sie können Ihr Nutzerkonto jederzeit löschen. Senden Sie dazu eine E-Mail an ${COMPANY.email} oder nutzen Sie die Löschfunktion in den Kontoeinstellungen.</p>
      
      <h3>Was passiert bei der Löschung?</h3>
      <ol>
        <li>Ihr Konto wird sofort deaktiviert</li>
        <li>Sie haben 30 Tage Zeit, Ihre Daten zu exportieren</li>
        <li>Nach 30 Tagen werden alle Ihre Daten unwiderruflich gelöscht</li>
        <li>Daten, die aufgrund gesetzlicher Aufbewahrungsfristen aufbewahrt werden müssen, werden gesperrt und nach Ablauf der Fristen gelöscht</li>
      </ol>
      
      <h3>Datenexport</h3>
      <p>Sie können vor der Löschung einen vollständigen Export Ihrer Daten anfordern. Dieser wird Ihnen in einem maschinenlesbaren Format (JSON/CSV) zur Verfügung gestellt.</p>
    `,
  },
  {
    id: "aenderungen",
    icon: Globe,
    title: "12. Änderungen dieser Datenschutzerklärung",
    content: `
      <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>
      
      <p>Bei wesentlichen Änderungen werden wir Sie per E-Mail informieren.</p>
      
      <p class="mt-8"><strong>Stand:</strong> November 2025</p>
    `,
  },
]

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader />

      <main className="pt-16">
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Datenschutzerklärung</h1>
              <p className="text-lg text-muted-foreground">
                Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO
              </p>
            </div>

            <Card className="rounded-2xl border-border mb-12">
              <CardContent className="p-6">
                <h2 className="font-bold text-foreground mb-4">Inhaltsverzeichnis</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm py-1 transition-colors"
                    >
                      <section.icon className="w-4 h-4 shrink-0" />
                      <span>{section.title}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {sections.map((section) => (
                <Card key={section.id} id={section.id} className="rounded-2xl border-border scroll-mt-24">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-primary [&_table]:border-collapse [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              <Link
                href="/impressum"
                className="p-4 rounded-2xl border border-border text-center hover:border-primary/50 transition-colors"
              >
                <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="font-medium text-foreground">Impressum</span>
              </Link>
              <Link
                href="/agb"
                className="p-4 rounded-2xl border border-border text-center hover:border-primary/50 transition-colors"
              >
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="font-medium text-foreground">AGB</span>
              </Link>
              <Link
                href="/kontakt"
                className="p-4 rounded-2xl border border-border text-center hover:border-primary/50 transition-colors"
              >
                <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="font-medium text-foreground">Kontakt</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  )
}
