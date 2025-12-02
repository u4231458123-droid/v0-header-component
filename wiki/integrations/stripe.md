# Stripe Integration - MyDispatch

## API-Keys

| Variable | Wert |
|----------|------|
| `STRIPE_SECRET_KEY` | (In v0 Vars) |
| `STRIPE_PUBLISHABLE_KEY` | (In v0 Vars) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (In v0 Vars) |

## Price IDs (Environment Variables)

| Variable | Price ID | Produkt | Preis |
|----------|----------|---------|-------|
| `STRIPE_PRICE_STARTER_MONTHLY` | `price_1SX5k8IbAq3GlqKyL1iRjVYe` | MyDispatch Starter | 39,00 EUR/Monat |
| `STRIPE_PRICE_STARTER_YEARLY` | `price_1SX5kAIbAq3GlqKyin9YSNKA` | MyDispatch Starter | 31,20 EUR/Monat (jährlich) |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | `price_1SX5k9IbAq3GlqKyw7e64qjK` | MyDispatch Business | 129,00 EUR/Monat |
| `STRIPE_PRICE_BUSINESS_YEARLY` | `price_1SX5k6IbAq3GlqKyOvsWSXqj` | MyDispatch Business | 103,20 EUR/Monat (jährlich) |
| `STRIPE_PRICE_ADDON` | `price_1SX5kIIbAq3GlqKy9FYD3fKZ` | Fleet & Driver Add-On | 9,00 EUR/Monat |

## Produkte

| Produkt ID | Name | Beschreibung |
|------------|------|--------------|
| `prod_TU3ryPTqP8kDrX` | MyDispatch Starter | Bis zu 5 Fahrer, 5 Fahrzeuge |
| `prod_TU3rpuy8ducEkL` | MyDispatch Business | Bis zu 20 Fahrer, erweiterte Features |
| `prod_TU3ryoZe5QJrMP` | Fleet & Driver Add-On | +1 Fahrer inkl. 1 Fahrzeug |
| `prod_TU3l30eIjo0byK` | MyDispatch Basic | Bis zu 3 Fahrzeuge, 5 Fahrer |
| `prod_TU3l5kRqqQazr7` | MyDispatch Professional | Bis zu 15 Fahrzeuge, 25 Fahrer |
| `prod_TU3l6pQlNOGfuQ` | MyDispatch Enterprise | Unbegrenzt, White-Label, SLA 99.9% |

## Tariflogik

### Starter (39 EUR/Monat oder 31,20 EUR/Monat jährlich)
- Max. 5 Fahrer
- Max. 5 Fahrzeuge
- Unbegrenzte Buchungen
- Basis-Statistiken
- E-Mail-Support

### Business (129 EUR/Monat oder 103,20 EUR/Monat jährlich)
- Max. 20 Fahrer
- Max. 20 Fahrzeuge
- Unbegrenzte Buchungen
- Erweiterte Statistiken
- API-Zugang
- Priority Support

### Add-On (9 EUR/Monat pro zusätzlichem Fahrer)
- +1 Fahrer
- +1 Fahrzeug
- Nur für Starter-Tarif

## Integration in Code

\`\`\`typescript
// lib/stripe/config.ts
export const STRIPE_PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
  },
  addon: process.env.STRIPE_PRICE_ADDON,
}
\`\`\`

## Letzte Aktualisierung

- Datum: 2025-11-25
- Version: 1.9.0
