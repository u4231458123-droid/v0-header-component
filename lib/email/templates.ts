/**
 * E-MAIL-VORLAGEN SYSTEM
 * ======================
 * Einheitliche E-Mail-Vorlagen für alle Anwendungsfälle
 * - MyDispatch-Kunden: MyDispatch Design
 * - Unternehmer: Professionelles Design mit Logo
 */

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text: string
  variables: string[]
}

export interface CompanyEmailData {
  name: string
  logo_url?: string | null
  email?: string
  phone?: string
  address?: string
}

export interface MyDispatchEmailData {
  name: string
  logo_url: string
  email: string
  phone: string
  address: string
}

/**
 * Verarbeite Handlebars Conditionals in HTML-Templates
 * Unterstützt: {{#if variable}}...{{/if}}
 * Verarbeitet auch mehrzeilige Blöcke und verschachtelte Conditionals
 */
function processHandlebarsConditionals(html: string, data: any): string {
  let processed = html
  
  // Regex für {{#if variable}}...{{/if}} Blöcke
  // [\s\S]*? = non-greedy match für alle Zeichen (inkl. Zeilenumbrüche)
  const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g
  
  // Sammle alle Matches zuerst (um Konflikte bei gleichzeitiger Ersetzung zu vermeiden)
  const matches: Array<{ fullMatch: string; variable: string; content: string; index: number }> = []
  let match
  
  while ((match = conditionalRegex.exec(processed)) !== null) {
    matches.push({
      fullMatch: match[0],
      variable: match[1],
      content: match[2],
      index: match.index,
    })
  }
  
  // Verarbeite Matches von hinten nach vorne (um Indizes stabil zu halten)
  for (let i = matches.length - 1; i >= 0; i--) {
    const { fullMatch, variable, content } = matches[i]
    
    // Prüfe ob Variable existiert und truthy ist
    const value = data[variable]
    const shouldInclude = value !== undefined && value !== null && value !== "" && value !== false
    
    if (shouldInclude) {
      // Ersetze den gesamten Block durch den Inhalt
      processed = processed.substring(0, matches[i].index) + content + processed.substring(matches[i].index + fullMatch.length)
    } else {
      // Entferne den gesamten Block
      processed = processed.substring(0, matches[i].index) + processed.substring(matches[i].index + fullMatch.length)
    }
  }
  
  // Rekursiv verarbeiten für verschachtelte Conditionals
  if (/\{\{#if\s+\w+\}\}/.test(processed)) {
    processed = processHandlebarsConditionals(processed, data)
  }
  
  return processed
}

/**
 * Generiere E-Mail mit Logo und Branding
 */
export function generateEmailHTML(
  template: EmailTemplate,
  data: any,
  companyData?: CompanyEmailData,
  isMyDispatch: boolean = false
): string {
  // Basis-URL für absolute Logo-URLs in E-Mails
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "https://www.my-dispatch.de"
  
  // Logo-URL: Wenn companyData.logo_url bereits eine absolute URL ist (z.B. Supabase Storage), verwende diese
  // Sonst generiere absolute URL für das Standard-Logo
  let logoUrl: string
  if (isMyDispatch) {
    logoUrl = `${baseUrl}/images/mydispatch-3d-logo.png`
  } else if (companyData?.logo_url) {
    // Prüfe ob logo_url bereits eine absolute URL ist (beginnt mit http:// oder https://)
    if (companyData.logo_url.startsWith("http://") || companyData.logo_url.startsWith("https://")) {
      logoUrl = companyData.logo_url
    } else {
      // Relativer Pfad - mache absolut
      logoUrl = `${baseUrl}${companyData.logo_url.startsWith("/") ? "" : "/"}${companyData.logo_url}`
    }
  } else {
    logoUrl = `${baseUrl}/images/mydispatch-3d-logo.png`
  }

  const companyName = isMyDispatch ? "MyDispatch" : companyData?.name || "MyDispatch"
  const companyEmail = isMyDispatch ? "info@my-dispatch.de" : companyData?.email || "info@my-dispatch.de"
  const companyPhone = isMyDispatch ? "+49 (0) 170 8004423" : companyData?.phone || "+49 (0) 170 8004423"

  // Ersetze Variablen im Template
  let html = template.html
  
  // 1. Verarbeite Handlebars Conditionals ZUERST
  html = processHandlebarsConditionals(html, data)
  
  // 2. Dann Variablen ersetzen
  template.variables.forEach((variable) => {
    const value = data[variable] || ""
    html = html.replace(new RegExp(`{{${variable}}}`, "g"), value)
  })

  // Ersetze Company-Daten
  html = html.replace(/{{company_name}}/g, companyName)
  html = html.replace(/{{company_email}}/g, companyEmail)
  html = html.replace(/{{company_phone}}/g, companyPhone)
  html = html.replace(/{{company_logo}}/g, logoUrl)

  // Wrapper mit Logo und Branding
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      background: #323D5E;
      padding: 20px;
      text-align: center;
    }
    .email-logo {
      max-height: 60px;
      max-width: 200px;
      object-fit: contain;
    }
    .email-content {
      padding: 30px;
    }
    .email-footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e5e5e5;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #323D5E;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${logoUrl}" alt="${companyName} Logo" class="email-logo" />
    </div>
    <div class="email-content">
      ${html}
    </div>
    <div class="email-footer">
      <p><strong>${companyName}</strong></p>
      ${companyData?.address ? `<p>${companyData.address}</p>` : ""}
      <p>${companyEmail} | ${companyPhone}</p>
      <p style="margin-top: 20px; font-size: 11px; color: #999;">
        Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Buchungsbestätigung E-Mail
 */
export const BOOKING_CONFIRMATION_TEMPLATE: EmailTemplate = {
  id: "booking-confirmation",
  name: "Buchungsbestätigung",
  subject: "Ihre Buchung wurde bestätigt - {{booking_id}}",
  html: `
    <h1>Buchungsbestätigung</h1>
    <p>Sehr geehrte/r {{customer_salutation}} {{customer_name}},</p>
    <p>vielen Dank für Ihre Buchung. Ihre Fahrt wurde erfolgreich gebucht.</p>
    
    <h2>Buchungsdetails</h2>
    <p><strong>Buchungsnummer:</strong> {{booking_id}}</p>
    <p><strong>Datum:</strong> {{pickup_date}}</p>
    <p><strong>Uhrzeit:</strong> {{pickup_time}}</p>
    <p><strong>Abholadresse:</strong> {{pickup_address}}</p>
    <p><strong>Zieladresse:</strong> {{dropoff_address}}</p>
    <p><strong>Fahrzeugkategorie:</strong> {{vehicle_category}}</p>
    ${"{{#if driver}}"}<p><strong>Fahrer:</strong> {{driver_name}}</p>${"{{/if}}"}
    ${"{{#if vehicle}}"}<p><strong>Fahrzeug:</strong> {{vehicle_plate}}</p>${"{{/if}}"}
    <p><strong>Preis:</strong> {{price}}</p>
    
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
    <p>Mit freundlichen Grüßen,<br>{{company_name}}</p>
  `,
  text: "Buchungsbestätigung Text-Version",
  variables: [
    "customer_salutation",
    "customer_name",
    "booking_id",
    "pickup_date",
    "pickup_time",
    "pickup_address",
    "dropoff_address",
    "vehicle_category",
    "driver_name",
    "vehicle_plate",
    "price",
  ],
}

/**
 * Rechnungsversand E-Mail
 */
export const INVOICE_TEMPLATE: EmailTemplate = {
  id: "invoice",
  name: "Rechnung",
  subject: "Ihre Rechnung {{invoice_number}}",
  html: `
    <h1>Rechnung</h1>
    <p>Sehr geehrte/r {{customer_salutation}} {{customer_name}},</p>
    <p>anbei erhalten Sie Ihre Rechnung.</p>
    
    <h2>Rechnungsdetails</h2>
    <p><strong>Rechnungsnummer:</strong> {{invoice_number}}</p>
    <p><strong>Rechnungsdatum:</strong> {{invoice_date}}</p>
    <p><strong>Fälligkeitsdatum:</strong> {{due_date}}</p>
    <p><strong>Betrag:</strong> {{total_amount}}</p>
    
    <p>Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das angegebene Konto.</p>
    <p>Mit freundlichen Grüßen,<br>{{company_name}}</p>
  `,
  text: "Rechnung Text-Version",
  variables: [
    "customer_salutation",
    "customer_name",
    "invoice_number",
    "invoice_date",
    "due_date",
    "total_amount",
  ],
}

/**
 * Partner-Weiterleitung E-Mail
 */
export const PARTNER_FORWARD_TEMPLATE: EmailTemplate = {
  id: "partner-forward",
  name: "Partner-Weiterleitung",
  subject: "Auftrag {{booking_id}} - Weiterleitung",
  html: `
    <h1>Auftrag weitergeleitet</h1>
    <p>Sehr geehrte/r Partner,</p>
    <p>wir leiten Ihnen folgenden Auftrag zur Bearbeitung weiter:</p>
    
    <h2>Auftragsdetails</h2>
    {{#if show_id}}<p><strong>ID:</strong> {{booking_id}}</p>{{/if}}
    {{#if show_date}}<p><strong>Datum:</strong> {{pickup_date}}</p>{{/if}}
    {{#if show_time}}<p><strong>Uhrzeit:</strong> {{pickup_time}}</p>{{/if}}
    {{#if show_customer}}<p><strong>Kunde:</strong> {{customer_name}}</p>{{/if}}
    {{#if show_pickup}}<p><strong>Abhol-Adresse:</strong> {{pickup_address}}</p>{{/if}}
    {{#if show_dropoff}}<p><strong>Ziel-Adresse:</strong> {{dropoff_address}}</p>{{/if}}
    {{#if show_passengers}}<p><strong>Passagier Anzahl:</strong> {{passengers}}</p>{{/if}}
    {{#if show_passenger_names}}<p><strong>Passagier Name/n:</strong> {{passenger_names}}</p>{{/if}}
    {{#if show_vehicle_category}}<p><strong>Fahrzeug Kategorie:</strong> {{vehicle_category}}</p>{{/if}}
    {{#if show_flight_train_origin}}<p><strong>Flug / Zug aus:</strong> {{flight_train_origin}}</p>{{/if}}
    {{#if show_flight_train_number}}<p><strong>Flug / Zug Nummer:</strong> {{flight_train_number}}</p>{{/if}}
    {{#if show_driver}}<p><strong>Fahrer:</strong> {{driver_name}}</p>{{/if}}
    {{#if show_vehicle}}<p><strong>Fahrzeug Kennzeichen:</strong> {{vehicle_plate}}</p>{{/if}}
    {{#if show_price}}<p><strong>Fahrpreis:</strong> {{price}}</p>{{/if}}
    
    <p>Bitte bearbeiten Sie diesen Auftrag entsprechend.</p>
    <p>Mit freundlichen Grüßen,<br>{{company_name}}</p>
  `,
  text: "Partner-Weiterleitung Text-Version",
  variables: [
    "booking_id",
    "pickup_date",
    "pickup_time",
    "customer_name",
    "pickup_address",
    "dropoff_address",
    "passengers",
    "passenger_names",
    "vehicle_category",
    "flight_train_origin",
    "flight_train_number",
    "driver_name",
    "vehicle_plate",
    "price",
  ],
}

/**
 * Erinnerung E-Mail (z.B. für Dokumente, Zahlungen)
 */
export const REMINDER_TEMPLATE: EmailTemplate = {
  id: "reminder",
  name: "Erinnerung",
  subject: "Erinnerung: {{reminder_type}}",
  html: `
    <h1>Erinnerung</h1>
    <p>Sehr geehrte/r {{customer_salutation}} {{customer_name}},</p>
    <p>wir möchten Sie an folgendes erinnern:</p>
    
    <h2>{{reminder_type}}</h2>
    <p>{{reminder_message}}</p>
    ${"{{#if due_date}}"}
    <p><strong>Fälligkeitsdatum:</strong> {{due_date}}</p>
    ${"{{/if}}"}
    ${"{{#if action_url}}"}
    <p><a href="{{action_url}}">Jetzt bearbeiten</a></p>
    ${"{{/if}}"}
    
    <p>Mit freundlichen Grüßen,<br>{{company_name}}</p>
  `,
  text: "Erinnerung Text-Version",
  variables: [
    "customer_salutation",
    "customer_name",
    "reminder_type",
    "reminder_message",
    "due_date",
    "action_url",
  ],
}

/**
 * Dokument-Erinnerung E-Mail
 */
export const DOCUMENT_REMINDER_TEMPLATE: EmailTemplate = {
  id: "document-reminder",
  name: "Dokument-Erinnerung",
  subject: "Erinnerung: {{document_type}} läuft ab",
  html: `
    <h1>Dokument-Erinnerung</h1>
    <p>Sehr geehrte/r {{recipient_salutation}} {{recipient_name}},</p>
    <p>wir möchten Sie daran erinnern, dass folgendes Dokument bald abläuft:</p>
    
    <h2>{{document_type}}</h2>
    <p><strong>Ablaufdatum:</strong> {{expiry_date}}</p>
    ${"{{#if days_until_expiry}}"}
    <p><strong>Verbleibende Tage:</strong> {{days_until_expiry}}</p>
    ${"{{/if}}"}
    
    <p>Bitte erneuern Sie das Dokument rechtzeitig.</p>
    ${"{{#if upload_url}}"}
    <p><a href="{{upload_url}}">Dokument hochladen</a></p>
    ${"{{/if}}"}
    
    <p>Mit freundlichen Grüßen,<br>{{company_name}}</p>
  `,
  text: "Dokument-Erinnerung Text-Version",
  variables: [
    "recipient_salutation",
    "recipient_name",
    "document_type",
    "expiry_date",
    "days_until_expiry",
    "upload_url",
  ],
}

/**
 * Zahlungserinnerung E-Mail
 */
export const PAYMENT_REMINDER_TEMPLATE: EmailTemplate = {
  id: "payment-reminder",
  name: "Zahlungserinnerung",
  subject: "Zahlungserinnerung: Rechnung {{invoice_number}}",
  html: `
    <h1>Zahlungserinnerung</h1>
    <p>Sehr geehrte/r {{customer_salutation}} {{customer_name}},</p>
    <p>wir möchten Sie freundlich an die noch ausstehende Zahlung erinnern:</p>
    
    <h2>Rechnungsdetails</h2>
    <p><strong>Rechnungsnummer:</strong> {{invoice_number}}</p>
    <p><strong>Rechnungsdatum:</strong> {{invoice_date}}</p>
    <p><strong>Fälligkeitsdatum:</strong> {{due_date}}</p>
    <p><strong>Betrag:</strong> {{total_amount}}</p>
    ${"{{#if days_overdue}}"}
    <p><strong>Tage überfällig:</strong> {{days_overdue}}</p>
    ${"{{/if}}"}
    
    <p>Bitte überweisen Sie den Betrag umgehend auf das angegebene Konto.</p>
    ${"{{#if payment_url}}"}
    <p><a href="{{payment_url}}">Jetzt bezahlen</a></p>
    ${"{{/if}}"}
    
    <p>Mit freundlichen Grüßen,<br>{{company_name}}</p>
  `,
  text: "Zahlungserinnerung Text-Version",
  variables: [
    "customer_salutation",
    "customer_name",
    "invoice_number",
    "invoice_date",
    "due_date",
    "total_amount",
    "days_overdue",
    "payment_url",
  ],
}

/**
 * Support-Anfrage E-Mail
 */
export const SUPPORT_REQUEST_TEMPLATE: EmailTemplate = {
  id: "support-request",
  name: "Support-Anfrage",
  subject: "Support-Anfrage: {{subject}}",
  html: `
    <h1>Support-Anfrage erhalten</h1>
    <p>Sehr geehrte/r {{customer_name}},</p>
    <p>vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
    
    <h2>Ihre Anfrage</h2>
    <p><strong>Betreff:</strong> {{subject}}</p>
    <p><strong>Nachricht:</strong></p>
    <p>{{message}}</p>
    
    <p>Ihr {{company_name}} Team</p>
  `,
  text: "Support-Anfrage Text-Version",
  variables: ["customer_name", "subject", "message"],
}

/**
 * Generiere E-Mail für MyDispatch-Kunden
 */
export function generateMyDispatchEmail(
  template: EmailTemplate,
  data: any
): string {
  const myDispatchData: MyDispatchEmailData = {
    name: "MyDispatch",
    logo_url: "/images/mydispatch-3d-logo.png",
    email: "info@my-dispatch.de",
    phone: "+49 (0) 170 8004423",
    address: "Ensbachmühle 4, 94571 Schaufling",
  }

  return generateEmailHTML(template, data, myDispatchData, true)
}

/**
 * Generiere E-Mail für Unternehmer (für seine Kunden/Fahrer)
 */
export function generateCompanyEmail(
  template: EmailTemplate,
  data: any,
  companyData: CompanyEmailData
): string {
  return generateEmailHTML(template, data, companyData, false)
}

/**
 * MYDISPATCH_BASE_TEMPLATE - Professionelles Basis-Template
 * Wird für alle MyDispatch-E-Mails verwendet (Registrierung, Bestätigung, etc.)
 */
export const MYDISPATCH_BASE_TEMPLATE = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Mail Bestätigung MyDispatch</title>
  <style>
    /* Global Resets */
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #334155;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
      -ms-interpolation-mode: bicubic;
      display: block;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    /* Layout */
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding-bottom: 60px;
    }
    .main-content {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    /* Header - Trennlinie entfernt */
    .header-section {
      padding: 45px 0 20px 0;
      text-align: center;
      background-color: #ffffff;
    }
    .logo-img {
      width: 200px;
      height: auto;
      margin: 0 auto;
    }
    /* Content */
    .content-box {
      padding: 20px 40px 50px 40px;
    }
    .headline {
      color: #0f172a;
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 20px 0;
      letter-spacing: -0.5px;
      text-align: center;
      line-height: 1.3;
    }
    .body-text {
      color: #475569;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
      text-align: left;
    }
    /* Button */
    .btn-container {
      text-align: center;
      margin: 35px 0;
    }
    .btn-primary {
      background-color: #1e293b;
      color: #ffffff !important;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: background-color 0.2s;
    }
    .btn-primary:hover {
      background-color: #0f172a;
    }
    /* Footer / Legal */
    .footer {
      background-color: #f8fafc;
      padding: 35px 40px;
      border-top: 1px solid #e2e8f0;
      text-align: left;
    }
    .footer-text {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .footer-heading {
      font-size: 11px;
      color: #64748b;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }
    .legal-divider {
      border-top: 1px solid #cbd5e1;
      margin: 20px 0;
      opacity: 0.5;
    }
    /* Responsive */
    @media screen and (max-width: 600px) {
      .wrapper {
        padding-top: 10px;
      }
      .main-content {
        width: 100% !important;
        border-radius: 0;
        box-shadow: none;
        border: none;
      }
      .content-box {
        padding: 30px 20px !important;
      }
      .footer {
        padding: 30px 20px !important;
      }
      .headline {
        font-size: 22px !important;
      }
      .logo-img {
        width: 160px !important;
      }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    {{preheaderText}}
  </div>
  <center class="wrapper">
    <table class="main-content" width="100%" role="presentation">
      <tr>
        <td class="header-section">
          <a href="https://www.my-dispatch.de" target="_blank">
            <img src="https://ykfufejycdgwonrlbhzn.supabase.co/storage/v1/object/public/MyDispatch%203%20D%20Logo/mydispatch-3d-logo.png" alt="MyDispatch Logo" class="logo-img" width="200">
          </a>
        </td>
      </tr>
      <tr>
        <td class="content-box">
          <h1 class="headline">{{headline}}</h1>
          <div class="body-text">
            {{bodyContent}}
          </div>
          {{#if buttonText}}
          <div class="btn-container">
            <a href="{{buttonUrl}}" class="btn-primary" target="_blank">{{buttonText}}</a>
          </div>
          {{#if buttonUrl}}
          <p class="body-text" style="font-size: 13px; margin-top: 30px; color: #64748b; text-align: center;">
            Funktioniert der Button nicht? Kopiere diesen Link:<br>
            <a href="{{buttonUrl}}" style="color: #3b82f6; word-break: break-all;">{{buttonUrl}}</a>
          </p>
          {{/if}}
          {{/if}}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text" style="margin-bottom: 25px;">
            Du erhältst diese E-Mail, weil du dich bei MyDispatch registriert hast. Wenn dies ein Fehler war, kannst du diese Nachricht ignorieren.
          </p>
          <table width="100%" role="presentation">
            <tr>
              <td valign="top" width="50%" style="padding-right: 15px;">
                <p class="footer-heading">Anbieter</p>
                <p class="footer-text">
                  RideHub Solutions (Einzelunternehmen)<br>
                  Inhaber: Ibrahim SIMSEK<br>
                  Ensbachmühle 4<br>
                  94571 Schaufling, DE
                </p>
              </td>
              <td valign="top" width="50%">
                <p class="footer-heading">Kontakt</p>
                <p class="footer-text">
                  Tel: +49 170 8004423<br>
                  <a href="mailto:info@my-dispatch.de" style="color:#64748b; text-decoration:none;">info@my-dispatch.de</a><br>
                  <a href="https://www.my-dispatch.de" style="color:#64748b; text-decoration:none;">www.my-dispatch.de</a>
                </p>
              </td>
            </tr>
          </table>
          <div class="legal-divider"></div>
          <p class="footer-text" style="margin:0; font-size: 11px;">
            Verantwortlich i.S.d. § 55 Abs. 2 RStV: Ibrahim SIMSEK<br>
            © 2025 RideHub Solutions. Alle Rechte vorbehalten.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`

/**
 * Interface für Base Template Optionen
 */
export interface BaseTemplateOptions {
  headline: string
  bodyContent: string
  buttonText?: string
  buttonUrl?: string
  preheaderText?: string
}

/**
 * Generiere E-Mail mit MYDISPATCH_BASE_TEMPLATE
 */
export function generateEmailWithBaseTemplate(options: BaseTemplateOptions): string {
  let html = MYDISPATCH_BASE_TEMPLATE
  
  // Ersetze Variablen
  html = html.replace(/{{headline}}/g, options.headline)
  html = html.replace(/{{bodyContent}}/g, options.bodyContent)
  html = html.replace(/{{preheaderText}}/g, options.preheaderText || options.headline)
  
  // Verarbeite Handlebars Conditionals
  html = processHandlebarsConditionals(html, {
    buttonText: options.buttonText,
    buttonUrl: options.buttonUrl,
  })
  
  // Ersetze Button-Variablen (falls vorhanden)
  if (options.buttonText) {
    html = html.replace(/{{buttonText}}/g, options.buttonText)
  }
  if (options.buttonUrl) {
    html = html.replace(/{{buttonUrl}}/g, options.buttonUrl)
  }
  
  return html
}
