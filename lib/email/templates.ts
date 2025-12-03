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

