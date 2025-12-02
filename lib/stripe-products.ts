export const STRIPE_PRODUCTS = {
  starter: {
    productId: "prod_TU3ryPTqP8kDrX",
    monthlyPriceId: "price_1SX5k8IbAq3GlqKyL1iRjVYe",
    yearlyPriceId: "price_1SX5kAIbAq3GlqKyin9YSNKA",
    name: "MyDispatch Starter",
    monthlyPrice: 39,
    yearlyPrice: 31.2, // 20% Rabatt
    currency: "EUR",
    features: [
      "Bis zu 3 Fahrzeuge",
      "Bis zu 3 Fahrer",
      "Unbegrenzte Buchungen",
      "Kundenverwaltung",
      "Basis-Reporting",
      "GoBD-konforme Rechnungen",
      "E-Mail Support",
      "Mobile App Zugang",
    ],
  },
  business: {
    productId: "prod_TU3rpuy8ducEkL",
    monthlyPriceId: "price_1SX5k9IbAq3GlqKyw7e64qjK",
    yearlyPriceId: "price_1SX5k6IbAq3GlqKyOvsWSXqj",
    name: "MyDispatch Business",
    monthlyPrice: 129, // Korrigiert: Tatsaechlicher Stripe-Preis
    yearlyPrice: 103.2, // 20% Rabatt (129 * 0.8 = 103.2) - angepasst an Stripe
    currency: "EUR",
    features: [
      "Unbegrenzte Fahrzeuge",
      "Unbegrenzte Fahrer",
      "Unbegrenzte Buchungen",
      "Kundenverwaltung mit CRM",
      "Erweiterte Reports & Analytics",
      "Rechnungserstellung & Mahnwesen",
      "TSE-Vorbereitung",
      "API-Zugang",
      "Priority Support (24h)",
      "Smartphone-App für Fahrer",
      "Custom Branding",
    ],
  },
  enterprise: {
    productId: "prod_TU3l6pQlNOGfuQ",
    monthlyPriceId: null,
    yearlyPriceId: null,
    name: "MyDispatch Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    currency: "EUR",
    features: [
      "Unbegrenzte Fahrzeuge",
      "Unbegrenzte Fahrer",
      "Alle Business Features",
      "White-Label-Option",
      "Dedizierter Account Manager",
      "Telefon-Support 24/7",
      "SLA 99.9% Uptime-Garantie",
      "Custom Integrationen",
      "Individuelle Schulungen",
    ],
  },
  addon: {
    productId: "prod_TU3ryoZe5QJrMP",
    priceId: "price_1SX5kIIbAq3GlqKy9FYD3fKZ",
    name: "Fleet & Driver Add-On",
    price: 9,
    currency: "EUR",
    description: "Zusätzlicher Fahrer inkl. 1 Fahrzeug für Starter-Tarif",
  },
} as const

export type PlanTier = "starter" | "business" | "enterprise"
export type BillingInterval = "monthly" | "yearly"
