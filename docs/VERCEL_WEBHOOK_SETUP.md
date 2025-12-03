# Vercel Webhook Setup - MyDispatch

## Webhook-Konfiguration

### Webhook Secret
```
mbDmy0nOH2HjaK53lHX2gvLM
```

**WICHTIG:** Dieser Secret wird nur einmal angezeigt und muss sicher gespeichert werden!

### Webhook-Endpoint
```
https://v0-header-component-pink.vercel.app/api/webhooks/vercel
```

## Signatur-Verifizierung

Alle Vercel Webhook-Requests werden durch Signatur-Verifizierung abgesichert:

### Header
- `x-vercel-signature`: HMAC SHA1 Signatur des Request-Bodies

### Verifizierung
Die Signatur wird automatisch in `lib/webhooks/vercel-webhook.ts` verifiziert:

```typescript
import { verifyVercelWebhookSignature } from "@/lib/webhooks/vercel-webhook"

export async function POST(req: Request) {
  const isValid = await verifyVercelWebhookSignature(req)
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }
  // ... Webhook verarbeiten
}
```

## Environment Variable

Der Webhook Secret muss als Environment Variable gesetzt werden:

### In Vercel
1. Gehe zu Project Settings → Environment Variables
2. Füge hinzu:
   - **Name:** `VERCEL_WEBHOOK_SECRET`
   - **Value:** `mbDmy0nOH2HjaK53lHX2gvLM`
   - **Environment:** Production, Preview, Development

### In GitHub Secrets (für CI/CD)
1. Gehe zu Repository Settings → Secrets and variables → Actions
2. Füge hinzu:
   - **Name:** `VERCEL_WEBHOOK_SECRET`
   - **Value:** `mbDmy0nOH2HjaK53lHX2gvLM`

### Lokale Entwicklung
Füge in `.env.local` hinzu:
```env
VERCEL_WEBHOOK_SECRET=mbDmy0nOH2HjaK53lHX2gvLM
```

## Unterstützte Events

Der Webhook-Endpoint verarbeitet folgende Vercel Events:

- `deployment.created` - Neues Deployment gestartet
- `deployment.succeeded` - Deployment erfolgreich
- `deployment.failed` - Deployment fehlgeschlagen
- `deployment.error` - Deployment-Fehler
- `project.created` - Neues Projekt erstellt
- `project.updated` - Projekt aktualisiert

## Sicherheit

- ✅ Alle Requests werden durch HMAC SHA1 Signatur verifiziert
- ✅ Timing-safe comparison verhindert Timing-Angriffe
- ✅ Ungültige Signaturen werden abgelehnt (401 Unauthorized)
- ✅ Webhook Secret wird nie im Code committet

## Testing

### Webhook manuell testen

```bash
# Erstelle Test-Payload
PAYLOAD='{"type":"deployment.succeeded","deployment":{"id":"test-123"}}'

# Erstelle Signatur
SECRET="mbDmy0nOH2HjaK53lHX2gvLM"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$SECRET" | cut -d' ' -f2)

# Sende Request
curl -X POST https://v0-header-component-pink.vercel.app/api/webhooks/vercel \
  -H "Content-Type: application/json" \
  -H "x-vercel-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## Troubleshooting

### "Invalid signature" Fehler
- Prüfe, ob `VERCEL_WEBHOOK_SECRET` korrekt gesetzt ist
- Stelle sicher, dass der Secret in Vercel Webhook-Konfiguration übereinstimmt
- Prüfe, ob der `x-vercel-signature` Header vorhanden ist

### Webhook wird nicht empfangen
- Prüfe Vercel Webhook-Konfiguration
- Stelle sicher, dass die Endpoint-URL korrekt ist
- Prüfe Vercel Logs für Fehlermeldungen

