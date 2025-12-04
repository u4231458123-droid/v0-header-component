"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Mic, X, Play, Pause, Loader2, File, Image as ImageIcon, Volume2, Square } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { toast } from "sonner"
import { differenceInMinutes } from "date-fns"

interface ChatMessage {
  id: string
  sender_type: "driver" | "dispatcher" | "customer"
  sender_id: string
  sender_name?: string
  message: string
  message_type: "text" | "file" | "image" | "audio" | "system" | "status_update" | "location"
  attachment_url?: string
  attachment_type?: "file" | "image" | "audio" | "document"
  attachment_name?: string
  audio_duration?: number
  is_read: boolean
  created_at: string
}

interface ChatWidgetProps {
  conversationId: string
  companyId: string
  participant1Type: "driver" | "dispatcher" | "customer"
  participant1Id: string
  participant2Type: "driver" | "dispatcher" | "customer"
  participant2Id: string
  bookingId?: string | null
  currentUserId: string
  currentUserType: "driver" | "dispatcher" | "customer"
  currentUserName?: string
  // Für Validierung
  driverShiftActive?: boolean // Nur für Fahrer-Dispo Chat
  bookingPickupTime?: string // Für Kunde-Fahrer Chat (30 Min Regel)
  bookingStatus?: string // Für Kunde-Fahrer Chat
}

export function ChatWidget({
  conversationId,
  companyId,
  participant1Type,
  participant1Id,
  participant2Type,
  participant2Id,
  bookingId,
  currentUserId,
  currentUserType,
  currentUserName,
  driverShiftActive = false,
  bookingPickupTime,
  bookingStatus,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [canSend, setCanSend] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Prüfe ob Nachricht erlaubt ist
  useEffect(() => {
    const checkCanSend = async () => {
      // Fahrer-Dispo Chat: Nur wenn Fahrer im Dienst
      if (
        (currentUserType === "driver" || participant1Type === "driver" || participant2Type === "driver") &&
        (participant1Type === "dispatcher" || participant2Type === "dispatcher")
      ) {
        if (currentUserType === "driver" && !driverShiftActive) {
          setCanSend(false)
          return
        }
      }

      // Kunde-Fahrer Chat: Nur 30 Min vor/nach Fahrt
      if (
        (currentUserType === "customer" || participant1Type === "customer" || participant2Type === "customer") &&
        (participant1Type === "driver" || participant2Type === "driver") &&
        bookingId &&
        bookingPickupTime
      ) {
        const now = new Date()
        const pickupTime = new Date(bookingPickupTime)
        const minutesDiff = differenceInMinutes(pickupTime, now)

        // 30 Minuten vor Fahrt
        if (minutesDiff <= 30 && minutesDiff >= 0) {
          setCanSend(true)
          return
        }

        // Während Fahrt
        if (bookingStatus === "in_progress") {
          setCanSend(true)
          return
        }

        // Nach Fahrt (30 Minuten nach Fahrt)
        if (bookingStatus === "completed") {
          const minutesAfter = differenceInMinutes(now, pickupTime)
          if (minutesAfter <= 30) {
            setCanSend(true)
            return
          }
        }

        setCanSend(false)
        return
      }

      // Dispo kann immer schreiben
      if (currentUserType === "dispatcher") {
        setCanSend(true)
        return
      }

      setCanSend(true)
    }

    checkCanSend()
  }, [currentUserType, participant1Type, participant2Type, driverShiftActive, bookingId, bookingPickupTime, bookingStatus])

  // Lade Nachrichten
  useEffect(() => {
    loadMessages()

    // Real-time Subscription
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: { new: ChatMessage }) => {
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => [...prev, newMsg])
          scrollToBottom()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      if (data) setMessages(data)
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Fehler beim Laden der Nachrichten")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Datei ist zu groß (max. 10MB)")
      return
    }

    setSelectedFile(file)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const fileExt = file.name.split(".").pop()
      const fileName = `${conversationId}/${Date.now()}_${file.name}`
      const filePath = `chat-attachments/${fileName}`

      const { error: uploadError } = await supabase.storage.from("company-assets").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("company-assets").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Fehler beim Hochladen der Datei")
      return null
    } finally {
      setUploading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Fehler beim Starten der Aufnahme")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const sendAudioMessage = async () => {
    if (!audioBlob || !canSend) return

    setSending(true)
    try {
      // Upload Audio
      const audioFile: File = new (window.File || File)([audioBlob], `audio-${Date.now()}.webm`, { type: "audio/webm" })
      const audioUrl = await uploadFile(audioFile)

      if (!audioUrl) {
        setSending(false)
        return
      }

      // Get audio duration (approximate)
      const audio = new Audio(audioUrl)
      const duration = await new Promise<number>((resolve) => {
        audio.addEventListener("loadedmetadata", () => {
          resolve(Math.round(audio.duration))
        })
        audio.addEventListener("error", () => resolve(0))
      })

      // Send message
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        company_id: companyId,
        sender_type: currentUserType,
        sender_id: currentUserId,
        sender_name: currentUserName,
        message: "🎤 Sprachnachricht",
        message_type: "audio",
        attachment_url: audioUrl,
        attachment_type: "audio",
        attachment_name: `audio-${Date.now()}.webm`,
        attachment_size: audioBlob.size,
        audio_duration: duration,
        is_read: false,
      })

      if (error) throw error

      setAudioBlob(null)
      setAudioUrl(null)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    } catch (error) {
      console.error("Error sending audio:", error)
      toast.error("Fehler beim Senden der Sprachnachricht")
    } finally {
      setSending(false)
    }
  }

  const sendFileMessage = async () => {
    if (!selectedFile || !canSend) return

    setSending(true)
    try {
      const fileUrl = await uploadFile(selectedFile)

      if (!fileUrl) {
        setSending(false)
        return
      }

      const isImage = selectedFile.type.startsWith("image/")
      const messageType = isImage ? "image" : "file"

      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        company_id: companyId,
        sender_type: currentUserType,
        sender_id: currentUserId,
        sender_name: currentUserName,
        message: selectedFile.name,
        message_type: messageType,
        attachment_url: fileUrl,
        attachment_type: isImage ? "image" : "file",
        attachment_name: selectedFile.name,
        attachment_size: selectedFile.size,
        is_read: false,
      })

      if (error) throw error

      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Error sending file:", error)
      toast.error("Fehler beim Senden der Datei")
    } finally {
      setSending(false)
    }
  }

  const sendTextMessage = async () => {
    if (!newMessage.trim() || !canSend || sending) return

    setSending(true)
    try {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        company_id: companyId,
        sender_type: currentUserType,
        sender_id: currentUserId,
        sender_name: currentUserName,
        message: newMessage.trim(),
        message_type: "text",
        is_read: false,
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Fehler beim Senden der Nachricht")
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      sendFileMessage()
    } else if (audioBlob) {
      sendAudioMessage()
    } else {
      sendTextMessage()
    }
  }

  const getOtherParticipantName = () => {
    if (currentUserType === participant1Type && currentUserId === participant1Id) {
      // Return participant 2 name
      return messages.find((m) => m.sender_type === participant2Type && m.sender_id === participant2Id)?.sender_name || "Unbekannt"
    }
    return messages.find((m) => m.sender_type === participant1Type && m.sender_id === participant1Id)?.sender_name || "Unbekannt"
  }

  const isOwnMessage = (msg: ChatMessage) => {
    return msg.sender_type === currentUserType && msg.sender_id === currentUserId
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Chat</span>
          {!canSend && (
            <Badge variant="secondary" className="text-xs">
              {currentUserType === "driver" && !driverShiftActive
                ? "Nur im Dienst"
                : bookingId
                  ? "Nur 30 Min vor/nach Fahrt"
                  : "Nicht verfügbar"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Noch keine Nachrichten</p>
            <p className="text-xs">Starten Sie die Konversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${isOwnMessage(msg) ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwnMessage(msg)
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.message_type === "text" && <p className="text-sm">{msg.message}</p>}

                  {msg.message_type === "image" && msg.attachment_url && (
                    <div className="space-y-2">
                      <img src={msg.attachment_url} alt={msg.attachment_name || "Bild"} className="max-w-full rounded-lg" />
                      <p className="text-xs opacity-70">{msg.message}</p>
                    </div>
                  )}

                  {msg.message_type === "file" && msg.attachment_url && (
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="underline text-sm">
                        {msg.attachment_name || msg.message}
                      </a>
                    </div>
                  )}

                  {msg.message_type === "audio" && msg.attachment_url && (
                    <AudioPlayer audioUrl={msg.attachment_url} duration={msg.audio_duration || 0} />
                  )}

                  <p className={`text-xs mt-1 ${isOwnMessage(msg) ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(new Date(msg.created_at), "HH:mm", { locale: de })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Audio Preview */}
      {audioUrl && audioBlob && (
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center gap-2">
          <AudioPlayer audioUrl={audioUrl} duration={0} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAudioBlob(null)
              setAudioUrl(null)
              URL.revokeObjectURL(audioUrl)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span className="text-sm">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canSend || uploading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {!recording ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={startRecording}
            disabled={!canSend || uploading}
          >
            <Mic className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        )}

        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={canSend ? "Nachricht schreiben..." : "Nicht verfügbar"}
          className="flex-1"
          disabled={!canSend || sending || uploading}
        />
        <Button type="submit" size="icon" disabled={!canSend || sending || uploading || (!newMessage.trim() && !selectedFile && !audioBlob)}>
          {sending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </Card>
  )
}

// Audio Player Component
function AudioPlayer({ audioUrl, duration }: { audioUrl: string; duration: number }) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      setPlaying(false)
      setCurrentTime(0)
    })

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
      <Button type="button" variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

