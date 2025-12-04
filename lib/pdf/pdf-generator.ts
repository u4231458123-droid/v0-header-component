/**
 * PDF Generator mit Briefpapier- und Logo-Unterstützung
 * Unterstützt:
 * - Briefpapier-Vorlage (wenn hochgeladen)
 * - Logo (wenn hochgeladen, sonst MyDispatch-Logo)
 * - Standard DIN-Norm Format (wenn kein Briefpapier)
 */

import { format } from "date-fns"
import { de } from "date-fns/locale"

export interface PDFData {
  type: "invoice" | "booking" | "offer" | "partner" | "quote" | "driver" | "vehicle" | "customer" | "employee"
  company: {
    id: string
    name: string
    address?: string
    email?: string
    phone?: string
    tax_id?: string
    vat_id?: string
    logo_url?: string | null
    briefpapier_url?: string | null
    bank_info?: {
      iban?: string
      bic?: string
      bank_name?: string
    }
    is_small_business?: boolean
    small_business_note?: string
  }
  content: any
  selectedFields?: string[] // Für Partner-Weiterleitung
}

export function generatePDFHTML(data: PDFData): string {
  const formatDate = (dateStr: string) => format(new Date(dateStr), "dd.MM.yyyy", { locale: de })
  const formatDateTime = (dateStr: string) => format(new Date(dateStr), "dd.MM.yyyy HH:mm", { locale: de })
  const formatCurrency = (amount: number) => amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })

  // Logo bestimmen: Company-Logo wenn vorhanden, sonst MyDispatch-Logo
  const logoUrl = data.company.logo_url || "/images/mydispatch-3d-logo.png"
  const hasLetterhead = !!data.company.briefpapier_url
  const letterheadUrl = data.company.briefpapier_url

  // Standard DIN-Norm Format (A4: 210mm x 297mm) - Optimiert für professionelle Darstellung
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: ${hasLetterhead ? "0" : "20mm"};
      background: white;
    }
    .letterhead-container {
      position: relative;
      width: 100%;
      height: ${hasLetterhead ? "auto" : "0"};
      margin-bottom: ${hasLetterhead ? "20mm" : "0"};
    }
    .letterhead-image {
      width: 100%;
      height: auto;
      display: block;
    }
    .logo-container {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      ${hasLetterhead ? "position: absolute; top: 20mm; left: 20mm; z-index: 10;" : ""}
    }
    .logo {
      max-height: 60px;
      max-width: 200px;
      object-fit: contain;
    }
    .content-wrapper {
      ${hasLetterhead ? "padding: 0 20mm;" : ""}
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      ${hasLetterhead ? "position: relative; z-index: 10;" : ""}
    }
    .content-wrapper .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .company-info {
      text-align: right;
      font-size: 10pt;
      color: #4a5568;
    }
    .company-name {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .document-title {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 32px;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 32px;
    }
    .label {
      font-size: 9pt;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .value {
      font-weight: 500;
      font-size: 11pt;
      color: #1a1a1a;
      line-height: 1.5;
    }
    .address-block {
      margin-bottom: 24px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 32px 0;
    }
    .table th {
      text-align: left;
      padding: 14px 12px;
      border-bottom: 2px solid #1a1a1a;
      font-weight: 700;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      background-color: #f8f9fa;
      color: #1a1a1a;
    }
    .table td {
      padding: 14px 12px;
      border-bottom: 1px solid #e5e5e5;
      font-size: 10.5pt;
    }
    .table tr:hover {
      background-color: #f8f9fa;
    }
    .table .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 280px;
      margin-top: 24px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .totals-row.total {
      border-top: 2px solid #1a1a1a;
      font-weight: bold;
      font-size: 14pt;
      padding-top: 12px;
      margin-top: 8px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 32px;
      border-top: 2px solid #e5e5e5;
      font-size: 9pt;
      color: #4a5568;
      text-align: center;
      line-height: 1.8;
    }
    .footer p {
      margin: 4px 0;
    }
    @media print {
      body {
        padding: ${hasLetterhead ? "0" : "20mm"};
      }
      .no-print {
        display: none;
      }
    }
  `

  let contentHTML = ""

  // Content basierend auf Typ generieren
  switch (data.type) {
    case "invoice":
      contentHTML = generateInvoiceContent(data, formatDate, formatCurrency)
      break
    case "booking":
      contentHTML = generateBookingContent(data, formatDateTime, data.selectedFields || [])
      break
    case "offer":
      contentHTML = generateOfferContent(data, formatDate, formatCurrency)
      break
    case "partner":
      contentHTML = generatePartnerContent(data, formatDateTime, data.selectedFields || [])
      break
    case "quote":
      contentHTML = generateQuoteContent(data, formatDate, formatCurrency)
      break
    case "driver":
      contentHTML = generateDriverContent(data, formatDate)
      break
    case "vehicle":
      contentHTML = generateVehicleContent(data, formatDate)
      break
    case "customer":
      contentHTML = generateCustomerContent(data, formatDate)
      break
    case "employee":
      contentHTML = generateEmployeeContent(data, formatDate)
      break
  }

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>${getDocumentTitle(data.type)}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      ${hasLetterhead ? `<div class="letterhead-container"><img src="${letterheadUrl}" class="letterhead-image" alt="Briefpapier" /></div>` : ""}
      
      <div class="logo-container">
        <img src="${logoUrl}" class="logo" alt="${data.company.name} Logo" />
      </div>

      <div class="content-wrapper">
        ${contentHTML}
      </div>

      <div class="footer">
        <p>${data.company.name}${data.company.address ? ` | ${data.company.address}` : ""}${data.company.email ? ` | ${data.company.email}` : ""}${data.company.phone ? ` | ${data.company.phone}` : ""}</p>
        ${data.company.tax_id ? `<p>Steuernummer: ${data.company.tax_id}${data.company.vat_id ? ` | USt-IdNr.: ${data.company.vat_id}` : ""}</p>` : ""}
        ${data.company.bank_info?.iban ? `<p>IBAN: ${data.company.bank_info.iban}${data.company.bank_info.bic ? ` | BIC: ${data.company.bank_info.bic}` : ""}${data.company.bank_info.bank_name ? ` | ${data.company.bank_info.bank_name}` : ""}</p>` : ""}
        ${data.company.is_small_business && data.company.small_business_note ? `<p style="font-style: italic; margin-top: 8px;">${data.company.small_business_note}</p>` : ""}
      </div>
    </body>
    </html>
  `
}

function getDocumentTitle(type: string): string {
  switch (type) {
    case "invoice":
      return "Rechnung"
    case "booking":
      return "Auftrag"
    case "offer":
      return "Angebot"
    case "partner":
      return "Partner-Auftrag"
    case "quote":
      return "Angebot"
    case "driver":
      return "Fahrer-Profil"
    case "vehicle":
      return "Fahrzeug-Datenblatt"
    case "customer":
      return "Kunden-Profil"
    case "employee":
      return "Mitarbeiter-Profil"
    default:
      return "Dokument"
  }
}

function generateInvoiceContent(data: PDFData, formatDate: (s: string) => string, formatCurrency: (n: number) => string): string {
  const invoice = data.content
  
  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#94a3b8",
      pending: "#f59e0b",
      sent: "#3b82f6",
      paid: "#10b981",
      overdue: "#ef4444",
      cancelled: "#6b7280",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Entwurf",
      pending: "Ausstehend",
      sent: "Versendet",
      paid: "Bezahlt",
      overdue: "Überfällig",
      cancelled: "Storniert",
    }
    return labels[status] || status
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
      <div>
        <div class="document-title">RECHNUNG</div>
        <div class="label">Rechnungsnummer</div>
        <div class="value" style="font-family: monospace; font-size: 12pt;">${invoice.invoice_number || "-"}</div>
        ${invoice.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(invoice.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(invoice.status)}
            </span>
          </div>
        ` : ""}
      </div>
      <div class="company-info">
        <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Rechnungszeitraum -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Rechnungsdatum</div>
          <div class="value">${invoice.issue_date ? formatDate(invoice.issue_date) : formatDate(invoice.created_at)}</div>
        </div>
        <div>
          <div class="label">Fälligkeitsdatum</div>
          <div class="value">${invoice.due_date ? formatDate(invoice.due_date) : "-"}</div>
        </div>
        <div>
          <div class="label">Zahlungsart</div>
          <div class="value">${invoice.payment_method || "Rechnung"}</div>
        </div>
      </div>
    </div>

    <!-- Kunde -->
    ${invoice.customer ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Rechnungsempfänger</div>
          <div class="value">
            ${invoice.customer.salutation || ""} ${invoice.customer.first_name || ""} ${invoice.customer.last_name || ""}
            ${invoice.customer.company_name ? `<br/><strong>${invoice.customer.company_name}</strong>` : ""}
            ${invoice.customer.address_data ? `
              <br/>${invoice.customer.address_data.street || ""} ${invoice.customer.address_data.house_number || ""}
              <br/>${invoice.customer.address_data.postal_code || ""} ${invoice.customer.address_data.city || ""}
            ` : ""}
            ${invoice.customer.email ? `<br/>${invoice.customer.email}` : ""}
          </div>
        </div>
        <div class="address-block">
          ${invoice.customer.tax_id ? `
            <div class="label">Steuernummer Kunde</div>
            <div class="value">${invoice.customer.tax_id}</div>
          ` : ""}
          ${invoice.booking?.id ? `
            <div class="label" style="margin-top: 16px;">Zugehöriger Auftrag</div>
            <div class="value" style="font-family: monospace;">${invoice.booking.id.substring(0, 8).toUpperCase()}</div>
          ` : ""}
        </div>
      </div>
    ` : ""}

    <!-- Beträge -->
    <div style="margin-top: 30px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">Nettobetrag</div>
          <div style="font-size: 16pt; font-weight: 600;">${formatCurrency(invoice.amount || 0)}</div>
        </div>
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">MwSt.</div>
          <div style="font-size: 16pt; font-weight: 600;">${formatCurrency(invoice.tax_amount || 0)}</div>
        </div>
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">Gesamtbetrag</div>
          <div style="font-size: 20pt; font-weight: 700;">${formatCurrency(invoice.total_amount || 0)}</div>
        </div>
      </div>
    </div>

    <!-- Notizen -->
    ${invoice.notes ? `
      <div style="margin-top: 24px; padding: 16px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div class="label">Notizen / Bemerkungen</div>
        <div class="value">${invoice.notes}</div>
      </div>
    ` : ""}

    <!-- Bank-Hinweis -->
    <div style="margin-top: 30px; padding: 16px; background: #f1f5f9; border-radius: 8px; font-size: 9pt;">
      <div style="font-weight: 600; margin-bottom: 8px;">Zahlungsinformationen</div>
      ${data.company.bank_info ? `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div>Bank: ${data.company.bank_info.bank_name || "-"}</div>
          <div>IBAN: ${data.company.bank_info.iban || "-"}</div>
          <div>BIC: ${data.company.bank_info.bic || "-"}</div>
          <div>Kontoinhaber: ${(data.company.bank_info as any).account_holder || data.company.name}</div>
        </div>
      ` : `<div>Bitte überweisen Sie den Betrag auf das Ihnen bekannte Geschäftskonto.</div>`}
    </div>

    <!-- Kleinunternehmer-Hinweis -->
    ${data.company.is_small_business ? `
      <div style="margin-top: 16px; font-size: 8pt; color: #6b7280;">
        Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
      </div>
    ` : ""}
  `
}

function generateBookingContent(data: PDFData, formatDateTime: (s: string) => string, selectedFields: string[]): string {
  const booking = data.content
  const showField = (field: string) => selectedFields.length === 0 || selectedFields.includes(field)

  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      in_progress: "#3b82f6",
      completed: "#6b7280",
      cancelled: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      in_progress: "Unterwegs",
      completed: "Abgeschlossen",
      cancelled: "Storniert",
    }
    return labels[status] || status
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Ausstehend",
      paid: "Bezahlt",
      unpaid: "Unbezahlt",
    }
    return labels[status] || status
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
    <div>
      <div class="document-title">AUFTRAG</div>
        ${showField("id") ? `
          <div class="label">Auftrags-ID</div>
          <div class="value" style="font-family: monospace; font-size: 12pt;">${booking.id?.substring(0, 8).toUpperCase() || "-"}</div>
        ` : ""}
        ${booking.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(booking.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(booking.status)}
            </span>
          </div>
        ` : ""}
    </div>
    <div class="company-info">
      <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Auftragszeitpunkt -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
    <div class="meta-grid">
        <div>
          <div class="label">Auftrag eingegangen</div>
          <div class="value">${booking.created_at ? formatDateTime(booking.created_at) : "-"} Uhr</div>
        </div>
        <div>
          <div class="label">Abholung geplant</div>
          <div class="value" style="font-size: 14pt; font-weight: bold;">${booking.pickup_time ? formatDateTime(booking.pickup_time) : "-"} Uhr</div>
        </div>
      </div>
    </div>

    <!-- Kunde und Adressen -->
    <div class="meta-grid" style="margin-top: 30px;">
      <div class="address-block">
        ${showField("customer") ? `
          <div class="label">Kunde</div>
          <div class="value">
            ${booking.customer?.salutation || ""} ${booking.customer?.first_name || ""} ${booking.customer?.last_name || "-"}
            ${booking.customer?.email ? `<br/><span style="color: #4a5568;">${booking.customer.email}</span>` : ""}
            ${booking.customer?.phone ? `<br/><span style="color: #4a5568;">${booking.customer.phone}</span>` : ""}
          </div>
        ` : ""}
        
        ${showField("pickup") ? `
          <div class="label" style="margin-top: 20px;">Abhol-Adresse</div>
          <div class="value">${booking.pickup_address || "-"}</div>
        ` : ""}
        
        ${showField("dropoff") ? `
          <div class="label" style="margin-top: 20px;">Ziel-Adresse</div>
          <div class="value">${booking.dropoff_address || "-"}</div>
        ` : ""}
      </div>

      <div class="address-block">
        ${showField("passengers") ? `
          <div class="label">Passagiere</div>
          <div class="value">${booking.passengers || 1} Person(en)</div>
        ` : ""}
        
        ${showField("passenger_names") && booking.passenger_name ? `
          <div class="label" style="margin-top: 20px;">Passagier-Name(n)</div>
          <div class="value">${booking.passenger_name}</div>
        ` : ""}
        
        ${showField("vehicle_category") ? `
          <div class="label" style="margin-top: 20px;">Fahrzeugkategorie</div>
          <div class="value">${booking.vehicle_category || "Standard"}</div>
        ` : ""}
      </div>
    </div>

    <!-- Flug/Zug Info falls vorhanden -->
    ${(booking.flight_train_number || booking.flight_train_origin) ? `
      <div style="margin-top: 24px; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px;">
        <div class="label" style="margin-bottom: 12px;">Flug-/Zug-Abholung</div>
        <div class="meta-grid">
          ${showField("flight_train_number") && booking.flight_train_number ? `
            <div>
              <div class="label">Flug-/Zug-Nr.</div>
              <div class="value" style="font-family: monospace;">${booking.flight_train_number}</div>
            </div>
        ` : ""}
        ${showField("flight_train_origin") && booking.flight_train_origin ? `
            <div>
              <div class="label">Herkunft</div>
          <div class="value">${booking.flight_train_origin}</div>
            </div>
        ` : ""}
        </div>
      </div>
        ` : ""}

    <!-- Fahrer und Fahrzeug -->
    <div class="meta-grid" style="margin-top: 24px;">
      ${showField("driver") ? `
        <div class="address-block">
          <div class="label">Fahrer</div>
          <div class="value">${booking.driver ? `${booking.driver.first_name || ""} ${booking.driver.last_name || ""}` : "Nicht zugewiesen"}</div>
        </div>
        ` : ""}
      ${showField("vehicle") ? `
        <div class="address-block">
          <div class="label">Fahrzeug</div>
          <div class="value">${booking.vehicle ? `${booking.vehicle.make || ""} ${booking.vehicle.model || ""} (${booking.vehicle.license_plate || "-"})` : "Nicht zugewiesen"}</div>
        </div>
        ` : ""}
    </div>

    <!-- Preis und Zahlung -->
    <div style="margin-top: 30px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
      <div class="meta-grid">
        ${showField("price") ? `
          <div>
            <div class="label" style="color: #9ca3af;">Fahrpreis</div>
            <div class="value" style="font-size: 24pt; font-weight: bold; color: white;">
              ${booking.price ? booking.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "Auf Anfrage"}
            </div>
          </div>
        ` : ""}
        <div>
          <div class="label" style="color: #9ca3af;">Zahlungsart</div>
          <div class="value" style="color: white;">${booking.payment_method || "-"}</div>
          ${booking.payment_status ? `
            <div style="margin-top: 8px;">
              <span style="padding: 4px 8px; border-radius: 4px; background: ${booking.payment_status === "paid" ? "#10b981" : "#f59e0b"}; font-size: 9pt;">
                ${getPaymentStatusLabel(booking.payment_status)}
              </span>
            </div>
          ` : ""}
        </div>
      </div>
    </div>

    <!-- Notizen falls vorhanden -->
    ${booking.notes ? `
      <div style="margin-top: 24px;">
        <div class="label">Besondere Wünsche / Notizen</div>
        <div class="value" style="padding: 12px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
          ${booking.notes}
        </div>
      </div>
    ` : ""}

    <!-- Kostenstelle falls vorhanden -->
    ${booking.cost_center ? `
      <div style="margin-top: 16px;">
        <div class="label">Kostenstelle</div>
        <div class="value">${booking.cost_center}</div>
      </div>
    ` : ""}
  `
}

function generateOfferContent(data: PDFData, formatDate: (s: string) => string, formatCurrency: (n: number) => string): string {
  // Similar to invoice but for offers
  return "<div>Angebot Content</div>"
}

function generatePartnerContent(data: PDFData, formatDateTime: (s: string) => string, selectedFields: string[]): string {
  // Partner-specific content with selected fields only
  return generateBookingContent(data, formatDateTime, selectedFields)
}

function generateQuoteContent(data: PDFData, formatDate: (s: string) => string, formatCurrency: (n: number) => string): string {
  const quote = (data as any).quote || data.content
  const items = (data as any).items || []
  const customer = (data as any).customer || quote.customer
  const booking = (data as any).booking || quote.booking

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const tax = quote.tax_rate ? subtotal * (quote.tax_rate / 100) : (quote.tax_amount || 0)
  const total = quote.total_amount || (subtotal + tax)

  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#94a3b8",
      pending: "#f59e0b",
      sent: "#3b82f6",
      accepted: "#10b981",
      rejected: "#ef4444",
      expired: "#6b7280",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Entwurf",
      pending: "Ausstehend",
      sent: "Versendet",
      accepted: "Angenommen",
      rejected: "Abgelehnt",
      expired: "Abgelaufen",
    }
    return labels[status] || status
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
      <div>
        <div class="document-title">ANGEBOT</div>
        <div class="label">Angebotsnummer</div>
        <div class="value" style="font-family: monospace; font-size: 12pt;">${quote.quote_number || quote.id?.substring(0, 8).toUpperCase() || "-"}</div>
        ${quote.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(quote.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(quote.status)}
            </span>
          </div>
        ` : ""}
      </div>
      <div class="company-info">
        <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Gültigkeit und Datum -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Erstelldatum</div>
          <div class="value">${quote.created_at ? formatDate(quote.created_at) : "-"}</div>
        </div>
        <div>
          <div class="label">Gültig bis</div>
          <div class="value">${quote.valid_until ? formatDate(quote.valid_until) : "-"}</div>
        </div>
        <div>
          <div class="label">Fahrtdatum</div>
          <div class="value">${quote.pickup_date ? formatDate(quote.pickup_date) : "-"}</div>
        </div>
      </div>
    </div>

    <!-- Kunde -->
    ${customer ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Angebotsempfänger</div>
          <div class="value">
            ${customer.salutation || ""} ${customer.first_name || ""} ${customer.last_name || ""}
            ${customer.company_name ? `<br/><strong>${customer.company_name}</strong>` : ""}
            ${customer.address_data ? `
              <br/>${customer.address_data.street || ""} ${customer.address_data.house_number || ""}
              <br/>${customer.address_data.postal_code || ""} ${customer.address_data.city || ""}
            ` : ""}
            ${customer.email ? `<br/>${customer.email}` : ""}
          </div>
        </div>
        <div class="address-block">
          ${quote.vehicle_category ? `
            <div class="label">Fahrzeugkategorie</div>
            <div class="value">${quote.vehicle_category}</div>
          ` : ""}
          ${quote.passengers ? `
            <div class="label" style="margin-top: 16px;">Passagiere</div>
            <div class="value">${quote.passengers}</div>
          ` : ""}
        </div>
      </div>
    ` : ""}
    
    <!-- Strecke -->
    ${(quote.pickup_address || quote.dropoff_address || booking) ? `
      <div style="margin-top: 24px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Fahrtdetails</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div class="label">Abhol-Adresse</div>
            <div class="value">${quote.pickup_address || booking?.pickup_address || "-"}</div>
          </div>
          <div>
            <div class="label">Ziel-Adresse</div>
            <div class="value">${quote.dropoff_address || booking?.dropoff_address || "-"}</div>
          </div>
        </div>
      </div>
    ` : ""}
    
    <!-- Positionen -->
    ${items.length > 0 ? `
      <div style="margin-top: 24px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Leistungspositionen</div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Pos.</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Beschreibung</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Menge</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Einzelpreis</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any, index: number) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description || item.name || ""}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity || 1}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.price || 0)}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    <!-- Beträge -->
    <div style="margin-top: 30px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">Nettobetrag</div>
          <div style="font-size: 16pt; font-weight: 600;">${formatCurrency(quote.amount || subtotal || 0)}</div>
        </div>
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">MwSt. ${quote.tax_rate ? `(${quote.tax_rate}%)` : ""}</div>
          <div style="font-size: 16pt; font-weight: 600;">${formatCurrency(tax)}</div>
        </div>
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">Gesamtbetrag</div>
          <div style="font-size: 20pt; font-weight: 700;">${formatCurrency(total)}</div>
        </div>
      </div>
    </div>
    
    <!-- Notizen -->
    ${quote.notes ? `
      <div style="margin-top: 24px; padding: 16px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div class="label">Hinweise / Bemerkungen</div>
        <div class="value">${quote.notes}</div>
      </div>
    ` : ""}

    <!-- Gültigkeits-Hinweis -->
    <div style="margin-top: 30px; padding: 16px; background: #f1f5f9; border-radius: 8px; font-size: 9pt;">
      <div style="font-weight: 600; margin-bottom: 8px;">Hinweise zum Angebot</div>
      <div>Dieses Angebot ist freibleibend und unverbindlich. Bei Annahme bitten wir um schriftliche Bestätigung.</div>
    </div>

    <!-- Kleinunternehmer-Hinweis -->
    ${data.company.is_small_business ? `
      <div style="margin-top: 16px; font-size: 8pt; color: #6b7280;">
        Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
      </div>
    ` : ""}
  `
}

function generateDriverContent(data: PDFData, formatDate: (s: string) => string): string {
  const driver = data.content
  
  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "#10b981",
      inactive: "#6b7280",
      on_leave: "#f59e0b",
      terminated: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Aktiv",
      inactive: "Inaktiv",
      on_leave: "Im Urlaub",
      terminated: "Ausgeschieden",
    }
    return labels[status] || status
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
      <div>
        <div class="document-title">FAHRER-PROFIL</div>
        <div class="label">Personal-ID</div>
        <div class="value" style="font-family: monospace; font-size: 12pt;">${driver.id?.substring(0, 8).toUpperCase() || "-"}</div>
        ${driver.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(driver.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(driver.status)}
            </span>
          </div>
        ` : ""}
      </div>
      <div class="company-info">
        <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Persönliche Daten -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Persönliche Daten</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Vollständiger Name</div>
          <div class="value" style="font-size: 14pt; font-weight: 600;">${driver.salutation || ""} ${driver.first_name || ""} ${driver.last_name || ""}</div>
          ${driver.date_of_birth ? `
            <div class="label" style="margin-top: 12px;">Geburtsdatum</div>
            <div class="value">${formatDate(driver.date_of_birth)}</div>
          ` : ""}
          ${driver.nationality ? `
            <div class="label" style="margin-top: 12px;">Nationalität</div>
            <div class="value">${driver.nationality}</div>
          ` : ""}
        </div>
        <div>
          ${driver.email ? `
            <div class="label">E-Mail</div>
            <div class="value">${driver.email}</div>
          ` : ""}
          ${driver.phone ? `
            <div class="label" style="margin-top: 12px;">Telefon</div>
            <div class="value">${driver.phone}</div>
          ` : ""}
          ${driver.mobile ? `
            <div class="label" style="margin-top: 12px;">Mobil</div>
            <div class="value">${driver.mobile}</div>
          ` : ""}
        </div>
      </div>
    </div>

    <!-- Adresse -->
    ${driver.address_data ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Wohnadresse</div>
          <div class="value">
            ${driver.address_data.street || ""} ${driver.address_data.house_number || ""}<br>
            ${driver.address_data.postal_code || ""} ${driver.address_data.city || ""}
            ${driver.address_data.country ? `<br>${driver.address_data.country}` : ""}
          </div>
        </div>
      </div>
    ` : ""}

    <!-- Führerschein -->
    <div style="margin-top: 24px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Führerschein</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Führerscheinnummer</div>
          <div class="value" style="font-family: monospace;">${driver.license_number || "-"}</div>
        </div>
        <div>
          <div class="label">Gültig bis</div>
          <div class="value">${driver.license_expiry ? formatDate(driver.license_expiry) : "-"}</div>
        </div>
        <div>
          <div class="label">Fahrerlaubnisklassen</div>
          <div class="value">${driver.license_classes && driver.license_classes.length > 0 ? driver.license_classes.join(", ") : "-"}</div>
        </div>
      </div>
    </div>

    <!-- P-Schein -->
    ${driver.pbef_number ? `
      <div style="margin-top: 24px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Personenbeförderungsschein (P-Schein)</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="color: #9ca3af; font-size: 10pt;">P-Schein Nummer</div>
            <div style="font-size: 14pt; font-weight: 600; font-family: monospace;">${driver.pbef_number}</div>
          </div>
          <div>
            <div style="color: #9ca3af; font-size: 10pt;">Gültig bis</div>
            <div style="font-size: 14pt; font-weight: 600;">${driver.pbef_expiry_date ? formatDate(driver.pbef_expiry_date) : "-"}</div>
          </div>
        </div>
      </div>
    ` : ""}

    <!-- Beschäftigung -->
    ${driver.employment_data ? `
      <div style="margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Beschäftigungsdaten</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          ${driver.employment_data.start_date ? `
            <div>
              <div class="label">Beschäftigungsbeginn</div>
              <div class="value">${formatDate(driver.employment_data.start_date)}</div>
            </div>
          ` : ""}
          ${driver.employment_data.contract_type ? `
            <div>
              <div class="label">Vertragsart</div>
              <div class="value">${driver.employment_data.contract_type}</div>
            </div>
          ` : ""}
          ${driver.employment_data.working_hours ? `
            <div>
              <div class="label">Wochenstunden</div>
              <div class="value">${driver.employment_data.working_hours}</div>
            </div>
          ` : ""}
        </div>
      </div>
    ` : ""}

    <!-- Notizen -->
    ${driver.notes ? `
      <div style="margin-top: 24px; padding: 16px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div class="label">Notizen</div>
        <div class="value">${driver.notes}</div>
      </div>
    ` : ""}

    <!-- Footer-Hinweis -->
    <div style="margin-top: 30px; font-size: 8pt; color: #6b7280; text-align: center;">
      Dieses Dokument wurde automatisch generiert und dient nur internen Zwecken.
    </div>
  `
}

function generateVehicleContent(data: PDFData, formatDate: (s: string) => string): string {
  const vehicle = data.content
  
  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "#10b981",
      in_use: "#3b82f6",
      maintenance: "#f59e0b",
      out_of_service: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: "Verfügbar",
      in_use: "Im Einsatz",
      maintenance: "In Wartung",
      out_of_service: "Außer Betrieb",
    }
    return labels[status] || status
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
      <div>
        <div class="document-title">FAHRZEUG-DATENBLATT</div>
        <div class="label">Kennzeichen</div>
        <div class="value" style="font-family: monospace; font-size: 16pt; font-weight: 700;">${vehicle.license_plate || "-"}</div>
        ${vehicle.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(vehicle.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(vehicle.status)}
            </span>
          </div>
        ` : ""}
      </div>
      <div class="company-info">
        <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Fahrzeugdaten -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Fahrzeugdaten</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Marke</div>
          <div class="value" style="font-size: 14pt; font-weight: 600;">${vehicle.make || "-"}</div>
        </div>
        <div>
          <div class="label">Modell</div>
          <div class="value" style="font-size: 14pt; font-weight: 600;">${vehicle.model || "-"}</div>
        </div>
        <div>
          <div class="label">Baujahr</div>
          <div class="value" style="font-size: 14pt; font-weight: 600;">${vehicle.year || "-"}</div>
        </div>
      </div>
    </div>

    <!-- Weitere Eigenschaften -->
    <div class="meta-grid">
      <div class="address-block">
        ${vehicle.color ? `
          <div class="label">Farbe</div>
          <div class="value">${vehicle.color}</div>
        ` : ""}
        <div class="label" style="margin-top: 16px;">Sitzplätze</div>
        <div class="value">${vehicle.seats || "-"}</div>
        ${vehicle.category ? `
          <div class="label" style="margin-top: 16px;">Kategorie</div>
          <div class="value">${vehicle.category}</div>
        ` : ""}
      </div>
    </div>

    <!-- Technische Daten -->
    ${vehicle.vehicle_data ? `
      <div style="margin-top: 24px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Technische Daten</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          ${vehicle.vehicle_data.vin ? `
            <div>
              <div class="label">FIN (Fahrgestell-Nr.)</div>
              <div class="value" style="font-family: monospace;">${vehicle.vehicle_data.vin}</div>
            </div>
          ` : ""}
          ${vehicle.vehicle_data.fuel_type ? `
            <div>
              <div class="label">Kraftstoffart</div>
              <div class="value">${vehicle.vehicle_data.fuel_type}</div>
            </div>
          ` : ""}
          ${vehicle.vehicle_data.mileage ? `
            <div>
              <div class="label">Kilometerstand</div>
              <div class="value">${vehicle.vehicle_data.mileage.toLocaleString("de-DE")} km</div>
            </div>
          ` : ""}
          ${vehicle.vehicle_data.transmission ? `
            <div>
              <div class="label">Getriebe</div>
              <div class="value">${vehicle.vehicle_data.transmission}</div>
            </div>
          ` : ""}
          ${vehicle.vehicle_data.engine_power ? `
            <div>
              <div class="label">Leistung</div>
              <div class="value">${vehicle.vehicle_data.engine_power}</div>
            </div>
          ` : ""}
        </div>
      </div>
    ` : ""}

    <!-- Versicherung/Dokumente -->
    ${vehicle.insurance_data || vehicle.registration_date ? `
      <div style="margin-top: 24px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Zulassung & Versicherung</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          ${vehicle.registration_date ? `
            <div>
              <div style="color: #9ca3af; font-size: 10pt;">Erstzulassung</div>
              <div style="font-size: 14pt; font-weight: 600;">${formatDate(vehicle.registration_date)}</div>
            </div>
          ` : ""}
          ${vehicle.insurance_data?.company ? `
            <div>
              <div style="color: #9ca3af; font-size: 10pt;">Versicherung</div>
              <div style="font-size: 14pt; font-weight: 600;">${vehicle.insurance_data.company}</div>
            </div>
          ` : ""}
          ${vehicle.insurance_data?.policy_number ? `
            <div>
              <div style="color: #9ca3af; font-size: 10pt;">Policen-Nr.</div>
              <div style="font-size: 14pt; font-family: monospace;">${vehicle.insurance_data.policy_number}</div>
            </div>
          ` : ""}
          ${vehicle.next_inspection ? `
            <div>
              <div style="color: #9ca3af; font-size: 10pt;">Nächste HU/AU</div>
              <div style="font-size: 14pt; font-weight: 600;">${formatDate(vehicle.next_inspection)}</div>
            </div>
          ` : ""}
        </div>
      </div>
    ` : ""}

    <!-- Notizen -->
    ${vehicle.notes ? `
      <div style="margin-top: 24px; padding: 16px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div class="label">Notizen</div>
        <div class="value">${vehicle.notes}</div>
      </div>
    ` : ""}

    <!-- Footer-Hinweis -->
    <div style="margin-top: 30px; font-size: 8pt; color: #6b7280; text-align: center;">
      Dieses Dokument wurde automatisch generiert und dient nur internen Zwecken.
    </div>
  `
}

function generateCustomerContent(data: PDFData, formatDate: (s: string) => string): string {
  const customer = data.content
  
  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "#10b981",
      inactive: "#6b7280",
      vip: "#8b5cf6",
      blocked: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Aktiv",
      inactive: "Inaktiv",
      vip: "VIP",
      blocked: "Gesperrt",
    }
    return labels[status] || status
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
      <div>
        <div class="document-title">KUNDEN-PROFIL</div>
        <div class="label">Kunden-ID</div>
        <div class="value" style="font-family: monospace; font-size: 12pt;">${customer.id?.substring(0, 8).toUpperCase() || "-"}</div>
        ${customer.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(customer.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(customer.status)}
            </span>
          </div>
        ` : ""}
      </div>
      <div class="company-info">
        <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Persönliche Daten -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Persönliche Daten</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Vollständiger Name</div>
          <div class="value" style="font-size: 14pt; font-weight: 600;">${customer.salutation || ""} ${customer.first_name || ""} ${customer.last_name || ""}</div>
          ${customer.company_name ? `
            <div class="label" style="margin-top: 12px;">Firma</div>
            <div class="value" style="font-weight: 600;">${customer.company_name}</div>
          ` : ""}
          ${customer.date_of_birth ? `
            <div class="label" style="margin-top: 12px;">Geburtsdatum</div>
            <div class="value">${formatDate(customer.date_of_birth)}</div>
          ` : ""}
        </div>
        <div>
          ${customer.email ? `
            <div class="label">E-Mail</div>
            <div class="value">${customer.email}</div>
          ` : ""}
          ${customer.phone ? `
            <div class="label" style="margin-top: 12px;">Telefon</div>
            <div class="value">${customer.phone}</div>
          ` : ""}
          ${customer.mobile ? `
            <div class="label" style="margin-top: 12px;">Mobil</div>
            <div class="value">${customer.mobile}</div>
          ` : ""}
        </div>
      </div>
    </div>

    <!-- Adresse -->
    ${customer.address_data ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Adresse</div>
          <div class="value">
            ${customer.address_data.street || ""} ${customer.address_data.house_number || ""}<br>
            ${customer.address_data.postal_code || ""} ${customer.address_data.city || ""}
            ${customer.address_data.country ? `<br>${customer.address_data.country}` : ""}
          </div>
        </div>
      </div>
    ` : ""}

    <!-- Buchungsstatistik -->
    <div style="margin-top: 24px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Buchungsstatistik</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">Anzahl Buchungen</div>
          <div style="font-size: 20pt; font-weight: 700;">${customer.booking_count || 0}</div>
        </div>
        ${customer.total_revenue !== undefined ? `
          <div>
            <div style="color: #9ca3af; font-size: 10pt;">Gesamtumsatz</div>
            <div style="font-size: 20pt; font-weight: 700;">${customer.total_revenue?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) || "0,00 €"}</div>
          </div>
        ` : ""}
        ${customer.last_booking_date ? `
          <div>
            <div style="color: #9ca3af; font-size: 10pt;">Letzte Buchung</div>
            <div style="font-size: 14pt; font-weight: 600;">${formatDate(customer.last_booking_date)}</div>
          </div>
        ` : ""}
      </div>
    </div>

    <!-- Zahlungsinformationen -->
    ${customer.payment_data || customer.preferred_payment_method ? `
      <div style="margin-top: 24px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Zahlungsinformationen</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          ${customer.preferred_payment_method ? `
            <div>
              <div class="label">Bevorzugte Zahlungsart</div>
              <div class="value">${customer.preferred_payment_method}</div>
            </div>
          ` : ""}
          ${customer.tax_id ? `
            <div>
              <div class="label">Steuernummer</div>
              <div class="value">${customer.tax_id}</div>
            </div>
          ` : ""}
        </div>
      </div>
    ` : ""}

    <!-- Notizen -->
    ${customer.notes ? `
      <div style="margin-top: 24px; padding: 16px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div class="label">Notizen</div>
        <div class="value">${customer.notes}</div>
      </div>
    ` : ""}

    <!-- Footer-Hinweis -->
    <div style="margin-top: 30px; font-size: 8pt; color: #6b7280; text-align: center;">
      Dieses Dokument wurde automatisch generiert und dient nur internen Zwecken.
    </div>
  `
}

function generateEmployeeContent(data: PDFData, formatDate: (s: string) => string): string {
  const employee = data.content
  
  // Status-Badge Farben
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "#10b981",
      inactive: "#6b7280",
      on_leave: "#f59e0b",
      terminated: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Aktiv",
      inactive: "Inaktiv",
      on_leave: "Im Urlaub",
      terminated: "Ausgeschieden",
    }
    return labels[status] || status
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      owner: "Inhaber",
      user: "Mitarbeiter",
      manager: "Manager",
      accountant: "Buchhalter",
    }
    return labels[role] || role
  }

  return `
    <!-- Header mit Titel und Unternehmen -->
    <div class="header">
      <div>
        <div class="document-title">MITARBEITER-PROFIL</div>
        <div class="label">Personal-ID</div>
        <div class="value" style="font-family: monospace; font-size: 12pt;">${employee.id?.substring(0, 8).toUpperCase() || "-"}</div>
        ${employee.status ? `
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${getStatusColor(employee.status)}; color: white; font-size: 10pt; font-weight: 600;">
              ${getStatusLabel(employee.status)}
            </span>
          </div>
        ` : ""}
      </div>
      <div class="company-info">
        <div class="company-name">${data.company.name}</div>
        ${data.company.address ? `<div>${data.company.address}</div>` : ""}
        ${data.company.email ? `<div>${data.company.email}</div>` : ""}
        ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
      </div>
    </div>
    
    <!-- Persönliche Daten -->
    <div style="margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Persönliche Daten</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div class="label">Vollständiger Name</div>
          <div class="value" style="font-size: 14pt; font-weight: 600;">${employee.salutation || ""} ${employee.full_name || employee.email || "-"}</div>
          ${employee.date_of_birth ? `
            <div class="label" style="margin-top: 12px;">Geburtsdatum</div>
            <div class="value">${formatDate(employee.date_of_birth)}</div>
          ` : ""}
          ${employee.nationality ? `
            <div class="label" style="margin-top: 12px;">Nationalität</div>
            <div class="value">${employee.nationality}</div>
          ` : ""}
        </div>
        <div>
          <div class="label">E-Mail</div>
          <div class="value">${employee.email || "-"}</div>
          ${employee.phone ? `
            <div class="label" style="margin-top: 12px;">Telefon</div>
            <div class="value">${employee.phone}</div>
          ` : ""}
          ${employee.phone_mobile ? `
            <div class="label" style="margin-top: 12px;">Mobil</div>
            <div class="value">${employee.phone_mobile}</div>
          ` : ""}
        </div>
      </div>
    </div>

    <!-- Adresse -->
    ${employee.address_data ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Wohnadresse</div>
          <div class="value">
            ${employee.address_data.street || ""} ${employee.address_data.house_number || ""}<br>
            ${employee.address_data.postal_code || ""} ${employee.address_data.city || ""}
            ${employee.address_data.country ? `<br>${employee.address_data.country}` : ""}
          </div>
        </div>
      </div>
    ` : ""}

    <!-- Rolle und Berechtigungen -->
    <div style="margin-top: 24px; padding: 20px; background: #1a1a1a; color: white; border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 12px;">Rolle & Zugriff</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div style="color: #9ca3af; font-size: 10pt;">System-Rolle</div>
          <div style="font-size: 16pt; font-weight: 700;">${getRoleLabel(employee.role) || "-"}</div>
        </div>
        ${employee.last_sign_in_at ? `
          <div>
            <div style="color: #9ca3af; font-size: 10pt;">Letzte Anmeldung</div>
            <div style="font-size: 14pt; font-weight: 600;">${formatDate(employee.last_sign_in_at)}</div>
          </div>
        ` : ""}
      </div>
    </div>

    <!-- Beschäftigungsdaten -->
    ${employee.employment_data ? `
      <div style="margin-top: 24px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 12px;">Beschäftigungsdaten</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          ${employee.employment_data.start_date ? `
            <div>
              <div class="label">Beschäftigungsbeginn</div>
              <div class="value">${formatDate(employee.employment_data.start_date)}</div>
            </div>
          ` : ""}
          ${employee.employment_data.contract_type ? `
            <div>
              <div class="label">Vertragsart</div>
              <div class="value">${employee.employment_data.contract_type}</div>
            </div>
          ` : ""}
          ${employee.employment_data.department ? `
            <div>
              <div class="label">Abteilung</div>
              <div class="value">${employee.employment_data.department}</div>
            </div>
          ` : ""}
          ${employee.employment_data.position ? `
            <div>
              <div class="label">Position</div>
              <div class="value">${employee.employment_data.position}</div>
            </div>
          ` : ""}
          ${employee.employment_data.working_hours ? `
            <div>
              <div class="label">Wochenstunden</div>
              <div class="value">${employee.employment_data.working_hours} h</div>
            </div>
          ` : ""}
          ${employee.employment_data.monthly_salary ? `
            <div>
              <div class="label">Monatsgehalt</div>
              <div class="value">${employee.employment_data.monthly_salary.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</div>
            </div>
          ` : ""}
          ${employee.employment_data.hourly_rate ? `
            <div>
              <div class="label">Stundensatz</div>
              <div class="value">${employee.employment_data.hourly_rate.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}/h</div>
            </div>
          ` : ""}
        </div>
      </div>
    ` : ""}

    <!-- Notizen -->
    ${employee.notes ? `
      <div style="margin-top: 24px; padding: 16px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div class="label">Notizen</div>
        <div class="value">${employee.notes}</div>
      </div>
    ` : ""}

    <!-- Footer-Hinweis -->
    <div style="margin-top: 30px; font-size: 8pt; color: #6b7280; text-align: center;">
      Dieses Dokument enthält vertrauliche Personaldaten und ist nur für den internen Gebrauch bestimmt.
    </div>
  `
}

export function downloadPDF(data: PDFData) {
  const html = generatePDFHTML(data)
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Popup blocked - please allow popups for PDF generation")
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

export function openPDFPreview(data: PDFData) {
  const html = generatePDFHTML(data)
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

