/**
 * Hugging Face Integration - Konfiguration
 * MyDispatch AI Enhancement
 */

// API Key - set via environment variable HUGGINGFACE_API_KEY
// Warning nur zur Laufzeit wenn tatsächlich gebraucht, nicht beim Build
export const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

// Helper um zu prüfen ob API Key gesetzt ist
export function isHuggingFaceConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY
}

// Base URLs
export const HF_INFERENCE_API = "https://api-inference.huggingface.co/models"

// Modelle für verschiedene Tasks
export const HF_MODELS = {
  // Sentiment-Analyse (Kundenbewertungen)
  sentiment: "nlptown/bert-base-multilingual-uncased-sentiment",

  // Text-Klassifizierung (Support-Tickets)
  classification: "facebook/bart-large-mnli",

  // Übersetzung DE <-> EN
  translationDeEn: "Helsinki-NLP/opus-mt-de-en",
  translationEnDe: "Helsinki-NLP/opus-mt-en-de",

  // Mehrsprachige Übersetzung
  translationMulti: "facebook/mbart-large-50-many-to-many-mmt",

  // Zusammenfassung (Lange Texte)
  summarization: "facebook/bart-large-cnn",

  // Named Entity Recognition (Adressen, Namen)
  ner: "dslim/bert-base-NER",

  // Speech-to-Text (Fahrer Spracheingabe)
  speechToText: "openai/whisper-large-v3",

  // OCR (Dokumentenerkennung)
  ocr: "microsoft/trocr-large-printed",

  // Bildklassifizierung (Fahrzeugschäden)
  imageClassification: "google/vit-base-patch16-224",

  // Zero-Shot Classification
  zeroShot: "facebook/bart-large-mnli",
} as const

// Support-Ticket-Kategorien
export const TICKET_CATEGORIES = [
  "Rechnung/Zahlung",
  "Technisches Problem",
  "Buchung/Stornierung",
  "Fahrer-Beschwerde",
  "Allgemeine Anfrage",
  "Preisanfrage",
  "Partnerschaft",
] as const

// Sentiment Labels
export const SENTIMENT_LABELS = {
  1: { label: "Sehr negativ", color: "#EF4444" },
  2: { label: "Negativ", color: "#F97316" },
  3: { label: "Neutral", color: "#6B7280" },
  4: { label: "Positiv", color: "#22C55E" },
  5: { label: "Sehr positiv", color: "#10B981" },
} as const
