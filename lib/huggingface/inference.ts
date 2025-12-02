/**
 * Hugging Face Inference API
 * Alle AI-Funktionen für MyDispatch
 */

import { HF_API_KEY, HF_INFERENCE_API, HF_MODELS, TICKET_CATEGORIES, SENTIMENT_LABELS } from "./config"

// Helper für API-Calls
async function hfQuery(model: string, payload: Record<string, unknown>) {
  const response = await fetch(`${HF_INFERENCE_API}/${model}`, {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Hugging Face API Error: ${error}`)
  }

  return response.json()
}

// ============================================
// SENTIMENT-ANALYSE
// ============================================

export interface SentimentResult {
  score: number // 1-5
  label: string
  color: string
  confidence: number
}

/**
 * Analysiert die Stimmung eines Textes (z.B. Kundenbewertung)
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const result = await hfQuery(HF_MODELS.sentiment, { inputs: text })

  // Das Modell gibt ein Array mit Scores für 1-5 Sterne zurück
  const scores = result[0] as Array<{ label: string; score: number }>
  const topResult = scores.reduce((a, b) => (a.score > b.score ? a : b))
  const starRating = Number.parseInt(topResult.label.replace(" stars", "").replace(" star", ""))

  return {
    score: starRating,
    label: SENTIMENT_LABELS[starRating as keyof typeof SENTIMENT_LABELS].label,
    color: SENTIMENT_LABELS[starRating as keyof typeof SENTIMENT_LABELS].color,
    confidence: topResult.score,
  }
}

// ============================================
// TICKET-KLASSIFIZIERUNG
// ============================================

export interface ClassificationResult {
  category: string
  confidence: number
  allScores: Array<{ label: string; score: number }>
}

/**
 * Klassifiziert Support-Tickets automatisch
 */
export async function classifyTicket(text: string): Promise<ClassificationResult> {
  const result = await hfQuery(HF_MODELS.zeroShot, {
    inputs: text,
    parameters: {
      candidate_labels: TICKET_CATEGORIES,
    },
  })

  const sortedScores = result.labels
    .map((label: string, i: number) => ({
      label,
      score: result.scores[i],
    }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)

  return {
    category: sortedScores[0].label,
    confidence: sortedScores[0].score,
    allScores: sortedScores,
  }
}

// ============================================
// ÜBERSETZUNG
// ============================================

export interface TranslationResult {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
}

/**
 * Übersetzt Text zwischen Deutsch und Englisch
 */
export async function translateText(text: string, direction: "de-en" | "en-de"): Promise<TranslationResult> {
  const model = direction === "de-en" ? HF_MODELS.translationDeEn : HF_MODELS.translationEnDe

  const result = await hfQuery(model, { inputs: text })

  return {
    translatedText: result[0].translation_text,
    sourceLanguage: direction === "de-en" ? "Deutsch" : "English",
    targetLanguage: direction === "de-en" ? "English" : "Deutsch",
  }
}

// ============================================
// ZUSAMMENFASSUNG
// ============================================

export interface SummaryResult {
  summary: string
  originalLength: number
  summaryLength: number
  compressionRatio: number
}

/**
 * Fasst lange Texte zusammen (z.B. Kundenbeschwerden, Feedback)
 */
export async function summarizeText(text: string, maxLength = 150, minLength = 30): Promise<SummaryResult> {
  const result = await hfQuery(HF_MODELS.summarization, {
    inputs: text,
    parameters: {
      max_length: maxLength,
      min_length: minLength,
      do_sample: false,
    },
  })

  const summary = result[0].summary_text

  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
    compressionRatio: Math.round((1 - summary.length / text.length) * 100),
  }
}

// ============================================
// NAMED ENTITY RECOGNITION
// ============================================

export interface Entity {
  entity: string
  word: string
  score: number
  start: number
  end: number
}

export interface NERResult {
  entities: Entity[]
  persons: string[]
  organizations: string[]
  locations: string[]
}

/**
 * Extrahiert benannte Entitäten aus Text (Namen, Orte, Organisationen)
 */
export async function extractEntities(text: string): Promise<NERResult> {
  const result = (await hfQuery(HF_MODELS.ner, { inputs: text })) as Entity[]

  const persons = result.filter((e) => e.entity.includes("PER")).map((e) => e.word.replace("##", ""))

  const organizations = result.filter((e) => e.entity.includes("ORG")).map((e) => e.word.replace("##", ""))

  const locations = result.filter((e) => e.entity.includes("LOC")).map((e) => e.word.replace("##", ""))

  return {
    entities: result,
    persons: [...new Set(persons)],
    organizations: [...new Set(organizations)],
    locations: [...new Set(locations)],
  }
}

// ============================================
// SPEECH-TO-TEXT
// ============================================

export interface SpeechToTextResult {
  text: string
  language: string
}

/**
 * Konvertiert Sprache zu Text (für Fahrer-Eingaben)
 */
export async function speechToText(audioBlob: Blob): Promise<SpeechToTextResult> {
  const response = await fetch(`${HF_INFERENCE_API}/${HF_MODELS.speechToText}`, {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    method: "POST",
    body: audioBlob,
  })

  if (!response.ok) {
    throw new Error("Speech-to-Text fehlgeschlagen")
  }

  const result = await response.json()

  return {
    text: result.text,
    language: result.language || "de",
  }
}

// ============================================
// BILD-KLASSIFIZIERUNG
// ============================================

export interface ImageClassificationResult {
  label: string
  score: number
  allLabels: Array<{ label: string; score: number }>
}

/**
 * Klassifiziert Bilder (z.B. Fahrzeugschäden)
 */
export async function classifyImage(imageBlob: Blob): Promise<ImageClassificationResult> {
  const response = await fetch(`${HF_INFERENCE_API}/${HF_MODELS.imageClassification}`, {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    method: "POST",
    body: imageBlob,
  })

  if (!response.ok) {
    throw new Error("Bild-Klassifizierung fehlgeschlagen")
  }

  const result = (await response.json()) as Array<{ label: string; score: number }>

  return {
    label: result[0].label,
    score: result[0].score,
    allLabels: result,
  }
}

// ============================================
// EXPORT
// ============================================

export { HF_API_KEY, HF_MODELS, TICKET_CATEGORIES, SENTIMENT_LABELS }
