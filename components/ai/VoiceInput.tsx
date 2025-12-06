"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"

/**
 * Voice Input Component
 * Erlaubt Spracheingabe für Fahrer (Hands-Free)
 */

interface VoiceInputProps {
  onTranscript: (text: string) => void
  placeholder?: string
  className?: string
}

export function VoiceInput({ onTranscript, placeholder = "Tippen oder Sprechen...", className = "" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [text, setText] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)

        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })

          // API-Call für Speech-to-Text
          const response = await fetch("/api/ai/speech-to-text", {
            method: "POST",
            body: audioBlob,
          })

          if (response.ok) {
            const result = await response.json()
            setText(result.text)
            onTranscript(result.text)
          }
        } catch (error) {
          console.error("Speech-to-Text Fehler:", error)
        } finally {
          setIsProcessing(false)
        }

        // Stream stoppen
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Mikrofon-Zugriff fehlgeschlagen:", error)
    }
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    onTranscript(e.target.value)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-14 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
        disabled={isRecording || isProcessing}
      />

      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
          isRecording
            ? "bg-destructive text-destructive-foreground animate-pulse"
            : isProcessing
              ? "bg-muted text-muted-foreground"
              : "bg-muted text-foreground hover:bg-border"
        }`}
      >
        {isProcessing ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>

      {isRecording && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-destructive text-sm">
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          Aufnahme...
        </div>
      )}
    </div>
  )
}
