/**
 * E-MAIL-SERVICE
 * ==============
 * Versendet E-Mails über Supabase Auth (Resend Provider)
 * Verwendet das einheitliche MyDispatch-Template
 */

import { Resend } from "resend"
import { generateUnifiedEmailHTML, EmailContent } from "./unified-template"

// Resend client - nur initialisieren wenn API Key vorhanden
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface SendEmailOptions {
  to: string
  subject: string
  content: EmailContent
  from?: string
}

/**
 * Versende E-Mail über Supabase Auth Admin API (Resend Provider)
 * 
 * Hinweis: Supabase Auth Admin API unterstützt nur Auth-bezogene E-Mails.
 * Für allgemeine E-Mails (Kontaktformular, etc.) verwenden wir eine Edge Function
 * oder direkt Resend API, falls verfügbar.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, subject, content, from = "info@my-dispatch.de" } = options

    // Validiere E-Mail-Adresse
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return { success: false, error: "Ungültige E-Mail-Adresse" }
    }

    // Generiere HTML mit Template
    const html = generateUnifiedEmailHTML(content)

    // Development oder kein API Key: Logge E-Mail
    if (process.env.NODE_ENV === "development" || !resend) {
      console.log("--- DEVELOPMENT EMAIL PREVIEW ---")
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log("HTML Content (logged to console)")
      console.log("---------------------------------")
      return { success: true }
    }

    // Versende E-Mail über Resend
    const { data, error } = await resend!.emails.send({
      from: `MyDispatch <${from}>`,
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error("[EmailService] Resend error:", error)
      return { success: false, error: error.message || "Fehler beim Versenden der E-Mail" }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[EmailService] Fehler beim Versenden der E-Mail:", error)
    return { success: false, error: error.message || "Unbekannter Fehler" }
  }
}

/**
 * Versende Kontaktformular-E-Mail an MyDispatch
 */
export async function sendContactFormEmail(data: {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  company?: string
}): Promise<{ success: boolean; error?: string }> {
  const content: EmailContent = {
    headline: "Neue Kontaktanfrage",
    greeting: "Hallo,",
    body: `Sie haben eine neue Kontaktanfrage über das MyDispatch-Kontaktformular erhalten:

Name: ${data.name}
E-Mail: ${data.email}
Telefon: ${data.phone}
${data.company ? `Unternehmen: ${data.company}\n` : ""}
Betreff: ${data.subject}

Nachricht:
${data.message}`,
  }

  return sendEmail({
    to: "info@my-dispatch.de",
    subject: `Kontaktanfrage: ${data.subject}`,
    content,
  })
}

/**
 * Versende Antwort-E-Mail an Kontaktanfrage
 */
export async function sendContactResponseEmail(data: {
  to: string
  subject: string
  message: string
  originalSubject?: string
}): Promise<{ success: boolean; error?: string }> {
  const content: EmailContent = {
    headline: "Antwort auf Ihre Anfrage",
    greeting: "Hallo,",
    body: `vielen Dank für Ihre Anfrage. Hier ist unsere Antwort:

${data.message}

Bei weiteren Fragen stehen wir Ihnen gerne zur Verfügung.`,
  }

  return sendEmail({
    to: data.to,
    subject: data.subject || `Re: ${data.originalSubject || "Ihre Anfrage"}`,
    content,
  })
}

/**
 * Versende Partner-Weiterleitungs-E-Mail
 */
export async function sendPartnerForwardEmail(data: {
  to: string
  bookingId: string
  bookingDetails: string
}): Promise<{ success: boolean; error?: string }> {
  const content: EmailContent = {
    headline: "Auftrag weitergeleitet",
    greeting: "Sehr geehrte/r Partner,",
    body: `wir leiten Ihnen folgenden Auftrag zur Bearbeitung weiter:

${data.bookingDetails}

Bitte bearbeiten Sie diesen Auftrag entsprechend.`,
  }

  return sendEmail({
    to: data.to,
    subject: `Auftrag ${data.bookingId} - Weiterleitung`,
    content,
  })
}

/**
 * Versende Team-Einladungs-E-Mail
 */
export async function sendTeamInvitationEmail(data: {
  to: string
  companyName: string
  role: string
  inviteUrl: string
}): Promise<{ success: boolean; error?: string }> {
  const roleText = data.role === "admin" ? "Administrator" : data.role === "dispatcher" ? "Disponent" : "Benutzer"
  
  const content: EmailContent = {
    headline: "Team-Einladung",
    greeting: "Hallo,",
    body: `Sie wurden eingeladen, dem Team von ${data.companyName} beizutreten.

Ihre Rolle: ${roleText}

Klicken Sie auf den folgenden Link, um die Einladung anzunehmen.`,
    buttonText: "Einladung annehmen",
    buttonUrl: data.inviteUrl,
    footerNote: "Funktioniert der Button nicht? Kopiere diesen Link:",
  }

  return sendEmail({
    to: data.to,
    subject: `Einladung zu ${data.companyName} - MyDispatch`,
    content,
  })
}

