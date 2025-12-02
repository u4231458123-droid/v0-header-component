# Stripe Integration - MyDispatch

## Uebersicht

MyDispatch nutzt das **Stripe Zahlungssystem** fuer alle Abrechnungen:

- **Stripe Checkout**: Klassische Online-Zahlung direkt auf Stripe
- **Stripe Kundenportal**: Selbstverwaltung von Abonnements, Zahlungsmethoden und Rechnungen

## Konfiguration

### Stripe Account

| Attribut | Wert |
|----------|------|
| Account ID | `acct_1SX31ZIbAq3GlqKy` |
| Modus | Test (Sandbox) |

### Webhook

| Attribut | Wert |
|----------|------|
| Endpoint-URL | `https://v0-header-component-pink.vercel.app/api/webhooks/stripe` |
| Webhook ID | `ed_61T8f95pUnwqeulPH16T6Wm46pBC6XAqY80iP2Wf2DzsN` |
| Webhook Secret | `whsec_q3TIKGedquehiUdY1yU4mcrxWv9crxBx` |

### Benoetigte Webhook-Events

| Event | Beschreibung |
|-------|--------------|
| `checkout.session.completed` | Neue Subscription nach erfolgreicher Zahlung |
| `customer.subscription.created` | Subscription angelegt |
| `customer.subscription.updated` | Tarifwechsel oder Status-Aenderung |
| `customer.subscription.deleted` | Kuendigung |
| `invoice.payment_succeeded` | Zahlung erfolgreich |
| `invoice.payment_failed` | Zahlung fehlgeschlagen |

### Kundenportal (Billing Portal)

| Attribut | Wert |
|----------|------|
| Configuration ID | `bpc_1RxQ0jLX5M8TT990YlRPctFy` |
| API Endpoint | `/api/billing-portal` |

**Funktionen im Kundenportal:**
- Abonnement verwalten (Upgrade/Downgrade)
- Zahlungsmethode aendern (Kreditkarte, SEPA-Lastschrift)
- Rechnungshistorie einsehen und herunterladen
- Rechnungsadresse und USt-ID aktualisieren
- Abonnement kuendigen

## Tarife und Preise

### Aktuelle Tarife

| Tarif | Monatlich | Jaehrlich | Fahrer | Fahrzeuge |
|-------|-----------|-----------|--------|-----------|
| Starter | 39 EUR | 31.20 EUR/Monat | 3 | 3 |
| Business | 99 EUR | 79.20 EUR/Monat | unbegrenzt | unbegrenzt |
| Enterprise | Individuell | Individuell | unbegrenzt | unbegrenzt |

### Stripe Price IDs

| Tarif | Abrechnungszeitraum | Price ID |
|-------|---------------------|----------|
| Starter | Monatlich | `price_1SX5k8IbAq3GlqKyL1iRjVYe` |
| Starter | Jaehrlich | `price_1SX5kAIbAq3GlqKyin9YSNKA` |
| Business | Monatlich | `price_1SX5k9IbAq3GlqKyw7e64qjK` |
| Business | Jaehrlich | `price_1SX5k6IbAq3GlqKyOvsWSXqj` |
| Add-On | Monatlich | `price_1SX5kIIbAq3GlqKy9FYD3fKZ` |

## Environment Variables

| Variable | Beschreibung | Erforderlich |
|----------|--------------|--------------|
| `STRIPE_SECRET_KEY` | Stripe Secret Key | Ja |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Public Key | Ja |
| `STRIPE_WEBHOOK_SECRET` | Webhook Signing Secret | Ja |

**WICHTIG (seit v2.3.0):** 
Die Stripe Price IDs (`STRIPE_PRICE_*`) sind nicht mehr als Environment Variables erforderlich. Alle Price IDs sind jetzt hardcodiert in `lib/stripe-config.ts` und `lib/stripe-products.ts`, da wir die vollumfaengliche Stripe-Loesung mit Checkout und Kundenportal nutzen. Die Preise werden direkt von Stripe verwaltet.

## Zahlungsablauf

### 1. Registrierung mit Checkout

\`\`\`
Kunde -> Sign-Up -> Tarif waehlen -> Stripe Checkout -> Zahlung -> Webhook -> Account aktiviert
\`\`\`

1. Kunde waehlt Tarif im Sign-Up-Prozess
2. Weiterleitung zu Stripe Checkout
3. Kunde gibt Zahlungsdaten ein (Kreditkarte oder SEPA)
4. Nach erfolgreicher Zahlung: Webhook `checkout.session.completed`
5. System erstellt Subscription in Supabase
6. Kunde wird zum Dashboard weitergeleitet

### 2. Abonnement-Verwaltung via Kundenportal

\`\`\`
Kunde -> Einstellungen -> "Abonnement verwalten" -> Stripe Kundenportal
\`\`\`

1. Kunde klickt auf "Abonnement verwalten" in Einstellungen
2. API erstellt Billing Portal Session
3. Weiterleitung zum Stripe Kundenportal
4. Kunde kann:
   - Tarif wechseln
   - Zahlungsmethode aendern
   - Rechnungen einsehen
   - Kuendigen
5. Nach Aenderungen: Webhooks werden automatisch ausgeloest

## API Endpoints

### POST /api/billing-portal

Erstellt eine Billing Portal Session und gibt die URL zurueck.

**Request:**
\`\`\`json
{
  "returnUrl": "https://my-dispatch.de/einstellungen" // optional
}
\`\`\`

**Response:**
\`\`\`json
{
  "url": "https://billing.stripe.com/p/session/..."
}
\`\`\`

### POST /api/webhooks/stripe

Empfaengt Stripe Webhook Events und aktualisiert Supabase.

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `lib/stripe-config.ts` | Stripe-Konfiguration und Helper-Funktionen |
| `app/api/billing-portal/route.ts` | Billing Portal API |
| `app/api/webhooks/stripe/route.ts` | Webhook Handler |
| `actions/create-subscription.ts` | Checkout Session erstellen |
