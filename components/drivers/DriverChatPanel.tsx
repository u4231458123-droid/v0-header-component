"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Send, MessageCircle, User } from "lucide-react"

interface Message {
  id: string
  driver_id: string
  sender_type: "driver" | "central"
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  status: string
}

interface DriverChatPanelProps {
  companyId: string
  selectedDriverId?: string | null
  onSelectDriver?: (driverId: string) => void
}

export function DriverChatPanel({ companyId, selectedDriverId, onSelectDriver }: DriverChatPanelProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeDriverId, setActiveDriverId] = useState<string | null>(selectedDriverId || null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDrivers()
  }, [companyId])

  useEffect(() => {
    if (activeDriverId) {
      loadMessages(activeDriverId)
      markMessagesAsRead(activeDriverId)
    }
  }, [activeDriverId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Real-time subscription for new messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("driver_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "driver_messages",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          if (newMsg.driver_id === activeDriverId) {
            setMessages((prev) => [...prev, newMsg])
            if (newMsg.sender_type === "driver") {
              markMessagesAsRead(newMsg.driver_id)
            }
          } else {
            // Update unread count for other drivers
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.driver_id]: (prev[newMsg.driver_id] || 0) + 1,
            }))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId, activeDriverId])

  const loadDrivers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("drivers")
        .select("id, first_name, last_name, email, status")
        .eq("company_id", companyId)
        .order("last_name")

      if (data) {
        setDrivers(data)

        // Load unread counts for each driver
        const counts: Record<string, number> = {}
        for (const driver of data) {
          const { count } = await supabase
            .from("driver_messages")
            .select("*", { count: "exact", head: true })
            .eq("driver_id", driver.id)
            .eq("sender_type", "driver")
            .eq("is_read", false)

          counts[driver.id] = count || 0
        }
        setUnreadCounts(counts)
      }
    } catch (error) {
      console.error("Error loading drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (driverId: string) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("driver_messages")
        .select("*")
        .eq("driver_id", driverId)
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const markMessagesAsRead = async (driverId: string) => {
    try {
      const supabase = createClient()
      await supabase
        .from("driver_messages")
        .update({ is_read: true })
        .eq("driver_id", driverId)
        .eq("sender_type", "driver")
        .eq("is_read", false)

      setUnreadCounts((prev) => ({ ...prev, [driverId]: 0 }))
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeDriverId) return

    setSending(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("driver_messages").insert({
        company_id: companyId,
        driver_id: activeDriverId,
        sender_type: "central",
        sender_id: user.id,
        message: newMessage.trim(),
        is_read: false,
      })

      if (error) throw error

      setNewMessage("")
      loadMessages(activeDriverId)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleSelectDriver = (driverId: string) => {
    setActiveDriverId(driverId)
    onSelectDriver?.(driverId)
  }

  const activeDriver = drivers.find((d) => d.id === activeDriverId)
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Lade Chat...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Fahrer-Kommunikation
          {totalUnread > 0 && (
            <Badge variant="destructive" className="ml-2">
              {totalUnread} neu
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <div className="flex flex-1 overflow-hidden">
        {/* Driver List */}
        <div className="w-64 border-r bg-slate-50 overflow-y-auto">
          {drivers.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Keine Fahrer vorhanden</div>
          ) : (
            drivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => handleSelectDriver(driver.id)}
                className={`w-full p-3 text-left border-b border-slate-100 hover:bg-slate-100 transition-colors ${
                  activeDriverId === driver.id ? "bg-slate-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {driver.first_name?.[0]}
                      {driver.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{driver.email}</p>
                  </div>
                  {unreadCounts[driver.id] > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCounts[driver.id]}
                    </Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeDriverId && activeDriver ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b bg-white">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {activeDriver.first_name?.[0]}
                      {activeDriver.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {activeDriver.first_name} {activeDriver.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeDriver.status === "available" ? "Verfügbar" : activeDriver.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">Noch keine Nachrichten</p>
                    <p className="text-xs">Starten Sie die Konversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === "central" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            msg.sender_type === "central"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-slate-100 text-slate-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_type === "central" ? "text-primary-foreground/70" : "text-slate-500"
                            }`}
                          >
                            {format(new Date(msg.created_at), "HH:mm", { locale: de })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht schreiben..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <User className="h-16 w-16 mb-3 opacity-20" />
              <p className="text-sm">Wählen Sie einen Fahrer aus</p>
              <p className="text-xs">um die Konversation zu starten</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
