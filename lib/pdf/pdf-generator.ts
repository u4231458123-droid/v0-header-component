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
  type: "invoice" | "booking" | "offer" | "partner"
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
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      ${hasLetterhead ? "position: relative; z-index: 10; padding: 0 20mm;" : ""}
    }
    .company-info {
      text-align: right;
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

      <div class="header">
        ${contentHTML}
      </div>

      <div class="footer">
        <p>${data.company.name}${data.company.address ? ` | ${data.company.address}` : ""}${data.company.email ? ` | ${data.company.email}` : ""}${data.company.phone ? ` | ${data.company.phone}` : ""}</p>
        ${data.company.tax_id ? `<p>Steuernummer: ${data.company.tax_id}${data.company.vat_id ? ` | USt-IdNr.: ${data.company.vat_id}` : ""}</p>` : ""}
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

  return `
    <div>
      <div class="document-title">AUFTRAG</div>
      ${showField("id") ? `<div class="label">Auftrags-ID</div><div class="value">${booking.id}</div>` : ""}
      ${showField("date") ? `<div class="label">Datum</div><div class="value">${formatDateTime(booking.pickup_time).split(" ")[0]}</div>` : ""}
      ${showField("time") ? `<div class="label">Uhrzeit</div><div class="value">${formatDateTime(booking.pickup_time).split(" ")[1]}</div>` : ""}
    </div>
    <div class="company-info">
      <div class="company-name">${data.company.name}</div>
    </div>
    
    <div class="meta-grid">
      <div class="address-block">
        ${showField("customer") ? `
          <div class="label">Kunde</div>
          <div class="value">
            ${booking.customer?.salutation || ""} ${booking.customer?.first_name || ""} ${booking.customer?.last_name || ""}
          </div>
        ` : ""}
        ${showField("pickup") ? `
          <div class="label" style="margin-top: 16px;">Abhol-Adresse</div>
          <div class="value">${booking.pickup_address}</div>
        ` : ""}
        ${showField("dropoff") ? `
          <div class="label" style="margin-top: 16px;">Ziel-Adresse</div>
          <div class="value">${booking.dropoff_address}</div>
        ` : ""}
      </div>
      <div>
        ${showField("passengers") ? `
          <div class="label">Passagier Anzahl</div>
          <div class="value">${booking.passengers || 1}</div>
        ` : ""}
        ${showField("passenger_names") && booking.passenger_name ? `
          <div class="label" style="margin-top: 16px;">Passagier Name/n</div>
          <div class="value">${booking.passenger_name}</div>
        ` : ""}
        ${showField("vehicle_category") ? `
          <div class="label" style="margin-top: 16px;">Fahrzeug Kategorie</div>
          <div class="value">${booking.vehicle_category || "Standard"}</div>
        ` : ""}
        ${showField("flight_train_origin") && booking.flight_train_origin ? `
          <div class="label" style="margin-top: 16px;">Flug / Zug aus</div>
          <div class="value">${booking.flight_train_origin}</div>
        ` : ""}
        ${showField("flight_train_number") && booking.flight_train_number ? `
          <div class="label" style="margin-top: 16px;">Flug / Zug Nummer</div>
          <div class="value">${booking.flight_train_number}</div>
        ` : ""}
        ${showField("driver") && booking.driver ? `
          <div class="label" style="margin-top: 16px;">Fahrer</div>
          <div class="value">${booking.driver.first_name} ${booking.driver.last_name}</div>
        ` : ""}
        ${showField("vehicle") && booking.vehicle ? `
          <div class="label" style="margin-top: 16px;">Fahrzeug Kennzeichen</div>
          <div class="value">${booking.vehicle.license_plate}</div>
        ` : ""}
        ${showField("price") ? `
          <div class="label" style="margin-top: 16px;">Fahrpreis</div>
          <div class="value">${booking.price ? booking.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "Nicht festgelegt"}</div>
        ` : ""}
      </div>
    </div>
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

