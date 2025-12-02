# Hugging Face Integration - MyDispatch

## Version 1.6.0 | Stand: 25.11.2025

---

## API-Key

\`\`\`
HUGGINGFACE_API_KEY=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
\`\`\`

**WICHTIG:** In Vercel als Environment Variable speichern!

---

## Übersicht

Hugging Face erweitert MyDispatch um spezialisierte AI-Funktionen:

| Feature | Modell | Verwendung |
|---------|--------|------------|
| Sentiment-Analyse | bert-multilingual-sentiment | Kundenbewertungen analysieren |
| Ticket-Klassifizierung | bart-large-mnli | Support-Tickets automatisch kategorisieren |
| Übersetzung | opus-mt-de-en | Mehrsprachige Kundenunterstützung |
| Zusammenfassung | bart-large-cnn | Lange Texte zusammenfassen |
| Named Entity Recognition | bert-base-NER | Adressen, Namen, Orte extrahieren |
| Speech-to-Text | whisper-large-v3 | Spracheingabe für Fahrer |
| Bild-Klassifizierung | vit-base-patch16 | Fahrzeugschäden erkennen |

---

## Funktionen

### 1. Sentiment-Analyse (Kundenbewertungen)

Analysiert die Stimmung von Kundenfeedback auf einer Skala von 1-5 Sternen.

\`\`\`tsx
import { analyzeSentiment } from '@/lib/huggingface'

const result = await analyzeSentiment("Der Service war hervorragend!")
// { score: 5, label: "Sehr positiv", color: "#10B981", confidence: 0.92 }
\`\`\`

**Verwendung:**
- Automatische Bewertung von Kundenfeedback
- Frühwarnsystem für negative Stimmung
- Qualitätskontrolle

---

### 2. Ticket-Klassifizierung

Kategorisiert Support-Tickets automatisch in vordefinierte Kategorien.

\`\`\`tsx
import { classifyTicket } from '@/lib/huggingface'

const result = await classifyTicket("Ich habe meine Rechnung nicht erhalten")
// { category: "Rechnung/Zahlung", confidence: 0.87 }
\`\`\`

**Kategorien:**
- Rechnung/Zahlung
- Technisches Problem
- Buchung/Stornierung
- Fahrer-Beschwerde
- Allgemeine Anfrage
- Preisanfrage
- Partnerschaft

---

### 3. Übersetzung (DE <-> EN)

Übersetzt Texte zwischen Deutsch und Englisch.

\`\`\`tsx
import { translateText } from '@/lib/huggingface'

// Deutsch -> Englisch
const result1 = await translateText("Guten Tag, wie kann ich Ihnen helfen?", "de-en")
// { translatedText: "Good day, how can I help you?" }

// Englisch -> Deutsch
const result2 = await translateText("Thank you for your booking", "en-de")
// { translatedText: "Vielen Dank für Ihre Buchung" }
\`\`\`

---

### 4. Text-Zusammenfassung

Fasst lange Texte automatisch zusammen.

\`\`\`tsx
import { summarizeText } from '@/lib/huggingface'

const longText = "..." // Lange Kundenbeschwerde
const result = await summarizeText(longText, 150, 30)
// { summary: "...", compressionRatio: 75 }
\`\`\`

---

### 5. Named Entity Recognition

Extrahiert Personen, Orte und Organisationen aus Text.

\`\`\`tsx
import { extractEntities } from '@/lib/huggingface'

const result = await extractEntities("Herr Müller aus Berlin kontaktierte uns.")
// { persons: ["Müller"], locations: ["Berlin"], organizations: [] }
\`\`\`

---

### 6. Speech-to-Text (Fahrer)

Konvertiert Spracheingaben zu Text für freihändiges Arbeiten.

\`\`\`tsx
import { VoiceInput } from '@/components/ai'

<VoiceInput 
  onTranscript={(text) => setAddress(text)}
  placeholder="Adresse sprechen oder tippen..."
/>
\`\`\`

---

## Komponenten

### SentimentBadge

Zeigt Sentiment-Ergebnisse visuell an.

\`\`\`tsx
import { SentimentBadge } from '@/components/ai'

<SentimentBadge 
  score={4} 
  label="Positiv" 
  color="#22C55E" 
  confidence={0.85} 
/>
\`\`\`

### TicketCategoryBadge

Zeigt Ticket-Kategorien mit Icon und Farbe.

\`\`\`tsx
import { TicketCategoryBadge } from '@/components/ai'

<TicketCategoryBadge 
  category="Technisches Problem" 
  confidence={0.92} 
/>
\`\`\`

### VoiceInput

Spracheingabe-Feld für Fahrer.

\`\`\`tsx
import { VoiceInput } from '@/components/ai'

<VoiceInput 
  onTranscript={(text) => console.log(text)}
  placeholder="Sprechen Sie..."
/>
\`\`\`

---

## API Endpoints

### POST /api/ai/analyze

Allgemeine Analyse-API für verschiedene Funktionen.

**Request:**
\`\`\`json
{
  "action": "sentiment" | "classify" | "translate" | "summarize" | "entities",
  "text": "Der Text zum Analysieren",
  "options": {
    "direction": "de-en",  // für translate
    "maxLength": 150       // für summarize
  }
}
\`\`\`

### POST /api/ai/speech-to-text

Speech-to-Text API für Audio-Uploads.

**Request:** Audio-Blob (audio/webm)

**Response:**
\`\`\`json
{
  "text": "Der erkannte Text",
  "language": "de"
}
\`\`\`

---

## Architektur

\`\`\`
lib/huggingface/
├── config.ts       # API-Key, Modelle, Konfiguration
├── inference.ts    # Alle AI-Funktionen
└── index.ts        # Export

components/ai/
├── SentimentBadge.tsx
├── TicketCategoryBadge.tsx
├── VoiceInput.tsx
└── index.ts

app/api/ai/
├── analyze/route.ts       # Text-Analyse API
└── speech-to-text/route.ts # Audio-to-Text API
\`\`\`

---

## Anwendungsfälle

### 1. Support-Dashboard

- Tickets automatisch kategorisieren
- Priorität basierend auf Sentiment
- Zusammenfassung langer Beschwerden

### 2. Kundenfeedback

- Bewertungen analysieren
- Trends erkennen
- Negative Stimmung früh erkennen

### 3. Fahrerportal

- Freihändige Adresseingabe
- Sprachnotizen erstellen
- Navigationsanweisungen diktieren

### 4. Internationaler Support

- Kundenanfragen übersetzen
- Mehrsprachige Antworten

---

## Kosten

Hugging Face Inference API:
- **Free Tier**: 30.000 Requests/Monat
- **Pro**: $9/Monat (unlimited)

**Empfehlung:** Free Tier reicht für Start, Pro für Produktion

---

## Changelog

| Datum | Version | Änderung |
|-------|---------|----------|
| 25.11.2025 | 1.6.0 | Hugging Face Integration erstellt |
\`\`\`

\`\`\`ts file="" isHidden
