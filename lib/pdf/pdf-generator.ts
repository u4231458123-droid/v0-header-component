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
  return `
    <div>
      <div class="document-title">RECHNUNG</div>
      <div class="label">Rechnungsnummer</div>
      <div class="value">${invoice.invoice_number}</div>
    </div>
    <div class="company-info">
      <div class="company-name">${data.company.name}</div>
      ${data.company.address ? `<div>${data.company.address}</div>` : ""}
      ${data.company.email ? `<div>${data.company.email}</div>` : ""}
      ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
    </div>
    <!-- Invoice content continues... -->
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
  const tax = quote.tax_rate ? subtotal * (quote.tax_rate / 100) : 0
  const total = subtotal + tax

  return `
    <div>
      <div class="document-title">ANGEBOT</div>
      <div class="label">Angebotsnummer</div>
      <div class="value">${quote.quote_number || quote.id}</div>
      ${quote.valid_until ? `<div class="label" style="margin-top: 16px;">Gültig bis</div><div class="value">${formatDate(quote.valid_until)}</div>` : ""}
    </div>
    <div class="company-info">
      <div class="company-name">${data.company.name}</div>
      ${data.company.address ? `<div>${data.company.address}</div>` : ""}
      ${data.company.email ? `<div>${data.company.email}</div>` : ""}
      ${data.company.phone ? `<div>${data.company.phone}</div>` : ""}
    </div>
    
    ${customer ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Kunde</div>
          <div class="value">
            ${customer.salutation || ""} ${customer.first_name || ""} ${customer.last_name || ""}
            ${customer.email ? `<br/>${customer.email}` : ""}
            ${customer.phone ? `<br/>${customer.phone}` : ""}
          </div>
        </div>
      </div>
    ` : ""}
    
    ${booking ? `
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Abhol-Adresse</div>
          <div class="value">${booking.pickup_address || ""}</div>
          <div class="label" style="margin-top: 16px;">Ziel-Adresse</div>
          <div class="value">${booking.dropoff_address || ""}</div>
        </div>
      </div>
    ` : ""}
    
    ${items.length > 0 ? `
      <div class="items-table">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Beschreibung</th>
              <th>Menge</th>
              <th>Preis</th>
              <th>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.description || item.name || ""}</td>
                <td>${item.quantity || 1}</td>
                <td>${formatCurrency(item.price || 0)}</td>
                <td>${formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row">
            <span>Zwischensumme:</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          ${tax > 0 ? `
            <div class="total-row">
              <span>MwSt. (${quote.tax_rate || 19}%):</span>
              <span>${formatCurrency(tax)}</span>
            </div>
          ` : ""}
          <div class="total-row total">
            <span>Gesamt:</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    ` : ""}
    
    ${quote.notes ? `
      <div class="notes">
        <div class="label">Hinweise</div>
        <div class="value">${quote.notes}</div>
      </div>
    ` : ""}
  `
}

function generateDriverContent(data: PDFData, formatDate: (s: string) => string): string {
  const driver = data.content
  return `
    <div>
      <div class="document-title">FAHRER-PROFIL</div>
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Name</div>
          <div class="value">${driver.salutation || ""} ${driver.first_name || ""} ${driver.last_name || ""}</div>
          ${driver.email ? `<div class="label" style="margin-top: 16px;">E-Mail</div><div class="value">${driver.email}</div>` : ""}
          ${driver.phone ? `<div class="label" style="margin-top: 16px;">Telefon</div><div class="value">${driver.phone}</div>` : ""}
          ${driver.mobile ? `<div class="label" style="margin-top: 16px;">Mobil</div><div class="value">${driver.mobile}</div>` : ""}
        </div>
        <div class="address-block">
          ${driver.date_of_birth ? `<div class="label">Geburtsdatum</div><div class="value">${formatDate(driver.date_of_birth)}</div>` : ""}
          ${driver.nationality ? `<div class="label" style="margin-top: 16px;">Nationalität</div><div class="value">${driver.nationality}</div>` : ""}
          ${driver.address_data ? `
            <div class="label" style="margin-top: 16px;">Adresse</div>
            <div class="value">
              ${driver.address_data.street || ""} ${driver.address_data.house_number || ""}<br>
              ${driver.address_data.postal_code || ""} ${driver.address_data.city || ""}
            </div>
          ` : ""}
        </div>
      </div>
      <div class="section-title" style="margin-top: 30px;">Führerschein</div>
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Führerscheinnummer</div>
          <div class="value">${driver.license_number || "-"}</div>
          ${driver.license_expiry ? `<div class="label" style="margin-top: 16px;">Ablaufdatum</div><div class="value">${formatDate(driver.license_expiry)}</div>` : ""}
        </div>
        <div class="address-block">
          ${driver.license_classes && driver.license_classes.length > 0 ? `
            <div class="label">Fahrerlaubnisklassen</div>
            <div class="value">${driver.license_classes.join(", ")}</div>
          ` : ""}
        </div>
      </div>
      ${driver.pbef_number ? `
        <div class="section-title" style="margin-top: 30px;">Personenbeförderungsschein</div>
        <div class="meta-grid">
          <div class="address-block">
            <div class="label">P-Schein Nummer</div>
            <div class="value">${driver.pbef_number}</div>
            ${driver.pbef_expiry_date ? `<div class="label" style="margin-top: 16px;">Ablaufdatum</div><div class="value">${formatDate(driver.pbef_expiry_date)}</div>` : ""}
          </div>
        </div>
      ` : ""}
      ${driver.employment_data ? `
        <div class="section-title" style="margin-top: 30px;">Beschäftigung</div>
        <div class="meta-grid">
          <div class="address-block">
            ${driver.employment_data.start_date ? `<div class="label">Beschäftigungsbeginn</div><div class="value">${formatDate(driver.employment_data.start_date)}</div>` : ""}
            ${driver.employment_data.contract_type ? `<div class="label" style="margin-top: 16px;">Vertragsart</div><div class="value">${driver.employment_data.contract_type}</div>` : ""}
          </div>
        </div>
      ` : ""}
    </div>
  `
}

function generateVehicleContent(data: PDFData, formatDate: (s: string) => string): string {
  const vehicle = data.content
  return `
    <div>
      <div class="document-title">FAHRZEUG-DATENBLATT</div>
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Kennzeichen</div>
          <div class="value">${vehicle.license_plate || "-"}</div>
          <div class="label" style="margin-top: 16px;">Marke</div>
          <div class="value">${vehicle.make || "-"}</div>
          <div class="label" style="margin-top: 16px;">Modell</div>
          <div class="value">${vehicle.model || "-"}</div>
        </div>
        <div class="address-block">
          ${vehicle.year ? `<div class="label">Baujahr</div><div class="value">${vehicle.year}</div>` : ""}
          ${vehicle.color ? `<div class="label" style="margin-top: 16px;">Farbe</div><div class="value">${vehicle.color}</div>` : ""}
          <div class="label" style="margin-top: 16px;">Sitzplätze</div>
          <div class="value">${vehicle.seats || "-"}</div>
          <div class="label" style="margin-top: 16px;">Status</div>
          <div class="value">${vehicle.status || "-"}</div>
        </div>
      </div>
      ${vehicle.vehicle_data ? `
        <div class="section-title" style="margin-top: 30px;">Technische Daten</div>
        <div class="meta-grid">
          <div class="address-block">
            ${vehicle.vehicle_data.vin ? `<div class="label">FIN</div><div class="value">${vehicle.vehicle_data.vin}</div>` : ""}
            ${vehicle.vehicle_data.fuel_type ? `<div class="label" style="margin-top: 16px;">Kraftstoff</div><div class="value">${vehicle.vehicle_data.fuel_type}</div>` : ""}
          </div>
          <div class="address-block">
            ${vehicle.vehicle_data.mileage ? `<div class="label">Kilometerstand</div><div class="value">${vehicle.vehicle_data.mileage.toLocaleString("de-DE")} km</div>` : ""}
          </div>
        </div>
      ` : ""}
    </div>
  `
}

function generateCustomerContent(data: PDFData, formatDate: (s: string) => string): string {
  const customer = data.content
  return `
    <div>
      <div class="document-title">KUNDEN-PROFIL</div>
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Name</div>
          <div class="value">${customer.salutation || ""} ${customer.first_name || ""} ${customer.last_name || ""}</div>
          ${customer.email ? `<div class="label" style="margin-top: 16px;">E-Mail</div><div class="value">${customer.email}</div>` : ""}
          ${customer.phone ? `<div class="label" style="margin-top: 16px;">Telefon</div><div class="value">${customer.phone}</div>` : ""}
        </div>
        <div class="address-block">
          ${customer.date_of_birth ? `<div class="label">Geburtsdatum</div><div class="value">${formatDate(customer.date_of_birth)}</div>` : ""}
          ${customer.address_data ? `
            <div class="label" style="margin-top: 16px;">Adresse</div>
            <div class="value">
              ${customer.address_data.street || ""} ${customer.address_data.house_number || ""}<br>
              ${customer.address_data.postal_code || ""} ${customer.address_data.city || ""}
            </div>
          ` : ""}
        </div>
      </div>
      ${customer.booking_count !== undefined ? `
        <div class="section-title" style="margin-top: 30px;">Buchungshistorie</div>
        <div class="meta-grid">
          <div class="address-block">
            <div class="label">Anzahl Buchungen</div>
            <div class="value">${customer.booking_count || 0}</div>
          </div>
        </div>
      ` : ""}
    </div>
  `
}

function generateEmployeeContent(data: PDFData, formatDate: (s: string) => string): string {
  const employee = data.content
  return `
    <div>
      <div class="document-title">MITARBEITER-PROFIL</div>
      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Name</div>
          <div class="value">${employee.salutation || ""} ${employee.full_name || employee.email || "-"}</div>
          <div class="label" style="margin-top: 16px;">E-Mail</div>
          <div class="value">${employee.email || "-"}</div>
          ${employee.phone ? `<div class="label" style="margin-top: 16px;">Telefon</div><div class="value">${employee.phone}</div>` : ""}
          ${employee.phone_mobile ? `<div class="label" style="margin-top: 16px;">Mobil</div><div class="value">${employee.phone_mobile}</div>` : ""}
        </div>
        <div class="address-block">
          ${employee.date_of_birth ? `<div class="label">Geburtsdatum</div><div class="value">${formatDate(employee.date_of_birth)}</div>` : ""}
          ${employee.nationality ? `<div class="label" style="margin-top: 16px;">Nationalität</div><div class="value">${employee.nationality}</div>` : ""}
          <div class="label" style="margin-top: 16px;">Rolle</div>
          <div class="value">${employee.role || "-"}</div>
          ${employee.address_data ? `
            <div class="label" style="margin-top: 16px;">Adresse</div>
            <div class="value">
              ${employee.address_data.street || ""} ${employee.address_data.house_number || ""}<br>
              ${employee.address_data.postal_code || ""} ${employee.address_data.city || ""}
            </div>
          ` : ""}
        </div>
      </div>
      ${employee.employment_data ? `
        <div class="section-title" style="margin-top: 30px;">Beschäftigung</div>
        <div class="meta-grid">
          <div class="address-block">
            ${employee.employment_data.start_date ? `<div class="label">Beschäftigungsbeginn</div><div class="value">${formatDate(employee.employment_data.start_date)}</div>` : ""}
            ${employee.employment_data.contract_type ? `<div class="label" style="margin-top: 16px;">Vertragsart</div><div class="value">${employee.employment_data.contract_type}</div>` : ""}
            ${employee.employment_data.department ? `<div class="label" style="margin-top: 16px;">Abteilung</div><div class="value">${employee.employment_data.department}</div>` : ""}
          </div>
          <div class="address-block">
            ${employee.employment_data.position ? `<div class="label">Position</div><div class="value">${employee.employment_data.position}</div>` : ""}
            ${employee.employment_data.working_hours ? `<div class="label" style="margin-top: 16px;">Arbeitsstunden/Woche</div><div class="value">${employee.employment_data.working_hours}</div>` : ""}
            ${employee.employment_data.monthly_salary ? `<div class="label" style="margin-top: 16px;">Monatsgehalt</div><div class="value">${employee.employment_data.monthly_salary.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</div>` : ""}
          </div>
        </div>
      ` : ""}
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

