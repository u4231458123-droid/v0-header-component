# AI Integration - MyDispatch

## Version 1.6.0 | Stand: 02.12.2025

---

## API-Keys

### Google Gemini API
```
GEMINI_API_KEY=[Ihr-Gemini-API-Key]
```

### Anthropic Claude API
```
ANTHROPIC_API_KEY=[Ihr-Anthropic-API-Key]
```

**WICHTIG:** Diese Keys in Vercel als Environment Variables speichern!

---

## Übersicht

MyDispatch nutzt modernste KI-Modelle für verschiedene Aufgabenbereiche:

| Bereich | Bot-Name | Zweck | Farbe |
|---------|----------|-------|-------|
| Pre-Login | LeadChatWidget | Lead-Generierung, Produkt-Beratung | Blau (#0066FF) |
| Dashboard | DashboardHelpBot | Hilfe für Unternehmer | Grün (#10B981) |
| Fahrerportal | DriverHelpBot | Fahrer-Unterstützung | Orange (#F59E0B) |
| Kundenportal | CustomerHelpBot | Buchungs-Hilfe | Violett (#8B5CF6) |

---

## Architektur

### AI SDK v5 (Vercel) & Google Generative AI

```
lib/ai/
├── config.ts          # Models, System Prompts
├── models-optimized.ts # Detaillierte Modell-Konfigurationen
└── huggingface-optimized.ts # Universal Client (HuggingFace + Gemini)

app/api/ai/
└── chat/route.ts      # Streaming Chat API

components/ai/
├── ChatWidget.tsx     # Base Chat Component
├── LeadChatWidget.tsx # Pre-Login Bot
├── DashboardHelpBot.tsx
├── DriverHelpBot.tsx
└── CustomerHelpBot.tsx
```

### Models

| Model | Verwendung | Anbieter |
|-------|------------|----------|
| google/gemini-2.0-flash-001 | Standard-Chat, Schnell | Google |
| google/gemini-2.0-flash-thinking-exp-01-21 | Reasoning Tasks, Komplex | Google |
| anthropic/claude-3-5-sonnet-20240620 | Komplexe Analysen | Anthropic |

---

## Verwendung

### Pre-Login Seiten (Homepage, Pricing, etc.)

```tsx
import { LeadChatWidget } from '@/components/ai'

export default function HomePage() {
  return (
    <>
      {/* ... Seiteninhalt ... */}
      <LeadChatWidget />
    </>
  )
}
```

### Dashboard (nach Login)

```tsx
import { DashboardHelpBot } from '@/components/ai'

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <DashboardHelpBot />
    </>
  )
}
```

### Fahrerportal

```tsx
import { DriverHelpBot } from '@/components/ai'

export default function FahrerPortalPage() {
  return (
    <>
      {/* ... Portal-Inhalt ... */}
      <DriverHelpBot />
    </>
  )
}
```

### Kundenportal

```tsx
import { CustomerHelpBot } from '@/components/ai'

export default function KundenPortalPage() {
  return (
    <>
      {/* ... Buchungsformular ... */}
      <CustomerHelpBot />
    </>
  )
}
```

---

## System Prompts

Die System Prompts sind in `lib/ai/config.ts` definiert und decken folgende Bereiche ab:

### Lead/Support Bot (Pre-Login)
- Beantwortet Produktfragen
- Erklärt Tarife (Starter, Business, Enterprise)
- Sammelt Lead-Informationen
- Verweist auf Vertrieb bei komplexen Anfragen

### Dashboard Help Bot (Unternehmer)
- Erklärt Dashboard-Funktionen
- Gibt Schritt-für-Schritt-Anleitungen
- Hilft bei Auftragsverwaltung, Fahrer, Fahrzeuge, Kunden
- Tipps zur Geschäftsoptimierung

### Driver Help Bot (Fahrer)
- Erklärt Auftragsannahme
- Hilft bei Navigation
- Status-Updates erklären

### Customer Help Bot (Kunden)
- Buchungsprozess erklären
- Fragen zu Preisen/Verfügbarkeit
- Stornierungen erklären

---

## API Endpoint

### POST /api/ai/chat

**Request:**
```json
{
  "messages": [...],
  "context": "lead" | "dashboard" | "driver" | "customer"
}
```

**Response:** Server-Sent Events (SSE) Stream

---

## Konfiguration

### Environment Variables

```env
# Google Gemini (via Vercel AI Gateway oder direkt)
GEMINI_API_KEY=AIzaSy...

# Anthropic Claude (via Vercel AI Gateway)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Modell ändern

In `lib/ai/config.ts`:

```ts
export const AI_MODELS = {
  default: 'google/gemini-2.0-flash-001',      // Schnell, effizient
  advanced: 'google/gemini-2.0-flash-thinking-exp-01-21', // Komplexes Reasoning
  fast: 'google/gemini-2.0-flash-001',
  reasoning: 'google/gemini-2.0-flash-thinking-exp-01-21',
}
```

---

## Kosten-Schätzung

| Model | Input (1M tokens) | Output (1M tokens) |
|-------|-------------------|---------------------|
| gemini-2.0-flash | Kostenlos (bis Limit) | Kostenlos (bis Limit) |
| gemini-2.0-flash-thinking | Kostenlos (Preview) | Kostenlos (Preview) |
| claude-3-5-sonnet | ~$3.00 | ~$15.00 |

**Empfehlung:** Gemini 2.0 Flash für Standard-Chat (sehr schnell und effizient).

---

## Sicherheit

1. **API-Keys niemals im Frontend**
2. **Rate Limiting** im API-Route implementieren
3. **Content Moderation** bei Bedarf aktivieren
4. **Logging** für Audit-Zwecke

---

## Changelog

| Datum | Version | Änderung |
|-------|---------|----------|
| 02.12.2025 | 1.6.0 | Gemini Integration, OpenAI entfernt |
| 25.11.2025 | 1.5.0 | AI Integration erstellt |
