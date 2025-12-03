/**
 * Vercel Webhook Endpoint
 * =======================
 * Empfängt Webhooks von Vercel (Deployments, Builds, etc.)
 * 
 * Webhook Secret: mbDmy0nOH2HjaK53lHX2gvLM
 * Header: x-vercel-signature
 */

import { NextResponse } from "next/server"
import { verifyVercelWebhookSignature } from "@/lib/webhooks/vercel-webhook"

export async function POST(req: Request) {
  try {
    // Verifiziere Webhook-Signatur
    const isValid = await verifyVercelWebhookSignature(req)
    
    if (!isValid) {
      console.error("Ungültige Vercel Webhook-Signatur")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Parse Webhook-Payload
    const payload = await req.json()
    const eventType = payload.type || payload.event

    console.log(`[Vercel Webhook] Event empfangen: ${eventType}`, {
      id: payload.id,
      deploymentId: payload.deployment?.id,
      projectId: payload.project?.id,
      timestamp: new Date().toISOString(),
    })

    // Verarbeite verschiedene Event-Typen
    switch (eventType) {
      case "deployment.created":
      case "deployment.succeeded":
      case "deployment.failed":
      case "deployment.error":
        // Deployment-Events verarbeiten
        await handleDeploymentEvent(payload)
        break

      case "project.created":
      case "project.updated":
        // Projekt-Events verarbeiten
        await handleProjectEvent(payload)
        break

      default:
        console.log(`[Vercel Webhook] Unbekannter Event-Typ: ${eventType}`)
    }

    return NextResponse.json({ 
      received: true,
      event: eventType,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Vercel Webhook] Fehler:", error)
    return NextResponse.json(
      { error: "Webhook handler failed", message: error.message },
      { status: 500 }
    )
  }
}

/**
 * Verarbeitet Deployment-Events
 */
async function handleDeploymentEvent(payload: any) {
  const deployment = payload.deployment || payload
  const status = deployment.readyState || deployment.state

  console.log(`[Vercel Webhook] Deployment ${status}:`, {
    id: deployment.id,
    url: deployment.url,
    projectId: deployment.projectId,
    target: deployment.target,
  })

  // Hier können weitere Aktionen durchgeführt werden:
  // - Notifications senden
  // - Status in Datenbank speichern
  // - CI/CD Pipeline triggern
  // - Monitoring aktualisieren
}

/**
 * Verarbeitet Projekt-Events
 */
async function handleProjectEvent(payload: any) {
  const project = payload.project || payload

  console.log(`[Vercel Webhook] Projekt-Event:`, {
    id: project.id,
    name: project.name,
    teamId: project.teamId,
  })

  // Hier können weitere Aktionen durchgeführt werden:
  // - Projekt-Konfiguration synchronisieren
  // - Environment Variables validieren
}

