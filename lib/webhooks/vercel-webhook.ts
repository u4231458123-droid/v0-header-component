/**
 * Vercel Webhook Signature Verification
 * ======================================
 * Verifiziert die Authentizität von Vercel Webhook-Requests
 * 
 * Secret: mbDmy0nOH2HjaK53lHX2gvLM
 * Header: x-vercel-signature
 */

import crypto from "crypto"

/**
 * Verifiziert die Vercel Webhook-Signatur
 * @param req - Request-Objekt mit Headers und Body
 * @returns true wenn Signatur gültig ist, false sonst
 */
export async function verifyVercelWebhookSignature(req: Request): Promise<boolean> {
  const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET || "mbDmy0nOH2HjaK53lHX2gvLM"
  
  if (!webhookSecret) {
    console.error("VERCEL_WEBHOOK_SECRET ist nicht gesetzt")
    return false
  }

  try {
    // Lade den Request-Body als Text
    const payload = await req.text()
    
    // Hole die Signatur aus dem Header
    const signature = req.headers.get("x-vercel-signature")
    
    if (!signature) {
      console.error("x-vercel-signature Header fehlt")
      return false
    }

    // Erstelle HMAC SHA1 Hash
    const expectedSignature = crypto
      .createHmac("sha1", webhookSecret)
      .update(payload)
      .digest("hex")

    // Vergleiche Signaturen (timing-safe comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )

    if (!isValid) {
      console.error("Webhook-Signatur-Verifizierung fehlgeschlagen")
      return false
    }

    return true
  } catch (error) {
    console.error("Fehler bei Webhook-Signatur-Verifizierung:", error)
    return false
  }
}

/**
 * Middleware-Funktion für Vercel Webhook-Endpunkte
 * Wirft einen Fehler wenn Signatur ungültig ist
 */
export async function requireVercelWebhookSignature(req: Request): Promise<void> {
  const isValid = await verifyVercelWebhookSignature(req)
  
  if (!isValid) {
    throw new Error("Invalid Vercel webhook signature")
  }
}

