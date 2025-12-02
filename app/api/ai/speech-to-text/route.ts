/**
 * Speech-to-Text API Route
 * Nutzt Hugging Face Whisper für Spracherkennung
 */

import { type NextRequest, NextResponse } from "next/server"
import { speechToText } from "@/lib/huggingface"

export async function POST(request: NextRequest) {
  try {
    const audioBlob = await request.blob()

    if (!audioBlob || audioBlob.size === 0) {
      return NextResponse.json({ error: "Keine Audio-Daten erhalten" }, { status: 400 })
    }

    const result = await speechToText(audioBlob)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Speech-to-Text Error:", error)
    return NextResponse.json({ error: "Spracherkennung fehlgeschlagen" }, { status: 500 })
  }
}
