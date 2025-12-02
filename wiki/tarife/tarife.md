# Tarifstruktur

## Übersicht

MyDispatch bietet drei Tarife für unterschiedliche Unternehmensgrößen.

## Tarife im Detail

### Starter - 49€/Monat

**Zielgruppe:** Kleine Unternehmen und Einsteiger

| Feature | Wert |
|---------|------|
| Fahrer | Bis zu 5 |
| Fahrzeuge | Bis zu 5 |
| Buchungsverwaltung | Ja |
| Kundenverwaltung | Ja |
| Landingpage | Ja |
| Buchungswidget | Nein |
| API-Zugang | Nein |
| Support | E-Mail |

**Add-On verfügbar:** Fleet & Driver (+9€/Monat für +1 Fahrer und +1 Fahrzeug)

### Business - 99€/Monat

**Zielgruppe:** Wachsende Unternehmen

| Feature | Wert |
|---------|------|
| Fahrer | Bis zu 20 |
| Fahrzeuge | Bis zu 20 |
| Alle Starter-Features | Ja |
| Buchungswidget | Ja |
| API-Zugang | Ja |
| Custom Branding | Ja |
| Erweiterte Statistiken | Ja |
| Support | E-Mail + Telefon |

### Enterprise - Individuell

**Zielgruppe:** Große Flotten und Zentralen

| Feature | Wert |
|---------|------|
| Fahrer | Unbegrenzt |
| Fahrzeuge | Unbegrenzt |
| Alle Business-Features | Ja |
| White-Label | Ja |
| Custom Integrationen | Ja |
| Dedizierter Account Manager | Ja |
| SLA Garantie | Ja |
| Support | 24/7 Premium |

## Jährliche Zahlung

Bei jährlicher Zahlung: **-20% Rabatt**

| Tarif | Monatlich | Jährlich | Ersparnis |
|-------|-----------|----------|-----------|
| Starter | 49€ | 470€ | 118€/Jahr |
| Business | 99€ | 950€ | 238€/Jahr |
| Enterprise | Individuell | Individuell | - |

## Stripe-Integration

### Produkt-IDs

\`\`\`typescript
STARTER_MONTHLY = "price_xxx"
STARTER_YEARLY = "price_xxx"
BUSINESS_MONTHLY = "price_xxx"
BUSINESS_YEARLY = "price_xxx"
FLEET_ADDON = "price_xxx"
\`\`\`

### Checkout-Flow

1. Benutzer wählt Tarif auf /pricing
2. Weiterleitung zu /auth/sign-up mit Tarif-Parameter
3. Multi-Step-Formular (Firmendaten, Kontakt, Zahlung)
4. Stripe Checkout Session erstellen
5. Weiterleitung zu Stripe
6. Stripe Webhook verarbeitet Zahlung
7. Account wird aktiviert
8. Weiterleitung zum Dashboard

### Webhook-Events

- `checkout.session.completed` - Neues Abo aktivieren
- `invoice.paid` - Zahlung bestätigen
- `customer.subscription.updated` - Abo-Änderungen
- `customer.subscription.deleted` - Abo kündigen
