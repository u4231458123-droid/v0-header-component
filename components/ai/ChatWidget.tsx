"use client"
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react"
import { cn } from "@/lib/utils"

// Message interface für den Chat
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

// Custom useChat Hook (vereinfachte Version für das neue AI SDK)
function useChat(options: { api: string; body?: Record<string, unknown> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const append = async (message: { role: "user" | "assistant"; content: string }) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: message.role,
      content: message.content,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(options.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          ...options.body,
        }),
      })

      if (!response.ok) throw new Error("API Error")

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || data.content || "Keine Antwort erhalten.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await append({ role: "user", content: input })
  }

  return { messages, input, handleInputChange, handleSubmit, isLoading, append }
}

// Inline SVG Icons
const MessageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
)

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
)

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
)

interface ChatWidgetProps {
  context: "lead" | "dashboard" | "driver" | "customer"
  title?: string
  subtitle?: string
  position?: "bottom-right" | "bottom-left"
}

function formatMessage(content: string): string {
  // Entferne Markdown-Formatierungen
  const formatted = content
    // Entferne Sternchen fuer Bold/Italic
    .replace(/\*\*\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    // Entferne Hashtags fuer Ueberschriften
    .replace(/^#+\s*/gm, "")
    // Entferne Markdown-Listen
    .replace(/^[-•]\s*/gm, "")
    .replace(/^\d+\.\s*/gm, "")
    // Entferne Code-Bloecke
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Entferne Links-Syntax
    .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
    // Bereinige mehrfache Leerzeilen
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return formatted
}

export function ChatWidget({
  context,
  title = "MyDispatch AI",
  subtitle = "Wie kann ich helfen?",
  position = "bottom-right",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/ai/chat",
    body: { context },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickAction = (action: string) => {
    if (isLoading) return
    append({ role: "user", content: action })
  }

  // Quick actions based on context
  const quickActions = {
    lead: ["Was kostet MyDispatch?", "Welche Funktionen gibt es?", "Gibt es eine Demo?"],
    dashboard: ["Wie erstelle ich einen Auftrag?", "Wie weise ich einen Fahrer zu?", "Wie erstelle ich eine Rechnung?"],
    driver: ["Wie nehme ich einen Auftrag an?", "Wie starte ich die Navigation?", "Wie melde ich ein Problem?"],
    customer: ["Wie buche ich eine Fahrt?", "Kann ich stornieren?", "Wie bezahle ich?"],
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 bg-primary text-primary-foreground",
          position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6",
        )}
        aria-label={isOpen ? "Chat schliessen" : "Chat oeffnen"}
      >
        {isOpen ? <XIcon /> : <MessageIcon />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
            position === "bottom-right" ? "bottom-24 right-6" : "bottom-24 left-6",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 bg-primary text-primary-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <SparklesIcon />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm opacity-90">{subtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">Hallo! Wie kann ich Ihnen helfen?</p>
                <div className="space-y-2">
                  {quickActions[context].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="w-full rounded-xl border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{formatMessage(message.content)}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input || ""}
                onChange={handleInputChange}
                placeholder="Nachricht eingeben..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors disabled:opacity-50"
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Powered by MyDispatch AI</p>
          </form>
        </div>
      )}
    </>
  )
}
