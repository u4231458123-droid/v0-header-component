// PDF Invoice Generator using Browser-native APIs
// Generates print-ready invoices without external dependencies

import { format } from "date-fns"
import { de } from "date-fns/locale"

interface InvoiceData {
  invoice_number: string
  created_at: string
  due_date: string
  status: string
  amount: number
  tax_amount: number
  total_amount: number
  customer: {
    first_name: string
    last_name: string
    email: string
    address?: string
  }
  booking?: {
    pickup_address: string
    dropoff_address: string
    pickup_time: string
    price: number
  }
  company: {
    name: string
    address: string
    email: string
    phone: string
    tax_id?: string
    vat_id?: string
    bank_info?: {
      iban?: string
      bic?: string
      bank_name?: string
    }
    is_small_business?: boolean
    small_business_note?: string
  }
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const formatDate = (dateStr: string) => format(new Date(dateStr), "dd.MM.yyyy", { locale: de })
  const formatCurrency = (amount: number) => amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <title>Rechnung ${data.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1a1a1a;
          padding: 40px;
        }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .company-info { text-align: right; }
        .company-name { font-size: 18pt; font-weight: bold; margin-bottom: 8px; }
        .invoice-title { font-size: 24pt; font-weight: bold; margin-bottom: 24px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
        .label { font-size: 9pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-weight: 500; }
        .address-block { margin-bottom: 24px; }
        .table { width: 100%; border-collapse: collapse; margin: 32px 0; }
        .table th { 
          text-align: left; 
          padding: 12px 8px; 
          border-bottom: 2px solid #1a1a1a; 
          font-weight: 600;
          font-size: 9pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table td { padding: 12px 8px; border-bottom: 1px solid #e5e5e5; }
        .table .text-right { text-align: right; }
        .totals { margin-left: auto; width: 280px; margin-top: 24px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.total { 
          border-top: 2px solid #1a1a1a; 
          font-weight: bold; 
          font-size: 14pt;
          padding-top: 12px;
          margin-top: 8px;
        }
        .payment-info { 
          margin-top: 48px; 
          padding: 20px; 
          background: #f8f8f8; 
          border-radius: 4px;
        }
        .payment-title { font-weight: 600; margin-bottom: 12px; }
        .footer { 
          margin-top: 48px; 
          padding-top: 24px; 
          border-top: 1px solid #e5e5e5;
          font-size: 9pt;
          color: #666;
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 10pt;
          font-weight: 500;
        }
        .status-paid { background: #1a1a1a; color: white; }
        .status-pending { background: #f5f5f5; color: #1a1a1a; }
        .status-overdue { background: #dc2626; color: white; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="invoice-title">RECHNUNG</div>
          <div class="label">Rechnungsnummer</div>
          <div class="value">${data.invoice_number}</div>
        </div>
        <div class="company-info">
          <div class="company-name">${data.company.name}</div>
          <div>${data.company.address}</div>
          <div>${data.company.email}</div>
          <div>${data.company.phone}</div>
          ${data.company.tax_id ? `<div>Steuernummer: ${data.company.tax_id}</div>` : ""}
          ${data.company.vat_id ? `<div>USt-IdNr.: ${data.company.vat_id}</div>` : ""}
          ${data.company.is_small_business && data.company.small_business_note ? `<div>Kleinunternehmerregelung: ${data.company.small_business_note}</div>` : ""}
        </div>
      </div>

      <div class="meta-grid">
        <div class="address-block">
          <div class="label">Rechnungsempfaenger</div>
          <div class="value">
            ${data.customer.first_name} ${data.customer.last_name}<br>
            ${data.customer.address || ""}<br>
            ${data.customer.email}
          </div>
        </div>
        <div>
          <div style="margin-bottom: 16px;">
            <div class="label">Rechnungsdatum</div>
            <div class="value">${formatDate(data.created_at)}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div class="label">Faelligkeitsdatum</div>
            <div class="value">${formatDate(data.due_date)}</div>
          </div>
          <div>
            <div class="label">Status</div>
            <span class="status-badge status-${data.status === "paid" ? "paid" : data.status === "overdue" ? "overdue" : "pending"}">
              ${data.status === "paid" ? "Bezahlt" : data.status === "overdue" ? "Ueberfaellig" : "Ausstehend"}
            </span>
          </div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Beschreibung</th>
            <th>Details</th>
            <th class="text-right">Betrag</th>
          </tr>
        </thead>
        <tbody>
          ${
            data.booking
              ? `
          <tr>
            <td>
              <strong>Personenbefoerderung</strong><br>
              <span style="color: #666; font-size: 10pt;">${formatDate(data.booking.pickup_time)}</span>
            </td>
            <td>
              Von: ${data.booking.pickup_address}<br>
              Nach: ${data.booking.dropoff_address}
            </td>
            <td class="text-right">${formatCurrency(data.booking.price)}</td>
          </tr>
          `
              : `
          <tr>
            <td><strong>Dienstleistung</strong></td>
            <td>Personenbefoerderung</td>
            <td class="text-right">${formatCurrency(data.amount)}</td>
          </tr>
          `
          }
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Nettobetrag</span>
          <span>${formatCurrency(data.amount)}</span>
        </div>
        ${
          data.company.is_small_business
            ? `
        <div class="totals-row" style="font-style: italic; color: #666;">
          <span colspan="2">${data.company.small_business_note || "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."}</span>
        </div>
        `
            : `
        <div class="totals-row">
          <span>MwSt. (19%)</span>
          <span>${formatCurrency(data.tax_amount)}</span>
        </div>
        `
        }
        <div class="totals-row total">
          <span>Gesamtbetrag</span>
          <span>${formatCurrency(data.company.is_small_business ? data.amount : data.total_amount)}</span>
        </div>
      </div>

      ${
        data.company.bank_info
          ? `
      <div class="payment-info">
        <div class="payment-title">Zahlungsinformationen</div>
        <div>Bitte ueberweisen Sie den Betrag innerhalb von 14 Tagen auf folgendes Konto:</div>
        <div style="margin-top: 12px;">
          <strong>IBAN:</strong> ${data.company.bank_info.iban || "k.A."}<br>
          <strong>BIC:</strong> ${data.company.bank_info.bic || "k.A."}<br>
          <strong>Bank:</strong> ${data.company.bank_info.bank_name || "k.A."}<br>
          <strong>Verwendungszweck:</strong> ${data.invoice_number}
        </div>
      </div>
      `
          : ""
      }

      <div class="footer">
        <p>${data.company.name} | ${data.company.address} | ${data.company.email} | ${data.company.phone}</p>
        ${data.company.tax_id ? `<p>Steuernummer: ${data.company.tax_id}${data.company.vat_id ? ` | USt-IdNr.: ${data.company.vat_id}` : ""}</p>` : ""}
      </div>
    </body>
    </html>
  `
}

export function downloadInvoicePDF(data: InvoiceData) {
  const html = generateInvoiceHTML(data)

  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Popup blocked - please allow popups for PDF generation")
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

export function openInvoicePreview(data: InvoiceData) {
  const html = generateInvoiceHTML(data)
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")

  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
